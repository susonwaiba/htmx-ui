// Shared rules for deploying the built site to GitHub Pages from a subdirectory
// (https://<user>.github.io/<repo>/). Two scripts use it:
//
//   scripts/prepare-for-github-pages.ts  rewrites dist/ so every URL is absolute
//   scripts/check-github-pages.ts        verifies dist/ afterwards
//
// Everything here is deliberately about *facts about the output* (which files
// exist, what a URL looks like), so the checker never has to trust the writer.

import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";

/** Where the site lives once published. The repo segment is what makes this a subdirectory. */
export const DEFAULT_BASE_URL = "https://susonwaiba.github.io/htmx-ui";

/** Files worth parsing as text. Anything else (svg, png, woff2, …) is copied through. */
export const TEXT_EXTENSIONS = new Set([
  ".html",
  ".css",
  ".js",
  ".mjs",
  ".map",
  ".json",
  ".xml",
  ".txt",
  ".md",
  ".webmanifest",
]);

/** Hrefs that already name their own destination: a scheme, `//host`, or `#frag`. */
const SELF_CONTAINED = /^(?:[a-z][a-z\d+\-.]*:|\/\/|#)/i;

/**
 * True when a URL points somewhere on its own: another origin, a
 * `data:`/`mailto:` payload, or a fragment on the current page.
 *
 * Root-absolute (`/docs`) is deliberately *not* external — under a project
 * subdirectory it leaves the site, which is the thing to catch.
 */
export function isExternalUrl(url: string): boolean {
  return SELF_CONTAINED.test(url);
}

/**
 * Whether a `data-*` value is a URL rather than component state.
 *
 * `data-*` holds both, and nothing else tells them apart: the docs plugin writes
 * `data-markdown-copy="/docs/button.md"` and the search palette
 * `data-search-src="/sitemap.json"`, while the prompt-input demo puts file
 * names and trigger keystrokes in `data-value="README.md"`, `data-value="docs/"`
 * and `data-prompt-input-menu="/"` — all of which look exactly like paths.
 *
 * So the rule is the shape, and it is also the convention: a URL written into a
 * `data-*` attribute is rooted at the site, the way the bundle's own request
 * paths are (`rewriteJsPaths` reads the same shape). State is not rooted, and
 * the bare `/` is the commands trigger — the same keystroke the JS rewriter
 * deliberately leaves alone. `//host` is another origin, already handled as one.
 */
export function isUrlDataValue(value: string): boolean {
  return value.startsWith("/") && value !== "/" && !value.startsWith("//");
}

/** `/a/b?x=1#y` -> `{ path: "/a/b", suffix: "?x=1#y" }` */
export function splitUrl(url: string): { path: string; suffix: string } {
  const match = url.match(/^([^?#]*)([?#][\s\S]*)?$/);
  return { path: match?.[1] ?? url, suffix: match?.[2] ?? "" };
}

/** Resolve `.` / `..` in a POSIX path, without touching the filesystem. */
export function normalizePath(path: string): string {
  const out: string[] = [];
  for (const part of path.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") {
      out.pop();
      continue;
    }
    out.push(part);
  }
  return out.join("/");
}

/** Every file under `dir`, as POSIX paths relative to it, sorted for stable output. */
export async function walkFiles(dir: string): Promise<string[]> {
  const out: string[] = [];

  async function walk(current: string) {
    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      const path = join(current, entry.name);
      if (entry.isDirectory()) await walk(path);
      else if (entry.isFile()) out.push(path.slice(dir.length + 1).split("\\").join("/"));
    }
  }

  await walk(dir);
  return out;
}

/**
 * Decides which URLs belong to this site.
 *
 * The gate is existence: a root-absolute or relative URL is only rewritten when
 * it resolves to a real file in `dist/` (as a file, as `x/index.html`, or as
 * `x.html`). That is what keeps the rewrite from mangling things it should not
 * touch — a prose snippet in `sitemap.json`, `versions.json`'s version-relative
 * `pages` entries, a `public/` example inside a docs code block, the dev-only
 * `/api/*` mock endpoints, or a bare `"."` that names a directory, not a file.
 */
export function createSiteIndex(files: Set<string>): { owns: (url: string) => boolean } {
  /** The dist-relative target of a URL, in all the ways one can be spelled. */
  function target(url: string): string {
    return normalizePath(splitUrl(url).path.replace(/^\/+/, ""));
  }

  function exists(path: string): boolean {
    return files.has(path) || files.has(`${path}/index.html`) || files.has(`${path}.html`);
  }

  /** Whether this URL is a path this build actually publishes. */
  function owns(url: string): boolean {
    if (isExternalUrl(url)) return false;

    const { path } = splitUrl(url);
    if (!path) return false; // `href=""` means "this page"; leave it
    if (path === "/") return exists("index.html");

    // "." and "./" name a directory rather than a file, and which one depends
    // on the referencing page, so they are never a site path.
    return target(url) !== "" && exists(target(url));
  }

  return { owns };
}

/**
 * A quoted, root-absolute path: the shape a bundle's own requests take, as in
 * `fetch("/sitemap.json")`.
 *
 * Deliberately not a full string scan. In minified JavaScript one stray quote
 * desynchronises every later match, so literals start being read across template
 * boundaries and real URLs are silently missed. Anchoring on the characters
 * after the slash keeps each match independent, and the caller still gates on
 * whether the path is one the build publishes.
 *
 * Group 2 must begin with a path character, so `"/>"` — a closing tag inside a
 * minified selector — is not mistaken for a URL.
 */
export const QUOTED_ROOT_PATH = /(["'`])(\/(?:[\w.~%!$&()*+,;=:@/?#\-']*))\1/g;

/** `docs/components/button.html` -> `docs/components/button` */
export function pageRoute(file: string): string {
  const withoutExt = file.replace(/\.html$/, "");
  return withoutExt === "index" || withoutExt.endsWith("/index")
    ? withoutExt.replace(/(^|\/)index$/, "")
    : withoutExt;
}

/**
 * Byte ranges of HTML that must be left exactly as written: the source of every
 * docs example. `demo()` renders examples inside `<pre><code>`, so rewriting
 * `href="/favicon.svg"` in the configuration page's snippet would change what
 * the documentation says.
 */
export function maskedHtmlRanges(html: string): [number, number][] {
  const ranges: [number, number][] = [];
  const skip = /<(pre|code|textarea)\b[\s\S]*?<\/\1\s*>/gi;
  for (const match of html.matchAll(skip)) {
    if (match.index !== undefined) ranges.push([match.index, match.index + match[0].length]);
  }
  return ranges;
}

/** Applies `replace` to `input` outside `ranges`, returning the rewritten text. */
export function replaceOutside(
  input: string,
  ranges: [number, number][],
  replace: (chunk: string, offset: number) => string,
): string {
  if (!ranges.length) return replace(input, 0);

  let out = "";
  let cursor = 0;

  for (const [start, end] of ranges) {
    if (start > cursor) out += replace(input.slice(cursor, start), cursor);
    out += input.slice(start, end);
    cursor = end;
  }

  if (cursor < input.length) out += replace(input.slice(cursor), cursor);

  return out;
}

/** Split `input` on `pattern`, dropping the parts that fall inside `ranges`. */
export function splitOutside(
  input: string,
  ranges: [number, number][],
  pattern: RegExp,
): string[] {
  const parts: string[] = [];
  let offset = 0;

  for (const match of input.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (!index) continue;
    if (ranges.some(([start, end]) => index > start && index < end)) {
      parts.push(input.slice(offset, index + match[0].length));
    } else {
      parts.push(input.slice(offset, index), match[0]);
    }
    offset = index + match[0].length;
  }

  parts.push(input.slice(offset));

  return parts;
}

/** Where an inlined `<style>` or `<script>` block starts, so its body can be rewritten. */
export function inlineBlockRanges(
  input: string,
  tag: "style" | "script",
): [number, number][] {
  const ranges: [number, number][] = [];
  const open = new RegExp(`<${tag}\\b[^>]*>`, "gi");

  for (const match of input.matchAll(open)) {
    const start = match.index! + match[0].length;
    const end = input.toLowerCase().indexOf(`</${tag}>`, start);
    if (end !== -1) ranges.push([start, end]);
  }

  return ranges;
}

/** `href="… x.png 2x, y.png 3x"` -> each candidate's absolute form. */
export function rewriteSrcset(
  value: string,
  toAbsolute: (url: string) => string | null,
): string {
  return value
    .split(",")
    .map((candidate) => {
      const trimmed = candidate.trim();
      const leading = candidate.slice(0, candidate.length - candidate.trimStart().length);
      if (!trimmed) return candidate;
      return leading + (toAbsolute(trimmed) ?? trimmed);
    })
    .join(", ");
}

export async function dirExists(path: string): Promise<boolean> {
  try {
    return (await stat(path)).isDirectory();
  } catch {
    return false;
  }
}

export async function fileExists(path: string): Promise<boolean> {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}