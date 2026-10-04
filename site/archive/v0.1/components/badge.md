---
title: "Badge"
description: "A small label for status, counts or categories."
url: "/docs/v0.1/components/badge"
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
```

## Status

Soft, tinted variants for status. They use the `--info`, `--success`, `--warning` and `--danger` tokens.

```html
<span class="badge badge-info">Info</span>
<span class="badge badge-success">Success</span>
<span class="badge badge-warning">Warning</span>
<span class="badge badge-danger">Danger</span>
```

## With a dot or icon

```html
<span class="badge badge-success badge-dot">Operational</span>
<span class="badge badge-warning badge-dot">Degraded</span>
<span class="badge badge-outline"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg> Verified</span>
```

## In context

```html
<button class="btn btn-outline">Inbox <span class="badge badge-primary">12</span></button>
<h3 class="h4 flex items-center gap-2">Billing <span class="badge badge-secondary">Beta</span></h3>
```

## Reference

| Class | Description |
| --- | --- |
| `.badge` | Base class. |
| `.badge-primary / -secondary / -outline` | Neutral and brand styles. |
| `.badge-info / -success / -warning / -danger` | Soft status colours. |
| `.badge-dot` | Adds a leading dot in the badge's text colour. |
