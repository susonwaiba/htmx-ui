---
title: "Code block"
description: "Syntax-highlighted source with a copy button, file tabs, and package-manager tabs that remember the reader's choice. Every snippet in these docs uses it."
url: "/docs/v0.1/components/code-block"
section: "Components"
---

# Code block

Syntax-highlighted source with a copy button, file tabs, and package-manager tabs that remember the reader's choice. Every snippet in these docs uses it.

```ts src/app.ts
import { initComponents } from "htmx-ui";

// Wire up components inside content htmx inserts
document.addEventListener("htmx:after:process", (e) => {
  initComponents((e.target as ParentNode) ?? document);
});
```

## Syntax highlighting

Code is highlighted **at build time** by [Shiki](https://shiki.style), so pages ship coloured HTML and no highlighting JavaScript. Supported languages: `html`, `css`, `ts`/`js`, `json`, `bash`, `toml`, `md`, `xml`/`svg` and `jinja` (Nunjucks). Anything else is shown escaped, uncoloured.

Colours are CSS variables, `--code-token-keyword`, `--code-token-string` and so on, defined for light and dark next to the other [tokens](/docs/v0.1/theming). Override them to restyle every code block.

```css src/styles.css
:root {
  --code-token-keyword: var(--color-fuchsia-600);
  --code-token-string: var(--color-teal-700);
}
```

## Package-manager commands

Install commands come in bun, npm, pnpm and yarn flavours. Switch tabs here and every command block on every page follows. The choice is saved in `localStorage` and restored on your next visit.

```bash bun
bun add htmx-ui htmx.org
bun add -d tailwindcss
```

```bash npm
npm install htmx-ui htmx.org
npm install -D tailwindcss
```

```bash pnpm
pnpm add htmx-ui htmx.org
pnpm add -D tailwindcss
```

```bash yarn
yarn add htmx-ui htmx.org
yarn add -D tailwindcss
```

With the Nunjucks macro, write each line with an action and it's translated for each manager:

```jinja page.html
{% from "components/code/code.html" import cli %}
{{ cli("add htmx-ui htmx.org add-dev tailwindcss run dev") }}
```

| Action | Description |
| --- | --- |
| `init` | npm init -y · pnpm init · yarn init -y · bun init -y |
| `install` | npm install · pnpm install · yarn install · bun install |
| `add` | npm install · pnpm add · yarn add · bun add |
| `add-dev` | npm install -D · pnpm add -D · yarn add -D · bun add -d |
| `run` | npm run · pnpm run · yarn run · bun run |
| `exec` | npx · pnpm dlx · yarn dlx · bunx |
| `create` | npm create · pnpm create · yarn create · bun create |
| `anything else` | Shown unchanged on every tab, e.g. mkdir my-app && cd my-app |

The commands live in `htmx-ui/components/code/package-managers.json`; add a manager or change the default there.

## File tabs

Show related files side by side:

```html index.html
<button class="btn btn-primary" hx-post="/save">Save</button>
```

```css styles.css
@layer components {
  .btn { @apply font-semibold; }
}
```

## Markup

Add `data-code` to the block and `data-copy` to a button inside it. Clicking the button copies the text of the visible `<code>`. Inside the button, `.code-copy-idle` shows normally and `.code-copied` shows for 1.5 seconds after copying.

``` app.ts
initComponents(document);
```

For tabs, put `data-tabs` on the block (plus `data-tabs-sync="key"` to sync), `.code-tab` buttons with `data-tab` in the header, and one `<pre data-tab-panel>` per tab. See [Tabs](/docs/v0.1/components/tabs).

## Nunjucks macros

```jinja page.html
{% from "components/code/code.html" import code, code_block, code_tabs, cli %}

{% call code("html", title="index.html") %}
  <button class="btn btn-primary">Save</button>
{% endcall %}

{{ code_block(some_string, "ts") }}
{{ code_tabs([{ id: "a", label: "a.ts", lang: "ts", source: a }], sync="files") }}
```

Bodies are de-indented and escaped. Wrap Nunjucks syntax in `{% raw %}` so it's shown, not run.

## Reference

| Class | Description |
| --- | --- |
| `.code-block` | Container: border, code background and the <pre> inside. |
| `.code-block-header` | Top bar for a file name, tabs and the copy button. |
| `.code-copy` | Small copy button. Children .code-copy-idle / .code-copied swap after copying. |
| `.code-tabs / .code-tab` | Tab strip inside the header. |
| `[data-code] + [data-copy]` | Behaviour: copies the visible <code> text. |
| `--code-background / --code-foreground / --code-token-*` | Highlighting colours (CSS variables). |
