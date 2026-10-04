---
title: "Sidebar"
description: "A navigation column that sticks beside the content on large screens and slides in over it on small ones. The navigation on this page is one."
url: "/docs/v0.1/components/sidebar"
section: "Components"
---

# Sidebar

A navigation column that sticks beside the content on large screens and slides in over it on small ones. The navigation on this page is one.

## Preview

The links and labels, shown in a fixed-size frame:

```html
<div class="flex h-72 text-left">
  <nav class="w-56 shrink-0 overflow-y-auto border-r border-border p-4">
    <div class="sidebar-group">
      <p class="sidebar-label">Workspace</p>
      <a href="#preview" class="sidebar-link" aria-current="page">Dashboard</a>
      <a href="#preview" class="sidebar-link">Projects <span class="badge badge-secondary">4</span></a>
      <a href="#preview" class="sidebar-link">Deployments</a>
    </div>
    <div class="sidebar-group">
      <p class="sidebar-label">Account</p>
      <a href="#preview" class="sidebar-link">Settings</a>
      <a href="#preview" class="sidebar-link">Billing</a>
    </div>
  </nav>
  <div class="flex-1 p-6"><p class="muted">Page content</p></div>
</div>
```

## Responsive layout

Put `.sidebar` on an `<aside>` next to your content. From the `lg` breakpoint up it's a sticky column under a 56px header. Below that it hides off-screen until a toggle opens it. Resize this window to try it with the docs navigation.

```html layout.html
<header class="sticky top-0 h-14 border-b">
  <button class="btn btn-ghost btn-icon lg:hidden"
          data-sidebar-toggle aria-controls="nav" aria-expanded="false" aria-label="Open navigation">
    <!-- menu icon     <!-- menu icon -->
  </button>
</header>

<div class="mx-auto flex max-w-7xl gap-12 px-4">
  <aside id="nav" class="sidebar" data-sidebar>
    <nav class="sidebar-group">
      <p class="sidebar-label">Getting started</p>
      <a href="/docs" class="sidebar-link" aria-current="page">Introduction</a>
      <a href="/docs/installation" class="sidebar-link">Installation</a>
    </nav>
  </aside>
  <div class="sidebar-backdrop" data-sidebar-close></div>

  <main class="min-w-0 flex-1">…</main>
</div>
```

## Behaviour

- A `[data-sidebar-toggle]` opens or closes the sidebar named by its `aria-controls`, and keeps `aria-expanded` in sync.
- The open sidebar has a `data-open` attribute, which slides it in and shows the backdrop.
- It closes on `Esc`, a click on `[data-sidebar-close]`, or a click on any link inside it.

## Marking the current page

Set `aria-current="page"` on the active link. It's both the style hook and what screen readers announce.

```jinja Nunjucks
<a href="{{ item.href }}" class="sidebar-link"
{% if item.href == url %}aria-current="page"{% endif %}>{{ item.title }}</a>
```

## Reference

| Class | Description |
| --- | --- |
| `.sidebar` | Off-canvas panel below lg; sticky 240px column at lg and up. |
| `.sidebar-backdrop` | Dimmed overlay shown while the sidebar is open on small screens. |
| `.sidebar-group` | A block of links; adds space between groups. |
| `.sidebar-label` | Small uppercase group heading. |
| `.sidebar-link` | Navigation link. Styled as active with aria-current="page". |
| `[data-sidebar-toggle]` | Behaviour: opens/closes the sidebar named in aria-controls. |
| `[data-sidebar-close]` | Behaviour: closes the sidebar (use on the backdrop). |
