# htmx-ui-engine

Build [htmx](https://htmx.org) sites from plain HTML pages: Nunjucks templates, file-based routing, Tailwind CSS,
a dev server with hot reload and mock htmx endpoints, and static production builds. One engine, two runtimes:
**Bun** (Bun.serve + Bun.build) and **Node** (Vite). Made for [htmx-ui](https://www.npmjs.com/package/htmx-ui)
components; works without them.

```bash
npm create htmx-ui@latest my-site     # or: pnpm create htmx-ui, yarn create htmx-ui, bun create htmx-ui
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
| `url` | the page's route, e.g. `/docs/button` (mark the active nav link) |
| `json(path)`, `svg(path, attrs)`, `glob(pattern)` | read JSON, inline an SVG, list files |
| `origin` | the public site URL (`url` in the config, or `$SITE_URL`) |
| `dedent`, `highlight(lang)` filters | strip indentation; syntax-highlight code at build time (Shiki) |

With htmx-ui installed, its macros and icons resolve too: `{% from "components/icon/icon.html" import icon %}`.

## Config

```ts
// htmx-ui.config.ts
import { defineConfig } from "htmx-ui-engine";

export default defineConfig({
  pages: "pages",        // routes directory
  templates: ["."],      // template roots, searched in order (htmx-ui's src/ is added last)
  outDir: "dist",
  publicDir: "public",
  url: "https://example.com",
  port: 3000,            // $PORT overrides
  // Dev-only mock endpoints for hx-get / hx-post (Bun.serve route syntax, web Request -> Response)
  routes: {
    "/api/users/:id": (req) => new Response(`<p>User ${req.params.id}</p>`, { headers: { "Content-Type": "text/html" } }),
  },
  transform: (html, page) => html,             // post-process every rendered page
  build: { minify: true, sourcemap: "linked", done: async ({ outDir, pages }) => {} },
  vite: {},                                    // Node only: extra Vite config
});
```

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
`routeFor`, `findPages`, `highlight`.

Requires Node 22.12+ (Node runtime) or Bun 1.2.3+.

## License

[MIT](LICENSE)
