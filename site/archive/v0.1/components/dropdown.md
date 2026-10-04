---
title: "Dropdown"
description: "A menu of links or actions that opens from a button. Keyboard and screen-reader friendly. The docs version switcher in the sidebar is one."
url: "/docs/v0.1/components/dropdown"
section: "Components"
---

# Dropdown

A menu of links or actions that opens from a button. Keyboard and screen-reader friendly. The docs version switcher in the sidebar is one.

```html
<div class="dropdown" data-dropdown>
  <button type="button" class="btn btn-outline" data-dropdown-trigger aria-haspopup="menu" aria-expanded="false">
    Options <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
  </button>
  <div class="dropdown-menu" role="menu" hidden>
    <p class="dropdown-label">My account</p>
    <a class="dropdown-item" role="menuitem" href="#profile">Profile</a>
    <a class="dropdown-item" role="menuitem" href="#billing">Billing <span class="badge badge-secondary">Pro</span></a>
    <div class="dropdown-separator" role="separator"></div>
    <button type="button" class="dropdown-item text-danger" role="menuitem"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Delete account</button>
  </div>
</div>
```

## Markup

- Wrap the trigger and menu in `.dropdown` with `data-dropdown`.
- The trigger gets `data-dropdown-trigger`, `aria-haspopup="menu"` and `aria-expanded="false"`.
- The menu gets `role="menu"` and starts `hidden`. Each entry is a link or button with `role="menuitem"`.
- Mark the selected entry with `aria-current="true"`, and unavailable ones with `aria-disabled="true"`.

## Keyboard

| Key | Action |
| --- | --- |
| `↓` `↑` on the trigger | Open on the first / last item |
| `↓` `↑` `Home` `End` | Move between items |
| `Esc` | Close and return focus to the trigger |
| `Tab`, click outside, choose an item | Close |

## Alignment

The menu opens below the trigger, aligned to its left edge. Add `.dropdown-menu-end` to align it to the right edge, or `.dropdown-menu-up` to open it above the trigger.

```html
<div class="dropdown" data-dropdown>
  <button type="button" class="btn btn-ghost btn-icon" data-dropdown-trigger aria-haspopup="menu" aria-expanded="false" aria-label="More"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button>
  <div class="dropdown-menu dropdown-menu-end" role="menu" hidden>
    <a class="dropdown-item" role="menuitem" href="#edit">Edit</a>
    <a class="dropdown-item" role="menuitem" href="#duplicate">Duplicate</a>
    <a class="dropdown-item" role="menuitem" href="#archive" aria-disabled="true">Archive</a>
  </div>
</div>
```

## Actions with htmx

Menu items can make htmx requests like any other button. The menu closes when an item is chosen.

```html
<div class="dropdown" data-dropdown>
  <button type="button" class="btn btn-primary" data-dropdown-trigger aria-haspopup="menu" aria-expanded="false">Export <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>
  <div class="dropdown-menu" role="menu" hidden>
    <button type="button" class="dropdown-item" role="menuitem" hx-post="/api/slow" hx-target="#export-result">CSV</button>
    <button type="button" class="dropdown-item" role="menuitem" hx-post="/api/slow" hx-target="#export-result">JSON</button>
  </div>
</div>
<span id="export-result" class="muted"></span>
```

## Reference

| Class | Description |
| --- | --- |
| `.dropdown` | Positioning wrapper (relative, inline-block). |
| `.dropdown-menu` | The floating panel. Opens below, left-aligned. |
| `.dropdown-menu-end / .dropdown-menu-up` | Align to the right edge / open above. |
| `.dropdown-item` | Link or button inside the menu. aria-current and aria-disabled are styled. |
| `.dropdown-label` | Small muted heading inside the menu. |
| `.dropdown-separator` | Divider line. |
| `[data-dropdown] / [data-dropdown-trigger]` | Behaviour: open/close, keyboard navigation, outside click. |
