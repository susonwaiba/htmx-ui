---
title: "Spinner"
description: "An indicator that shows a loading state. Any icon can spin, or use a pure-CSS ring when there is no icon to hand."
url: "/docs/v0.1/components/spinner"
section: "Components"
---

# Spinner

An indicator that shows a loading state. Any icon can spin, or use a pure-CSS ring when there is no icon to hand.

```html
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spinner" role="status" aria-label="Loading"><path d="M21 12a9 9 0 1 1-6.22-8.56"/></svg>
```

## Usage

Add `.spinner` to an SVG icon and it spins. The `spinner()` macro inlines an icon from `icons/` with the class and accessibility attributes set: `role="status"` and an `aria-label` of "Loading".

```html
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spinner" role="status" aria-label="Saving"><path d="M21 12a9 9 0 1 1-6.22-8.56"/></svg>
```

## Custom icon

Pass any icon name to the macro, or put `.spinner` on your own SVG.

```html
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spinner" role="status" aria-label="Loading"><path d="M21 12a9 9 0 1 1-6.22-8.56"/></svg>
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spinner" role="status" aria-label="Loading"><path d="M12 2v4M16.2 7.8l2.9-2.9M18 12h4M16.2 16.2l2.9 2.9M12 18v4M4.9 19.1l2.9-2.9M2 12h4M4.9 4.9l2.9 2.9"/></svg>
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spinner" role="status" aria-label="Loading"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
```

## Without an icon

On any element other than an SVG, `.spinner` draws a ring with CSS. Use it in markup that can't inline icons, such as HTML fragments built by your server.

```html
<span class="spinner" role="status" aria-label="Loading"></span>
<span class="spinner spinner-lg text-primary" role="status" aria-label="Loading"></span>
```

## Sizes

Use `.spinner-sm` (12px), the default (16px), `.spinner-lg` (24px) and `.spinner-xl` (32px), or any `size-*` utility.

```html
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spinner spinner-sm" role="status" aria-label="Loading"><path d="M21 12a9 9 0 1 1-6.22-8.56"/></svg>
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spinner" role="status" aria-label="Loading"><path d="M21 12a9 9 0 1 1-6.22-8.56"/></svg>
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spinner spinner-lg" role="status" aria-label="Loading"><path d="M21 12a9 9 0 1 1-6.22-8.56"/></svg>
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spinner spinner-xl" role="status" aria-label="Loading"><path d="M21 12a9 9 0 1 1-6.22-8.56"/></svg>
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spinner size-12" role="status" aria-label="Loading"><path d="M21 12a9 9 0 1 1-6.22-8.56"/></svg>
```

## Colour

Spinners use the current text colour, so `text-*` utilities recolour them.

```html
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spinner spinner-lg text-primary" role="status" aria-label="Loading"><path d="M21 12a9 9 0 1 1-6.22-8.56"/></svg>
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spinner spinner-lg text-success" role="status" aria-label="Loading"><path d="M21 12a9 9 0 1 1-6.22-8.56"/></svg>
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spinner spinner-lg text-warning" role="status" aria-label="Loading"><path d="M21 12a9 9 0 1 1-6.22-8.56"/></svg>
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spinner spinner-lg text-muted-foreground" role="status" aria-label="Loading"><path d="M21 12a9 9 0 1 1-6.22-8.56"/></svg>
```

## In a button

Inside a `.btn`, the spinner takes the button's icon size. When the button text already says what's happening, pass `label=none` so the spinner is hidden from screen readers. `aria-busy="true"` makes the button ignore clicks without fading it like `disabled` does.

```html
<button class="btn btn-primary" aria-busy="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spinner" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.22-8.56"/></svg> Saving</button>
<button class="btn btn-outline" disabled><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spinner" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.22-8.56"/></svg> Please wait</button>
<button class="btn btn-secondary btn-sm" disabled><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spinner" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.22-8.56"/></svg> Loading</button>
<button class="btn btn-outline btn-icon" aria-busy="true" aria-label="Refresh"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spinner" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.22-8.56"/></svg></button>
```

## In a badge

```html
<span class="badge badge-secondary"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spinner" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.22-8.56"/></svg> Syncing</span>
<span class="badge badge-outline"><span class="spinner" aria-hidden="true"></span> Deploying</span>
<span class="badge badge-info"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spinner" aria-hidden="true"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg> Updating</span>
```

## In a button group

```html
<div class="btn-group" role="group" aria-label="Sync">
  <button class="btn btn-outline" aria-busy="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spinner" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.22-8.56"/></svg> Syncing</button>
  <button class="btn btn-outline btn-icon" aria-label="Cancel"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
</div>
```

## In an input group

```html
<div class="input-group max-w-sm">
  <input class="input" type="search" value="htmx" aria-label="Search" />
  <span class="input-group-addon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></span>
  <span class="input-group-addon input-group-addon-inline-end"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spinner" role="status" aria-label="Loading"><path d="M21 12a9 9 0 1 1-6.22-8.56"/></svg></span>
</div>
```

## With htmx requests

Add `.htmx-indicator` to show a spinner only while a request runs. Inside a button, badge or input-group addon it takes no space until then. Add `.htmx-indicator-hide` to an icon to swap it for the spinner.

```html
<div class="flex flex-wrap items-center gap-3">
  <button class="btn btn-primary" hx-post="/api/slow" hx-target="#spinner-result" hx-disable="this">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spinner htmx-indicator" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.22-8.56"/></svg> Save
  </button>
  <button class="btn btn-outline" hx-post="/api/slow" hx-target="#spinner-result" hx-disable="this">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="htmx-indicator-hide" aria-hidden="true"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spinner htmx-indicator" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.22-8.56"/></svg> Refresh
  </button>
</div>
<p id="spinner-result" class="muted" aria-live="polite"></p>
```

> The `/api/slow` endpoint is a mock that only exists under `bun run dev`.

## Reference

| Class | Description |
| --- | --- |
| `.spinner` | Spins an SVG icon. On any other element, draws a CSS ring. |
| `.spinner-sm / -lg / -xl` | 12px, 24px or 32px instead of 16px. |
| `.htmx-indicator-hide` | Hidden while the htmx request it's inside runs. |

| Macro | Description |
| --- | --- |
| `spinner(icon="loader", class="", label="Loading", id=none)` | Inlines icons/<icon>.svg as a spinner. label=none hides it from assistive technology. |
