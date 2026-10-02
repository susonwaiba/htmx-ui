// The site's engine settings that rendering depends on, shared by htmx-ui.config.ts
// (dev server and build) and by site/lib/site.ts, which renders pages itself for
// Markdown, sitemaps and llms.txt. Kept apart from the config so neither imports
// the other.
import { resolveConfig, type UserConfig } from "htmx-ui-engine";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { addHeadingAnchors } from "./anchors";
import { DIST, SITE } from "./paths";

const site = JSON.parse(readFileSync(resolve(SITE, "data/site.json"), "utf8")) as { url: string };

export const base = {
  url: site.url,
  outDir: DIST,
  publicDir: false,
  // Linkable docs headings: same ids in the HTML build, the Markdown and the sitemap.
  transform: (html) => addHeadingAnchors(html),
} satisfies UserConfig;

/** The resolved config, for rendering outside the engine (site/lib/site.ts, tests). */
export const engine = resolveConfig(base, SITE);
