# htmx-ui

Tailwind CSS v4 components for [htmx](https://htmx.org) apps. Plain HTML and CSS classes, a few small
behaviours that keep working inside htmx-swapped fragments, design tokens for theming, and dark mode built in.

```html
<button class="btn btn-primary" hx-post="/save" hx-target="#result">Save</button>
<div class="alert alert-success" role="status">
  <div class="alert-title">Saved</div>
</div>
```

## Install

```bash
bun add htmx-ui htmx.org
bun add -D tailwindcss
```

(or `npm install`, `pnpm add`, `yarn add`). Requires Tailwind CSS v4 and htmx 4.

## Use

```css
/* your stylesheet */
@import "tailwindcss";
@import "htmx-ui/styles.css";
```

```ts
// your entry script
import "htmx.org";
import { initComponents } from "htmx-ui";
import { initTheme } from "htmx-ui/theme";

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initComponents(document);
});
// htmx 4 fires htmx:after:process on each newly inserted element
document.addEventListener("htmx:after:process", (e) => initComponents(e.target ?? document));
```

| Import | Contents |
| :--- | :--- |
| `htmx-ui` | `initComponents(root)`: wires up component behaviour under `root` |
| `htmx-ui/styles.css` | Design tokens, dark mode, `.prose` and every component's styles |
| `htmx-ui/theme` | `initTheme()`, `getTheme()`: light/dark switcher |
| `htmx-ui/icons/<name>.svg` | SVG icons |
| `htmx-ui/components/<name>/<name>.html` | Nunjucks macros (icon, code, alert, spinner) for [htmx-ui-engine](https://www.npmjs.com/package/htmx-ui-engine) sites |

Theme it by overriding CSS variables:

```css
:root      { --primary: oklch(0.6 0.2 30); --radius: 0.75rem; }
:root.dark { --primary: oklch(0.7 0.17 30); }
```

Starting a new site? `bun create htmx-ui@latest` (or `npm create`, `pnpm create`, `yarn create`) sets up pages,
layouts, Tailwind and a dev server with
[htmx-ui-engine](https://www.npmjs.com/package/htmx-ui-engine).

Full documentation, with live examples, theming and dark mode guides, is on the docs site. Every docs page is
also available as Markdown for AI agents (`/docs/<page>.md`, `/llms.txt`).

## License

[MIT](LICENSE). Release notes: [CHANGELOG.md](https://github.com/susonwaiba/htmx-ui/blob/main/CHANGELOG.md).
