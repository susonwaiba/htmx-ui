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

import type { IncomingMessage, ServerResponse } from "node:http";
import { existsSync, mkdirSync, readdirSync, renameSync, rmSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import type { Plugin, ViteDevServer } from "vite";
import { pagesOf, renderPage, resolveConfig, type Handler, type ResolvedConfig, type UserConfig } from "../core/config";
import { relativeAsset } from "../core/render";
import { matchRoute, sortRoutes, type Page } from "../core/routes";

const isResolved = (c: UserConfig | ResolvedConfig): c is ResolvedConfig => "templateRoots" in c;
const posix = (p: string) => p.split(sep).join("/");
const inside = (dir: string, file: string) => !relative(dir, file).startsWith("..");

/** Web Request from a Node request, as dev route handlers expect. */
async function toRequest(req: IncomingMessage): Promise<Request> {
  const url = new URL((req as IncomingMessage & { originalUrl?: string }).originalUrl ?? req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (Array.isArray(v)) for (const item of v) headers.append(k, item);
    else if (v !== undefined) headers.set(k, v);
  }
  const method = req.method ?? "GET";
  let body: ArrayBuffer | undefined;
  if (method !== "GET" && method !== "HEAD") {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk as Buffer);
    const buf = Buffer.concat(chunks);
    body = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
  }
  return new Request(url, { method, headers, body });
}

async function send(res: ServerResponse, response: Response) {
  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    if (key !== "set-cookie") res.setHeader(key, value);
  });
  const cookies = response.headers.getSetCookie();
  if (cookies.length) res.setHeader("set-cookie", cookies);
  res.end(Buffer.from(await response.arrayBuffer()));
}

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

export function htmxUi(input: UserConfig | ResolvedConfig = {}): Plugin {
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

  return {
    name: "htmx-ui",
    enforce: "pre",

    config(user, env) {
      if (!isResolved(input)) config = resolveConfig(input, user.root ? resolve(user.root) : process.cwd());
      dev = env.command === "serve";
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
        return inside(config.pagesDir, file) && file.endsWith(".html") ? renderPage(config, file, asset) : html;
      },
    },

    configureServer(server: ViteDevServer) {
      // Layouts, partials, data and icons aren't in Vite's module graph: reload on change.
      const roots = config.templateRoots.filter((r) => !inside(config.root, r));
      server.watcher.add(roots);
      const onChange = (file: string) => {
        if (inside(config.pagesDir, file) && file.endsWith(".html")) return; // Vite reloads pages itself
        if (config.templateRoots.some((r) => inside(r, file)) && /\.(html|json|svg|njk|md)$/.test(file)) {
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

      // After Vite's own middlewares (modules, public dir), before its 404.
      return () => {
        const fallback = config.user.fetch;
        if (!fallback) return;
        server.middlewares.use(async (req, res, next) => {
          try {
            const response = await fallback(await toRequest(req));
            return response ? await send(res, response) : next();
          } catch (e) {
            next(e);
          }
        });
      };
    },

    writeBundle() {
      hoistPages(outDir, posix(relative(config.root, config.pagesDir)));
    },
  };
}

export default htmxUi;
