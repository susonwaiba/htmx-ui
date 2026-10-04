---
title: "Engine"
description: "htmx-ui-engine builds a site from Nunjucks pages: file-based routing, Tailwind, a dev server with hot reload and mock htmx endpoints, and static builds, on Bun or Node."
url: "/docs/v0.1/engine"
section: "Getting started"
---

# Engine

htmx-ui-engine builds a site from Nunjucks pages: file-based routing, Tailwind, a dev server with hot reload and mock htmx endpoints, and static builds, on Bun or Node.

`htmx-ui-engine` is the build tool behind `npm create htmx-ui` and this website. It turns a folder of HTML pages into a static site: each page is rendered with Nunjucks, then bundled (scripts and styles hashed and minified, Tailwind compiled from every class the page uses). The same engine runs on two runtimes:

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

Pages, layouts and partials are covered in [Templates & data](/docs/v0.1/templates). With `htmx-ui` installed, its macros and icons resolve by name, after your own files: `{% from "components/icon/icon.html" import icon %}`.

Link files in `public/` with a root-absolute URL (`href="/favicon.svg"`); they keep their names. Link everything else with `asset()`, so the bundler can hash it.

## Configuration

Every option is optional, and a project without `htmx-ui.config.ts` uses the defaults.

```ts htmx-ui.config.ts
import { defineConfig } from "htmx-ui-engine";

export default defineConfig({
  pages: "pages",
  templates: ["."],
  outDir: "dist",
  publicDir: "public",
  url: "https://example.com",
  port: 3000,
});
```

| Option | Description |
| --- | --- |
| `pages` | Routes directory. Default "pages". |
| `templates` | Template roots, searched in order. Default ["."]; htmx-ui's src/ is added last (ui: false turns that off). |
| `outDir` | Build output. Default "dist". |
| `publicDir` | Copied as-is. Default "public"; false to disable. |
| `url` | Public site URL, the origin template global. $SITE_URL overrides it. |
| `port` | Dev and preview port. Default 3000; $PORT overrides it. |
| `globals, filters` | Extra Nunjucks globals and filters. |
| `transform(html, page)` | Post-process every rendered page, in dev and build. |
| `routes` | Dev-only request handlers (see below). |
| `fetch(req)` | Dev-only fallback for anything else; return null for a 404. |
| `build.minify, build.sourcemap, build.define` | Production bundling options. |
| `build.done(ctx)` | Runs after a build with { outDir, pages }, e.g. to write a sitemap. |
| `vite` | Node only: extra Vite config, merged over the engine's. |

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

> **Dev server only** The build is static, so these routes don't exist in production. Point the same URLs at your real backend there.

## Use the plugins directly

Already have a build script or a Vite config? Use the engine's plugin and skip the CLI:

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

The package root, `htmx-ui-engine`, exports the runtime-independent core for your own tooling: `defineConfig`, `loadConfig`, `render`, `renderPage`, `findPages`, `routeFor` and `highlight`.
