---
title: "Toggle"
description: "A two-state button that is either on or off. Any button variant can be a toggle."
url: "/docs/v0.1/components/toggle"
section: "Components"
---

# Toggle

A two-state button that is either on or off. Any button variant can be a toggle.

```html
<button class="btn btn-toggle btn-icon" data-toggle aria-pressed="false" aria-label="Bold"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8"/></svg></button>
```

## Usage

- Add `data-toggle` and `aria-pressed="false"` (or `"true"` to start on) to any `.btn`.
- Each click flips `aria-pressed`, which screen readers announce as "pressed" or "not pressed". Styles key off the same attribute.
- The button fires a bubbling `toggle:change` event with `detail.pressed`.
- Keep the label the same in both states. "Bold" pressed reads correctly; switching the text to "Not bold" doesn't.

## Any button

`.btn-toggle` is the dedicated look: muted when off, filled when on. Every other variant works too: ghost and outline fill when on, secondary turns the brand colour, and primary and danger are outlined when off and solid when on. Click them:

```html
<button class="btn btn-toggle" data-toggle aria-pressed="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M19 4h-9M14 20H5M15 4 9 20"/></svg> Toggle</button>
<button class="btn btn-ghost" data-toggle aria-pressed="false">Ghost</button>
<button class="btn btn-outline" data-toggle aria-pressed="false"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></svg> Outline</button>
<button class="btn btn-secondary" data-toggle aria-pressed="false">Secondary</button>
<button class="btn btn-primary" data-toggle aria-pressed="false">Primary</button>
<button class="btn btn-danger" data-toggle aria-pressed="false">Danger</button>
<button class="btn btn-link" data-toggle aria-pressed="false">Link</button>
```

## Sizes and shapes

```html
<button class="btn btn-toggle btn-outline btn-icon btn-sm" data-toggle aria-pressed="false" aria-label="Underline"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M6 4v6a6 6 0 0 0 12 0V4M4 20h16"/></svg></button>
<button class="btn btn-toggle btn-outline btn-icon" data-toggle aria-pressed="true" aria-label="Underline"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M6 4v6a6 6 0 0 0 12 0V4M4 20h16"/></svg></button>
<button class="btn btn-toggle btn-outline btn-icon btn-lg" data-toggle aria-pressed="false" aria-label="Underline"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M6 4v6a6 6 0 0 0 12 0V4M4 20h16"/></svg></button>
<button class="btn btn-outline btn-rounded btn-sm" data-toggle aria-pressed="false"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg> Save</button>
```

## Disabled

```html
<button class="btn btn-toggle btn-icon" data-toggle aria-pressed="false" aria-label="Bold" disabled><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8"/></svg></button>
<button class="btn btn-toggle btn-icon" data-toggle aria-pressed="true" aria-label="Italic" disabled><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M19 4h-9M14 20H5M15 4 9 20"/></svg></button>
```

## Saving with htmx

Trigger the request on `toggle:change` rather than `click`, so it runs after `aria-pressed` has flipped, and send the new state with `hx-vals`.

```html
<button class="btn btn-outline" data-toggle aria-pressed="false"
        hx-post="/api/echo" hx-trigger="toggle:change" hx-vals='js:{starred: this.getAttribute("aria-pressed")}'
        hx-target="#toggle-result"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></svg> Star</button>
<p id="toggle-result" class="muted" aria-live="polite"></p>
```

## Reference

| Class / attribute | Description |
| --- | --- |
| `.btn-toggle` | Toggle look: muted when off, filled when on. Combine with .btn-outline for a bordered one. |
| `data-toggle` | Flips aria-pressed on click and fires toggle:change { pressed }. |
| `aria-pressed` | "true" or "false". Drives the pressed style on every button variant. |
