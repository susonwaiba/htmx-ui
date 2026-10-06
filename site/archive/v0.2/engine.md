---
title: "Engine"
description: "htmx-ui-engine builds a site from Nunjucks pages: file-based routing, Tailwind, a dev server with hot reload and mock htmx endpoints, and static builds, on Bun or Node."
url: "/docs/v0.2/engine"
section: "Getting started"
---

# Engine

htmx-ui-engine builds a site from Nunjucks pages: file-based routing, Tailwind, a dev server with hot reload and mock htmx endpoints, and static builds, on Bun or Node.

`htmx-ui-engine` is the build tool behind `bun create htmx-ui` and this website. It turns a folder of HTML pages into a static site: each page is rendered with Nunjucks, then bundled (scripts and styles hashed and minified, Tailwind compiled from every class the page uses). The same engine runs on two runtimes:

| Runtime | Dev server | Build | Tailwind |
| --- | --- | --- | --- |
| Bun | `Bun.serve` with HMR | `Bun.build` | `bun-plugin-tailwind` |
| Node | Vite with HMR | Vite | `@tailwindcss/vite` |

Both render pages with the same code, so a site builds the same way on either.

## Commands

```json package.json
{
  "scripts": {
    "dev": "htmx-ui dev",
    "build": "htmx-ui build",
    "preview": "htmx-ui preview"
  }
}
```

| Command / option | Description |
| --- | --- |
| `htmx-ui dev` | Dev server at http://localhost:3000 with hot reload: scripts and styles update in place; pages reload when a layout, partial, macro or data file changes. |
| `htmx-ui build` | Builds every page into dist/ (same paths as pages/), with scripts, styles and images in dist/assets/, content-hashed and shared by every page that uses them. Copies public/ next to it. |
| `htmx-ui preview` | Serves dist/ with the same clean URLs (/about for about.html). |
| `--port <n>` | Port for dev and preview. $PORT works too. |
| `--root <dir>` | Project root, if not the current directory. |
| `--bun, --node` | Pick the runtime (also HTMX_UI_RUNTIME=bun\|node). |

The runtime follows whatever started the command: `bun run dev` and `bunx htmx-ui` run on Bun; `npm run`, `pnpm`, `yarn` and `npx` run on Node. Install the Tailwind integration for the one you use:

```bash Bun
bun add -d htmx-ui-engine tailwindcss bun-plugin-tailwind
```

```bash Node
npm install -D htmx-ui-engine tailwindcss vite @tailwindcss/vite
```

## Project layout

```text my-site/
pages/index.html          -> /
pages/about.html          -> /about
pages/docs/index.html     -> /docs
pages/docs/setup.html     -> /docs/setup
layouts/  partials/       shared templates
data/*.json               read from templates with json()
public/                   served at / and copied to dist/ as-is
app.ts  styles.css        client entry and stylesheet
htmx-ui.config.ts         optional
```

Pages, layouts and partials are covered in [Templates & data](/docs/v0.2/templates). With `htmx-ui` installed, its macros and icons resolve by name, after your own files: `{% from "components/icon/icon.html" import icon %}`.

Link files in `public/` with a root-absolute URL (`href="/favicon.svg"`); they keep their names. Link everything else with `asset()`, so the bundler can hash it.

## Configuration

Every option is optional, and a project without `htmx-ui.config.ts` uses the defaults.

```ts htmx-ui.config.ts
import { defineConfig } from "htmx-ui-engine";

export default defineConfig({
  roots: ["."],
  pages: "pages",
  outDir: "dist",
  publicDir: "public",
  url: "https://example.com",
  port: 3000,
});
```

| Option | Description |
| --- | --- |
| `pages` | Routes directory. Default "pages". |
| `roots` | Where templates, data, icons and assets are found, searched in order. A directory, or one with a name. Default ["."]; htmx-ui's src/ is added last (ui: false turns that off). See Roots below. |
| `render` | This deployment renders templates at runtime. createSite() then checks at startup that the roots and pages are really there, and says what to copy if not. Default false. |
| `outDir` | Build output. Default "dist". |
| `publicDir` | Copied as-is. Default "public"; false to disable. |
| `url` | Public site URL, the origin template global. $SITE_URL overrides it. |
| `port` | Dev and preview port. Default 3000; $PORT overrides it. |
| `debug` | Log what the engine is doing: requests, renders, template compiles and builds. true, or a list of topics. Off by default (see below). |
| `globals, filters` | Extra Nunjucks globals and filters u2014 your own template helpers, on top of the built-in ones. |
| `transform(html, page)` | Post-process every rendered page, in dev and build. |
| `routes` | Request handlers for mock endpoints (see below). |
| `fetch(req)` | Fallback for anything else; return null for a 404. |
| `build.minify, build.sourcemap, build.define` | Production bundling options. |
| `build.done(ctx)` | Runs after a build with { outDir, pages }, e.g. to write a sitemap. |
| `vite` | Node only: extra Vite config, merged over the engine's. |
| `plugins` | Optional features, such as docs, versions and search: [docs(), search()]. See Plugins below. |

`globals` and `filters` are where a project adds its own template helpers; see [custom globals and filters](/docs/v0.2/templates#custom).

## Roots

`roots` is every directory templates, data, icons and assets are found in, searched in order. It defaults to `[\".\"]`, the project, which is why nothing has to configure it to get started. The **first entry is the project root**: `pages`, `outDir`, `publicDir` and `asset()` URLs are all measured from it, and it is the Vite root and Bun's working directory.

### Naming a directory

An entry can carry a **name**, which is the prefix templates reach that directory by. Give one to a directory that is likely to move, and the move stops reaching your templates — rename the directory and the name still resolves it:

```ts htmx-ui.config.ts
export default defineConfig({
  roots: [
    ".",
    { name: "layouts", dir: "new-layouts-2026" },
    { name: "acme", dir: "../acme-ui" },
  ],
});
```

The layout in `new-layouts-2026/` is still reached as `layouts/`, and every page keeps saying so:

```jinja pages/index.html
{% extends "layouts/base.html" %}{% endblock %}
```

A name is a single directory name, not a path, and no two roots may share one — both are refused at startup rather than resolved by luck of the order. The name works everywhere a template name does: `extends`, `include`, `import`, `{% from %}`, `json()`, `svg()`, `glob()` and `asset()`.

> **Names are part of the template namespace** `name` takes that directory's own files. With `{ name: "layouts", dir: "new-layouts-2026" }`, a page asks for `layouts/base.html`, never `layouts/new-layouts-2026/base.html`. If two roots are inside one another, list the more specific one first: it is searched first, and it wins.

### Moving a directory between dev and production

A deployment that renders fragments needs its templates on disk, and `htmx-ui build` does not copy them. That is a change to `roots` and nothing else — the templates are not edited, and no reference to them moves:

```ts htmx-ui.config.ts in the deployment
export default defineConfig({
  render: true,
  roots: [".", "dist/_templates"], // "." first: the first root is the project root
  pages: "dist/_templates/pages",
});
```

See [static pages, dynamic fragments](/docs/v0.2/servers/deploying#static-and-dynamic) for the copy step, and `render` for the startup check that says what is missing.

### Watching

The dev server watches the roots and nothing else, and always skips `node_modules/`, `dist/` and `public/`. A project whose roots are its own directories therefore never walks its dependencies to look for templates that are not there. The trade is that a change under a skipped directory no longer reloads the page: a new public asset appears on the next refresh rather than immediately.

`templates` is the older name for the same list of directories and still works, but it does not move the project root and cannot carry names — prefer `roots`.

## Mock htmx endpoints

While you build the front end, `routes` answers `hx-get` and `hx-post` with HTML fragments, so no backend is needed. Handlers take a web `Request` and return a `Response`, with Bun.serve's route syntax, on either runtime:

```ts htmx-ui.config.ts
import { defineConfig } from "htmx-ui-engine";

const html = (body: string) => new Response(body, { headers: { "Content-Type": "text/html" } });

export default defineConfig({
  routes: {
    "/api/users/:id": (req) => html(`<p>User ${req.params.id}</p>`),
    "/api/search": async (req) => {
      const q = new URL(req.url).searchParams.get("q") ?? "";
      return html(`<li>Results for ${q}</li>`);
    },
  },
});
```

> **Dev server and your own server** `htmx-ui build` is static, so a static host never sees these routes. Mount the site on a backend with [a server adapter](/docs/v0.2/servers) and they are served there too, by your own process, so [leave mocks out of production](/docs/v0.2/servers/deploying#mock-routes).

## Debugging

Set `debug` in `htmx-ui.config.ts` and the engine logs what it is doing: which requests arrive, what answers them, how long every render took, and which templates it had to compile. It is off by default, so it costs nothing in production.

```ts htmx-ui.config.ts
import { defineConfig } from "htmx-ui-engine";

export default defineConfig({
  debug: true,
});
```

Every request is logged twice: once when it arrives, once when it is answered, with where the answer came from. That pair is the point. A request whose first line never gets a second one is the request still in flight — which is what a page that never finishes loading looks like from the server:

```txt Terminal
[htmx-ui] GET /api/team/7
[htmx-ui] GET /api/team/7 200 via route /api/team/:id 0.0ms
[htmx-ui] GET /nope
[htmx-ui] GET /nope 404 via 404.html 0.2ms
```

Where the answer came from is one of: a pattern from `routes`, `dist` for a built file, `page` for a page rendered from its template in development, `fetch` for the config's fallback, then a 404: `404.html` from the build, `pages/404.html` in development, or `default 404` for htmx-ui's own page.

Narrow the output to what you are looking at by listing topics instead: `requests`, `render`, `templates` and `build`.

```ts htmx-ui.config.ts
export default defineConfig({
  debug: ["requests", "render"],
});
```

`render` reports every `site.render()` and `site.fragment()` with its output size and duration. `templates` reports the template cache filling up: one line per template as it compiles, then the warm-up that `createSite()` does at startup, so nothing compiles on your first request. Any step over a second is also marked `SLOW`.

```txt Terminal
[htmx-ui] compiled pages/docs/components/button.html
[htmx-ui] warm: compiled 56 of 56 templates from 42 files in 61.2ms
[htmx-ui] render /docs/components/button done 8.4KB 10.6ms cached=true
[htmx-ui] fragment partials/row.html done 0.2KB 0.4ms
```

## Plugins

Features only some sites need are plugins: separate packages listed in `plugins`, which add templates, routes, build output and commands. The official ones give a site [docs](/docs/v0.2/plugins/docs) with Markdown and llms.txt, [versioned docs](/docs/v0.2/plugins/versions) and [search](/docs/v0.2/plugins/search):

```ts htmx-ui.config.ts
import { defineConfig } from "htmx-ui-engine";
import docs from "htmx-ui-plugin-docs";
import search from "htmx-ui-plugin-search";

export default defineConfig({
  plugins: [docs(), search()],
});
```

See [Plugins](/docs/v0.2/plugins), and [Writing a plugin](/docs/v0.2/plugins/writing) to make your own.

## Serving it from a backend

A built site is just files, so any server can host it. To put the site and your own API in one process, the engine has adapters for [Elysia](/docs/v0.2/servers/elysia), [Fastify](/docs/v0.2/servers/fastify), [Koa](/docs/v0.2/servers/koa), [Express](/docs/v0.2/servers/express) and [Hono](/docs/v0.2/servers/hono), and `createSite()` for anything else. The same templates also render the fragments your API returns to htmx:

```ts server.ts
import { createSite } from "htmx-ui-engine";

const site = await createSite();
Bun.serve({ fetch: (request) => site.handle(request) }); // pages, assets, routes, a 404 page
```

See [Server frameworks](/docs/v0.2/servers).

## Use the bundler plugins directly

Already have a build script or a Vite config? Use the engine's Bun or Vite plugin and skip the CLI:

```ts build.ts (Bun)
import { htmxUi } from "htmx-ui-engine/bun";
import tailwind from "bun-plugin-tailwind";

await Bun.build({
  entrypoints: ["./pages/index.html", "./pages/about.html"],
  root: "./pages",
  outdir: "./dist",
  plugins: [await htmxUi(), tailwind], // htmx-ui first, so Tailwind sees rendered markup
});
```

```ts vite.config.ts (Node)
import { htmxUi } from "htmx-ui-engine/vite";
import tailwindcss from "@tailwindcss/vite";

export default {
  plugins: [htmxUi(), tailwindcss()],
};
```

The package root, `htmx-ui-engine`, exports the runtime-independent core for your own tooling: `defineConfig`, `loadConfig`, `render`, `renderPage`, `findPages`, `routeFor` and `highlight`, plus `definePlugin`, `editHtml` and `contentType` for writing plugins.
