---
title: "Button group"
description: "A container that joins related buttons, inputs and menus into one unit with shared borders."
url: "/docs/v0.1/components/button-group"
section: "Components"
---

# Button group

A container that joins related buttons, inputs and menus into one unit with shared borders.

```html
<div class="btn-group" role="group" aria-label="Message actions">
  <button class="btn btn-outline">Archive</button>
  <button class="btn btn-outline">Report</button>
  <button class="btn btn-outline">Snooze</button>
</div>
```

Use a button group for buttons that **perform actions**. For buttons that switch a state on and off (bold, italic, text alignment), use a [toggle group](/docs/v0.1/components/toggle-group).

## Accessibility

Give the container `role="group"` and an `aria-label` so assistive technology announces the buttons as a set. For a group of groups, use `role="toolbar"` on the outer one.

## Orientation

Add `.btn-group-vertical` to stack the buttons.

```html
<div class="btn-group btn-group-vertical" role="group" aria-label="Zoom">
  <button class="btn btn-outline btn-icon" aria-label="Zoom in"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M5 12h14M12 5v14"/></svg></button>
  <button class="btn btn-outline btn-icon" aria-label="Zoom out"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M5 12h14"/></svg></button>
</div>
<div class="btn-group btn-group-vertical" role="group" aria-label="Views">
  <button class="btn btn-outline">Day</button>
  <button class="btn btn-outline">Week</button>
  <button class="btn btn-outline">Month</button>
</div>
```

## Size

`.btn-group-sm` and `.btn-group-lg` resize every button, input and text in the group, so you don't size them one by one.

```html
<div class="btn-group btn-group-sm" role="group" aria-label="Small">
  <button class="btn btn-outline">Small</button>
  <button class="btn btn-outline">Group</button>
  <button class="btn btn-outline btn-icon" aria-label="Add"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M5 12h14M12 5v14"/></svg></button>
</div>
<div class="btn-group" role="group" aria-label="Default">
  <button class="btn btn-outline">Default</button>
  <button class="btn btn-outline">Group</button>
  <button class="btn btn-outline btn-icon" aria-label="Add"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M5 12h14M12 5v14"/></svg></button>
</div>
<div class="btn-group btn-group-lg" role="group" aria-label="Large">
  <button class="btn btn-outline">Large</button>
  <button class="btn btn-outline">Group</button>
  <button class="btn btn-outline btn-icon" aria-label="Add"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M5 12h14M12 5v14"/></svg></button>
</div>
```

## Icons

```html
<div class="btn-group" role="group" aria-label="Post">
  <button class="btn btn-outline"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></svg> Star</button>
  <button class="btn btn-outline"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg> Save</button>
  <button class="btn btn-outline btn-icon" aria-label="Copy link"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></button>
</div>
```

## Separator

Buttons without a border of their own (secondary, primary) run into each other. Put a `.btn-group-separator` between them.

```html
<div class="btn-group" role="group" aria-label="Clipboard">
  <button class="btn btn-secondary">Copy</button>
  <div class="btn-group-separator" role="separator"></div>
  <button class="btn btn-secondary">Paste</button>
</div>
<div class="btn-group btn-group-vertical" role="group" aria-label="Order">
  <button class="btn btn-secondary btn-icon" aria-label="Move up"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m18 15-6-6-6 6"/></svg></button>
  <div class="btn-group-separator" role="separator"></div>
  <button class="btn btn-secondary btn-icon" aria-label="Move down"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>
</div>
```

## Nested

Groups inside a group are spaced apart instead of joined: a toolbar.

```html
<div class="btn-group" role="toolbar" aria-label="Pagination">
  <div class="btn-group" role="group" aria-label="Pages">
    <button class="btn btn-outline btn-sm">1</button>
    <button class="btn btn-outline btn-sm">2</button>
    <button class="btn btn-outline btn-sm">3</button>
  </div>
  <div class="btn-group" role="group" aria-label="Step">
    <button class="btn btn-outline btn-sm btn-icon" aria-label="Previous"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7"/></svg></button>
    <button class="btn btn-outline btn-sm btn-icon" aria-label="Next"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button>
  </div>
</div>
```

## With an input

Inputs and selects join the group and fill the space left by the buttons.

```html
<div class="btn-group w-full max-w-sm" role="group" aria-label="Search">
  <input class="input" type="search" placeholder="Search…" aria-label="Search" />
  <button class="btn btn-outline btn-icon" aria-label="Search"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></button>
</div>
<div class="btn-group w-full max-w-sm" role="group" aria-label="Website">
  <span class="btn-group-text">https://</span>
  <input class="input" placeholder="example.com" aria-label="Website" />
  <select class="select w-auto flex-none" aria-label="Domain">
    <option>.com</option>
    <option>.org</option>
  </select>
</div>
```

### With an input group

An [input group](/docs/v0.1/components/input-group) can sit in a button group too, with addons of its own.

```html
<div class="btn-group w-full max-w-md" role="group" aria-label="Message">
  <button class="btn btn-outline btn-icon" aria-label="Attach"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M5 12h14M12 5v14"/></svg></button>
  <div class="input-group">
    <input class="input" placeholder="Send a message…" aria-label="Message" />
    <span class="input-group-addon input-group-addon-inline-end"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spinner" role="status" aria-label="Loading"><path d="M21 12a9 9 0 1 1-6.22-8.56"/></svg></span>
  </div>
  <button class="btn btn-primary btn-icon" aria-label="Send"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/></svg></button>
</div>
```

## Split button

A main action plus a [dropdown](/docs/v0.1/components/dropdown) of related ones. The `.dropdown` wrapper joins the group like a button.

```html
<div class="btn-group" role="group" aria-label="Merge">
  <button class="btn btn-primary">Merge pull request</button>
  <div class="btn-group-separator" role="separator"></div>
  <div class="dropdown" data-dropdown>
    <button class="btn btn-primary btn-icon" data-dropdown-trigger aria-haspopup="menu" aria-expanded="false" aria-label="More merge options"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>
    <div class="dropdown-menu dropdown-menu-end" role="menu" hidden>
      <button class="dropdown-item" role="menuitem">Squash and merge</button>
      <button class="dropdown-item" role="menuitem">Rebase and merge</button>
    </div>
  </div>
</div>
<div class="btn-group" role="group" aria-label="Follow">
  <button class="btn btn-outline">Follow</button>
  <div class="dropdown" data-dropdown>
    <button class="btn btn-outline btn-icon" data-dropdown-trigger aria-haspopup="menu" aria-expanded="false" aria-label="More"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></button>
    <div class="dropdown-menu dropdown-menu-end" role="menu" hidden>
      <button class="dropdown-item" role="menuitem">Mute conversation</button>
      <button class="dropdown-item" role="menuitem">Copy link</button>
      <div class="dropdown-separator" role="separator"></div>
      <button class="dropdown-item text-danger" role="menuitem">Report</button>
    </div>
  </div>
</div>
```

## Popover

A [popover](/docs/v0.1/components/popover) trigger works the same way, for content that isn't a menu.

```html
<div class="btn-group" role="group" aria-label="Copilot">
  <button class="btn btn-outline"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2M20 14h2M15 13v2M9 13v2"/></svg> Copilot</button>
  <div class="popover" data-popover>
    <button class="btn btn-outline btn-icon" data-popover-trigger aria-expanded="false" aria-label="Open popover"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>
    <div class="popover-content popover-content-end" data-popover-content hidden>
      <p class="popover-title">Start a new task</p>
      <p class="popover-description">Describe what you want done.</p>
      <textarea class="textarea mt-3" placeholder="Fix the flaky test in…" aria-label="Task" autofocus></textarea>
    </div>
  </div>
</div>
```

## Reference

| Class | Description |
| --- | --- |
| `.btn-group` | Joins its children: inner corners squared, shared borders overlapped. Groups inside it are spaced instead. |
| `.btn-group-vertical` | Stacks the children. |
| `.btn-group-sm / -lg` | Resizes every button, input and text in the group. |
| `.btn-group-text` | Static label styled to sit in a group, like https://. |
| `.btn-group-separator` | 1px divider between buttons that have no border. |
