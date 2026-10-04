---
name: nunjucks-templates
description: Write and edit this project's Nunjucks HTML templates — pages in site/pages, layouts in site/layouts, partials in site/partials, and component macros in packages/ui/src/components. Use when creating or changing a page, layout, partial or reusable markup snippet, when touching the engine's renderer (packages/engine/src/core/render.ts) or its Bun/Vite plugins, or when a build fails with a Nunjucks "Template render error".
---

# Nunjucks templates in htmx-ui

Every page is rendered by Nunjucks first (htmx-ui-engine: the Bun plugin `packages/engine/src/bun/plugin.ts` → `renderPage()` in `packages/engine/src/core/config.ts` → `render()` in `packages/engine/src/core/render.ts`), then handed to Bun's HTML bundler, then to Tailwind. The site's render settings (origin, heading anchors) are in `site/lib/engine.ts`. Rendering happens **at build time only** — there is no runtime templating, no request data, and htmx fragments from `site/server/api.ts` are plain strings, not templates.

Upstream syntax reference (Jinja2-like): https://mozilla.github.io/nunjucks/templating.html

## Project setup you must respect

| Setting | Consequence |
| :--- | :--- |
| Roots: `site/` (default `roots: ["."]`), then htmx-ui's `src/` (`packages/ui/src`) | Names are root-relative; first match wins. `"layouts/docs.html"`, `"partials/header.html"` and `"macros/docs.html"` come from `site/`; `"components/icon/icon.html"` from the package. Don't write `"../layouts/docs.html"`. A root may carry a `name` (`{ name: "layouts", dir: "..." }`), which is the prefix templates reach it by; this site uses plain directories, so names are for projects that move a directory without moving its references. Resolution goes through `tryLocate()` in `core/render.ts` via `RootsLoader`, so a name works in `extends`/`include`/`import`/`from`, `json()`, `svg()`, `glob()` and `asset()` alike. |
| `throwOnUndefined: true` | Outputting an undefined value fails the build (see the guards below). |
| `autoescape: true` | `{{ value }}` is HTML-escaped. Use `| safe` only for markup you wrote. |
| `trimBlocks` + `lstripBlocks` | A line holding only a `{% tag %}` disappears entirely, so indent tags freely. |
| `noCache` | The dev default: every render re-reads templates from disk. A server rendering per request sets `cache: true` instead, so each template is compiled once — `createSite()` does that and warms it at startup. |
| Globals: `asset(path)`, `assetVer(path)`, `url` | `asset()` turns a root-relative path into one relative to the page being rendered, and fails the build if the file doesn't exist. `assetVer()` is the same URL plus `?ver=<package.json version>` (and a random suffix in dev). `url` is the page's route (`/docs/components/button`), or `""` outside `site/pages`. |
| Globals: `json(path)`, `svg(path, attrs)`, `glob(pattern)` | Read a JSON file; inline an SVG with attributes set on its root; list matching files. Paths are root-relative (`"data/x.json"` → `site/data/x.json`, `"icons/sun.svg"` → `packages/ui/src/icons/sun.svg`). A missing file fails the build with the path in the message. |
| Filters: `dedent`, `highlight(lang)` | Strip shared indentation; syntax-highlight with Shiki at build time (`packages/engine/src/core/highlight.ts`). |
| `globals`, `filters` in `htmx-ui.config.ts` | The project's own helpers, registered per render like the built-ins (this site has none). A helper that returns HTML wraps it in `markup()`, exported from `htmx-ui-engine`. |

Every global is visible inside imported macros **without** `with context`. That includes `asset()`/`assetVer()` and `url`, which are reset before each render.

## Pages

A page is `site/pages/<route>.html` (nested folders map to nested routes; `docs/changelog/0.1.0.html` is `/docs/changelog/0.1.0`). Pick the layout by section:

| Layout | For | Page provides |
| :--- | :--- | :--- |
| `layouts/site.html` | Marketing pages (`/`, `/about`) | `{% block title %}`, optional `{% block head %}`, `{% block content %}` (full width; the page owns its containers) |
| `layouts/docs.html` | Everything under `/docs` | `{% set title %}`, `{% set description %}`, `{% block content %}` (rendered inside `.prose`, unless the page sets `prose = false`) |
| `layouts/base.html` | Only for new layouts | Bare shell with blocks `title`, `head`, `body` |

```jinja
{% extends "layouts/docs.html" %}
{% from "macros/docs.html" import demo, classes %}
{% set title = "Button" %}
{% set description = "Triggers an action or an htmx request." %}

{% block content %}
  {% call demo() %}<button class="btn btn-primary">Save</button>{% endcall %}
{% endblock %}
```

- A docs page must also be listed in `site/data/docs-nav.json`. That list drives the sidebar, the active link, the section label, prev/next, and page order in `llms.txt`/`sitemap.json`. Component pages get `component: true` so they appear on the components index.
- Docs h2/h3 get an id and a `#` link automatically at build time, except headings inside links, `not-prose` component markup, demos and `data-md-skip` blocks (card titles are not sections); only write `id="…"` yourself to pin a link target that must survive rewording. Search results and shared links use these ids.
- Every docs page is also published as Markdown (`<url>.md`) for AI agents, converted from the rendered article (`site/lib/markdown.ts`). Write examples whose source is a complete spec. `demo()` output becomes just its code; mark purely visual blocks `data-md-skip`.
- Docs helpers in `macros/docs.html`: `demo(class="", source=true)` renders the call body as a live preview with its escaped source underneath. `classes(rows)` renders a `[name, description]` reference table.
- The docs `content` block sits inside `.prose` (`@tailwindcss/typography`, mapped to the tokens), so plain `h2`/`p`/`ul`/`code`/`a` are styled with no classes. Add `not-prose` to components and custom blocks (card grids, tables) so prose doesn't restyle them. `demo()`, `classes()`, `code` and `alert` already do.
- `.prose` nested *inside* a `not-prose` element gets no styles (the plugin skips everything under `not-prose`). A page that demos prose itself sets `{% set prose = false %}`, wraps its own text sections in `<div class="prose docs-prose max-w-none">`, and uses `demo(..., isolate=false)` for prose previews (see the Text page).
- In a child template, **anything outside a `{% block %}` is silently dropped**. A top-level `{% set %}` still runs, though, and the layout and its includes can read it. Use this for page-level flags such as `active` or `description`.
- To append to a layout's default block content instead of replacing it, call `{{ super() }}`.
- A new page needs `bun run dev` restarted; the dev server globs routes at startup.

## Layouts and partials

- Layouts live in `site/layouts/` and own `<!doctype>`, `<html>`, `<head>` and `<body>`. A layout can `{% extends %}` another layout to add a frame (`site.html` and `docs.html` both extend `base.html` and fill its `body` block).
- Partials live in `site/partials/` and are pulled in with `{% include "partials/x.html" %}`. An include shares the caller's context, so it can read `active`, loop variables, and so on.
- **Blocks inside an included partial can't be overridden by pages.** An include renders separately and has its own block namespace. If a page needs to change part of a partial, use a variable or a macro instead.

## Data: `json()` instead of an API

Keep repeated or structured content in `site/data/*.json` and read it at build time:

```jinja
{% set releases = json("data/changelog.json").releases %}
{% for r in releases %}<li>v{{ r.version }}, {{ r.date }}</li>{% endfor %}
```

Existing files: `site.json`, `docs-nav.json`, `versions.json`, `changelog.json`. (`cli()`'s command table is package data: `packages/ui/src/components/code/package-managers.json`.) Add new data there rather than hard-coding lists in templates or adding mock API routes.

## Local asset paths: always `asset()`

Bun resolves `<script src>`, `<link href>` and `<img src>` relative to the **page file**, but a layout or partial is shared by pages at different depths. So any local file reference in a layout, partial or macro must go through `asset()`:

```jinja
<script type="module" src="{{ asset('app.ts') }}"></script>
<img src="{{ asset('images/logo.svg') }}" alt="" />
```

Routes and API URLs are root-absolute and need nothing: `href="/about"`, `hx-get="/api/hello"`. External URLs need nothing either.

`assetVer(path)` is `asset(path)` with `?ver=` appended, for a URL whose name doesn't change with its content (the project's `package.json` version, plus a random suffix in dev). Both bundlers name built assets after their content, so plain `asset()` is enough for ordinary files; reach for `assetVer()` when a URL stays the same — `public/` files, or Vite's un-hashed dev URLs. The bundlers can't resolve a query string, so the engine parks it in a `data-ver` attribute while they work and puts it back on the finished URL (`packages/engine/src/core/ver.ts`).

**Never write a root-absolute local file path** like `<img src="/assets/icons/sun.svg">`. Bun treats a leading `/` as a filesystem path and the build fails with `Could not resolve` (the site has no `public/` directory, which is the only place the engine allows root-absolute file links). (The package's `icons/` is also copied unhashed to `dist/assets/icons/` for linking from *other* sites, but pages must use `asset()`.)

## Reusable markup: macros

Use a macro when a snippet takes parameters, a partial when it doesn't. Put a component's markup macro in its directory, next to its CSS/TS: `packages/ui/src/components/<name>/<name>.html`, imported as `"components/<name>/<name>.html"`. That keeps the component as CSS + optional TS + optional macro, and the `@source "./components"` line in `packages/ui/src/styles.css` means Tailwind scans it in any project. Macros in the package are public: they may only use the engine's globals and other package templates, never `site/` partials or data.

Existing macros. Reuse them rather than hand-writing the markup:

| Import | Use |
| :--- | :--- |
| `{% from "components/icon/icon.html" import icon %}` | `{{ icon("arrow-right", "size-5") }}` inlines `icons/arrow-right.svg`. `label="…"` makes it meaningful (`role="img"`); `mode="img"` emits an `<img>` instead. Unknown names fail the build; add an SVG file to add an icon. |
| `{% from "components/code/code.html" import code, code_block, code_tabs, cli %}` | `{% call code("ts", title="app.ts") %}…{% endcall %}`: highlighted, escaped, dedented code with a copy button. `code_tabs([{id, label, lang, source}])` for file tabs. Wrap Nunjucks syntax in the body in `{% raw %}`. |
| (same import) | `{{ cli("add htmx-ui\nadd-dev tailwindcss") }}`: npm/pnpm/yarn/bun tabs, choice remembered site-wide. **Use for every package-manager command.** Actions: `init add add-dev run exec create`; other lines are shown as written. |
| `{% from "components/alert/alert.html" import alert %}` | `{% call alert("Title", variant="warning", dismissible=true) %}…{% endcall %}`: picks the icon and ARIA role. |

Writing a new one, for example a card:

```jinja
{# packages/ui/src/components/card/card.html #}
{% macro card(title, dismissible=false) %}
<div class="card"{% if dismissible %} data-dismissible{% endif %}>
  <h2 class="card-title">{{ title }}</h2>
  {{ caller() }}
</div>
{% endmacro %}
```

```jinja
{% from "components/card/card.html" import card %}

{% call card("HTMX request", dismissible=true) %}
  <button class="btn btn-primary" hx-get="/api/hello" hx-target="#hello">Load</button>
{% endcall %}
```

- `{% call %}…{% endcall %}` passes a block of markup as `caller()`. Prefer this to passing HTML strings with `| safe`.
- Give every optional parameter a default. Use `=none` or `=false`, not nothing. An unpassed argument is undefined and throws once it's output.
- **Imports have no context by default.** Globals (`asset`, `url`, `json`, `svg`, ...) still work, but a macro that reads a *page variable* (set with `{% set %}` in the page) must be imported with `with context`:
  `{% from "components/logo.html" import logo with context %}`

## Guarding undefined values (`throwOnUndefined`)

Verified behaviour:

| Expression | Undefined `x` |
| :--- | :--- |
| `{{ x }}`, `{{ x.y }}` | **throws** "attempted to output null or undefined value" |
| `{% if x %}` / `{% if x is defined %}` | false, no throw |
| `{{ x | default("fallback") }}` | `"fallback"` |

So in layouts and partials, read optional page variables with `{% if description %}…{% endif %}` or `{{ description | default("") }}`.

## Literal `{{`, `{%`, `{#` in markup

The lexer matches these three sequences everywhere, including inside `<script>` and `<style>`. Plain JS and CSS braces (`{a: 1}`, `${x}`, `a { color: red }`) are fine. But CSS like `a{#id{…}}` or a JS template like `` `${{a:1}.a}` `` breaks the build ("expected end of comment"). Add a space (`{ #id`) or wrap the text in `{% raw %}…{% endraw %}`. Use `raw` too if a client-side library needs mustache syntax in the output.

## Tags and filters worth knowing

- `{% for item in items %}…{% else %}empty{% endfor %}`, with `loop.index`, `loop.first` and `loop.last`. To render a static list once, define the data in place: `{% set links = [{href: "/", label: "Home"}] %}`.
- `{% set x %}…{% endset %}` captures rendered markup into a variable.
- `{% if a %}…{% elif b %}…{% else %}…{% endif %}`, and the inline form `{{ "on" if active == "home" else "off" }}`.
- `{{- x -}}` / `{%- tag -%}` strip whitespace around a tag.
- `{# comment #}` is stripped from the output, so use it instead of `<!-- -->` for notes that shouldn't ship.
- Common filters: `default`, `safe`, `escape`, `join`, `length`, `lower`/`upper`/`title`, `replace`, `trim`, `truncate`, `dump` (JSON, handy for `data-*` attributes and `hx-vals`), `urlencode`, `first`/`last`, `sort`, `groupby`.

Don't use `asyncEach`/`asyncAll`. Rendering is synchronous.

## Don't

- Don't put Nunjucks syntax in strings returned by `site/server/api.ts`. Those aren't rendered.
- Don't let templates read secrets or environment data. Everything rendered ends up in static `dist/`.
- Don't add custom filters or globals inline in templates. For the site, add them to `globals`/`filters` in `site/lib/engine.ts`; for every engine user, register them in `env()` in `packages/engine/src/core/render.ts` and add a test in `render.test.ts` beside it.

## Verify

```bash
bun test packages/engine site/lib
bun run build
find dist -name '*.html' | xargs grep -lE '\{[%{#]'   # must print nothing: no template syntax leaked
```

A render error repeats `Template render error: (<file>)` once per level of extends/include. The page comes first. The **last** entry is the file that actually failed, with `[Line N, Column M]` (often a layout or partial).
