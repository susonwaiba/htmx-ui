// htmx-ui-engine config for the website. `htmx-ui dev` / `htmx-ui build` (the
// site's package.json scripts) read it. Rendering settings live in lib/engine.ts;
// this adds what only the website has:
//   - mock htmx endpoints (server/api.ts)
//   - the package's icons at stable URLs, /assets/icons/<name>.svg
//   - agent and search outputs (lib/site.ts): Markdown per docs page, sitemaps, llms.txt
//   - archived docs versions (lib/versions.ts), served from site/archive/
// In dev these are generated on request; the build hook writes them to dist/.
import { defineConfig } from "htmx-ui-engine";
import { existsSync } from "node:fs";
import { cp } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { base } from "./lib/engine";
import { pageMarkdown } from "./lib/markdown";
import { ARCHIVE, ICONS } from "./lib/paths";
import * as site from "./lib/site";
import { archiveFile, versionsManifest } from "./lib/versions";
import { apiRoutes } from "./server/api";

const text = (body: string, type: string) => new Response(body, { headers: { "Content-Type": `${type}; charset=utf-8` } });

/** Sitemaps need the docs versions manifest, which lists the latest docs' pages. */
async function sitemaps(pages = site.collectPages()) {
  const docs = pages.filter((p) => p.markdown);
  const manifest = await versionsManifest(docs.map((p) => p.url));
  const versions = manifest.versions.map(({ id, label, path, latest, sitemap }) => ({ id, label, path, latest, sitemap }));
  return { pages, docs, manifest, latest: manifest.latest, versions };
}

/** Every agent/search file, by path relative to the site root. */
async function agentFiles(): Promise<Record<string, string>> {
  const { pages, docs, manifest, latest, versions } = await sitemaps();
  const files: Record<string, string> = {
    "sitemap.xml": site.sitemapXml(pages),
    "sitemap.json": site.sitemapJson(pages, { version: latest, versions }),
    "docs/sitemap.json": site.sitemapJson(docs, { version: latest }),
    "llms.txt": site.llmsTxt(pages),
    "llms-full.txt": site.llmsFullTxt(pages),
    "robots.txt": site.robotsTxt(),
    "docs/versions.json": JSON.stringify(manifest, null, 2),
  };
  for (const page of docs) files[page.markdown!.slice(1)] = site.markdownFor(page);
  return files;
}

export default defineConfig({
  ...base,

  routes: {
    ...apiRoutes,
    // Same URLs as dist/assets/icons/ (the build hook copies the package's icons there)
    "/assets/icons/*": async (req) => {
      const file = resolve(ICONS, "." + decodeURIComponent(new URL(req.url).pathname.slice("/assets/icons".length)));
      const icon = Bun.file(file);
      return file.startsWith(ICONS + sep) && (await icon.exists()) ? new Response(icon) : new Response("Not found", { status: 404 });
    },
    "/sitemap.xml": () => text(site.sitemapXml(site.collectPages()), "application/xml"),
    "/sitemap.json": async () => {
      const { pages, latest, versions } = await sitemaps();
      return text(site.sitemapJson(pages, { version: latest, versions }), "application/json");
    },
    "/docs/sitemap.json": async () => {
      const { docs, latest } = await sitemaps();
      return text(site.sitemapJson(docs, { version: latest }), "application/json");
    },
    "/llms.txt": () => text(site.llmsTxt(site.collectPages()), "text/plain"),
    "/llms-full.txt": () => text(site.llmsFullTxt(site.collectPages()), "text/plain"),
    "/robots.txt": () => text(site.robotsTxt(), "text/plain"),
    "/docs/versions.json": async () => text(JSON.stringify((await sitemaps()).manifest, null, 2), "application/json"),
  },

  async fetch(req) {
    const { pathname } = new URL(req.url);

    // Archived docs versions: /docs/v0.1/...
    const archived = await archiveFile(pathname);
    if (archived) return new Response(Bun.file(archived));

    // Markdown versions of docs pages: /docs.md, /docs/components/button.md, ...
    const route = pathname.endsWith(".md") ? pathname.slice(0, -3).replace(/^\/index$/, "/") : null;
    const page = route && site.isDocs(route) ? site.collectPages().find((p) => p.url === route) : undefined;
    return page ? text(pageMarkdown(page.html, route!), "text/markdown") : null;
  },

  build: {
    async done({ outDir }) {
      // Icons keep stable URLs (/assets/icons/sun.svg) for linking from other sites.
      await cp(ICONS, `${outDir}/assets/icons`, { recursive: true });
      // Older docs versions are frozen snapshots; copy them in as-is (see lib/versions.ts).
      if (existsSync(ARCHIVE)) await cp(ARCHIVE, `${outDir}/docs`, { recursive: true });
      const files = await agentFiles();
      for (const [path, body] of Object.entries(files)) await Bun.write(`${outDir}/${path}`, body);
      console.log(` -> ${Object.keys(files).length} agent/search files (Markdown, sitemaps, llms.txt, versions), assets/icons/`);
      if (!process.env.SITE_URL) console.warn(`SITE_URL is not set; sitemaps use ${site.origin()} from site/data/site.json`);
    },
  },
});
