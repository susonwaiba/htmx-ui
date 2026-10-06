import { describe, expect, test } from "bun:test";
import { renderPage, resolveConfig } from "htmx-ui-engine";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import search from "./index";

const UI = resolve(dirname(Bun.resolveSync("htmx-ui/package.json", import.meta.dir)), "src");

describe("htmx-ui-plugin-search", () => {
  test("search() renders the button and the palette, reading the index it is given", async () => {
    const root = await mkdtemp(join(tmpdir(), "htmx-ui-plugin-search-"));
    await mkdir(join(root, "pages"), { recursive: true });
    await writeFile(join(root, "pages/index.html"), '{% from "search/macros.html" import search %}{{ search() }}|{{ search(src="/blog/index.json") }}');
    const c = resolveConfig({ ui: false, roots: [".", UI], plugins: [search()] }, root);
    const [own, blog] = renderPage(c, join(root, "pages/index.html")).split("|");
    expect(own).toContain('<dialog class="search-dialog" data-search-dialog data-search-src="/sitemap.json"');
    expect(own).toContain("data-search-open");
    expect(own).toContain("data-search-input");
    expect(blog).toContain('data-search-src="/blog/index.json"');
  });
});
