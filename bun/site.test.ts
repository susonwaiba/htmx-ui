import { describe, expect, test } from "bun:test";
import { pageMarkdown, pageMeta } from "./markdown";
import { collectPages, llmsTxt, markdownFor, sitemapJson, sitemapXml } from "./site";

const page = (body: string) => `<!doctype html><html><head><title>T</title><meta name="description" content="Desc"></head>
<body><article><header><p class="eyebrow">Components</p><h1 class="h1">Widget</h1></header>
<div data-docs-content class="prose max-w-none">${body}</div></article></body></html>`;

describe("markdown", () => {
  test("frontmatter, headings, paragraphs, inline code and links", () => {
    const md = pageMarkdown(page('<h2 id="use">Use</h2><p>Add <code>.btn</code>, see <a href="/docs">docs</a>.</p>'), "/docs/widget");
    expect(md).toBe(
      '---\ntitle: "Widget"\ndescription: "Desc"\nurl: "/docs/widget"\nsection: "Components"\n---\n\n# Widget\n\nDesc\n\n## Use\n\nAdd `.btn`, see [docs](/docs).\n',
    );
  });

  test("demos keep only their source; tabbed code becomes one fence per tab", () => {
    const md = pageMarkdown(
      page(`<div class="demo"><div><button>live</button></div><div class="code-block"><pre><code data-lang="html">&lt;b&gt;x&lt;/b&gt;</code></pre></div></div>
      <div class="code-block" data-tabs><div class="code-block-header"><div><button data-tab="npm">npm</button><button data-tab="bun">bun</button></div></div>
      <pre data-tab-panel="npm"><code data-lang="bash">npm install x</code></pre><pre data-tab-panel="bun" hidden><code data-lang="bash">bun add x</code></pre></div>`),
      "/x",
    );
    expect(md).toContain("```html\n<b>x</b>\n```");
    expect(md).not.toContain("live");
    expect(md).toContain("```bash npm\nnpm install x\n```\n\n```bash bun\nbun add x\n```");
  });

  test("alerts, tables, lists, card links and skipped blocks", () => {
    const md = pageMarkdown(
      page(`<div class="alert"><div class="alert-title">Note</div><div class="alert-description">Be <strong>careful</strong>.</div></div>
      <table class="table"><thead><tr><th>A</th><th>B</th></tr></thead><tbody><tr><td><code>x|y</code></td><td>z</td></tr></tbody></table>
      <ul><li>one<ul><li>nested</li></ul></li><li>two</li><li><strong>Bold</strong>: then <code>x</code>, y</li></ul>
      <div><a class="card" href="/a"><h2 class="card-title">A</h2><p class="card-description">aa</p></a><a class="card" href="/b"><h2 class="card-title">B</h2></a></div>
      <div data-md-skip><p>hidden</p></div>`),
      "/x",
    );
    expect(md).toContain("> **Note** Be **careful**.");
    expect(md).toContain("| A | B |\n| --- | --- |\n| `x\\|y` | z |");
    expect(md).toContain("- one\n  - nested\n- two\n- **Bold**: then `x`, y");
    expect(md).toContain("- [A](/a): aa\n- [B](/b)");
    expect(md).not.toContain("hidden");
  });

  test("pageMeta outlines h2/h3 with ids", () => {
    const meta = pageMeta(page('<h2 id="a">Alpha</h2><h3>Beta Gamma</h3>'));
    expect(meta.headings).toEqual([
      { level: 2, id: "a", text: "Alpha" },
      { level: 3, id: "beta-gamma", text: "Beta Gamma" },
    ]);
  });
});

describe("site outputs", () => {
  const pages = collectPages();

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
  });

  test("sitemaps and llms.txt use the given origin", () => {
    const base = "https://ui.test";
    expect(sitemapXml(pages, base)).toContain("<loc>https://ui.test/docs/components/button</loc>");
    const json = JSON.parse(sitemapJson(pages, { base, version: "0.1", versions: [{ id: "0.1", label: "v0.1", path: "/docs", latest: true, sitemap: "/docs/sitemap.json" }] }));
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
    expect(llmsTxt(pages, base)).toContain("- [Button](https://ui.test/docs/components/button.md): ");
  });
});
