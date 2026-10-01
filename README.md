# htmx-ui

HTML + HTMX + Tailwind v4 + TypeScript, built and served with Bun.

```bash
bun install
bun run dev     # dev server with hot reload at http://localhost:3000 (set PORT to override)
bun run build   # production build to dist/ (minified, code-split, sourcemaps)
```

## Layout

```
src/
  pages/          # one .html per route: index.html -> /, about.html -> /about, a/b.html -> /a/b
  app.ts          # shared entry: htmx, styles, components, features
  features/       # feature modules (one per file), wired up in app.ts
  components/     # UI component library: <name>.css (Tailwind @layer components) + optional <name>.ts behaviour
  styles/app.css  # Tailwind entry; imports component CSS
  server/         # dev server + mock htmx fragment endpoints (api.ts)
build.ts          # production build script
bunfig.toml       # enables Tailwind for the dev server
```

New page: add `src/pages/foo.html` with `<script type="module" src="../app.ts"></script>`. Both dev and build pick it up automatically (restart `dev` for new routes).
