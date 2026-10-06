---
title: "Skeleton"
description: "Placeholders in the shape of content that is still loading: any shape from utilities, ready-made avatars, text, cards, lists, tables and forms."
url: "/docs/v0.2/components/skeleton"
section: "Components"
---

# Skeleton

Placeholders in the shape of content that is still loading: any shape from utilities, ready-made avatars, text, cards, lists, tables and forms.

```html
<div class="flex items-center gap-4" role="status" aria-busy="true">
  <span class="sr-only">Loading…</span>
  <div class="skeleton skeleton-circle size-12" aria-hidden="true"></div>
  <div class="flex flex-col gap-2" aria-hidden="true">
    <div class="skeleton h-4 w-56"></div>
    <div class="skeleton h-4 w-40"></div>
  </div>
</div>
```

## Markup

- `.skeleton` is a muted, pulsing block. Its shape is yours: size it with utilities (`h-4 w-48`, `size-12`, `aspect-video`), round it with `.skeleton-circle` or any `rounded-*`.
- Mark the loading region `aria-busy="true"` with a text alternative (`<span class="sr-only">Loading…</span>`, or `role="status"` and a label), and the shapes `aria-hidden="true"`: they mean nothing read aloud.
- No JavaScript: the skeleton is whatever stands in the page until htmx swaps the real content over it.

## Shapes

Ready-made shapes take the size of the thing they stand for: `.skeleton-avatar` (as `.avatar-lg`), `.skeleton-button` and `.skeleton-input` (as `.btn` and `.input`), `.skeleton-badge`, `.skeleton-image` (16:9). Utilities still resize them.

```html
<div class="skeleton-avatar" aria-hidden="true"></div>
<div class="skeleton-avatar size-8" aria-hidden="true"></div>
<div class="skeleton-badge" aria-hidden="true"></div>
<div class="skeleton-button" aria-hidden="true"></div>
<div class="skeleton-input w-48" aria-hidden="true"></div>
<div class="skeleton size-16 rounded-xl" aria-hidden="true"></div>
<div class="skeleton-image w-40" aria-hidden="true"></div>
```

## Text

`.skeleton-text` is one line, `1em` high, so it follows the font size it sits in; `.skeleton-heading` is a heading-sized line at half width. Stack lines in `.skeleton-lines` and the last one comes out shorter, like the end of a paragraph.

```html
<div class="text-2xl" aria-hidden="true"><div class="skeleton-heading"></div></div>
<div class="skeleton-lines text-sm" aria-hidden="true">
  <div class="skeleton-text"></div>
  <div class="skeleton-text"></div>
  <div class="skeleton-text"></div>
</div>
```

## Animation

Shapes pulse. `.skeleton-shimmer`, on a shape or on any ancestor, sweeps a highlight across instead; `.skeleton-static` stops the motion. Both stop for readers who prefer reduced motion.

```html
<div class="skeleton-shimmer flex items-center gap-4" aria-hidden="true">
  <div class="skeleton-avatar"></div>
  <div class="skeleton-lines text-sm"><div class="skeleton-text"></div><div class="skeleton-text"></div></div>
</div>
<div class="skeleton-static flex items-center gap-4" aria-hidden="true">
  <div class="skeleton-avatar"></div>
  <div class="skeleton-lines text-sm"><div class="skeleton-text"></div><div class="skeleton-text"></div></div>
</div>
```

## Avatar, card, list, table and form

Macros in `components/skeleton/skeleton.html` build common placeholders from these shapes, each as a loading region (`role="status"`, `aria-busy`, a hidden "Loading…"). They take `label`, `shimmer` and `class`.

```jinja
{% from "components/skeleton/skeleton.html" import skeleton_text, skeleton_avatar, skeleton_card, skeleton_list, skeleton_table, skeleton_form %}

{{ skeleton_avatar(lines=2) }}
{{ skeleton_card(media=true, lines=2, footer=true, shimmer=true) }}
{{ skeleton_list(items=3, avatar=true) }}
{{ skeleton_table(rows=4, columns=4) }}
{{ skeleton_form(fields=2) }}
{{ skeleton_text(lines=3, label="Loading the article…") }}
```

## With htmx

Put the skeleton where the content will go and let htmx replace it: `hx-trigger="load"` fetches straight away (`revealed` when it scrolls into view) and `hx-swap="outerHTML"` swaps the placeholder for the response.

```html
    <div class="w-full max-w-sm" hx-get="/api/skeleton" hx-trigger="load" hx-swap="outerHTML">
      <div class="card w-full overflow-hidden" role="status" aria-busy="true">
  <span class="sr-only">Loading…</span>
  <div class="card-header" aria-hidden="true">
    <div class="skeleton-heading w-2/3 text-base"></div>
  </div>
  <div class="card-content text-sm" aria-hidden="true">
    <div class="skeleton-lines"><div class="skeleton-text"></div></div>
  </div>
  <div class="card-footer gap-2" aria-hidden="true">
    <div class="skeleton-button"></div>
    <div class="skeleton-button w-20"></div>
  </div>
</div>
    </div>
```

For a reload of content already on the page, show a skeleton as the request's indicator: `hx-indicator` points at it, and the `.htmx-indicator` class keeps it hidden until a request is in flight.

## Reference

| Class | Description |
| --- | --- |
| `.skeleton` | A muted block that pulses; shape it with utilities. |
| `.skeleton-circle` | Fully rounded. |
| `.skeleton-text / .skeleton-heading` | A line of text (1em high), a heading line (1.5em, half width). |
| `.skeleton-lines` | A paragraph of .skeleton-text; the last line is shorter. |
| `.skeleton-avatar / -button / -input / -badge / -image` | Shapes sized like those components. |
| `.skeleton-shimmer` | On a shape or an ancestor: a sweeping highlight instead of the pulse. |
| `.skeleton-static` | No animation. |
| `skeleton_text() … skeleton_form()` | Macros: placeholders for text, avatars, cards, lists, tables and forms. |
