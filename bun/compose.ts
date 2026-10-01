// Composes .html templates before Bun's HTML bundler sees them.
//
// Two directives:
//   <layout src="../layouts/base.html"> ... </layout>  wraps a fragment in a layout
//   <include src="../partials/nav.html" />           inlines another template file
//
// Layouts declare where content lands with <slot name="...">fallback</slot>.
// Fragments declare where content comes from with <template slot="name">...</template>.

import { dirname, relative, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");

/** Attributes whose relative values are rewritten when a template is inlined. */
const URL_ATTRS = ["src", "href", "action", "formaction", "poster", "srcset", "data-src"] as const;

const LAYOUT_OPEN = /<layout\b[^>]*>/i;
const LAYOUT_CLOSE = /<\/layout\s*>/i;
const INCLUDE_SELF_CLOSING = /<include\b([^>]*?)\/>/gi;
const INCLUDE_PAIRED = /<include\b([^>]*?)>([\s\S]*?)<\/include\s*>/gi;

function attrs(tag: string): Record<string, string> {
  const out: Record<string, string> = {};
  const re = /([\w:@-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
  for (const m of tag.matchAll(re)) {
    if (!/^[\s/]/.test(m[0])) out[m[1]!] = m[2] ?? m[3] ?? m[4] ?? "";
  }
  return out;
}

/**
 * Rewrite root-relative URLs in inlined content so they stay correct after the
 * fragment is pasted into a page at a different depth.
 *
 * <include>/<layout> src attributes are build-time directives resolved against
 * the including file, so they are masked out before rewriting.
 */
function rebaseUrls(html: string, fromDir: string, toDir: string): string {
  if (fromDir === toDir) return html;

  const directives: string[] = [];
  const masked = html.replace(/<(include|layout)\b[^>]*>/gi, (tag) => {
    directives.push(tag);
    return `\u0000${directives.length - 1}\u0000`;
  });

  let out = masked;
  for (const name of URL_ATTRS) {
    const re = new RegExp(`(\\b${name}\\s*=\\s*)(["'])([^"']*)\\2`, "gi");
    out = out.replace(re, (whole, prefix: string, quote: string, value: string) => {
      if (!value || value.startsWith("/") || /^[a-z][a-z0-9+.-]*:/i.test(value) || value.startsWith("#") || value.startsWith("{{"))
        return whole;
      const [path, suffix = ""] = value.split("#");
      const rel = relative(toDir, resolve(fromDir, path!)).split("\\").join("/");
      return `${prefix}${quote}${rel}${suffix ? `#${suffix}` : ""}${quote}`;
    });
  }

  return out.replace(/\u0000(\d+)\u0000/g, (_, i: string) => directives[Number(i)]!);
}

async function readTemplate(path: string, importer?: string): Promise<string> {
  const file = Bun.file(path);
  if (!(await file.exists())) throw new Error(`[html] template not found: ${path}${importer ? ` (from ${importer})` : ""}`);
  return file.text();
}

/** Inline every <include> recursively, rebasing urls to `toDir`. */
async function expandIncludes(html: string, dir: string, toDir: string, stack: Set<string>): Promise<string> {
  const matches = [...html.matchAll(INCLUDE_SELF_CLOSING), ...html.matchAll(INCLUDE_PAIRED)].sort(
    (a, b) => (a.index ?? 0) - (b.index ?? 0),
  );
  if (matches.length === 0) return html;

  let out = "";
  let cursor = 0;

  for (const m of matches) {
    out += html.slice(cursor, m.index);
    cursor = m.index + m[0].length;

    const a = attrs(m[0]);
    if (!a.src) throw new Error(`[html] <include> is missing a src attribute: ${m[0]}`);

    const path = resolve(dir, a.src);
    if (stack.has(path)) throw new Error(`[html] circular <include> of ${path}`);

    const included = await readTemplate(path, dir);
    stack.add(path);
    const composed = await composeHtml(rebaseUrls(included, dirname(path), toDir), dirname(path), toDir, stack, path);
    stack.delete(path);

    // Paired form: <include src="x">body</include> fills x's slots with body.
    // Slots the included file does not declare pass through to the outer layout.
    if (m[2] !== undefined) {
      const { rest, slots } = extractSlots(m[2]);
      if (rest.trim()) slots.set("default", rest);
      const filled = fillSlotsPassing(composed, slots);
      const unused = [...slots.keys()].filter((n) => !filled.used.has(n));
      if (unused.length > 0) {
        throw new Error(
          `[html] <include src="${a.src}"> provides content for unknown slot(s): ${unused.join(", ")}\n` +
            `  ${path} does not declare them. Did you mean <include src="${a.src}" /> ?`,
        );
      }
      out += filled.html;
    } else {
      out += composed;
    }
  }

  return out + html.slice(cursor);
}

/**
 * Find the outermost <layout>...</layout> wrapper, returning everything outside it too.
 * Tracks nesting depth so an inner <layout> is left intact inside `inner`.
 */
function splitLayout(html: string): { before: string; open: string; inner: string; after: string } | null {
  const open = LAYOUT_OPEN.exec(html);
  if (!open) return null;

  const start = open.index;
  const innerStart = start + open[0].length;
  let depth = 1;
  let innerEnd = -1;
  let afterStart = -1;

  for (const m of html.slice(innerStart).matchAll(/<layout\b[^>]*>|<\/layout\s*>/gi)) {
    if (m[0].startsWith("</")) {
      if (--depth === 0) {
        innerEnd = innerStart + m.index;
        afterStart = innerEnd + m[0].length;
        break;
      }
    } else {
      depth++;
    }
  }
  if (afterStart === -1) throw new Error(`[html] <layout> opened but never closed`);

  return { before: html.slice(0, start), open: open[0], inner: html.slice(innerStart, innerEnd), after: html.slice(afterStart) };
}

/** Collect <template slot="name"> blocks into a map; remove them from the html. */
function extractSlots(html: string): { rest: string; slots: Map<string, string> } {
  const slots = new Map<string, string>();
  const re = /<template\s+slot="([^"]+)"\s*>([\s\S]*?)<\/template\s*>/gi;
  let rest = "";
  let cursor = 0;
  for (const m of html.matchAll(re)) {
    rest += html.slice(cursor, m.index);
    cursor = m.index + m[0].length;
    slots.set(m[1]!, m[2]!);
  }
  return { rest: rest + html.slice(cursor), slots };
}

const SLOT_RE = /<slot\b([^>]*)>([\s\S]*?)<\/slot\s*>|<slot\b([^>]*?)\/>/gi;

/**
 * Replace <slot name="x">fallback</slot> with provided content, else the fallback.
 * Slots are optional by default; `<slot name="x" required />` errors when unfilled.
 */
function fillSlots(html: string, slots: Map<string, string>): { html: string; missing: string[] } {
  const missing: string[] = [];
  const out = html.replace(SLOT_RE, (_m, a1, fallback, a2) => {
    const a = attrs(a1 ?? a2 ?? "");
    const name = a.name ?? "default";
    const provided = slots.get(name);
    if (provided !== undefined) return provided;
    if (a.required !== undefined) missing.push(name);
    return fallback ?? "";
  });
  return { html: out, missing };
}

/**
 * Like fillSlots, but a slot the caller did not provide is left in place so an
 * outer layout can fill it later. Used by paired <include> bodies.
 */
function fillSlotsPassing(html: string, slots: Map<string, string>): { html: string; used: Set<string> } {
  const used = new Set<string>();
  const out = html.replace(SLOT_RE, (whole, a1: string | undefined, _fallback, a2: string | undefined) => {
    const name = attrs(a1 ?? a2 ?? "").name ?? "default";
    const provided = slots.get(name);
    if (provided === undefined) return whole;
    used.add(name);
    return provided;
  });
  return { html: out, used };
}

/**
 * Fully compose a template file: expand includes, then apply its layout.
 * `toDir` is the directory urls end up relative to (the page that pulls it in).
 */
export async function compose(path: string, toDir?: string, stack = new Set<string>()): Promise<string> {
  const pageDir = dirname(path);
  const targetDir = toDir ?? pageDir;
  const raw = await readTemplate(path);
  return composeHtml(raw, pageDir, targetDir, stack, path);
}

/** Same as compose() but takes already-loaded markup. Used for build-time inlining. */
export async function composeHtml(
  html: string,
  dir: string,
  toDir = dir,
  stack = new Set<string>(),
  origin = "<inline>",
): Promise<string> {
  let out = await expandIncludes(html, dir, toDir, stack);

  const wrapper = splitLayout(out);
  if (!wrapper) return out;

  const a = attrs(wrapper.open);
  if (!a.src) throw new Error(`[html] <layout> is missing a src attribute: ${wrapper.open}`);

  const layoutPath = resolve(dir, a.src);
  if (stack.has(layoutPath)) throw new Error(`[html] circular <layout> of ${layoutPath}`);

  const { rest, slots } = extractSlots(wrapper.inner);
  if (rest.trim()) slots.set("default", rest);
  const layoutRaw = await readTemplate(layoutPath, dir);

  // Slot bodies may themselves declare a layout; compose them before insertion
  // so nested layouts resolve innermost-first.
  for (const [name, value] of slots) {
    slots.set(name, await composeHtml(value, dir, toDir, stack, origin));
  }

  stack.add(layoutPath);
  const layoutExpanded = await composeHtml(rebaseUrls(layoutRaw, dirname(layoutPath), toDir), dirname(layoutPath), toDir, stack, layoutPath);
  stack.delete(layoutPath);

  const filled = fillSlots(layoutExpanded, slots);
  if (filled.missing.length > 0) {
    throw new Error(
      `[html] ${origin} provides no content for layout slot(s): ${filled.missing.join(", ")}\n` +
        `  Add <template slot="name">...</template> inside the <layout> tag.`,
    );
  }

  return wrapper.before + filled.html + wrapper.after;
}

export { ROOT };
