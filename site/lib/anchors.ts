// Linkable docs headings. Every h2/h3 in a docs article ([data-docs-content]) gets
// an id (from its text unless it already has one) and a "#" link to itself, so
// search results and shared links can open an exact section.
//
// Only headings that are part of the article's text count. Left alone:
//   - headings inside links (card titles in <a class="card">: an anchor link there
//     would nest <a> in <a>, which browsers repair by breaking the card apart)
//   - headings inside component markup (.not-prose), live demos (.demo) and
//     blocks hidden from agents/search ([data-md-skip])
// Runs on rendered pages (the `transform` in site/lib/engine.ts) so the HTML build, the
// Markdown and the sitemap all see the same ids.

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

const HEADINGS = "[data-docs-content] h2, [data-docs-content] h3";
/** Ancestors that make a heading component markup rather than a document section. */
const NOT_SECTIONS = ["a", ".demo", ".not-prose", "[data-md-skip]"].map((s) => `[data-docs-content] ${s}`).join(", ");

export function addHeadingAnchors(html: string): string {
  // Pass 1: read each heading's text and existing id, noting which are inside
  // component markup. Elements stream in document order, so a depth counter
  // tells whether a heading is nested in one of NOT_SECTIONS.
  const found: { id: string | null; text: string; skip: boolean }[] = [];
  let depth = 0;
  new HTMLRewriter()
    .on(NOT_SECTIONS, {
      element(el) {
        depth++;
        el.onEndTag(() => void depth--);
      },
    })
    .on(HEADINGS, {
      element(el) {
        found.push({ id: el.getAttribute("id"), text: "", skip: depth > 0 });
      },
      text(chunk) {
        found.at(-1)!.text += chunk.text;
      },
    })
    .transform(html);
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
  return new HTMLRewriter()
    .on(HEADINGS, {
      element(el) {
        const h = found[i];
        const id = ids[i++];
        if (!h || h.skip || !id) return;
        el.setAttribute("id", id);
        el.append(
          `<a class="heading-anchor" href="#${id}" aria-label="Link to this section" data-md-skip>#</a>`,
          { html: true },
        );
      },
    })
    .transform(html);
}
