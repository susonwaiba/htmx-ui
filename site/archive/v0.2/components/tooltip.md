---
title: "Tooltip"
description: "A short hint that appears when an element is hovered or receives keyboard focus, on any side, with no JavaScript needed to show it."
url: "/docs/v0.2/components/tooltip"
section: "Components"
---

# Tooltip

A short hint that appears when an element is hovered or receives keyboard focus, on any side, with no JavaScript needed to show it.

```html
<span class="tooltip" data-tooltip>
  <button class="btn btn-outline">Hover</button>
  <span class="tooltip-content">Add to library</span>
</span>
```

## Markup

- Wrap the trigger and the text in `.tooltip` with `data-tooltip`. The trigger is the first focusable element inside: a button, a link, an input.
- The text is a `.tooltip-content` placed after the trigger. The behaviour gives it `role="tooltip"` and an id, and points the trigger's `aria-describedby` at it, keeping any description the trigger already had.
- Showing and hiding is CSS: the tooltip appears while the wrapper is hovered, after a short delay, and at once when the trigger gets focus from the keyboard. Clicking a button with the mouse doesn't leave its tooltip open, and on touch screens there is no hover, so a tooltip never sticks after a tap.
- The pointer can move from the trigger onto the tooltip without it closing, so its text can be selected.

A tooltip is a _description_: keep it short, plain text, and never the only place something is said. An icon-only button still needs an `aria-label`. For interactive content — links, buttons, a form — use a [popover](/docs/v0.2/components/popover), which opens on click and holds focus.

## Side

Tooltips open above their trigger. `.tooltip-content-bottom`, `.tooltip-content-left` and `.tooltip-content-right` put them on another side; the arrow follows.

```html
<span class="tooltip" data-tooltip>
  <button class="btn btn-outline">Top</button>
  <span class="tooltip-content">Opens above</span>
</span>
<span class="tooltip" data-tooltip>
  <button class="btn btn-outline">Bottom</button>
  <span class="tooltip-content tooltip-content-bottom">Opens below</span>
</span>
<span class="tooltip" data-tooltip>
  <button class="btn btn-outline">Left</button>
  <span class="tooltip-content tooltip-content-left">Opens to the left</span>
</span>
<span class="tooltip" data-tooltip>
  <button class="btn btn-outline">Right</button>
  <span class="tooltip-content tooltip-content-right">Opens to the right</span>
</span>
```

Tooltips are positioned with CSS only, so they don't flip when they would leave the screen: pick the side with room, such as `-bottom` for a toolbar at the top of the page. Like any absolutely positioned element they are clipped by an ancestor with `overflow: hidden`.

## Icon buttons and toolbars

The usual home of a tooltip: naming what an icon does, with the shortcut beside it in a [kbd](/docs/v0.2/components/kbd).

```html
<div class="btn-group" role="toolbar" aria-label="Text formatting">
  <span class="tooltip" data-tooltip>
    <button class="btn btn-outline btn-icon" aria-label="Bold"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8"/></svg></button>
    <span class="tooltip-content">Bold <kbd class="kbd">Ctrl B</kbd></span>
  </span>
  <span class="tooltip" data-tooltip>
    <button class="btn btn-outline btn-icon" aria-label="Italic"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M19 4h-9M14 20H5M15 4 9 20"/></svg></button>
    <span class="tooltip-content">Italic <kbd class="kbd">Ctrl I</kbd></span>
  </span>
  <span class="tooltip" data-tooltip>
    <button class="btn btn-outline btn-icon" aria-label="Underline"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M6 4v6a6 6 0 0 0 12 0V4M4 20h16"/></svg></button>
    <span class="tooltip-content">Underline <kbd class="kbd">Ctrl U</kbd></span>
  </span>
</div>
```

## Disabled buttons

A disabled button can't take focus, so keyboard users never reach its tooltip. Use `aria-disabled="true"` instead, which keeps it focusable and greys it out the same way, and say why it's unavailable in the tooltip:

```html
<span class="tooltip" data-tooltip>
  <button class="btn btn-primary" aria-disabled="true">Publish</button>
  <span class="tooltip-content">Add a title before publishing</span>
</span>
```

## Delay

A tooltip waits `150ms` under the pointer before it shows, so it doesn't flash while the mouse passes over a toolbar. Set `--tooltip-delay` on the wrapper (or anywhere above it) to change that:

```html
<span class="tooltip [--tooltip-delay:0ms]" data-tooltip>
  <button class="btn btn-outline">Instant</button>
  <span class="tooltip-content">No delay</span>
</span>
<span class="tooltip [--tooltip-delay:700ms]" data-tooltip>
  <button class="btn btn-outline">Patient</button>
  <span class="tooltip-content">700ms delay</span>
</span>
```

## Keyboard

`Tab` to a trigger shows its tooltip; moving focus away hides it. `Esc` hides any open tooltip without moving focus or the pointer, so it can be dismissed when it covers something. It shows again once focus moves or the pointer comes back.

## Reference

| Class / attribute | Description |
| --- | --- |
| `.tooltip` | Wrapper around the trigger and the text. Add data-tooltip. |
| `.tooltip-content` | The tooltip. Opens above the trigger, centred, with an arrow. |
| `.tooltip-content-bottom / -left / -right` | Open on another side. |
| `--tooltip-delay` | How long the pointer rests before it shows (150ms). Keyboard focus shows it at once. |
| `[data-tooltip]` | Behaviour: role="tooltip", aria-describedby on the trigger, Escape to dismiss. |
| `[data-tooltip-trigger]` | Marks the trigger when it isn't the first focusable element inside. |
