// Versioned docs.
//
// The latest docs are rendered from site/pages/docs and served at /docs/...
// Older versions are frozen *built* snapshots in site/archive/v<id>/, served at
// /docs/v<id>/... Freezing the built HTML/CSS/JS (rather than re-rendering old
// source) means later changes to components or layouts can never break old docs.
//
//   site/data/versions.json        the list of versions; "latest" is rendered live
//   site/archive/v0.1/...          snapshot: pages, Markdown, _assets/ (CSS, JS, images)
//   site/archive/v0.1.md           Markdown of the version's /docs page
//   site/archive/v0.1/pages.json   page paths in that version (for the version switcher)
//   /docs/versions.json            published manifest the switcher reads at runtime
//
// A snapshot's pages get an "old version" banner baked in (bannerHtml), so it shows
// without JavaScript; site/features/versions.ts refreshes it from the manifest, which
// also teaches snapshots about versions released after them.
//
// The version being worked on is not numbered yet: it is listed as "next" until
// `bun run version:set <x.y>` (scripts/version.ts) names it at release time. Its id
// never reaches a URL, because the latest docs are served at /docs/... and only
// *archived* versions get a /docs/v<id>/ prefix.
//
// `bun run docs:archive` (scripts/archive.ts) snapshots the latest version and starts a
// new "next". `bun run version:set <x.y>` names it.

import { existsSync } from "node:fs";
import { cp, mkdir, readdir, rm } from "node:fs/promises";
import { dirname, join, posix, relative, resolve, sep } from "node:path";
import { ARCHIVE, SITE } from "./paths";
import { routeFor } from "htmx-ui-engine";

export type VersionEntry = { id: string; label: string; released?: string; archived?: boolean };
export type Version = VersionEntry & { path: string; latest: boolean };

/** Id of the docs version being worked on, before its release number is known. */
export const NEXT_VERSION = "next";

/** Display name of a version: "next" for the one in development, "v0.2" once numbered. */
export const versionLabel = (id: string) => (id === NEXT_VERSION ? NEXT_VERSION : `v${id}`);

const VERSIONS_FILE = resolve(SITE, "data/versions.json");

export async function readVersionsFile(file = VERSIONS_FILE): Promise<{ latest: string; versions: VersionEntry[] }> {
  return Bun.file(file).json();
}

/** URL prefix of a version's docs: "/docs" for latest, "/docs/v0.1" for archived ones. */
export const versionPath = (v: VersionEntry, latest: string) => (v.id === latest ? "/docs" : `/docs/v${v.id}`);

export async function loadVersions(file = VERSIONS_FILE): Promise<{ latest: string; versions: Version[] }> {
  const data = await readVersionsFile(file);
  return {
    latest: data.latest,
    versions: data.versions.map((v) => ({ ...v, path: versionPath(v, data.latest), latest: v.id === data.latest })),
  };
}

/**
 * Manifest published at /docs/versions.json. `pages` are paths relative to the
 * version's root ("", "/installation", "/components/button") so the switcher can
 * keep the reader on the same page when it exists in the other version.
 */
export async function versionsManifest(latestDocsUrls: string[], archive = ARCHIVE, file = VERSIONS_FILE) {
  const { latest, versions } = await loadVersions(file);
  const list = await Promise.all(
    versions.map(async (v) => {
      const pages = v.latest
        ? latestDocsUrls.map((u) => u.slice("/docs".length))
        : await Bun.file(join(archive, `v${v.id}`, "pages.json"))
            .json()
            .catch(() => [] as string[]);
      return { id: v.id, label: v.label, released: v.released ?? null, path: v.path, latest: v.latest, sitemap: `${v.path}/sitemap.json`, pages };
    }),
  );
  return { latest, versions: list };
}

/** File in the archive for a request path under /docs/v<id>/, or null. */
export async function archiveFile(pathname: string, archive = ARCHIVE): Promise<string | null> {
  const m = /^\/docs\/(v[^/]+?)(\.md|\/.*)?$/.exec(pathname);
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
    if (await Bun.file(file).exists()) return file;
  }
  return null;
}

// ----------------------------------------------------------------------------
// Snapshotting a build into the archive

/** Attributes that may hold URLs to rewrite. */
const URL_ATTRS = ["href", "src", "poster", "data-markdown-copy"];

/** Files pages reference (chunks, styles, images). Everything else is a page or an index. */
const isAsset = (name: string) => !/\.(html|md|txt|xml|json|map)$/.test(name);

/**
 * Rewrite a URL found in an archived page.
 *   /docs/...          -> /docs/v<id>/...   (stay inside the snapshot)
 *   ../assets/x.css    -> /docs/v<id>/_assets/x.css   (also ../chunk-x.css from older builds)
 * Left alone: other versions (/docs/v...), /docs/versions.json, other paths, external URLs.
 */
export function rewriteUrl(value: string, id: string, fileDir: string, assets: Set<string>): string {
  const docs = /^\/docs(?=$|[/.?#])(.*)$/.exec(value);
  if (docs) {
    if (/^\/v[^/]/.test(docs[1]!) || docs[1] === "/versions.json") return value;
    return `/docs/v${id}${docs[1]}`;
  }
  if (/^([a-z][a-z0-9+.-]*:|\/|#)/i.test(value) || !value) return value;
  const [path, suffix = ""] = value.split(/(?=[?#])/);
  const target = posix.normalize(posix.join(fileDir, path!));
  return assets.has(target) ? `/docs/v${id}/_assets/${posix.basename(target)}${suffix}` : value;
}

/** Rewrite /docs links in Markdown links and frontmatter (code blocks are left alone). */
export function rewriteMarkdown(md: string, id: string): string {
  const fix = (url: string) => rewriteUrl(url, id, "", new Set());
  return md
    .replace(/^(url: ")([^"]*)"/m, (_, a, url) => `${a}${fix(url)}"`)
    .replace(/(\]\()([^)\s]+)/g, (_, a, url) => `${a}${fix(url)}`);
}

/**
 * The "you are reading an old version" banner, as a whole element. Archived pages get
 * it at build time, classes included, so it is styled on first paint;
 * site/features/versions.ts reuses the element when it refreshes the banner from
 * /docs/versions.json, so both must render exactly this markup.
 */
export function bannerMarkup(current: string, latest: string, href: string): string {
  const label = Bun.escapeHTML(latest);
  return (
    `<div class="alert alert-warning mb-8" role="status" data-version-banner data-md-skip>` +
    `<div class="alert-title">You're viewing the docs for ${Bun.escapeHTML(current)}.</div>` +
    `<div class="alert-description">The latest version is ${label}. ` +
    `<a class="link" href="${Bun.escapeHTML(href)}">Go to this page in ${label}</a>.</div></div>`
  );
}

/** Bake the banner into a frozen page, after its URLs were rewritten. */
function withBanner(html: string, current: string, newer: { label: string; path: string }, route: string, pages: string[]): string {
  const sub = route === "/" ? "" : route;
  const href = newer.path + (pages.includes(sub) ? sub : "");
  return new HTMLRewriter()
    .on("[data-version-banner]", {
      element(el) {
        el.replace(bannerMarkup(current, newer.label, href), { html: true });
      },
    })
    .transform(html);
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
  archive = ARCHIVE,
}: {
  dist: string;
  id: string;
  newer?: { label: string; path: string };
  archive?: string;
}) {
  // A snapshot's id becomes a URL (/docs/v<id>/), so it must be a real version.
  if (id === NEXT_VERSION) throw new Error(`[archive] "${NEXT_VERSION}" has no release number; name it with "bun run version:set <x.y>"`);
  const out = join(archive, `v${id}`);
  if (await Bun.file(join(out, "index.html")).exists()) throw new Error(`[archive] ${out} already exists`);
  await rm(out, { recursive: true, force: true });
  await mkdir(join(out, "_assets"), { recursive: true });

  // Shared assets (code-split chunks, CSS, hashed images) live in dist/assets/ (the
  // engine's layout; dist/assets/icons/ is the unhashed icon copy and stays out) or,
  // in older builds, at the dist root. Names are content-hashed, so they flatten into _assets/.
  const files = async (dir: string, prefix = "") =>
    existsSync(dir) ? (await readdir(dir, { withFileTypes: true })).filter((e) => e.isFile() && isAsset(e.name)).map((e) => prefix + e.name) : [];
  const assets = new Set([...(await files(dist)), ...(await files(join(dist, "assets"), "assets/"))]);
  for (const path of assets) await cp(join(dist, path), join(out, "_assets", posix.basename(path)));

  const docsDir = join(dist, "docs");
  const pages: string[] = [];
  const docFiles = [...(await walk(docsDir)), join(dist, "docs.md")];

  // The build's docs sitemap lists the live pages, so a frozen page can link to the
  // same page in the newer version when it still exists there.
  const sitemapFile = Bun.file(join(docsDir, "sitemap.json"));
  const sitemap = (await sitemapFile.exists()) ? await sitemapFile.json() : null;
  const livePages: string[] = sitemap.pages.map((p: { url: string }) => p.url.slice("/docs".length));

  for (const file of docFiles) {
    if (!(await Bun.file(file).exists())) continue;
    const rel = relative(docsDir, file).split(sep).join("/"); // "components/button.html", "../docs.md"
    if (/^v[^/]/.test(rel) || rel === "versions.json") continue; // older snapshots and the manifest are not part of this version
    const target = rel === "../docs.md" ? join(archive, `v${id}.md`) : join(out, rel);
    await mkdir(dirname(target), { recursive: true });
    const route = routeFor(rel); // "/" or "/components/button", relative to the version root

    if (file.endsWith(".html")) {
      const fileDir = posix.dirname(relative(dist, file).split(sep).join("/"));
      const rewriter = new HTMLRewriter()
        .on("*", {
          element(el) {
            if (el.hasAttribute("data-version-link")) return; // the switcher's links point across versions
            for (const attr of URL_ATTRS) {
              const value = el.getAttribute(attr);
              if (value !== null) el.setAttribute(attr, rewriteUrl(value, id, fileDir, assets));
            }
          },
        })
        .on("head", {
          element(el) {
            // Old versions shouldn't compete with the latest docs in search results
            el.append('<meta name="robots" content="noindex" />', { html: true });
          },
        });
      const frozen = rewriter.transform(await Bun.file(file).text());
      await Bun.write(target, newer ? withBanner(frozen, versionLabel(id), newer, route, livePages) : frozen);
      pages.push(route === "/" ? "" : route);
    } else if (file.endsWith(".md")) {
      await Bun.write(target, rewriteMarkdown(await Bun.file(file).text(), id));
    }
  }

  pages.sort();
  await Bun.write(join(out, "pages.json"), JSON.stringify(pages, null, 2) + "\n");

  // The version's own sitemap (search index): the build's docs sitemap with URLs moved under /docs/v<id>
  if (sitemap) {
    const map = structuredClone(sitemap);
    const fix = (url: string | null) => (url ? rewriteUrl(url, id, "", new Set()) : url);
    map.version = id;
    map.pages = map.pages.map((p: { url: string; markdown: string | null }) => ({
      ...p,
      url: fix(p.url),
      absoluteUrl: map.url + fix(p.url),
      markdown: fix(p.markdown),
    }));
    await Bun.write(join(out, "sitemap.json"), JSON.stringify(map, null, 2) + "\n");
  }
  return pages;
}
