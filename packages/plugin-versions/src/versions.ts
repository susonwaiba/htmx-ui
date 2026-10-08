// Versioned docs.
//
// The latest docs are rendered from pages/<prefix> and served at <prefix>/...
// Older versions are frozen *built* snapshots in <archive>/v<id>/, served at
// <prefix>/v<id>/... Freezing the built HTML/CSS/JS (rather than re-rendering old
// source) means later changes to components or layouts can never break old docs.
//
//   data/versions.json            the list of versions; "latest" is rendered live
//   archive/v0.1/...              snapshot: pages, Markdown, _assets/ (CSS, JS, images)
//   archive/v0.1.md               Markdown of the version's <prefix> page
//   archive/v0.1/pages.json       page paths in that version (for the version switcher)
//   <prefix>/versions.json        published manifest the switcher reads at runtime
//
// A snapshot's pages get an "old version" banner baked in (bannerMarkup), so it shows
// without JavaScript; the client (./client.ts) refreshes it from the manifest, which
// also teaches snapshots about versions released after them.
//
// The version being worked on is not numbered yet: it is listed as "next" until
// `htmx-ui versions:name <x.y.z>` (nameVersion) names it at release time. Its id never
// reaches a URL, because the latest docs are served at <prefix>/... and only *archived*
// versions get a <prefix>/v<id>/ prefix. `htmx-ui versions:archive` (archiveDocs, then
// startNext) snapshots the latest version and starts a new "next".
//
// node: APIs and editHtml() only: this runs in the config, which Node loads under Vite.

import { editHtml, routeFor } from "htmx-ui-engine";
import { existsSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, posix, relative, resolve, sep } from "node:path";

export type VersionEntry = { id: string; label: string; released?: string; archived?: boolean };
export type Version = VersionEntry & { path: string; latest: boolean };
export type VersionsFile = { latest: string; versions: VersionEntry[] };

/** One version in the published manifest (<prefix>/versions.json). */
export type ManifestVersion = {
  id: string;
  label: string;
  released: string | null;
  path: string;
  latest: boolean;
  /** The version's own sitemap (search index), published by htmx-ui-plugin-docs. */
  sitemap: string;
  /** Page paths relative to `path`: "", "/installation", "/components/button". */
  pages: string[];
};
export type Manifest = { latest: string; versions: ManifestVersion[] };

/** Id of the docs version being worked on, before its release number is known. */
export const NEXT_VERSION = "next";

/** Display name of a version: "next" for the one in development, "v0.2" once numbered. */
export const versionLabel = (id: string) => (id === NEXT_VERSION ? NEXT_VERSION : `v${id}`);

/** The docs version a release belongs to: "0.2.0" -> "0.2" before 1.0, "1.4.2" -> "1" after. "0.2" or "3" as given. */
export function versionId(version: string): string {
  if (/^\d+(\.\d+)?$/.test(version)) return version;
  const m = /^(\d+)\.(\d+)\.\d+(?:[-+].*)?$/.exec(version);
  if (!m) throw new Error(`[versions] "${version}" is not a version: use x.y.z (or the docs version itself, x.y or x)`);
  return Number(m[1]) >= 1 ? m[1]! : `${m[1]}.${m[2]}`;
}

const readJson = async <T>(file: string): Promise<T> => JSON.parse(await readFile(file, "utf8"));

async function write(file: string, body: string) {
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, body);
}

export async function readVersionsFile(file: string): Promise<VersionsFile> {
  return readJson(file);
}

export async function writeVersionsFile(file: string, data: VersionsFile): Promise<void> {
  await write(file, JSON.stringify(data, null, 2) + "\n");
}

/** URL prefix of a version's docs: "/docs" for latest, "/docs/v0.1" for archived ones. */
export const versionPath = (v: VersionEntry, latest: string, prefix = "/docs") => (v.id === latest ? prefix : `${prefix}/v${v.id}`);

export async function loadVersions(file: string, prefix = "/docs"): Promise<{ latest: string; versions: Version[] }> {
  const data = await readVersionsFile(file);
  return {
    latest: data.latest,
    versions: data.versions.map((v) => ({ ...v, path: versionPath(v, data.latest, prefix), latest: v.id === data.latest })),
  };
}

/**
 * Manifest published at <prefix>/versions.json. `pages` are paths relative to the
 * version's root ("", "/installation", "/components/button") so the switcher can
 * keep the reader on the same page when it exists in the other version.
 */
export async function versionsManifest(latestDocsUrls: string[], archive: string, file: string, prefix = "/docs"): Promise<Manifest> {
  const { latest, versions } = await loadVersions(file, prefix);
  const list = await Promise.all(
    versions.map(async (v) => {
      const pages = v.latest
        ? latestDocsUrls.map((u) => u.slice(prefix.length))
        : await readJson<string[]>(join(archive, `v${v.id}`, "pages.json")).catch(() => [] as string[]);
      return { id: v.id, label: v.label, released: v.released ?? null, path: v.path, latest: v.latest, sitemap: `${v.path}/sitemap.json`, pages };
    }),
  );
  return { latest, versions: list };
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** File in the archive for a request path under <prefix>/v<id>/, or null. */
export function archiveFile(pathname: string, archive: string, prefix = "/docs"): string | null {
  const m = new RegExp(`^${escapeRe(prefix)}\\/(v[^/]+?)(\\.md|\\/.*)?$`).exec(pathname);
  if (!m) return null;
  const rest = m[2] ?? "";
  const candidates =
    rest === ".md"
      ? [join(archive, `${m[1]}.md`)]
      : rest === "" || rest === "/"
        ? [join(archive, m[1]!, "index.html")]
        : [join(archive, m[1]!, rest), join(archive, m[1]!, `${rest}.html`), join(archive, m[1]!, rest, "index.html")];
  for (const file of candidates) {
    if (!resolve(file).startsWith(resolve(archive) + sep)) return null;
    if (existsSync(file) && statSync(file).isFile()) return file;
  }
  return null;
}

// ----------------------------------------------------------------------------
// Naming and archiving versions (the plugin's CLI commands)

/**
 * Name the version in development: "next" becomes `id`, dated `date`. Refuses when
 * the latest version is already numbered or `id` exists. Returns the new file.
 */
export function nameVersion(data: VersionsFile, id: string, date = new Date().toISOString().slice(0, 10)): VersionsFile {
  if (data.latest !== NEXT_VERSION) throw new Error(`[versions] the latest docs version is "${data.latest}", not "${NEXT_VERSION}"; nothing to name`);
  if (data.versions.some((v) => v.id === id)) throw new Error(`[versions] version ${id} already exists`);
  return {
    ...data,
    latest: id,
    versions: data.versions.map((v) => (v.id === NEXT_VERSION ? { id, label: versionLabel(id), released: date } : v)),
  };
}

/** After archiving the latest version: mark it archived and open a new "next" as the latest. */
export function startNext(data: VersionsFile): VersionsFile {
  if (data.latest === NEXT_VERSION) throw new Error(`[versions] "${NEXT_VERSION}" has no release number yet; name it first with "htmx-ui versions:name <x.y.z>"`);
  if (data.versions.some((v) => v.id === NEXT_VERSION)) throw new Error(`[versions] there is already a "${NEXT_VERSION}" version; it must be the latest one`);
  return {
    ...data,
    latest: NEXT_VERSION,
    versions: [{ id: NEXT_VERSION, label: NEXT_VERSION }, ...data.versions.map((v) => (v.id === data.latest ? { ...v, archived: true } : v))],
  };
}

/** Attributes that may hold URLs to rewrite. */
const URL_ATTRS = ["href", "src", "poster", "data-clipboard-url", "data-markdown-copy"];

/** Files pages reference (chunks, styles, images). Everything else is a page or an index. */
const isAsset = (name: string) => !/\.(html|md|txt|xml|json|map)$/.test(name);

/**
 * Rewrite a URL found in an archived page.
 *   /docs/...          -> /docs/v<id>/...   (stay inside the snapshot)
 *   ../assets/x.css    -> /docs/v<id>/_assets/x.css   (also ../chunk-x.css from older builds)
 * Left alone: other versions (/docs/v...), /docs/versions.json, other paths, external URLs.
 */
export function rewriteUrl(value: string, id: string, fileDir: string, assets: Set<string>, prefix = "/docs"): string {
  const docs = new RegExp(`^${escapeRe(prefix)}(?=$|[/.?#])(.*)$`).exec(value);
  if (docs) {
    if (/^\/v[^/]/.test(docs[1]!) || docs[1] === "/versions.json") return value;
    return `${prefix}/v${id}${docs[1]}`;
  }
  if (/^([a-z][a-z0-9+.-]*:|\/|#)/i.test(value) || !value) return value;
  const [path, suffix = ""] = value.split(/(?=[?#])/);
  const target = posix.normalize(posix.join(fileDir, path!));
  return assets.has(target) ? `${prefix}/v${id}/_assets/${posix.basename(target)}${suffix}` : value;
}

/** Rewrite docs links in Markdown links and frontmatter (code blocks are left alone). */
export function rewriteMarkdown(md: string, id: string, prefix = "/docs"): string {
  const fix = (url: string) => rewriteUrl(url, id, "", new Set(), prefix);
  return md
    .replace(/^(url: ")([^"]*)"/m, (_, a, url) => `${a}${fix(url)}"`)
    .replace(/(\]\()([^)\s]+)/g, (_, a, url) => `${a}${fix(url)}`);
}

/** The same escaping as Bun.escapeHTML, on both runtimes. */
const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#x27;" })[c]!);

/**
 * The "you are reading an old version" banner, as a whole element. Archived pages get
 * it at build time, classes included, so it is styled on first paint; the client
 * (./client.ts) reuses the element when it refreshes the banner from the manifest, so
 * both must render exactly this markup.
 */
export function bannerMarkup(current: string, latest: string, href: string): string {
  const label = escapeHtml(latest);
  return (
    `<div class="alert alert-warning mb-8" role="status" data-version-banner data-md-skip>` +
    warningIcon() +
    `<div class="alert-title">You're viewing the docs for ${escapeHtml(current)}.</div>` +
    `<div class="alert-description">The latest version is ${label}. ` +
    `<a class="link" href="${escapeHtml(href)}" hx-boost="false">Go to this page in ${label}</a>.</div></div>`
  );
}

let icon: string | undefined;
/** htmx-ui's alert-triangle icon, as icon() inlines it (decorative), or "" when htmx-ui can't be found. */
function warningIcon(): string {
  if (icon === undefined) {
    try {
      const file = createRequire(import.meta.url).resolve("htmx-ui/icons/alert-triangle.svg");
      icon = readFileSync(file, "utf8").trim().replace("<svg ", '<svg class="size-4" aria-hidden="true" ');
    } catch {
      icon = "";
    }
  }
  return icon;
}

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

/**
 * Snapshot the docs of a finished build (`dist`) as version `id` into `archive`.
 * `newer` is the version that will be current once this one is archived: each frozen
 * page gets a banner pointing at the same page there. Returns the archived page paths.
 */
export async function archiveDocs({
  dist,
  id,
  newer,
  archive,
  prefix = "/docs",
}: {
  dist: string;
  id: string;
  newer?: { label: string; path: string };
  archive: string;
  prefix?: string;
}) {
  // A snapshot's id becomes a URL (<prefix>/v<id>/), so it must be a real version.
  if (id === NEXT_VERSION) throw new Error(`[versions] "${NEXT_VERSION}" has no release number; name it with "htmx-ui versions:name <x.y.z>"`);
  const out = join(archive, `v${id}`);
  if (existsSync(join(out, "index.html"))) throw new Error(`[versions] ${out} already exists`);
  await rm(out, { recursive: true, force: true });
  await mkdir(join(out, "_assets"), { recursive: true });

  // Shared assets (code-split chunks, CSS, hashed images) live in dist/assets/ (the
  // engine's layout; dist/assets/icons/ is an unhashed copy and stays out) or, in
  // older builds, at the dist root. Names are content-hashed, so they flatten into _assets/.
  const files = async (dir: string, at = "") =>
    existsSync(dir) ? (await readdir(dir, { withFileTypes: true })).filter((e) => e.isFile() && isAsset(e.name)).map((e) => at + e.name) : [];
  const assets = new Set([...(await files(dist)), ...(await files(join(dist, "assets"), "assets/"))]);
  for (const path of assets) await cp(join(dist, path), join(out, "_assets", posix.basename(path)));

  const name = prefix.slice(1); // "docs"
  const docsDir = join(dist, name);
  const pages: string[] = [];
  const docFiles = [...(await walk(docsDir)), join(dist, `${name}.md`)];

  // The build's docs sitemap lists the live pages, so a frozen page can link to the
  // same page in the newer version when it still exists there.
  const sitemapFile = join(docsDir, "sitemap.json");
  const sitemap = existsSync(sitemapFile) ? await readJson<{ url: string; pages: { url: string; markdown: string | null }[] }>(sitemapFile) : null;
  const livePages = sitemap ? sitemap.pages.map((p) => p.url.slice(prefix.length)) : [];
  const label = versionLabel(id);

  for (const file of docFiles) {
    if (!existsSync(file)) continue;
    const rel = relative(docsDir, file).split(sep).join("/"); // "components/button.html", "../docs.md"
    if (/^v[^/]/.test(rel) || rel === "versions.json") continue; // older snapshots and the manifest are not part of this version
    const target = rel === `../${name}.md` ? join(archive, `v${id}.md`) : join(out, rel);
    const route = routeFor(rel); // "/" or "/components/button", relative to the version root

    if (file.endsWith(".html")) {
      const fileDir = posix.dirname(relative(dist, file).split(sep).join("/"));
      const sub = route === "/" ? "" : route;
      const frozen = editHtml(await readFile(file, "utf8"), {
        element(el) {
          // The old-version banner, baked in so it needs no JavaScript.
          if (newer && el.hasAttribute("data-version-banner")) {
            el.replace(bannerMarkup(label, newer.label, newer.path + (livePages.includes(sub) ? sub : "")));
            return;
          }
          // Old versions shouldn't compete with the latest docs in search results
          if (el.tagName === "head") el.append('<meta name="robots" content="noindex" />');
          // A snapshot ships its own theme, CSS and scripts, so nothing inside it may be
          // boosted into the live site (the logo, the footer, the sidebar's Versions link,
          // any content link): the body opts out for every link it contains. The version
          // links carry the flag explicitly too, for the case where the body is rewritten.
          if (el.tagName === "body") {
            el.removeAttribute("hx-boost:inherited");
            if (!el.hasAttribute("hx-boost")) el.setAttribute("hx-boost", "false");
          }
          if (el.hasAttribute("data-version-link")) {
            // The switcher's links point across versions, so the URL rewriting below leaves
            // them alone — and they must never be boosted: a snapshot ships its own theme
            // and scripts, so crossing versions is a full page load.
            if (el.tagName === "a" && !el.hasAttribute("hx-boost")) el.setAttribute("hx-boost", "false");
            return;
          }
          for (const attr of URL_ATTRS) {
            const value = el.getAttribute(attr);
            if (value === null) continue;
            const fixed = rewriteUrl(value, id, fileDir, assets, prefix);
            if (fixed !== value) el.setAttribute(attr, fixed);
          }
        },
      });
      await write(target, frozen);
      pages.push(sub);
    } else if (file.endsWith(".md")) {
      await write(target, rewriteMarkdown(await readFile(file, "utf8"), id, prefix));
    }
  }

  pages.sort();
  await write(join(out, "pages.json"), JSON.stringify(pages, null, 2) + "\n");

  // The version's own sitemap (search index): the build's docs sitemap with URLs moved under <prefix>/v<id>
  if (sitemap) {
    const map = structuredClone(sitemap) as typeof sitemap & { version: string };
    const fix = (url: string | null) => (url ? rewriteUrl(url, id, "", new Set(), prefix) : url);
    map.version = id;
    map.pages = map.pages.map((p) => ({ ...p, url: fix(p.url)!, absoluteUrl: map.url + fix(p.url), markdown: fix(p.markdown) }));
    await write(join(out, "sitemap.json"), JSON.stringify(map, null, 2) + "\n");
  }
  return pages;
}
