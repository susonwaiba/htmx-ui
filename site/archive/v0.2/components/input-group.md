---
title: "Input group"
description: "Icons, text, buttons, menus and spinners inside an input's border, on either side, above or below."
url: "/docs/v0.2/components/input-group"
section: "Components"
---

# Input group

Icons, text, buttons, menus and spinners inside an input's border, on either side, above or below.

```html
<div class="input-group max-w-sm">
  <input class="input" type="search" placeholder="Search…" aria-label="Search" />
  <span class="input-group-addon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></span>
  <span class="input-group-addon input-group-addon-inline-end">12 results</span>
</div>
```

## Usage

- Wrap a `.input`, `.textarea` or `.select` in `.input-group`. The group draws the border and the focus ring; the control drops its own.
- Add each addon as a `.input-group-addon`. Put addons **after** the control in the source. CSS places them, so `Tab` reaches the control first.
- States come from the control: `aria-invalid="true"` turns the whole group red and `disabled` fades it.

## Align

An addon goes at the inline start by default. `.input-group-addon-inline-end` puts it at the end, `.input-group-addon-block-start` above the control and `.input-group-addon-block-end` below it.

```html
<div class="input-group max-w-sm">
  <input class="input" placeholder="Inline start" aria-label="Inline start" />
  <span class="input-group-addon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></span>
</div>
<div class="input-group max-w-sm">
  <input class="input" type="password" placeholder="Inline end" aria-label="Password" />
  <span class="input-group-addon input-group-addon-inline-end"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg></span>
</div>
<div class="input-group max-w-sm">
  <input class="input" id="ig-block-start" placeholder="Block start" />
  <label class="input-group-addon input-group-addon-block-start" for="ig-block-start">Full name</label>
</div>
<div class="input-group max-w-sm">
  <input class="input" placeholder="Block end" aria-label="Amount" />
  <span class="input-group-addon input-group-addon-block-end"><span class="input-group-text">Billed in USD</span></span>
</div>
```

## Icons and text

Addons hold icons, text or both. `.input-group-text` styles plain text inside a busier addon.

```html
<div class="input-group max-w-sm">
  <input class="input" type="email" placeholder="you@example.com" aria-label="Email" />
  <span class="input-group-addon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg></span>
</div>
<div class="input-group max-w-sm">
  <input class="input" placeholder="example.com" aria-label="Website" />
  <span class="input-group-addon">https://</span>
  <span class="input-group-addon input-group-addon-inline-end">.com</span>
</div>
<div class="input-group max-w-sm">
  <input class="input" type="number" placeholder="0.00" aria-label="Price" />
  <span class="input-group-addon">$</span>
  <span class="input-group-addon input-group-addon-inline-end">USD</span>
</div>
```

## Buttons

Buttons inside an addon shrink to fit (24px tall). Use any variant; ghost and secondary sit most naturally.

```html
<div class="input-group max-w-sm">
  <input class="input" value="https://htmx-ui.dev/r/3f9a" readonly aria-label="Share link" />
  <span class="input-group-addon input-group-addon-inline-end">
    <button class="btn btn-ghost btn-icon" aria-label="Copy"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg></button>
  </span>
</div>
<div class="input-group max-w-sm">
  <input class="input" type="search" placeholder="Search the docs…" aria-label="Search" />
  <span class="input-group-addon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></span>
  <span class="input-group-addon input-group-addon-inline-end">
    <button class="btn btn-secondary">Search</button>
  </span>
</div>
```

## Badges

```html
<div class="input-group max-w-sm">
  <input class="input" placeholder="Add a label…" aria-label="Labels" />
  <span class="input-group-addon">
    <span class="badge badge-info">bug</span>
    <span class="badge badge-secondary">ui</span>
  </span>
</div>
```

## Dropdown

A [dropdown](/docs/v0.2/components/dropdown) in an addon, for picking a unit or scope.

```html
<div class="input-group max-w-sm">
  <input class="input" placeholder="Search…" aria-label="Search" />
  <span class="input-group-addon input-group-addon-inline-end">
    <span class="dropdown" data-dropdown>
      <button class="btn btn-ghost" data-dropdown-trigger aria-haspopup="menu" aria-expanded="false">All files <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>
      <span class="dropdown-menu dropdown-menu-end" role="menu" hidden>
        <button class="dropdown-item" role="menuitem">All files</button>
        <button class="dropdown-item" role="menuitem">Pages</button>
        <button class="dropdown-item" role="menuitem">Components</button>
      </span>
    </span>
  </span>
</div>
```

## Spinner

A [spinner](/docs/v0.2/components/spinner) shows work in progress. With `.htmx-indicator` it appears only while a request runs: type below to search the mock server.

```html
<div class="input-group max-w-sm">
  <input class="input" type="search" placeholder="Saving…" disabled aria-label="Saving" />
  <span class="input-group-addon input-group-addon-inline-end"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spinner" role="status" aria-label="Loading"><path d="M21 12a9 9 0 1 1-6.22-8.56"/></svg></span>
</div>
<div class="input-group max-w-sm">
  <input class="input" type="search" name="q" placeholder="Search…" aria-label="Search"
         hx-get="/api/echo" hx-trigger="input changed delay:300ms" hx-target="#ig-search-result" hx-indicator="#ig-search-spinner" />
  <span class="input-group-addon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></span>
  <span class="input-group-addon input-group-addon-inline-end"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="ig-search-spinner" class="spinner htmx-indicator" role="status" aria-label="Searching"><path d="M21 12a9 9 0 1 1-6.22-8.56"/></svg></span>
</div>
<p id="ig-search-result" class="muted text-sm" aria-live="polite"></p>
```

## Textarea

Block addons above or below a textarea make a compose box. A `border-t` or `border-b` utility on the addon draws a divider.

```html
<div class="input-group max-w-md">
  <textarea class="textarea" placeholder="Ask, search or chat…" aria-label="Prompt"></textarea>
  <span class="input-group-addon input-group-addon-block-start border-b"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4M10 9H8M16 13H8M16 17H8"/></svg> <span class="input-group-text">button.css</span></span>
  <span class="input-group-addon input-group-addon-block-end">
    <button class="btn btn-outline btn-icon btn-rounded" aria-label="Attach"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M5 12h14M12 5v14"/></svg></button>
    <span class="input-group-text ms-auto">52% used</span>
    <button class="btn btn-primary btn-icon btn-rounded" aria-label="Send"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/></svg></button>
  </span>
</div>
```

## States

```html
<div class="field max-w-sm">
  <label class="field-label" for="ig-invalid">Username</label>
  <div class="input-group">
    <input class="input" id="ig-invalid" value="ada lovelace" aria-invalid="true" aria-describedby="ig-invalid-msg" />
    <span class="input-group-addon">@</span>
  </div>
  <p class="field-error" id="ig-invalid-msg">Usernames can't contain spaces.</p>
</div>
<div class="input-group max-w-sm">
  <input class="input" placeholder="Disabled" disabled aria-label="Disabled" />
  <span class="input-group-addon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg></span>
</div>
```

## Reference

| Class | Description |
| --- | --- |
| `.input-group` | Border and focus ring around a control and its addons. |
| `.input-group-addon` | Addon at the inline start. Holds icons, text, badges, buttons, menus or spinners. |
| `.input-group-addon-inline-end` | Addon at the end of the row. |
| `.input-group-addon-block-start` | Full-width addon above the control. |
| `.input-group-addon-block-end` | Full-width addon below the control. |
| `.input-group-text` | Plain muted text inside an addon. |
