---
title: "Badge"
description: "A small label for status, counts or categories."
url: "/docs/v0.2/components/badge"
section: "Components"
---

# Badge

A small label for status, counts or categories.

```html
<span class="badge badge-primary">New</span>
```

## Variants

```html
<span class="badge badge-primary">Primary</span>
<span class="badge badge-secondary">Secondary</span>
<span class="badge badge-outline">Outline</span>
<span class="badge badge-ghost">Ghost</span>
<span class="badge badge-link">Link</span>
```

## Status

Soft, tinted variants for status. They use the `--info`, `--success`, `--warning` and `--danger` tokens.

```html
<span class="badge badge-info">Info</span>
<span class="badge badge-success">Success</span>
<span class="badge badge-warning">Warning</span>
<span class="badge badge-danger">Danger</span>
```

Add `.badge-solid` to fill one with its colour, for status that has to stand out, such as a destructive one.

```html
<span class="badge badge-info badge-solid">Info</span>
<span class="badge badge-success badge-solid">Success</span>
<span class="badge badge-warning badge-solid">Warning</span>
<span class="badge badge-danger badge-solid">Destructive</span>
```

## With a dot or icon

Icons go before or after the text and are sized to it.

```html
<span class="badge badge-success badge-dot">Operational</span>
<span class="badge badge-warning badge-dot">Degraded</span>
<span class="badge badge-outline"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/></svg> Verified</span>
<span class="badge badge-secondary"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></svg> Featured</span>
<span class="badge badge-primary">Next <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span>
```

## With a spinner

A [spinner](/docs/v0.2/components/spinner) inside a badge takes the icon size. With `.htmx-indicator`, it takes no space until the badge's request starts.

```html
<span class="badge badge-secondary"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spinner" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.22-8.56"/></svg> Syncing</span>
<span class="badge badge-info"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spinner" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.22-8.56"/></svg> Deploying</span>
<span class="badge badge-outline"><span class="spinner" aria-hidden="true"></span> Queued</span>
```

## Link

A badge can be an `<a>` (or a `<button>`): it gets a hover state in its variant and a focus ring.

```html
<a class="badge badge-primary" href="#badge">Open <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
<a class="badge badge-outline" href="#badge"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> Docs</a>
<a class="badge badge-ghost" href="#badge">#htmx</a>
<a class="badge badge-success" href="#badge"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg> Passing</a>
<a class="badge badge-link" href="#badge">View changelog <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg></a>
```

## Custom colours

For a tinted badge in any colour, add `.badge-tone` and set `--badge-tone`: it gets the same border, background and hover as the status variants, and works with `.badge-solid`. For anything else, colour utilities override the badge's own colours.

```html
<span class="badge badge-tone [--badge-tone:var(--color-violet-600)] dark:[--badge-tone:var(--color-violet-400)]">Design</span>
<span class="badge badge-tone [--badge-tone:var(--color-pink-600)] dark:[--badge-tone:var(--color-pink-400)]">Research</span>
<span class="badge badge-tone badge-solid [--badge-tone:var(--color-teal-600)] dark:[--badge-tone:var(--color-teal-400)]">Shipped</span>
<span class="badge bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">Utilities</span>
<span class="badge bg-linear-to-r from-indigo-500 to-pink-500 text-white">Gradient</span>
```

## In context

```html
<button class="btn btn-outline">Inbox <span class="badge badge-primary">12</span></button>
<h3 class="h4 flex items-center gap-2">Billing <span class="badge badge-secondary">Beta</span></h3>
```

## Reference

| Class | Description |
| --- | --- |
| `.badge` | Base class. On an <a> or <button>: hover state and focus ring. |
| `.badge-primary / -secondary / -outline / -ghost / -link` | Neutral and brand styles. |
| `.badge-info / -success / -warning / -danger` | Soft status colours. |
| `.badge-solid` | With a status or .badge-tone: filled with its colour. |
| `.badge-tone` | Tinted with any colour in --badge-tone. Set --badge-solid-foreground for the text of a solid one. |
| `.badge-dot` | Adds a leading dot in the badge's text colour. |
