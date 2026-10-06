---
title: "Pagination"
description: "Pagination with page navigation, next and previous links."
url: "/docs/v0.2/components/pagination"
section: "Components"
---

# Pagination

Pagination with page navigation, next and previous links.

```html
<nav class="pagination" aria-label="Pagination">
  <ul class="pagination-content">
    <li><a class="pagination-link pagination-previous" href="#" rel="prev"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg><span class="pagination-label">Previous</span></a></li>
    <li><a class="pagination-link" href="#" aria-label="Page 1">1</a></li>
    <li><a class="pagination-link" href="#" aria-label="Page 2" aria-current="page">2</a></li>
    <li><a class="pagination-link" href="#" aria-label="Page 3">3</a></li>
    <li><span class="pagination-ellipsis" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></span></li>
    <li><a class="pagination-link" href="#" aria-label="Page 10">10</a></li>
    <li><a class="pagination-link pagination-next" href="#" rel="next"><span class="pagination-label">Next</span><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></a></li>
  </ul>
</nav>
```

## Markup

- A `<nav class="pagination" aria-label="Pagination">` around a `<ul class="pagination-content">`. Give each pagination on a page its own label.
- Each page is an `<a class="pagination-link">` in an `<li>`, with `aria-label="Page 2"` so it isn't read as a bare number.
- The current page has `aria-current="page"`, which outlines it. It stays a link, so it can be reloaded or copied.
- Previous and next add `.pagination-previous` / `.pagination-next` (and `rel="prev"` / `rel="next"`), with their text in a `.pagination-label`.
- `.pagination-ellipsis` stands in for pages left out. It is `aria-hidden`: the page numbers either side already show the gap.
- Plain links work without JavaScript; add htmx attributes to swap only the list (see [With htmx](#htmx)).

The [macro](#macro) works out which pages to show and writes all of this for you.

## Page numbers only

Leave out previous and next when there are few pages.

```html
<nav class="pagination" aria-label="Pagination">
  <ul class="pagination-content">
    <li><a class="pagination-link" href="#" aria-label="Page 1">1</a></li>
    <li><a class="pagination-link" href="#" aria-label="Page 2" aria-current="page">2</a></li>
    <li><a class="pagination-link" href="#" aria-label="Page 3">3</a></li>
    <li><a class="pagination-link" href="#" aria-label="Page 4">4</a></li>
    <li><a class="pagination-link" href="#" aria-label="Page 5">5</a></li>
  </ul>
</nav>
```

## Disabled

On the first page there is no previous one. Keep the link in place, so nothing shifts, but drop its `href` and add `aria-disabled="true"`: it fades, can't be clicked and leaves the tab order. A `<button disabled>` works the same.

```html
<nav class="pagination" aria-label="Pagination">
  <ul class="pagination-content">
    <li><a class="pagination-link pagination-previous" aria-disabled="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg><span class="pagination-label">Previous</span></a></li>
    <li><a class="pagination-link" href="#" aria-label="Page 1" aria-current="page">1</a></li>
    <li><a class="pagination-link" href="#" aria-label="Page 2">2</a></li>
    <li><a class="pagination-link" href="#" aria-label="Page 3">3</a></li>
    <li><a class="pagination-link pagination-next" href="#" rel="next"><span class="pagination-label">Next</span><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></a></li>
  </ul>
</nav>
```

## First and last

`.pagination-first` and `.pagination-last` jump to the ends. They are usually icon-only, so give them an `aria-label`.

```html
<nav class="pagination" aria-label="Pagination">
  <ul class="pagination-content">
    <li><a class="pagination-link pagination-first" href="#" aria-label="First page"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m11 17-5-5 5-5"/><path d="m18 17-5-5 5-5"/></svg></a></li>
    <li><a class="pagination-link pagination-previous" href="#" rel="prev"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg><span class="pagination-label">Previous</span></a></li>
    <li><a class="pagination-link" href="#" aria-label="Page 4">4</a></li>
    <li><a class="pagination-link" href="#" aria-label="Page 5" aria-current="page">5</a></li>
    <li><a class="pagination-link" href="#" aria-label="Page 6">6</a></li>
    <li><a class="pagination-link pagination-next" href="#" rel="next"><span class="pagination-label">Next</span><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></a></li>
    <li><a class="pagination-link pagination-last" href="#" aria-label="Last page"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m6 17 5-5-5-5"/><path d="m13 17 5-5-5-5"/></svg></a></li>
  </ul>
</nav>
```

## Icons only, for tables

Without page numbers and labels, previous and next become square icon buttons with an `aria-label`. A data table's footer pairs them with a page size and the position. `.pagination-outline` outlines every link; `mx-0 w-auto` stops the `<nav>` filling and centring in the row.

```html
<div class="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 text-sm">
  <p class="text-muted-foreground">2 of 97 rows selected.</p>
  <div class="flex flex-wrap items-center gap-x-6 gap-y-3">
    <div class="flex items-center gap-2">
      <label class="font-medium" for="rows-per-page">Rows per page</label>
      <select class="select input-sm w-20" id="rows-per-page" name="per_page">
        <option>10</option>
        <option selected>20</option>
        <option>50</option>
      </select>
    </div>
    <p class="font-medium tabular-nums">Page 2 of 5</p>
    <nav class="pagination pagination-sm pagination-outline mx-0 w-auto" aria-label="Table pages">
      <ul class="pagination-content">
        <li class="max-sm:hidden"><a class="pagination-link pagination-first" href="#" aria-label="First page"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m11 17-5-5 5-5"/><path d="m18 17-5-5 5-5"/></svg></a></li>
        <li><a class="pagination-link pagination-previous" href="#" rel="prev" aria-label="Previous page"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg></a></li>
        <li><a class="pagination-link pagination-next" href="#" rel="next" aria-label="Next page"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></a></li>
        <li class="max-sm:hidden"><a class="pagination-link pagination-last" href="#" aria-label="Last page"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m6 17 5-5-5-5"/><path d="m13 17 5-5-5-5"/></svg></a></li>
      </ul>
    </nav>
  </div>
</div>
```

With htmx, the select can reload the table on change: `hx-get="/invoices" hx-trigger="change" hx-target="#invoices" hx-include="this"`.

## Sizes

`.pagination-sm` and `.pagination-lg` on the `<nav>` match `.btn-sm` and `.btn-lg` heights.

```html
<nav class="pagination pagination-sm" aria-label="Small pagination">
  <ul class="pagination-content">
    <li><a class="pagination-link pagination-previous" href="#" rel="prev" aria-label="Previous page"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg></a></li>
    <li><a class="pagination-link" href="#" aria-label="Page 1">1</a></li>
    <li><a class="pagination-link" href="#" aria-label="Page 2" aria-current="page">2</a></li>
    <li><a class="pagination-link" href="#" aria-label="Page 3">3</a></li>
    <li><a class="pagination-link pagination-next" href="#" rel="next" aria-label="Next page"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></a></li>
  </ul>
</nav>
<nav class="pagination pagination-lg" aria-label="Large pagination">
  <ul class="pagination-content">
    <li><a class="pagination-link pagination-previous" href="#" rel="prev" aria-label="Previous page"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg></a></li>
    <li><a class="pagination-link" href="#" aria-label="Page 1">1</a></li>
    <li><a class="pagination-link" href="#" aria-label="Page 2" aria-current="page">2</a></li>
    <li><a class="pagination-link" href="#" aria-label="Page 3">3</a></li>
    <li><a class="pagination-link pagination-next" href="#" rel="next" aria-label="Next page"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></a></li>
  </ul>
</nav>
```

## Responsive

`.pagination-responsive` fits a phone: below the `sm` breakpoint (640px) only previous, the current page and next show, and the previous / next labels are hidden visually but still read out. Narrow the window to see it.

```html
<nav class="pagination pagination-responsive" aria-label="Pagination">
  <ul class="pagination-content">
    <li><a class="pagination-link pagination-previous" href="#" rel="prev"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg><span class="pagination-label">Previous</span></a></li>
    <li><a class="pagination-link" href="#" aria-label="Page 1">1</a></li>
    <li><span class="pagination-ellipsis" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></span></li>
    <li><a class="pagination-link" href="#" aria-label="Page 4">4</a></li>
    <li><a class="pagination-link" href="#" aria-label="Page 5" aria-current="page">5</a></li>
    <li><a class="pagination-link" href="#" aria-label="Page 6">6</a></li>
    <li><span class="pagination-ellipsis" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></span></li>
    <li><a class="pagination-link" href="#" aria-label="Page 10">10</a></li>
    <li><a class="pagination-link pagination-next" href="#" rel="next"><span class="pagination-label">Next</span><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></a></li>
  </ul>
</nav>
```

## Macro

`pagination(page, total)` works out which pages to show and writes the whole `<nav>`. `{page}` in `href` becomes each link's page number.

```jinja
{% from "components/pagination/pagination.html" import pagination %}

{{ pagination(5, 10, href="/invoices?page={page}") }}
{{ pagination(2, 5, numbers=false, icons=true, first=true, last=true, size="sm", outline=true) }}
```

### Which pages are shown

The first and last `boundaries` pages always show, and `siblings` pages either side of the current one. An ellipsis stands in for two or more pages left out; a gap of one page shows that page instead. Once there are more pages than fit, the list always has the same number of items (2 × `siblings` + 2 × `boundaries` + 3, so 7 by default), so the links don't move about as the current page changes.

| Call | Pages shown |
| --- | --- |
| `pagination(1, 10)` | [1] 2 3 4 5 … 10 |
| `pagination(4, 10)` | 1 2 3 [4] 5 … 10 |
| `pagination(5, 10)` | 1 … 4 [5] 6 … 10 |
| `pagination(7, 10)` | 1 … 6 [7] 8 9 10 |
| `pagination(10, 10)` | 1 … 6 7 8 9 [10] |
| `pagination(3, 7)` | 1 2 [3] 4 5 6 7 (all fit) |
| `pagination(10, 20, siblings=2, boundaries=2)` | 1 2 … 8 9 [10] 11 12 … 19 20 |
| `pagination(10, 20, boundaries=0)` | … 9 [10] 11 … |

The first, a middle and the last page of ten, rendered:

```html
<nav class="pagination" aria-label="Pagination, first page">
  <ul class="pagination-content">
    <li><a class="pagination-link pagination-previous" aria-disabled="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg><span class="pagination-label">Previous</span></a></li>
    <li><a class="pagination-link" href="#page-1" aria-label="Page 1" aria-current="page">1</a></li>
    <li><a class="pagination-link" href="#page-2" aria-label="Page 2">2</a></li>
    <li><a class="pagination-link" href="#page-3" aria-label="Page 3">3</a></li>
    <li><a class="pagination-link" href="#page-4" aria-label="Page 4">4</a></li>
    <li><a class="pagination-link" href="#page-5" aria-label="Page 5">5</a></li>
    <li><span class="pagination-ellipsis" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></span></li>
    <li><a class="pagination-link" href="#page-10" aria-label="Page 10">10</a></li>
    <li><a class="pagination-link pagination-next" href="#page-2" rel="next"><span class="pagination-label">Next</span><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></a></li>
  </ul>
</nav>

<nav class="pagination" aria-label="Pagination, middle page">
  <ul class="pagination-content">
    <li><a class="pagination-link pagination-previous" href="#page-4" rel="prev"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg><span class="pagination-label">Previous</span></a></li>
    <li><a class="pagination-link" href="#page-1" aria-label="Page 1">1</a></li>
    <li><span class="pagination-ellipsis" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></span></li>
    <li><a class="pagination-link" href="#page-4" aria-label="Page 4">4</a></li>
    <li><a class="pagination-link" href="#page-5" aria-label="Page 5" aria-current="page">5</a></li>
    <li><a class="pagination-link" href="#page-6" aria-label="Page 6">6</a></li>
    <li><span class="pagination-ellipsis" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></span></li>
    <li><a class="pagination-link" href="#page-10" aria-label="Page 10">10</a></li>
    <li><a class="pagination-link pagination-next" href="#page-6" rel="next"><span class="pagination-label">Next</span><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></a></li>
  </ul>
</nav>

<nav class="pagination" aria-label="Pagination, last page">
  <ul class="pagination-content">
    <li><a class="pagination-link pagination-previous" href="#page-9" rel="prev"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg><span class="pagination-label">Previous</span></a></li>
    <li><a class="pagination-link" href="#page-1" aria-label="Page 1">1</a></li>
    <li><span class="pagination-ellipsis" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></span></li>
    <li><a class="pagination-link" href="#page-6" aria-label="Page 6">6</a></li>
    <li><a class="pagination-link" href="#page-7" aria-label="Page 7">7</a></li>
    <li><a class="pagination-link" href="#page-8" aria-label="Page 8">8</a></li>
    <li><a class="pagination-link" href="#page-9" aria-label="Page 9">9</a></li>
    <li><a class="pagination-link" href="#page-10" aria-label="Page 10" aria-current="page">10</a></li>
    <li><a class="pagination-link pagination-next" aria-disabled="true"><span class="pagination-label">Next</span><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></a></li>
  </ul>
</nav>
```

| Parameter | Description |
| --- | --- |
| `page, total` | Required. The current page (kept within 1…total) and the number of pages. |
| `href="?page={page}"` | Each link's URL; {page} is replaced with its page number. |
| `siblings=1` | Pages shown on each side of the current one. |
| `boundaries=1` | Pages always shown at each end. |
| `numbers=true` | false leaves out the page numbers: previous / next (and first / last) only. |
| `previous=true, next=true` | true for "Previous" / "Next", a string for other text, false to leave the link out. |
| `first=false, last=false` | true for icon-only links labelled "First page" / "Last page", or a string for another label. |
| `icons=false` | true makes previous / next icon-only; their text becomes the aria-label. |
| `page_label="Page {page}"` | Each page link's aria-label. |
| `responsive=false` | true adds .pagination-responsive. |
| `size` | "sm" or "lg". |
| `outline=false` | true adds .pagination-outline. |
| `label="Pagination"` | The <nav>'s aria-label. |
| `attrs` | More attributes for every enabled link, as a dict; {page} is replaced in the values. |
| `class` | More classes on the <nav>. |

## With htmx

Keep the links' `href`s, so the pages work without JavaScript, and let htmx fetch the same URLs and swap only the region holding the table and its pagination. With the macro, `attrs` puts the attributes on every link:

```jinja
<div id="invoices">
  <table class="table">…rows for this page…</table>
  {{ pagination(page, pages, href="/invoices?page={page}", attrs={
    "hx-get": "/invoices?page={page}",
    "hx-target": "#invoices",
    "hx-select": "#invoices",
    "hx-swap": "outerHTML",
    "hx-push-url": "true"
  }) }}
</div>
```

which writes links like:

```html
<a class="pagination-link" href="/invoices?page=3" aria-label="Page 3"
   hx-get="/invoices?page=3" hx-target="#invoices" hx-select="#invoices" hx-swap="outerHTML" hx-push-url="true">3</a>
```

- `hx-select="#invoices"` picks the region out of the full page the server returns, so one route serves both normal visits and htmx requests. A server that checks the `HX-Request` header can return just the region instead and drop `hx-select`.
- The region swapped includes the pagination, so the current page and the disabled ends update with the rows.
- `hx-push-url="true"` puts `?page=3` in the address bar, so reloading and the back button land on the same page.
- Disabled links have no `href` and the macro leaves their htmx attributes off, so they send nothing.
- After the swap, focus is lost with the old link. Move it to the top of the region (for example a heading with `tabindex="-1"`) if keyboard users would otherwise start again from the top of the page.

To write the attributes once rather than on every link, put them on the `<nav>` as inherited attributes (`hx-target:inherited="#invoices"` and so on) and use `hx-boost:inherited="true"`, which makes htmx fetch each link's `href`.

## Keyboard

| Key | Action |
| --- | --- |
| `Tab` `Shift`+`Tab` | Move between the links; disabled ones are skipped |
| `Enter` | Go to that page |

## Accessibility

- The `<nav>` is a navigation landmark; its `aria-label` tells it apart from the site's other navigation. Use different labels when a page has two.
- `aria-current="page"` tells screen readers which page is showing; don't rely on the outline alone.
- Icon-only links need an `aria-label`. Links with visible text don't: an `aria-label` that differs from the text breaks voice control ("click Next").
- Page links are labelled "Page 3" rather than "3"; pass `page_label` to the macro to translate it.

## Reference

| Class | Description |
| --- | --- |
| `.pagination` | The <nav aria-label>: centres the list in its container. |
| `.pagination-content` | The <ul> of items. |
| `.pagination-link` | A page, previous, next, first or last link (or button): a ghost button. |
| `[aria-current="page"]` | On a .pagination-link: the current page, outlined. |
| `[aria-disabled="true"], :disabled` | On a .pagination-link (with no href): faded and not clickable. |
| `.pagination-previous / .pagination-next` | Previous / next links, with an icon and a .pagination-label (or an aria-label alone). |
| `.pagination-first / .pagination-last` | First / last page links, usually icon-only with an aria-label. |
| `.pagination-label` | The text of previous / next; hidden visually on small screens with .pagination-responsive. |
| `.pagination-ellipsis` | "…" standing in for pages left out, aria-hidden. |
| `.pagination-sm / .pagination-lg` | On the <nav>: 32px / 40px links (36px by default). |
| `.pagination-outline` | On the <nav>: every link outlined; the current page filled. |
| `.pagination-responsive` | On the <nav>: below sm, only previous, the current page and next, with labels visually hidden. |
