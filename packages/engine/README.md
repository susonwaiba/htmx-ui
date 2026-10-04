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
});
```

## Serve it from a backend

The static build is just files, so any server can host it — and one function does it for you: `createSite()` finds
`dist/`, answers with the config's `routes` and `fetch`, and falls back to a built `404.html`.

```ts
import { createSite } from "htmx-ui-engine";

const site = await createSite();                    // dist/, config, pages; no framework required
const server = Bun.serve({ fetch: (req) => site.handle(req) ?? new Response("Not found", { status: 404 }) });
```

It also renders, so a backend can serve pages and htmx fragments from the same templates, macros and data as the site:

```ts
site.render("/docs/index.html", { user });          // a full page, per request
site.fragment("partials/invoice-row.html", { invoice });   // an HTML fragment for hx-get / hx-post
```

Ready-made adapters mount it as middleware or a plugin (Elysia first — it's the one that needs no ordering):

```ts
import { Elysia } from "elysia";
import { htmxUi } from "htmx-ui-engine/elysia";   // htmx-ui-engine/express, htmx-ui-engine/hono

new Elysia()
  .get("/api/hello", () => "<p>Hi</p>")
  .use(htmxUi({ site }))                             // last: everything else is the built site
  .listen(3000);
```

`htmxUi(options?)` takes `root`, `config`, `context`, `asset(file, page)` and `site` — the options of `createSite()`.
All three serve the output of `htmx-ui build`, so run it before starting your server.

## Use the plugins directly

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
`routeFor`, `findPages`, `pagesOf`, `highlight`, `createSite`.

Requires Bun 1.2.3+ or Node 22.12+ (Node runtime).

## License

[MIT](LICENSE)
