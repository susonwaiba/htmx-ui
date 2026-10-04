import { describe, expect, test } from "bun:test";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { loadConfig, renderPage, resolveConfig } from "./config";

async function fixture(files: Record<string, string>): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "htmx-ui-config-"));
  for (const [name, body] of Object.entries(files)) {
    await mkdir(join(dir, name, ".."), { recursive: true });
    await writeFile(join(dir, name), body);
  }
  return dir;
}

describe("config", () => {
  test("defaults: pages/, the project as template root, dist/, public/ when it exists, port 3000", async () => {
    const dir = await fixture({ "public/robots.txt": "" });
    const c = resolveConfig({ ui: false }, dir);
    expect(c.pagesDir).toBe(join(dir, "pages"));
    expect(c.roots).toEqual([{ dir }]);
    expect(c.outDir).toBe(join(dir, "dist"));
    expect(c.publicDir).toBe(join(dir, "public"));
    expect(c.port).toBe(Number(process.env.PORT ?? 3000));
    expect(resolveConfig({ ui: false, publicDir: "static" }, dir).publicDir).toBeNull(); // missing
  });

  test("adds htmx-ui's src/ as the last template root when it is installed", () => {
    // The site depends on htmx-ui (workspace link), so it resolves from there
    const site = resolve(import.meta.dir, "../../../../site");
    const c = resolveConfig({ roots: [".", "extra"] }, site);
    expect(c.uiDir).toMatch(/packages[/\\]ui[/\\]src$/);
    expect(c.roots.map((r) => r.dir)).toEqual([site, join(site, "extra"), c.uiDir!]);
    expect(resolveConfig({ ui: false }, site).uiDir).toBeNull();
  });

  test("loads htmx-ui.config.ts and renders pages with its globals, filters and transform", async () => {
    const dir = await fixture({
      "htmx-ui.config.ts": `export default {
        ui: false,
        url: "https://example.com/",
        globals: { year: 2026 },
        filters: { shout: (s: string) => s.toUpperCase() },
        transform: (html: string, page: { url: string }) => html + "<!-- " + page.url + " -->",
      };`,
      "layout.html": "{{ origin }} {{ year }} {{ 'hi' | shout }} {% block content %}{% endblock %}",
      "pages/docs/x.html": '{% extends "layout.html" %}{% block content %}{{ url }}{% endblock %}',
    });
    const saved = process.env.SITE_URL;
    delete process.env.SITE_URL;
    try {
      const c = await loadConfig(dir);
      expect(c.file).toBe(join(dir, "htmx-ui.config.ts"));
      expect(c.origin).toBe("https://example.com");
      expect(renderPage(c, join(dir, "pages/docs/x.html"))).toBe("https://example.com 2026 HI /docs/x<!-- /docs/x -->");
    } finally {
      if (saved !== undefined) process.env.SITE_URL = saved;
    }
  });

  test("a project without a config file gets the defaults", async () => {
    const dir = await fixture({});
    const c = await loadConfig(dir);
    expect(c.file).toBeNull();
    expect(c.user).toEqual({});
  });
});

describe("roots", () => {
  test("the first entry is the project root: pages, outDir, publicDir and asset URLs follow it", async () => {
    const dir = await fixture({ "web/public/robots.txt": "" });
    const c = resolveConfig({ ui: false, roots: ["web", "shared"] }, dir);
    expect(c.root).toBe(join(dir, "web"));
    expect(c.pagesDir).toBe(join(dir, "web/pages"));
    expect(c.outDir).toBe(join(dir, "web/dist"));
    expect(c.publicDir).toBe(join(dir, "web/public"));
    expect(c.roots.map((r) => r.dir)).toEqual([join(dir, "web"), join(dir, "shared")]);
  });

  test("a named root keeps its name and its directory is still absolute", async () => {
    const dir = await fixture({});
    const c = resolveConfig({ ui: false, roots: [{ name: "layouts", dir: "new-layouts-2026" }, "web"] }, dir);
    expect(c.roots[0]).toEqual({ name: "layouts", dir: join(dir, "new-layouts-2026") });
    expect(c.root).toBe(join(dir, "new-layouts-2026")); // first entry, named or not
  });

  test("the first entry is primary even when it is named", async () => {
    // roots has one meaning: the first entry is the project root, whatever it is called.
    const dir = await fixture({});
    const c = resolveConfig({ ui: false, roots: ["dist/_templates", "."], pages: "src" }, dir);
    expect(c.root).toBe(join(dir, "dist/_templates"));
    expect(c.pagesDir).toBe(join(dir, "dist/_templates/src"));
  });

  test("refuses an empty roots list rather than resolving every default against nothing", async () => {
    const dir = await fixture({});
    expect(() => resolveConfig({ ui: false, roots: [] }, dir)).toThrow(/roots is empty/);
  });

  test("renders a page through a named root end to end", async () => {
    const dir = await fixture({
      "new-layouts/base.html": "<body>{% block content %}{% endblock %}</body>",
      "pages/index.html": '{% extends "layouts/base.html" %}{% block content %}<p>ok</p>{% endblock %}',
    });
    const c = resolveConfig({ ui: false, roots: [{ name: "layouts", dir: "new-layouts" }, "."] }, dir);
    expect(renderPage(c, join(dir, "pages/index.html"))).toBe("<body><p>ok</p></body>");
  });
});
