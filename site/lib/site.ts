// Site-wide outputs for search engines and AI agents, built from the rendered pages:
//   /sitemap.xml   classic sitemap, every page
//   /sitemap.json  every page (latest version) with title, description, section, outline,
//                  section text for search, Markdown URL, plus a list of every docs
//                  version's own sitemap
//   /docs/sitemap.json  the same for the latest docs only (archived versions have
//                  /docs/v<id>/sitemap.json, written by site/lib/versions.ts)
//   /llms.txt      llms.txt index of the docs (https://llmstxt.org)
//   /llms-full.txt every docs page's Markdown, concatenated
//   /robots.txt    points crawlers at the sitemap
//   /<route>.md    Markdown version of each docs page (e.g. /docs/components/button.md)
//
// Used by site/htmx-ui.config.ts: written to dist/ by the build hook, served on request by dev routes.

import { pagesOf, renderPage } from "htmx-ui-engine";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { engine } from "./engine";
import { pageMarkdown, pageMeta, type PageMeta } from "./markdown";
import { SITE } from "./paths";

export type Page = PageMeta & {
  file: string;
  url: string;
  /** Markdown URL, for docs pages only */
  markdown: string | null;
  /** Rendered (pre-bundle) HTML */
  html: string;
};

const site = () => JSON.parse(readFileSync(resolve(SITE, "data/site.json"), "utf8")) as { name: string; description: string; url: string };

/** Absolute origin for sitemap URLs: $SITE_URL, else site/data/site.json "url". */
export const origin = () => (process.env.SITE_URL ?? site().url).replace(/\/$/, "");

/** Pages are docs pages if their route is under /docs; only those get Markdown. */
export const isDocs = (url: string) => url === "/docs" || url.startsWith("/docs/");

/** "/docs" -> "/docs.md", "/docs/components/button" -> "/docs/components/button.md" */
export const markdownUrl = (url: string) => (url === "/" ? "/index.md" : `${url}.md`);

/** Every page under site/pages, in docs navigation order (then by URL). */
export function collectPages(): Page[] {
  const nav: { sections: { items: { href: string }[] }[] } = JSON.parse(
    readFileSync(resolve(SITE, "data/docs-nav.json"), "utf8"),
  );
  const order = nav.sections.flatMap((s) => s.items.map((i) => i.href));
  // Position in the nav. Pages missing from it (e.g. a changelog version) rank
  // with their closest parent: the longest nav href that prefixes their URL.
  const rank = (url: string) => {
    if (order.includes(url)) return order.indexOf(url);
    const parent = order.filter((href) => url.startsWith(href + "/")).sort((a, b) => b.length - a.length)[0];
    return parent ? order.indexOf(parent) : order.length;
  };

  const pages: Page[] = [];
  for (const { file, url } of pagesOf(engine)) {
    const html = renderPage(engine, file);
    pages.push({ file, url, html, markdown: isDocs(url) ? markdownUrl(url) : null, ...pageMeta(html) });
  }
  return pages.sort((a, b) => rank(a.url) - rank(b.url) || a.url.localeCompare(b.url));
}

export function markdownFor(page: Page): string {
  return pageMarkdown(page.html, page.url);
}

const xmlEscape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function sitemapXml(pages: Page[], base = origin()): string {
  const urls = pages.map((p) => `  <url><loc>${xmlEscape(base + p.url)}</loc></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export type SitemapVersion = { id: string; label: string; path: string; latest: boolean; sitemap: string };

/**
 * JSON sitemap, also the index for site search. `version` is the docs version the
 * pages belong to; `versions` (root sitemap only) lists every version's sitemap.
 */
export function sitemapJson(
  pages: Page[],
  { base = origin(), version = null, versions }: { base?: string; version?: string | null; versions?: SitemapVersion[] } = {},
): string {
  const { name, description } = site();
  return (
    JSON.stringify(
      {
        name,
        description,
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

export function llmsTxt(pages: Page[], base = origin()): string {
  const { name, description } = site();
  const docs = pages.filter((p) => p.markdown);
  const sections = new Map<string, Page[]>();
  for (const p of docs) {
    const key = p.section || "Docs";
    sections.set(key, [...(sections.get(key) ?? []), p]);
  }
  const lines = [`# ${name}`, "", `> ${description}`, ""];
  lines.push(
    "Every docs page is available as Markdown by adding `.md` to its URL. " +
      `All pages in one file: ${base}/llms-full.txt. Machine-readable index with section text: ${base}/sitemap.json. ` +
      `Older docs versions: ${base}/docs/versions.json (each version has its own <path>/sitemap.json and .md pages).`,
    "",
  );
  for (const [section, items] of sections) {
    lines.push(`## ${section}`, "");
    for (const p of items) lines.push(`- [${p.title}](${base}${p.markdown})${p.description ? `: ${p.description}` : ""}`);
    lines.push("");
  }
  return lines.join("\n");
}

export function llmsFullTxt(pages: Page[]): string {
  return pages
    .filter((p) => p.markdown)
    .map(markdownFor)
    .join("\n\n");
}

export function robotsTxt(base = origin()): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`;
}
