// Site-wide outputs for search engines and AI agents, built from the rendered pages:
//   /sitemap.xml   classic sitemap, every page
//   /sitemap.json  every page (latest version) with title, description, section, outline,
//                  section text for search, Markdown URL, plus a list of every docs
//                  version's own sitemap when the versions plugin is used
//   <prefix>/sitemap.json  the same for the docs only
//   /llms.txt      llms.txt index of the docs (https://llmstxt.org)
//   /llms-full.txt every docs page's Markdown, concatenated
//   /robots.txt    points crawlers at the sitemap
//   <route>.md     Markdown version of each docs page (e.g. /docs/components/button.md)
//
// The plugin (./index.ts) serves them on request in dev and writes them in build.done.
// node: APIs only: this runs in the config, which Node loads under the Vite adapter.

import { pagesOf, renderPage, tryLocate, type ResolvedConfig } from "htmx-ui-engine";
import { readFileSync } from "node:fs";
import { pageMarkdown, pageMeta, type PageMeta } from "./markdown";

export type DocsPage = PageMeta & {
  file: string;
  url: string;
  /** Markdown URL, for docs pages only */
  markdown: string | null;
  /** Rendered (pre-bundle) HTML */
  html: string;
};

/** What the indexes say about the site. */
export interface SiteInfo {
  name: string;
  description: string;
  /** Absolute origin for URLs, no trailing slash ("" leaves them root-relative). */
  origin: string;
}

/** One entry of the docs navigation file. */
export interface NavItem {
  title: string;
  href: string;
  description?: string;
  [key: string]: unknown;
}
export interface Nav {
  sections: { title: string; items: NavItem[] }[];
}

/** Routes under `prefix` are docs pages: only those get Markdown. */
export const isDocsUrl = (url: string, prefix: string) => url === prefix || url.startsWith(prefix + "/");

/** "/docs" -> "/docs.md", "/docs/components/button" -> "/docs/components/button.md" */
export const markdownUrl = (url: string) => (url === "/" ? "/index.md" : `${url}.md`);

/** The navigation file, found through the template roots like json(); none when missing. */
export function readNav(config: ResolvedConfig, nav: string | false): Nav {
  const file = nav ? tryLocate(config.roots, nav) : null;
  return file ? (JSON.parse(readFileSync(file, "utf8")) as Nav) : { sections: [] };
}

/**
 * Every page in the project, rendered, in docs navigation order (then by URL). The
 * 404 page is not a page anyone should find, so it is left out.
 */
export function collectPages(config: ResolvedConfig, { prefix, nav }: { prefix: string; nav: string | false }): DocsPage[] {
  const order = readNav(config, nav).sections.flatMap((s) => s.items.map((i) => i.href));
  // Position in the nav. Pages missing from it (e.g. a changelog version) rank
  // with their closest parent: the longest nav href that prefixes their URL.
  const rank = (url: string) => {
    if (order.includes(url)) return order.indexOf(url);
    const parent = order.filter((href) => url.startsWith(href + "/")).sort((a, b) => b.length - a.length)[0];
    return parent ? order.indexOf(parent) : order.length;
  };

  const pages: DocsPage[] = [];
  for (const { file, url } of pagesOf(config)) {
    if (url === "/404") continue;
    const html = renderPage(config, file);
    pages.push({ file, url, html, markdown: isDocsUrl(url, prefix) ? markdownUrl(url) : null, ...pageMeta(html) });
  }
  return pages.sort((a, b) => rank(a.url) - rank(b.url) || a.url.localeCompare(b.url));
}

export function markdownFor(page: DocsPage): string {
  return pageMarkdown(page.html, page.url);
}

const xmlEscape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function sitemapXml(pages: DocsPage[], base: string): string {
  const urls = pages.map((p) => `  <url><loc>${xmlEscape(base + p.url)}</loc></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export type SitemapVersion = { id: string; label: string; path: string; latest: boolean; sitemap: string };

/**
 * JSON sitemap, also the index for site search. `version` is the docs version the
 * pages belong to; `versions` (root sitemap only) lists every version's sitemap.
 */
export function sitemapJson(
  pages: DocsPage[],
  site: SiteInfo,
  { version = null, versions }: { version?: string | null; versions?: SitemapVersion[] } = {},
): string {
  const base = site.origin;
  return (
    JSON.stringify(
      {
        name: site.name,
        description: site.description,
        url: base,
        version,
        ...(versions ? { versions } : {}),
        pages: pages.map((p) => ({
          url: p.url,
          absoluteUrl: base + p.url,
          markdown: p.markdown,
          title: p.title,
          description: p.description,
          section: p.section || null,
          headings: p.headings,
          sections: p.sections,
        })),
      },
      null,
      2,
    ) + "\n"
  );
}

/** `versions`: the URL of the docs versions manifest, mentioned for agents when there is one. */
export function llmsTxt(pages: DocsPage[], site: SiteInfo, { versions }: { versions?: string } = {}): string {
  const base = site.origin;
  const docs = pages.filter((p) => p.markdown);
  const sections = new Map<string, DocsPage[]>();
  for (const p of docs) {
    const key = p.section || "Docs";
    sections.set(key, [...(sections.get(key) ?? []), p]);
  }
  const lines = [`# ${site.name}`, ""];
  if (site.description) lines.push(`> ${site.description}`, "");
  lines.push(
    "Every docs page is available as Markdown by adding `.md` to its URL. " +
      `All pages in one file: ${base}/llms-full.txt. Machine-readable index with section text: ${base}/sitemap.json.` +
      (versions ? ` Older docs versions: ${base}${versions} (each version has its own <path>/sitemap.json and .md pages).` : ""),
    "",
  );
  for (const [section, items] of sections) {
    lines.push(`## ${section}`, "");
    for (const p of items) lines.push(`- [${p.title}](${base}${p.markdown})${p.description ? `: ${p.description}` : ""}`);
    lines.push("");
  }
  return lines.join("\n");
}

export function llmsFullTxt(pages: DocsPage[]): string {
  return pages
    .filter((p) => p.markdown)
    .map(markdownFor)
    .join("\n\n");
}

export function robotsTxt(base: string): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`;
}
