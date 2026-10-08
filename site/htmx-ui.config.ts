// htmx-ui-engine config for the website. `htmx-ui dev` / `htmx-ui build` (the
// site's package.json scripts) read it. The docs features are plugins:
//   - htmx-ui-plugin-docs: heading anchors, Markdown per docs page, sitemaps, llms.txt
//   - htmx-ui-plugin-versions: archived docs versions in archive/, the version switcher
//   - htmx-ui-plugin-search: the Ctrl/⌘K palette over the sitemap
// and this adds what only the website has:
//   - mock htmx endpoints (server/api.ts)
//   - the package's icons at stable URLs, /assets/icons/<name>.svg
// In dev these are served on request; the build hooks write them to dist/.
// site/public/ is the engine's public directory: it is served as-is in dev and
// copied into dist/ by the build (favicon.svg lives there).
import { defineConfig } from "htmx-ui-engine";
import docs from "htmx-ui-plugin-docs";
import search from "htmx-ui-plugin-search";
import versions from "htmx-ui-plugin-versions";
import { readFileSync } from "node:fs";
import { cp } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { DIST, ICONS, SITE } from "./lib/paths";
import { apiRoutes } from "./server/api";

const site = JSON.parse(readFileSync(resolve(SITE, "data/site.json"), "utf8")) as { name: string; description: string; url: string };

// Google Analytics (GA4). The deploy pipeline sets GA_MEASUREMENT_ID (a repo
// Actions variable); with it missing — local development, CI — the string is
// empty and base.html emits no tracking code at all, not even a request.
const ga = process.env.GA_MEASUREMENT_ID?.trim() ?? "";

export default defineConfig({
  // Absolute URLs in sitemaps and llms.txt, and the `origin` template global. $SITE_URL overrides it.
  url: site.url,
  outDir: DIST,

  // Template globals; `ga` is what the {% if ga %} in layouts/base.html keys on.
  globals: { ga },

  plugins: [docs({ name: site.name, description: site.description }), versions(), search()],

  routes: {
    ...apiRoutes,
    // Same URLs as dist/assets/icons/ (the build hook copies the package's icons there)
    "/assets/icons/*": async (req) => {
      const file = resolve(ICONS, "." + decodeURIComponent(new URL(req.url).pathname.slice("/assets/icons".length)));
      const icon = Bun.file(file);
      return file.startsWith(ICONS + sep) && (await icon.exists()) ? new Response(icon) : new Response("Not found", { status: 404 });
    },
  },

  build: {
    async done({ outDir }) {
      // Icons keep stable URLs (/assets/icons/sun.svg) for linking from other sites.
      await cp(ICONS, `${outDir}/assets/icons`, { recursive: true });
      console.log(" -> assets/icons/");
      if (!process.env.SITE_URL) console.warn(`SITE_URL is not set; sitemaps use ${site.url} from site/data/site.json`);
    },
  },
});
