---
title: "Item"
description: "Displays a row of content with media, a title, a description and actions, alone or in a list."
url: "/docs/v0.2/components/item"
section: "Components"
---

# Item

Displays a row of content with media, a title, a description and actions, alone or in a list.

```html
<div class="flex w-full max-w-md flex-col gap-4">
  <div class="item item-outline">
    <div class="item-content">
      <p class="item-title">Basic item</p>
      <p class="item-description">A simple item with a title and a description.</p>
    </div>
    <div class="item-actions">
      <button type="button" class="btn btn-outline btn-sm">Action</button>
    </div>
  </div>
  <a class="item item-outline item-sm" href="#">
    <div class="item-media"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-5" aria-hidden="true"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/></svg></div>
    <div class="item-content">
      <p class="item-title">Your profile has been verified.</p>
    </div>
    <div class="item-actions"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></div>
  </a>
</div>
```

## Markup

An item is a flex row. Every part is optional except the content:

```html
<div class="item">
  <div class="item-header">…</div>                  <!-- optional, full width, above <!-- optional, full width, above -->
  <div class="item-media">…</div>                   <!-- an icon, image or avatar <!-- an icon, image or avatar -->
  <div class="item-content">
    <p class="item-title">…</p>
    <p class="item-description">…</p>
  </div>
  <div class="item-actions">…</div>                 <!-- buttons, a menu, a badge <!-- buttons, a menu, a badge -->
  <div class="item-footer">…</div>                  <!-- optional, full width, below <!-- optional, full width, below -->
</div>
```

- `.item-media` sits at the start. Next to a title and a description it aligns with the title rather than the middle.
- `.item-content` takes the free space. A second `.item-content` (a date, an amount) only takes the room it needs.
- `.item-description` is clamped to two lines. Links inside it are underlined.
- `.item-actions` sits at the end.
- `.item-header` and `.item-footer` take a full line each, above and below the rest.

Items wrap. When the media, the content and the actions don't fit side by side, the actions move to a line of their own, still at the end, so an item works on a phone with no extra classes.

## Variants

The default item has no border or background, for lists inside a card or a panel. `.item-outline` adds a border and `.item-muted` a muted background.

```html
<div class="flex w-full max-w-md flex-col gap-4">
  <div class="item">
    <div class="item-content">
      <p class="item-title">Default</p>
      <p class="item-description">Transparent, with no border.</p>
    </div>
    <div class="item-actions"><button type="button" class="btn btn-outline btn-sm">Open</button></div>
  </div>
  <div class="item item-outline">
    <div class="item-content">
      <p class="item-title">Outline</p>
      <p class="item-description">A border around the item.</p>
    </div>
    <div class="item-actions"><button type="button" class="btn btn-outline btn-sm">Open</button></div>
  </div>
  <div class="item item-muted">
    <div class="item-content">
      <p class="item-title">Muted</p>
      <p class="item-description">A muted background, for secondary content.</p>
    </div>
    <div class="item-actions"><button type="button" class="btn btn-outline btn-sm">Open</button></div>
  </div>
</div>
```

## Sizes

The default size, `.item-sm` and `.item-xs` reduce the padding and gaps. The extra small size also shrinks icon and image media and the description.

```html
<div class="flex w-full max-w-md flex-col gap-4">
  <a class="item item-outline" href="#">
    <div class="item-media item-media-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg></div>
    <div class="item-content">
      <p class="item-title">Inbox</p>
      <p class="item-description">12 unread messages</p>
    </div>
    <div class="item-actions"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></div>
  </a>
  <a class="item item-outline item-sm" href="#">
    <div class="item-media item-media-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg></div>
    <div class="item-content">
      <p class="item-title">Inbox</p>
      <p class="item-description">12 unread messages</p>
    </div>
    <div class="item-actions"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></div>
  </a>
  <a class="item item-outline item-xs" href="#">
    <div class="item-media item-media-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg></div>
    <div class="item-content">
      <p class="item-title">Inbox</p>
      <p class="item-description">12 unread messages</p>
    </div>
    <div class="item-actions"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></div>
  </a>
</div>
```

## Icon

`.item-media-icon` puts an icon in a small bordered, muted square. A bare icon in `.item-media` works too.

```html
<div class="item item-outline w-full max-w-md">
  <div class="item-media item-media-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg></div>
  <div class="item-content">
    <p class="item-title">Security alert</p>
    <p class="item-description">New sign-in from an unknown device in Lisbon, Portugal.</p>
  </div>
  <div class="item-actions">
    <button type="button" class="btn btn-outline btn-sm">Review</button>
  </div>
</div>
```

## Avatar

Put an [avatar](/docs/v0.2/components/avatar) or an avatar group in `.item-media`. The person's name is in the title, so the avatar is decorative: `aria-hidden="true"`, with no role or label.

```html
<div class="flex w-full max-w-md flex-col gap-4">
  <div class="item item-outline">
    <div class="item-media"><span class="avatar avatar-lg" aria-hidden="true"><img class="avatar-image" src="../../../images/avatar-1.svg" alt="" /><span class="avatar-fallback">AL</span></span></div>
    <div class="item-content">
      <p class="item-title">Ana Lima</p>
      <p class="item-description">Last seen 5 months ago</p>
    </div>
    <div class="item-actions">
      <button type="button" class="btn btn-outline btn-icon btn-sm btn-rounded" aria-label="Invite Ana Lima"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M5 12h14M12 5v14"/></svg></button>
    </div>
  </div>
  <div class="item item-outline">
    <div class="item-media">
      <div class="avatar-group" aria-hidden="true">
        <span class="avatar" aria-hidden="true"><img class="avatar-image" src="../../../images/avatar-2.svg" alt="" /><span class="avatar-fallback">KM</span></span>
        <span class="avatar" aria-hidden="true"><img class="avatar-image" src="../../../images/avatar-3.svg" alt="" /><span class="avatar-fallback">RP</span></span>
        <span class="avatar" aria-hidden="true"><img class="avatar-image" src="../../../images/avatar-4.svg" alt="" /><span class="avatar-fallback">MC</span></span>
      </div>
    </div>
    <div class="item-content">
      <p class="item-title">No team members</p>
      <p class="item-description">Invite your team to collaborate on this project.</p>
    </div>
    <div class="item-actions">
      <button type="button" class="btn btn-outline btn-sm">Invite</button>
    </div>
  </div>
</div>
```

## Image

`.item-media-image` crops an image to a rounded square: put an `<img>` inside it, or use it on the `<img>` itself. Images next to a title are decorative: `alt=""`.

```html
<div class="item-group w-full max-w-md gap-2" role="list">
  <div role="listitem">
    <a class="item item-outline" href="#">
      <div class="item-media item-media-image"><img src="../../../images/landscape.svg" alt="" /></div>
      <div class="item-content">
        <p class="item-title">Mountain Echoes <span class="text-muted-foreground">· The Ridgeline</span></p>
        <p class="item-description">High Country</p>
      </div>
      <div class="item-content text-muted-foreground tabular-nums">3:42</div>
    </a>
  </div>
  <div role="listitem">
    <a class="item item-outline" href="#">
      <div class="item-media item-media-image"><img src="../../../images/ocean.svg" alt="" /></div>
      <div class="item-content">
        <p class="item-title">Low Tide <span class="text-muted-foreground">· Harbour Lights</span></p>
        <p class="item-description">Saltwater</p>
      </div>
      <div class="item-content text-muted-foreground tabular-nums">4:15</div>
    </a>
  </div>
  <div role="listitem">
    <a class="item item-outline" href="#">
      <div class="item-media item-media-image"><img src="../../../images/forest.svg" alt="" /></div>
      <div class="item-content">
        <p class="item-title">Under the Canopy <span class="text-muted-foreground">· Moss &amp; Fern</span></p>
        <p class="item-description">Evergreen</p>
      </div>
      <div class="item-content text-muted-foreground tabular-nums">5:03</div>
    </a>
  </div>
</div>
```

## Group

`.item-group` stacks items in a list. Give it `role="list"` and each item `role="listitem"` (or use a `<ul>` and `<li>`). Put an `.item-separator` between items for a line, hidden from screen readers with `aria-hidden="true"` so the list only holds items; or space them with a `gap-*` utility.

```html
    <div class="item-group w-full max-w-md rounded-[calc(var(--radius)+4px)] border border-border bg-surface" role="list">
      <div class="item" role="listitem">
        <div class="item-media"><span class="avatar" aria-hidden="true"><img class="avatar-image" src="../../../images/avatar-1.svg" alt="" /><span class="avatar-fallback">AL</span></span></div>
        <div class="item-content">
          <p class="item-title">Ana Lima</p>
          <p class="item-description">ana@example.com</p>
        </div>
        <div class="item-actions">
          <button type="button" class="btn btn-ghost btn-icon btn-sm btn-rounded" aria-label="Invite Ana Lima"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M5 12h14M12 5v14"/></svg></button>
        </div>
      </div>
<div class="item-separator" aria-hidden="true"></div>      <div class="item" role="listitem">
        <div class="item-media"><span class="avatar" aria-hidden="true"><img class="avatar-image" src="../../../images/avatar-2.svg" alt="" /><span class="avatar-fallback">KM</span></span></div>
        <div class="item-content">
          <p class="item-title">Kofi Mensah</p>
          <p class="item-description">kofi@example.com</p>
        </div>
        <div class="item-actions">
          <button type="button" class="btn btn-ghost btn-icon btn-sm btn-rounded" aria-label="Invite Kofi Mensah"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M5 12h14M12 5v14"/></svg></button>
        </div>
      </div>
<div class="item-separator" aria-hidden="true"></div>      <div class="item" role="listitem">
        <div class="item-media"><span class="avatar" aria-hidden="true"><img class="avatar-image" src="../../../images/avatar-3.svg" alt="" /><span class="avatar-fallback">RP</span></span></div>
        <div class="item-content">
          <p class="item-title">Ravi Patel</p>
          <p class="item-description">ravi@example.com</p>
        </div>
        <div class="item-actions">
          <button type="button" class="btn btn-ghost btn-icon btn-sm btn-rounded" aria-label="Invite Ravi Patel"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M5 12h14M12 5v14"/></svg></button>
        </div>
      </div>
    </div>
```

## Header

`.item-header` is a full-width row above the media and content. An image or video directly inside it fills the width with rounded corners; set its shape with an `aspect-*` utility. Laid out in a grid, such items make a set of cards. `.item-footer` is the same below.

```html
<div class="item-group grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3" role="list">
  <div class="item item-outline" role="listitem">
    <div class="item-header"><img class="aspect-square" src="../../../images/landscape.svg" alt="" /></div>
    <div class="item-content">
      <p class="item-title">Summit-1</p>
      <p class="item-description">Everyday tasks, fast and inexpensive.</p>
    </div>
    <div class="item-footer">
      <span class="badge badge-secondary">Available</span>
      <button type="button" class="btn btn-ghost btn-sm">Select</button>
    </div>
  </div>
  <div class="item item-outline" role="listitem">
    <div class="item-header"><img class="aspect-square" src="../../../images/ocean.svg" alt="" /></div>
    <div class="item-content">
      <p class="item-title">Tide-2</p>
      <p class="item-description">Long documents and careful reasoning.</p>
    </div>
    <div class="item-footer">
      <span class="badge badge-secondary">Available</span>
      <button type="button" class="btn btn-ghost btn-sm">Select</button>
    </div>
  </div>
  <div class="item item-outline" role="listitem">
    <div class="item-header"><img class="aspect-square" src="../../../images/forest.svg" alt="" /></div>
    <div class="item-content">
      <p class="item-title">Canopy-3</p>
      <p class="item-description">Images and charts alongside text.</p>
    </div>
    <div class="item-footer">
      <span class="badge badge-secondary">Available</span>
      <button type="button" class="btn btn-ghost btn-sm">Select</button>
    </div>
  </div>
</div>
```

## Link

When the whole item goes somewhere and has nothing else to click, make the item the link: `<a class="item" href="…">`. It gets a hover background and a focus outline. The same works on a `<button>` (which takes the full width), though a button may only contain phrasing content, so use `<span>`s for its parts.

```html
<div class="flex w-full max-w-md flex-col gap-4">
  <a class="item" href="#">
    <div class="item-content">
      <p class="item-title">Visit our documentation</p>
      <p class="item-description">Learn how to get started with our components.</p>
    </div>
    <div class="item-actions"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></div>
  </a>
  <a class="item item-outline" href="#" target="_blank" rel="noopener noreferrer">
    <div class="item-content">
      <p class="item-title">External resource</p>
      <p class="item-description">Opens in a new tab with security attributes.</p>
    </div>
    <div class="item-actions"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg></div>
  </a>
</div>
```

### A link with actions

A link can't contain buttons or other links, so an item that is a link _and_ has actions keeps the item a `<div>` and puts a link with `.item-link` around the title. Its `::after` stretches over the whole item, so a click anywhere follows the link and the item shows the link's hover and focus. The actions and the footer come after it in the source and stay clickable on top. Put anything interactive there, not in the header.

```html
<div class="item item-outline w-full max-w-md">
  <div class="item-media item-media-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4M10 9H8M16 13H8M16 17H8"/></svg></div>
  <div class="item-content">
    <p class="item-title"><a class="item-link" href="#">Quarterly report</a></p>
    <p class="item-description">Updated 2 hours ago by Ana Lima</p>
  </div>
  <div class="item-actions">
    <a class="btn btn-ghost btn-icon btn-sm" href="#" aria-label="Download Quarterly report"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg></a>
    <button type="button" class="btn btn-ghost btn-icon btn-sm" aria-label="Share Quarterly report"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/></svg></button>
  </div>
</div>
```

## Dropdown

Items work as entries in a [dropdown](/docs/v0.2/components/dropdown) menu: give each one `role="menuitem"`. Inside `.dropdown-menu` they take the menu's padding and highlight, and the description shrinks to one line. Use `<button>` items with `<span>` parts.

```html
<div class="dropdown" data-dropdown>
  <button type="button" class="btn btn-outline" data-dropdown-trigger aria-haspopup="menu" aria-expanded="false">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> Assign to <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
  </button>
  <div class="dropdown-menu w-72" role="menu" hidden>
    <p class="dropdown-label">Team</p>
    <button type="button" class="item item-xs" role="menuitem">
      <span class="item-media"><span class="avatar avatar-sm" aria-hidden="true"><img class="avatar-image" src="../../../images/avatar-1.svg" alt="" /><span class="avatar-fallback">AL</span></span></span>
      <span class="item-content">
        <span class="item-title">Ana Lima</span>
        <span class="item-description">ana@example.com</span>
      </span>
    </button>
    <button type="button" class="item item-xs" role="menuitem">
      <span class="item-media"><span class="avatar avatar-sm" aria-hidden="true"><img class="avatar-image" src="../../../images/avatar-2.svg" alt="" /><span class="avatar-fallback">KM</span></span></span>
      <span class="item-content">
        <span class="item-title">Kofi Mensah</span>
        <span class="item-description">kofi@example.com</span>
      </span>
    </button>
    <button type="button" class="item item-xs" role="menuitem">
      <span class="item-media"><span class="avatar avatar-sm" aria-hidden="true"><img class="avatar-image" src="../../../images/avatar-3.svg" alt="" /><span class="avatar-fallback">RP</span></span></span>
      <span class="item-content">
        <span class="item-title">Ravi Patel</span>
        <span class="item-description">ravi@example.com</span>
      </span>
    </button>
    <button type="button" class="item item-xs" role="menuitem">
      <span class="item-media"><span class="avatar avatar-sm" aria-hidden="true"><img class="avatar-image" src="../../../images/avatar-4.svg" alt="" /><span class="avatar-fallback">MC</span></span></span>
      <span class="item-content">
        <span class="item-title">Mei Chen</span>
        <span class="item-description">mei@example.com</span>
      </span>
    </button>
  </div>
</div>
```

### A menu in the actions

Put a dropdown in `.item-actions` for the actions that don't fit as buttons. Align its menu to the end with `.dropdown-menu-end`.

```html
<div class="item item-outline w-full max-w-md">
  <div class="item-media item-media-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg></div>
  <div class="item-content">
    <p class="item-title">Project Atlas</p>
    <p class="item-description">8 members · Updated yesterday</p>
  </div>
  <div class="item-actions">
    <div class="dropdown" data-dropdown>
      <button type="button" class="btn btn-ghost btn-icon btn-sm" data-dropdown-trigger aria-haspopup="menu" aria-expanded="false" aria-label="More actions for Project Atlas"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg></button>
      <div class="dropdown-menu dropdown-menu-end" role="menu" hidden>
        <a class="dropdown-item" role="menuitem" href="#">Open</a>
        <button type="button" class="dropdown-item" role="menuitem">Rename</button>
        <button type="button" class="dropdown-item" role="menuitem">Duplicate</button>
        <div class="dropdown-separator" role="separator"></div>
        <button type="button" class="dropdown-item dropdown-item-destructive" role="menuitem"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Delete</button>
      </div>
    </div>
  </div>
</div>
```

## Actions with htmx

Actions are ordinary buttons, so they take `hx-*` attributes. Here the button posts a setting and the server's reply replaces the status in the description. A server can just as well return whole items, to append to an `.item-group` or to replace one item with `hx-swap="outerHTML"`.

```html
<div class="item item-outline w-full max-w-md">
  <div class="item-media item-media-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg></div>
  <div class="item-content">
    <p class="item-title">Email notifications</p>
    <p class="item-description" id="item-notify-status">Off. Turn them on to hear about new comments.</p>
  </div>
  <div class="item-actions">
    <button type="button" class="btn btn-outline btn-sm" hx-post="/api/echo" hx-vals='{"notifications": "on"}' hx-target="#item-notify-status">Turn on</button>
  </div>
</div>
```

## Accessibility

- Group items with `role="list"` and `role="listitem"`, or `<ul>` and `<li>`. Don't put `role="listitem"` on an `<a class="item">`: it replaces the link role. Wrap the link in an element with the role instead.
- Separators inside a list get `aria-hidden="true"`, so the list holds only items; outside a list, use `role="separator"`.
- Never nest a link or button inside `<a class="item">`. For a link item with actions, use `.item-link` on a link around the title.
- Icon-only actions need an `aria-label` that names the item: “Invite Ana Lima”, not “Invite”.
- Media next to a title is decorative: `alt=""` on images, `aria-hidden="true"` on avatars.
- The title is a `<p>` here. Make it a heading when the items are sections of the page someone would navigate by.

## Reference

| Class | Description |
| --- | --- |
| `.item` | A flex row of media, content and actions that wraps on narrow widths. On an <a> or <button>: hover and focus styles. |
| `.item-outline / .item-muted` | A border / a muted background. The default has neither. |
| `.item-sm / .item-xs` | Smaller padding and gaps; -xs also shrinks the media and description. |
| `.item-media` | Media at the start: an icon, an .avatar or an .avatar-group. Aligns with the title when there is a description. |
| `.item-media-icon` | An icon in a bordered, muted square. |
| `.item-media-image` | A rounded square image: an <img> inside it, or the <img> itself. |
| `.item-content` | Title and description; takes the free space. A second one only takes the room it needs. |
| `.item-title` | The title, in medium weight. Holds text, a badge or an .item-link. |
| `.item-description` | Muted text clamped to two lines (one in a menu). Links are underlined. |
| `.item-actions` | Buttons, menus or an icon at the end. |
| `.item-header / .item-footer` | Full-width rows above / below. An image or video directly inside fills the width. |
| `.item-link` | A link whose ::after covers the item, for a link item that also has actions. |
| `.item-group` | A list of items (flex column). Add role="list". |
| `.item-separator` | A line between items in a group. Add aria-hidden="true" inside a list. |
| `.dropdown-menu .item` | Items with role="menuitem" inside a dropdown take the menu's padding and highlight. |
