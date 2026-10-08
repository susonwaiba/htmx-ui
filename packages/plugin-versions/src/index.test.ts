import { describe, expect, test } from "bun:test";
import { createSite, renderPage, resolveConfig, type CommandContext } from "htmx-ui-engine";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import versions from "./index";

/** htmx-ui's src/: the switcher is its Dropdown, with its icons. */
const UI = resolve(dirname(Bun.resolveSync("htmx-ui/package.json", import.meta.dir)), "src");

async function fixture(files: Record<string, string>): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "htmx-ui-plugin-versions-"));
  for (const [name, body] of Object.entries(files)) {
    await mkdir(join(dir, name, ".."), { recursive: true });
    await writeFile(join(dir, name), body);
  }
  return dir;
}

const VERSIONS = { latest: "next", versions: [{ id: "next", label: "next" }, { id: "0.1", label: "v0.1", released: "2026-01-01", archived: true }] };
const PAGE = `{% from "versions/macros.html" import version_switcher, version_banner %}<!doctype html><html><head></head><body>
{{ version_switcher(class="w-full", links=[{ title: "Changelog", href: "/docs/changelog" }]) }}<article>{{ version_banner() }}<h1>{{ url }}</h1></article></body></html>`;

async function project() {
  const root = await fixture({
    "data/versions.json": JSON.stringify(VERSIONS),
    "pages/index.html": "<p>home</p>",
    "pages/docs/index.html": PAGE,
    "pages/docs/setup.html": PAGE,
    "archive/v0.1/index.html": "<p>old home</p>",
    "archive/v0.1/setup.html": "<p>old setup</p>",
    "archive/v0.1/_assets/app.css": "body{}",
    "archive/v0.1/pages.json": '["", "/setup"]',
    "archive/v0.1.md": "# old",
  });
  const c = resolveConfig({ ui: false, roots: [".", UI], plugins: [versions()] }, root);
  const site = await createSite({ config: c });
  const get = async (path: string) => {
    const res = await site.handle(new Request(`http://x${path}`));
    return { status: res.status, type: res.headers.get("content-type"), body: await res.text() };
  };
  return { root, c, get };
}

/** Run one of the plugin's commands the way the CLI does. */
function command(c: ReturnType<typeof resolveConfig>, name: string, ctx: Partial<CommandContext> = {}) {
  const plugin = c.plugins.find((p) => p.name === "versions")!;
  return plugin.commands![name]!.run({ config: c, args: [], options: {}, build: async () => true, ...ctx });
}

describe("htmx-ui-plugin-versions", () => {
  test("renders the switcher and the banner slot from the versions file", async () => {
    const { root, c } = await project();
    const html = renderPage(c, join(root, "pages/docs/setup.html"));
    expect(html).toContain('data-version-switcher data-version="next" data-versions-src="/docs/versions.json"');
    expect(html).toMatch(/<span class="font-mono">next<\/span><svg/); // the button shows this page's version
    expect(html).toMatch(/href="\/docs" aria-current="true">\s*<span class="font-mono">next<\/span>\s*<span class="badge badge-primary">In development<\/span>/);
    expect(html).toMatch(/href="\/docs\/v0.1">\s*<span class="font-mono">v0.1<\/span>\s*<\/a>/);
    expect(html).toContain('href="/docs/changelog">Changelog <svg');
    expect(html).toMatch(/<div data-version-banner data-md-skip hidden><svg[^>]*aria-hidden="true"[^>]*>.*?<\/svg><\/div>/); // the slot carries the alert's warning icon
  });

  test("serves the manifest and the archived versions", async () => {
    const { get } = await project();
    expect(JSON.parse((await get("/docs/versions.json")).body)).toEqual({
      latest: "next",
      versions: [
        { id: "next", label: "next", released: null, path: "/docs", latest: true, sitemap: "/docs/sitemap.json", pages: ["", "/setup"] },
        { id: "0.1", label: "v0.1", released: "2026-01-01", path: "/docs/v0.1", latest: false, sitemap: "/docs/v0.1/sitemap.json", pages: ["", "/setup"] },
      ],
    });
    expect(await get("/docs/v0.1")).toMatchObject({ status: 200, body: "<p>old home</p>", type: "text/html; charset=utf-8" });
    expect((await get("/docs/v0.1/setup")).body).toBe("<p>old setup</p>");
    expect((await get("/docs/v0.1/_assets/app.css")).type).toBe("text/css; charset=utf-8");
    expect((await get("/docs/v0.1.md")).body).toBe("# old");
    expect((await get("/docs/v0.1/missing")).status).toBe(404);
  });

  test("the build copies the archive in and writes the manifest", async () => {
    const { c } = await project();
    await c.user.build!.done!({ config: c, outDir: c.outDir, pages: [] });
    expect(await readFile(join(c.outDir, "docs/v0.1/setup.html"), "utf8")).toBe("<p>old setup</p>");
    expect(await readFile(join(c.outDir, "docs/v0.1.md"), "utf8")).toBe("# old");
    expect(JSON.parse(await readFile(join(c.outDir, "docs/versions.json"), "utf8")).latest).toBe("next");
  });

  test("versions:name names the version in development, versions:archive freezes it", async () => {
    const { root, c, get } = await project();
    const file = join(root, "data/versions.json");

    // Archiving needs a number first, and refuses before building anything
    let built = false;
    await expect(command(c, "versions:archive", { build: async () => (built = true) })).rejects.toThrow(/no release number/);
    expect(built).toBe(false);

    await command(c, "versions:name", { args: ["0.2.0"] });
    expect(JSON.parse(await readFile(file, "utf8"))).toMatchObject({ latest: "0.2", versions: [{ id: "0.2", label: "v0.2" }, { id: "0.1" }] });

    // A stand-in build: what htmx-ui build writes for the docs
    const build = async () => {
      await mkdir(join(c.outDir, "docs"), { recursive: true });
      await writeFile(join(c.outDir, "docs/index.html"), '<html><head></head><body><div data-version-banner data-md-skip hidden></div><a href="/docs/setup">s</a></body></html>');
      await writeFile(join(c.outDir, "docs/setup.html"), "<html><head></head><body>setup</body></html>");
      return true;
    };
    await command(c, "versions:archive", { build });
    const data = JSON.parse(await readFile(file, "utf8"));
    expect(data.latest).toBe("next");
    expect(data.versions.map((v: { id: string; archived?: boolean }) => `${v.id}${v.archived ? "*" : ""}`)).toEqual(["next", "0.2*", "0.1*"]);

    const frozen = await readFile(join(root, "archive/v0.2/index.html"), "utf8");
    expect(frozen).toContain('href="/docs/v0.2/setup"');
    expect(frozen).toContain("You're viewing the docs for v0.2.");
    expect(frozen).toContain('<meta name="robots" content="noindex" /></head>');
    expect((await get("/docs/v0.2/setup")).body).toContain("setup");
    expect(JSON.parse((await get("/docs/versions.json")).body).versions[1]).toMatchObject({ id: "0.2", path: "/docs/v0.2", pages: ["", "/setup"] });
  });

  test("a failed build archives nothing", async () => {
    const { root, c } = await project();
    await command(c, "versions:name", { args: ["0.2.0"] });
    expect(await command(c, "versions:archive", { build: async () => false })).toBe(1);
    expect(JSON.parse(await readFile(join(root, "data/versions.json"), "utf8")).latest).toBe("0.2");
  });
});
