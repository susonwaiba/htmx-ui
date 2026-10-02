# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

htmx-ui is a Tailwind v4 component library for htmx apps (plain HTML + CSS + small TypeScript behaviours), plus the website that documents it. Everything is built and served with Bun. There is no React/JSX — pages are hand-written Nunjucks `.html` templates.

| Directory | What it is |
| :--- | :--- |
| `src/` | **The package** (`htmx-ui`): exactly what `package.json` `exports` — `index.ts`, `styles.css`, `theme.ts`, `components/`, `icons/`. Nothing site-specific goes here. |
| `site/` | **The website** (marketing pages + docs): pages, layouts, partials, data, site-only features and styles, dev server, archived docs versions. Not published. |
| `bun/` | Build tooling: template renderer, highlighting, Markdown/sitemaps, versioning. |

## Bun only

- Use `bun`/`bun run`/`bun test`/`bunx`/`bun install` — never node, ts-node, npm, yarn, pnpm, npx, jest, vitest.
- Bundling is `Bun.build` / HTML imports with `Bun.serve()` — don't add vite, webpack or esbuild.
- Use Bun built-ins over packages: `Bun.serve()` (not express), built-in `WebSocket` (not ws), `Bun.file` (over `node:fs` read/write), `` Bun.$`cmd` `` (not execa), and `bun:sqlite` / `Bun.sql` / `Bun.redis` if a database is ever needed.
- Bun loads `.env` automatically — don't add dotenv.
- Bun API reference: `node_modules/bun-types/docs/**.mdx`.

## Commands

```bash
bun install
bun run dev        # site/server/dev.ts with --hot, http://localhost:3000 (PORT overrides)
bun run build      # build.ts -> dist/ (minified, code-split, linked sourcemaps)
bun run preview    # serve dist/ statically
bun run typecheck  # tsc --noEmit
bun test           # all tests (single file: bun test path/to/file.test.ts, single test: bun test -t "name")
bun run build:lib  # compile the package to lib/ (ESM + .d.ts)
bun run release:check  # everything that must pass before publishing (incl. tarball smoke test)
bun run component:new <name>  # scaffold src/components/<name>/ + docs page (--behaviour for TS)
bun run docs:archive <next>  # freeze current docs as an older version, make <next> the latest
```

Tests live next to the code they cover (`*.test.ts` in `bun/`, `src/`, `site/`). happy-dom provides a DOM (`bunfig.toml` `[test] preload`).

## Architecture

- **Routing is file-based from `site/pages/**/*.html`.** `index.html` -> `/`, `about.html` -> `/about`, `a/b.html` -> `/a/b`. The dev server (`site/server/dev.ts`) globs pages at startup and registers each as a `Bun.serve` HTML-import route, so new pages require restarting `dev`. `build.ts` globs the same files as `Bun.build` entrypoints with `root: ./site/pages`.
- **Pages are Nunjucks templates** rendered at build time by `bun/html-plugin.ts` (before Tailwind). They extend `layouts/site.html` or `layouts/docs.html` and read repeated content from `site/data/*.json` with `json()` (no API server needed); the base layout loads the shared entry `site/app.ts` (htmx, Tailwind stylesheet, components, features) via `{{ asset('app.ts') }}`. See the `nunjucks-templates` skill before writing templates.
- **Tailwind is wired in two places**: `bunfig.toml` (`[serve.static] plugins`) for the dev server, and the `plugins: [tailwind]` option in `build.ts` for production. Keep them in sync if plugins change.
- **Component library** (`src/components/<name>/`, one directory per component; scaffold with `bun run component:new <name> [--behaviour]`): each component is a `<name>.css` (classes in `@layer components` using `@apply`) plus optional `<name>.ts` behaviour. New CSS must be `@import`ed in `src/styles.css`; new behaviour must be registered in `initComponents` in `src/components/index.ts`.
- **Component init contract**: `initX(root)` scans `root` for `[data-<component>]:not([data-init])` and marks elements with `data-init` so it is idempotent. `app.ts` calls `init` on `DOMContentLoaded` and again on `htmx:after:process`, which htmx 4 fires on each newly inserted element, so components work inside server-returned fragments. Don't use `htmx:after:swap` for this: in htmx 4 it fires on the requesting element, not the new content. Because the new element is often the component itself, initialisers must use `queryAll(root, selector)` from `src/utils/dom.ts` (includes `root`), not `root.querySelectorAll`.
- **Site features** (`site/features/`): one module per file, called once from the `DOMContentLoaded` handler in `site/app.ts` (not re-run on swaps). The theme switcher is part of the package (`src/theme.ts`).
- **Agent-ready docs**: every `/docs` page is also published as Markdown at `<route>.md`, plus `/llms.txt`, `/llms-full.txt`, `/sitemap.xml`, `/sitemap.json` (with section text, for site search) and per-version `<version path>/sitemap.json`, all generated from the rendered pages by `bun/site.ts`; the site's Ctrl/⌘K search (`site/features/search.ts`) fuzzy-matches these sitemaps (written to `dist/` by `build.ts`, served on request by `dev.ts`). Docs h2/h3 get ids and `#` links at build time (`bun/anchors.ts`). Set `SITE_URL` for production builds.
- **Docs conventions**: package-manager commands use the `cli()` macro (npm/pnpm/yarn/bun tabs), icons use `icon()` backed by `src/icons/*.svg`, and code is highlighted at build time by Shiki (`bun/highlight.ts`). See AGENTS.md §4.6–4.7.
- **Versioned docs**: the latest docs render live at `/docs`. Older versions are frozen *built* snapshots in `site/archive/v<id>/`, served at `/docs/v<id>/`, listed in `site/data/versions.json` and published as `/docs/versions.json` for the sidebar version switcher. Never edit an archive by hand; see AGENTS.md §4.8.
- **Mock backend** (`site/server/api.ts`): `apiRoutes` maps paths to handlers returning HTML fragments for `hx-get`/`hx-post` targets. These exist only in the dev server; the production build is static and `preview` will not serve them.
