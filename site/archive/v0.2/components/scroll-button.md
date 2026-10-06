---
title: "Scroll button"
description: "A floating button that appears once the reader scrolls away from an edge and jumps back to the bottom or the top, of a scroll container or the whole page."
url: "/docs/v0.2/components/scroll-button"
section: "Components"
---

# Scroll button

A floating button that appears once the reader scrolls away from an edge and jumps back to the bottom or the top, of a scroll container or the whole page.

```html
<div class="relative w-full">
  <div class="h-72 overflow-y-auto rounded-(--radius) border border-border bg-surface p-4 text-sm" data-scroll-container tabindex="0" aria-label="Activity log">
    <ol class="space-y-2">
      <li class="flex justify-between gap-4"><span>Event 1: build step finished</span><span class="text-muted-foreground tabular-nums">12:01</span></li>
      <li class="flex justify-between gap-4"><span>Event 2: build step finished</span><span class="text-muted-foreground tabular-nums">12:02</span></li>
      <li class="flex justify-between gap-4"><span>Event 3: build step finished</span><span class="text-muted-foreground tabular-nums">12:03</span></li>
      <li class="flex justify-between gap-4"><span>Event 4: build step finished</span><span class="text-muted-foreground tabular-nums">12:04</span></li>
      <li class="flex justify-between gap-4"><span>Event 5: build step finished</span><span class="text-muted-foreground tabular-nums">12:05</span></li>
      <li class="flex justify-between gap-4"><span>Event 6: build step finished</span><span class="text-muted-foreground tabular-nums">12:06</span></li>
      <li class="flex justify-between gap-4"><span>Event 7: build step finished</span><span class="text-muted-foreground tabular-nums">12:07</span></li>
      <li class="flex justify-between gap-4"><span>Event 8: build step finished</span><span class="text-muted-foreground tabular-nums">12:08</span></li>
      <li class="flex justify-between gap-4"><span>Event 9: build step finished</span><span class="text-muted-foreground tabular-nums">12:09</span></li>
      <li class="flex justify-between gap-4"><span>Event 10: build step finished</span><span class="text-muted-foreground tabular-nums">12:10</span></li>
      <li class="flex justify-between gap-4"><span>Event 11: build step finished</span><span class="text-muted-foreground tabular-nums">12:11</span></li>
      <li class="flex justify-between gap-4"><span>Event 12: build step finished</span><span class="text-muted-foreground tabular-nums">12:12</span></li>
      <li class="flex justify-between gap-4"><span>Event 13: build step finished</span><span class="text-muted-foreground tabular-nums">12:13</span></li>
      <li class="flex justify-between gap-4"><span>Event 14: build step finished</span><span class="text-muted-foreground tabular-nums">12:14</span></li>
      <li class="flex justify-between gap-4"><span>Event 15: build step finished</span><span class="text-muted-foreground tabular-nums">12:15</span></li>
      <li class="flex justify-between gap-4"><span>Event 16: build step finished</span><span class="text-muted-foreground tabular-nums">12:16</span></li>
      <li class="flex justify-between gap-4"><span>Event 17: build step finished</span><span class="text-muted-foreground tabular-nums">12:17</span></li>
      <li class="flex justify-between gap-4"><span>Event 18: build step finished</span><span class="text-muted-foreground tabular-nums">12:18</span></li>
      <li class="flex justify-between gap-4"><span>Event 19: build step finished</span><span class="text-muted-foreground tabular-nums">12:19</span></li>
      <li class="flex justify-between gap-4"><span>Event 20: build step finished</span><span class="text-muted-foreground tabular-nums">12:20</span></li>
      <li class="flex justify-between gap-4"><span>Event 21: build step finished</span><span class="text-muted-foreground tabular-nums">12:21</span></li>
      <li class="flex justify-between gap-4"><span>Event 22: build step finished</span><span class="text-muted-foreground tabular-nums">12:22</span></li>
      <li class="flex justify-between gap-4"><span>Event 23: build step finished</span><span class="text-muted-foreground tabular-nums">12:23</span></li>
      <li class="flex justify-between gap-4"><span>Event 24: build step finished</span><span class="text-muted-foreground tabular-nums">12:24</span></li>
      <li class="flex justify-between gap-4"><span>Event 25: build step finished</span><span class="text-muted-foreground tabular-nums">12:25</span></li>
      <li class="flex justify-between gap-4"><span>Event 26: build step finished</span><span class="text-muted-foreground tabular-nums">12:26</span></li>
      <li class="flex justify-between gap-4"><span>Event 27: build step finished</span><span class="text-muted-foreground tabular-nums">12:27</span></li>
      <li class="flex justify-between gap-4"><span>Event 28: build step finished</span><span class="text-muted-foreground tabular-nums">12:28</span></li>
      <li class="flex justify-between gap-4"><span>Event 29: build step finished</span><span class="text-muted-foreground tabular-nums">12:29</span></li>
      <li class="flex justify-between gap-4"><span>Event 30: build step finished</span><span class="text-muted-foreground tabular-nums">12:30</span></li>
      <li class="flex justify-between gap-4"><span>Event 31: build step finished</span><span class="text-muted-foreground tabular-nums">12:31</span></li>
      <li class="flex justify-between gap-4"><span>Event 32: build step finished</span><span class="text-muted-foreground tabular-nums">12:32</span></li>
      <li class="flex justify-between gap-4"><span>Event 33: build step finished</span><span class="text-muted-foreground tabular-nums">12:33</span></li>
      <li class="flex justify-between gap-4"><span>Event 34: build step finished</span><span class="text-muted-foreground tabular-nums">12:34</span></li>
      <li class="flex justify-between gap-4"><span>Event 35: build step finished</span><span class="text-muted-foreground tabular-nums">12:35</span></li>
      <li class="flex justify-between gap-4"><span>Event 36: build step finished</span><span class="text-muted-foreground tabular-nums">12:36</span></li>
      <li class="flex justify-between gap-4"><span>Event 37: build step finished</span><span class="text-muted-foreground tabular-nums">12:37</span></li>
      <li class="flex justify-between gap-4"><span>Event 38: build step finished</span><span class="text-muted-foreground tabular-nums">12:38</span></li>
      <li class="flex justify-between gap-4"><span>Event 39: build step finished</span><span class="text-muted-foreground tabular-nums">12:39</span></li>
      <li class="flex justify-between gap-4"><span>Event 40: build step finished</span><span class="text-muted-foreground tabular-nums">12:40</span></li>
    </ol>
  </div>
  <button type="button" class="btn btn-outline btn-icon scroll-button scroll-button-float" data-scroll-button="top" aria-label="Scroll to top"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg></button>
  <button type="button" class="btn btn-outline btn-icon scroll-button scroll-button-float" data-scroll-button="bottom" aria-label="Scroll to bottom"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M12 5v14M19 12l-7 7-7-7"/></svg></button>
</div>
```

## Markup

- The button is an ordinary icon [`.btn`](/docs/v0.2/components/button) plus `.scroll-button`. Give it `type="button"` and an `aria-label` such as "Scroll to bottom".
- `data-scroll-button` adds the behaviour. Its value is the edge it jumps to: `bottom` (the default) or `top`.
- While its scroll target is near that edge the button is hidden: `data-state="hidden"` fades and shrinks it, and `inert` takes it out of the tab order and the accessibility tree. Once the reader scrolls away it turns `data-state="visible"`. It stays in the DOM throughout.
- It follows the content too: when messages are appended or grow, the button appears without a scroll event, so a chat's "jump to bottom" shows up as replies stream in.

## In a scroll container

Lay the button over the box it scrolls: wrap both in a `relative` element, mark the box `data-scroll-container` and add `.scroll-button-float`, which centres the button at the bottom of the wrapper (at the top for a `top` button). Give the box `tabindex="0"` so keyboard users can scroll it; when the button hides under the focus, focus moves back to the box.

```html
<div class="relative mx-auto w-full max-w-md">
  <div class="flex h-80 flex-col gap-3 overflow-y-auto rounded-(--radius) border border-border bg-surface p-4 text-sm" data-scroll-container tabindex="0" aria-label="Conversation">
    <p class="max-w-[80%] rounded-(--radius) px-3 py-2 self-end bg-primary text-primary-foreground">
      Can you summarise the release notes?
    </p>
    <p class="max-w-[80%] rounded-(--radius) px-3 py-2 self-start bg-muted">
      Sure: the release adds a loader, a scroll button and a faster build, and fixes three bugs in the docs search.
    </p>
    <p class="max-w-[80%] rounded-(--radius) px-3 py-2 self-end bg-primary text-primary-foreground">
      Can you summarise the release notes?
    </p>
    <p class="max-w-[80%] rounded-(--radius) px-3 py-2 self-start bg-muted">
      Sure: the release adds a loader, a scroll button and a faster build, and fixes three bugs in the docs search.
    </p>
    <p class="max-w-[80%] rounded-(--radius) px-3 py-2 self-end bg-primary text-primary-foreground">
      Can you summarise the release notes?
    </p>
    <p class="max-w-[80%] rounded-(--radius) px-3 py-2 self-start bg-muted">
      Sure: the release adds a loader, a scroll button and a faster build, and fixes three bugs in the docs search.
    </p>
    <p class="max-w-[80%] rounded-(--radius) px-3 py-2 self-end bg-primary text-primary-foreground">
      Can you summarise the release notes?
    </p>
    <p class="max-w-[80%] rounded-(--radius) px-3 py-2 self-start bg-muted">
      Sure: the release adds a loader, a scroll button and a faster build, and fixes three bugs in the docs search.
    </p>
    <p class="max-w-[80%] rounded-(--radius) px-3 py-2 self-end bg-primary text-primary-foreground">
      Can you summarise the release notes?
    </p>
    <p class="max-w-[80%] rounded-(--radius) px-3 py-2 self-start bg-muted">
      Sure: the release adds a loader, a scroll button and a faster build, and fixes three bugs in the docs search.
    </p>
    <p class="max-w-[80%] rounded-(--radius) px-3 py-2 self-end bg-primary text-primary-foreground">
      Can you summarise the release notes?
    </p>
    <p class="max-w-[80%] rounded-(--radius) px-3 py-2 self-start bg-muted">
      Sure: the release adds a loader, a scroll button and a faster build, and fixes three bugs in the docs search.
    </p>
  </div>
  <button type="button" class="btn btn-outline btn-icon scroll-button scroll-button-float" data-scroll-button aria-label="Scroll to bottom"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M12 5v14M19 12l-7 7-7-7"/></svg></button>
</div>
```

The button finds its target in this order: `data-scroll-target`; the closest `[data-scroll-container]` around it; a `[data-scroll-container]` beside it; the nearest ancestor with `overflow-y: auto` or `scroll`; otherwise the page. Point it anywhere with a selector:

```html
<div id="log" class="h-80 overflow-y-auto" tabindex="0">…</div>
<button type="button" class="btn btn-outline btn-sm scroll-button" data-scroll-button data-scroll-target="#log">
  Jump to latest
</button>
```

## Back to top of the page

Without a container around it, the button scrolls the page. `.scroll-button-fixed` pins it to the bottom-right corner of the viewport (bottom-left in right-to-left text). This page has one: scroll down and it appears in the corner.

```html
<button type="button" class="btn btn-outline btn-icon scroll-button scroll-button-fixed"
  data-scroll-button="top" data-scroll-threshold="600" aria-label="Back to top">
  <svg>…arrow-up…</svg>
</button>
```

## Options

- `data-scroll-button="bottom" | "top"`: the edge to jump to (default `bottom`).
- `data-scroll-target="#selector"`: the element to scroll, when it isn't found from the markup.
- `data-scroll-threshold="200"`: how far from the edge, in pixels, the reader must scroll before the button shows (default 200).
- `data-scroll-behavior="smooth" | "instant"`: how it scrolls (default `smooth`; always instant when the reader prefers reduced motion).

A text button works as well as an icon one: anything with `.scroll-button` fades in and out.

```html
    <div class="relative mx-auto w-full max-w-md">
      <div class="h-56 overflow-y-auto rounded-(--radius) border border-border bg-surface p-4 text-sm" data-scroll-container tabindex="0" aria-label="Build output">
<p class="py-1">Line 1 of the build output</p><p class="py-1">Line 2 of the build output</p><p class="py-1">Line 3 of the build output</p><p class="py-1">Line 4 of the build output</p><p class="py-1">Line 5 of the build output</p><p class="py-1">Line 6 of the build output</p><p class="py-1">Line 7 of the build output</p><p class="py-1">Line 8 of the build output</p><p class="py-1">Line 9 of the build output</p><p class="py-1">Line 10 of the build output</p><p class="py-1">Line 11 of the build output</p><p class="py-1">Line 12 of the build output</p><p class="py-1">Line 13 of the build output</p><p class="py-1">Line 14 of the build output</p><p class="py-1">Line 15 of the build output</p><p class="py-1">Line 16 of the build output</p><p class="py-1">Line 17 of the build output</p><p class="py-1">Line 18 of the build output</p><p class="py-1">Line 19 of the build output</p><p class="py-1">Line 20 of the build output</p><p class="py-1">Line 21 of the build output</p><p class="py-1">Line 22 of the build output</p><p class="py-1">Line 23 of the build output</p><p class="py-1">Line 24 of the build output</p>      </div>
      <button type="button" class="btn btn-secondary btn-sm scroll-button scroll-button-float" data-scroll-button data-scroll-threshold="40" data-scroll-behavior="instant">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M12 5v14M19 12l-7 7-7-7"/></svg> Latest
      </button>
    </div>
```

## JavaScript

`initScrollButton(root)` runs with the other components, on load and on content htmx inserts. The helpers it uses are exported from its module too, for a "scroll to bottom" after your own updates:

```ts
import { distanceFromEdge, scrollToEdge } from "htmx-ui";

const log = document.querySelector<HTMLElement>("#log")!;
// Keep following new lines, unless the reader has scrolled up to read.
const following = distanceFromEdge(log, "bottom") < 40;
log.insertAdjacentHTML("beforeend", "<p>New line</p>");
if (following) scrollToEdge(log, "bottom", "instant");

scrollToEdge(null, "top"); // null is the page: smooth, or instant under reduced motion
```

## Reference

| Class | Description |
| --- | --- |
| `.scroll-button` | Fades and shrinks out while data-state="hidden", back in when visible. |
| `.scroll-button-float` | Absolutely centred at the bottom of the nearest positioned ancestor (top for a top button). |
| `.scroll-button-fixed` | Fixed to the viewport's bottom-right corner. |
| `[data-scroll-button="bottom" \| "top"]` | Behaviour: shows away from that edge, scrolls to it on click. |
| `[data-scroll-container]` | Marks the element a nearby scroll button scrolls. |
| `[data-scroll-target]` | A selector for the element to scroll. |
| `[data-scroll-threshold]` | Distance from the edge, in px, before the button shows (200). |
| `[data-scroll-behavior]` | smooth (default) or instant. |
| `[data-state="visible" \| "hidden"]` | Set by the behaviour; hidden is also inert. |

| Function | Description |
| --- | --- |
| `initScrollButton(root = document)` | Initialises every [data-scroll-button] under root (idempotent). |
| `scrollToEdge(target, edge = "bottom", behavior?)` | Scrolls an element, or the page for null, to its top or bottom. |
| `distanceFromEdge(target, edge)` | How far, in px, the element (or the page) is from that edge. |
| `scrollTargetOf(button)` | The element a scroll button scrolls, or null for the page. |
