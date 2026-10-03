#!/usr/bin/env bun

// Rewrite dist/ so it can be served from a GitHub Pages project subdirectory,
// i.e. https://<user>.github.io/<repo>/ instead of the domain root.
//
// Two things break when a page sits one directory down, and both are fixed here:
// a relative "./assets/app.css" resolves against the wrong base, and a
// root-absolute "/docs" escapes the subdirectory entirely. Both become
// `${baseUrl}/…`.
//
// Covered: HTML (links, assets, inline styles/scripts, srcset, data-* paths),
// CSS (url(), @import), the bundle's own request paths, and the build's
// JSON/text/Markdown outputs.
//
// Absolute URLs left behind by a build with no $SITE_URL are re-pointed in the
// machine-readable manifests only (sitemap.xml, robots.txt, the sitemaps).
// Pages, Markdown and JSON prose are left alone: the docs say
// `http://localhost:3000` when they mean `htmx-ui dev`, and a URL written into
// a sentence is not a link. Code examples inside <pre><code> are likewise kept
// verbatim. `bun run deploy` builds with $SITE_URL set, which is the real fix.
//
// Not covered, on purpose: the dev-only mock endpoints (/api/*), links to the
// original repo and other external sites, and anything that does not resolve to
// a real file in dist/ (see createSiteIndex). Run scripts/check-github-pages.ts
// afterwards to confirm nothing was missed.

import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { DIST } from "./paths.ts";
import {
  createSiteIndex,
  DEFAULT_BASE_URL,
  dirExists,
  fileExists,
  inlineBlockRanges,
  maskedHtmlRanges,
  normalizePath,
  replaceOutside,
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
const KEEP_SOURCEMAPS = flags.includes("--keep-sourcemaps");
const KEEP_CLEAN_URLS = flags.includes("--keep-clean-urls");

/** Every route the build publishes, as absolute URLs. */
function absolute(path: string, suffix: string): string {
  const clean = path === "/" ? "/" : path.replace(/\/+$/, "");
  return `${BASE_URL}${clean}${suffix}`;
}

/**
 * The site's own origin, for a build that had no $SITE_URL and fell back to the
 * dev server. Applied only to the machine-readable manifests whose every URL is
 * generated from that origin — sitemap.xml, robots.txt, the JSON sitemaps.
 *
 * Never applied to pages or Markdown: the docs legitimately mention
 * `http://localhost:3000` when describing `htmx-ui dev`, and rewriting those
 * would change what the documentation says. Build with SITE_URL set instead
 * (`bun run deploy` does), which fixes the origin at the source.
 */
function replaceOrigin(input: string): string {
  return input.replaceAll(LOCAL_ORIGIN, BASE_URL);
}

const LOCAL_ORIGIN = /https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?/g;

// --- Rewriters -------------------------------------------------------------

/** Does this URL name something the build publishes? Set up in main(). */
let owns: (url: string) => boolean = () => false;
let toAbsolute: (url: string) => string | null = () => null;
let toAbsoluteBare: (url: string) => string | null = () => null;

/**
 * `./assets/app.css` in docs/components/button.html resolves against that
 * page's own directory, so the rewriters are rebuilt per file.
 */
function useFileDir(relativePath: string) {
  const dir = relativePath.slice(0, relativePath.lastIndexOf("/") + 1);

  toAbsolute = (url) => {
    if (!owns(url)) return null;
    const { path, suffix } = splitUrl(url);
    if (path.startsWith("/")) return absolute(path, suffix); // root-absolute
    return absolute(`/${normalizePath(`${dir}${path}`)}`, suffix);
  };

  toAbsoluteBare = (url) => {
    // Formats with no "./" to resolve: paths here are already site-rooted.
    if (!url.startsWith("/") || url.startsWith("//") || !owns(url)) return null;
    const { path, suffix } = splitUrl(url);
    return absolute(path, suffix);
  };
}

// --- CSS -------------------------------------------------------------------

function rewriteCssUrls(input: string): string {
  return input.replace(
    /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)'"\s]*))\s*\)/gi,
    (match, double?: string, single?: string, bare?: string) => {
      const url = double ?? single ?? bare ?? "";
      const next = toAbsolute(url);
      if (!next) return match;
      const quote = double !== undefined ? '"' : single !== undefined ? "'" : "";
      return `url(${quote}${next}${quote})`;
    },
  );
}

function rewriteCssImports(input: string): string {
  return input.replace(
    /(@import\s+)(?:"([^"]*)"|'([^']*)')/gi,
    (match, head: string, double?: string, single?: string) => {
      const next = toAbsolute(double ?? single ?? "");
      if (!next) return match;
      return `${head}${double !== undefined ? '"' : "'"}${next}${double !== undefined ? '"' : "'"}`;
    },
  );
}

// --- JS --------------------------------------------------------------------

/**
 * Only paths the build actually publishes, e.g. `fetch("/sitemap.json")` in the
 * search palette. The bare `"/"` is skipped on purpose: it names the site root
 * rather than a file, and in this bundle it is the search shortcut's keystroke.
 */
function rewriteJsPaths(input: string): string {
  return input.replace(QUOTED_ROOT_PATH, (match, quote: string, path: string) => {
    if (path === "/") return match;
    const next = toAbsolute(path);
    return next ? `${quote}${next}${quote}` : match;
  });
}

// --- HTML ------------------------------------------------------------------

/** Attributes whose value is a single URL. */
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

/** Attributes whose value is a comma-separated candidate list. */
const SRCSET_ATTRS = new Set(["imagesrcset", "srcset"]);

/** `srcset="a.png 1x, b.png 2x"` -> each candidate's absolute form. */
function rewriteSrcset(value: string): string {
  return value
    .split(",")
    .map((candidate) => {
      const url = candidate.trim().split(/\s+/)[0] ?? "";
      if (!url) return candidate;
      const next = toAbsolute(url);
      if (!next) return candidate;
      return candidate.replace(url, next);
    })
    .join(", ");
}

/** `content="…"` holds a URL only on link-ish meta tags. */
function metaHoldsUrl(tag: string): boolean {
  const key = tag.match(/\b(?:property|name|itemprop)\s*=\s*"([^"]*)"/i)?.[1] ?? "";
  return /(?:^|:)(?:og|image|canonical|url)$/i.test(key);
}

/**
 * Rewrites every URL-bearing attribute of one tag. Double-quoted, single-quoted
 * and bare values are all handled, so hand-written markup is covered too, and
 * the original quoting is kept — `'` inside a URL must not become `"`.
 */
function rewriteTagUrls(tag: string): string {
  return tag.replace(
    /([:@a-zA-Z_][-.:\w]*)(\s*=\s*)("[^"]*"|'[^']*'|[^\s"'`=<>]+)/g,
    (match, name: string, eq: string, raw: string) => {
      const attribute = name.toLowerCase();
      const quote = raw[0] === '"' || raw[0] === "'" ? raw[0] : "";
      const value = quote ? raw.slice(1, -1) : raw;
      let next = value;

      if (attribute === "content" ? metaHoldsUrl(tag) : URL_ATTRS.has(attribute)) {
        next = toAbsolute(value) ?? value;
      } else if (SRCSET_ATTRS.has(attribute)) {
        next = rewriteSrcset(value);
      } else if (attribute === "style") {
        next = rewriteCssUrls(value);
      } else if (attribute.startsWith("data-")) {
        // data-markdown-copy="/docs/x.md", data-versions-src="/docs/versions.json"
        next = toAbsolute(value) ?? value;
      }

      if (next === value) return match;
      return `${name}${eq}${quote}${next}${quote}`;
    },
  );
}

/**
 * One unmasked slice of the document. Everything happens per slice so that
 * offsets from maskedHtmlRanges stay valid as text is replaced.
 */
function rewriteChunk(chunk: string): string {
  let out = chunk.replace(/<[a-zA-Z][^>]*>/g, (tag) => rewriteTagUrls(tag));

  // Inline <style> / <script> bodies; their opening tags went through above.
  for (const tag of ["style", "script"] as const) {
    out = replaceOutside(out, inlineBlockRanges(out, tag), (body) =>
      tag === "style" ? rewriteCssUrls(body) : rewriteJsPaths(body),
    );
  }

  // url() can wrap across a tag boundary in a style="" value; sweep the rest.
  return rewriteCssUrls(out);
}

function rewriteHtml(html: string): string {
  return replaceOutside(html, maskedHtmlRanges(html), rewriteChunk);
}

// --- JSON ------------------------------------------------------------------

/**
 * The build's JSON manifests hold plain URL strings next to documentation prose:
 * sitemap.json quotes the pages it indexes, dev-server mention included. Only a
 * value that is itself a URL is re-origined, so a sentence stays a sentence.
 */
function rewriteJsonValue(node: unknown): unknown {
  if (typeof node === "string") {
    return toAbsoluteBare(node) ?? (/\s/.test(node) ? node : replaceOrigin(node));
  }
  if (Array.isArray(node)) return node.map(rewriteJsonValue);
  if (node && typeof node === "object") {
    return Object.fromEntries(
      Object.entries(node).map(([key, value]) => [key, rewriteJsonValue(value)]),
    );
  }
  return node;
}

// --- Markdown & text -------------------------------------------------------

/** Fenced code blocks: regions that must keep their example source verbatim. */
function maskedFences(markdown: string): [number, number][] {
  const ranges: [number, number][] = [];
  const fence = /^(?:```|~~~)[^\n]*\n[\s\S]*?(?:^```|~~~)[^\n]*$/gm;
  for (const match of markdown.matchAll(fence)) {
    if (match.index !== undefined) ranges.push([match.index, match.index + match[0].length]);
  }
  return ranges;
}

/** Markdown links and images, plus the frontmatter's url: fields. */
function rewriteMarkdown(input: string): string {
  let out = input.replace(/^(---\n[\s\S]*?\n---)/, (block) =>
    block.replace(
      /^(\s*[\w-]+:\s*)(["']?)(.*?)\2$/gm,
      (match, head: string, quote: string, value: string) =>
        `${head}${quote}${(toAbsoluteBare(value) ?? toAbsolute(value)) ?? value}${quote}`,
    ),
  );

  return replaceOutside(out, maskedFences(out), (chunk) =>
    chunk.replace(
      /(!?\[[^\]]*\])\(\s*<?([^)\s>]+)>?(?:\s+(?:"[^"]*"|'[^']*'))?\s*\)/g,
      (match, label: string, url: string) => {
        const next = toAbsoluteBare(url) ?? toAbsolute(url);
        return next ? `${label}(${next})` : match;
      },
    ),
  );
}

// --- Files -----------------------------------------------------------------

/** `file` is relative to DIST_DIR; relative references resolve against it. */
async function rewriteFile(file: string): Promise<boolean> {
  const extension = file.slice(file.lastIndexOf(".")).toLowerCase();
  const path = join(DIST_DIR, file);
  const original = await readFile(path, "utf8");
  let content = original;

  useFileDir(file);

  if (extension === ".html") content = rewriteHtml(content);
  else if (extension === ".css") content = rewriteCssImports(rewriteCssUrls(content));
  else if (extension === ".js" || extension === ".mjs") content = rewriteJsPaths(content);
  else if (extension === ".json") content = JSON.stringify(rewriteJsonValue(JSON.parse(original)), null, 2);
  else if (extension === ".md" || extension === ".txt") content = rewriteMarkdown(content);
  else if (extension === ".xml") content = replaceOrigin(original);
  else if (file === "robots.txt") content = replaceOrigin(original);

  if (content === original) return false;
  await writeFile(path, content);
  return true;
}

/**
 * GitHub Pages has no rewrite rules, so /docs/components/button only resolves
 * if a file sits at that path. One copy per page is what makes every
 * extensionless link the build already emits work.
 */
async function createCleanUrls(files: string[]): Promise<number> {
  let created = 0;

  for (const file of files) {
    const name = file.split("/").pop();
    // `index.html` is already its own clean route; `404.html` is not a route.
    if (!file.endsWith(".html") || name === "index.html" || name === "404.html") continue;

    const route = file.slice(0, -".html".length);
    await mkdir(join(DIST_DIR, route), { recursive: true });
    await cp(join(DIST_DIR, file), join(DIST_DIR, route, "index.html"));
    created++;
  }

  return created;
}

/** GitHub Pages serves this for unknown paths instead of its own 404. */
async function createNotFound(): Promise<boolean> {
  const home = join(DIST_DIR, "index.html");
  if (await fileExists(join(DIST_DIR, "404.html"))) return false;
  if (!(await fileExists(home))) return false;

  const html = await readFile(home, "utf8");
  const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1];
  if (!body) return false;

  await writeFile(
    join(DIST_DIR, "404.html"),
    `<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="utf-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1" />\n    <title>Page not found · HTMX UI</title>\n    <link rel="canonical" href="${BASE_URL}/" />\n  </head>\n  <body>\n${body}\n  </body>\n</html>\n`,
  );
  return true;
}

/** Source maps point at `../…` sources that do not exist once deployed. */
async function dropSourceMaps(files: string[]): Promise<number> {
  let dropped = 0;

  for (const file of files) {
    if (file.endsWith(".js.map")) {
      await rm(join(DIST_DIR, file));
      dropped++;
    } else if (/\.m?js$/.test(file)) {
      const path = join(DIST_DIR, file);
      const source = await readFile(path, "utf8");
      const stripped = source.replace(/^[ \t]*\/\/#\s*sourceMappingURL=\S*[ \t]*$/gm, "");
      if (stripped !== source) await writeFile(path, stripped);
    }
  }

  return dropped;
}

// --- CLI -------------------------------------------------------------------

async function main() {
  if (!(await dirExists(DIST_DIR))) {
    console.error(`${DIST_DIR}/ does not exist. Run \`bun run build\` first.`);
    process.exit(1);
  }

  const files = await walkFiles(DIST_DIR);

  // The rewrite gate has to recognise the extensionless copies before they
  // exist, so seed the index with the routes they will provide.
  const published = new Set(files);
  for (const file of files.filter((name) => name.endsWith(".html"))) {
    published.add(`${file.slice(0, -".html".length)}/index.html`);
  }

  ({ owns } = createSiteIndex(published));

  let rewritten = 0;
  for (const file of files) {
    if (!TEXT_EXTENSIONS.has(file.slice(file.lastIndexOf(".")).toLowerCase())) continue;
    if (await rewriteFile(file)) rewritten++;
  }
  console.log(`Rewritten: ${rewritten}/${files.length} files.`);

  const current = await walkFiles(DIST_DIR);

  if (KEEP_CLEAN_URLS) {
    console.log("Clean URLs: skipped (--keep-clean-urls).");
  } else {
    console.log(`Clean URLs: ${await createCleanUrls(current)} page copies for extensionless routes.`);
  }

  if (await createNotFound()) console.log("404.html: created.");

  if (KEEP_SOURCEMAPS) {
    console.log("Source maps: kept (--keep-sourcemaps).");
  } else {
    console.log(`Source maps: dropped ${await dropSourceMaps(await walkFiles(DIST_DIR))}.`);
  }

  console.log(`\nPrepared ${DIST_DIR}/ for GitHub Pages at ${BASE_URL}`);
  console.log("Next: bun run deploy:check");
}

await main();