---
title: "Menubar"
description: "A visually persistent menu common in desktop applications that provides quick access to a consistent set of commands."
url: "/docs/v0.2/components/menubar"
section: "Components"
---

# Menubar

A visually persistent menu common in desktop applications that provides quick access to a consistent set of commands.

```html
<div class="menubar" role="menubar" aria-label="Browser" data-menubar>
  <div class="menubar-menu">
    <button type="button" class="menubar-trigger" role="menuitem" aria-haspopup="menu" aria-expanded="false">File</button>
    <div class="dropdown-menu" role="menu" hidden>
      <button type="button" class="dropdown-item" role="menuitem">New tab <span class="dropdown-shortcut">⌘T</span></button>
      <button type="button" class="dropdown-item" role="menuitem">New window <span class="dropdown-shortcut">⌘N</span></button>
      <button type="button" class="dropdown-item" role="menuitem" aria-disabled="true">New incognito window</button>
      <div class="dropdown-separator" role="separator"></div>
      <div class="dropdown-sub">
        <button type="button" class="dropdown-item" role="menuitem" aria-haspopup="menu" aria-expanded="false">Share <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></button>
        <div class="dropdown-menu" role="menu" hidden>
          <button type="button" class="dropdown-item" role="menuitem">Email link</button>
          <button type="button" class="dropdown-item" role="menuitem">Messages</button>
          <button type="button" class="dropdown-item" role="menuitem">Notes</button>
        </div>
      </div>
      <div class="dropdown-separator" role="separator"></div>
      <button type="button" class="dropdown-item" role="menuitem">Print… <span class="dropdown-shortcut">⌘P</span></button>
    </div>
  </div>
  <div class="menubar-menu">
    <button type="button" class="menubar-trigger" role="menuitem" aria-haspopup="menu" aria-expanded="false">Edit</button>
    <div class="dropdown-menu" role="menu" hidden>
      <button type="button" class="dropdown-item" role="menuitem">Undo <span class="dropdown-shortcut">⌘Z</span></button>
      <button type="button" class="dropdown-item" role="menuitem">Redo <span class="dropdown-shortcut">⇧⌘Z</span></button>
      <div class="dropdown-separator" role="separator"></div>
      <div class="dropdown-sub">
        <button type="button" class="dropdown-item" role="menuitem" aria-haspopup="menu" aria-expanded="false">Find <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></button>
        <div class="dropdown-menu" role="menu" hidden>
          <button type="button" class="dropdown-item" role="menuitem">Search the web</button>
          <div class="dropdown-separator" role="separator"></div>
          <button type="button" class="dropdown-item" role="menuitem">Find…</button>
          <button type="button" class="dropdown-item" role="menuitem">Find next</button>
          <button type="button" class="dropdown-item" role="menuitem">Find previous</button>
        </div>
      </div>
      <div class="dropdown-separator" role="separator"></div>
      <button type="button" class="dropdown-item" role="menuitem">Cut</button>
      <button type="button" class="dropdown-item" role="menuitem">Copy</button>
      <button type="button" class="dropdown-item" role="menuitem">Paste</button>
    </div>
  </div>
  <div class="menubar-menu">
    <button type="button" class="menubar-trigger" role="menuitem" aria-haspopup="menu" aria-expanded="false">View</button>
    <div class="dropdown-menu w-64" role="menu" hidden>
      <button type="button" class="dropdown-item" role="menuitemcheckbox" aria-checked="false">Always show bookmarks bar</button>
      <button type="button" class="dropdown-item" role="menuitemcheckbox" aria-checked="true">Always show full URLs</button>
      <div class="dropdown-separator" role="separator"></div>
      <button type="button" class="dropdown-item dropdown-item-inset" role="menuitem">Reload <span class="dropdown-shortcut">⌘R</span></button>
      <button type="button" class="dropdown-item dropdown-item-inset" role="menuitem" aria-disabled="true">Force reload <span class="dropdown-shortcut">⇧⌘R</span></button>
      <div class="dropdown-separator" role="separator"></div>
      <button type="button" class="dropdown-item dropdown-item-inset" role="menuitem">Toggle full screen</button>
      <div class="dropdown-separator" role="separator"></div>
      <button type="button" class="dropdown-item dropdown-item-inset" role="menuitem">Hide sidebar</button>
    </div>
  </div>
  <div class="menubar-menu">
    <button type="button" class="menubar-trigger" role="menuitem" aria-haspopup="menu" aria-expanded="false">Profiles</button>
    <div class="dropdown-menu" role="menu" hidden>
      <div role="group" aria-label="Profile">
        <button type="button" class="dropdown-item" role="menuitemradio" aria-checked="false">Andy</button>
        <button type="button" class="dropdown-item" role="menuitemradio" aria-checked="true">Benoit</button>
        <button type="button" class="dropdown-item" role="menuitemradio" aria-checked="false">Luis</button>
      </div>
      <div class="dropdown-separator" role="separator"></div>
      <button type="button" class="dropdown-item dropdown-item-inset" role="menuitem">Edit…</button>
      <div class="dropdown-separator" role="separator"></div>
      <button type="button" class="dropdown-item dropdown-item-inset" role="menuitem">Add profile…</button>
    </div>
  </div>
</div>
```

## Markup

- The bar is `.menubar` with `role="menubar"`, `data-menubar` and an `aria-label`.
- Each top-level menu is a `.menubar-menu` holding its trigger and its panel. The trigger is a `<button class="menubar-trigger">` with `role="menuitem"`, `aria-haspopup="menu"` and `aria-expanded="false"`.
- The panel is a [dropdown](/docs/v0.2/components/dropdown) menu: `.dropdown-menu` with `role="menu"`, starting `hidden`. Everything a dropdown menu can hold works here: items, labels, separators, shortcuts, icons, checkbox and radio items, and submenus.
- A top-level `role="menuitem"` without a panel (a link, say) is fine too: it takes part in the keyboard navigation and has no menu to open.

The behaviour sets the rest: only one trigger is in the tab order at a time, menu items get `tabindex="-1"`, and each trigger is linked to its menu with `aria-controls`.

## Shortcuts and separators

`.dropdown-shortcut` right-aligns a keyboard hint inside an item. It is only a hint: the menubar does not bind the key. If your page handles the shortcut, say so with `aria-keyshortcuts` on the item. `.dropdown-separator` with `role="separator"` divides an item list into sections.

```html
<div class="menubar" role="menubar" aria-label="Document" data-menubar>
  <div class="menubar-menu">
    <button type="button" class="menubar-trigger" role="menuitem" aria-haspopup="menu" aria-expanded="false">Document</button>
    <div class="dropdown-menu" role="menu" hidden>
      <button type="button" class="dropdown-item" role="menuitem" aria-keyshortcuts="Control+S">Save <span class="dropdown-shortcut">Ctrl S</span></button>
      <button type="button" class="dropdown-item" role="menuitem">Save as… <span class="dropdown-shortcut">⇧ Ctrl S</span></button>
      <div class="dropdown-separator" role="separator"></div>
      <button type="button" class="dropdown-item" role="menuitem">Close <span class="kbd">Esc</span></button>
    </div>
  </div>
</div>
```

## Submenus

Wrap an item and a nested menu in `.dropdown-sub`. The item gets `aria-haspopup="menu"` and `aria-expanded="false"`, and a `chevron-right` icon, which sits at the right edge. The submenu opens beside the item when it is hovered, clicked, or focused and `→`, `Enter` or `Space` is pressed; `←` and `Esc` close it. Near the edge of the window it opens to the left or upwards instead. Submenus can nest.

```html
<div class="menubar" role="menubar" aria-label="Insert" data-menubar>
  <div class="menubar-menu">
    <button type="button" class="menubar-trigger" role="menuitem" aria-haspopup="menu" aria-expanded="false">Insert</button>
    <div class="dropdown-menu" role="menu" hidden>
      <button type="button" class="dropdown-item" role="menuitem">Image</button>
      <div class="dropdown-sub">
        <button type="button" class="dropdown-item" role="menuitem" aria-haspopup="menu" aria-expanded="false">Table <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></button>
        <div class="dropdown-menu" role="menu" hidden>
          <button type="button" class="dropdown-item" role="menuitem">2 × 2</button>
          <button type="button" class="dropdown-item" role="menuitem">3 × 3</button>
          <div class="dropdown-sub">
            <button type="button" class="dropdown-item" role="menuitem" aria-haspopup="menu" aria-expanded="false">From template <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></button>
            <div class="dropdown-menu" role="menu" hidden>
              <button type="button" class="dropdown-item" role="menuitem">Invoice</button>
              <button type="button" class="dropdown-item" role="menuitem">Timetable</button>
            </div>
          </div>
        </div>
      </div>
      <button type="button" class="dropdown-item" role="menuitem">Link</button>
    </div>
  </div>
</div>
```

## Checkbox items

An item with `role="menuitemcheckbox"` and `aria-checked` toggles on and off. A check shows in the inset slot on the left; add `.dropdown-item-inset` to the plain items around it so their text lines up.

```html
<div class="menubar" role="menubar" aria-label="Layout" data-menubar>
  <div class="menubar-menu">
    <button type="button" class="menubar-trigger" role="menuitem" aria-haspopup="menu" aria-expanded="false">Layout</button>
    <div class="dropdown-menu" role="menu" hidden>
      <button type="button" class="dropdown-item" role="menuitemcheckbox" aria-checked="true">Status bar</button>
      <button type="button" class="dropdown-item" role="menuitemcheckbox" aria-checked="false">Activity bar</button>
      <button type="button" class="dropdown-item" role="menuitemcheckbox" aria-checked="false" aria-disabled="true">Panel</button>
      <div class="dropdown-separator" role="separator"></div>
      <button type="button" class="dropdown-item dropdown-item-inset" role="menuitem">Reset layout</button>
    </div>
  </div>
</div>
```

## Radio items

Items with `role="menuitemradio"` inside a `role="group"` form a set: checking one unchecks the others in the same group (or, without a group, the others directly in the same menu). Label each group: `aria-label`, or `aria-labelledby` pointing at a `.dropdown-label`.

```html
<div class="menubar" role="menubar" aria-label="Text" data-menubar>
  <div class="menubar-menu">
    <button type="button" class="menubar-trigger" role="menuitem" aria-haspopup="menu" aria-expanded="false">Text</button>
    <div class="dropdown-menu" role="menu" hidden>
      <p class="dropdown-label dropdown-item-inset" id="menubar-size-label">Size</p>
      <div role="group" aria-labelledby="menubar-size-label">
        <button type="button" class="dropdown-item" role="menuitemradio" aria-checked="false">Small</button>
        <button type="button" class="dropdown-item" role="menuitemradio" aria-checked="true">Medium</button>
        <button type="button" class="dropdown-item" role="menuitemradio" aria-checked="false">Large</button>
      </div>
      <div class="dropdown-separator" role="separator"></div>
      <p class="dropdown-label dropdown-item-inset" id="menubar-align-label">Alignment</p>
      <div role="group" aria-labelledby="menubar-align-label">
        <button type="button" class="dropdown-item" role="menuitemradio" aria-checked="true">Left</button>
        <button type="button" class="dropdown-item" role="menuitemradio" aria-checked="false">Centre</button>
      </div>
    </div>
  </div>
</div>
```

Choosing a checkbox or radio item closes the menu, like any other item. To keep it open so several can be set in a row, add `data-keep-open` to the item, to its group or to the whole menu.

## Icons

Put an `icon()` before the text. Icons in items are muted and sized to match; a submenu's chevron and a trailing icon sit at the right edge. `.dropdown-item-destructive` marks an item that deletes or discards something.

```html
<div class="menubar" role="menubar" aria-label="Files" data-menubar>
  <div class="menubar-menu">
    <button type="button" class="menubar-trigger" role="menuitem" aria-haspopup="menu" aria-expanded="false">File</button>
    <div class="dropdown-menu" role="menu" hidden>
      <button type="button" class="dropdown-item" role="menuitem"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg> New file <span class="dropdown-shortcut">⌘N</span></button>
      <button type="button" class="dropdown-item" role="menuitem"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"/></svg> Open… <span class="dropdown-shortcut">⌘O</span></button>
      <button type="button" class="dropdown-item" role="menuitem"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg> Download</button>
      <div class="dropdown-sub">
        <button type="button" class="dropdown-item" role="menuitem" aria-haspopup="menu" aria-expanded="false"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/></svg> Share <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></button>
        <div class="dropdown-menu" role="menu" hidden>
          <button type="button" class="dropdown-item" role="menuitem"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg> Email</button>
          <button type="button" class="dropdown-item" role="menuitem"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> Message</button>
          <button type="button" class="dropdown-item" role="menuitem"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> Copy link</button>
        </div>
      </div>
      <div class="dropdown-separator" role="separator"></div>
      <button type="button" class="dropdown-item dropdown-item-destructive" role="menuitem"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Delete</button>
    </div>
  </div>
  <div class="menubar-menu">
    <button type="button" class="menubar-trigger" role="menuitem" aria-haspopup="menu" aria-expanded="false">Account</button>
    <div class="dropdown-menu" role="menu" hidden>
      <a class="dropdown-item" role="menuitem" href="#profile"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Profile</a>
      <a class="dropdown-item" role="menuitem" href="#settings"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg> Settings</a>
      <div class="dropdown-separator" role="separator"></div>
      <button type="button" class="dropdown-item" role="menuitem"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></svg> Log out</button>
    </div>
  </div>
</div>
```

## Vertical

`aria-orientation="vertical"` stacks the triggers and opens each menu to their right (to the left near the edge of the window). `↑` `↓` then move between the triggers, `→` opens a menu and `←` closes it.

```html
<div class="menubar" role="menubar" aria-label="Drawing tools" aria-orientation="vertical" data-menubar>
  <div class="menubar-menu">
    <button type="button" class="menubar-trigger" role="menuitem" aria-haspopup="menu" aria-expanded="false"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65M22 12.65l-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/></svg> Arrange <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></button>
    <div class="dropdown-menu" role="menu" hidden>
      <button type="button" class="dropdown-item" role="menuitem">Bring to front</button>
      <button type="button" class="dropdown-item" role="menuitem">Send to back</button>
    </div>
  </div>
  <div class="menubar-menu">
    <button type="button" class="menubar-trigger" role="menuitem" aria-haspopup="menu" aria-expanded="false"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M15 12H3M17 18H3M21 6H3"/></svg> Align <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></button>
    <div class="dropdown-menu" role="menu" hidden>
      <button type="button" class="dropdown-item" role="menuitem"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M15 12H3M17 18H3M21 6H3"/></svg> Left</button>
      <button type="button" class="dropdown-item" role="menuitem"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M17 12H7M19 18H5M21 6H3"/></svg> Centre</button>
      <button type="button" class="dropdown-item" role="menuitem"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M21 12H9M21 18H7M21 6H3"/></svg> Right</button>
    </div>
  </div>
  <div class="menubar-menu">
    <button type="button" class="menubar-trigger" role="menuitem" aria-haspopup="menu" aria-expanded="false"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M12 22a10 10 0 1 1 10-10c0 2.76-2.24 4-5 4h-1.5a1.5 1.5 0 0 0-1 2.6A1.5 1.5 0 0 1 12 22Z"/><circle cx="7.5" cy="11.5" r="1"/><circle cx="10.5" cy="7.5" r="1"/><circle cx="15.5" cy="8.5" r="1"/></svg> Colour <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></button>
    <div class="dropdown-menu" role="menu" hidden>
      <div role="group" aria-label="Colour">
        <button type="button" class="dropdown-item" role="menuitemradio" aria-checked="true">Ink</button>
        <button type="button" class="dropdown-item" role="menuitemradio" aria-checked="false">Accent</button>
      </div>
    </div>
  </div>
</div>
```

## With htmx

Items are buttons and links, so they make htmx requests like any other: give an item `hx-post` and the menu closes as the request starts.

Checkbox and radio items fire a bubbling `menu:change` event when they change, with `detail.checked`, `detail.name` and `detail.value`. Give them a `name` (and a `value`; a checkbox item defaults to `on`) and each keeps a hidden input inside it in step, so a surrounding form submits the checked ones like real checkboxes and radios. Here the form posts on every change with `hx-trigger="menu:change"`:

```html
<form hx-post="/api/echo" hx-trigger="menu:change" hx-target="#menubar-result">
  <div class="menubar" role="menubar" aria-label="Editor" data-menubar>
    <div class="menubar-menu">
      <button type="button" class="menubar-trigger" role="menuitem" aria-haspopup="menu" aria-expanded="false">File</button>
      <div class="dropdown-menu" role="menu" hidden>
        <button type="button" class="dropdown-item" role="menuitem" hx-post="/api/slow" hx-target="#menubar-result">Save</button>
        <button type="button" class="dropdown-item" role="menuitem" hx-post="/api/slow" hx-target="#menubar-result">Save all</button>
      </div>
    </div>
    <div class="menubar-menu">
      <button type="button" class="menubar-trigger" role="menuitem" aria-haspopup="menu" aria-expanded="false">View</button>
      <div class="dropdown-menu" role="menu" hidden>
        <button type="button" class="dropdown-item" role="menuitemcheckbox" aria-checked="true" name="minimap">Minimap</button>
        <button type="button" class="dropdown-item" role="menuitemcheckbox" aria-checked="false" name="wrap">Word wrap</button>
        <div class="dropdown-separator" role="separator"></div>
        <div role="group" aria-label="Zoom">
          <button type="button" class="dropdown-item" role="menuitemradio" aria-checked="true" name="zoom" value="100">100%</button>
          <button type="button" class="dropdown-item" role="menuitemradio" aria-checked="false" name="zoom" value="125">125%</button>
        </div>
      </div>
    </div>
  </div>
</form>
<span id="menubar-result" class="muted" aria-live="polite"></span>
```

## Keyboard

| Key | Action |
| --- | --- |
| `Tab` | Into the menubar (the last trigger used), or on out of it, closing any menu |
| `←` `→` on a trigger | Previous / next trigger (wraps); if a menu is open, opens that trigger's menu instead |
| `Home` `End` on a trigger | First / last trigger |
| `↓` `Enter` `Space` on a trigger | Open its menu on the first item |
| `↑` on a trigger | Open its menu on the last item |
| `↓` `↑` `Home` `End` in a menu | Next / previous / first / last item, skipping disabled ones |
| Letters | Next trigger or item starting with the typed letters |
| `Enter` `Space` in a menu | Choose the item (toggle a checkbox, check a radio) and close; open a submenu |
| `→` in a menu | Open the submenu; on any other item, open the next top-level menu |
| `←` in a menu | Close the submenu; in a top-level menu, open the previous one |
| `Esc` | Close the innermost menu and return focus to what opened it |

In a vertical menubar, `↑` `↓` move between triggers, `→` opens a menu and `←` in a top-level menu closes it.

With the mouse: click a trigger to open or close its menu; while one is open, hovering another trigger switches to it. Clicking outside closes it.

## Accessibility

- The markup follows the [WAI-ARIA menubar pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/): `menubar`, `menuitem`, `menu`, `menuitemcheckbox`, `menuitemradio`, `group` and `separator` roles, with `aria-haspopup`, `aria-expanded`, `aria-controls` and `aria-checked` kept in step.
- Give the menubar an `aria-label`, and each radio group a label. Name icon-only items with `aria-label`.
- Only one trigger is in the tab order (roving `tabindex`), so `Tab` moves past the whole bar in one step.
- Disabled items use `aria-disabled="true"`: screen readers still announce them, but they can't be chosen and the arrow keys skip them.
- A shortcut's text is read as part of the item's name. Add `aria-keyshortcuts` only for shortcuts your page really handles.

## Reference

| Class / attribute | Description |
| --- | --- |
| `.menubar` | The bar: a row of triggers in a bordered surface. Needs role="menubar", data-menubar and aria-label. |
| `.menubar[aria-orientation="vertical"]` | Stacks the triggers; menus open to the side. |
| `.menubar-menu` | Wraps one trigger and its menu (positioning). |
| `.menubar-trigger` | Top-level item: role="menuitem", aria-haspopup="menu", aria-expanded. Highlighted while its menu is open. |
| `.dropdown-menu` | Each menu panel (role="menu", hidden). All the dropdown item classes work inside it; see Dropdown. |
| `.dropdown-sub` | Wraps a submenu trigger (aria-haspopup="menu") and its nested menu. |
| `data-keep-open` | On an item, group or menu: choosing an item doesn't close the menu. |
| `name / value` | On checkbox and radio items: kept in a hidden input so a surrounding form submits them. |
| `menu:change` | Bubbling event from a checkbox or radio item that changed; detail { checked, name, value }. |
| `data-flip-x / data-flip-y` | Set on a menu that would leave the window: it opens the other way. |
| `[data-menubar]` | Behaviour: roving focus, keyboard navigation, opening and closing, hover switching. |
