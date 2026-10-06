---
title: "Empty"
description: "Displays an empty state: no data yet, no results, nothing to show, with a way forward."
url: "/docs/v0.2/components/empty"
section: "Components"
---

# Empty

Displays an empty state: no data yet, no results, nothing to show, with a way forward.

```html
<div class="empty">
  <div class="empty-header">
    <div class="empty-media empty-media-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M12 10v6"/><path d="M9 13h6"/><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg></div>
    <h3 class="empty-title">No projects yet</h3>
    <p class="empty-description">You haven't created any projects yet. Get started by creating your first project.</p>
  </div>
  <div class="empty-content">
    <div class="flex gap-2">
      <button type="button" class="btn btn-primary">Create project</button>
      <button type="button" class="btn btn-outline">Import project</button>
    </div>
  </div>
  <a class="btn btn-link btn-sm text-muted-foreground" href="#">Learn more <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg></a>
</div>
```

## Markup

```html
<div class="empty">
  <div class="empty-header">
    <div class="empty-media empty-media-icon">…icon…</div>
    <h3 class="empty-title">No projects yet</h3>
    <p class="empty-description">…</p>
  </div>
  <div class="empty-content">…buttons, an input…</div>
</div>
```

- `.empty` centres everything in a column and grows to fill its container. It has generous padding, more from the `md` breakpoint.
- `.empty-header` holds the media, title and description, at most 24rem wide.
- `.empty-media` holds an icon, an avatar or an avatar group. With `.empty-media-icon` it is a muted rounded square around an icon.
- `.empty-title` says what is missing; `.empty-description` says why, or what to do. Links in the description are underlined.
- `.empty-content` holds the way forward: buttons, a search field, a link.

## Outline

`.empty-outline` adds a dashed border, as for a drop zone or a slot waiting to be filled.

```html
<div class="empty empty-outline">
  <div class="empty-header">
    <div class="empty-media empty-media-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg></div>
    <h3 class="empty-title">Cloud storage empty</h3>
    <p class="empty-description">Upload files to your cloud storage to access them anywhere.</p>
  </div>
  <div class="empty-content">
    <button type="button" class="btn btn-outline btn-sm"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg> Upload files</button>
  </div>
</div>
```

## Background

`.empty-muted` adds a muted wash that fades out towards the bottom.

```html
<div class="empty empty-muted">
  <div class="empty-header">
    <div class="empty-media empty-media-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg></div>
    <h3 class="empty-title">No notifications</h3>
    <p class="empty-description">You're all caught up. New notifications will appear here.</p>
  </div>
  <div class="empty-content">
    <button type="button" class="btn btn-outline btn-sm"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg> Refresh</button>
  </div>
</div>
```

## Avatar

An [avatar](/docs/v0.2/components/avatar) in `.empty-media` (without `.empty-media-icon`) is shown at 3rem unless it has a size class of its own. It names the person in the title, so it is decorative here.

```html
<div class="empty">
  <div class="empty-header">
    <div class="empty-media">
      <span class="avatar" aria-hidden="true"><img class="avatar-image" src="../../../images/avatar-2.svg" alt="" /><span class="avatar-fallback">KM</span></span>
    </div>
    <h3 class="empty-title">Kofi is offline</h3>
    <p class="empty-description">Kofi is away right now. Leave a message and they'll see it when they're back.</p>
  </div>
  <div class="empty-content">
    <button type="button" class="btn btn-primary btn-sm"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> Leave a message</button>
  </div>
</div>
```

## Avatar group

An avatar group is shown large and in grey, for a team that hasn't joined yet. A `.avatar-group-count` keeps its colour.

```html
<div class="empty">
  <div class="empty-header">
    <div class="empty-media">
      <div class="avatar-group" aria-hidden="true">
        <span class="avatar"><img class="avatar-image" src="../../../images/avatar-1.svg" alt="" /><span class="avatar-fallback">AL</span></span>
        <span class="avatar"><img class="avatar-image" src="../../../images/avatar-3.svg" alt="" /><span class="avatar-fallback">RP</span></span>
        <span class="avatar"><img class="avatar-image" src="../../../images/avatar-4.svg" alt="" /><span class="avatar-fallback">MC</span></span>
      </div>
    </div>
    <h3 class="empty-title">No team members</h3>
    <p class="empty-description">Invite your team to collaborate on this project.</p>
  </div>
  <div class="empty-content">
    <button type="button" class="btn btn-outline btn-sm"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M5 12h14M12 5v14"/></svg> Invite members</button>
  </div>
</div>
```

## Input group

`.empty-content` is a column up to 24rem wide, so a field fills it. Here a not-found page offers a search, using an [input group](/docs/v0.2/components/input-group), and a link to help.

```html
<div class="empty">
  <div class="empty-header">
    <h3 class="empty-title">404 – Page not found</h3>
    <p class="empty-description">The page you're looking for doesn't exist. Try searching for what you need below.</p>
  </div>
  <div class="empty-content">
    <form class="w-full" role="search" action="#">
      <div class="input-group">
        <input class="input" type="search" name="q" placeholder="Search pages…" aria-label="Search pages" />
        <span class="input-group-addon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></span>
        <span class="input-group-addon input-group-addon-inline-end"><kbd class="kbd">/</kbd></span>
      </div>
    </form>
    <p class="empty-description">Need help? <a href="#">Contact support</a></p>
  </div>
</div>
```

## Sizes

`.empty-sm` is compact, for small panels, sidebars and table bodies: less padding and smaller gaps, a smaller icon square and title.

```html
<div class="w-full max-w-xs rounded-[calc(var(--radius)+4px)] border border-border bg-surface">
  <div class="border-b border-border px-4 py-3 text-sm font-medium">Activity</div>
  <div class="empty empty-sm">
    <div class="empty-header">
      <div class="empty-media empty-media-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg></div>
      <p class="empty-title">No activity this week</p>
      <p class="empty-description">Activity from your projects shows up here.</p>
    </div>
  </div>
</div>
```

## In a card

Put the empty state in `.card-content` in place of the content that's missing. Without a variant it has no frame of its own, so it sits in the card's.

```html
<div class="card w-full max-w-md">
  <div class="card-header">
    <h3 class="card-title">Payment methods</h3>
    <p class="card-description">Cards and accounts you pay with.</p>
  </div>
  <div class="card-content">
    <div class="empty empty-outline empty-sm">
      <div class="empty-header">
        <div class="empty-media empty-media-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/></svg></div>
        <p class="empty-title">No payment methods</p>
        <p class="empty-description">Add a card to pay for your subscription.</p>
      </div>
      <div class="empty-content">
        <button type="button" class="btn btn-primary btn-sm"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M5 12h14M12 5v14"/></svg> Add a card</button>
      </div>
    </div>
  </div>
</div>
```

## In a table

For a table with no rows, keep the header (so the columns still explain the data) and put a compact empty state in a single cell spanning every column.

```html
<div class="table-wrap">
  <table class="table">
    <thead><tr><th>Invoice</th><th>Status</th><th class="text-right">Amount</th></tr></thead>
    <tbody>
      <tr>
        <td colspan="3">
          <div class="empty empty-sm">
            <div class="empty-header">
              <div class="empty-media empty-media-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></div>
              <p class="empty-title">No invoices found</p>
              <p class="empty-description">No invoices match &ldquo;acme&rdquo;. Try another search, or clear the filters.</p>
            </div>
            <div class="empty-content">
              <button type="button" class="btn btn-outline btn-sm">Clear filters</button>
            </div>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

## With htmx

The empty state is ordinary markup, so a request can replace it with content. Here the button loads rows from the server into the table body with `hx-swap="innerHTML"`, which replaces the empty row with them:

```html
<div class="table-wrap">
  <table class="table">
    <thead><tr><th>Invoice</th><th>Status</th><th class="text-right">Amount</th></tr></thead>
    <tbody id="empty-invoices">
      <tr>
        <td colspan="3">
          <div class="empty empty-sm">
            <div class="empty-header">
              <div class="empty-media empty-media-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4M10 9H8M16 13H8M16 17H8"/></svg></div>
              <p class="empty-title">No invoices yet</p>
              <p class="empty-description">Invoices you send show up here.</p>
            </div>
            <div class="empty-content">
              <button type="button" class="btn btn-primary btn-sm" hx-get="/api/invoices" hx-target="#empty-invoices" hx-swap="innerHTML">Load invoices</button>
            </div>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

The other way round, have the server return an empty state when a search or a filter finds nothing, and the same swap shows it. An error can return one with a retry button that repeats the request and replaces the whole empty state:

```html
<div class="empty empty-outline" id="feed">
  <div class="empty-header">
    <div class="empty-media empty-media-icon">…icon…</div>
    <h3 class="empty-title">Couldn't load the feed</h3>
    <p class="empty-description">Check your connection and try again.</p>
  </div>
  <div class="empty-content">
    <button class="btn btn-outline btn-sm" hx-get="/feed" hx-target="#feed" hx-swap="outerHTML">Retry</button>
  </div>
</div>
```

## Macro

The `empty()` macro writes the header for you. Pass the title, and optionally a `description`, an `icon` name, a `variant` (`"outline"` or `"muted"`), a `size` (`"sm"`), the title element as `heading` (`"h3"` by default; use the level that fits the page, or `"p"`) and extra `class`es. Call it with a body to fill `.empty-content`.

```html
{% from "components/empty/empty.html" import empty %}

{% call empty("No messages", "New messages show up here.", icon="inbox", variant="outline") %}
  <button class="btn btn-primary btn-sm">Compose</button>
{% endcall %}
```

```html
<div class="empty empty-outline">
  <div class="empty-header">
<div class="empty-media empty-media-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg></div>    <h3 class="empty-title">No messages</h3>
<p class="empty-description">New messages show up here.</p>  </div>
<div class="empty-content">      <button type="button" class="btn btn-primary btn-sm"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg> Compose</button>
</div></div>
```

## Accessibility

- Make the title a heading at the level that fits where the empty state sits (it stands in for a section's content), or a `<p>` in small panels and table cells.
- Media is decorative: the icon is hidden from screen readers, and avatars take `aria-hidden="true"`. Say everything that matters in the title and description.
- Write button labels that make sense on their own: “Create project”, not “Get started”.
- When an empty state replaces results that were there a moment ago (after a search), announce it: swap it into a container with `aria-live="polite"`.

## Reference

| Class | Description |
| --- | --- |
| `.empty` | Centred column with padding (more from md) that grows to fill its container. |
| `.empty-outline` | Dashed border. |
| `.empty-muted` | Muted background that fades out towards the bottom. |
| `.empty-sm` | Compact: less padding, smaller gaps, icon square and title. |
| `.empty-header` | Media, title and description; at most 24rem wide. |
| `.empty-media` | Holds an icon, an .avatar (shown at 3rem) or an .avatar-group (large, grey). |
| `.empty-media-icon` | A muted rounded square around an icon. |
| `.empty-title` | What is missing. |
| `.empty-description` | Muted text below the title. Links are underlined. |
| `.empty-content` | Actions and inputs: a centred column, at most 24rem wide. |
