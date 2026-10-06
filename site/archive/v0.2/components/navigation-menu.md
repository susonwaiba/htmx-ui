---
title: "Navigation menu"
description: "A site's main navigation: links, and buttons that open panels of links, from simple lists to mega menus."
url: "/docs/v0.2/components/navigation-menu"
section: "Components"
---

# Navigation menu

A site's main navigation: links, and buttons that open panels of links, from simple lists to mega menus.

```html
<nav class="navigation-menu" aria-label="Main" data-navigation-menu>
  <ul class="navigation-menu-list flex-wrap justify-start">
    <li class="navigation-menu-item">
      <button class="navigation-menu-trigger" aria-expanded="false">Getting started <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>
      <div class="navigation-menu-content">
        <ul class="navigation-menu-grid w-[400px] md:w-[460px] md:grid-cols-[.75fr_1fr]">
          <li class="md:row-span-3">
            <a class="navigation-menu-featured" href="/docs">
              <span class="navigation-menu-link-title">htmx-ui</span>
              <span class="navigation-menu-link-description">Components for htmx apps, styled with Tailwind CSS.</span>
            </a>
          </li>
          <li>
            <a class="navigation-menu-link" href="/docs">
              <span class="navigation-menu-link-title">Introduction</span>
              <span class="navigation-menu-link-description">Plain HTML and CSS, with a little TypeScript where it helps.</span>
            </a>
          </li>
          <li>
            <a class="navigation-menu-link" href="/docs/installation">
              <span class="navigation-menu-link-title">Installation</span>
              <span class="navigation-menu-link-description">How to install the packages and structure your app.</span>
            </a>
          </li>
          <li>
            <a class="navigation-menu-link" href="/docs/components/text">
              <span class="navigation-menu-link-title">Typography</span>
              <span class="navigation-menu-link-description">Styles for headings, paragraphs, lists and more.</span>
            </a>
          </li>
        </ul>
      </div>
    </li>
    <li class="navigation-menu-item">
      <button class="navigation-menu-trigger" aria-expanded="false">Components <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>
      <div class="navigation-menu-content">
        <ul class="navigation-menu-grid w-[400px] md:w-[460px] md:grid-cols-2">
          <li>
            <a class="navigation-menu-link" href="/docs/components/dialog">
              <span class="navigation-menu-link-title">Dialog</span>
              <span class="navigation-menu-link-description">A window over the page that holds focus until it is closed.</span>
            </a>
          </li>
          <li>
            <a class="navigation-menu-link" href="/docs/components/hover-card">
              <span class="navigation-menu-link-title">Hover card</span>
              <span class="navigation-menu-link-description">For sighted users to preview content available behind a link.</span>
            </a>
          </li>
          <li>
            <a class="navigation-menu-link" href="/docs/components/progress">
              <span class="navigation-menu-link-title">Progress</span>
              <span class="navigation-menu-link-description">Shows how far a task has got, typically as a bar.</span>
            </a>
          </li>
          <li>
            <a class="navigation-menu-link" href="/docs/components/separator">
              <span class="navigation-menu-link-title">Separator</span>
              <span class="navigation-menu-link-description">A line that separates content, horizontally or vertically.</span>
            </a>
          </li>
          <li>
            <a class="navigation-menu-link" href="/docs/components/tabs">
              <span class="navigation-menu-link-title">Tabs</span>
              <span class="navigation-menu-link-description">Layered sections of content, called tab panels, shown one at a time.</span>
            </a>
          </li>
          <li>
            <a class="navigation-menu-link" href="/docs/components/tooltip">
              <span class="navigation-menu-link-title">Tooltip</span>
              <span class="navigation-menu-link-description">A short hint on hover or keyboard focus.</span>
            </a>
          </li>
        </ul>
      </div>
    </li>
    <li class="navigation-menu-item"><a class="navigation-menu-link" href="/docs">Docs</a></li>
    <li class="navigation-menu-item">
      <button class="navigation-menu-trigger" aria-expanded="false">List <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>
      <div class="navigation-menu-content">
        <ul class="navigation-menu-grid w-[300px]">
          <li>
            <a class="navigation-menu-link" href="/docs/components">
              <span class="navigation-menu-link-title">Components</span>
              <span class="navigation-menu-link-description">Browse all components in the library.</span>
            </a>
          </li>
          <li>
            <a class="navigation-menu-link" href="/docs">
              <span class="navigation-menu-link-title">Documentation</span>
              <span class="navigation-menu-link-description">Learn how to use the library.</span>
            </a>
          </li>
          <li>
            <a class="navigation-menu-link" href="/docs/theming">
              <span class="navigation-menu-link-title">Theming</span>
              <span class="navigation-menu-link-description">Change colours, radius and dark mode.</span>
            </a>
          </li>
        </ul>
      </div>
    </li>
    <li class="navigation-menu-item">
      <button class="navigation-menu-trigger" aria-expanded="false">Simple <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>
      <div class="navigation-menu-content navigation-menu-content-end">
        <ul class="navigation-menu-grid w-[200px]">
          <li><a class="navigation-menu-link" href="/docs/components">Components</a></li>
          <li><a class="navigation-menu-link" href="/docs">Documentation</a></li>
          <li><a class="navigation-menu-link" href="/docs/theming">Theming</a></li>
        </ul>
      </div>
    </li>
    <li class="navigation-menu-item">
      <button class="navigation-menu-trigger" aria-expanded="false">With icon <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>
      <div class="navigation-menu-content navigation-menu-content-end">
        <ul class="navigation-menu-grid w-[200px]">
          <li><a class="navigation-menu-link" href="#"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg> Backlog</a></li>
          <li><a class="navigation-menu-link" href="#"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="12" cy="12" r="10"/></svg> To do</a></li>
          <li><a class="navigation-menu-link" href="#"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg> Done</a></li>
        </ul>
      </div>
    </li>
  </ul>
</nav>
```

## Markup

- A `<nav>` with `.navigation-menu`, `data-navigation-menu` and an `aria-label` naming it (Main), holding a `<ul class="navigation-menu-list">` of `<li class="navigation-menu-item">`.
- An item is either a link, `<a class="navigation-menu-link">`, or a `<button class="navigation-menu-trigger" aria-expanded="false">` followed by its panel, `<div class="navigation-menu-content">`. End the trigger's label with `icon("chevron-down")`; it turns over while the panel is open.
- The behaviour gives each panel an id, points its trigger's `aria-controls` at it and keeps `aria-expanded` in sync. CSS shows the panel of an expanded trigger.
- In a panel, a `.navigation-menu-grid` lists `.navigation-menu-link`s. A link holds a `.navigation-menu-link-title` and a muted `.navigation-menu-link-description`, or an icon and a label, or just a label. A `.navigation-menu-featured` link is a large tile. Size and lay out the grid with utilities (`w-[400px]`, `md:grid-cols-2`, `md:row-span-3` on the tile's item).
- It is the [disclosure navigation](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/) pattern: plain buttons and links, not `role="menu"`, which is for application menus like a [dropdown](/docs/v0.2/components/dropdown).

## Opening and closing

- Clicking a trigger opens its panel, and clicking it again closes it. Only one panel is open at a time.
- With a mouse, resting on a trigger opens its panel after `200ms`. While a panel is open, moving onto another trigger switches to its panel at once.
- A panel opened by hovering closes `300ms` after the pointer leaves its item, so the pointer can cross the gap into it. Clicking the trigger of a hover-opened panel keeps it open instead: it then stays until it is closed on purpose.
- `Esc`, a click outside the menu, focus leaving the menu or moving to another item, and following a link in the panel all close it.
- `--navigation-menu-open-delay` and `--navigation-menu-close-delay` on the nav (or any ancestor) change the delays.
- Without JavaScript, CSS opens a panel while its item is hovered or holds focus.

## Active link

Mark the link to the current page with `aria-current="page"`: screen readers announce it and it gets the accent background. It works on top-level links and on links in a panel.

```html
<nav class="navigation-menu" aria-label="Site" data-navigation-menu>
  <ul class="navigation-menu-list">
    <li class="navigation-menu-item"><a class="navigation-menu-link" href="#">Home</a></li>
    <li class="navigation-menu-item"><a class="navigation-menu-link" href="#" aria-current="page">Docs</a></li>
    <li class="navigation-menu-item"><a class="navigation-menu-link" href="#">Components</a></li>
    <li class="navigation-menu-item"><a class="navigation-menu-link" href="#">Blog</a></li>
  </ul>
</nav>
```

A menu of links only, like this one, needs no panels; the behaviour still adds arrow-key movement between them.

## Panel alignment

A panel opens below its trigger, lined up with the trigger's left edge. `.navigation-menu-content-center` centres it and `.navigation-menu-content-end` lines it up with the right edge, for the last items of a menu at the right of the page.

```html
<nav class="navigation-menu" aria-label="Alignment" data-navigation-menu>
  <ul class="navigation-menu-list">
    <li class="navigation-menu-item">
      <button class="navigation-menu-trigger" aria-expanded="false">Start <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>
      <div class="navigation-menu-content">
        <ul class="navigation-menu-grid w-[220px]">
          <li><a class="navigation-menu-link" href="#">Overview</a></li>
          <li><a class="navigation-menu-link" href="#">Pricing</a></li>
          <li><a class="navigation-menu-link" href="#">Customers</a></li>
        </ul>
      </div>
    </li>
    <li class="navigation-menu-item">
      <button class="navigation-menu-trigger" aria-expanded="false">Center <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>
      <div class="navigation-menu-content navigation-menu-content-center">
        <ul class="navigation-menu-grid w-[220px]">
          <li><a class="navigation-menu-link" href="#">Overview</a></li>
          <li><a class="navigation-menu-link" href="#">Pricing</a></li>
          <li><a class="navigation-menu-link" href="#">Customers</a></li>
        </ul>
      </div>
    </li>
    <li class="navigation-menu-item">
      <button class="navigation-menu-trigger" aria-expanded="false">End <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>
      <div class="navigation-menu-content navigation-menu-content-end">
        <ul class="navigation-menu-grid w-[220px]">
          <li><a class="navigation-menu-link" href="#">Overview</a></li>
          <li><a class="navigation-menu-link" href="#">Pricing</a></li>
          <li><a class="navigation-menu-link" href="#">Customers</a></li>
        </ul>
      </div>
    </li>
  </ul>
</nav>
```

## Indicator

`.navigation-menu-indicator` on the nav adds an arrow pointing from the open trigger to its panel.

```html
<nav class="navigation-menu navigation-menu-indicator" aria-label="Products" data-navigation-menu>
  <ul class="navigation-menu-list">
    <li class="navigation-menu-item">
      <button class="navigation-menu-trigger" aria-expanded="false">Products <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>
      <div class="navigation-menu-content">
        <ul class="navigation-menu-grid w-[240px]">
          <li><a class="navigation-menu-link" href="#"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65M22 12.65l-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/></svg> Components</a></li>
          <li><a class="navigation-menu-link" href="#"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/><path d="M6 6h.01M6 18h.01"/></svg> Engine</a></li>
          <li><a class="navigation-menu-link" href="#"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg> Search plugin</a></li>
        </ul>
      </div>
    </li>
    <li class="navigation-menu-item"><a class="navigation-menu-link" href="#">Pricing</a></li>
  </ul>
</nav>
```

## Vertical

`.navigation-menu-vertical` stacks the items, for a sidebar or a menu on a small screen. Panels open in place under their trigger and push the items below down; they open by click or keyboard only, never on hover, and grids become a single column.

```html
<nav class="navigation-menu navigation-menu-vertical w-64" aria-label="Sections" data-navigation-menu>
  <ul class="navigation-menu-list">
    <li class="navigation-menu-item">
      <button class="navigation-menu-trigger" aria-expanded="false">Getting started <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>
      <div class="navigation-menu-content">
        <ul class="navigation-menu-grid">
          <li><a class="navigation-menu-link" href="#">Introduction</a></li>
          <li><a class="navigation-menu-link" href="#">Installation</a></li>
        </ul>
      </div>
    </li>
    <li class="navigation-menu-item">
      <button class="navigation-menu-trigger" aria-expanded="false">Components <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>
      <div class="navigation-menu-content">
        <ul class="navigation-menu-grid">
          <li><a class="navigation-menu-link" href="#">Dialog</a></li>
          <li><a class="navigation-menu-link" href="#">Hover card</a></li>
          <li><a class="navigation-menu-link" href="#">Tooltip</a></li>
        </ul>
      </div>
    </li>
    <li class="navigation-menu-item"><a class="navigation-menu-link" href="#">Docs</a></li>
  </ul>
</nav>
```

## Small screens

A horizontal menu with wide panels doesn't fit a phone, and there is no hover there. Show it from the `md` breakpoint up, and below that a button that opens the same links in a vertical menu: in a [collapsible](/docs/v0.2/components/collapsible) under the header, as here, or in a [sheet](/docs/v0.2/components/sheet) from the side. Narrow the window to see the switch.

```html
<div class="w-full">
  <nav class="navigation-menu hidden md:flex" aria-label="Main (wide screens)" data-navigation-menu>
    <ul class="navigation-menu-list">
      <li class="navigation-menu-item">
        <button class="navigation-menu-trigger" aria-expanded="false">Products <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>
        <div class="navigation-menu-content">
          <ul class="navigation-menu-grid w-[220px]">
            <li><a class="navigation-menu-link" href="#">Components</a></li>
            <li><a class="navigation-menu-link" href="#">Engine</a></li>
          </ul>
        </div>
      </li>
      <li class="navigation-menu-item"><a class="navigation-menu-link" href="#">Pricing</a></li>
      <li class="navigation-menu-item"><a class="navigation-menu-link" href="#">Docs</a></li>
    </ul>
  </nav>
  <div class="collapsible md:hidden" data-collapsible>
    <button type="button" class="btn btn-outline btn-sm w-fit" data-collapsible-trigger aria-expanded="false"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg> Menu</button>
    <div class="collapsible-content mt-2" data-collapsible-content hidden>
      <nav class="navigation-menu navigation-menu-vertical" aria-label="Main (small screens)" data-navigation-menu>
        <ul class="navigation-menu-list">
          <li class="navigation-menu-item">
            <button class="navigation-menu-trigger" aria-expanded="false">Products <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>
            <div class="navigation-menu-content">
              <ul class="navigation-menu-grid">
                <li><a class="navigation-menu-link" href="#">Components</a></li>
                <li><a class="navigation-menu-link" href="#">Engine</a></li>
              </ul>
            </div>
          </li>
          <li class="navigation-menu-item"><a class="navigation-menu-link" href="#">Pricing</a></li>
          <li class="navigation-menu-item"><a class="navigation-menu-link" href="#">Docs</a></li>
        </ul>
      </nav>
    </div>
  </div>
</div>
```

Only one of the two menus is displayed at a time, so screen readers meet one navigation landmark. Render both from the same data (a `json()` file and a loop) so they never drift apart.

## Keyboard

| Key | Action |
| --- | --- |
| `Tab` | Moves through the triggers and links in page order, and into an open panel after its trigger. Leaving an item closes its panel. |
| `Enter` `Space` | On a trigger, opens or closes its panel. On a link, follows it (`Enter`). |
| `→` `←` | On the top level, moves to the next or previous trigger or link, wrapping round. |
| `Home` `End` | Moves to the first or last top-level item; in a panel, to its first or last link. |
| `↓` | On a trigger, opens its panel and moves to its first link. In a panel, moves to the next link. |
| `↑` | In a panel, moves to the previous link, or from the first link back to the trigger. |
| `Esc` | Closes the open panel and returns focus to its trigger. |

In a vertical menu, `↓` and `↑` move through the top-level items and the links of an open panel as one list.

## Accessibility

- The nav is a navigation landmark: give it an `aria-label`, and a different one to each navigation on the page.
- Triggers are buttons with `aria-expanded` and `aria-controls`, so screen readers announce collapsed or expanded. Links stay links, read in order, and there are no menu roles to change how the keyboard works.
- A closed panel is hidden with `visibility`, so it is out of the tab order and the accessibility tree, and can fade out as well as in.
- Arrow keys are a shortcut on top of `Tab`, which reaches everything.
- Hover-opened panels can be dismissed with `Esc` without moving the pointer, and wait for the pointer to cross into them (WCAG 1.4.13).
- With reduced motion, panels fade without zooming and the chevron turns without animating.

## With htmx

Boost the menu's links with `hx-boost:inherited="true"` on the nav, or on `<body>` as this site does, so following one swaps the page without a full reload. The panel closes when one of its links is followed. If the response replaces the whole body, the server renders the new `aria-current`; if it swaps only the main content (`hx-target` and `hx-select`), also return the menu with `hx-swap-oob` so the current link moves.

```html
<nav class="navigation-menu" aria-label="Main" data-navigation-menu hx-boost:inherited="true">
  <ul class="navigation-menu-list">
    <li class="navigation-menu-item"><a class="navigation-menu-link" href="/" aria-current="page">Home</a></li>
    <li class="navigation-menu-item"><a class="navigation-menu-link" href="/docs">Docs</a></li>
  </ul>
</nav>
```

A panel fires `navigation-menu:open` and `navigation-menu:close` (they bubble) each time it opens and closes. Fill a panel from the server the first time it opens with `hx-trigger="navigation-menu:open once"`:

```html
<nav class="navigation-menu" aria-label="Account" data-navigation-menu>
  <ul class="navigation-menu-list">
    <li class="navigation-menu-item">
      <button class="navigation-menu-trigger" aria-expanded="false">Recent <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>
      <div class="navigation-menu-content w-64" hx-get="/api/recent" hx-trigger="navigation-menu:open once">
        <span class="flex items-center gap-2 p-2 text-muted-foreground">
          <span class="spinner" role="status" aria-label="Loading"></span> Loading…
        </span>
      </div>
    </li>
  </ul>
</nav>
```

## Reference

| Class / attribute | Description |
| --- | --- |
| `.navigation-menu` | The <nav>. Add data-navigation-menu and an aria-label. |
| `.navigation-menu-list` | The <ul> of top-level items, in a row. |
| `.navigation-menu-item` | An <li>: a link, or a trigger and its panel. |
| `.navigation-menu-trigger` | Button that opens the panel after it. Add aria-expanded="false"; a chevron icon inside turns over while open. |
| `.navigation-menu-link` | A link: top-level, styled like a trigger, or in a panel, with a title and description or an icon. aria-current="page" marks the current page. |
| `.navigation-menu-content` | A panel, below its trigger at its left edge. |
| `.navigation-menu-content-center / -end` | Centre the panel on its trigger, or line it up with the right edge. |
| `.navigation-menu-grid` | A <ul> of links in a panel. Lay it out with grid and width utilities. |
| `.navigation-menu-link-title` | A link's title. |
| `.navigation-menu-link-description` | A link's description: muted, at most two lines. |
| `.navigation-menu-featured` | A large tile link, with a gradient background. |
| `.navigation-menu-indicator` | On the nav: an arrow from the open trigger to its panel. |
| `.navigation-menu-vertical` | On the nav: stacked items, panels opening in place, no hover. |
| `[data-navigation-menu]` | Behaviour: aria-expanded/aria-controls, hover delays, closing, arrow keys, events. |
| `--navigation-menu-open-delay` | How long the pointer rests on a trigger before its panel opens (200ms). |
| `--navigation-menu-close-delay` | How long a hover-opened panel stays after the pointer leaves (300ms). |
| `navigation-menu:open / navigation-menu:close` | Events fired on the panel (bubbling) when it opens and closes. |
