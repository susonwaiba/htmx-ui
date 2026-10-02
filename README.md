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
npm install htmx-ui htmx.org
npm install -D tailwindcss
```

(or `pnpm add`, `yarn add`, `bun add`). Requires Tailwind CSS v4 and htmx 4.

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

Theme it by overriding CSS variables:

```css
:root      { --primary: oklch(0.6 0.2 30); --radius: 0.75rem; }
:root.dark { --primary: oklch(0.7 0.17 30); }
```

Full documentation, with live examples, theming and dark mode guides, is on the docs site. Every docs page is
also available as Markdown for AI agents (`/docs/<page>.md`, `/llms.txt`).

## Development

This repo holds the package (`src/`), the docs website (`site/`) and build tooling (`bun/`). It uses [Bun](https://bun.sh).

```bash
bun install
bun run dev            # docs site with hot reload at http://localhost:3000
bun test
bun run release:check  # everything that must pass before publishing
```

See [AGENTS.md](AGENTS.md) for architecture and conventions, and [CHANGELOG.md](CHANGELOG.md) for releases.

## License

[MIT](LICENSE)
