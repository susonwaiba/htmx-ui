// Vite plugin: the Node runtime's equivalent of the Bun plugin (src/bun/plugin.ts).
//
//   // vite.config.ts, if you'd rather drive Vite yourself than use `htmx-ui dev`
//   import { htmxUi } from "htmx-ui-engine/vite";
//   import tailwindcss from "@tailwindcss/vite";
//   export default { plugins: [htmxUi(), tailwindcss()] };
//
// - Renders pages with Nunjucks in a "pre" transformIndexHtml hook, before Vite
//   resolves their scripts and styles, so dev and build see the same HTML as on Bun.
// - Dev: serves pages at their routes (/docs/button, not /pages/docs/button.html),
//   answers the config's dev routes and fetch fallback, and reloads the page when
//   a layout, partial or data file changes.
// - Build: every page is an entrypoint; built pages are moved from dist/pages/ to
//   the root of dist/ so URLs match the routes. Assets use absolute URLs (base "/").

import type { ServerResponse } from "node:http";
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import type { Plugin, PreviewServer, ViteDevServer } from "vite";
import { pagesOf, renderPage, resolveConfig, type Handler, type ResolvedConfig, type UserConfig } from "../core/config";
import { send, toRequest } from "../core/http";
import { NOT_FOUND_HTML } from "../core/not-found";
import { relativeAsset } from "../core/render";
import { matchRoute, sortRoutes, type Page } from "../core/routes";
import { applyVersions, deferVersions, verToken } from "../core/ver";

const isResolved = (c: UserConfig | ResolvedConfig): c is ResolvedConfig => "roots" in c;
const posix = (p: string) => p.split(sep).join("/");
const inside = (dir: string, file: string) => !relative(dir, file).startsWith("..");

/** Move built pages from <outDir>/<pages>/ up to <outDir>/. */
function hoistPages(outDir: string, from: string) {
  if (!from || !existsSync(resolve(outDir, from))) return;
  const walk = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(resolve(dir, d.name)) : [resolve(dir, d.name)]));
  const src = resolve(outDir, from);
  for (const file of walk(src)) {
    const to = resolve(outDir, relative(src, file));
    rmSync(to, { force: true, recursive: true });
    mkdirSync(dirname(to), { recursive: true });
    renameSync(file, to);
  }
  rmSync(src, { recursive: true, force: true });
}

export function htmxUi(input: UserConfig | ResolvedConfig = {}): Plugin[] {
  let config: ResolvedConfig = isResolved(input) ? input : resolveConfig(input, process.cwd());
  let dev = false;
  let outDir = config.outDir;

  // asset() in dev: pages are served at their routes (/about), not at their file
  // paths (/pages/about.html), so a page-relative URL would resolve against the
  // wrong directory. Use root-absolute URLs instead, and /@fs/ for files outside
  // Vite's root. The build resolves files on disk, so it keeps relative paths.
  const asset = (file: string, page: string) =>
    !dev ? relativeAsset(file, page) : inside(config.root, file) ? `/${posix(relative(config.root, file))}` : `/@fs/${posix(file).replace(/^\//, "")}`;

  let pages: Page[] = [];
  const byUrl = new Map<string, Page>();
  const scan = () => {
    pages = pagesOf(config);
    byUrl.clear();
    for (const p of pages) byUrl.set(p.url, p);
  };

  const routes = () => {
    const table = config.user.routes ?? {};
    return sortRoutes(Object.keys(table)).map((pattern) => [pattern, table[pattern]!] as [string, Handler]);
  };

  const plugin: Plugin = {
    name: "htmx-ui",
    enforce: "pre",

    config(user, env) {
      if (!isResolved(input)) config = resolveConfig(input, user.root ? resolve(user.root) : process.cwd());
      dev = env.command === "serve";
      // Dev URLs carry a random suffix so a page always loads the file as it is now.
      config.ver = verToken(config.version, dev);
      scan();
      const input_ = pages.map((p) => p.file);
      // Vite 8 renamed build.rollupOptions to build.rolldownOptions
      const major = Number(this.meta.viteVersion.split(".")[0]);
      return {
        appType: "mpa",
        build: major >= 8 ? { rolldownOptions: { input: input_ } } : { rollupOptions: { input: input_ } },
      } as Record<string, unknown>;
    },

    configResolved(resolved) {
      outDir = resolve(resolved.root, resolved.build.outDir);
    },

    transformIndexHtml: {
      order: "pre",
      handler(html, ctx) {
        const file = resolve(ctx.filename);
        // assetVer()'s ?ver= leaves the URL here, so Vite resolves the file; the
        // post hook below puts it back on the URL Vite ends up with (../core/ver.ts).
        return inside(config.pagesDir, file) && file.endsWith(".html") ? deferVersions(renderPage(config, file, asset)) : html;
      },
    },

    configureServer(server: ViteDevServer) {
      // Layouts, partials, data and icons aren't in Vite's module graph: reload on change.
      const roots = config.roots.map((r) => r.dir).filter((r) => !inside(config.root, r));
      server.watcher.add(roots);
      const onChange = (file: string) => {
        if (inside(config.pagesDir, file) && file.endsWith(".html")) return; // Vite reloads pages itself
        if (config.roots.some((r) => inside(r.dir, file)) && /\.(html|json|svg|njk|md)$/.test(file)) {
          server.ws.send({ type: "full-reload" });
        }
      };
      server.watcher.on("change", onChange);
      server.watcher.on("add", (f) => (inside(config.pagesDir, f) ? scan() : onChange(f)));
      server.watcher.on("unlink", (f) => (inside(config.pagesDir, f) ? scan() : onChange(f)));

      server.middlewares.use(async (req, res, next) => {
        try {
          const { pathname } = new URL(req.url ?? "/", "http://localhost");
          for (const [pattern, handler] of routes()) {
            const params = matchRoute(pattern, pathname);
            if (params) return await send(res, await handler(Object.assign(await toRequest(req), { params })));
          }
          if (req.method !== "GET" && req.method !== "HEAD") return next();
          const page = byUrl.get(pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname);
          if (!page) return next();
          const html = await server.transformIndexHtml("/" + posix(relative(config.root, page.file)), "", req.originalUrl);
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          res.end(html);
        } catch (e) {
          next(e);
        }
      });

      // After Vite's own middlewares (modules, public dir), before its 404: the config's
      // fetch, then the project's pages/404.html with a 404 status, else htmx-ui's default.
      return () => {
        const fallback = config.user.fetch;
        server.middlewares.use(async (req, res, next) => {
          try {
            const response = fallback ? await fallback(await toRequest(req)) : null;
            if (response) return await send(res, response);
            // Vite's own HTML middleware runs after this one, for .html files that exist.
            const { pathname } = new URL(req.url ?? "/", "http://localhost");
            if (pathname.endsWith(".html") && existsSync(resolve(server.config.root, "." + decodeURIComponent(pathname)))) return next();
            const page = byUrl.get("/404");
            const html = page
              ? await server.transformIndexHtml("/" + posix(relative(config.root, page.file)), "", req.originalUrl)
              : NOT_FOUND_HTML;
            res.statusCode = 404;
            res.setHeader("Content-Type", "text/html; charset=utf-8");
            res.end(html);
          } catch (e) {
            next(e);
          }
        });
      };
    },

    // `vite preview` of the build: the built 404.html, else htmx-ui's default.
    configurePreviewServer(server: PreviewServer) {
      return () => {
        server.middlewares.use((_req, res) => {
          const built = resolve(outDir, "404.html");
          res.statusCode = 404;
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          res.end(existsSync(built) ? readFileSync(built) : NOT_FOUND_HTML);
        });
      };
    },

    writeBundle() {
      hoistPages(outDir, posix(relative(config.root, config.pagesDir)));
    },
  };

  // Vite takes one transformIndexHtml hook per plugin, and the version can only be
  // put back once Vite has rewritten the URLs, so this is a second plugin.
  return [
    plugin,
    {
      name: "htmx-ui:ver",
      transformIndexHtml: { order: "post", handler: (html) => applyVersions(html) },
    },
  ];
}

export default htmxUi;
