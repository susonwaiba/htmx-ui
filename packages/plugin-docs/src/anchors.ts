// Linkable docs headings. Every h2/h3 in a docs article ([data-docs-content]) gets
// an id (from its text unless it already has one) and a "#" link to itself, so
// search results and shared links can open an exact section.
//
// Only headings that are part of the article's text count. Left alone:
//   - headings inside links (card titles in <a class="card">: an anchor link there
//     would nest <a> in <a>, which browsers repair by breaking the card apart)
//   - headings inside component markup (.not-prose), live demos (.demo) and
//     blocks hidden from agents/search ([data-md-skip])
// Runs on rendered pages (the plugin's `transform`), so the HTML, the Markdown and the
// sitemap all see the same ids. editHtml() rather than HTMLRewriter: transforms also
// run on Node.

import { editHtml, type HtmlElement } from "htmx-ui-engine";

/** "Use `.btn` now!" -> "use-btn-now" */
export function slug(text: string): string {
  return (
    text
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .trim()
      .replace(/[\s-]+/g, "-") || "section"
  );
}

/** The article body: what gets anchors, Markdown and search text. */
export const CONTENT = "[data-docs-content]";
/** Ancestors that make a heading component markup rather than a document section. */
const NOT_SECTIONS = "a, .demo, .not-prose, [data-md-skip]";

/** The docs heading `el` is, if any: inside the content, and `skip` when inside component markup. */
function heading(el: HtmlElement, content: string): { skip: boolean } | null {
  if (!el.matches("h2, h3")) return null;
  const article = el.closest(content);
  if (!article) return null;
  const inside = el.parents.slice(el.parents.indexOf(article) + 1);
  return { skip: inside.some((p) => p.matches(NOT_SECTIONS)) };
}

export function addHeadingAnchors(html: string, content = CONTENT): string {
  // Pass 1: each heading's existing id and text (as written, like HTMLRewriter's text
  // chunks), noting which are inside component markup.
  const found: { id: string | null; text: string; skip: boolean }[] = [];
  const open: { text: string }[] = [];
  editHtml(html, {
    element(el) {
      const h = heading(el, content);
      if (!h) return;
      const entry = { id: el.getAttribute("id"), text: "", skip: h.skip };
      found.push(entry);
      open.push(entry);
      el.onEndTag(() => void open.pop());
    },
    text(chunk) {
      if (open.length) open.at(-1)!.text += chunk;
    },
  });
  if (!found.length) return html;

  // Unique ids: explicit ones win, generated ones get -2, -3 ... on collision.
  const used = new Set(found.filter((h) => !h.skip && h.id).map((h) => h.id!));
  const ids = found.map((h) => {
    if (h.skip || h.id) return h.id;
    const base = slug(h.text);
    let id = base;
    for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
    used.add(id);
    return id;
  });

  // Pass 2: write ids and append the anchor link.
  let i = 0;
  return editHtml(html, {
    element(el) {
      if (!heading(el, content)) return;
      const h = found[i];
      const id = ids[i++];
      if (!h || h.skip || !id) return;
      if (el.getAttribute("id") !== id) el.setAttribute("id", id);
      el.append(`<a class="heading-anchor" href="#${id}" aria-label="Link to this section" data-md-skip>#</a>`);
    },
  });
}
