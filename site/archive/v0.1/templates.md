---
title: "Templates & data"
description: "Pages are Nunjucks templates rendered at build time. They can read JSON files, inline SVGs and list files, so most content needs no API server."
url: "/docs/v0.1/templates"
section: "Guides"
---

# Templates & data

Pages are Nunjucks templates rendered at build time. They can read JSON files, inline SVGs and list files, so most content needs no API server.

> **Optional** The components are plain HTML and CSS, and work with any server or template language. This page covers the Nunjucks templates of [htmx-ui-engine](/docs/v0.1/engine), which this site is built with too.

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
    <li><a href="/docs/changelog/{{ r.version }}">v{{ r.version }}</a>, {{ r.date }}</li>
  {% endfor %}
</ul>
```

```json data/changelog.json
{
  "releases": [
    { "version": "0.1.0", "date": "2026-10-02", "summary": "First release…" }
  ]
}
```

That template, live, reading this site's real file:

- [v0.1.0](/docs/v0.1/changelog/0.1.0), 2026-10-02

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

`svg(path, attrs)` inlines an SVG file and sets attributes on its root, and the [icon macro](/docs/v0.1/components/icon) builds on it. Inlined SVG inherits colour and costs no extra requests.

```jinja
{{ svg("icons/sun.svg", { class: "size-5 text-primary", "aria-hidden": "true" }) }}
```

## Listing files

`glob(pattern)` returns matching paths across the template roots, sorted. The icon gallery is generated this way, from the package's `icons/`:

```jinja
{% for path in glob("icons/*.svg") %}…{% endfor %}
```

## Reference

| Function / filter | Description |
| --- | --- |
| `json(path)` | Parsed JSON file. Paths are relative to a template root (the project, then htmx-ui); first match wins. |
| `svg(path, attrs)` | Inline SVG with attributes set on the root <svg>. |
| `glob(pattern)` | Sorted list of root-relative paths matching the pattern. |
| `asset(path)` | Root-relative path rewritten relative to the current page (for <script src>, <link href>). |
| `url` | The current page's route, e.g. /docs/templates. |
| `origin` | The public site URL: url in htmx-ui.config.ts, or $SITE_URL. |
| `\| dedent` | Remove shared indentation. |
| `\| highlight(lang)` | Syntax-highlight a string at build time. |

All of them work inside imported macros too, without `with context`.
