---
title: "Breadcrumb"
description: "Displays the path to the current resource using a hierarchy of links."
url: "/docs/v0.2/components/breadcrumb"
section: "Components"
---

# Breadcrumb

Displays the path to the current resource using a hierarchy of links.

```html
<nav aria-label="Breadcrumb">
  <ol class="breadcrumb">
    <li class="breadcrumb-item"><a class="breadcrumb-link" href="#home">Home</a></li>
    <li class="breadcrumb-separator" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></li>
    <li class="breadcrumb-item"><a class="breadcrumb-link" href="#docs">Docs</a></li>
    <li class="breadcrumb-separator" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></li>
    <li class="breadcrumb-item"><a class="breadcrumb-link" href="#components">Components</a></li>
    <li class="breadcrumb-separator" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></li>
    <li class="breadcrumb-item"><span class="breadcrumb-page" aria-current="page">Breadcrumb</span></li>
  </ol>
</nav>
```

## Markup

- A `<nav aria-label="Breadcrumb">` around an `<ol class="breadcrumb">`.
- Each step is an `<li class="breadcrumb-item">` holding an `<a class="breadcrumb-link">`.
- The last one is the current page: `<span class="breadcrumb-page" aria-current="page">`, not a link.
- Between steps, an `<li class="breadcrumb-separator" aria-hidden="true">`. Screen readers skip it; the list already says how many steps there are.

A long breadcrumb wraps onto more lines. To keep it on one, let it [collapse](#collapsing).

## Custom separator

The separator is whatever you put in it: any icon, or text.

```html
<nav aria-label="Breadcrumb">
  <ol class="breadcrumb">
    <li class="breadcrumb-item"><a class="breadcrumb-link" href="#home">Home</a></li>
    <li class="breadcrumb-separator" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M16 3 8 21"/></svg></li>
    <li class="breadcrumb-item"><a class="breadcrumb-link" href="#components">Components</a></li>
    <li class="breadcrumb-separator" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M16 3 8 21"/></svg></li>
    <li class="breadcrumb-item"><span class="breadcrumb-page" aria-current="page">Breadcrumb</span></li>
  </ol>
</nav>
<nav aria-label="Breadcrumb">
  <ol class="breadcrumb">
    <li class="breadcrumb-item"><a class="breadcrumb-link" href="#home">Home</a></li>
    <li class="breadcrumb-separator" aria-hidden="true">·</li>
    <li class="breadcrumb-item"><a class="breadcrumb-link" href="#components">Components</a></li>
    <li class="breadcrumb-separator" aria-hidden="true">·</li>
    <li class="breadcrumb-item"><span class="breadcrumb-page" aria-current="page">Breadcrumb</span></li>
  </ol>
</nav>
<nav aria-label="Breadcrumb">
  <ol class="breadcrumb">
    <li class="breadcrumb-item"><a class="breadcrumb-link" href="#home"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg> Home</a></li>
    <li class="breadcrumb-separator" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg></li>
    <li class="breadcrumb-item"><a class="breadcrumb-link" href="#components"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/></svg> Components</a></li>
    <li class="breadcrumb-separator" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg></li>
    <li class="breadcrumb-item"><span class="breadcrumb-page" aria-current="page"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4M10 9H8M16 13H8M16 17H8"/></svg> Breadcrumb</span></li>
  </ol>
</nav>
```

## Dropdown

A step can be a [dropdown](/docs/v0.2/components/dropdown) instead of a link, for jumping to a sibling page. Make the trigger a `<button class="breadcrumb-link">`; it stays highlighted while the menu is open.

```html
<nav aria-label="Breadcrumb">
  <ol class="breadcrumb">
    <li class="breadcrumb-item"><a class="breadcrumb-link" href="#home">Home</a></li>
    <li class="breadcrumb-separator" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></li>
    <li class="breadcrumb-item">
      <div class="dropdown" data-dropdown>
        <button type="button" class="breadcrumb-link" data-dropdown-trigger aria-haspopup="menu" aria-expanded="false">
          Components <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
        </button>
        <div class="dropdown-menu" role="menu" hidden>
          <a class="dropdown-item" role="menuitem" href="#docs">Documentation</a>
          <a class="dropdown-item" role="menuitem" href="#themes">Themes</a>
          <a class="dropdown-item" role="menuitem" href="#github">GitHub</a>
        </div>
      </div>
    </li>
    <li class="breadcrumb-separator" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></li>
    <li class="breadcrumb-item"><span class="breadcrumb-page" aria-current="page">Breadcrumb</span></li>
  </ol>
</nav>
```

## Collapsed

`.breadcrumb-ellipsis` stands in for steps left out of a long path. Make it the trigger of a dropdown that lists them, and give it an `aria-label`.

```html
<nav aria-label="Breadcrumb">
  <ol class="breadcrumb">
    <li class="breadcrumb-item"><a class="breadcrumb-link" href="#home">Home</a></li>
    <li class="breadcrumb-separator" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></li>
    <li class="breadcrumb-item">
      <div class="dropdown" data-dropdown>
        <button type="button" class="breadcrumb-ellipsis" data-dropdown-trigger aria-haspopup="menu" aria-expanded="false" aria-label="Show hidden pages"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></button>
        <div class="dropdown-menu" role="menu" hidden>
          <a class="dropdown-item" role="menuitem" href="#docs">Docs</a>
          <a class="dropdown-item" role="menuitem" href="#components">Components</a>
          <a class="dropdown-item" role="menuitem" href="#forms">Forms</a>
        </div>
      </div>
    </li>
    <li class="breadcrumb-separator" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></li>
    <li class="breadcrumb-item"><a class="breadcrumb-link" href="#inputs">Inputs</a></li>
    <li class="breadcrumb-separator" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></li>
    <li class="breadcrumb-item"><span class="breadcrumb-page" aria-current="page">Input group</span></li>
  </ol>
</nav>
```

## Collapsing when it doesn't fit

With `data-breadcrumb` on the `<nav>`, the breadcrumb stays on one line and collapses by itself. Add a hidden ellipsis item, and a hidden separator, after the first step. Whenever the breadcrumb changes width, steps in the middle are hidden from the left until it fits, the ellipsis appears, and its menu lists the hidden steps as links. The first step and the current page always stay; the page name truncates as a last resort. Drag the corner of the box to resize it:

```html
<div class="h-56 w-full max-w-full min-w-40 resize-x overflow-hidden rounded-(--radius) border border-dashed border-border p-3">
  <nav aria-label="Breadcrumb" data-breadcrumb>
    <ol class="breadcrumb">
      <li class="breadcrumb-item"><a class="breadcrumb-link" href="#home">Home</a></li>
      <li class="breadcrumb-separator" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></li>
      <li class="breadcrumb-item" data-breadcrumb-ellipsis hidden>
        <div class="dropdown" data-dropdown>
          <button type="button" class="breadcrumb-ellipsis" data-dropdown-trigger aria-haspopup="menu" aria-expanded="false" aria-label="Show hidden pages"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></button>
          <div class="dropdown-menu" role="menu" hidden></div>
        </div>
      </li>
      <li class="breadcrumb-separator" aria-hidden="true" hidden><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></li>
      <li class="breadcrumb-item"><a class="breadcrumb-link" href="#docs">Documentation</a></li>
      <li class="breadcrumb-separator" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></li>
      <li class="breadcrumb-item"><a class="breadcrumb-link" href="#components">Components</a></li>
      <li class="breadcrumb-separator" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></li>
      <li class="breadcrumb-item"><a class="breadcrumb-link" href="#forms">Forms and inputs</a></li>
      <li class="breadcrumb-separator" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></li>
      <li class="breadcrumb-item"><span class="breadcrumb-page" aria-current="page">Input group with addons</span></li>
    </ol>
  </nav>
</div>
```

It works the same in a fragment returned by htmx. To collapse a fixed number of steps instead, whatever the width, write the ellipsis yourself as in [Collapsed](#collapsed), and leave out `data-breadcrumb`.

## Reference

| Class | Description |
| --- | --- |
| `.breadcrumb` | The <ol>: a wrapping row of steps. |
| `.breadcrumb-item` | One step (<li>). |
| `.breadcrumb-link` | A link, or a button opening a dropdown; highlighted while expanded. |
| `.breadcrumb-page` | The current page, with aria-current="page". |
| `.breadcrumb-separator` | Between steps, aria-hidden. Any icon or text. |
| `.breadcrumb-ellipsis` | "…" button standing in for hidden steps. |
| `[data-breadcrumb]` | On the <nav>: one line, collapsing middle steps into [data-breadcrumb-ellipsis] when it doesn't fit. |
| `[data-breadcrumb-ellipsis]` | The hidden ellipsis item; its [role=menu] is filled with the hidden steps. |
