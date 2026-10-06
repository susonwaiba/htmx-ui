---
title: "Collapsible"
description: "A button that expands and collapses a panel: more details, extra settings, or a whole file tree."
url: "/docs/v0.2/components/collapsible"
section: "Components"
---

# Collapsible

A button that expands and collapses a panel: more details, extra settings, or a whole file tree.

```html
<div class="collapsible w-full max-w-sm gap-2" data-collapsible>
  <div class="flex items-center justify-between gap-4 ps-4">
    <h4 class="text-sm font-semibold">Order #4189</h4>
    <button type="button" class="btn btn-ghost btn-icon btn-sm" data-collapsible-trigger aria-expanded="false" aria-label="Show order details">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>
    </button>
  </div>
  <div class="flex items-center justify-between rounded-(--radius) border border-border px-4 py-2 text-sm">
    <span class="text-muted-foreground">Status</span>
    <span class="font-medium">Shipped</span>
  </div>
  <div class="collapsible-content gap-2" data-collapsible-content hidden>
    <div class="rounded-(--radius) border border-border px-4 py-2 text-sm">
      <p class="font-medium">Shipping address</p>
      <p class="text-muted-foreground">100 Market St, San Francisco</p>
    </div>
    <div class="rounded-(--radius) border border-border px-4 py-2 text-sm">
      <p class="font-medium">Items</p>
      <p class="text-muted-foreground">2× Studio Headphones</p>
    </div>
  </div>
</div>
```

## Markup

- Wrap everything in `.collapsible` with `data-collapsible`.
- The trigger is a `<button>` with `data-collapsible-trigger` and `aria-expanded`. It can be anywhere inside — above the panel, below it, in a header — and look like anything: `.collapsible-trigger` for a full-width row, or any [button](/docs/v0.2/components/button) class. A collapsible may have several triggers; they stay in step.
- The panel is a `.collapsible-content` with `data-collapsible-content`. It starts closed with `hidden`, or open without it. The behaviour links the triggers to it with `aria-controls`.
- A `.collapsible-icon` in the trigger turns 180° while open (a chevron-down becomes a chevron-up). Set `--collapsible-rotate` to change the angle, such as `90deg` for a chevron-right.
- For several sections where opening one may close the others, use an [accordion](/docs/v0.2/components/accordion).

## Reveal more settings

A trigger below the panel, worded for both states. The text swaps with Tailwind's `group-aria-expanded` variant, so no script is needed for it.

```html
<form class="card w-full max-w-sm" onsubmit="return false">
  <div class="card-header">
    <h3 class="card-title">Radius</h3>
    <p class="card-description">Set the corner radius of the element.</p>
  </div>
  <div class="card-content collapsible gap-4" data-collapsible>
    <div class="field-grid gap-y-4">
      <div class="field">
        <label class="label" for="radius-x">Radius X</label>
        <input class="input" id="radius-x" value="0" inputmode="numeric" />
      </div>
      <div class="field">
        <label class="label" for="radius-y">Radius Y</label>
        <input class="input" id="radius-y" value="0" inputmode="numeric" />
      </div>
    </div>
    <div class="collapsible-content" data-collapsible-content hidden>
      <div class="field-grid gap-y-4">
        <div class="field">
          <label class="label" for="radius-tl">Top left</label>
          <input class="input" id="radius-tl" value="0" inputmode="numeric" />
        </div>
        <div class="field">
          <label class="label" for="radius-tr">Top right</label>
          <input class="input" id="radius-tr" value="0" inputmode="numeric" />
        </div>
        <div class="field">
          <label class="label" for="radius-bl">Bottom left</label>
          <input class="input" id="radius-bl" value="0" inputmode="numeric" />
        </div>
        <div class="field">
          <label class="label" for="radius-br">Bottom right</label>
          <input class="input" id="radius-br" value="0" inputmode="numeric" />
        </div>
      </div>
    </div>
    <button type="button" class="group btn btn-outline btn-sm self-start" data-collapsible-trigger aria-expanded="false">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
      <span class="group-aria-expanded:hidden">Show each corner</span>
      <span class="hidden group-aria-expanded:inline">Hide each corner</span>
    </button>
  </div>
</form>
```

## File tree

Collapsibles nest: each trigger only opens its own panel. Here every folder is one, with a chevron-right turned by `[--collapsible-rotate:90deg]` on the tree and the folder icon swapped while open.

```html
<ul class="w-64 rounded-(--radius) border border-border p-2 text-sm [--collapsible-rotate:90deg]" aria-label="Files">
<li class="collapsible" data-collapsible>
  <button type="button" class="group collapsible-trigger justify-start px-2 py-1.5 font-normal hover:bg-accent" data-collapsible-trigger aria-expanded="true">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="collapsible-icon size-4" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4 group-aria-expanded:hidden" aria-hidden="true"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="hidden size-4 group-aria-expanded:block" aria-hidden="true"><path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"/></svg>
    src
  </button>
  <ul class="collapsible-content ms-4 border-s border-border ps-2" data-collapsible-content>
        <li class="collapsible" data-collapsible>
  <button type="button" class="group collapsible-trigger justify-start px-2 py-1.5 font-normal hover:bg-accent" data-collapsible-trigger aria-expanded="true">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="collapsible-icon size-4" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4 group-aria-expanded:hidden" aria-hidden="true"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="hidden size-4 group-aria-expanded:block" aria-hidden="true"><path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"/></svg>
    components
  </button>
  <ul class="collapsible-content ms-4 border-s border-border ps-2" data-collapsible-content>
                  <li class="flex items-center gap-2 px-2 py-1.5 ps-8"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4 text-muted-foreground" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg> button.ts</li>

          <li class="flex items-center gap-2 px-2 py-1.5 ps-8"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4 text-muted-foreground" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg> dialog.ts</li>

  </ul>
</li>
<li class="collapsible" data-collapsible>
  <button type="button" class="group collapsible-trigger justify-start px-2 py-1.5 font-normal hover:bg-accent" data-collapsible-trigger aria-expanded="false">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="collapsible-icon size-4" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4 group-aria-expanded:hidden" aria-hidden="true"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="hidden size-4 group-aria-expanded:block" aria-hidden="true"><path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"/></svg>
    utils
  </button>
  <ul class="collapsible-content ms-4 border-s border-border ps-2" data-collapsible-content hidden>
                  <li class="flex items-center gap-2 px-2 py-1.5 ps-8"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4 text-muted-foreground" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg> dom.ts</li>

  </ul>
</li>
        <li class="flex items-center gap-2 px-2 py-1.5 ps-8"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4 text-muted-foreground" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg> index.ts</li>

  </ul>
</li>
<li class="collapsible" data-collapsible>
  <button type="button" class="group collapsible-trigger justify-start px-2 py-1.5 font-normal hover:bg-accent" data-collapsible-trigger aria-expanded="false">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="collapsible-icon size-4" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4 group-aria-expanded:hidden" aria-hidden="true"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="hidden size-4 group-aria-expanded:block" aria-hidden="true"><path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"/></svg>
    public
  </button>
  <ul class="collapsible-content ms-4 border-s border-border ps-2" data-collapsible-content hidden>
                <li class="flex items-center gap-2 px-2 py-1.5 ps-8"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4 text-muted-foreground" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg> favicon.svg</li>

  </ul>
</li>
      <li class="flex items-center gap-2 px-2 py-1.5 ps-8"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4 text-muted-foreground" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg> package.json</li>

      <li class="flex items-center gap-2 px-2 py-1.5 ps-8"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4 text-muted-foreground" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg> README.md</li>

</ul>
```

## Without JavaScript

The same classes style a native `<details>`: the `<summary>` is the trigger and the icon turns while it's open, with no behaviour at all. The trade-off is that the summary must come first, so the trigger can't sit below the panel.

```html
<details class="collapsible w-full max-w-sm gap-2">
  <summary class="collapsible-trigger rounded-(--radius) border border-border px-4 py-2">
    What does it cost?
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="collapsible-icon size-4" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
  </summary>
  <p class="px-4 text-sm text-muted-foreground">Nothing: htmx-ui is MIT licensed.</p>
</details>
```

## Find in page

Closed content is invisible to the browser's find-in-page. Close it with `hidden="until-found"` instead of `hidden`, and searching for text inside opens the collapsible; it closes back to `until-found`. Browsers without support treat it as plain `hidden`.

## With htmx

Every open and close fires a bubbling `collapsible:toggle` with `detail.open`, and the wrapper carries `data-open` while open. To fetch the panel's content the first time it opens, put the request on the trigger:

```html
<div class="collapsible w-full max-w-sm gap-3" data-collapsible>
  <button type="button" class="collapsible-trigger" data-collapsible-trigger aria-expanded="false"
          hx-get="/api/hello" hx-trigger="click once" hx-target="next [data-collapsible-content]">
    Latest message
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="collapsible-icon size-4" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
  </button>
  <div class="collapsible-content" data-collapsible-content hidden><p class="muted">Loading…</p></div>
</div>
```

## Reference

| Class / attribute | Description |
| --- | --- |
| `.collapsible` | Wrapper (a flex column). Add data-collapsible, or use it on a <details>. |
| `.collapsible-trigger` | A full-width row button, or a <summary>. Optional: any button works. |
| `.collapsible-icon` | Turns by --collapsible-rotate (180deg) while open. |
| `.collapsible-content` | The panel. Add data-collapsible-content, and hidden to start closed. |
| `[data-collapsible-trigger]` | Toggles the panel; aria-expanded and aria-controls kept in sync. |
| `[data-open]` | On the wrapper while open. |
| `collapsible:toggle` | Event on the wrapper with detail { open }. |
