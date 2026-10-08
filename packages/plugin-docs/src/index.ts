// htmx-ui-plugin-docs: a docs section that people and AI agents can both read.
//
//   import { defineConfig } from "htmx-ui-engine";
//   import docs from "htmx-ui-plugin-docs";
//   export default defineConfig({ plugins: [docs({ name: "Acme", description: "…" })] });
//
// Pages under `prefix` (default /docs) whose layout wraps the article body in
// <div data-docs-content> get:
//   - an id and a "#" link on every h2/h3 (./anchors.ts)
//   - a Markdown version at <route>.md (./markdown.ts)
//   - /llms.txt, /llms-full.txt, /sitemap.xml, /sitemap.json, <prefix>/sitemap.json and
//     /robots.txt (./outputs.ts): served on request in dev and by server adapters,
//     written to outDir by the build
//   - docsNav(url) in templates: sidebar, active entry and prev/next from the nav file
//   - docs/macros.html: demo(), classes() and markdown_actions() for writing pages
// The "Copy Markdown" button is an htmx-ui clipboard button (no client module needed).
//
// With htmx-ui-plugin-versions in `plugins`, the sitemaps and llms.txt also describe
// every docs version (see `versionsApi()`).

import { definePlugin, pagesOf, renderPage, type Plugin, type ResolvedConfig } from "htmx-ui-engine";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { addHeadingAnchors, CONTENT } from "./anchors";
import { pageMarkdown } from "./markdown";
import {
  collectPages,
  isDocsUrl,
  llmsFullTxt,
  llmsTxt,
  markdownFor,
  readNav,
  robotsTxt,
  sitemapJson,
  sitemapXml,
  type DocsPage,
  type Nav,
  type NavItem,
  type SiteInfo,
  type SitemapVersion,
} from "./outputs";

export { addHeadingAnchors, slug } from "./anchors";
export { pageMarkdown, pageMeta, type PageMeta } from "./markdown";
export * from "./outputs";

export interface DocsOptions {
  /** Route prefix of the docs. Default "/docs". */
  prefix?: string;
  /**
   * Navigation file, found through the template roots like json(). It orders the
   * pages in llms.txt and the sitemaps and feeds docsNav(). Default
   * "data/docs-nav.json"; false for none (pages are then ordered by URL).
   */
  nav?: string | false;
  /** Site name, the heading of llms.txt and `name` in sitemap.json. */
  name?: string;
  /** One-line summary for llms.txt and sitemap.json. */
  description?: string;
  /** Give docs headings ids and "#" links. Default true. */
  anchors?: boolean;
  /**
   * Publish /robots.txt pointing at the sitemap. Default true; a robots.txt in the
   * project's public directory is used instead when there is one.
   */
  robots?: boolean;
}

/** One page's place in the navigation: what the docs layout needs from docsNav(url). */
export interface DocsNavState {
  sections: Nav["sections"];
  /** Every entry, in order. */
  pages: NavItem[];
  /** The page's own entry, or null when it is not in the nav. */
  current: NavItem | null;
  /** href of the closest entry: the page's own, or the longest that prefixes its URL. */
  active: string;
  /** Title of the section holding the active entry ("Docs" when none). */
  section: string;
  prev: NavItem | null;
  next: NavItem | null;
}

/** What the docs plugin offers other plugins: `config.plugins.find((p) => p.name === "docs")?.api`. */
export interface DocsApi {
  readonly prefix: string;
  isDocs(url: string): boolean;
  /** Every page, rendered, in nav order. Renders on each call. */
  pages(): DocsPage[];
  markdown(page: DocsPage): string;
}

/** What the docs plugin reads from htmx-ui-plugin-versions, when it is in `plugins`. */
interface VersionsLink {
  /** URL of the published versions manifest, e.g. "/docs/versions.json". */
  manifestUrl: string;
  /** The published manifest: the latest version's id and every version's sitemap. */
  manifest(): Promise<{ latest: string; versions: (SitemapVersion & Record<string, unknown>)[] }>;
}

/** The docs templates' directory: src/templates, from src/ and from the compiled lib/ alike. */
export const TEMPLATES = fileURLToPath(new URL("../src/templates", import.meta.url));

/** Where in the nav `url` sits. Pure, so layouts and tests agree. */
export function navState(nav: Nav, url: string): DocsNavState {
  const pages = nav.sections.flatMap((s) => s.items);
  let active = "";
  let section = "Docs";
  for (const group of nav.sections) {
    for (const item of group.items) {
      if ((item.href === url || url.startsWith(item.href + "/")) && item.href.length > active.length) {
        active = item.href;
        section = group.title;
      }
    }
  }
  const i = pages.findIndex((p) => p.href === url);
  return {
    sections: nav.sections,
    pages,
    current: i >= 0 ? pages[i]! : null,
    active,
    section,
    prev: i > 0 ? pages[i - 1]! : null,
    next: i >= 0 && i < pages.length - 1 ? pages[i + 1]! : null,
  };
}

export function docs(options: DocsOptions = {}): Plugin & { api: DocsApi } {
  const prefix = (options.prefix ?? "/docs").replace(/\/$/, "");
  const nav = options.nav ?? "data/docs-nav.json";
  let config: ResolvedConfig | null = null;

  const resolved = () => {
    if (!config) throw new Error("[htmx-ui-plugin-docs] used before the config was resolved");
    return config;
  };
  const site = (): SiteInfo => ({ name: options.name ?? "", description: options.description ?? "", origin: resolved().origin });
  const pages = () => collectPages(resolved(), { prefix, nav });
  const versionsApi = () => resolved().plugins.find((p) => p.name === "versions")?.api as VersionsLink | undefined;
  /** A robots.txt in the public directory is the project's own, and wins. */
  const ownRobots = () => {
    const dir = resolved().publicDir;
    return !!dir && existsSync(join(dir, "robots.txt"));
  };

  /** The sitemaps' version fields: the latest docs version and, for the root one, every version. */
  async function versioning() {
    const versions = versionsApi();
    if (!versions) return { latest: null, list: undefined };
    const manifest = await versions.manifest();
    const list = manifest.versions.map(({ id, label, path, latest, sitemap }) => ({ id, label, path, latest, sitemap }));
    return { latest: manifest.latest, list };
  }
  const rootSitemap = async (all: DocsPage[]) => {
    const { latest, list } = await versioning();
    return sitemapJson(all, site(), { version: latest, versions: list });
  };
  const docsSitemap = async (all: DocsPage[]) => sitemapJson(all.filter((p) => p.markdown), site(), { version: (await versioning()).latest });
  const llms = (all: DocsPage[]) => llmsTxt(all, site(), { versions: versionsApi()?.manifestUrl });

  const text = (body: string, type: string) => new Response(body, { headers: { "Content-Type": `${type}; charset=utf-8` } });

  return definePlugin({
    name: "docs",
    roots: [TEMPLATES],
    configResolved(c) {
      config = c;
    },
    globals: {
      /** docsNav(url): the page's place in the navigation file (see DocsNavState). */
      docsNav: (url: string) => navState(readNav(resolved(), nav), url),
    },
    transform: options.anchors === false ? undefined : (html) => addHeadingAnchors(html, CONTENT),
    // Generated on request, for the dev servers and server adapters; the build writes them.
    routes: {
      "/sitemap.xml": () => text(sitemapXml(pages(), site().origin), "application/xml"),
      "/sitemap.json": async () => text(await rootSitemap(pages()), "application/json"),
      [`${prefix}/sitemap.json`]: async () => text(await docsSitemap(pages()), "application/json"),
      "/llms.txt": () => text(llms(pages()), "text/plain"),
      "/llms-full.txt": () => text(llmsFullTxt(pages()), "text/plain"),
      ...(options.robots === false
        ? {}
        : {
            "/robots.txt": async () => {
              const own = resolved().publicDir && join(resolved().publicDir!, "robots.txt");
              return text(own && ownRobots() ? await readFile(own, "utf8") : robotsTxt(site().origin), "text/plain");
            },
          }),
    },
    async fetch(req) {
      // Markdown versions of docs pages: /docs.md, /docs/components/button.md, ...
      const { pathname } = new URL(req.url);
      if (!pathname.endsWith(".md")) return null;
      const route = pathname.slice(0, -3).replace(/^\/index$/, "/");
      if (!isDocsUrl(route, prefix)) return null;
      // Only the requested page: rendering them all would cost every .md request (and every
      // archived version's, which fall through to the versions plugin) the whole site.
      const page = pagesOf(resolved()).find((p) => p.url === route);
      return page ? text(pageMarkdown(renderPage(resolved(), page.file), route), "text/markdown") : null;
    },
    build: {
      async done({ outDir }) {
        const all = pages();
        const out: Record<string, string> = {
          "sitemap.xml": sitemapXml(all, site().origin),
          "sitemap.json": await rootSitemap(all),
          [`${prefix.slice(1)}/sitemap.json`]: await docsSitemap(all),
          "llms.txt": llms(all),
          "llms-full.txt": llmsFullTxt(all),
        };
        // public/ was copied in before this runs, so its robots.txt is already there.
        if (options.robots !== false && !ownRobots()) out["robots.txt"] = robotsTxt(site().origin);
        for (const page of all) if (page.markdown) out[page.markdown.slice(1)] = markdownFor(page);
        for (const [path, body] of Object.entries(out)) {
          await mkdir(dirname(join(outDir, path)), { recursive: true });
          await writeFile(join(outDir, path), body);
        }
        console.log(` -> ${Object.keys(out).length} docs files (Markdown, sitemaps, llms.txt)`);
        if (!site().origin) console.warn("htmx-ui-plugin-docs: no site URL; set `url` in htmx-ui.config.ts or $SITE_URL so sitemaps carry absolute URLs");
      },
    },
    api: {
      prefix,
      isDocs: (url: string) => isDocsUrl(url, prefix),
      pages,
      markdown: markdownFor,
    },
  });
}

export default docs;
