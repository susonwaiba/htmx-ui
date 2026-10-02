# one

An [htmx-ui](https://github.com/susonwaiba/htmx-ui) site.

```sh
bun install
bun dev       # dev server with HMR at http://localhost:3000
bun build     # static build in dist/
bun preview   # serve dist/
```

- `pages/**/*.html`: routes (`pages/about.html` -> `/about`), Nunjucks templates
- `layouts/`, `partials/`: shared markup; `data/*.json`: read with `json()`
- `app.ts`, `styles.css`: client entry and Tailwind + htmx-ui styles
- `public/`: served and copied as-is
- `htmx-ui.config.ts`: engine options and mock dev routes for htmx
