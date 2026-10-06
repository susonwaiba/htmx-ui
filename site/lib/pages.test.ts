// The website's pages, rendered the way the engine renders them for the dev
// server and the build (site/lib/engine.ts: the site config with its plugins).
import { describe, expect, test } from "bun:test";
import { pagesOf, renderPage } from "htmx-ui-engine";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { engine } from "./engine";
import { PAGES, SITE } from "./paths";

// Rendered once per page: four tests below walk every page of the site.
const rendered = new Map<string, string>();
const render = (path: string) => {
  if (!rendered.has(path)) rendered.set(path, renderPage(engine, resolve(PAGES, path)));
  return rendered.get(path)!;
};
// Rendering the whole site (with Shiki) outgrows bun's 5s default as pages are added.
const SITE_WIDE = 30_000;
const files = pagesOf(engine).map((p) => p.path);

describe("pages", () => {
  test("renders every page into a full document with no template syntax left", async () => {
    for (const file of files) {
      const html = render(file);
      expect(html.startsWith("<!doctype html>")).toBe(true);
      expect(html).not.toMatch(/\{[%{#]/);
    }
  }, SITE_WIDE);

  test("no page nests a link inside a link (browsers break such markup apart)", async () => {
    for (const file of files) {
      let depth = 0;
      let nested = 0;
      new HTMLRewriter()
        .on("a", {
          element(el) {
            if (depth > 0) nested++;
            depth++;
            el.onEndTag(() => void depth--);
          },
        })
        .transform(render(file));
      expect(nested, file).toBe(0);
    }
  }, SITE_WIDE);

  test("no page repeats an id (a demo's commandfor or aria-labelledby would hit the wrong element)", () => {
    for (const file of files) {
      const seen = new Set<string>();
      const repeated: string[] = [];
      new HTMLRewriter()
        .on("[id]", {
          element(el) {
            const id = el.getAttribute("id")!;
            if (seen.has(id)) repeated.push(id);
            seen.add(id);
          },
        })
        .transform(render(file));
      expect(repeated, file).toEqual([]);
    }
  }, SITE_WIDE);

  test("every internal link points at a page that exists, and at a section id that exists on it", () => {
    const pages = pagesOf(engine);
    const ids = new Map<string, Set<string>>();
    const links: { from: string; href: string }[] = [];
    for (const page of pages) {
      const found = new Set<string>();
      // Live component demos link to "#" placeholders; only the docs' own links count.
      let inDemo = 0;
      new HTMLRewriter()
        .on("[data-md-skip]", {
          element(el) {
            inDemo++;
            el.onEndTag(() => void inDemo--);
          },
        })
        .on("[id]", { element: (el) => void found.add(el.getAttribute("id")!) })
        .on("a[href]", { element: (el) => void (inDemo || links.push({ from: page.url, href: el.getAttribute("href")! })) })
        .transform(render(page.path));
      ids.set(page.url, found);
    }
    const broken: string[] = [];
    for (const { from, href } of links) {
      if (!href.startsWith("/") && !href.startsWith("#")) continue;
      const [path = "", hash] = href.split("#");
      const url = path === "" ? from : path.length > 1 ? path.replace(/\/$/, "") : path;
      // Only pages: archived docs (/docs/v0.1/...), assets and generated files are checked by the build.
      if (!url.startsWith("/docs") || /^\/docs\/v\d/.test(url) || /\.\w+$/.test(url)) continue;
      const target = ids.get(url);
      if (!target) broken.push(`${from}: ${href} (no such page)`);
      else if (hash && !target.has(hash)) broken.push(`${from}: ${href} (no #${hash} on ${url})`);
    }
    expect(broken).toEqual([]);
  }, SITE_WIDE);

  test("the home page uses the site layout with header, theme toggle and pre-paint script", () => {
    const home = render("index.html");
    expect(home).toContain("<title>HTMX UI · Server-driven components for htmx</title>");
    expect(home).toContain('src="../app.ts"');
    expect(home).toContain("data-theme-toggle");
    expect(home).toContain('classList.toggle("dark"');
    expect(home).toContain("data-year");
    expect(home).not.toContain("data-sidebar");
  });

  test("docs pages get the sidebar, the active link, a section label and prev/next", () => {
    const page = render("docs/components/button.html");
    expect(page).toContain("<title>Button · HTMX UI</title>");
    expect(page).toContain('src="../../../app.ts"');
    expect(page).toMatch(/href="\/docs\/components\/button" class="sidebar-menu-button" aria-current="page"/);
    expect(page).toContain('<p class="eyebrow">Components</p>');
    // Components run in their groups (site/data/component-categories.json): Button opens
    // "Actions & menus", right after the last of "Forms & inputs".
    expect(page).toContain(">Actions &amp; menus</p>");
    expect(page).toMatch(/Previous[\s\S]*?Textarea/);
    expect(page).toMatch(/Next[\s\S]*?Button group/);
  });

  test("changelog version pages keep Changelog active in the sidebar", () => {
    // Every release page must find its own entry by version, not by index, so adding
    // a release cannot hand an older page the newer page's description.
    const page = render("docs/changelog/0.1.0.html");
    expect(page).toMatch(/href="\/docs\/changelog" class="sidebar-menu-button" aria-current="page"/);
    expect(page).toContain("<title>v0.1.0 · HTMX UI</title>");

    const next = render("docs/changelog/0.2.0.html");
    expect(next).toMatch(/href="\/docs\/changelog" class="sidebar-menu-button" aria-current="page"/);
    expect(next).toContain("<title>v0.2.0 · HTMX UI</title>");
    expect(next).toContain("Named template roots");
  });

  test("every release page resolves its own release, not the newest one", () => {
    // The lookup is a loop, so a version typo would silently fall back to {} and
    // then to whatever the page defaults to. Pin each page to its own summary.
    const releases = JSON.parse(readFileSync(resolve(SITE, "data/changelog.json"), "utf8")).releases as {
      version: string;
      summary: string;
    }[];
    // The summary lands in a meta description, so Nunjucks escapes it.
    const esc = (v: string) =>
      v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    for (const r of releases) {
      const page = render(`docs/changelog/${r.version}.html`);
      expect(page).toContain(`<title>v${r.version} · HTMX UI</title>`);
      // Its own summary, and none of the others'.
      expect(page).toContain(esc(r.summary.slice(0, 60)));
      for (const other of releases.filter((o) => o.version !== r.version)) {
        expect(page).not.toContain(esc(other.summary.slice(0, 60)));
      }
    }
  });

  test("an undated release reads as in development, a dated one as latest", () => {
    // Every release carries a date except the one being worked on; between two
    // releases there is none, and then the newest reads as Latest instead.
    const releases = JSON.parse(readFileSync(resolve(SITE, "data/changelog.json"), "utf8")).releases as {
      version: string;
      date?: string;
    }[];
    const index = render("docs/changelog/index.html");
    const pending = releases.find((r) => !r.date);
    if (pending) {
      const page = render(`docs/changelog/${pending.version}.html`);
      expect(page).toContain("In development");
      expect(page).not.toMatch(/<time datetime="\d{4}-\d{2}-\d{2}"[^>]*>Unreleased/);
      expect(index).toContain("In development");
      expect(index).toContain("Unreleased");
      return;
    }
    const latest = releases[0]!;
    const page = render(`docs/changelog/${latest.version}.html`);
    expect(page).toContain("Latest");
    expect(page).toContain(`<time datetime="${latest.date}"`);
    expect(index).toContain("Latest");
    expect(index).not.toContain("Unreleased");
  });

  test("only the closest nav entry is active, so a section can have pages of its own", () => {
    const index = render("docs/servers.html");
    expect(index).toMatch(/href="\/docs\/servers" class="sidebar-menu-button" aria-current="page"/);
    expect(index).toContain('<p class="eyebrow">Servers</p>');

    const page = render("docs/servers/elysia.html");
    expect(page).toMatch(/href="\/docs\/servers\/elysia" class="sidebar-menu-button" aria-current="page"/);
    expect(page).not.toMatch(/href="\/docs\/servers" class="sidebar-menu-button" aria-current="page"/);
    expect(page).toContain('<p class="eyebrow">Servers</p>');

    // The section's pages are in prev/next order: the overview and the framework-free pages,
    // then the adapters (Elysia first), then the recipes, then the next section.
    expect(index).toMatch(/Next[\s\S]*?Pages &amp; fragments/);
    expect(page).toMatch(/Previous[\s\S]*?createSite\(\) API/);
    expect(page).toMatch(/Next[\s\S]*?Fastify/);
    expect(render("docs/servers/hono.html")).toMatch(/Next[\s\S]*?Bun\.serve/);
    expect(render("docs/servers/any-backend.html")).toMatch(/Next[\s\S]*?Overview/);
  });

  test("code blocks highlight, escape markup and encode braces", () => {
    const page = render("docs/components/code-block.html");
    expect(page).toContain("color:var(--code-token-");
    expect(page.replace(/<[^>]+>/g, "")).toContain("&#123;% from"); // Nunjucks sample shown, not executed
    expect(page).not.toMatch(/\{[%{#]/);
  });

  test("cli() renders one synced tab per package manager", () => {
    const page = render("docs/installation.html");
    for (const cmd of ["npm install htmx-ui", "pnpm add htmx-ui", "yarn add htmx-ui", "bun add htmx-ui"]) {
      expect(page.replace(/<[^>]+>/g, "")).toContain(cmd);
    }
    expect(page).toContain('data-tabs-sync="pm"');
  });
});

describe("icon macro", () => {
  test("inlines by default, labels when asked, and links in img mode", () => {
    const html = render("docs/components/icon.html");
    expect(html).toMatch(/<svg[^>]*class="size-6"[^>]*aria-hidden="true"/);
    expect(html).toContain('<img src="../../../../packages/ui/src/icons/palette.svg"');
  });
});
