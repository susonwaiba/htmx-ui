import { describe, expect, test } from "bun:test";
import { pageMarkdown, pageMeta } from "./markdown";

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
