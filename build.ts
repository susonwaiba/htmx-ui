// Production build: every site/pages/**/*.html is an entrypoint; output goes to dist/.
import { Glob } from "bun";
import tailwind from "bun-plugin-tailwind";
import { existsSync } from "node:fs";
import { cp, rm } from "node:fs/promises";
import htmlNunjucks from "./bun/html-plugin";
import { ARCHIVE, DIST, ICONS, PAGES } from "./bun/paths";
import * as site from "./bun/site";
import { versionsManifest } from "./bun/versions";

await rm(DIST, { recursive: true, force: true });

const entrypoints = [...new Glob("**/*.html").scanSync(PAGES)].map((f) => `${PAGES}/${f}`);

const result = await Bun.build({
  entrypoints,
  root: PAGES,
  outdir: DIST,
  target: "browser",
  minify: true,
  splitting: true,
  sourcemap: "linked",
  plugins: [htmlNunjucks, tailwind],
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
});

if (!result.success) {
  console.error("Build failed:");
  for (const log of result.logs) console.error(log);
  process.exit(1);
}

// Icons keep stable URLs (/assets/icons/sun.svg) for linking from other sites.
await cp(ICONS, `${DIST}/assets/icons`, { recursive: true });

// Older docs versions are frozen snapshots; copy them in as-is (see bun/versions.ts).
if (existsSync(ARCHIVE)) await cp(ARCHIVE, `${DIST}/docs`, { recursive: true });

// Agent and search outputs: Markdown per docs page, sitemaps, llms.txt. See bun/site.ts.
const pages = site.collectPages();
const docs = pages.filter((p) => p.markdown);
const manifest = await versionsManifest(docs.map((p) => p.url));
const versions = manifest.versions.map(({ id, label, path, latest, sitemap }) => ({ id, label, path, latest, sitemap }));
const extra: Record<string, string> = {
  "sitemap.xml": site.sitemapXml(pages),
  "sitemap.json": site.sitemapJson(pages, { version: manifest.latest, versions }),
  "docs/sitemap.json": site.sitemapJson(docs, { version: manifest.latest }),
  "llms.txt": site.llmsTxt(pages),
  "llms-full.txt": site.llmsFullTxt(pages),
  "robots.txt": site.robotsTxt(),
  "docs/versions.json": JSON.stringify(manifest, null, 2),
};
for (const page of pages) if (page.markdown) extra[page.markdown.slice(1)] = site.markdownFor(page);
for (const [path, body] of Object.entries(extra)) await Bun.write(`${DIST}/${path}`, body);

for (const output of result.outputs) {
  const kb = (output.size / 1024).toFixed(1);
  console.log(` -> ${output.path.replace(process.cwd() + "/", "")} (${kb} KB)`);
}
console.log(` -> ${Object.keys(extra).length} agent/search files (Markdown, sitemaps, llms.txt, versions), assets/icons/`);
if (!process.env.SITE_URL) console.warn(`SITE_URL is not set; sitemaps use ${site.origin()} from site/data/site.json`);
