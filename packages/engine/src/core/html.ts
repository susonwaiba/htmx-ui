// Small streaming HTML editor for transforms and plugins, on both runtimes.
//
//   import { editHtml } from "htmx-ui-engine";
//   editHtml(html, {
//     element(el) {
//       if (el.matches("a[href^='/docs']")) el.setAttribute("data-docs", "");
//       if (el.matches("h2") && el.closest("[data-docs-content]")) el.append("<a href='#'>#</a>");
//     },
//   });
//
// Bun has HTMLRewriter, Node has nothing built in, and a `transform` or plugin runs on
// both (the Vite adapter renders pages on Node). This covers what page transforms need
// and behaves like HTMLRewriter where they overlap:
//   - text and attribute values are the source text: entities are not decoded;
//   - setAttribute() writes the value as given, escaping only `"`;
//   - tags nobody touched come out byte for byte, so an edit never reformats a page.
//
// It is a tokenizer, not a parser: it does not build a tree or repair markup. Elements
// close at their end tag (or at an ancestor's), void elements and `<x/>` never open,
// and <script>, <style>, <textarea> and <title> hold raw text. That is enough for the
// pages a build produces; it is not a sanitizer.

const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
const RAW_TEXT = new Set(["script", "style", "textarea", "title"]);

/** One attribute of a start tag, as written. */
interface Attr {
  name: string;
  /** Lowercased, for lookups. */
  key: string;
  value: string;
  /** The attribute's own source, including the whitespace in front of it. */
  source: string;
  edited: boolean;
}

/** `[name]`, `[name=value]`, `[name^=value]`, ... */
interface AttrTest {
  key: string;
  op: "" | "=" | "~=" | "^=" | "$=" | "*=";
  value: string;
}

/** One compound selector: `a.card[href]`. */
interface Compound {
  tag: string | null;
  id: string | null;
  classes: string[];
  attrs: AttrTest[];
}

const compiled = new Map<string, Compound[]>();

/**
 * Comma-separated compound selectors: a tag, `#id`, `.class` and `[attr]` tests
 * (`=`, `~=`, `^=`, `$=`, `*=`). No combinators: use `closest()` for ancestry.
 */
function compile(selector: string): Compound[] {
  let found = compiled.get(selector);
  if (found) return found;
  found = selector.split(",").map((part) => {
    const s = part.trim();
    const out: Compound = { tag: null, id: null, classes: [], attrs: [] };
    const re = /^([a-zA-Z][\w-]*|\*)|#([\w-]+)|\.([\w-]+)|\[\s*([^\s~^$*=\]]+)\s*(?:(~=|\^=|\$=|\*=|=)\s*(?:"([^"]*)"|'([^']*)'|([^\]\s]*)))?\s*\]/gy;
    let m: RegExpExecArray | null;
    let at = 0;
    while (at < s.length && (m = re.exec(s))) {
      if (m[1] && m[1] !== "*") out.tag = m[1].toLowerCase();
      else if (m[2]) out.id = m[2];
      else if (m[3]) out.classes.push(m[3]);
      else if (m[4]) out.attrs.push({ key: m[4].toLowerCase(), op: (m[5] ?? "") as AttrTest["op"], value: m[6] ?? m[7] ?? m[8] ?? "" });
      at = re.lastIndex;
    }
    if (!s || at !== s.length) throw new Error(`[html] unsupported selector ${JSON.stringify(part.trim())}: use tag, #id, .class and [attr] tests`);
    return out;
  });
  compiled.set(selector, found);
  return found;
}

function test(t: AttrTest, value: string | null): boolean {
  if (value === null) return false;
  switch (t.op) {
    case "":
      return true;
    case "=":
      return value === t.value;
    case "~=":
      return value.split(/\s+/).includes(t.value);
    case "^=":
      return value.startsWith(t.value);
    case "$=":
      return value.endsWith(t.value);
    case "*=":
      return value.includes(t.value);
  }
}

/** An element as the editor sees it: its start tag, its open ancestors, and edits to make. */
export class HtmlElement {
  /** Lowercased tag name. */
  readonly tagName: string;
  /** Open ancestors, outermost first. */
  readonly parents: readonly HtmlElement[];
  /** True for void elements and `<x/>`, which have no content or end tag. */
  readonly selfClosing: boolean;

  /** @internal */ attrs: Attr[];
  /** @internal */ source: string;
  /** @internal */ head: string;
  /** @internal */ tail: string;
  /** @internal */ edits = { before: "", prepend: "", append: "", after: "", replace: null as string | null };
  /** @internal */ endHandlers: ((el: HtmlElement) => void)[] = [];

  /** @internal */
  constructor(tagName: string, attrs: Attr[], source: string, head: string, tail: string, parents: HtmlElement[], selfClosing: boolean) {
    this.tagName = tagName;
    this.attrs = attrs;
    this.source = source;
    this.head = head;
    this.tail = tail;
    this.parents = parents;
    this.selfClosing = selfClosing;
  }

  /** The attribute's value as written (entities not decoded), or null. */
  getAttribute(name: string): string | null {
    const key = name.toLowerCase();
    return this.attrs.find((a) => a.key === key)?.value ?? null;
  }

  hasAttribute(name: string): boolean {
    return this.getAttribute(name) !== null;
  }

  /** Set an attribute. The value is written as given, with `"` escaped. */
  setAttribute(name: string, value: string): this {
    const key = name.toLowerCase();
    const attr = this.attrs.find((a) => a.key === key);
    if (attr) Object.assign(attr, { value, edited: true });
    else this.attrs.push({ name, key, value, source: "", edited: true });
    return this;
  }

  removeAttribute(name: string): this {
    const key = name.toLowerCase();
    this.attrs = this.attrs.filter((a) => a.key !== key);
    this.source = ""; // forces a rewrite
    return this;
  }

  /** Whether this element matches a selector (see compile()). */
  matches(selector: string): boolean {
    return compile(selector).some((c) => {
      if (c.tag && c.tag !== this.tagName) return false;
      if (c.id && this.getAttribute("id") !== c.id) return false;
      if (c.classes.length) {
        const classes = (this.getAttribute("class") ?? "").split(/\s+/);
        if (!c.classes.every((name) => classes.includes(name))) return false;
      }
      return c.attrs.every((t) => test(t, this.getAttribute(t.key)));
    });
  }

  /** This element or its nearest open ancestor matching `selector`, or null. */
  closest(selector: string): HtmlElement | null {
    if (this.matches(selector)) return this;
    for (let i = this.parents.length - 1; i >= 0; i--) if (this.parents[i]!.matches(selector)) return this.parents[i]!;
    return null;
  }

  /** Insert markup before the start tag. */
  before(html: string): this {
    this.edits.before += html;
    return this;
  }
  /** Insert markup right after the start tag. */
  prepend(html: string): this {
    this.edits.prepend += html;
    return this;
  }
  /** Insert markup right before the end tag. */
  append(html: string): this {
    this.edits.append += html;
    return this;
  }
  /** Insert markup after the end tag. */
  after(html: string): this {
    this.edits.after += html;
    return this;
  }
  /** Replace the whole element, start tag to end tag, with markup. */
  replace(html: string): this {
    this.edits.replace = html;
    return this;
  }
  remove(): this {
    return this.replace("");
  }
  /** Run `fn` when the element's end tag is reached (or where it is implicitly closed). */
  onEndTag(fn: (el: HtmlElement) => void): this {
    this.endHandlers.push(fn);
    return this;
  }

  /** @internal The start tag, rewritten only when an attribute changed. */
  startTag(): string {
    if (this.source && !this.attrs.some((a) => a.edited)) return this.source;
    const attrs = this.attrs.map((a) => (a.edited || !a.source ? ` ${a.name}="${a.value.replace(/"/g, "&quot;")}"` : a.source));
    return this.head + attrs.join("") + this.tail;
  }
}

export interface HtmlHandlers {
  /** Called for every start tag, in document order. */
  element?(el: HtmlElement): void;
  /** Called for each run of text (as written, entities not decoded), with the open elements around it. */
  text?(text: string, parents: readonly HtmlElement[]): void;
}

const ATTR = /\s*([^\s"'>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/y;

/** Parse the start tag at `i` (which is "<" + a letter). Returns null when it is not one. */
function startTag(html: string, i: number) {
  const name = /^<([a-zA-Z][^\s\/>]*)/.exec(html.slice(i, i + 256));
  if (!name) return null;
  let at = i + name[0].length;
  const attrs: Attr[] = [];
  for (;;) {
    ATTR.lastIndex = at;
    const m = ATTR.exec(html);
    if (!m || m.index !== at) break;
    attrs.push({ name: m[1]!, key: m[1]!.toLowerCase(), value: m[2] ?? m[3] ?? m[4] ?? "", source: m[0], edited: false });
    at = ATTR.lastIndex;
  }
  const end = /\s*(\/?)>/y;
  end.lastIndex = at;
  const close = end.exec(html);
  if (!close) {
    // Stray characters before ">" (e.g. a lone "/" mid-tag): keep them, find the end.
    const gt = html.indexOf(">", at);
    if (gt < 0) return null;
    return { tag: name[1]!, attrs, head: name[0], tail: html.slice(at, gt + 1), end: gt + 1, selfClosing: html[gt - 1] === "/" };
  }
  return { tag: name[1]!, attrs, head: name[0], tail: close[0], end: at + close[0].length, selfClosing: close[1] === "/" };
}

/**
 * Edit `html` in one pass. Handlers see each element when its start tag is read, with
 * its open ancestors; edits (attributes, inserted markup, replacement) are applied as
 * the stream goes. Returns the edited document.
 */
export function editHtml(html: string, handlers: HtmlHandlers): string {
  const out: string[] = [];
  const stack: { el: HtmlElement; at: number }[] = [];
  const parents = () => stack.map((s) => s.el);
  let i = 0;

  const text = (from: number, to: number) => {
    if (to <= from) return;
    const chunk = html.slice(from, to);
    if (handlers.text) handlers.text(chunk, parents());
    out.push(chunk);
  };

  /** Close the top element; `endTag` is its end tag as written ("" when implied). */
  const close = (endTag: string) => {
    const { el, at } = stack.pop()!;
    for (const fn of el.endHandlers) fn(el);
    if (el.edits.replace !== null) {
      out.length = at;
      out.push(el.edits.replace);
    } else {
      out.push(el.edits.append, endTag);
    }
    out.push(el.edits.after);
  };

  while (i < html.length) {
    const lt = html.indexOf("<", i);
    if (lt < 0) {
      text(i, html.length);
      break;
    }
    text(i, lt);
    const next = html[lt + 1] ?? "";

    if (html.startsWith("<!--", lt)) {
      const end = html.indexOf("-->", lt + 4);
      const stop = end < 0 ? html.length : end + 3;
      out.push(html.slice(lt, stop));
      i = stop;
      continue;
    }
    if (next === "!" || next === "?") {
      // Doctype, CDATA, processing instruction: passed through.
      const end = html.startsWith("<![CDATA[", lt) ? html.indexOf("]]>", lt) + 2 : html.indexOf(">", lt);
      const stop = end < lt ? html.length : end + 1;
      out.push(html.slice(lt, stop));
      i = stop;
      continue;
    }
    if (next === "/") {
      const m = /^<\/([a-zA-Z][^\s\/>]*)\s*>/.exec(html.slice(lt, lt + 256));
      if (!m) {
        text(lt, lt + 1);
        i = lt + 1;
        continue;
      }
      const tag = m[1]!.toLowerCase();
      const open = stack.findLastIndex((s) => s.el.tagName === tag);
      if (open >= 0) {
        // Elements left open inside this one close with it, as a browser would.
        while (stack.length - 1 > open) close("");
        close(m[0]);
      } else {
        out.push(m[0]); // a stray end tag: leave it where it is
      }
      i = lt + m[0].length;
      continue;
    }
    const tag = /[a-zA-Z]/.test(next) ? startTag(html, lt) : null;
    if (!tag) {
      text(lt, lt + 1);
      i = lt + 1;
      continue;
    }

    const name = tag.tag.toLowerCase();
    const selfClosing = VOID.has(name) || tag.selfClosing;
    const el = new HtmlElement(name, tag.attrs, html.slice(lt, tag.end), tag.head, tag.tail, parents(), selfClosing);
    handlers.element?.(el);
    i = tag.end;

    if (selfClosing) {
      for (const fn of el.endHandlers) fn(el);
      out.push(el.edits.before, el.edits.replace ?? el.startTag() + el.edits.prepend + el.edits.append, el.edits.after);
      continue;
    }
    out.push(el.edits.before);
    stack.push({ el, at: out.length });
    out.push(el.startTag(), el.edits.prepend);

    if (RAW_TEXT.has(name)) {
      const end = new RegExp(`</${name}\\s*>`, "ig");
      end.lastIndex = i;
      const m = end.exec(html);
      const stop = m ? m.index : html.length;
      text(i, stop);
      close(m ? m[0] : "");
      i = m ? stop + m[0].length : html.length;
    }
  }
  while (stack.length) close("");
  return out.join("");
}
