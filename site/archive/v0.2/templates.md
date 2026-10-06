---
title: "Templates & data"
description: "Pages are Nunjucks templates rendered at build time. They can read JSON files, inline SVGs and list files, so most content needs no API server."
url: "/docs/v0.2/templates"
section: "Guides"
---

# Templates & data

Pages are Nunjucks templates rendered at build time. They can read JSON files, inline SVGs and list files, so most content needs no API server.

> **Optional** The components are plain HTML and CSS, and work with any server or template language. This page covers the Nunjucks templates of [htmx-ui-engine](/docs/v0.2/engine), which this site is built with too.

> **Macros are new** The package's Nunjucks macros (`htmx-ui/components/*.html`) need the engine's template helpers (`svg()`, `json()`, `| dedent`, `| highlight`). Their parameters may still change in a minor release before 1.0; each change is listed in the changelog.

## Pages and layouts

Every `.html` file in `pages/` is a route (`docs/theming.html` is `/docs/theming`). The engine renders it with [Nunjucks](https://mozilla.github.io/nunjucks/templating.html) before the bundler (Bun's or Vite) sees it, so pages can extend layouts, include partials and call macros. Template names resolve from the project root, then from the htmx-ui package (its `components/` and `icons/`):

```jinja pages/pricing.html
{% extends "layouts/site.html" %}
{% from "components/alert/alert.html" import alert %}

{% block title %}Pricing · HTMX UI{% endblock %}

{% block content %}
  {% call alert("Launch offer", variant="success") %}20% off the first year.{% endcall %}
{% endblock %}
```

## JSON data

`json(path)` reads a JSON file at build time. Keep repeated content (navigation, pricing tiers, team members, release notes) in one file and render it anywhere, with no API and no client-side fetching.

```jinja page.html
{% set releases = json("data/changelog.json").releases %}

<ul>
  {% for r in releases %}
    <li><a href="/docs/changelog/{{ r.version }}">v{{ r.version }}</a>, {{ r.date or "Unreleased" }}</li>
  {% endfor %}
</ul>
```

```json data/changelog.json
{
  "releases": [
    { "version": "0.2.0", "summary": "Named template roots…" },
    { "version": "0.1.0", "date": "2026-10-02", "summary": "First release…" }
  ]
}
```

That template, live, reading this site's real file:

- [v0.2.0](/docs/v0.2/changelog/0.2.0), 2026-10-06
- [v0.1.0](/docs/v0.2/changelog/0.1.0), 2026-10-02

This site's data files:

| File (under site/) | Description |
| --- | --- |
| `data/site.json` | Site name, description and URL (used for sitemaps). |
| `data/docs-nav.json` | Docs navigation: sidebar, prev/next, components index, page order for agents. |
| `data/changelog.json` | Releases, newest first. |
| `data/versions.json` | Docs versions; the latest is rendered live, older ones are archived. |

### JSON in the browser too

The same files can be imported by client code. Bun and Vite bundle them as plain objects:

```ts
import nav from "./data/docs-nav.json";

console.log(nav.sections.length);
```

## SVG and icons

`svg(path, attrs)` inlines an SVG file and sets attributes on its root, and the [icon macro](/docs/v0.2/components/icon) builds on it. Inlined SVG inherits colour and costs no extra requests.

```jinja
{{ svg("icons/sun.svg", { class: "size-5 text-primary", "aria-hidden": "true" }) }}
```

## Listing files

`glob(pattern)` returns matching paths across the template roots, sorted. The icon gallery is generated this way, from the package's `icons/`:

```jinja
{% for path in glob("icons/*.svg") %}…{% endfor %}
```

## Assets

`asset(path)` turns a root-relative path into one relative to the page being rendered, so a layout's `<script src>` works from any depth. The bundler resolves it and names the built file after its content.

```jinja
<script type="module" src="{{ asset('app.ts') }}"></script>
```

`assetVer(path)` is the same URL with `?ver=` appended: the project's own `version` from `package.json`, plus a random suffix per dev session (`?ver=1.4.0-k3f9` in dev). Use it for assets whose name doesn't change with their content, so a browser or proxy never serves a stale copy.

```jinja
<link rel="stylesheet" href="{{ assetVer('app.css') }}">
```

A project with no `version` in `package.json` gets `assetVer()` == `asset()` in a build, and a random one in dev. It makes no difference for most files: both Bun and Vite name built assets after their content, and Bun's dev server does too, so their URLs always change with the file. It matters where a URL stays the same — Vite's dev server serves `/app.css` un-hashed, and `public/` files keep their names in `dist/`.

## Custom globals and filters

The helpers above are the ones every site needs; whatever is specific to yours goes in `globals` and `filters` in `htmx-ui.config.ts`. Both are plain JavaScript, registered before every render, so a helper of your own is available wherever a built-in one is: layouts, partials, and macros imported without `with context`.

```ts htmx-ui.config.ts
import { defineConfig, markup } from "htmx-ui-engine";

export default defineConfig({
  globals: {
    // Any value you can compute at render time…
    siteName: "Acme",
    // …or a function, called with whatever the template passes.
    docsUrl: (path: string) => `https://docs.acme.com${path}`,
    badge: (label: string) => markup(`<span class="badge">${label}</span>`),
  },
  filters: {
    slug: (text: unknown) => String(text).toLowerCase().replace(/\s+/g, "-"),
  },
});
```

```jinja
<a href="{{ docsUrl('/api') }}">{{ siteName }} API</a> <span>{{ badge("new") }}</span>
{{ "Acme Support" | slug }}
```

What you return is escaped like any other value, so a global that emits HTML wraps it in `markup()` — the same way `svg()` and `| highlight` return markup. An unknown name fails the build rather than rendering blank, which catches a typo in a helper's name too. Rendering a page yourself takes the same options: `site.render()` and the exported `render()` both accept `globals` and `filters`, alongside the `context` values a request supplies.

## Reference

| Function / filter | Description |
| --- | --- |
| `json(path)` | Parsed JSON file. Paths are relative to a template root (the project, then htmx-ui); first match wins. |
| `svg(path, attrs)` | Inline SVG with attributes set on the root <svg>. |
| `glob(pattern)` | Sorted list of root-relative paths matching the pattern. |
| `asset(path)` | Root-relative path rewritten relative to the current page (for <script src>, <link href>). |
| `assetVer(path)` | asset(path) with ?ver=<package.json version>, plus a random suffix in dev. |
| `url` | The current page's route, e.g. /docs/templates. |
| `origin` | The public site URL: url in htmx-ui.config.ts, or $SITE_URL. |
| `\| dedent` | Remove shared indentation. |
| `\| highlight(lang)` | Syntax-highlight a string at build time. |

All of them work inside imported macros too, without `with context`. Add your own with `globals` and `filters` in the config, as above.
