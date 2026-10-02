// Dev server: serves every site/pages/**/*.html as a route with HMR + Tailwind (via bunfig.toml),
// plus mock endpoints that return HTML fragments for htmx, the package's icons, archived
// docs versions, and the agent/search outputs from bun/site.ts (generated on each request).
import { Glob } from "bun";
import { resolve, sep } from "node:path";
import { pageMarkdown } from "../../bun/markdown";
import { ICONS, PAGES } from "../../bun/paths";
import { renderPage } from "../../bun/render";
import { routeFor } from "../../bun/routes";
import * as site from "../../bun/site";
import { archiveFile, versionsManifest } from "../../bun/versions";
import { apiRoutes } from "./api";

const routes: Record<string, any> = { ...apiRoutes };
const pageFiles = new Map<string, string>(); // route -> file

for (const file of new Glob("**/*.html").scanSync(PAGES)) {
  const route = routeFor(file);
  pageFiles.set(route, resolve(PAGES, file));
  routes[route] = (await import(resolve(PAGES, file))).default;
}

const text = (body: string, type: string) => new Response(body, { headers: { "Content-Type": `${type}; charset=utf-8` } });
const notFound = () => new Response("Not found", { status: 404 });

// Same URLs as dist/assets/icons/ (build.ts copies src/icons there)
routes["/assets/icons/*"] = async (req: Request) => {
  const file = resolve(ICONS, "." + decodeURIComponent(new URL(req.url).pathname.slice("/assets/icons".length)));
  const icon = Bun.file(file);
  return file.startsWith(ICONS + sep) && (await icon.exists()) ? new Response(icon) : notFound();
};
routes["/sitemap.xml"] = () => text(site.sitemapXml(site.collectPages()), "application/xml");
async function sitemaps() {
  const pages = site.collectPages();
  const docs = pages.filter((p) => p.markdown);
  const manifest = await versionsManifest(docs.map((p) => p.url));
  const versions = manifest.versions.map(({ id, label, path, latest, sitemap }) => ({ id, label, path, latest, sitemap }));
  return { pages, docs, latest: manifest.latest, versions };
}
routes["/sitemap.json"] = async () => {
  const { pages, latest, versions } = await sitemaps();
  return text(site.sitemapJson(pages, { version: latest, versions }), "application/json");
};
routes["/docs/sitemap.json"] = async () => {
  const { docs, latest } = await sitemaps();
  return text(site.sitemapJson(docs, { version: latest }), "application/json");
};
routes["/llms.txt"] = () => text(site.llmsTxt(site.collectPages()), "text/plain");
routes["/llms-full.txt"] = () => text(site.llmsFullTxt(site.collectPages()), "text/plain");
routes["/robots.txt"] = () => text(site.robotsTxt(), "text/plain");
routes["/docs/versions.json"] = async () => {
  const docs = [...pageFiles.keys()].filter(site.isDocs);
  return text(JSON.stringify(await versionsManifest(docs), null, 2), "application/json");
};

const server = Bun.serve({
  port: Number(process.env.PORT ?? 3000),
  routes,
  development: { hmr: true, console: true },
  async fetch(req) {
    const { pathname } = new URL(req.url);

    // Archived docs versions: /docs/v0.1/...
    const archived = await archiveFile(pathname);
    if (archived) return new Response(Bun.file(archived));

    // Markdown versions of docs pages: /docs.md, /docs/components/button.md, ...
    const route = pathname.endsWith(".md") ? pathname.slice(0, -3).replace(/^\/index$/, "/") : null;
    const file = route && site.isDocs(route) ? pageFiles.get(route) : undefined;
    if (file) return text(pageMarkdown(renderPage(file), route!), "text/markdown");

    return notFound();
  },
});

console.log(`Dev server: ${server.url}`);
for (const r of Object.keys(routes)) console.log("  ", r);
