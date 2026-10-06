---
title: "Kbd"
description: "Shows keyboard input: a single key or a shortcut, on its own or inside buttons, tooltips and input groups."
url: "/docs/v0.2/components/kbd"
section: "Components"
---

# Kbd

Shows keyboard input: a single key or a shortcut, on its own or inside buttons, tooltips and input groups.

```html
<kbd class="kbd-group">
  <kbd class="kbd"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"/></svg></kbd>
  <kbd class="kbd">Shift</kbd>
  <kbd class="kbd">Alt</kbd>
  <kbd class="kbd">Ctrl</kbd>
</kbd>
<kbd class="kbd-group">
  <kbd class="kbd">Ctrl</kbd>
  <span>+</span>
  <kbd class="kbd">B</kbd>
</kbd>
```

## Markup

- A key is a `<kbd class="kbd">`. It holds text (`Esc`, `K`, `↵`) or an [icon](/docs/v0.2/components/icon), which is sized to the key.
- A shortcut of several keys is a `.kbd-group` around them, with any text between: `+`, `then`. Make the group a `<kbd>` too, as HTML nests `<kbd>` for a key combination.
- Give an icon key a name for screen readers when the symbol alone could be misread: `icon("command", label="Command")`.
- Inside `.prose`, a bare `<kbd>` is already styled by the [text](/docs/v0.2/components/text) styles; use `.kbd` in UI.

## Group

Keys in a sentence: `.kbd-group` keeps a shortcut together and spaces its keys evenly.

```html
<p class="text-sm text-muted-foreground">
  Use
  <kbd class="kbd-group"><kbd class="kbd">Ctrl</kbd><span>+</span><kbd class="kbd">B</kbd></kbd>
  or
  <kbd class="kbd-group"><kbd class="kbd">Ctrl</kbd><span>+</span><kbd class="kbd">K</kbd></kbd>
  to open the command palette.
</p>
```

## Button

A key at the end of a [button](/docs/v0.2/components/button) shows its shortcut. On filled buttons it becomes a translucent chip of the button's text colour; in small buttons it shrinks with them.

```html
<button class="btn btn-outline">Accept <kbd class="kbd">↵</kbd></button>
<button class="btn btn-outline btn-sm">Cancel <kbd class="kbd">Esc</kbd></button>
<button class="btn btn-primary">Save <kbd class="kbd-group"><kbd class="kbd"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"/></svg></kbd><kbd class="kbd">S</kbd></kbd></button>
<button class="btn btn-danger btn-sm">Delete <kbd class="kbd">Del</kbd></button>
```

## Tooltip

In a [tooltip](/docs/v0.2/components/tooltip) the key inverts with it, so it reads in both themes.

```html
<div class="btn-group">
  <span class="tooltip" data-tooltip>
    <button class="btn btn-outline btn-sm">Save</button>
    <span class="tooltip-content">Save changes <kbd class="kbd">S</kbd></span>
  </span>
  <span class="tooltip" data-tooltip>
    <button class="btn btn-outline btn-sm">Print</button>
    <span class="tooltip-content">Print document <kbd class="kbd-group"><kbd class="kbd">Ctrl</kbd><kbd class="kbd">P</kbd></kbd></span>
  </span>
</div>
```

## Input group

A key in an [input group](/docs/v0.2/components/input-group) addon hints at the shortcut that focuses the field, like the search box at the top of this page.

```html
<div class="input-group max-w-xs">
  <input class="input" type="search" placeholder="Search…" aria-label="Search" />
  <span class="input-group-addon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></span>
  <span class="input-group-addon input-group-addon-inline-end">
    <kbd class="kbd-group"><kbd class="kbd"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"/></svg></kbd><kbd class="kbd">K</kbd></kbd>
  </span>
</div>
```

## Reference

| Class | Description |
| --- | --- |
| `.kbd` | One key: text or an icon. |
| `.kbd-group` | Keys of one shortcut, with optional text between them. |
