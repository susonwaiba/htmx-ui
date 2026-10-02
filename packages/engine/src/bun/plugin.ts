// Bun plugin: renders .html pages with Nunjucks before Bun's HTML bundler.
//
//   import { htmxUi } from "htmx-ui-engine/bun";
//   import tailwind from "bun-plugin-tailwind";
//   await Bun.build({ entrypoints: ["./pages/index.html"], outdir: "dist", plugins: [await htmxUi(), tailwind] });
//
// Load order matters. This must run BEFORE bun-plugin-tailwind so Tailwind scans
// the fully rendered markup and sees every class from layouts and partials.
// `htmx-ui dev` registers it for Bun.serve through a generated bunfig.toml
// (./serve-plugin.ts); `htmx-ui build` passes it to Bun.build.

import type { BunPlugin } from "bun";
import { existsSync } from "node:fs";
import { relative, resolve, sep } from "node:path";
import { loadConfig, renderPage, resolveConfig, type ResolvedConfig, type UserConfig } from "../core/config";
import { relativeAsset } from "../core/render";

const isResolved = (c: UserConfig | ResolvedConfig): c is ResolvedConfig => "templateRoots" in c;

/** Server-sent events stream the dev server (./dev-server.ts) uses to reload pages on template changes. */
export const RELOAD_PATH = "/__htmx-ui/reload";
const RELOAD_SCRIPT = `<script>new EventSource("${RELOAD_PATH}").onmessage = () => location.reload();</script>`;

/** Add the reload listener to a page in dev (`htmx-ui dev` sets HTMX_UI_DEV=1). */
const withReload = (html: string) =>
  process.env.HTMX_UI_DEV !== "1" ? html : html.includes("</body>") ? html.replace("</body>", `${RELOAD_SCRIPT}</body>`) : html + RELOAD_SCRIPT;

/** The plugin for a resolved config, a user config (root = cwd), or the project's config file. */
export async function htmxUi(config?: UserConfig | ResolvedConfig): Promise<BunPlugin> {
  return htmxUiPlugin(config ? (isResolved(config) ? config : resolveConfig(config, process.cwd())) : await loadConfig());
}

/**
 * Root-absolute links to public files (href="/favicon.svg"). Bun's HTML bundler
 * tries to bundle every local URL a page references and can't be told to leave
 * one alone, but it skips absolute URLs. So:
 *   build: the link gets this placeholder origin, which `htmx-ui build` strips from
 *          the output (./build.ts), leaving "/favicon.svg", served from the copied
 *          public directory, as in Vite;
 *   dev:   the link points at the file itself, which Bun.serve bundles like any asset.
 */
export const PUBLIC_ORIGIN = "https://htmx-ui.public";

const URL_ATTRS = ["href", "src", "poster"];

/** The file in `publicDir` a root-absolute URL points to, or null. */
function publicFile(publicDir: string, url: string): string | null {
  const file = resolve(publicDir, "." + decodeURIComponent(url.split(/[?#]/)[0]!));
  return file.startsWith(publicDir + sep) && existsSync(file) ? file : null;
}

/** Rewrite root-absolute links to public files in a rendered page (see PUBLIC_ORIGIN). */
function publicUrls(config: ResolvedConfig, page: string, html: string): string {
  const publicDir = config.publicDir;
  if (!publicDir) return html;
  const dev = process.env.HTMX_UI_DEV === "1";
  return new HTMLRewriter()
    .on("*", {
      element(el) {
        for (const attr of URL_ATTRS) {
          const value = el.getAttribute(attr);
          const file = value && /^\/[^/]/.test(value) ? publicFile(publicDir, value) : null;
          if (file) el.setAttribute(attr, dev ? relativeAsset(file, page) : PUBLIC_ORIGIN + value);
        }
      },
    })
    .transform(html);
}

export function htmxUiPlugin(config: ResolvedConfig): BunPlugin {
  const inRoots = (path: string) => config.templateRoots.some((r) => !relative(r, path).startsWith(".."));
  return {
    name: "htmx-ui",
    setup(build) {
      build.onLoad({ filter: /\.html$/ }, async ({ path }) => ({
        contents: inRoots(path) ? withReload(publicUrls(config, path, renderPage(config, path))) : await Bun.file(path).text(),
        loader: "html",
      }));
    },
  };
}
