// The website's own docs outputs (htmx-ui-plugin-docs, as site/htmx-ui.config.ts sets it
// up): every real page, in the site's navigation order.
import { describe, expect, test } from "bun:test";
import { llmsTxt, markdownFor, sitemapJson, sitemapXml, type DocsApi } from "htmx-ui-plugin-docs";
import { pluginApi } from "./engine";

describe("site outputs", () => {
  const pages = pluginApi<DocsApi>("docs").pages();

  test("every docs page has Markdown; marketing pages don't", () => {
    for (const p of pages) expect(p.markdown !== null).toBe(p.url.startsWith("/docs"));
    expect(pages.find((p) => p.url === "/docs")!.markdown).toBe("/docs.md");
  });

  test("pages follow the docs navigation order", () => {
    const urls = pages.map((p) => p.url);
    expect(urls.indexOf("/docs")).toBeLessThan(urls.indexOf("/docs/installation"));
    expect(urls.indexOf("/docs/changelog")).toBeLessThan(urls.indexOf("/docs/changelog/0.1.0"));
    expect(urls.indexOf("/docs/dark-mode")).toBeLessThan(urls.indexOf("/docs/templates"));
    expect(urls.indexOf("/docs/ai-agents")).toBeLessThan(urls.indexOf("/docs/components"));
    expect(urls.indexOf("/docs/components/text")).toBeLessThan(urls.indexOf("/docs/changelog"));
    // Pages missing from the nav sort with their parent
    expect(urls.indexOf("/docs/changelog/0.1.0")).toBeLessThan(urls.indexOf("/docs/versions"));
  });

  test("every docs page converts to non-trivial Markdown with frontmatter", () => {
    for (const p of pages.filter((p) => p.markdown)) {
      const md = markdownFor(p);
      expect(md.startsWith("---\ntitle: ")).toBe(true);
      expect(md.length).toBeGreaterThan(200);
    }
  }, 20_000);

  test("sitemaps and llms.txt use the given origin", () => {
    const base = "https://ui.test";
    const site = { name: "HTMX UI", description: "", origin: base };
    expect(sitemapXml(pages, base)).toContain("<loc>https://ui.test/docs/components/button</loc>");
    const json = JSON.parse(sitemapJson(pages, site, { version: "0.1", versions: [{ id: "0.1", label: "v0.1", path: "/docs", latest: true, sitemap: "/docs/sitemap.json" }] }));
    expect(json.version).toBe("0.1");
    expect(json.versions[0].sitemap).toBe("/docs/sitemap.json");
    const button = json.pages.find((p: { url: string }) => p.url === "/docs/components/button");
    expect(button).toMatchObject({ markdown: "/docs/components/button.md", title: "Button", section: "Components" });
    expect(button.headings.length).toBeGreaterThan(3);
    // Section text for search, keyed by heading anchor; no "#" anchors, copy buttons or tab labels
    const variants = button.sections.find((s: { id: string }) => s.id === "variants");
    expect(variants.title).toBe("Variants");
    expect(variants.text).toContain("btn-secondary");
    expect(button.headings.every((h: { text: string }) => !h.text.endsWith("#"))).toBe(true);
    const install = json.pages.find((p: { url: string }) => p.url === "/docs/installation");
    expect(install.sections.map((s: { text: string }) => s.text).join(" ")).not.toMatch(/\bCopy\b|npm pnpm yarn bun/);
    expect(llmsTxt(pages, site)).toContain("- [Button](https://ui.test/docs/components/button.md): ");
  });
});
