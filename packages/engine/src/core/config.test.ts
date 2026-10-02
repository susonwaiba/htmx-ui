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
    expect(c.templateRoots).toEqual([dir]);
    expect(c.outDir).toBe(join(dir, "dist"));
    expect(c.publicDir).toBe(join(dir, "public"));
    expect(c.port).toBe(Number(process.env.PORT ?? 3000));
    expect(resolveConfig({ ui: false, publicDir: "static" }, dir).publicDir).toBeNull(); // missing
  });

  test("adds htmx-ui's src/ as the last template root when it is installed", () => {
    // The site depends on htmx-ui (workspace link), so it resolves from there
    const site = resolve(import.meta.dir, "../../../../site");
    const c = resolveConfig({ templates: [".", "extra"] }, site);
    expect(c.uiDir).toMatch(/packages[/\\]ui[/\\]src$/);
    expect(c.templateRoots).toEqual([site, join(site, "extra"), c.uiDir!]);
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
