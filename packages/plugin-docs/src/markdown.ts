// Converts a rendered docs page to Markdown for AI agents.
//
// Only the article body ([data-docs-content]) is converted, plus a frontmatter header built
// from the page's title (its first h1 in <article>), description (<meta name="description">)
// and section (the article's .eyebrow). The converter knows htmx-ui's components:
//   .demo            -> just its source code block (the live preview is skipped)
//   .code-block      -> fenced code; tabbed blocks become one fence per tab ("```bash npm")
//   .alert           -> blockquote with a bold title
//   a.card           -> "[Title](href): description"
//   [data-md-skip]   -> omitted (use for purely visual blocks)
// happy-dom parses the page, so this runs on Bun and Node alike.

import { Window } from "happy-dom";
import { slug } from "./anchors";

export type PageMeta = {
  title: string;
  description: string;
  section: string;
  headings: { level: number; id: string; text: string }[];
  /** Plain text under each heading, for full-text search. id "" is the text before the first heading. */
  sections: { id: string; title: string; text: string }[];
};

/** Elements whose text is UI noise, not content (copy buttons, tab strips, live demo previews). */
const SEARCH_SKIP = "[data-md-skip], .code-copy, [role=tablist], svg, script, style";

/** A heading's text without its "#" anchor link. */
const headingText = (h: Element) =>
  [...h.childNodes]
    .filter((n) => !(n.nodeType === 1 && (n as Element).matches(SEARCH_SKIP)))
    .map((n) => n.textContent)
    .join("")
    .replace(/\s+/g, " ")
    .trim();

function sectionsOf(content: Element): PageMeta["sections"] {
  const sections: PageMeta["sections"] = [{ id: "", title: "", text: "" }];
  const walk = (node: Node) => {
    if (node.nodeType === 3) {
      sections.at(-1)!.text += node.textContent;
      return;
    }
    if (node.nodeType !== 1) return;
    const el = node as Element;
    if (el.matches(SEARCH_SKIP)) return;
    if ((el.tagName === "H2" || el.tagName === "H3") && el.id && !el.closest(".demo")) {
      sections.push({ id: el.id, title: headingText(el), text: "" });
      return;
    }
    const block = isBlock(el) || el.tagName === "TD" || el.tagName === "TH" || el.tagName === "BR";
    if (block) sections.at(-1)!.text += " ";
    el.childNodes.forEach(walk);
    if (block) sections.at(-1)!.text += " ";
  };
  walk(content);
  return sections
    .map((s) => ({ ...s, text: s.text.replace(/\s+/g, " ").trim().slice(0, 2000) }))
    .filter((s) => s.id || s.text);
}

const BLOCK = new Set([
  "ADDRESS", "ARTICLE", "ASIDE", "BLOCKQUOTE", "DIV", "DL", "FIGURE", "FOOTER", "FORM", "H1", "H2", "H3", "H4", "H5",
  "H6", "HEADER", "HR", "LI", "MAIN", "NAV", "OL", "P", "PRE", "SECTION", "TABLE", "UL",
]);


const squash = (s: string) => s.replace(/\s+/g, " ");

function isBlock(el: Element): boolean {
  if (BLOCK.has(el.tagName)) return true;
  return el.tagName === "A" && el.classList.contains("card");
}

/** Inline content: text, code, emphasis, links. */
function inline(node: Node): string {
  if (node.nodeType === 3) return squash(node.textContent ?? "");
  if (node.nodeType !== 1) return "";
  const el = node as Element;
  if (el.hasAttribute("data-md-skip") || el.tagName === "svg" || el.tagName === "SVG") return "";
  const inner = () => [...el.childNodes].map(inline).join("");
  switch (el.tagName) {
    case "CODE":
    case "KBD": {
      const text = el.textContent ?? "";
      const fence = text.includes("`") ? "``" : "`";
      return `${fence}${text}${fence}`;
    }
    case "STRONG":
    case "B":
      return `**${inner().trim()}**`;
    case "EM":
    case "I":
      return `_${inner().trim()}_`;
    case "BR":
      return "\n";
    case "IMG":
      return el.getAttribute("alt") ? `![${el.getAttribute("alt")}](${el.getAttribute("src")})` : "";
    case "A": {
      const text = inner().trim();
      const href = el.getAttribute("href");
      return href && text ? `[${text}](${href})` : text;
    }
    default:
      return inner();
  }
}

function fence(code: string, info: string): string {
  const ticks = code.includes("```") ? "````" : "```";
  return `${ticks}${info}\n${code.replace(/\n$/, "")}\n${ticks}`;
}

function codeBlock(el: Element): string {
  const panels = [...el.querySelectorAll("pre[data-tab-panel]")];
  if (panels.length) {
    return panels
      .map((pre) => {
        const id = pre.getAttribute("data-tab-panel");
        const label = el.querySelector(`[data-tab="${id}"]`)?.textContent?.trim() ?? id;
        const lang = pre.querySelector("code")?.getAttribute("data-lang") ?? "";
        return fence(pre.textContent ?? "", `${lang} ${label}`.trim());
      })
      .join("\n\n");
  }
  const code = el.querySelector("code");
  const lang = code?.getAttribute("data-lang") ?? "";
  const title = el.querySelector(".code-block-header > span")?.textContent?.trim();
  return fence(code?.textContent ?? "", title && title !== lang ? `${lang} ${title}` : lang);
}

function table(el: Element): string {
  const cell = (c: Element) => inline(c).trim().replace(/\|/g, "\\|").replace(/\n/g, " ");
  const rows = [...el.querySelectorAll("tr")].map((tr) => [...tr.children].map(cell));
  if (!rows.length) return "";
  const head = el.querySelector("thead tr") ? rows.shift()! : rows[0]!.map(() => "");
  const line = (r: string[]) => `| ${r.join(" | ")} |`;
  return [line(head), line(head.map(() => "---")), ...rows.map(line)].join("\n");
}

function list(el: Element, depth: number): string {
  const ordered = el.tagName === "OL";
  return [...el.children]
    .filter((li) => li.tagName === "LI")
    .map((li, i) => {
      const marker = ordered ? `${i + 1}. ` : "- ";
      const nested = [...li.children].filter((c) => c.tagName === "UL" || c.tagName === "OL");
      const own = [...li.childNodes]
        .filter((c) => !nested.includes(c as Element))
        .map((c) => (c.nodeType === 1 && isBlock(c as Element) ? ` ${block(c as Element, depth + 1)} ` : inline(c)))
        .join("")
        .replace(/\s+/g, " ")
        .trim();
      const children = nested.map((n) => "\n" + list(n, depth + 1)).join("");
      return "  ".repeat(depth) + marker + own + children;
    })
    .join("\n");
}

/** Convert one block-level element. */
function block(el: Element, depth = 0): string {
  if (el.hasAttribute("data-md-skip") || (el as HTMLElement).hidden) return "";
  const cls = el.classList;

  if (cls.contains("demo")) {
    const code = el.querySelector(".code-block");
    return code ? codeBlock(code) : "";
  }
  if (cls.contains("code-block")) return codeBlock(el);
  if (cls.contains("alert")) {
    const title = el.querySelector(".alert-title");
    const body = el.querySelector(".alert-description");
    const text = [title && `**${inline(title).trim()}**`, body && inline(body).trim()].filter(Boolean).join(" ");
    return `> ${text}`;
  }
  if (el.tagName === "A" && cls.contains("card")) {
    const title = inline(el.querySelector(".card-title") ?? el).trim();
    const desc = el.querySelector(".card-description, p.muted");
    return `[${title}](${el.getAttribute("href")})${desc ? `: ${inline(desc).trim()}` : ""}`;
  }

  switch (el.tagName) {
    case "H1": case "H2": case "H3": case "H4": case "H5": case "H6":
      return `${"#".repeat(Number(el.tagName[1]))} ${inline(el).trim()}`;
    case "P":
      return inline(el).trim();
    case "UL":
    case "OL":
      return list(el, 0);
    case "PRE":
      return fence(el.textContent ?? "", el.querySelector("code")?.getAttribute("data-lang") ?? "");
    case "TABLE":
      return table(el);
    case "BLOCKQUOTE":
      return children(el).split("\n").map((l) => `> ${l}`).join("\n");
    case "HR":
      return "---";
  }
  return children(el);
}

/** Convert an element's children, grouping runs of inline content into paragraphs. */
function children(el: Element): string {
  const out: string[] = [];
  let run = "";
  const flush = () => {
    if (run.trim()) out.push(run.trim());
    run = "";
  };
  for (const node of el.childNodes) {
    if (node.nodeType === 1 && isBlock(node as Element)) {
      flush();
      const md = block(node as Element);
      if (md.trim()) out.push(md);
    } else {
      run += inline(node);
    }
  }
  flush();
  // A grid of card links reads best as a list
  if (out.length > 1 && [...el.children].every((c) => c.tagName === "A" && c.classList.contains("card"))) {
    return out.map((l) => `- ${l}`).join("\n");
  }
  return out.join("\n\n");
}

function parse(html: string): Document {
  const window = new Window();
  window.document.write(html);
  // happy-dom implements the DOM API; its types are separate from lib.dom's
  return window.document as unknown as Document;
}

/** Title, description, section and h2/h3 outline of a rendered page. */
export function pageMeta(html: string): PageMeta {
  const doc = parse(html);
  const article = doc.querySelector("article") ?? doc.body;
  return {
    title: (article.querySelector("h1") ?? doc.querySelector("title"))?.textContent?.trim() ?? "",
    description: doc.querySelector('meta[name="description"]')?.getAttribute("content") ?? "",
    section: doc.querySelector("article .eyebrow")?.textContent?.trim() ?? "",
    headings: [...article.querySelectorAll("[data-docs-content] h2, [data-docs-content] h3")]
      .filter((h) => !h.closest(".not-prose, .demo, [data-md-skip]"))
      .map((h) => ({ level: Number(h.tagName[1]), id: h.id || slug(headingText(h)), text: headingText(h) })),
    sections: (() => {
      const content = article.querySelector("[data-docs-content]");
      return content ? sectionsOf(content) : [];
    })(),
  };
}

/** Markdown for a rendered docs page, with YAML frontmatter. */
export function pageMarkdown(html: string, url: string): string {
  const doc = parse(html);
  const meta = pageMeta(html);
  const body = doc.querySelector("article [data-docs-content]");
  const yaml = (v: string) => JSON.stringify(v);
  const front = [
    "---",
    `title: ${yaml(meta.title)}`,
    `description: ${yaml(meta.description)}`,
    `url: ${yaml(url)}`,
    meta.section && `section: ${yaml(meta.section)}`,
    "---",
  ].filter(Boolean);
  const md = [front.join("\n"), `# ${meta.title}`, meta.description, body ? children(body) : ""]
    .filter((s) => s.trim())
    .join("\n\n");
  return md.replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
}
