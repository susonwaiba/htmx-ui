import { describe, expect, test } from "bun:test";
import { createSite, renderPage, resolveConfig, type Plugin, type UserConfig } from "htmx-ui-engine";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import docs, { navState } from "./index";

/** htmx-ui's src/: the macros import its icon and code components. */
const UI = resolve(dirname(Bun.resolveSync("htmx-ui/package.json", import.meta.dir)), "src");

async function fixture(files: Record<string, string>): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "htmx-ui-plugin-docs-"));
  for (const [name, body] of Object.entries(files)) {
    await mkdir(join(dir, name, ".."), { recursive: true });
    await writeFile(join(dir, name), body);
  }
  return dir;
}

const NAV = {
  sections: [
    { title: "Start", items: [{ title: "Introduction", href: "/docs" }, { title: "Guide", href: "/docs/guide" }] },
    { title: "Reference", items: [{ title: "API", href: "/docs/api" }] },
  ],
};

const LAYOUT = `{% from "docs/macros.html" import markdown_actions %}{% set nav = docsNav(url) %}<!doctype html>
<html><head><title>{{ title }}</title><meta name="description" content="{{ description }}"></head><body>
<nav>{% for item in nav.pages %}<a href="{{ item.href }}"{% if item.href == nav.active %} aria-current="page"{% endif %}>{{ item.title }}</a>{% endfor %}</nav>
<article><p class="eyebrow">{{ nav.section }}</p><h1>{{ title }}</h1>{{ markdown_actions(url) }}
<div data-docs-content>{% block content %}{% endblock %}</div>
{% if nav.prev %}<a rel="prev" href="{{ nav.prev.href }}">{{ nav.prev.title }}</a>{% endif %}{% if nav.next %}<a rel="next" href="{{ nav.next.href }}">{{ nav.next.title }}</a>{% endif %}
</article></body></html>`;

const page = (title: string, body: string) =>
  `{% extends "layouts/docs.html" %}{% set title = "${title}" %}{% set description = "About ${title}." %}{% block content %}${body}{% endblock %}`;

const PROJECT = {
  "data/docs-nav.json": JSON.stringify(NAV),
  "layouts/docs.html": LAYOUT,
  "pages/index.html": "<!doctype html><html><head><title>Home</title></head><body><h1>Home</h1></body></html>",
  "pages/404.html": "<!doctype html><html><head><title>Missing</title></head><body><h1>Not found</h1></body></html>",
  "pages/docs/index.html": page("Introduction", "<p>Hello.</p>"),
  "pages/docs/guide.html": page("Guide", "<h2>Set up</h2><p>Run <code>x</code>.</p><h2>Set up</h2><p>Again.</p>"),
  "pages/docs/api.html": page("API", '<h2 id="fn">Functions</h2><p>See <a href="/docs/guide#set-up">setup</a>.</p>'),
  "pages/docs/api/extra.html": page("Extra", "<p>Not in the nav.</p>"),
};

async function project(plugin: Plugin[], extra: Record<string, string> = {}, config: UserConfig = {}) {
  const root = await fixture({ ...PROJECT, ...extra });
  const c = resolveConfig({ ui: false, roots: [".", UI], url: "https://docs.test", publicDir: "public", ...config, plugins: plugin }, root);
  const site = await createSite({ config: c });
  const get = async (path: string) => {
    const res = await site.handle(new Request(`http://x${path}`));
    return { status: res.status, type: res.headers.get("content-type"), body: await res.text() };
  };
  return { root, c, site, get };
}

describe("htmx-ui-plugin-docs", () => {
  test("docs pages get heading anchors, docsNav() and markdown_actions()", async () => {
    const { root, c } = await project([docs()]);
    const guide = renderPage(c, join(root, "pages/docs/guide.html"));
    expect(guide).toContain('<h2 id="set-up">Set up<a class="heading-anchor" href="#set-up"');
    expect(guide).toContain('<h2 id="set-up-2">Set up');
    expect(guide).toContain('<a href="/docs/guide" aria-current="page">Guide</a>');
    expect(guide).toContain('<p class="eyebrow">Start</p>');
    expect(guide).toContain('<a rel="prev" href="/docs">Introduction</a>');
    expect(guide).toContain('<a rel="next" href="/docs/api">API</a>');
    expect(guide).toContain('data-clipboard-url="/docs/guide.md"');

    // A page outside the nav: its closest entry is active, and it has no prev/next
    const extra = renderPage(c, join(root, "pages/docs/api/extra.html"));
    expect(extra).toContain('<a href="/docs/api" aria-current="page">API</a>');
    expect(extra).toContain('<p class="eyebrow">Reference</p>');
    expect(extra).not.toContain('rel="prev"');

    const plain = await project([docs({ anchors: false })]);
    expect(renderPage(plain.c, join(plain.root, "pages/docs/guide.html"))).not.toContain("heading-anchor");
  });

  test("serves Markdown, llms.txt, sitemaps and robots.txt", async () => {
    const { get } = await project([docs({ name: "Acme", description: "Acme docs." })]);

    const md = await get("/docs/guide.md");
    expect(md.type).toBe("text/markdown; charset=utf-8");
    expect(md.body).toBe(
      '---\ntitle: "Guide"\ndescription: "About Guide."\nurl: "/docs/guide"\nsection: "Start"\n---\n\n# Guide\n\nAbout Guide.\n\n## Set up\n\nRun `x`.\n\n## Set up\n\nAgain.\n',
    );
    expect((await get("/docs.md")).body).toContain('url: "/docs"');
    expect((await get("/index.md")).status).toBe(404); // only docs pages have Markdown

    const llms = (await get("/llms.txt")).body;
    expect(llms).toStartWith("# Acme\n\n> Acme docs.\n\n");
    expect(llms).toContain("## Start\n\n- [Introduction](https://docs.test/docs.md): About Introduction.\n- [Guide](https://docs.test/docs/guide.md)");
    // Nav order, and a page missing from the nav sorts with its parent
    expect(llms.indexOf("[API]")).toBeLessThan(llms.indexOf("[Extra]"));
    expect(llms).not.toContain("versions");
    expect((await get("/llms-full.txt")).body).toContain("# Extra");

    const root = JSON.parse((await get("/sitemap.json")).body);
    expect(root).toMatchObject({ name: "Acme", url: "https://docs.test", version: null });
    expect(root.versions).toBeUndefined();
    expect(root.pages.map((p: { url: string }) => p.url)).toEqual(["/docs", "/docs/guide", "/docs/api", "/docs/api/extra", "/"]);
    const api = root.pages.find((p: { url: string }) => p.url === "/docs/api");
    expect(api).toMatchObject({ markdown: "/docs/api.md", section: "Reference", headings: [{ level: 2, id: "fn", text: "Functions" }] });
    expect(api.sections).toEqual([{ id: "fn", title: "Functions", text: "See setup." }]);
    expect(JSON.parse((await get("/docs/sitemap.json")).body).pages).toHaveLength(4);

    const xml = (await get("/sitemap.xml")).body;
    expect(xml).toContain("<loc>https://docs.test/docs/api/extra</loc>");
    expect(xml).not.toContain("/404"); // the 404 page is nobody's destination
    expect((await get("/robots.txt")).body).toBe("User-agent: *\nAllow: /\n\nSitemap: https://docs.test/sitemap.xml\n");
  });

  test("a project's own public/robots.txt wins, in dev and in the build", async () => {
    const { c, get } = await project([docs()], { "public/robots.txt": "User-agent: *\nDisallow: /\n" });
    expect((await get("/robots.txt")).body).toBe("User-agent: *\nDisallow: /\n");
    // The build copies public/ first; the plugin must not overwrite it.
    await mkdir(c.outDir, { recursive: true });
    await writeFile(join(c.outDir, "robots.txt"), "User-agent: *\nDisallow: /\n");
    await c.user.build!.done!({ config: c, outDir: c.outDir, pages: [] });
    expect(await readFile(join(c.outDir, "robots.txt"), "utf8")).toBe("User-agent: *\nDisallow: /\n");
  });

  test("the build writes every file into outDir", async () => {
    const { c } = await project([docs()]);
    await c.user.build!.done!({ config: c, outDir: c.outDir, pages: [] });
    for (const file of ["sitemap.xml", "sitemap.json", "docs/sitemap.json", "llms.txt", "llms-full.txt", "robots.txt", "docs.md", "docs/guide.md", "docs/api/extra.md"]) {
      expect(await Bun.file(join(c.outDir, file)).exists(), file).toBe(true);
    }
  });

  test("another prefix moves the docs", async () => {
    const files = Object.fromEntries(Object.entries(PROJECT).map(([k, v]) => [k.replace("pages/docs", "pages/guide"), v.replace(/(["'])\/docs/g, "$1/guide")]));
    const root = await fixture(files);
    const c = resolveConfig({ ui: false, roots: [".", UI], plugins: [docs({ prefix: "/guide/" })] }, root);
    const site = await createSite({ config: c });
    expect(await (await site.handle(new Request("http://x/guide/guide.md"))).text()).toContain("# Guide");
    expect((await site.handle(new Request("http://x/guide/sitemap.json"))).status).toBe(200);
  });

  test("describes every docs version when htmx-ui-plugin-versions is used", async () => {
    const versions: Plugin = {
      name: "versions",
      api: {
        manifestUrl: "/docs/versions.json",
        async manifest() {
          return {
            latest: "0.2",
            versions: [
              { id: "0.2", label: "v0.2", path: "/docs", latest: true, sitemap: "/docs/sitemap.json", pages: [""] },
              { id: "0.1", label: "v0.1", path: "/docs/v0.1", latest: false, sitemap: "/docs/v0.1/sitemap.json", pages: [""] },
            ],
          };
        },
      },
    };
    const { get } = await project([docs(), versions]);
    const root = JSON.parse((await get("/sitemap.json")).body);
    expect(root.version).toBe("0.2");
    expect(root.versions).toEqual([
      { id: "0.2", label: "v0.2", path: "/docs", latest: true, sitemap: "/docs/sitemap.json" },
      { id: "0.1", label: "v0.1", path: "/docs/v0.1", latest: false, sitemap: "/docs/v0.1/sitemap.json" },
    ]);
    const docsMap = JSON.parse((await get("/docs/sitemap.json")).body);
    expect(docsMap.version).toBe("0.2");
    expect(docsMap.versions).toBeUndefined();
    expect((await get("/llms.txt")).body).toContain("Older docs versions: https://docs.test/docs/versions.json");
  });
});

describe("navState", () => {
  test("marks the longest matching entry active and finds prev/next", () => {
    expect(navState(NAV, "/docs")).toMatchObject({ active: "/docs", section: "Start", prev: null, next: { href: "/docs/guide" } });
    expect(navState(NAV, "/docs/api")).toMatchObject({ active: "/docs/api", section: "Reference", prev: { href: "/docs/guide" }, next: null });
    expect(navState(NAV, "/elsewhere")).toMatchObject({ active: "", section: "Docs", current: null, prev: null, next: null });
  });
});
