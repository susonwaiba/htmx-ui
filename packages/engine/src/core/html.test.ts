import { describe, expect, test } from "bun:test";
import { editHtml, type HtmlElement } from "./html";

const PAGE = `<!doctype html>
<html lang="en"><head><meta charset="utf-8" /><title>A &amp; B</title>
<script>if (a < b && "</div>") document.write("<p>")</script></head>
<body hx-boost:inherited="true"><!-- <a href="/x"> -->
<a class='card' href=/docs data-x>Docs <b>here</b></a><img src="a.png"><svg><path d="M0 0"/></svg>
</body></html>`;

describe("editHtml", () => {
  test("an edit that touches nothing returns the document byte for byte", () => {
    expect(editHtml(PAGE, { element() {} })).toBe(PAGE);
  });

  test("reads tags, attributes (as written) and ancestors; skips comments and raw text", () => {
    const seen: string[] = [];
    editHtml(PAGE, {
      element(el) {
        seen.push(`${el.tagName}${el.parents.length}`);
      },
    });
    // The <a> in the comment and the "<p>" / "</div>" in the script are not elements.
    expect(seen).toEqual(["html0", "head1", "meta2", "title2", "script2", "body1", "a2", "b3", "img2", "svg2", "path3"]);

    const values: (string | null)[] = [];
    editHtml(PAGE, {
      element(el) {
        if (el.tagName === "a") values.push(el.getAttribute("class"), el.getAttribute("href"), el.getAttribute("data-x"), el.getAttribute("nope"));
        if (el.tagName === "body") values.push(el.getAttribute("hx-boost:inherited"));
      },
    });
    expect(values).toEqual(["true", "card", "/docs", "", null]);
  });

  test("text arrives as written, with the open elements around it", () => {
    const text: string[] = [];
    editHtml(PAGE, {
      text(chunk, parents) {
        if (parents.at(-1)?.tagName === "title" || parents.some((p) => p.tagName === "a")) text.push(chunk);
      },
    });
    expect(text).toEqual(["A &amp; B", "Docs ", "here"]);
  });

  test("setAttribute rewrites only that tag, escaping quotes like HTMLRewriter", () => {
    const html = editHtml('<p a="1"  b=\'2\'>x</p><p c="3">y</p>', {
      element(el) {
        if (el.hasAttribute("a")) el.setAttribute("b", 'say "hi" & go').setAttribute("id", "new");
      },
    });
    expect(html).toBe('<p a="1" b="say &quot;hi&quot; & go" id="new">x</p><p c="3">y</p>');
    expect(editHtml('<i a="1" b="2" c="3"></i>', { element: (el) => void el.removeAttribute("b") })).toBe('<i a="1" c="3"></i>');
  });

  test("inserts before, inside and after elements, and replaces them", () => {
    const html = editHtml("<main><h2>T</h2><div data-slot hidden><span>old</span></div><br></main>", {
      element(el) {
        if (el.tagName === "h2") el.before("[").prepend("<").append("<a>#</a>").after("]");
        if (el.hasAttribute("data-slot")) el.replace("<div>new</div>");
        if (el.tagName === "br") el.after("!");
      },
    });
    expect(html).toBe("<main>[<h2><T<a>#</a></h2>]<div>new</div><br>!</main>");
  });

  test("onEndTag sees an element's whole content, and fires where it is implicitly closed", () => {
    const ends: string[] = [];
    let heading = "";
    const html = editHtml("<div><h3>A <code>b</code></h3><p>one<p>two</div>tail", {
      element(el) {
        el.onEndTag((e: HtmlElement) => ends.push(e.tagName));
        if (el.tagName === "p") el.append("|");
      },
      text(chunk, parents) {
        if (parents.some((p) => p.tagName === "h3")) heading += chunk;
      },
    });
    expect(heading).toBe("A b");
    expect(ends).toEqual(["code", "h3", "p", "p", "div"]);
    // Both <p>s close at </div>, so their appended markup lands there.
    expect(html).toBe("<div><h3>A <code>b</code></h3><p>one<p>two||</div>tail");
  });

  test("matches tags, ids, classes and attribute tests; closest() walks the ancestors", () => {
    const hits: string[] = [];
    editHtml('<article data-docs-content><a class="card x" href="/docs/a"><h2 id="t">x</h2></a><h3 lang="en-GB">y</h3></article>', {
      element(el) {
        if (el.matches("h2, h3") && el.closest("[data-docs-content]")) hits.push(`${el.tagName}:${!!el.closest("a")}`);
        if (el.matches("a.card.x[href^='/docs']")) hits.push("card");
        if (el.matches("#t") && el.matches("[id=t]") && !el.matches("[id$=x]")) hits.push("id");
        if (el.matches('[lang*="GB"]') && el.matches("[lang~=en-GB]")) hits.push("lang");
      },
    });
    expect(hits).toEqual(["card", "h2:true", "id", "h3:false", "lang"]);
    expect(() => editHtml("<p></p>", { element: (el) => void el.matches("div > p") })).toThrow(/unsupported selector/);
  });
});
