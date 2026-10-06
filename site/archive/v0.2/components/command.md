---
title: "Command"
description: "A command menu for search and quick actions: filtered as you type, driven by the keyboard, with groups, icons, shortcuts and separators, inline or in a dialog opened with ⌘K."
url: "/docs/v0.2/components/command"
section: "Components"
---

# Command

A command menu for search and quick actions: filtered as you type, driven by the keyboard, with groups, icons, shortcuts and separators, inline or in a dialog opened with ⌘K.

```html
<div class="command mx-auto max-w-md shadow-md" data-command>
  <div class="command-input-wrapper">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
    <input class="command-input" data-command-input placeholder="Type a command or search…" aria-label="Search commands" />
  </div>
  <div class="command-list" aria-label="Commands">
    <div class="command-group" role="group" aria-labelledby="cmd-demo-suggestions">
      <div class="command-label" id="cmd-demo-suggestions">Suggestions</div>
      <div class="command-item" data-value="calendar"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg> Calendar</div>
      <div class="command-item" data-value="emoji" data-keywords="smiley face"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z"/><path d="M19 3v4M17 5h4"/></svg> Search emoji</div>
      <div class="command-item" data-value="calculator" aria-disabled="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg> Calculator</div>
    </div>
    <div class="command-separator" role="separator"></div>
    <div class="command-group" role="group" aria-labelledby="cmd-demo-settings">
      <div class="command-label" id="cmd-demo-settings">Settings</div>
      <div class="command-item" data-value="profile"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Profile <kbd class="command-shortcut">⌘P</kbd></div>
      <div class="command-item" data-value="billing"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/></svg> Billing <kbd class="command-shortcut">⌘B</kbd></div>
      <div class="command-item" data-value="settings" data-keywords="preferences"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg> Settings <kbd class="command-shortcut">⌘S</kbd></div>
    </div>
  </div>
  <p class="command-empty" data-command-empty hidden>No results found.</p>
</div>
```

## Markup

- `.command` holds a `.command-input` (in a `.command-input-wrapper` with an icon) and a `.command-list` of `.command-item`s, optionally in `.command-group`s with a `.command-label`, split by `.command-separator`s.
- `data-command` wires it up. Typing filters the items by their text, `data-value` and `data-keywords`, matching words or letters in order ("stng" finds Settings); empty groups and stray separators hide, and `[data-command-empty]` shows when nothing matches.
- `↑` `↓` (wrapping), `Home` `End` and the pointer move the highlight; `Enter` activates it. The input is a combobox with `aria-activedescendant`, so screen readers follow the highlight. `aria-disabled="true"` items are skipped.
- Activating an item clicks it, so a link navigates and an item with `hx-get` sends its request. It also fires `command:select` on the item, with `detail.value`.

## In a dialog

Put the command in a `<dialog class="dialog command-dialog" data-dialog>` and open it with a `commandfor` button. `data-command-hotkey="mod+k"` on the command opens it from anywhere on the page (`⌘`+`K` on a Mac, `Ctrl`+`K` elsewhere; the key closes it again). Each time it opens the query clears; choosing an item closes it, unless the item or the command has `data-command-keep-open`.

```html
<button type="button" class="btn btn-outline" commandfor="command-dialog-demo" command="show-modal">
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg> Open menu <span class="kbd-group"><kbd class="kbd">Ctrl</kbd><kbd class="kbd">J</kbd></span>
</button>
<dialog id="command-dialog-demo" class="dialog command-dialog" data-dialog aria-label="Command menu">
  <div class="command" data-command data-command-hotkey="mod+j">
    <div class="command-input-wrapper">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      <input class="command-input" data-command-input placeholder="Type a command or search…" aria-label="Search commands" autofocus />
    </div>
    <div class="command-list" aria-label="Commands">
      <div class="command-group" role="group" aria-labelledby="cmd-dialog-pages">
        <div class="command-label" id="cmd-dialog-pages">Pages</div>
        <a class="command-item" href="/docs"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> Introduction</a>
        <a class="command-item" href="/docs/installation"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg> Installation</a>
        <a class="command-item" href="/docs/theming" data-keywords="colours tokens"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M12 22a10 10 0 1 1 10-10c0 2.76-2.24 4-5 4h-1.5a1.5 1.5 0 0 0-1 2.6A1.5 1.5 0 0 1 12 22Z"/><circle cx="7.5" cy="11.5" r="1"/><circle cx="10.5" cy="7.5" r="1"/><circle cx="15.5" cy="8.5" r="1"/></svg> Theming</a>
      </div>
      <div class="command-separator" role="separator"></div>
      <div class="command-group" role="group" aria-labelledby="cmd-dialog-actions">
        <div class="command-label" id="cmd-dialog-actions">Actions</div>
        <div class="command-item" data-toast="Link copied" data-toast-type="success" data-command-hotkey="mod+shift+c"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg> Copy link <span class="command-shortcut">⌘⇧C</span></div>
        <div class="command-item" data-toast="New project created" data-command-hotkey="mod+shift+n"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M12 10v6"/><path d="M9 13h6"/><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg> New project <span class="command-shortcut">⌘⇧N</span></div>
      </div>
    </div>
    <p class="command-empty" data-command-empty hidden>No results found.</p>
    <div class="command-footer" aria-hidden="true">
      <span><kbd class="kbd">↑</kbd><kbd class="kbd">↓</kbd> Navigate</span>
      <span><kbd class="kbd">↵</kbd> Open</span>
      <span class="ms-auto"><kbd class="kbd">Esc</kbd> Close</span>
    </div>
  </div>
</dialog>
<p class="text-sm text-muted-foreground">Or press <kbd class="kbd">Ctrl</kbd>/<kbd class="kbd">⌘</kbd>+<kbd class="kbd">J</kbd>. (This site's search keeps <kbd class="kbd">K</kbd>.)</p>
```

## Keyboard shortcuts

- `data-command-hotkey` on the `.command`: opens its dialog, or focuses its input when it isn't in one. A key with no modifier (such as `/`) is ignored while typing in another field.
- `data-command-hotkey` on an item: activates it while focus is in the command (`mod+shift+c` above).
- Combos are keys joined with `+`: `mod` (⌘ on Apple devices, Ctrl elsewhere), `ctrl`, `meta`, `alt`, `shift` and the key.
- Show a shortcut with a `.command-shortcut` at the end of the item; it is only a label.

## Scrollable

The list scrolls past `max-h-72` (in a dialog, 24rem or 60% of the screen); the highlight keeps itself in view without scrolling the page. Set another `max-h-*` on `.command-list`.

```html
<div class="command mx-auto max-w-sm shadow-md" data-command>
  <div class="command-input-wrapper">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
    <input class="command-input" data-command-input placeholder="Search people…" aria-label="Search people" />
  </div>
  <div class="command-list max-h-56" aria-label="People">
    <div class="command-group" role="group" aria-label="People">
        <div class="command-item" data-value="Ada Lovelace"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Ada Lovelace</div>
        <div class="command-item" data-value="Alan Turing"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Alan Turing</div>
        <div class="command-item" data-value="Barbara Liskov"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Barbara Liskov</div>
        <div class="command-item" data-value="Claude Shannon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Claude Shannon</div>
        <div class="command-item" data-value="Donald Knuth"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Donald Knuth</div>
        <div class="command-item" data-value="Edsger Dijkstra"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Edsger Dijkstra</div>
        <div class="command-item" data-value="Frances Allen"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Frances Allen</div>
        <div class="command-item" data-value="Grace Hopper"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Grace Hopper</div>
        <div class="command-item" data-value="John McCarthy"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> John McCarthy</div>
        <div class="command-item" data-value="Ken Thompson"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Ken Thompson</div>
        <div class="command-item" data-value="Leslie Lamport"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Leslie Lamport</div>
        <div class="command-item" data-value="Margaret Hamilton"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Margaret Hamilton</div>
        <div class="command-item" data-value="Niklaus Wirth"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Niklaus Wirth</div>
        <div class="command-item" data-value="Radia Perlman"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Radia Perlman</div>
        <div class="command-item" data-value="Tim Berners-Lee"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Tim Berners-Lee</div>
    </div>
  </div>
  <p class="command-empty" data-command-empty hidden>No one found.</p>
</div>
```

## Searching on the server

`data-command-filter="false"` leaves filtering to the server: an `hx-get` on the input swaps in the matching items, and the highlight follows whatever the list holds.

```html
<div class="command mx-auto max-w-sm shadow-md" data-command data-command-filter="false">
  <div class="command-input-wrapper">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
    <input class="command-input" name="q" data-command-input placeholder="Search countries…" aria-label="Search countries"
      hx-get="/api/commands" hx-trigger="input changed delay:200ms, load" hx-target="next .command-list" />
  </div>
  <div class="command-list" aria-label="Countries"></div>
  <p class="command-empty" data-command-empty hidden>No country found.</p>
</div>
```

## Reference

| Class | Description |
| --- | --- |
| `.command` | The menu: a bordered panel of an input and a list. |
| `.command-input-wrapper / .command-input` | The search row and its borderless input. |
| `.command-list` | The scrolling list of items and groups (max-h-72). |
| `.command-group / .command-label` | A group of items and its heading. |
| `.command-item` | An item (div, a or button); highlighted with data-highlighted. |
| `.command-shortcut` | A shortcut label at the end of an item. |
| `.command-separator` | A line between groups. |
| `.command-empty` | Shown when nothing matches ([data-command-empty]). |
| `.command-footer` | A row of hints under the list. |
| `.command-dialog` | On a .dialog: no padding, the command fills it. |
| `[data-command]` | Behaviour: filtering, keyboard, selection. |
| `[data-keywords] / [data-value]` | More words to match, and the value command:select reports. |
| `[data-command-hotkey]` | On the command: opens its dialog. On an item: activates it. |
| `[data-command-filter="false"]` | Leave filtering to the server. |
| `[data-command-keep-open]` | Don't close the dialog when an item is chosen. |
| `command:select` | Event on the chosen item; detail: { value, item }. |
