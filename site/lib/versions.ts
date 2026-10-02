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
// `bun run docs:archive <next>` (scripts/archive.ts) snapshots the latest version and
// makes <next> the new latest.

import { cp, mkdir, readdir, rm } from "node:fs/promises";
import { dirname, join, posix, relative, resolve, sep } from "node:path";
import { ARCHIVE, SITE } from "./paths";
import { routeFor } from "htmx-ui-engine";

export type VersionEntry = { id: string; label: string; released?: string; archived?: boolean };
export type Version = VersionEntry & { path: string; latest: boolean };

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

/** Files at the dist root that pages reference (chunks, images). Everything else is a page or an index. */
const isAsset = (name: string) => !/\.(html|md|txt|xml|json|map)$/.test(name);

/**
 * Rewrite a URL found in an archived page.
 *   /docs/...          -> /docs/v<id>/...   (stay inside the snapshot)
 *   ../chunk-x.css     -> /docs/v<id>/_assets/chunk-x.css
 * Left alone: other versions (/docs/v...), /docs/versions.json, other paths, external URLs.
 */
export function rewriteUrl(value: string, id: string, fileDir: string, assets: Set<string>): string {
  const docs = /^\/docs(?=$|[/.?#])(.*)$/.exec(value);
  if (docs) {
    if (/^\/v\d/.test(docs[1]!) || docs[1] === "/versions.json") return value;
    return `/docs/v${id}${docs[1]}`;
  }
  if (/^([a-z][a-z0-9+.-]*:|\/|#)/i.test(value) || !value) return value;
  const [path, suffix = ""] = value.split(/(?=[?#])/);
  const target = posix.normalize(posix.join(fileDir, path!));
  return assets.has(target) ? `/docs/v${id}/_assets/${target}${suffix}` : value;
}

/** Rewrite /docs links in Markdown links and frontmatter (code blocks are left alone). */
export function rewriteMarkdown(md: string, id: string): string {
  const fix = (url: string) => rewriteUrl(url, id, "", new Set());
  return md
    .replace(/^(url: ")([^"]*)"/m, (_, a, url) => `${a}${fix(url)}"`)
    .replace(/(\]\()([^)\s]+)/g, (_, a, url) => `${a}${fix(url)}`);
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
 * Returns the archived page paths.
 */
export async function archiveDocs({ dist, id, archive = ARCHIVE }: { dist: string; id: string; archive?: string }) {
  const out = join(archive, `v${id}`);
  if (await Bun.file(join(out, "index.html")).exists()) throw new Error(`[archive] ${out} already exists`);
  await rm(out, { recursive: true, force: true });
  await mkdir(join(out, "_assets"), { recursive: true });

  // Shared assets (code-split chunks, CSS, hashed images) live at the dist root.
  const assets = new Set((await readdir(dist, { withFileTypes: true })).filter((e) => e.isFile() && isAsset(e.name)).map((e) => e.name));
  for (const name of assets) await cp(join(dist, name), join(out, "_assets", name));

  const docsDir = join(dist, "docs");
  const pages: string[] = [];
  const files = [...(await walk(docsDir)), join(dist, "docs.md")];

  for (const file of files) {
    if (!(await Bun.file(file).exists())) continue;
    const rel = relative(docsDir, file).split(sep).join("/"); // "components/button.html", "../docs.md"
    if (/^v\d/.test(rel) || rel === "versions.json") continue; // older snapshots and the manifest are not part of this version
    const target = rel === "../docs.md" ? join(archive, `v${id}.md`) : join(out, rel);
    await mkdir(dirname(target), { recursive: true });

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
      await Bun.write(target, rewriter.transform(await Bun.file(file).text()));
      const route = routeFor(rel); // "/" or "/components/button", relative to the version root
      pages.push(route === "/" ? "" : route);
    } else if (file.endsWith(".md")) {
      await Bun.write(target, rewriteMarkdown(await Bun.file(file).text(), id));
    }
  }

  pages.sort();
  await Bun.write(join(out, "pages.json"), JSON.stringify(pages, null, 2) + "\n");

  // The version's own sitemap (search index): the build's docs sitemap with URLs moved under /docs/v<id>
  const sitemapFile = Bun.file(join(dist, "docs", "sitemap.json"));
  if (await sitemapFile.exists()) {
    const map = await sitemapFile.json();
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
