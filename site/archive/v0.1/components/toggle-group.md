---
title: "Toggle group"
description: "A set of two-state buttons. Pick exactly one, at most one, or any number."
url: "/docs/v0.1/components/toggle-group"
section: "Components"
---

# Toggle group

A set of two-state buttons. Pick exactly one, at most one, or any number.

```html
<div class="toggle-group btn-group" role="group" aria-label="Text alignment" data-toggle-group="single" data-toggle-group-required>
  <button class="btn btn-outline btn-icon" aria-pressed="true" value="left" aria-label="Align left"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M15 12H3M17 18H3M21 6H3"/></svg></button>
  <button class="btn btn-outline btn-icon" aria-pressed="false" value="center" aria-label="Align center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M17 12H7M19 18H5M21 6H3"/></svg></button>
  <button class="btn btn-outline btn-icon" aria-pressed="false" value="right" aria-label="Align right"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M21 12H9M21 18H7M21 6H3"/></svg></button>
</div>
```

Use a toggle group for buttons that **switch a state**. For buttons that perform actions, use a [button group](/docs/v0.1/components/button-group).

## Usage

- Wrap the buttons in `.toggle-group` with `data-toggle-group`, `role="group"` and an `aria-label`.
- Each button gets `aria-pressed`, and a `value` to identify it. They don't need `data-toggle`; the group handles them.
- The group is one tab stop. `←` `→` `↑` `↓` `Home` `End` move between buttons; `Space` or `Enter` presses.
- Every change fires a bubbling `toggle-group:change` event with `detail.value`: the pressed buttons' values.

## Single

`data-toggle-group="single"`: pressing a button releases the others. Pressing the pressed one releases it, leaving none. Add `data-toggle-group-required` to keep exactly one pressed, as in the alignment example at the top.

```html
<div class="toggle-group" role="group" aria-label="Plan" data-toggle-group="single">
  <button class="btn btn-toggle btn-sm" aria-pressed="false" value="monthly">Monthly</button>
  <button class="btn btn-toggle btn-sm" aria-pressed="true" value="yearly">Yearly</button>
  <button class="btn btn-toggle btn-sm" aria-pressed="false" value="lifetime">Lifetime</button>
</div>
```

## Multiple

`data-toggle-group="multiple"`: each button toggles on its own.

```html
<div class="toggle-group" role="group" aria-label="Text formatting" data-toggle-group="multiple">
  <button class="btn btn-toggle btn-icon" aria-pressed="true" value="bold" aria-label="Bold"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8"/></svg></button>
  <button class="btn btn-toggle btn-icon" aria-pressed="false" value="italic" aria-label="Italic"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M19 4h-9M14 20H5M15 4 9 20"/></svg></button>
  <button class="btn btn-toggle btn-icon" aria-pressed="false" value="underline" aria-label="Underline"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M6 4v6a6 6 0 0 0 12 0V4M4 20h16"/></svg></button>
</div>
```

## Joined or spaced

A `.toggle-group` spaces its buttons. Add `.btn-group` to join them like a [button group](/docs/v0.1/components/button-group), with all of its options: sizes, vertical, separators.

```html
<div class="toggle-group btn-group btn-group-sm" role="group" aria-label="Size" data-toggle-group="single" data-toggle-group-required>
  <button class="btn btn-outline" aria-pressed="false" value="s">S</button>
  <button class="btn btn-outline" aria-pressed="true" value="m">M</button>
  <button class="btn btn-outline" aria-pressed="false" value="l">L</button>
  <button class="btn btn-outline" aria-pressed="false" value="xl">XL</button>
</div>
<div class="toggle-group btn-group" role="group" aria-label="View" data-toggle-group="single" data-toggle-group-required>
  <button class="btn btn-secondary" aria-pressed="true" value="list">List</button>
  <div class="btn-group-separator" role="separator"></div>
  <button class="btn btn-secondary" aria-pressed="false" value="board">Board</button>
</div>
```

## Vertical

```html
<div class="toggle-group toggle-group-vertical" role="group" aria-label="Filters" data-toggle-group="multiple">
  <button class="btn btn-toggle justify-start" aria-pressed="true" value="open"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg> Open</button>
  <button class="btn btn-toggle justify-start" aria-pressed="false" value="closed"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/></svg> Closed</button>
  <button class="btn btn-toggle justify-start" aria-pressed="false" value="draft"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4M10 9H8M16 13H8M16 17H8"/></svg> Draft</button>
</div>
```

## Disabled

Disabled buttons are skipped by clicks and arrow keys.

```html
<div class="toggle-group" role="group" aria-label="Text formatting" data-toggle-group="multiple">
  <button class="btn btn-toggle btn-icon" aria-pressed="false" value="bold" aria-label="Bold"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8"/></svg></button>
  <button class="btn btn-toggle btn-icon" aria-pressed="false" value="italic" aria-label="Italic" disabled><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M19 4h-9M14 20H5M15 4 9 20"/></svg></button>
  <button class="btn btn-toggle btn-icon" aria-pressed="false" value="underline" aria-label="Underline"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M6 4v6a6 6 0 0 0 12 0V4M4 20h16"/></svg></button>
</div>
```

## With htmx

Buttons with a `name` send their `value` with the request they trigger, so each button can post the choice by itself:

```html
<div class="toggle-group btn-group" role="group" aria-label="Theme" data-toggle-group="single" data-toggle-group-required>
  <button class="btn btn-outline" aria-pressed="true" name="theme" value="light" hx-post="/api/echo" hx-target="#toggle-group-result"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg> Light</button>
  <button class="btn btn-outline" aria-pressed="false" name="theme" value="dark" hx-post="/api/echo" hx-target="#toggle-group-result"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg> Dark</button>
  <button class="btn btn-outline" aria-pressed="false" name="theme" value="system" hx-post="/api/echo" hx-target="#toggle-group-result"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8M12 17v4"/></svg> System</button>
</div>
<p id="toggle-group-result" class="muted" aria-live="polite"></p>
```

## Reference

| Class / attribute | Description |
| --- | --- |
| `.toggle-group` | Spaced row of toggle buttons. Add .btn-group to join them. |
| `.toggle-group-vertical` | Stacks the buttons. |
| `data-toggle-group="single"` | Pressing a button releases the others. |
| `data-toggle-group="multiple"` | Buttons toggle independently. |
| `data-toggle-group-required` | With single: one button always stays pressed. |
| `toggle-group:change` | Event fired on the group; detail.value lists the pressed buttons' values. |
