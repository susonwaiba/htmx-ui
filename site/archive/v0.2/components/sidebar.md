---
title: "Sidebar"
description: "A composable, themeable app navigation column: groups, menus, badges, actions and sub-menus, collapsing to an icon rail or off the screen, with an off-canvas panel on mobile."
url: "/docs/v0.2/components/sidebar"
section: "Components"
---

# Sidebar

A composable, themeable app navigation column: groups, menus, badges, actions and sub-menus, collapsing to an icon rail or off the screen, with an off-canvas panel on mobile.

## Preview

Switchboard, a made-up console for watching an htmx app's requests: an environment switcher and a route search in the header, a Monitor group with counts, collapsible Ship items with sub-menus, collapsible Saved views with actions, a usage meter and an account menu in the footer, a rail and a trigger. Collapse it with the button, the rail on its edge or `Ctrl` `B` (`⌘` `B` on a Mac) after clicking inside the frame: it shrinks to icons, and each one shows its label as a tooltip. [Open it on its own page](/examples/sidebar), where it also remembers its state and turns into an off-canvas panel on a narrow window.

## Structure

A sidebar is plain markup with classes for each part. The layout holds the sidebar and the main area; the sidebar holds a header, a scrolling content area and a footer; the content holds groups of menus.

```html app.html
<div class="sidebar-layout">
  <aside id="app-sidebar" class="sidebar" data-sidebar data-collapsible="icon" aria-label="Switchboard">
    <div class="sidebar-header">…</div>
    <nav class="sidebar-content" aria-label="Main">
      <div class="sidebar-group">
        <p class="sidebar-group-label">Monitor</p>
        <ul class="sidebar-menu">
          <li class="sidebar-menu-item">
            <a href="/requests" class="sidebar-menu-button" aria-current="page">{{ icon("zap") }}<span>Requests</span></a>
          </li>
        </ul>
      </div>
    </nav>
    <div class="sidebar-footer">…</div>
    <button type="button" class="sidebar-rail" data-sidebar-rail tabindex="-1" aria-label="Toggle sidebar"></button>
  </aside>

  <main class="sidebar-inset">
    <button type="button" class="sidebar-trigger" data-sidebar-trigger aria-controls="app-sidebar"
            aria-label="Toggle sidebar">{{ icon("panel-left") }}</button>
    …
  </main>
</div>
```

- `.sidebar-layout` places the sidebar and `.sidebar-inset` (the page's main area) side by side.
- `.sidebar` with `data-sidebar` is the column. Options are data attributes on it: [side](#side), [variant](#variant), [collapsible](#collapsible) and [breakpoint](#mobile).
- `.sidebar-header` and `.sidebar-footer` stay put; `.sidebar-content` between them scrolls.
- `.sidebar-group` is a section of the content, with a `.sidebar-group-label`, an optional `.sidebar-group-action` and its `.sidebar-menu`.
- `.sidebar-menu` is a `<ul>` of `.sidebar-menu-item`s, each holding a `.sidebar-menu-button` (a link or button) and optionally an action, a badge or a sub-menu.
- `.sidebar-trigger` and `.sidebar-rail` toggle it.

The behaviour (`sidebar.ts`, run by `initComponents()`) handles toggling, the keyboard shortcut, the cookie and the mobile panel. Everything else is CSS. The previews below show parts on their own, so they add `h-auto` (fit the content rather than the window's height) and `data-breakpoint="none"` (stay a column on a phone).

## Layout and inset

`.sidebar-layout` is a flex row at least as tall as the window. The sidebar sticks to the top of the window while the page scrolls, and is as tall as the window. If a fixed or sticky header sits above the layout, set `--sidebar-top` to its height, so the sidebar sticks below it and is shortened to fit. Put the page's content in `<main class="sidebar-inset">`, which takes the remaining width.

```html
<header class="sticky top-0 h-14">…</header>
<div class="sidebar-layout [--sidebar-top:3.5rem]">
  <aside class="sidebar" data-sidebar>…</aside>
  <main class="sidebar-inset">…</main>
</div>
```

The navigation of these docs is one, set up this way (see [the docs navigation](#docs-navigation)).

## Header and footer

Use the header for a logo, a workspace or environment switcher, or a search field, and the footer for the signed-in user or the plan's usage. A menu in either works like one in the content. Here a large menu button opens a [dropdown](/docs/v0.2/components/dropdown); in the footer, `.dropdown-menu-up` opens it upwards.

```html
<aside class="sidebar h-auto rounded-lg border" data-breakpoint="none" aria-label="Header example">
  <div class="sidebar-header">
    <ul class="sidebar-menu">
      <li class="sidebar-menu-item">
        <div class="dropdown w-full" data-dropdown>
          <button type="button" class="sidebar-menu-button sidebar-menu-button-lg" data-dropdown-trigger aria-haspopup="menu" aria-expanded="false">
            <span class="grid size-8 shrink-0 place-items-center rounded-full border-2 border-sidebar-primary text-sidebar-primary"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg></span>
            <span class="grid flex-1 leading-tight">
              <span class="truncate font-semibold">Switchboard</span>
              <span class="truncate font-mono text-xs text-muted-foreground">production</span>
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-auto" aria-hidden="true"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>
          </button>
          <div class="dropdown-menu w-full" role="menu" aria-label="Environments" hidden>
            <div role="group" aria-label="Environment">
              <button type="button" class="dropdown-item" role="menuitemradio" aria-checked="true">Production</button>
              <button type="button" class="dropdown-item" role="menuitemradio" aria-checked="false">Staging</button>
            </div>
          </div>
        </div>
      </li>
    </ul>
    <input class="input sidebar-input" type="search" placeholder="Jump to route…" aria-label="Jump to route" />
  </div>
</aside>
```

## Content

`.sidebar-content` fills the height between the header and the footer and scrolls when its groups don't fit. Make it the `<nav>` (with an `aria-label`) when it holds the site's navigation. Separate groups with a `.sidebar-separator` if they need a line.

## Group

A `.sidebar-group` is a labelled section. `.sidebar-group-action` is an icon button in its top-right corner (give it an `aria-label`). Wrap the menu in `.sidebar-group-content` when the group is [collapsible](/docs/v0.2/components/collapsible): make the group the collapsible, the label its trigger and the content its content. A chevron with `.collapsible-icon` turns a quarter while open.

```html
<aside class="sidebar h-auto rounded-lg border" data-breakpoint="none" aria-label="Group example">
  <div class="sidebar-group collapsible" data-collapsible>
    <button type="button" class="sidebar-group-label" data-collapsible-trigger aria-expanded="true">
      Saved views <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="collapsible-icon" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
    </button>
    <button type="button" class="sidebar-group-action" aria-label="Save the current view"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M5 12h14M12 5v14"/></svg></button>
    <div class="sidebar-group-content" data-collapsible-content>
      <ul class="sidebar-menu">
        <li class="sidebar-menu-item"><a href="#group" class="sidebar-menu-button"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></svg><span>Slower than 1s</span></a></li>
        <li class="sidebar-menu-item"><a href="#group" class="sidebar-menu-button"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4M12 17h.01"/></svg><span>Errors this week</span></a></li>
      </ul>
    </div>
  </div>
</aside>
```

Without JavaScript, `<details class="sidebar-group">` with a `<summary class="sidebar-group-label">` works the same way.

## Menu and menu button

A `.sidebar-menu` is a list; each `.sidebar-menu-item` holds a `.sidebar-menu-button`: an `<a>` for navigation, a `<button>` for an action. Put an icon first and the label in a `<span>`, which is cut short with an ellipsis when it doesn't fit.

- **Current page:** `aria-current="page"` (or `data-active` for anything else that should look selected). It is tinted with `--sidebar-primary` and marked by a bar on its leading edge, which stays visible in the icon rail.
- **Sizes:** `.sidebar-menu-button-sm` (28px), the default (32px), `.sidebar-menu-button-lg` (48px, for two lines or an avatar).
- **Variant:** `.sidebar-menu-button-outline` draws a border and a background.
- **Disabled:** `disabled` on a button, `aria-disabled="true"` on a link.

```html
<aside class="sidebar h-auto rounded-lg border" data-breakpoint="none" aria-label="Menu example">
  <div class="sidebar-group">
    <ul class="sidebar-menu">
      <li class="sidebar-menu-item"><a href="#menu" class="sidebar-menu-button" aria-current="page"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg><span>Requests</span></a></li>
      <li class="sidebar-menu-item"><a href="#menu" class="sidebar-menu-button"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg><span>Fragments swapped in the last 24 hours</span></a></li>
      <li class="sidebar-menu-item"><a href="#menu" class="sidebar-menu-button sidebar-menu-button-sm"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg><span>Small</span></a></li>
      <li class="sidebar-menu-item"><button type="button" class="sidebar-menu-button sidebar-menu-button-outline"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg><span>Outline</span></button></li>
      <li class="sidebar-menu-item"><a class="sidebar-menu-button" aria-disabled="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg><span>Disabled</span></a></li>
      <li class="sidebar-menu-item">
        <a href="#menu" class="sidebar-menu-button sidebar-menu-button-lg">
          <span class="avatar shrink-0" aria-hidden="true"><span class="avatar-fallback">RO</span></span>
          <span class="grid flex-1 leading-tight"><span class="truncate font-medium">Rin Okafor</span><span class="truncate text-xs text-muted-foreground">Maintainer</span></span>
        </a>
      </li>
    </ul>
  </div>
</aside>
```

## Menu action

A `.sidebar-menu-action` is a small icon button at the end of an item, next to the menu button rather than inside it (a button can't hold another). Add `.sidebar-menu-action-hover` to show it only while the item is hovered or focused, or its menu is open; screens that can't hover always show it. To open a [dropdown](/docs/v0.2/components/dropdown), wrap the action in the dropdown and make it the trigger.

```html
<aside class="sidebar h-auto rounded-lg border" data-breakpoint="none" aria-label="Action example">
  <div class="sidebar-group">
    <ul class="sidebar-menu">
      <li class="sidebar-menu-item">
        <a href="#menu-action" class="sidebar-menu-button"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg><span>Checkout swaps</span></a>
        <div class="dropdown" data-dropdown>
          <button type="button" class="sidebar-menu-action sidebar-menu-action-hover" data-dropdown-trigger aria-haspopup="menu" aria-expanded="false" aria-label="Options for Checkout swaps"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></button>
          <div class="dropdown-menu dropdown-menu-end" role="menu" aria-label="Checkout swaps" hidden>
            <button type="button" class="dropdown-item" role="menuitem"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg><span>Copy link</span></button>
            <button type="button" class="dropdown-item dropdown-item-destructive" role="menuitem"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg><span>Remove view</span></button>
          </div>
        </div>
      </li>
      <li class="sidebar-menu-item">
        <a href="#menu-action" class="sidebar-menu-button"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/><path d="M6 6h.01M6 18h.01"/></svg><span>eu-west</span></a>
        <button type="button" class="sidebar-menu-action" aria-label="Pin eu-west"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></svg></button>
      </li>
    </ul>
  </div>
</aside>
```

## Menu badge

A `.sidebar-menu-badge` after the menu button shows a count or a short status at the end of the item. It ignores the pointer, so the whole item stays clickable. Screen readers read it after the link, so keep it meaningful on its own or add hidden text (`<span class="sr-only"> unread</span>`).

```html
<aside class="sidebar h-auto rounded-lg border" data-breakpoint="none" aria-label="Badge example">
  <div class="sidebar-group">
    <ul class="sidebar-menu">
      <li class="sidebar-menu-item"><a href="#menu-badge" class="sidebar-menu-button"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg><span>Requests</span></a><span class="sidebar-menu-badge">1.2k<span class="sr-only"> in the last hour</span></span></li>
      <li class="sidebar-menu-item"><a href="#menu-badge" class="sidebar-menu-button"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg><span>Alerts</span></a><span class="sidebar-menu-badge"><span class="badge badge-danger badge-solid px-1.5">3</span></span></li>
    </ul>
  </div>
</aside>
```

## Menu sub

A `.sidebar-menu-sub` nests a list of `.sidebar-menu-sub-item`s with `.sidebar-menu-sub-button`s under an item, indented along a line. Usually it's the content of a [collapsible](/docs/v0.2/components/collapsible) item: the item is the collapsible, its menu button the trigger with a trailing `chevron-right`, which turns down while open. The current sub-item lights up its stretch of the line, like a branch of a tree. `.sidebar-menu-sub-button-sm` makes the text smaller.

```html
<aside class="sidebar h-auto rounded-lg border" data-breakpoint="none" aria-label="Sub-menu example">
  <div class="sidebar-group">
    <ul class="sidebar-menu">
      <li class="sidebar-menu-item collapsible" data-collapsible>
        <button type="button" class="sidebar-menu-button" data-collapsible-trigger aria-expanded="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg><span>Routes</span><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="collapsible-icon ml-auto" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
        </button>
        <ul class="sidebar-menu-sub" data-collapsible-content>
          <li class="sidebar-menu-sub-item"><a href="#menu-sub" class="sidebar-menu-sub-button font-mono text-xs"><span>/orders</span></a></li>
          <li class="sidebar-menu-sub-item"><a href="#menu-sub" class="sidebar-menu-sub-button font-mono text-xs" aria-current="page"><span>/search</span></a></li>
          <li class="sidebar-menu-sub-item"><a href="#menu-sub" class="sidebar-menu-sub-button font-mono text-xs"><span>/cart/items</span></a></li>
        </ul>
      </li>
      <li class="sidebar-menu-item collapsible" data-collapsible>
        <button type="button" class="sidebar-menu-button" data-collapsible-trigger aria-expanded="false">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/><path d="M6 6h.01M6 18h.01"/></svg><span>Servers</span><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="collapsible-icon ml-auto" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
        </button>
        <ul class="sidebar-menu-sub" data-collapsible-content hidden>
          <li class="sidebar-menu-sub-item"><a href="#menu-sub" class="sidebar-menu-sub-button"><span>eu-west</span></a></li>
          <li class="sidebar-menu-sub-item"><a href="#menu-sub" class="sidebar-menu-sub-button"><span>us-east</span></a></li>
        </ul>
      </li>
    </ul>
  </div>
</aside>
```

## Menu skeleton

`.sidebar-menu-skeleton` is a placeholder item for a menu that is still loading, with an optional `.sidebar-menu-skeleton-icon` and a `.sidebar-menu-skeleton-text` bar whose width is `--skeleton-width` (70% by default). It pulses, except with reduced motion.

```html
<aside class="sidebar h-auto rounded-lg border" data-breakpoint="none" aria-label="Skeleton example">
  <div class="sidebar-group">
    <p class="sidebar-group-label">Saved views</p>
    <ul class="sidebar-menu" aria-busy="true">
      <li class="sr-only">Loading saved views…</li>
      <li class="sidebar-menu-skeleton" aria-hidden="true"><span class="sidebar-menu-skeleton-icon"></span><span class="sidebar-menu-skeleton-text" style="--skeleton-width: 80%"></span></li>
      <li class="sidebar-menu-skeleton" aria-hidden="true"><span class="sidebar-menu-skeleton-icon"></span><span class="sidebar-menu-skeleton-text" style="--skeleton-width: 55%"></span></li>
      <li class="sidebar-menu-skeleton" aria-hidden="true"><span class="sidebar-menu-skeleton-icon"></span><span class="sidebar-menu-skeleton-text" style="--skeleton-width: 65%"></span></li>
    </ul>
  </div>
</aside>
```

With htmx, render the skeleton in the page and let the menu replace itself once it's loaded. The server answers with the finished `<ul class="sidebar-menu">`; see [htmx](#htmx).

```html
<ul class="sidebar-menu" hx-get="/fragments/saved-views" hx-trigger="load" hx-swap="outerHTML" aria-busy="true">
  <li class="sr-only">Loading saved views…</li>
  <li class="sidebar-menu-skeleton" aria-hidden="true">
    <span class="sidebar-menu-skeleton-icon"></span>
    <span class="sidebar-menu-skeleton-text" style="--skeleton-width: 80%"></span>
  </li>
  …
</ul>
```

## Separator and input

`.sidebar-separator` is a line between groups or parts (on an `<hr>`, or a `<div role="separator">`). `.sidebar-input` goes with `.input` ([Input](/docs/v0.2/components/input)) for a compact field, such as a search box in the header.

```html
<aside class="sidebar h-auto rounded-lg border" data-breakpoint="none" aria-label="Separator example">
  <div class="sidebar-header">
    <input class="input sidebar-input" type="search" placeholder="Jump to route…" aria-label="Jump to route" />
  </div>
  <hr class="sidebar-separator" />
  <div class="sidebar-group">
    <ul class="sidebar-menu">
      <li class="sidebar-menu-item"><a href="#separator-input" class="sidebar-menu-button"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg><span>Overview</span></a></li>
    </ul>
  </div>
</aside>
```

## Trigger

Any button with `data-sidebar-trigger` toggles the sidebar named by its `aria-controls`. Without `aria-controls` it toggles the sidebar of the `.sidebar-layout` it's in, and gets `aria-controls` set. Its `aria-expanded` is kept in sync: whether the sidebar is expanded, or, in mobile mode, whether the panel is open. `.sidebar-trigger` is a small ghost icon button for it; a `.btn` works as well. Give it an `aria-label`.

```html
<button type="button" class="sidebar-trigger" data-sidebar-trigger aria-controls="app-sidebar"
        aria-label="Toggle sidebar">{{ icon("panel-left") }}</button>
```

A button with `data-sidebar-close` only closes: the mobile panel when it's open, else it collapses the sidebar. Use it for a close button inside the panel.

## Rail

`.sidebar-rail` with `data-sidebar-rail` is a thin strip along the sidebar's inner edge. Hovering it shows a line and a resize cursor; clicking it toggles the sidebar. When the sidebar has slid off the screen the rail stays at the window's edge, so the sidebar can be brought back from there. It's a pointer shortcut, kept out of the tab order (`tabindex="-1"`): keyboard users have the trigger and [the shortcut](#keyboard). Put it last in the sidebar. It's hidden in mobile mode and with `data-collapsible="none"`.

## Side

`data-side="right"` puts the sidebar on the right: its border, rail, slide direction and the inset's margin all follow. In a right sidebar, use `.tooltip-content-left` for icon-mode tooltips and the `panel-right` icon for the trigger. A layout can hold a sidebar on each side, each with its own trigger.

```html
<aside class="sidebar" data-sidebar data-side="right">…</aside>
```

## Variant

`data-variant` sets how the sidebar sits in the page:

- `sidebar` (the default): a full-height column with a border on its inner edge. See the [preview](#preview).
- `floating`: a rounded panel with a border and a shadow, inset from the window's edges.
- `inset`: the sidebar blends into the page background, and the main area becomes a raised, rounded panel beside it.

```html
<aside class="sidebar" data-sidebar data-variant="floating">…</aside>
<aside class="sidebar" data-sidebar data-variant="inset">…</aside>
```

## Collapsible

`data-collapsible` sets what collapsing does:

- `offcanvas` (the default): the sidebar slides fully out, and the main area takes the space. Once out of view it is hidden, so nothing in it can take focus.
- `icon`: the sidebar shrinks to a rail of icons; see [Icon mode](#icon-mode).
- `none`: it never collapses (on mobile it's still an off-canvas panel).

The state is `data-state="expanded"` or `"collapsed"` on the sidebar. Render the one you want; the behaviour sets `expanded` when there's none.

```html
<aside class="sidebar" data-sidebar data-collapsible="offcanvas" data-state="collapsed">…</aside>
```

## Icon mode and tooltips

Collapsed with `data-collapsible="icon"`, the sidebar is `--sidebar-width-icon` wide. Menu buttons become squares showing just their icon, large ones just their avatar or logo; group labels, badges, actions, sub-menus and `.sidebar-input` hide. The labels stay in the page (clipped, not removed), so links keep their accessible names.

For a tooltip, make the item a [tooltip](/docs/v0.2/components/tooltip) and add its text after the button. It only shows while the sidebar is collapsed to icons. It repeats the button's name, so hide it from screen readers with `aria-hidden="true"`; `Esc` still dismisses it.

```html
<li class="sidebar-menu-item tooltip">
  <a href="/alerts" class="sidebar-menu-button">{{ icon("bell") }}<span>Alerts</span></a>
  <span class="tooltip-content tooltip-content-right" aria-hidden="true">Alerts</span>
</li>
```

In icon mode the content doesn't scroll, so the tooltips and menus can reach outside it: keep the icons to what fits the height of the window.

## Width

Three CSS variables set the widths. Set them on the sidebar, the layout or any ancestor, for example with Tailwind's arbitrary properties.

| Variable | Description |
| --- | --- |
| `--sidebar-width` | Expanded width, 16rem by default. Floating and inset sidebars include their 0.5rem margin in it. |
| `--sidebar-width-icon` | Width of the icon rail, 3rem by default (a 2rem button and its padding). |
| `--sidebar-width-mobile` | Width of the mobile panel, 18rem by default. |
| `--sidebar-top` | Where the sidebar sticks, and how much shorter than the window it is: the height of a header above it. 0 by default. |

```html
<aside class="sidebar [--sidebar-width:20rem] [--sidebar-width-mobile:85vw]" data-sidebar>…</aside>
```

## Mobile

Below a breakpoint the sidebar becomes an off-canvas panel over the page, with a dimmed backdrop. The same trigger and shortcut open it. It closes on `Esc`, a click on the backdrop, following a link inside it, or a `data-sidebar-close` button. While it's open, focus moves into it (to the current page's link), stays there, the rest of the layout is inert and the page doesn't scroll; closing returns focus to the trigger. The panel always shows the full sidebar, whatever its desktop state.

`data-breakpoint` picks the breakpoint: `sm` (40rem), `md` (48rem, the default), `lg` (64rem), or `none` to stay a column at every width. The switch is a media query on the window's width, in `sidebar.css`; the behaviour reads it from the stylesheet (the `--sidebar-mobile` custom property), so the two always agree, and it marks the sidebar `data-mobile` while it applies. The frame below is phone-sized:

## Keyboard

| Key | Action |
| --- | --- |
| `Ctrl` `B` / `⌘` `B` | Toggles the sidebar (opens or closes the panel in mobile mode). Ignored while typing in a field. |
| `Tab` `Shift` `Tab` | Moves through the links and buttons. Inside the open mobile panel, wraps around within it. |
| `Enter` `Space` | Follows a link, presses a button, opens or closes a collapsible item or group. |
| `Esc` | Closes the mobile panel and returns focus to the trigger; otherwise hides an icon-mode tooltip. |

`data-shortcut="j"` moves the shortcut to another letter; `data-shortcut="none"` turns it off. Every sidebar listens for its own letter, so with two sidebars on a page give them different letters or turn one off.

## Persistence and server rendering

With `data-cookie="sidebar_state"` (any cookie name) the behaviour stores the desktop state each time it changes: `true` for expanded, `false` for collapsed, for seven days, on path `/`, `SameSite=Lax`. On load it restores a stored state without animating. Without `data-cookie` nothing is stored.

The behaviour only runs once the page has loaded, so a page that renders the sidebar expanded and is then restored to collapsed would show it open for a moment. Render the stored state instead. On a server, read the cookie and pass it to the template (see [rendering a page per request](/docs/v0.2/servers/rendering#render-per-request)):

```ts server.ts
app.get("/dashboard", ({ request }) => {
  const collapsed = /(?:^|;\s*)sidebar_state=false/.test(request.headers.get("cookie") ?? "");
  return html(site.render("/dashboard", { sidebarState: collapsed ? "collapsed" : "expanded" }));
});
```

```html pages/dashboard.html
<aside id="app-sidebar" class="sidebar" data-sidebar data-collapsible="icon" data-cookie="sidebar_state"
       data-state="{{ sidebarState | default('expanded') }}">…</aside>
```

A static site has no request to read, so set the state from the cookie with a small inline script as the sidebar's first child. It runs before the page is painted:

```html Static pages
<aside id="app-sidebar" class="sidebar" data-sidebar data-collapsible="icon" data-cookie="sidebar_state">
  <script>
    if (/(?:^|;\s*)sidebar_state=false/.test(document.cookie))
      document.currentScript.parentElement.dataset.state = "collapsed";
  </script>
  …
</aside>
```

## Theming

The sidebar has its own colour tokens, so it can be tinted apart from the page. By default they follow the page's ([Theming](/docs/v0.2/theming#tokens)), with a slightly darker background in light mode. Override them on `:root`, under `.dark`, or on one sidebar. Each is also a Tailwind colour: `bg-sidebar`, `text-sidebar-primary`, `border-sidebar-border`…

| Token | Description |
| --- | --- |
| `--sidebar` | Background. zinc-50 in light mode, zinc-900 in dark. |
| `--sidebar-foreground` | Text and icons. Defaults to --foreground. |
| `--sidebar-primary` | Accent fills, such as a logo tile. Defaults to --primary. |
| `--sidebar-primary-foreground` | Text on --sidebar-primary. |
| `--sidebar-accent` | Hovered and current items. Defaults to --accent. |
| `--sidebar-accent-foreground` | Text on --sidebar-accent. |
| `--sidebar-border` | Borders, the sub-menu line, separators, the rail. Defaults to --border. |
| `--sidebar-ring` | Focus rings. Defaults to --ring. |

```css
/* A dark sidebar in both themes */
.sidebar {
  --sidebar: var(--color-zinc-900);
  --sidebar-foreground: var(--color-zinc-300);
  --sidebar-accent: var(--color-zinc-800);
  --sidebar-accent-foreground: var(--color-white);
  --sidebar-border: var(--color-zinc-800);
}
```

## Accessibility

- The `<aside>` is a complementary landmark; give it an `aria-label`. Make the part holding the site's links a `<nav>` with its own label.
- Mark the current page with `aria-current="page"`: it's both what screen readers announce and the style hook.
- Menus are lists of links and buttons, not ARIA menus, so `Tab` moves through them as through any navigation. Collapsible items and groups are disclosure buttons with `aria-expanded`.
- The trigger is a button with `aria-controls` and an `aria-expanded` that follows the sidebar. Label it.
- Collapsed to icons, labels are clipped rather than removed, so links keep their names; the tooltips that repeat them are `aria-hidden`, appear on keyboard focus too, and `Esc` hides them.
- A sidebar slid off the screen and a closed mobile panel are hidden, so nothing in them can be focused.
- The open mobile panel keeps focus inside it and makes the rest of the layout inert; closing it returns focus to where it was.
- Action buttons need an `aria-label` naming their item ("Options for Checkout swaps"), since several share an icon.
- With reduced motion the sidebar switches states without animating.

## htmx

The behaviour runs again on every element htmx inserts (`initComponents` on `htmx:after:process`), so a sidebar, a trigger or a menu returned by the server works without extra code, and the existing triggers follow a sidebar that was replaced. Load slow parts of the menu after the page, as in [Menu skeleton](#menu-skeleton): the fragment the server returns is ordinary sidebar markup.

```html The fragment for hx-get="/fragments/saved-views"
<ul class="sidebar-menu">
  {% for view in saved_views %}
    <li class="sidebar-menu-item tooltip">
      <a href="/views/{{ view.id }}" class="sidebar-menu-button">{{ icon("bookmark") }}<span>{{ view.name }}</span></a>
      <span class="tooltip-content tooltip-content-right" aria-hidden="true">{{ view.name }}</span>
    </li>
  {% endfor %}
</ul>
```

With `hx-boost`, mark the current link from the page being rendered (`aria-current="page"`) as usual; following a link closes the mobile panel before the new page is swapped in.

## Events

Every change fires a bubbling `sidebar:toggle` event on the sidebar, with `detail` `{ expanded, open, mobile }`: the desktop state, whether the mobile panel is open, and whether the sidebar is in mobile mode. To toggle it from a script, click its trigger.

```js
document.addEventListener("sidebar:toggle", (e) => {
  console.log(e.target.id, e.detail.expanded ? "expanded" : "collapsed");
});
document.querySelector("[data-sidebar-trigger]").click();
```

## The docs navigation

The navigation of these docs is a sidebar composed for a docs site: it never collapses on a desktop (`data-collapsible="none"`), it's an off-canvas panel below `lg` opened by the header's menu button, it sticks under the 56px header with `--sidebar-top`, and its colours come from the tokens: transparent from `lg` up, with muted links.

```html layouts/docs.html (shortened)
<div class="sidebar-layout mx-auto min-h-0 max-w-7xl gap-12 px-4">
  <aside id="docs-nav" class="sidebar text-foreground [--sidebar-foreground:var(--muted-foreground)]
                [--sidebar-top:3.5rem] [--sidebar-width:15rem] [--sidebar:var(--background)]
                lg:border-r-0 lg:[--sidebar:transparent]"
         data-sidebar data-collapsible="none" data-breakpoint="lg" data-shortcut="none" aria-label="Documentation">
    <div class="sidebar-header flex-row items-center justify-between lg:hidden">
      <span class="font-semibold">Documentation</span>
      <button type="button" class="btn btn-ghost btn-icon btn-sm" data-sidebar-close aria-label="Close navigation">…</button>
    </div>
    <div class="sidebar-content gap-6 p-6 lg:px-0 lg:py-8">
      <nav class="sidebar-group p-0" aria-labelledby="docs-nav-1">
        <p id="docs-nav-1" class="sidebar-group-label …">Getting started</p>
        <ul class="sidebar-menu gap-0">
          <li class="sidebar-menu-item"><a href="/docs" class="sidebar-menu-button" aria-current="page"><span>Introduction</span></a></li>
        </ul>
      </nav>
    </div>
  </aside>
  <main class="min-w-0 flex-1">…</main>
</div>
```

## Upgrading from 0.1

The sidebar of 0.1 was a single navigation column. Its classes map to the new parts:

| 0.1 | Description |
| --- | --- |
| `.sidebar-label` | .sidebar-group-label (inside a .sidebar-group). |
| `.sidebar-link` | .sidebar-menu-button, in a <li class="sidebar-menu-item"> of a <ul class="sidebar-menu">. |
| `.sidebar-group` | Still the section, now with padding and no margin between groups: wrap the groups in .sidebar-content and set its gap. |
| `.sidebar-backdrop` | Remove it: the backdrop is drawn by .sidebar-layout. |
| `[data-sidebar-toggle]` | [data-sidebar-trigger]. |
| `[data-sidebar-close]` | Same name; now for close buttons, not the backdrop. |
| `[data-open]` | Same meaning (the mobile panel is open), but set only in mobile mode. |
| `.sidebar (lg sticky column)` | Wrap it with its main area in .sidebar-layout. For the old look: data-collapsible="none" data-breakpoint="lg", --sidebar-top for the header, --sidebar-width: 15rem, and a transparent --sidebar from lg up (see the docs navigation above). |

## Reference

| Class | Description |
| --- | --- |
| `.sidebar-layout` | The layout: a flex row of the sidebar and .sidebar-inset, at least as tall as the window. Draws the mobile backdrop. |
| `.sidebar-inset` | The main area beside the sidebar. A raised panel with data-variant="inset". |
| `.sidebar` | The sidebar column. Sticky; full height minus --sidebar-top. |
| `.sidebar-header` | Top part: logo, workspace or environment switcher, search. |
| `.sidebar-content` | Middle part; scrolls. |
| `.sidebar-footer` | Bottom part: user menu. |
| `.sidebar-separator` | A line between parts or groups. |
| `.sidebar-input` | A compact .input for the sidebar. |
| `.sidebar-group` | A section of the content. |
| `.sidebar-group-label` | Group heading. On a button or summary, a collapsible trigger. |
| `.sidebar-group-action` | Icon button in the group's top-right corner. |
| `.sidebar-group-content` | Wraps the group's menu (the collapsible content). |
| `.sidebar-menu` | A list of items (ul). |
| `.sidebar-menu-item` | An item (li). Add .tooltip for an icon-mode tooltip. |
| `.sidebar-menu-button` | The item's link or button. Current with aria-current="page" or data-active. |
| `.sidebar-menu-button-sm` | 28px tall, smaller text. |
| `.sidebar-menu-button-lg` | 48px tall, for two lines or an avatar. |
| `.sidebar-menu-button-outline` | With a border and a background. |
| `.sidebar-menu-action` | Icon button at the end of an item (or a dropdown trigger there). |
| `.sidebar-menu-action-hover` | Shows the action only while the item is hovered or focused. |
| `.sidebar-menu-badge` | A count or status at the end of an item. |
| `.sidebar-menu-sub` | A nested list under an item. |
| `.sidebar-menu-sub-item` | An item of a sub-menu. |
| `.sidebar-menu-sub-button` | A sub-menu link. Current with aria-current="page" or data-active. |
| `.sidebar-menu-sub-button-sm` | Smaller sub-menu text. |
| `.sidebar-menu-skeleton` | A loading placeholder item. |
| `.sidebar-menu-skeleton-icon` | Its icon square. |
| `.sidebar-menu-skeleton-text` | Its text bar; width from --skeleton-width (70%). |
| `.sidebar-trigger` | A small icon button for data-sidebar-trigger. |
| `.sidebar-rail` | Thin toggle strip along the inner edge (with data-sidebar-rail). |
| `data-sidebar` | Behaviour: marks the sidebar. |
| `data-side` | left (default) or right. |
| `data-variant` | sidebar (default), floating or inset. |
| `data-collapsible` | offcanvas (default), icon or none. |
| `data-state` | expanded (default) or collapsed: the desktop state. |
| `data-breakpoint` | sm, md (default), lg or none: below it the sidebar is an off-canvas panel. |
| `data-shortcut` | The Ctrl/⌘ shortcut's letter (b), or none. |
| `data-cookie` | Cookie name to remember the state in (true/false). None by default. |
| `data-open` | State, set by the behaviour: the mobile panel is open. |
| `data-mobile` | State, set by the behaviour: the sidebar is in mobile mode. |
| `data-sidebar-trigger` | Behaviour: toggles the sidebar in aria-controls (or its layout's); aria-expanded kept in sync. |
| `data-sidebar-rail` | Behaviour: toggles the sidebar it's in. |
| `data-sidebar-close` | Behaviour: closes the mobile panel, or collapses the sidebar. |
| `sidebar:toggle` | Event on every change; detail { expanded, open, mobile }. |
| `--sidebar-width` | Expanded width (16rem). |
| `--sidebar-width-icon` | Icon rail width (3rem). |
| `--sidebar-width-mobile` | Mobile panel width (18rem). |
| `--sidebar-top` | Sticky offset and height reduction (0). |
| `--skeleton-width` | Width of a .sidebar-menu-skeleton-text bar (70%). |
| `--sidebar, --sidebar-*` | Colour tokens; see Theming. |
