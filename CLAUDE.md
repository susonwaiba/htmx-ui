# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Multi-page static site: plain HTML + htmx 4 + Tailwind v4 + TypeScript, built and served with Bun. There is no React/JSX — pages are hand-written `.html` files.

## Bun only

- Use `bun`/`bun run`/`bun test`/`bunx`/`bun install` — never node, ts-node, npm, yarn, pnpm, npx, jest, vitest.
- Bundling is `Bun.build` / HTML imports with `Bun.serve()` — don't add vite, webpack or esbuild.
- Use Bun built-ins over packages: `Bun.serve()` (not express), built-in `WebSocket` (not ws), `Bun.file` (over `node:fs` read/write), `` Bun.$`cmd` `` (not execa), and `bun:sqlite` / `Bun.sql` / `Bun.redis` if a database is ever needed.
- Bun loads `.env` automatically — don't add dotenv.
- Bun API reference: `node_modules/bun-types/docs/**.mdx`.

## Commands

```bash
bun install
bun run dev        # src/server/dev.ts with --hot, http://localhost:3000 (PORT overrides)
bun run build      # build.ts -> dist/ (minified, code-split, linked sourcemaps)
bun run preview    # serve dist/ statically
bun run typecheck  # tsc --noEmit
```

There are no tests yet; when adding them use `bun test` (single file: `bun test path/to/file.test.ts`, single test: `bun test -t "name"`).

## Architecture

- **Routing is file-based from `src/pages/**/*.html`.** `index.html` -> `/`, `about.html` -> `/about`, `a/b.html` -> `/a/b`. The dev server (`src/server/dev.ts`) globs pages at startup and registers each as a `Bun.serve` HTML-import route, so new pages require restarting `dev`. `build.ts` globs the same files as `Bun.build` entrypoints with `root: ./src/pages`.
- **Every page loads the shared entry** via `<script type="module" src="../app.ts"></script>` (adjust the relative path for nested pages). `src/app.ts` imports htmx, the Tailwind stylesheet, components, and features.
- **Tailwind is wired in two places**: `bunfig.toml` (`[serve.static] plugins`) for the dev server, and the `plugins: [tailwind]` option in `build.ts` for production. Keep them in sync if plugins change.
- **Component library** (`src/components/`): each component is a `<name>.css` (classes in `@layer components` using `@apply`) plus optional `<name>.ts` behaviour. New CSS must be `@import`ed in `src/styles/app.css`; new behaviour must be registered in `initComponents` in `src/components/index.ts`.
- **Component init contract**: `initX(root)` scans `root` for `[data-<component>]:not([data-init])` and marks elements with `data-init` so it is idempotent. `app.ts` calls `init` on `DOMContentLoaded` and again on the htmx `htmx:after:swap` event (htmx 4 event naming — not the v1/v2 `htmx:afterSwap`) scoped to the swapped target, so components work inside server-returned fragments.
- **Features** (`src/features/`): one module per file, called once from the `DOMContentLoaded` handler in `app.ts` (not re-run on swaps).
- **Mock backend** (`src/server/api.ts`): `apiRoutes` maps paths to handlers returning HTML fragments for `hx-get`/`hx-post` targets. These exist only in the dev server; the production build is static and `preview` will not serve them.
