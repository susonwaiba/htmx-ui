// Scripts and stylesheets in pages a server renders itself: site.render(), and
// handle() in development (./site.ts).
//
// A template links its scripts and stylesheets as source files,
//   <script type="module" src="{{ asset('app.ts') }}"></script>
// which is what a bundler wants, and a page the build wrote links the bundles made
// from them instead. A page rendered at request time only has the source links, so
// they are swapped for:
//   - production: the tags the build wrote for the same sources, from the manifest
//     `htmx-ui build` leaves in dist/ (MANIFEST);
//   - development: bundles made from the sources on request, never written to disk
//     (./dev.ts).
//
// The sources of a page are its <script src> and <link rel="stylesheet"> tags with a
// root-absolute URL (what asset() returns by default) of a script or stylesheet file.
// A page's sources are bundled together, as the build bundles a page, so the key for
// a page is all of them.
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import { editHtml } from "./html";

/** Where `htmx-ui build` writes the manifest, relative to the output directory. */
export const MANIFEST = ".htmx-ui/manifest.json";

export interface Manifest {
  version: 1;
  /** Sources (root-relative paths, joined by KEY_SEP) -> the tags the build wrote for them. */
  pages: Record<string, string>;
}

export const KEY_SEP = "|";

const SCRIPT = /\.(?:[cm]?[jt]sx?)$/;
const STYLE = /\.css$/;
const posix = (p: string) => p.split(sep).join("/");
const isLocal = (url: string) => /^\/(?!\/)/.test(url);
const pathOf = (url: string) => decodeURIComponent(url.split(/[?#]/)[0]!);

/** The URL a source tag links, and what kind of source it is; null for anything else. */
function sourceUrl(el: { tagName: string; getAttribute(name: string): string | null }): { url: string; kind: "script" | "style" } | null {
  if (el.tagName === "script") {
    const src = el.getAttribute("src");
    return src && isLocal(src) && SCRIPT.test(pathOf(src)) ? { url: src, kind: "script" } : null;
  }
  if (el.tagName === "link" && el.getAttribute("rel")?.toLowerCase() === "stylesheet") {
    const href = el.getAttribute("href");
    return href && isLocal(href) && STYLE.test(pathOf(href)) ? { url: href, kind: "style" } : null;
  }
  return null;
}

/** A source URL ("/app.ts") as the root-relative path it names ("app.ts"). */
export const sourcePath = (url: string) => pathOf(url).replace(/^\/+/, "");

/**
 * Replace a page's source tags with `tags(sources)`: the first source tag becomes the
 * new tags, the rest go. `accept` says which root-relative paths are sources; a page
 * with none, or whose `tags()` is null, comes back unchanged.
 */
export function swapAssets(html: string, accept: (path: string) => boolean, tags: (sources: string[]) => string | null): string {
  const sources: string[] = [];
  editHtml(html, {
    element(el) {
      const found = sourceUrl(el);
      if (found && accept(sourcePath(found.url))) sources.push(sourcePath(found.url));
    },
  });
  if (!sources.length) return html;
  const replacement = tags([...new Set(sources)]);
  if (replacement === null) return html;
  let first = true;
  return editHtml(html, {
    element(el) {
      const found = sourceUrl(el);
      if (!found || !accept(sourcePath(found.url))) return;
      el.replace(first ? replacement : "");
      first = false;
    },
  });
}

/** The manifest key for a page's sources. */
export const manifestKey = (sources: string[]) => sources.join(KEY_SEP);

/**
 * A page's sources as the bundler sees it: rendered with asset() URLs relative to the
 * page file. Root-relative paths, in document order; public files are not sources.
 */
export function pageSources(html: string, page: string, root: string, publicDir: string | null): string[] {
  const found: string[] = [];
  editHtml(html, {
    element(el) {
      const tag =
        el.tagName === "script" ? el.getAttribute("src") : el.tagName === "link" && el.getAttribute("rel")?.toLowerCase() === "stylesheet" ? el.getAttribute("href") : null;
      if (!tag || /^[a-z][a-z\d+.-]*:|^\/\//i.test(tag)) return;
      const path = pathOf(tag);
      if (!(el.tagName === "script" ? SCRIPT : STYLE).test(path)) return;
      // A root-absolute link to a file in public/ is that file, copied as-is: not a source.
      if (path.startsWith("/") && publicDir && existsSync(resolve(publicDir, "." + path))) return;
      const file = path.startsWith("/") ? resolve(root, "." + path) : resolve(dirname(page), path);
      if (file.startsWith(root + sep)) found.push(posix(relative(root, file)));
    },
  });
  return [...new Set(found)];
}

/**
 * The bundled script, stylesheet and modulepreload tags of a built page, with
 * root-absolute URLs so they work in a page served at any route. Tags linking
 * outside the output directory, or to a copied public file, are not the build's.
 */
export function builtTags(file: string, outDir: string, publicDir: string | null): string {
  const html = readFileSync(file, "utf8");
  const tags: string[] = [];
  const url = (link: string) => {
    if (/^[a-z][a-z\d+.-]*:|^\/\//i.test(link)) return null;
    const cut = link.search(/[?#]/);
    const path = cut < 0 ? link : link.slice(0, cut);
    const rest = cut < 0 ? "" : link.slice(cut);
    const target = path.startsWith("/") ? resolve(outDir, "." + path) : resolve(dirname(file), path);
    if (!target.startsWith(outDir + sep)) return null;
    const rel = posix(relative(outDir, target));
    if (publicDir && existsSync(resolve(publicDir, rel))) return null;
    return "/" + rel + rest;
  };
  editHtml(html, {
    element(el) {
      const rel = el.getAttribute("rel")?.toLowerCase();
      if (el.tagName === "script" && el.getAttribute("src")) {
        const src = url(el.getAttribute("src")!);
        if (src) tags.push(`<script type="module" crossorigin src="${src}"></script>`);
      } else if (el.tagName === "link" && (rel === "stylesheet" || rel === "modulepreload")) {
        const href = url(el.getAttribute("href") ?? "");
        if (href) tags.push(`<link rel="${rel}" crossorigin href="${href}">`);
      }
    },
  });
  return tags.join("");
}

/**
 * Write the manifest for a finished build. `pages` are the rendered source of each
 * page (its sources) and the built file for it.
 */
export function writeManifest(outDir: string, publicDir: string | null, pages: { sources: string[]; built: string }[]): void {
  const manifest: Manifest = { version: 1, pages: {} };
  for (const { sources, built } of pages) {
    if (!sources.length || !existsSync(built)) continue;
    const key = manifestKey(sources);
    if (!(key in manifest.pages)) manifest.pages[key] = builtTags(built, outDir, publicDir);
  }
  const file = resolve(outDir, MANIFEST);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(manifest, null, 2) + "\n");
}

/** The manifest of a build, or null when there is none. */
export function readManifest(outDir: string): Manifest | null {
  try {
    return JSON.parse(readFileSync(resolve(outDir, MANIFEST), "utf8")) as Manifest;
  } catch {
    return null;
  }
}

/**
 * The built tags for a page's sources: the build's own for exactly these sources,
 * else each source's tags from a page that had it alone. Null when a source was in
 * no built page on its own, since half a page's scripts is worse than a clear miss.
 */
export function manifestTags(manifest: Manifest, sources: string[]): string | null {
  const exact = manifest.pages[manifestKey(sources)];
  if (exact !== undefined) return exact;
  const parts = sources.map((s) => manifest.pages[s]);
  if (parts.some((p) => p === undefined)) return null;
  // Separate bundles can share chunks: keep each tag once.
  const seen = new Set<string>();
  return parts
    .flatMap((p) => p!.match(/<[^>]+>(?:<\/script>)?/g) ?? [])
    .filter((t) => !seen.has(t) && seen.add(t))
    .join("");
}
