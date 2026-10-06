# htmx-ui-plugin-search

Site search for [htmx-ui-engine](https://www.npmjs.com/package/htmx-ui-engine) sites: a `<dialog>` command palette that opens with <kbd>Ctrl</kbd>/<kbd>⌘</kbd> <kbd>K</kbd> or <kbd>/</kbd>, fuzzy-matches pages and their sections (exact word > prefix > substring > letters in order > one typo), and opens the page or the exact section. No server, no service: it searches the `sitemap.json` that [htmx-ui-plugin-docs](https://www.npmjs.com/package/htmx-ui-plugin-docs) publishes, loaded once, on first open. With [htmx-ui-plugin-versions](https://www.npmjs.com/package/htmx-ui-plugin-versions), readers of archived docs search that version.

## Install

```bash
npm install htmx-ui-plugin-search htmx-ui-plugin-docs
```

## Use

```ts
// htmx-ui.config.ts
import { defineConfig } from "htmx-ui-engine";
import docs from "htmx-ui-plugin-docs";
import search from "htmx-ui-plugin-search";

export default defineConfig({ plugins: [docs(), search()] });
```

```css
/* styles.css, after htmx-ui/styles.css */
@import "htmx-ui-plugin-search/styles.css";
```

```ts
// app.ts
import { initSearch } from "htmx-ui-plugin-search/client";
document.addEventListener("DOMContentLoaded", () => initSearch());
```

```html
<!-- the header: a search button and the palette -->
{% from "search/macros.html" import search %}
{{ search() }}
```

`search(src="/sitemap.json", label="Search docs…", placeholder="…")`: `src` is any JSON in the sitemap format (`pages[]` with `url`, `title`, `description`, `section` and `sections[]` of `{ id, title, text }`).

The matcher is exported for your own UI: `import { buildIndex, searchIndex } from "htmx-ui-plugin-search"`.

Full guide: <https://susonwaiba.github.io/htmx-ui/docs/plugins/search>

MIT
