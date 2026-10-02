import { describe, expect, test } from "bun:test";
import { addHeadingAnchors, slug } from "./anchors";

const page = (body: string) => `<article><div data-docs-content>${body}</div></article>`;

describe("slug", () => {
  test("lowercases, drops punctuation, joins words with hyphens", () => {
    expect(slug("Use `.btn` now!")).toBe("use-btn-now");
    expect(slug("Templates & data")).toBe("templates-data");
    expect(slug("Café  —  Menü")).toBe("cafe-menu");
    expect(slug("!!!")).toBe("section");
  });
});

describe("addHeadingAnchors", () => {
  test("gives h2/h3 an id from their text and a # link", () => {
    const html = addHeadingAnchors(page("<h2>Getting <code>started</code></h2><h3>Next step</h3>"));
    expect(html).toContain('<h2 id="getting-started">Getting <code>started</code><a class="heading-anchor" href="#getting-started"');
    expect(html).toContain('<h3 id="next-step">Next step<a class="heading-anchor" href="#next-step"');
  });

  test("keeps explicit ids and de-duplicates generated ones", () => {
    const html = addHeadingAnchors(page('<h2 id="setup">Install</h2><h2>Setup</h2><h2>Usage</h2><h2>Usage</h2>'));
    expect(html).toContain('id="setup">Install');
    expect(html).toContain('id="setup-2">Setup');
    expect(html).toContain('id="usage">Usage');
    expect(html).toContain('id="usage-2">Usage');
  });

  test("leaves card titles inside links and component markup alone (no <a> nested in <a>)", () => {
    const html = addHeadingAnchors(
      page(
        '<div class="not-prose"><a class="card" href="/x"><h2 class="card-title">Alert</h2></a></div>' +
          '<a class="card" href="/y"><h3 class="card-title">Badge</h3></a>' +
          '<div class="not-prose"><h2>Grid title</h2></div>' +
          '<div data-md-skip><h2>Hidden</h2></div><h2>Real section</h2>',
      ),
    );
    expect(html).toContain('<h2 class="card-title">Alert</h2>');
    expect(html).toContain('<h3 class="card-title">Badge</h3>');
    expect(html).toContain("<h2>Grid title</h2>");
    expect(html).toContain("<h2>Hidden</h2>");
    expect(html).toContain('<h2 id="real-section">Real section<a class="heading-anchor"');
    expect(html.match(/heading-anchor/g)).toHaveLength(1);
  });

  test("an element matching several skip selectors doesn't swallow later headings", () => {
    // demo() renders <div class="demo not-prose" data-md-skip>: three matches, one element
    const html = addHeadingAnchors(page('<div class="demo not-prose" data-md-skip><h2>Demo</h2></div><h2>After</h2>'));
    expect(html).toContain("<h2>Demo</h2>");
    expect(html).toContain('<h2 id="after">After<a class="heading-anchor"');
  });

  test("leaves demo headings and headings outside the docs content alone", () => {
    const html = addHeadingAnchors(`<h2>Outside</h2>${page('<div class="demo"><h3 class="card-title">Card</h3></div>')}`);
    expect(html).toContain("<h2>Outside</h2>");
    expect(html).toContain('<h3 class="card-title">Card</h3>');
  });
});
