// Serving an htmx-ui site from your own server, whatever framework it uses.
//
//   import { createSite } from "htmx-ui-engine";
//   const site = await createSite();
//   new Elysia().get("/api/hello", ...).use(htmxUi({ site })).listen(3000);
//
// The dev servers and the builds already do this for you; createSite() is the same
// thing as one function, so a site can live next to a real backend. It serves the
// output of `htmx-ui build` (pages at their routes, hashed assets, public/ files),
// the config's `routes` and `fetch`, and answers anything else with a 404 page:
// the project's own (pages/404.html, built to dist/404.html) or htmx-ui's default.
//
// While NODE_ENV is not "production" it renders the page templates themselves, so a
// server you start yourself answers page requests before anything has been built;
// it also serves public/ (which the build copies), finds pages added since it
// started, and re-reads templates on every render so edits show without a restart.
//
// Pages it renders link their scripts and stylesheets as the templates do, as source
// files (/app.ts). Those links are swapped (./assets.ts) for bundles made from source
// in development (./dev.ts, with live reload; nothing is written to dist/), and in
// production for the bundles the build made, from its manifest.
//
// `site.render(url)` renders a page per request (server-rendered data), and
// `site.fragment(path)` renders any template as an HTML fragment for hx-get/hx-post.
// Both go through Nunjucks and the config's globals, filters and asset().
//
// A server renders the same templates over and over, so this compiles them once:
// `createSite()` reads and compiles every template the pages reach before it
// returns, and each later render reuses the compiled result. See SiteOptions.cache.

import { existsSync, readFileSync, statSync } from "node:fs";
import { relative, resolve, sep } from "node:path";
import { loadConfig, pagesOf, renderOptions, renderPage, resolveConfig, type ResolvedConfig, type UserConfig } from "./config";
import { manifestTags, readManifest, swapAssets, type Manifest } from "./assets";
import { devAssets, withReload } from "./dev";
import { locate, render, warm } from "./render";
import { NOT_FOUND_HTML } from "./not-found";
import { matchRoute, sortRoutes, type Page } from "./routes";
import { staticFile } from "./static";

/** Content types for the built site. Anything unknown is served as a byte stream. */
const TYPES: Record<string, string> = {
  avif: "image/avif",
  css: "text/css; charset=utf-8",
  gif: "image/gif",
  html: "text/html; charset=utf-8",
  ico: "image/x-icon",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  js: "text/javascript; charset=utf-8",
  json: "application/json; charset=utf-8",
  map: "application/json; charset=utf-8",
  md: "text/markdown; charset=utf-8",
  mjs: "text/javascript; charset=utf-8",
  mp4: "video/mp4",
  otf: "font/otf",
  pdf: "application/pdf",
  png: "image/png",
  svg: "image/svg+xml",
  txt: "text/plain; charset=utf-8",
  ttf: "font/ttf",
  wasm: "application/wasm",
  webmanifest: "application/manifest+json",
  webm: "video/webm",
  webp: "image/webp",
  woff: "font/woff",
  woff2: "font/woff2",
  xml: "application/xml",
};

/** The Content-Type the engine serves a file with, by its extension. */
export const contentType = (file: string): string => TYPES[file.split(".").pop()?.toLowerCase() ?? ""] ?? "application/octet-stream";

export interface SiteOptions {
  /** Project root, where htmx-ui.config.ts and pages/ live. Default: process.cwd(). */
  root?: string;
  /** The config to use instead of loading the project's htmx-ui.config.ts. */
  config?: UserConfig | ResolvedConfig;
  /** Values for every render, on top of the config's globals. */
  context?: Record<string, unknown>;
  /**
   * URL for asset() in `render()` and `fragment()`: `file` is the absolute file,
   * `page` the template being rendered. Default: root-absolute from the project
   * root, which is what a server bundling assets needs. Built pages already carry
   * their own URLs, so `handle()` never calls it.
   */
  asset?: (file: string, page: string) => string;
  /**
   * Keep compiled templates between renders, so each one is read and compiled
   * once instead of on every request; `createSite()` then also compiles
   * everything the pages reach, so no request waits for a compile. Default: on
   * when NODE_ENV is "production", off otherwise, so template edits show on the
   * next request without restarting the server.
   */
  cache?: boolean;
  /** An existing site to serve, instead of creating one. See `createSite()`. */
  site?: Promise<Site> | Site;
}

export interface Site {
  readonly config: ResolvedConfig;
  /**
   * Every page, with its file and route. Found when the site is created, and in
   * development again whenever a route has no page or a page's file is gone.
   */
  readonly pages: Page[];
  /**
   * Render the page at a route ("/", "/docs/button") with the site's context plus
   * `context`. Throws when there is no page for that route.
   */
  render(url: string, context?: Record<string, unknown>): string;
  /**
   * Render any template — a page, partial or macro — as an HTML fragment, with the
   * site's context plus `context`. No transform() and no document shell: this is for
   * hx-get/hx-post targets.
   */
  fragment(path: string, context?: Record<string, unknown>): string;
  /**
   * Answer a request from the config's routes, then from the built site (pages,
   * assets, public/), then from the config's `fetch`, then with a 404: the built
   * 404.html, else htmx-ui's default 404 page. While NODE_ENV is not "production",
   * a route the build has no answer for is rendered from its page template (with
   * the site's context plus `context`) after the build, and pages/404.html before
   * the default. Every request gets an answer, so mount it after your own routes.
   */
  handle(request: Request, context?: Record<string, unknown>): Promise<Response>;
}

const isResolved = (c: UserConfig | ResolvedConfig): c is ResolvedConfig => "roots" in c;

/** "/docs/button/" -> "/docs/button", so URLs match routes however they're written. */
const route = (pathname: string) => (pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname);

const posix = (p: string) => p.split(sep).join("/");

/** A built file as a Response, with its content type. HEAD gets the headers only. */
function fileResponse(file: string, head = false): Response {
  const body = readFileSync(file);
  const headers: Record<string, string> = { "Content-Type": contentType(file) };
  // Only when there is no body to measure: a server sets its own otherwise, and two
  // Content-Length headers in one response are a protocol error.
  if (head) headers["Content-Length"] = String(body.byteLength);
  return new Response(head ? null : body, { headers });
}

/** A page rendered at request time, as a Response. HEAD gets the headers only. */
function htmlResponse(html: string, head = false, status = 200): Response {
  const headers: Record<string, string> = { "Content-Type": TYPES.html! };
  if (head) headers["Content-Length"] = String(Buffer.byteLength(html));
  return new Response(head ? null : html, { status, headers });
}

/**
 * Fail at startup when a deployment that renders at runtime cannot render: the
 * templates are not where its config says. `htmx-ui build` writes built pages and
 * assets, never the Nunjucks source, so a deployment that ships only dist/ has to
 * copy the templates it renders from. Finding that out on the first htmx request
 * means a 500 in production with a "file not found" naming a path nobody
 * deployed; finding it here means the process says what to copy and exits.
 */
function assertRenderable(config: ResolvedConfig, pages: Page[]): void {
  // render: true means this deployment reads templates off disk at request time, so
  // the roots and the page tree have to be there now rather than at the first request.
  const copy =
    "`htmx-ui build` writes built pages and assets only, never the Nunjucks source, so the " +
    "deployment has to copy the templates it renders from (layouts, partials, macros, " +
    "components/, data/ and whatever json()/svg() reads).";
  const missing = config.roots.filter((r) => !existsSync(r.dir) || !statSync(r.dir).isDirectory());
  if (missing.length) {
    throw new Error(
      `[htmx-ui] render: no templates at ${missing.map((r) => r.dir).join(", ")}. ${copy} ` +
        "Then list where you put them in `roots`.",
    );
  }
  if (!pages.length) {
    throw new Error(
      `[htmx-ui] render: no pages in ${config.pagesDir}. ${copy} ` +
        "Then point `pages` at where you put them.",
    );
  }
}

/** Load the project's config and index its pages. Every adapter starts here. */
export async function createSite(options: SiteOptions = {}): Promise<Site> {
  if (options.site) return await options.site;
  const { config } = options;
  const resolved = config
    ? isResolved(config)
      ? config
      : resolveConfig(config, options.root ?? process.cwd())
    : await loadConfig(options.root);
  // A server started against a project that has not been built yet has no dist/ to
  // read, so it renders the pages it is asked for instead of 404ing them. NODE_ENV,
  // not a config option: it is the same environment the deploy already sets, and a
  // build is still what production serves — dist/ answers before this can.
  const developing = process.env.NODE_ENV !== "production";
  let pages = pagesOf(resolved);
  let byUrl = new Map(pages.map((p) => [p.url, p]));
  if (resolved.render) assertRenderable(resolved, pages);
  /** The page at a route. In development a miss, or a page whose file is gone, looks again: pages come and go while you work. */
  const pageAt = (url: string): Page | undefined => {
    const page = byUrl.get(url);
    if (!developing || (page && existsSync(page.file))) return page;
    pages = pagesOf(resolved);
    byUrl = new Map(pages.map((p) => [p.url, p]));
    return byUrl.get(url);
  };

  const asset =
    options.asset ?? ((file: string) => "/" + posix(relative(resolved.root, file)).replace(/^\.\//, ""));
  const values = (context?: Record<string, unknown>) => ({ ...options.context, ...context });
  const cache = options.cache ?? !developing;
  const templates = renderOptions(resolved, asset, undefined, cache);

  // Compile now, not on the first request. Nunjucks otherwise reads and compiles a
  // page with its layouts and macros while the caller is waiting for it.
  if (cache) warm(pages.map((p) => p.file), templates);

  const { debug } = resolved;

  // Source links in pages rendered here: dev bundles, or the build's bundles.
  const dev = developing ? devAssets(resolved) : null;
  let manifest: Manifest | null | undefined;
  let warned = false;
  const STYLE_OR_SCRIPT = /\.(?:[cm]?[jt]sx?|css)$/;
  const finish = (html: string): string => {
    if (dev) return withReload(swapAssets(html, (path) => dev.isSource(path), (sources) => dev.tags(sources)));
    // A built or public file in dist/ is linked as it is; anything else script- or
    // stylesheet-like is a source the build bundled.
    const isSource = (path: string) => STYLE_OR_SCRIPT.test(path) && !existsSync(resolve(resolved.outDir, path));
    return swapAssets(html, isSource, (sources) => {
      manifest ??= readManifest(resolved.outDir);
      const tags = manifest && manifestTags(manifest, sources);
      if (tags == null && !warned) {
        warned = true;
        console.warn(
          manifest
            ? `htmx-ui: no built page links ${sources.join(" + ")}, so pages rendered at runtime keep those source links. Link them from a page the build has.`
            : `htmx-ui: no build manifest in ${resolved.outDir}; run htmx-ui build so pages rendered at runtime get their scripts and styles.`,
        );
      }
      return tags ?? null;
    });
  };
  // Name the config and the directories. A site rooted somewhere other than where
  // htmx-ui build ran looks fine and then serves nothing, and the roots are the only
  // way to tell that apart from a missing page.
  debug.log(
    "render",
    `${pages.length} pages from ${resolved.pagesDir}, ${
      developing ? "rendering them per request (development)" : resolved.render ? "rendering at runtime" : "serving the built site"
    }`,
    { config: resolved.file ?? "none", root: resolved.root, outDir: resolved.outDir, cache },
  );

  // The route table is fixed by the config, so rank it once instead of per request.
  const table = resolved.user.routes ?? {};
  const patterns = sortRoutes(Object.keys(table));
  const isHead = (request: Request) => request.method === "HEAD";

  return {
    config: resolved,
    get pages() {
      return pages;
    },

    render(url, context) {
      const page = pageAt(route(url));
      if (!page) throw new Error(`[html] no page for ${url} (pages: ${[...byUrl.keys()].join(", ")})`);
      return finish(
        debug.time("render", `render ${page.url}`, () => renderPage(resolved, page.file, asset, values(context), cache), {
          cached: cache,
        }),
      );
    },

    fragment(path, context) {
      // No transform(): a fragment is not a document.
      return debug.time("render", `fragment ${path}`, () =>
        render(locate(resolved.roots, path, "fragment"), { ...templates, context: values(context) }),
      );
    },

    async handle(request, context) {
      const { pathname } = new URL(request.url);
      const start = performance.now();
      // Logged before anything is tried, so a request with no line after it is the
      // one still in flight: which is what a page that never finishes loading is.
      debug.log("requests", `${request.method} ${pathname}`);
      const answer = (how: string, response: Response) => {
        const took = performance.now() - start;
        debug.log("requests", `${request.method} ${pathname} ${response.status} via ${how} ${took.toFixed(1)}ms`);
        return response;
      };
      const bundled = await dev?.handle(request);
      if (bundled) return answer("dev", bundled);

      for (const pattern of patterns) {
        const params = matchRoute(pattern, pathname);
        if (params) return answer(`route ${pattern}`, await table[pattern]!(Object.assign(request, { params })));
      }
      const path = route(pathname);
      const file = staticFile(resolved.outDir, path);
      if (file) return answer("dist", fileResponse(file, isHead(request)));
      // public/ is copied into dist/ by the build; before one, serve it from where it is.
      const unbuilt = developing && resolved.publicDir ? staticFile(resolved.publicDir, path) : null;
      if (unbuilt) return answer("public", fileResponse(unbuilt, isHead(request)));
      // No dist/ answer: the build hasn't run, so render the page template the route
      // is written as. After dist/, never before it — a built page carries hashed asset
      // URLs and is the same bytes for everyone.
      const renderAt = (page: Page) =>
        finish(
          debug.time("render", `render ${page.url}`, () => renderPage(resolved, page.file, asset, values(context), cache), {
            cached: cache,
          }),
        );
      const page = developing ? pageAt(path) : undefined;
      if (page) return answer("page", htmlResponse(renderAt(page), isHead(request)));
      const fallback = await resolved.user.fetch?.(request);
      if (fallback) return answer("fetch", fallback);

      // Nothing has this path: a 404, from the project's page when it has one.
      const notFound = resolve(resolved.outDir, "404.html");
      if (existsSync(notFound)) {
        const res = fileResponse(notFound, isHead(request));
        return answer("404.html", new Response(res.body, { status: 404, headers: res.headers }));
      }
      const notFoundPage = developing ? pageAt("/404") : undefined;
      if (notFoundPage) return answer("pages/404.html", htmlResponse(renderAt(notFoundPage), isHead(request), 404));
      return answer("default 404", htmlResponse(NOT_FOUND_HTML, isHead(request), 404));
    },
  };
}