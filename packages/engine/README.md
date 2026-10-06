# htmx-ui-engine

Build [htmx](https://htmx.org) sites from plain HTML pages: Nunjucks templates, file-based routing, Tailwind CSS,
a dev server with hot reload and mock htmx endpoints, and static production builds. One engine, two runtimes:
**Bun** (Bun.serve + Bun.build) and **Node** (Vite). Made for [htmx-ui](https://www.npmjs.com/package/htmx-ui)
components; works without them.

```bash
bun create htmx-ui@latest my-site     # or: npm create, pnpm create, yarn create
```

## Install into an existing project

```bash
# Bun
bun add -d htmx-ui-engine tailwindcss bun-plugin-tailwind

# Node (npm, pnpm or yarn)
npm install -D htmx-ui-engine tailwindcss vite @tailwindcss/vite
```

```json
{ "scripts": { "dev": "htmx-ui dev", "build": "htmx-ui build", "preview": "htmx-ui preview" } }
```

The runtime follows whoever started the CLI: `bun run dev` and `bunx htmx-ui` use Bun; `npm run`, `pnpm`, `yarn` and
`npx` use Node. Force one with `--bun` or `--node` (or `HTMX_UI_RUNTIME=bun|node`).

## Project layout

```
pages/index.html          -> /
pages/about.html          -> /about
pages/docs/index.html     -> /docs
layouts/ partials/        shared templates: {% extends "layouts/base.html" %}, {% include "partials/nav.html" %}
data/*.json               readable from any template: {{ json("data/site.json").name }}
public/                   served at / and copied to dist/ as-is
htmx-ui.config.ts         optional
```

Pages are [Nunjucks](https://mozilla.github.io/nunjucks/) templates rendered before bundling, so scripts and
styles they reference are bundled, hashed and minified, and Tailwind sees every class. The build keeps page paths
(`dist/docs/index.html`) and puts scripts, styles and images in `dist/assets/`, shared by every page that uses
them: a site whose layout loads one `app.ts` ships one JS and one CSS file, on either runtime. Template helpers:

| Helper | |
| :--- | :--- |
| `asset("app.ts")` | path to a project file, relative to the page (use it for `<script src>` / `<link href>` in layouts) |
| `assetVer("app.css")` | the same, plus `?ver=<package.json version>` (and a random suffix in dev), so a cached copy is never reused |
| `url` | the page's route, e.g. `/docs/button` (mark the active nav link) |
| `json(path)`, `svg(path, attrs)`, `glob(pattern)` | read JSON, inline an SVG, list files |
| `origin` | the public site URL (`url` in the config, or `$SITE_URL`) |
| `dedent`, `highlight(lang)` filters | strip indentation; syntax-highlight code at build time (Shiki) |

Add your own with `globals` and `filters` in the config \u2014 plain JavaScript, registered before every render,
so they reach layouts and imported macros too. `markup(html)` wraps a string so a helper can return HTML.

With htmx-ui installed, its macros and icons resolve too: `{% from "components/icon/icon.html" import icon %}`.

## Config

```ts
// htmx-ui.config.ts
import { defineConfig } from "htmx-ui-engine";

export default defineConfig({
  pages: "pages",        // routes directory
  roots: ["."],          // where templates/data/icons are found, in order; roots[0] is the
                         // project root. An entry may be { name, dir }: the name is the prefix
                         // templates reach that directory by, so it can move without the
                         // templates changing. htmx-ui's src/ is added last
  outDir: "dist",
  publicDir: "public",
  url: "https://example.com",
  port: 3000,            // $PORT overrides
  // Mock endpoints for hx-get / hx-post (Bun.serve route syntax, web Request -> Response),
  // served by the dev servers and by createSite() / the server adapters
  routes: {
    "/api/users/:id": (req) => new Response(`<p>User ${req.params.id}</p>`, { headers: { "Content-Type": "text/html" } }),
  },
  transform: (html, page) => html,             // post-process every rendered page
  build: { minify: true, sourcemap: "linked", done: async ({ outDir, pages }) => {} },
  vite: {},                                    // Node only: extra Vite config
  plugins: [],                                 // optional features, see Plugins below
});
```

## Plugins

Features only some sites need are separate packages, listed under `plugins`. The official ones:
[`htmx-ui-plugin-docs`](https://www.npmjs.com/package/htmx-ui-plugin-docs) (Markdown for every docs page, llms.txt,
sitemaps, heading anchors, navigation), [`htmx-ui-plugin-versions`](https://www.npmjs.com/package/htmx-ui-plugin-versions)
(archived docs versions and a switcher) and [`htmx-ui-plugin-search`](https://www.npmjs.com/package/htmx-ui-plugin-search)
(a Ctrl/⌘K palette).

```ts
import { defineConfig } from "htmx-ui-engine";
import docs from "htmx-ui-plugin-docs";
import search from "htmx-ui-plugin-search";

export default defineConfig({ plugins: [docs(), search()] });
```

A plugin is an object with a `name` and any of: `roots` (templates, searched after yours and before htmx-ui's),
`globals`, `filters`, `transform`, `routes`, `fetch`, `build.done`, `commands` (CLI commands such as
`htmx-ui versions:archive`, listed by `htmx-ui --help`), `configResolved(config)` and an `api` for other plugins.
Your own config always wins: its routes and globals override a plugin's, its `fetch` runs first, its `transform` and
`build.done` last. Plugins work in dev, builds, on Bun and Node and behind every server adapter.

```ts
import { definePlugin, editHtml } from "htmx-ui-engine";

export const externalLinks = () =>
  definePlugin({
    name: "external-links",
    transform: (html) =>
      editHtml(html, {
        element(el) {
          if (el.matches("a[href^='http']")) el.setAttribute("rel", "noopener");
        },
      }),
  });
```

Plugin code runs on Node too (Vite loads the config there), so use `node:` APIs and `editHtml()`, a streaming HTML
editor that runs on both runtimes, rather than `Bun.*` or `HTMLRewriter`. The site's docs (`/docs/plugins/writing`)
cover templates, routes, build output, commands, browser code, testing and publishing.

## Serve it from a backend

The static build is just files, so any server can host it — and one function does it for you: `createSite()` finds
`dist/`, answers with the config's `routes` and `fetch`, and answers anything else with a 404 page: your
`pages/404.html` when you have one, htmx-ui's default otherwise.

```ts
import { createSite } from "htmx-ui-engine";

const site = await createSite();                    // dist/, config, pages; no framework required
const server = Bun.serve({ fetch: (req) => site.handle(req) });
```

It also renders, so a backend can serve pages and htmx fragments from the same templates, macros and data as the site:

```ts
site.render("/docs/index.html", { user });          // a full page, per request
site.fragment("partials/invoice-row.html", { invoice });   // an HTML fragment for hx-get / hx-post
```

Ready-made adapters mount it as middleware or a plugin (Elysia first — it's the one that needs no ordering):

```ts
import { Elysia } from "elysia";
import { htmxUi } from "htmx-ui-engine/elysia";   // or /express, /hono, /fastify, /koa

new Elysia()
  .get("/api/hello", () => "<p>Hi</p>")
  .use(htmxUi({ site }))                             // everything else is the built site
  .listen(3000);
```

`htmxUi(options?)` takes the options of `createSite()`: `root`, `config`, `context`, `asset(file, page)`, `cache`
and `site`. Elysia, Fastify and Koa answer only what your own routes don't, in any order; Express and Hono middleware
goes last. In production they serve the output of `htmx-ui build`, so run it before starting your server. The
site's Server frameworks docs (`/docs/servers`) cover each framework, rendering and deploying.

## Use the bundler plugins directly

```ts
// Bun: Bun.build / Bun.serve
import { htmxUi } from "htmx-ui-engine/bun";
import tailwind from "bun-plugin-tailwind";
await Bun.build({ entrypoints: ["./pages/index.html"], outdir: "dist", plugins: [await htmxUi(), tailwind] });
```

```ts
// Node: vite.config.ts
import { htmxUi } from "htmx-ui-engine/vite";
import tailwindcss from "@tailwindcss/vite";
export default { plugins: [htmxUi(), tailwindcss()] };
```

`htmx-ui-engine` itself exports the runtime-agnostic core: `defineConfig`, `loadConfig`, `render`, `renderPage`,
`routeFor`, `findPages`, `pagesOf`, `highlight`, `createSite`, and `definePlugin`, `editHtml`, `contentType` for plugins.

Requires Bun 1.2.3+ or Node 22.12+ (Node runtime).

## License

[MIT](LICENSE)
