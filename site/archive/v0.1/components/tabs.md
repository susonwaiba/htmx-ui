---
title: "Tabs"
description: "Switch between panels of related content. Groups can sync with each other and remember the reader's choice."
url: "/docs/v0.1/components/tabs"
section: "Components"
---

# Tabs

Switch between panels of related content. Groups can sync with each other and remember the reader's choice.

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
| `.tabs-list` | Segmented control holding the tab buttons. |
| `.tabs-trigger` | Tab button; selected style comes from aria-selected="true". |
| `.tabs-panel` | Panel spacing and focus ring. |
| `.tabs-line` | Underlined variant of .tabs-list. |
| `[data-tabs]` | Behaviour: wires up a tab group. |
| `[data-tab] / [data-tab-panel]` | Matching values pair a tab with its panel. |
| `[data-tabs-sync="key"]` | Sync groups with the same key and remember the choice. |
