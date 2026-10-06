#!/usr/bin/env bun

// Verify that dist/ is safe to publish at https://<user>.github.io/<repo>/.
//
// scripts/prepare-for-github-pages.ts is the writer; this is an independent read
// of its output. Every URL it finds is re-classified from scratch, and anything
// that is not already absolute under the base URL is a deployment blocker:
//
//   relative       a URL that still depends on the page's own directory
//                  (./assets/…, assets/…) or escapes the subdirectory (/docs)
//   local-origin   a URL still pointing at the dev server (localhost:3000)
//   dead-end       a link under the base URL that dist/ does not contain, so
//                  GitHub Pages 404s it (there are no rewrite rules)
//   scaffold       a route that needs dist/<route>/index.html to resolve
//
// What is deliberately not a finding: external sites, fragments, data: URIs,
// and the dev-only mock endpoints (/api/*), which cannot work on static hosting
// but are not a broken build either.
//
// URLs are only read from positions that actually hold one — HTML attributes,
// CSS url()/@import, JS string literals, JSON string values, Markdown link
// targets and frontmatter, XML text. Code examples inside <pre><code> and fenced
// Markdown blocks are skipped: there a relative path is documentation, not a
// link. A data-* attribute counts only when its value is rooted at the site
// (isUrlDataValue): component state such as data-value="README.md" or the
// prompt-input demo's data-prompt-input-menu="/" is not a link.
//
// Exits 1 when anything is found, so it can gate a deploy.

import { join } from "node:path";

import { DIST } from "./paths.ts";
import {
  DEFAULT_BASE_URL,
  dirExists,
  inlineBlockRanges,
  isExternalUrl,
  isUrlDataValue,
  maskedHtmlRanges,
  normalizePath,
  splitUrl,
  QUOTED_ROOT_PATH,
  TEXT_EXTENSIONS,
  walkFiles,
} from "./github-pages.ts";

const flags = process.argv.slice(2);

function flag(name: string): string | undefined {
  const hit = flags.find((arg) => arg === `--${name}` || arg.startsWith(`--${name}=`));
  if (!hit) return undefined;
  return hit.includes("=") ? hit.slice(hit.indexOf("=") + 1) : "";
}

const BASE_URL = (flag("base") || process.env.SITE_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");
const DIST_DIR = flag("dist") || DIST;

/** The dev server the build falls back to when $SITE_URL is unset. */
const DEV_ORIGIN = /^https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?/i;
/** Dev-only mock endpoints (site/server/api.ts); absent from every static build. */
const DEV_ENDPOINT = /^\/api\//;
/** A file-ish suffix, so `href="about.html"` counts but `content="theme"` does not. */
const FILE_SUFFIX =
  /\.(?:html?|css|m?js|json|md|xml|txt|svg|png|jpe?g|webp|avif|gif|ico|woff2?|ttf|otf|webmanifest|map)$/i;

/** Schemes that carry a payload rather than a path, so there is nothing to fix. */
const OPAQUE_SCHEME = /^(?:data|mailto|tel|sms|javascript|blob|about|file|ftp|irc|news|magnet|urn):/i;
/** A root-absolute path: `/docs`, `/`, `/assets/app-1a2b.js?v=1#x`. */
const ROOT_PATH = /^\/(?:[\w.~%!$&'()*+,;=:@-]|$)/;
/** `versions[n].pages[m]`: paths relative to that version's `path`, not to the root. */
const VERSION_PAGES = /^versions\[\d+\]\.pages\[\d+\]$/;

/**
 * Whether a string found at a URL position is plausibly a URL at all. The
 * collectors are deliberately loose (every attribute value, every JS literal),
 * so this is what keeps `"theme"`, `"{"` and `"text/html"` out of the report.
 *
 * `loose` additionally accepts a bare `dir/file` with no leading slash, which is
 * only unambiguous where the position already implies a path: an HTML attribute
 * or a Markdown link target. Inside JavaScript it would swallow MIME types.
 */
function isUrlLike(url: string, loose = false): boolean {
  if (ROOT_PATH.test(url)) return true; // `/docs`, `/`, but not a regex like `"/>"`
  if (url.startsWith("./") || url.startsWith("../")) return true;
  if (OPAQUE_SCHEME.test(url)) return true;
  if (/^[a-z][a-z\d+\-.]*:\/\//i.test(url)) return true;
  if (FILE_SUFFIX.test(url)) return true;
  return loose && /^[\w.-]+\/[\w./-]*$/.test(url);
}

type Kind = "relative" | "local-origin" | "dead-end" | "scaffold" | "layout";
type Finding = { kind: Kind; file: string; line: number; where: string; href: string; note: string };

const findings: Finding[] = [];

const files = new Set<string>();
const contents = new Map<string, string>();

const lineAt = (file: string, index: number) => contents.get(file)!.slice(0, index).split("\n").length;

function report(finding: Finding) {
  findings.push(finding);
}

/**
 * The one rule everything funnels through: a URL is acceptable only if it is
 * external, or already absolute under the base URL and backed by a real file.
 */
function inspectUrl(file: string, where: string, index: number, url: string, loose = false) {
  if (!url) return;

  // Same-site first: a URL under the base is absolute like any other, so the
  // scheme test below would otherwise read it as another origin.
  if (url === BASE_URL || url.startsWith(`${BASE_URL}/`)) {
    const { path, suffix } = splitUrl(url.slice(BASE_URL.length));
    const target = normalizePath(path.replace(/^\/+/, ""));
    if (!target || DEV_ENDPOINT.test(`/${target}`)) return;

    if (!resolves(target)) {
      report({
        kind: "dead-end",
        file,
        line: lineAt(file, index),
        where,
        href: url,
        note: `dist/ has no "${target}"`,
      });
      return;
    }

    // An extensionless route only resolves through its own index.html copy.
    if (
      !suffix.startsWith("?") &&
      !files.has(target) &&
      files.has(`${target}.html`) &&
      !files.has(`${target}/index.html`)
    ) {
      report({
        kind: "scaffold",
        file,
        line: lineAt(file, index),
        where,
        href: url,
        note: `needs dist/${target}/index.html`,
      });
    }
    return;
  }

  if (DEV_ORIGIN.test(url)) {
    report({
      kind: "local-origin",
      file,
      line: lineAt(file, index),
      where,
      href: url,
      note: `still points at the dev server; build with SITE_URL=${BASE_URL} (bun run deploy does)`,
    });
    return;
  }

  if (isExternalUrl(url)) return; // another origin, a data: payload, a fragment
  if (DEV_ENDPOINT.test(url)) return; // dev-only mock endpoint, not part of the build
  if (!isUrlLike(url, loose)) return; // a string at a URL position that is not one

  report({
    kind: "relative",
    file,
    line: lineAt(file, index),
    where,
    href: url,
    note: url.startsWith("/")
      ? "root-absolute: escapes the subdirectory"
      : "relative: resolved against this page's directory",
  });
}

/** GitHub Pages' lookup order: the path itself, then directory index, then .html. */
function resolves(target: string): boolean {
  return files.has(target) || files.has(`${target}/index.html`) || files.has(`${target}.html`);
}

function inMasked(index: number, masked: [number, number][]): boolean {
  return masked.some(([start, end]) => index > start && index < end);
}

// --- Collectors: positions that actually hold a URL -------------------------

const ATTR = /([:@a-zA-Z_][-.:\w]*)\s*=\s*("[^"]*"|'[^']*'|[^\s"'`=<>]+)/g;
const URL_ATTRS = new Set([
  "action",
  "background",
  "cite",
  "data",
  "formaction",
  "href",
  "longdesc",
  "manifest",
  "ping",
  "poster",
  "profile",
  "src",
  "xlink:href",
]);
const SRCSET_ATTRS = new Set(["imagesrcset", "srcset"]);

function unquote(raw: string): { value: string; quoted: boolean } {
  const quoted = raw[0] === '"' || raw[0] === "'";
  return { value: quoted ? raw.slice(1, -1) : raw, quoted };
}

function checkHtml(file: string, text: string) {
  const masked = maskedHtmlRanges(text);

  for (const match of text.matchAll(ATTR)) {
    if (inMasked(match.index!, masked)) continue;
    const name = match[1]!.toLowerCase();
    const offset = match.index! + match[0].length - match[2]!.length;
    const { value } = unquote(match[2]!);

    if (URL_ATTRS.has(name) || name === "content" || (name.startsWith("data-") && isUrlDataValue(value))) {
      inspectUrl(file, name, offset, value, true);
    } else if (SRCSET_ATTRS.has(name)) {
      let cursor = offset;
      for (const candidate of value.split(",")) {
        const url = candidate.trim().split(/\s+/)[0] ?? "";
        if (url) inspectUrl(file, name, cursor, url, true);
        cursor += candidate.length + 1;
      }
    } else if (name === "style") {
      checkCss(file, value, offset, masked);
    }
  }

  // Inline <style> and <script> bodies; their own attributes are covered above.
  for (const tag of ["style", "script"] as const) {
    for (const [start, end] of inlineBlockRanges(text, tag)) {
      const body = text.slice(start, end);
      const inner = tag === "style" ? checkCss : checkJs;
      inner(file, body, start, []);
    }
  }
}

function checkCss(file: string, css: string, offset: number, masked: [number, number][]) {
  for (const match of css.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)'"\s]*))\s*\)/gi)) {
    const index = offset + match.index!;
    if (inMasked(index, masked)) continue;
    inspectUrl(file, "css url()", index, match[1] ?? match[2] ?? match[3] ?? "");
  }

  for (const match of css.matchAll(/(@import\s+)(?:"([^"]*)"|'([^']*)')/gi)) {
    const index = offset + match.index!;
    if (inMasked(index, masked)) continue;
    inspectUrl(file, "css @import", index, match[2] ?? match[3] ?? "");
  }
}

function checkJs(file: string, js: string, offset: number, masked: [number, number][]) {
  for (const match of js.matchAll(QUOTED_ROOT_PATH)) {
    const index = offset + match.index!;
    if (inMasked(index, masked)) continue;
    // The bare root is skipped here for the same reason it is in the writer:
    // inside JavaScript it is a value, not a route (this bundle holds the
    // search palette's "/" shortcut). Named paths are unambiguous.
    if (match[2] === "/") continue;
    inspectUrl(file, "js request", index, match[2]!);
  }
}

/** A standalone `pages.json` inside a frozen docs version: paths are version-relative, not site-rooted. */
const VERSION_PAGES_FILE = /^docs\/v[^/]+\/pages\.json$/;

function checkJson(file: string, json: string) {
  // docs/v*/pages.json holds paths relative to that version's root ("/ai-agents"
  // means "<version-path>/ai-agents"), not site-absolute paths. Skip them entirely,
  // the same way versions[n].pages[m] entries in versions.json are skipped below.
  if (VERSION_PAGES_FILE.test(file)) return;

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch (error) {
    report({
      kind: "layout",
      file,
      line: 0,
      where: "json",
      href: "",
      note: `invalid JSON (${(error as Error).message})`,
    });
    return;
  }

  // Walk the tree so each finding names the key it came from. A version's
  // `pages` list is relative to that version's `path`, not to the site root, so
  // `/installation` there means "<path>/installation" (htmx-ui-plugin-versions/client).
  const walk = (node: unknown, path: string) => {
    if (typeof node === "string") {
      if (VERSION_PAGES.test(path)) return;
      // A whole value that is a URL. Whitespace means it is prose that happens
      // to mention one (`sections[].text` quotes the docs at length).
      if (!/\s/.test(node) && (/^(?:\/|\.{1,2}\/)/.test(node) || DEV_ORIGIN.test(node))) {
        inspectUrl(file, path || "<root>", 0, node);
      }
    } else if (Array.isArray(node)) {
      node.forEach((item, i) => walk(item, `${path}[${i}]`));
    } else if (node && typeof node === "object") {
      for (const [key, value] of Object.entries(node)) walk(value, path ? `${path}.${key}` : key);
    }
  };

  walk(parsed, "");
}

function checkMarkdown(file: string, text: string) {
  const masked = maskedRangesOfFences(text);

  // Frontmatter: plain YAML values.
  for (const match of text.matchAll(/^(---\n[\s\S]*?\n---)/g)) {
    if (inMasked(match.index!, masked)) continue;
    for (const line of match[1]!.split("\n")) {
      const pair = line.match(/^(\s*[\w-]+:\s*)(["']?)(.*?)\2$/);
      if (!pair?.[3]) continue;
      const index = match.index! + match[1]!.indexOf(line) + pair[1]!.length;
      inspectUrl(file, `frontmatter ${pair[1]!.trim().replace(/:$/, "")}`, index, pair[3], true);
    }
  }

  // Link and image targets.
  for (const match of text.matchAll(/(!?\[[^\]]*\])\(\s*<?([^)\s>]+)>?(?:\s+(?:"[^"]*"|'[^']*'))?\s*\)/g)) {
    if (inMasked(match.index!, masked)) continue;
    const index = match.index! + match[0].indexOf(match[2]!);
    inspectUrl(file, "markdown link", index, match[2]!, true);
  }
}

/** sitemap.xml and friends: the URL sits in the element's text, not an attribute. */
function checkXml(file: string, text: string) {
  for (const match of text.matchAll(/<([a-z][\w:-]*)(?:[^>]*)>([^<]*)</gi)) {
    const [, tag, body] = match;
    if (!body?.trim()) continue;
    const index = match.index! + match[0].indexOf(body);
    inspectUrl(file, `<${tag!.toLowerCase()}>`, index, body.trim());
  }
}

/** Fenced code blocks: example source that must keep its relative paths. */
function maskedRangesOfFences(markdown: string): [number, number][] {
  const ranges: [number, number][] = [];
  for (const match of markdown.matchAll(/^(?:```|~~~)[^\n]*\n[\s\S]*?(?:^```|~~~)[^\n]*$/gm)) {
    if (match.index !== undefined) ranges.push([match.index, match.index + match[0].length]);
  }
  return ranges;
}

function checkFile(file: string) {
  const text = contents.get(file)!;

  if (file.endsWith(".html")) return checkHtml(file, text);
  if (file.endsWith(".css")) return checkCss(file, text, 0, []);
  if (/\.m?js$/.test(file)) return checkJs(file, text, 0, []);
  if (file.endsWith(".json")) return checkJson(file, text);
  if (file.endsWith(".md") || file.endsWith(".txt")) return checkMarkdown(file, text);
  if (file.endsWith(".xml")) return checkXml(file, text);
}

// --- Structure --------------------------------------------------------------

function checkStructure() {
  if (!files.has("index.html")) {
    report({ kind: "layout", file: "dist/", line: 0, where: "root", href: "", note: "index.html is missing" });
  }

  if (!files.has("404.html")) {
    report({
      kind: "layout",
      file: "dist/",
      line: 0,
      where: "root",
      href: "",
      note: "404.html is missing; GitHub Pages will show its own error page",
    });
  }

  for (const file of files) {
    if (!file.endsWith(".js.map")) continue;
    report({
      kind: "layout",
      file,
      line: 0,
      where: "source map",
      href: "",
      note: 'maps to "../" sources that do not exist once deployed',
    });
  }
}

// --- CLI --------------------------------------------------------------------

if (!(await dirExists(DIST_DIR))) {
  console.error(`${DIST_DIR}/ does not exist. Run \`bun run build\` first.`);
  process.exit(1);
}

for (const file of await walkFiles(DIST_DIR)) {
  files.add(file);
  if (TEXT_EXTENSIONS.has(file.slice(file.lastIndexOf(".")).toLowerCase())) {
    contents.set(file, await Bun.file(join(DIST_DIR, file)).text());
  }
}

for (const file of contents.keys()) checkFile(file);
checkStructure();

// --- Report ----------------------------------------------------------------

const TITLES: Record<Kind, string> = {
  relative: "Relative URLs",
  "local-origin": "Dev-server origins",
  "dead-end": "Dead-end links",
  scaffold: "Missing clean-URL scaffolds",
  layout: "Layout problems",
};
const ORDER: Kind[] = ["relative", "local-origin", "dead-end", "scaffold", "layout"];

for (const kind of ORDER) {
  const group = findings.filter((finding) => finding.kind === kind);
  if (!group.length) continue;

  console.log(`\n${TITLES[kind]} (${group.length})`);

  for (const finding of group.slice(0, 25)) {
    const where = `${finding.file}${finding.line ? `:${finding.line}` : ""}`;
    console.log(`  ${where}  ${finding.note}${finding.href ? `\n    ${finding.where}: ${finding.href}` : ""}`);
  }
  if (group.length > 25) console.log(`  … and ${group.length - 25} more`);
}

console.log(`\nChecked ${contents.size} text files in ${DIST_DIR}/ against ${BASE_URL}`);

if (findings.length) {
  console.log(`\nNot ready for ${BASE_URL}. Run \`bun run deploy:prepare\`, then this again.`);
  process.exit(1);
}

console.log(`\nReady for ${BASE_URL}.`);