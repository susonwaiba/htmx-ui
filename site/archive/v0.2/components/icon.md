---
title: "Icon"
description: "SVG icons stored as files in htmx-ui/icons and inlined into the HTML at build time, so they inherit colour and need no requests. They can also be linked as images."
url: "/docs/v0.2/components/icon"
section: "Components"
---

# Icon

SVG icons stored as files in htmx-ui/icons and inlined into the HTML at build time, so they inherit colour and need no requests. They can also be linked as images.

```html
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-6" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-6" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-6 text-primary" aria-hidden="true"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-6 text-success" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
```

## Usage

Icons are 24×24 Lucide-style SVGs drawn with `stroke="currentColor"`, so they take the text colour. Size them with Tailwind (`size-4`, `size-5`…). The macro inlines the file's `<svg>` and adds your class:

```jinja page.html
{% from "components/icon/icon.html" import icon %}

{{ icon("sun") }}                            {# decorative: aria-hidden #}
{{ icon("info", "size-5", label="Note") }}   {# meaningful: role="img" + aria-label #}
{{ icon("sun", mode="img") }}                {# <img> pointing at a copy of the file #}
```

## Inline or image

|  | Inline (default) | `mode="img"` |
| --- | --- | --- |
| Colour | Inherits text colour (`text-primary` works) | Fixed black stroke; the macro adds `dark:invert` |
| Requests | None, part of the HTML | One per icon; the file is content-hashed, so it caches forever |
| Use when | Almost always | Many repeats of a large SVG, or linking from elsewhere |

```html
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-6 text-primary" aria-hidden="true"><path d="M12 22a10 10 0 1 1 10-10c0 2.76-2.24 4-5 4h-1.5a1.5 1.5 0 0 0-1 2.6A1.5 1.5 0 0 1 12 22Z"/><circle cx="7.5" cy="11.5" r="1"/><circle cx="10.5" cy="7.5" r="1"/><circle cx="15.5" cy="8.5" r="1"/></svg>
<img src="../../../../packages/ui/src/icons/palette.svg" class="size-6 dark:invert" width="24" height="24" alt="" aria-hidden="true" />
```

In `img` mode the bundler copies the SVG next to the page with a content hash in its name (`sun-a1b2c3.svg`), so a changed icon is never served stale.

Separately, this site's build copies the package's `icons/` to `dist/assets/icons/` with **unchanged** names. `/assets/icons/<name>.svg` is therefore a stable URL for linking from other sites, emails or docs, e.g. [/assets/icons/sun.svg](/assets/icons/sun.svg).

## Any SVG

The `svg()` template function inlines any SVG file under a template root (your project, then htmx-ui), setting or overriding attributes on its root element:

```jinja
{{ svg("images/logo.svg", { class: "h-8 w-auto", "aria-label": "HTMX UI", role: "img" }) }}
```

## Adding an icon

1. Save a 24×24 SVG with `stroke="currentColor"` (or `fill="currentColor"`) as `icons/<name>.svg` in your project; your file wins over a package icon of the same name. [Lucide](https://lucide.dev) icons drop straight in.
2. Use it: `{{ icon("<name>") }}`. A misspelt name fails the build.

## All icons

91 icons, listed straight from the package's `icons/` with `glob()`:

Icon names: alert-triangle, align-center, align-left, align-right, arrow-down, arrow-left, arrow-right, arrow-up-right, arrow-up, asterisk, badge-check, bar-chart, bell, bold, book, bookmark, bot, box, calendar, check-circle, check, chevron-down, chevron-left, chevron-right, chevron-up, chevrons-left, chevrons-right, chevrons-up-down, circle-alert, circle, cloud, code, command, copy, corner-down-left, credit-card, download, ellipsis-vertical, ellipsis, external-link, eye, file-text, file, folder-open, folder-plus, folder, history, house, image, inbox, info, italic, layers, link, loader-spokes, loader, log-in, log-out, mail, menu, message-square, minus, monitor, moon, music, palette, panel-left, panel-right, paperclip, play, plus, refresh-cw, search, send, server, settings, shield-check, slash, sparkles, star, sun, terminal, trash, underline, upload, user, users, video, x-circle, x, zap

## Reference

| Macro / function | Description |
| --- | --- |
| `icon(name, class="size-4")` | Inline icons/<name>.svg with a class. aria-hidden by default. |
| `icon(name, label="…")` | Meaningful icon: role="img" and aria-label instead of aria-hidden. |
| `icon(name, mode="img")` | <img> of a hashed copy of the file instead of inlining. |
| `svg(path, attrs)` | Inline any SVG under a template root, setting attributes on the root <svg>. |
