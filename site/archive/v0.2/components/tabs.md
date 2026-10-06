---
title: "Tabs"
description: "Layered panels of content shown one at a time: segmented, underlined, pill and outline styles, icons, disabled tabs, vertical lists, and groups that sync and remember the choice."
url: "/docs/v0.2/components/tabs"
section: "Components"
---

# Tabs

Layered panels of content shown one at a time: segmented, underlined, pill and outline styles, icons, disabled tabs, vertical lists, and groups that sync and remember the choice.

```html
<div class="tabs mx-auto max-w-md" data-tabs>
  <div class="tabs-list" role="tablist" aria-label="Account">
    <button type="button" class="tabs-trigger" role="tab" data-tab="account" aria-selected="true">Account</button>
    <button type="button" class="tabs-trigger" role="tab" data-tab="password" aria-selected="false">Password</button>
  </div>
  <div class="tabs-panel" role="tabpanel" data-tab-panel="account">
    <p class="muted">Change your name and email address.</p>
  </div>
  <div class="tabs-panel" role="tabpanel" data-tab-panel="password" hidden>
    <p class="muted">Change your password. You'll be signed out on other devices.</p>
  </div>
</div>
```

## Markup

- Each `[data-tab]` button shows the `[data-tab-panel]` with the same value and hides the others.
- Mark the initial tab with `aria-selected="true"` and add `hidden` to the other panels, so the page is right before JavaScript runs.
- The behaviour fills in `id`, `aria-controls` and `aria-labelledby`, and moves focus with `←` `→` `Home` `End`.
- `.tabs` on the wrapper spaces the list and the panels and lays them out side by side when [vertical](#vertical).

## Underlined

```html
<div class="tabs mx-auto max-w-md" data-tabs>
  <div class="tabs-list tabs-line" role="tablist">
    <button type="button" class="tabs-trigger" role="tab" data-tab="overview" aria-selected="true">Overview</button>
    <button type="button" class="tabs-trigger" role="tab" data-tab="activity" aria-selected="false">Activity</button>
    <button type="button" class="tabs-trigger" role="tab" data-tab="settings" aria-selected="false">Settings</button>
  </div>
  <div class="tabs-panel" role="tabpanel" data-tab-panel="overview"><p class="muted">Overview panel</p></div>
  <div class="tabs-panel" role="tabpanel" data-tab-panel="activity" hidden><p class="muted">Activity panel</p></div>
  <div class="tabs-panel" role="tabpanel" data-tab-panel="settings" hidden><p class="muted">Settings panel</p></div>
</div>
```

## Pills and outline

`.tabs-pills` fills the selected tab with the primary colour; `.tabs-outline` sets it in a bordered chip on a plain background.

```html
<div class="tabs" data-tabs>
  <div class="tabs-list tabs-pills" role="tablist" aria-label="Period">
    <button type="button" class="tabs-trigger" role="tab" data-tab="day" aria-selected="true">Day</button>
    <button type="button" class="tabs-trigger" role="tab" data-tab="week" aria-selected="false">Week</button>
    <button type="button" class="tabs-trigger" role="tab" data-tab="month" aria-selected="false">Month</button>
  </div>
  <div class="tabs-panel" role="tabpanel" data-tab-panel="day"><p class="muted">Today's numbers.</p></div>
  <div class="tabs-panel" role="tabpanel" data-tab-panel="week" hidden><p class="muted">This week's numbers.</p></div>
  <div class="tabs-panel" role="tabpanel" data-tab-panel="month" hidden><p class="muted">This month's numbers.</p></div>
</div>
<div class="tabs" data-tabs>
  <div class="tabs-list tabs-outline" role="tablist" aria-label="Period">
    <button type="button" class="tabs-trigger" role="tab" data-tab="day" aria-selected="true">Day</button>
    <button type="button" class="tabs-trigger" role="tab" data-tab="week" aria-selected="false">Week</button>
    <button type="button" class="tabs-trigger" role="tab" data-tab="month" aria-selected="false">Month</button>
  </div>
  <div class="tabs-panel" role="tabpanel" data-tab-panel="day"><p class="muted">Today's numbers.</p></div>
  <div class="tabs-panel" role="tabpanel" data-tab-panel="week" hidden><p class="muted">This week's numbers.</p></div>
  <div class="tabs-panel" role="tabpanel" data-tab-panel="month" hidden><p class="muted">This month's numbers.</p></div>
</div>
```

## Full width

`.tabs-full` stretches the list across its container and shares the row between the triggers.

```html
<div class="tabs mx-auto max-w-md" data-tabs>
  <div class="tabs-list tabs-full" role="tablist" aria-label="Sign in">
    <button type="button" class="tabs-trigger" role="tab" data-tab="email" aria-selected="true">Email</button>
    <button type="button" class="tabs-trigger" role="tab" data-tab="phone" aria-selected="false">Phone</button>
  </div>
  <div class="tabs-panel" role="tabpanel" data-tab-panel="email"><input class="input" type="email" placeholder="you@example.com" aria-label="Email" /></div>
  <div class="tabs-panel" role="tabpanel" data-tab-panel="phone" hidden><input class="input" type="tel" placeholder="+61 400 000 000" aria-label="Phone" /></div>
</div>
```

## Icons

Put an `icon()` before (or instead of) the label. An icon-only tab needs an `aria-label`.

```html
<div class="tabs" data-tabs>
  <div class="tabs-list" role="tablist" aria-label="View">
    <button type="button" class="tabs-trigger" role="tab" data-tab="preview" aria-selected="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg> Preview</button>
    <button type="button" class="tabs-trigger" role="tab" data-tab="code" aria-selected="false"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/></svg> Code</button>
  </div>
  <div class="tabs-panel" role="tabpanel" data-tab-panel="preview"><p class="muted">The rendered result.</p></div>
  <div class="tabs-panel" role="tabpanel" data-tab-panel="code" hidden><p class="muted">The source.</p></div>
</div>
<div class="tabs" data-tabs>
  <div class="tabs-list" role="tablist" aria-label="Alignment">
    <button type="button" class="tabs-trigger px-2" role="tab" data-tab="left" aria-selected="true" aria-label="Left"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M15 12H3M17 18H3M21 6H3"/></svg></button>
    <button type="button" class="tabs-trigger px-2" role="tab" data-tab="center" aria-selected="false" aria-label="Centre"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M17 12H7M19 18H5M21 6H3"/></svg></button>
    <button type="button" class="tabs-trigger px-2" role="tab" data-tab="right" aria-selected="false" aria-label="Right"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M21 12H9M21 18H7M21 6H3"/></svg></button>
  </div>
  <div class="tabs-panel" role="tabpanel" data-tab-panel="left"><p class="muted">Aligned left.</p></div>
  <div class="tabs-panel" role="tabpanel" data-tab-panel="center" hidden><p class="muted">Centred.</p></div>
  <div class="tabs-panel" role="tabpanel" data-tab-panel="right" hidden><p class="muted">Aligned right.</p></div>
</div>
```

## Disabled

A `disabled` trigger fades, can't be picked, and the arrow keys skip it.

```html
<div class="tabs mx-auto max-w-md" data-tabs>
  <div class="tabs-list" role="tablist" aria-label="Plan">
    <button type="button" class="tabs-trigger" role="tab" data-tab="free" aria-selected="true">Free</button>
    <button type="button" class="tabs-trigger" role="tab" data-tab="team" aria-selected="false" disabled>Team</button>
    <button type="button" class="tabs-trigger" role="tab" data-tab="enterprise" aria-selected="false">Enterprise</button>
  </div>
  <div class="tabs-panel" role="tabpanel" data-tab-panel="free"><p class="muted">Free plan.</p></div>
  <div class="tabs-panel" role="tabpanel" data-tab-panel="team" hidden><p class="muted">Team plan.</p></div>
  <div class="tabs-panel" role="tabpanel" data-tab-panel="enterprise" hidden><p class="muted">Enterprise plan.</p></div>
</div>
```

## Vertical

`data-orientation="vertical"` on the `.tabs` wrapper puts the list beside the panels, its triggers stacked. The behaviour sets `aria-orientation` on the tablist and moves with `↑` `↓`. Every variant works; `.tabs-line` draws its line on the side.

```html
<div class="tabs" data-tabs data-orientation="vertical">
  <div class="tabs-list" role="tablist" aria-label="Settings">
    <button type="button" class="tabs-trigger" role="tab" data-tab="general" aria-selected="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg> General</button>
    <button type="button" class="tabs-trigger" role="tab" data-tab="team" aria-selected="false"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> Team</button>
    <button type="button" class="tabs-trigger" role="tab" data-tab="billing" aria-selected="false"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/></svg> Billing</button>
  </div>
  <div class="tabs-panel" role="tabpanel" data-tab-panel="general"><p class="muted">Name, language and time zone.</p></div>
  <div class="tabs-panel" role="tabpanel" data-tab-panel="team" hidden><p class="muted">Invite people and set their roles.</p></div>
  <div class="tabs-panel" role="tabpanel" data-tab-panel="billing" hidden><p class="muted">Plan, invoices and payment method.</p></div>
</div>
<div class="tabs" data-tabs data-orientation="vertical">
  <div class="tabs-list tabs-line" role="tablist" aria-label="Settings">
    <button type="button" class="tabs-trigger" role="tab" data-tab="general" aria-selected="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg> General</button>
    <button type="button" class="tabs-trigger" role="tab" data-tab="team" aria-selected="false"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> Team</button>
    <button type="button" class="tabs-trigger" role="tab" data-tab="billing" aria-selected="false"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/></svg> Billing</button>
  </div>
  <div class="tabs-panel" role="tabpanel" data-tab-panel="general"><p class="muted">Name, language and time zone.</p></div>
  <div class="tabs-panel" role="tabpanel" data-tab-panel="team" hidden><p class="muted">Invite people and set their roles.</p></div>
  <div class="tabs-panel" role="tabpanel" data-tab-panel="billing" hidden><p class="muted">Plan, invoices and payment method.</p></div>
</div>
```

## Synced and remembered

Give groups the same `data-tabs-sync` key and they switch together. The choice is saved to `localStorage` (key `tabs:<key>`), restored on the next visit, and followed in other open browser tabs. The package-manager tabs on code blocks use `data-tabs-sync="pm"`. Switch one of these two:

```html
<div class="tabs" data-tabs data-tabs-sync="demo-lang">
  <div class="tabs-list" role="tablist" aria-label="Language 1">
    <button type="button" class="tabs-trigger" role="tab" data-tab="html" aria-selected="true">HTML</button>
    <button type="button" class="tabs-trigger" role="tab" data-tab="css" aria-selected="false">CSS</button>
  </div>
  <div class="tabs-panel" role="tabpanel" data-tab-panel="html"><p class="muted">Group 1: HTML panel</p></div>
  <div class="tabs-panel" role="tabpanel" data-tab-panel="css" hidden><p class="muted">Group 1: CSS panel</p></div>
</div>
<div class="tabs" data-tabs data-tabs-sync="demo-lang">
  <div class="tabs-list" role="tablist" aria-label="Language 2">
    <button type="button" class="tabs-trigger" role="tab" data-tab="html" aria-selected="true">HTML</button>
    <button type="button" class="tabs-trigger" role="tab" data-tab="css" aria-selected="false">CSS</button>
  </div>
  <div class="tabs-panel" role="tabpanel" data-tab-panel="html"><p class="muted">Group 2: HTML panel</p></div>
  <div class="tabs-panel" role="tabpanel" data-tab-panel="css" hidden><p class="muted">Group 2: CSS panel</p></div>
</div>
```

## Lazy panels with htmx

Load a panel's content the first time it's shown with `hx-trigger="intersect once"`:

```html
<div class="tabs mx-auto max-w-md" data-tabs>
  <div class="tabs-list" role="tablist">
    <button type="button" class="tabs-trigger" role="tab" data-tab="local" aria-selected="true">Local</button>
    <button type="button" class="tabs-trigger" role="tab" data-tab="server" aria-selected="false">From server</button>
  </div>
  <div class="tabs-panel" role="tabpanel" data-tab-panel="local"><p class="muted">Rendered with the page.</p></div>
  <div class="tabs-panel" role="tabpanel" data-tab-panel="server" hidden>
    <div hx-get="/api/hello" hx-trigger="intersect once"><p class="muted">Loading…</p></div>
  </div>
</div>
```

## Reference

| Class | Description |
| --- | --- |
| `.tabs` | Wrapper: spaces the list and panels; side by side when vertical. |
| `.tabs-list` | Segmented control holding the tab buttons. |
| `.tabs-trigger` | Tab button; selected style comes from aria-selected="true", faded when disabled. |
| `.tabs-panel` | Panel focus ring. |
| `.tabs-line / .tabs-pills / .tabs-outline` | Underlined, primary-filled and bordered variants of .tabs-list. |
| `.tabs-full` | List and triggers stretched to the full width. |
| `[data-tabs]` | Behaviour: wires up a tab group. |
| `[data-orientation="vertical"]` | On .tabs: list beside the panels, Up/Down keys. |
| `[data-tab] / [data-tab-panel]` | Matching values pair a tab with its panel. |
| `[data-tabs-sync="key"]` | Sync groups with the same key and remember the choice. |
