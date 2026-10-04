---
title: "Button"
description: "Triggers an action or an htmx request. Works on <button>, <a> and <input type=\"submit\">."
url: "/docs/v0.1/components/button"
section: "Components"
---

# Button

Triggers an action or an htmx request. Works on <button>, <a> and <input type="submit">.

```html
<button class="btn btn-primary">Save changes</button>
```

## Variants

Combine `.btn` with one variant class.

```html
<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary">Secondary</button>
<button class="btn btn-outline">Outline</button>
<button class="btn btn-ghost">Ghost</button>
<button class="btn btn-danger">Danger</button>
<button class="btn btn-link">Link</button>
```

## Sizes

```html
<button class="btn btn-outline btn-xs">Extra small</button>
<button class="btn btn-outline btn-sm">Small</button>
<button class="btn btn-outline">Default</button>
<button class="btn btn-outline btn-lg">Large</button>
```

## Icon

`.btn-icon` makes a square button for a single icon. It combines with every size. Give it an `aria-label`, since there's no visible text.

```html
<button class="btn btn-outline btn-icon btn-xs" aria-label="Add"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M5 12h14M12 5v14"/></svg></button>
<button class="btn btn-outline btn-icon btn-sm" aria-label="Add"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M5 12h14M12 5v14"/></svg></button>
<button class="btn btn-outline btn-icon" aria-label="Add"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M5 12h14M12 5v14"/></svg></button>
<button class="btn btn-outline btn-icon btn-lg" aria-label="Add"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M5 12h14M12 5v14"/></svg></button>
<button class="btn btn-ghost btn-icon" aria-label="Delete"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
```

## With icon

Inline SVGs next to the text are sized to match the button (16px, 12px for `.btn-xs`).

```html
<button class="btn btn-primary"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg> Download</button>
<button class="btn btn-outline">Next <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button>
<button class="btn btn-secondary btn-sm"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg> Email</button>
<button class="btn btn-ghost btn-xs"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M5 12h14M12 5v14"/></svg> Add row</button>
```

## Rounded

`.btn-rounded` gives fully rounded ends; an icon button becomes a circle.

```html
<button class="btn btn-primary btn-rounded">Get started</button>
<button class="btn btn-outline btn-rounded"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></svg> Star</button>
<button class="btn btn-secondary btn-icon btn-rounded" aria-label="Add"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M5 12h14M12 5v14"/></svg></button>
```

## As a link

```html
<a href="/docs/installation" class="btn btn-secondary">Read the guide</a>
```

## Disabled

Use the `disabled` attribute on buttons, or `aria-disabled="true"` on links.

```html
<button class="btn btn-primary" disabled>Disabled</button>
<a class="btn btn-outline" aria-disabled="true">Disabled link</a>
```

## Loading

Put a [spinner](/docs/v0.1/components/spinner) in the button. `aria-busy="true"` blocks clicks while keeping full colour; `disabled` blocks them and fades the button.

```html
<button class="btn btn-primary" aria-busy="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spinner" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.22-8.56"/></svg> Saving</button>
<button class="btn btn-outline" disabled><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spinner" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.22-8.56"/></svg> Please wait</button>
<button class="btn btn-secondary btn-icon" aria-busy="true" aria-label="Loading"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spinner" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.22-8.56"/></svg></button>
```

### While an htmx request runs

Give the spinner `.htmx-indicator`. htmx adds `.htmx-request` to the button during the request, which reveals it; until then it takes no space. `hx-disable="this"` prevents double submits.

```html
<button class="btn btn-primary" hx-post="/api/slow" hx-target="next .result" hx-disable="this">
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spinner htmx-indicator" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.22-8.56"/></svg> Save
</button>
<span class="result muted" aria-live="polite"></span>
```

> The `/api/slow` endpoint is a mock that only exists under `bun run dev`.

## Groups and toggles

Join buttons with a [button group](/docs/v0.1/components/button-group), make one switch on and off with [toggle](/docs/v0.1/components/toggle), or pick between options with a [toggle group](/docs/v0.1/components/toggle-group).

## Reference

| Class | Description |
| --- | --- |
| `.btn` | Base class. Required on every button. |
| `.btn-primary` | Solid brand colour, for the main action. |
| `.btn-secondary` | Muted fill, for secondary actions. |
| `.btn-outline` | Bordered, transparent background. |
| `.btn-ghost` | No border or fill until hovered. |
| `.btn-danger` | Destructive actions. |
| `.btn-link` | Looks like a text link, keeps button semantics. |
| `.btn-xs / .btn-sm / .btn-lg` | 24px, 32px or 44px tall instead of the default 36px. |
| `.btn-icon` | Square button for a single icon. Combine with a size. |
| `.btn-rounded` | Fully rounded ends; a circle with .btn-icon. |
| `aria-busy="true"` | Loading: ignores clicks without fading. |
