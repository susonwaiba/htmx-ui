---
title: "Dropdown"
description: "A menu of links, actions and options that opens from a button, with checkbox and radio items, shortcuts and submenus. Keyboard and screen-reader friendly. The docs version switcher in the sidebar is one."
url: "/docs/v0.2/components/dropdown"
section: "Components"
---

# Dropdown

A menu of links, actions and options that opens from a button, with checkbox and radio items, shortcuts and submenus. Keyboard and screen-reader friendly. The docs version switcher in the sidebar is one.

```html
<div class="dropdown" data-dropdown>
  <button type="button" class="btn btn-outline" data-dropdown-trigger aria-haspopup="menu" aria-expanded="false">
    Options <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
  </button>
  <div class="dropdown-menu w-56" role="menu" hidden>
    <p class="dropdown-label">My account</p>
    <a class="dropdown-item" role="menuitem" href="#profile">Profile <span class="dropdown-shortcut">⇧⌘P</span></a>
    <a class="dropdown-item" role="menuitem" href="#billing">Billing <span class="badge badge-secondary">Pro</span></a>
    <a class="dropdown-item" role="menuitem" href="#settings">Settings <span class="dropdown-shortcut">⌘,</span></a>
    <div class="dropdown-separator" role="separator"></div>
    <a class="dropdown-item" role="menuitem" href="#team">Team</a>
    <div class="dropdown-sub">
      <button type="button" class="dropdown-item" role="menuitem" aria-haspopup="menu" aria-expanded="false">Invite users <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></button>
      <div class="dropdown-menu" role="menu" hidden>
        <button type="button" class="dropdown-item" role="menuitem">Email</button>
        <button type="button" class="dropdown-item" role="menuitem">Message</button>
        <div class="dropdown-separator" role="separator"></div>
        <button type="button" class="dropdown-item" role="menuitem">More…</button>
      </div>
    </div>
    <button type="button" class="dropdown-item" role="menuitem" aria-disabled="true">API</button>
    <div class="dropdown-separator" role="separator"></div>
    <button type="button" class="dropdown-item dropdown-item-destructive" role="menuitem"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Delete account</button>
  </div>
</div>
```

## Markup

- Wrap the trigger and menu in `.dropdown` with `data-dropdown`.
- The trigger gets `data-dropdown-trigger`, `aria-haspopup="menu"` and `aria-expanded="false"`.
- The menu gets `role="menu"` and starts `hidden`. Each entry is a link or button with `role="menuitem"`.
- Mark the selected entry with `aria-current="true"`, and unavailable ones with `aria-disabled="true"`.
- Add a `.dropdown-label` heading and `.dropdown-separator` lines (`role="separator"`) between sections as needed.

The behaviour sets the rest: menu items get `tabindex="-1"` (focus moves with the arrow keys) and the trigger is linked to the menu with `aria-controls`. The same menu classes and behaviour make up each menu of a [menubar](/docs/v0.2/components/menubar).

## Icons and shortcuts

Put an `icon()` before an item's text; icons in items are muted and sized to match. `.dropdown-shortcut` right-aligns a keyboard hint (a `.kbd` or a `.badge` sits there too). The hint is only text: the dropdown doesn't bind the key. If your page handles it, say so with `aria-keyshortcuts` on the item.

```html
<div class="dropdown" data-dropdown>
  <button type="button" class="btn btn-outline" data-dropdown-trigger aria-haspopup="menu" aria-expanded="false">Edit <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>
  <div class="dropdown-menu w-56" role="menu" hidden>
    <button type="button" class="dropdown-item" role="menuitem"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg> Copy <span class="dropdown-shortcut">⌘C</span></button>
    <button type="button" class="dropdown-item" role="menuitem"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> Copy link <span class="dropdown-shortcut">⇧⌘C</span></button>
    <button type="button" class="dropdown-item" role="menuitem"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg> Download <span class="kbd">D</span></button>
    <div class="dropdown-separator" role="separator"></div>
    <button type="button" class="dropdown-item" role="menuitem"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg> Settings</button>
  </div>
</div>
```

## Checkbox items

An item with `role="menuitemcheckbox"` and `aria-checked="true"` or `"false"` toggles when chosen, showing a check in an inset slot on the left. Give plain items and labels next to them `.dropdown-item-inset` so their text lines up.

```html
<div class="dropdown" data-dropdown>
  <button type="button" class="btn btn-outline" data-dropdown-trigger aria-haspopup="menu" aria-expanded="false">Appearance <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>
  <div class="dropdown-menu w-56" role="menu" hidden>
    <p class="dropdown-label dropdown-item-inset">Show</p>
    <button type="button" class="dropdown-item" role="menuitemcheckbox" aria-checked="true">Status bar</button>
    <button type="button" class="dropdown-item" role="menuitemcheckbox" aria-checked="false" aria-disabled="true">Activity bar</button>
    <button type="button" class="dropdown-item" role="menuitemcheckbox" aria-checked="false">Panel</button>
    <div class="dropdown-separator" role="separator"></div>
    <button type="button" class="dropdown-item dropdown-item-inset" role="menuitem">Reset</button>
  </div>
</div>
```

## Radio items

Items with `role="menuitemradio"` inside a `role="group"` are a set: choosing one checks it and unchecks the rest of the group (without a group, the rest of the menu). Label the group with `aria-label`, or with `aria-labelledby` pointing at its `.dropdown-label`.

```html
<div class="dropdown" data-dropdown>
  <button type="button" class="btn btn-outline" data-dropdown-trigger aria-haspopup="menu" aria-expanded="false">Panel position <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>
  <div class="dropdown-menu w-56" role="menu" hidden>
    <p class="dropdown-label dropdown-item-inset" id="dropdown-position-label">Panel position</p>
    <div role="group" aria-labelledby="dropdown-position-label">
      <button type="button" class="dropdown-item" role="menuitemradio" aria-checked="true">Top</button>
      <button type="button" class="dropdown-item" role="menuitemradio" aria-checked="false">Bottom</button>
      <button type="button" class="dropdown-item" role="menuitemradio" aria-checked="false">Right</button>
    </div>
  </div>
</div>
```

Choosing a checkbox or radio item closes the menu like any other item. Add `data-keep-open` to an item, a group or the whole menu to keep it open instead, so several options can be set in a row:

```html
<div class="dropdown" data-dropdown>
  <button type="button" class="btn btn-outline" data-dropdown-trigger aria-haspopup="menu" aria-expanded="false">Columns <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>
  <div class="dropdown-menu" role="menu" data-keep-open hidden>
    <button type="button" class="dropdown-item" role="menuitemcheckbox" aria-checked="true">Name</button>
    <button type="button" class="dropdown-item" role="menuitemcheckbox" aria-checked="true">Email</button>
    <button type="button" class="dropdown-item" role="menuitemcheckbox" aria-checked="false">Phone</button>
    <button type="button" class="dropdown-item" role="menuitemcheckbox" aria-checked="false">Last seen</button>
  </div>
</div>
```

## Submenus

Wrap an item and a nested menu in `.dropdown-sub`. The item gets `aria-haspopup="menu"`, `aria-expanded="false"` and a `chevron-right` icon, which sits at the right edge. The submenu opens beside it on hover (after a short delay), on click, or with `→`, `Enter` or `Space`; `←` and `Esc` close it. Near the edge of the window it opens to the left or upwards instead.

```html
<div class="dropdown" data-dropdown>
  <button type="button" class="btn btn-outline" data-dropdown-trigger aria-haspopup="menu" aria-expanded="false">Share <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>
  <div class="dropdown-menu" role="menu" hidden>
    <button type="button" class="dropdown-item" role="menuitem"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> Copy link</button>
    <div class="dropdown-sub">
      <button type="button" class="dropdown-item" role="menuitem" aria-haspopup="menu" aria-expanded="false"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/></svg> Send to <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></button>
      <div class="dropdown-menu" role="menu" hidden>
        <button type="button" class="dropdown-item" role="menuitem"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg> Email</button>
        <button type="button" class="dropdown-item" role="menuitem"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> Message</button>
      </div>
    </div>
  </div>
</div>
```

## Destructive and disabled items

`.dropdown-item-destructive` colours an item that deletes or discards something. `aria-disabled="true"` (or `disabled` on a button) fades an item out; it can't be chosen and the arrow keys skip it.

```html
<div class="dropdown" data-dropdown>
  <button type="button" class="btn btn-outline btn-icon" data-dropdown-trigger aria-haspopup="menu" aria-expanded="false" aria-label="Project actions"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></button>
  <div class="dropdown-menu" role="menu" hidden>
    <button type="button" class="dropdown-item" role="menuitem">Rename</button>
    <button type="button" class="dropdown-item" role="menuitem" aria-disabled="true">Transfer</button>
    <div class="dropdown-separator" role="separator"></div>
    <button type="button" class="dropdown-item dropdown-item-destructive" role="menuitem"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Delete project</button>
  </div>
</div>
```

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

Checkbox and radio items fire a bubbling `menu:change` event when they change, with `detail.checked`, `detail.name` and `detail.value`. Give them a `name` (and a `value`; a checkbox item defaults to `on`) and each keeps a hidden input inside it in step, so a surrounding form submits the checked ones. This form posts on every change:

```html
<form hx-post="/api/echo" hx-trigger="menu:change" hx-target="#dropdown-filter-result">
  <div class="dropdown" data-dropdown>
    <button type="button" class="btn btn-outline" data-dropdown-trigger aria-haspopup="menu" aria-expanded="false">Filter <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>
    <div class="dropdown-menu" role="menu" hidden>
      <button type="button" class="dropdown-item" role="menuitemcheckbox" aria-checked="true" name="open">Open issues</button>
      <button type="button" class="dropdown-item" role="menuitemcheckbox" aria-checked="false" name="closed">Closed issues</button>
      <div class="dropdown-separator" role="separator"></div>
      <div role="group" aria-label="Sort">
        <button type="button" class="dropdown-item" role="menuitemradio" aria-checked="true" name="sort" value="newest">Newest first</button>
        <button type="button" class="dropdown-item" role="menuitemradio" aria-checked="false" name="sort" value="oldest">Oldest first</button>
      </div>
    </div>
  </div>
</form>
<span id="dropdown-filter-result" class="muted" aria-live="polite"></span>
```

## Keyboard

| Key | Action |
| --- | --- |
| `Enter` `Space` on the trigger | Open on the first item |
| `↓` `↑` on the trigger | Open on the first / last item |
| `↓` `↑` `Home` `End` | Next / previous / first / last item (wraps), skipping disabled ones |
| Letters | Next item starting with the typed letters |
| `Enter` `Space` | Choose the item (toggle a checkbox, check a radio) and close; open a submenu |
| `→` `←` | Open / close a submenu |
| `Esc` | Close the innermost menu and return focus to what opened it |
| `Tab`, click outside | Close |

With the mouse, hovering an item highlights (focuses) it, and hovering a submenu's item opens the submenu.

## Accessibility

- The markup follows the [WAI-ARIA menu button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/): `menu`, `menuitem`, `menuitemcheckbox`, `menuitemradio`, `group` and `separator` roles, with `aria-expanded`, `aria-controls` and `aria-checked` kept in step.
- Name an icon-only trigger with `aria-label`, and label each radio group.
- Use a dropdown for actions and navigation. For picking one value of a form field, use a [select](/docs/v0.2/components/select).

## Reference

| Class / attribute | Description |
| --- | --- |
| `.dropdown` | Positioning wrapper (relative, inline-block). |
| `.dropdown-menu` | The floating panel. Opens below, left-aligned. |
| `.dropdown-menu-end / .dropdown-menu-up` | Align to the right edge / open above. |
| `.dropdown-item` | Link or button inside the menu: role="menuitem", "menuitemcheckbox" or "menuitemradio". aria-current, aria-checked and aria-disabled are styled. |
| `.dropdown-item-inset` | Indents an item or label to line up with checkbox and radio items. |
| `.dropdown-item-destructive` | Danger-coloured item, for deleting or discarding. |
| `.dropdown-shortcut` | Right-aligned, muted keyboard hint inside an item. |
| `.dropdown-label` | Small muted heading inside the menu. |
| `.dropdown-separator` | Divider line (role="separator"). |
| `.dropdown-sub` | Wraps a submenu trigger (aria-haspopup="menu", aria-expanded) and its nested .dropdown-menu. |
| `role="group"` | Groups radio items: checking one unchecks the others in the group. |
| `data-keep-open` | On an item, group or menu: choosing an item doesn't close the menu. |
| `name / value` | On checkbox and radio items: kept in a hidden input so a surrounding form submits them. |
| `menu:change` | Bubbling event from a checkbox or radio item that changed; detail { checked, name, value }. |
| `data-flip-x / data-flip-y` | Set on a submenu that would leave the window: it opens to the left / upwards. |
| `[data-dropdown] / [data-dropdown-trigger]` | Behaviour: open/close, keyboard navigation, typeahead, submenus, checkbox and radio items, outside click. |
