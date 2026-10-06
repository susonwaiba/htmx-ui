---
title: "Hover card"
description: "A card that previews what is behind a link when a mouse rests on it or the link gets keyboard focus, for sighted users."
url: "/docs/v0.2/components/hover-card"
section: "Components"
---

# Hover card

A card that previews what is behind a link when a mouse rests on it or the link gets keyboard focus, for sighted users.

```html
<span class="hover-card" data-hover-card>
  <a class="btn btn-link" href="#" data-hover-card-trigger>@htmx-ui</a>
  <span class="hover-card-content hover-card-content-lg" data-hover-card-content>
    <span class="hover-card-header">
      <span class="avatar avatar-lg" aria-hidden="true">
        <img class="avatar-image" src="../../../images/avatar-2.svg" alt="" />
        <span class="avatar-fallback">HU</span>
      </span>
      <span class="hover-card-body">
        <span class="hover-card-title">@htmx-ui</span>
        <span class="hover-card-description">Components for htmx apps – plain HTML, CSS and a little TypeScript.</span>
        <span class="hover-card-meta"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg> Joined December 2021</span>
      </span>
    </span>
  </span>
</span>
```

## Markup

- Wrap a link and its card in `.hover-card` with `data-hover-card`. The trigger is the element with `data-hover-card-trigger`, else the first link inside.
- The card is a `.hover-card-content` with `data-hover-card-content`, placed after the trigger. It may hold anything, links included.
- Write the wrapper, the card and its parts as `<span>`s, as above: a hover card is often inside a paragraph, and a `<div>` or `<p>` there would end the paragraph.
- For a profile preview, `.hover-card-header` puts an [avatar](/docs/v0.2/components/avatar) beside a `.hover-card-body`, which stacks a `.hover-card-title`, a `.hover-card-description` and a muted `.hover-card-meta` line with an icon.
- The trigger stays an ordinary link: clicking or tapping it follows it. The card only adds a preview of what is there, so nothing must be reachable through the card alone.

## Opening and closing

- A mouse or pen resting on the trigger opens the card after `700ms`, so it doesn't flash while the pointer crosses the page. Leaving before then opens nothing.
- Once the pointer has left both the trigger and the card, the card closes after `300ms`. The pointer can travel from the trigger onto the card, across the gap, to select text or follow a link in it.
- Keyboard focus on the trigger opens it at once. The card stays open while focus is inside it and closes when focus leaves. A mouse click that focuses the trigger doesn't open it.
- Touch never opens it: on a phone the link simply navigates.
- `Esc` closes it.

The behaviour sets `data-open` on the wrapper while the card is open. Without JavaScript, CSS opens it on hover and keyboard focus, with the same delays.

## Side

Cards open below their trigger. `.hover-card-content-top`, `.hover-card-content-right` and `.hover-card-content-left` put them on another side.

```html
<span class="hover-card" data-hover-card>
  <a class="btn btn-outline btn-sm" href="#" data-hover-card-trigger>Top</a>
  <span class="hover-card-content hover-card-content-sm hover-card-content-top" data-hover-card-content>Opens above the trigger.</span>
</span>
<span class="flex gap-24">
  <span class="hover-card" data-hover-card>
    <a class="btn btn-outline btn-sm" href="#" data-hover-card-trigger>Left</a>
    <span class="hover-card-content hover-card-content-sm hover-card-content-left" data-hover-card-content>Opens to the left.</span>
  </span>
  <span class="hover-card" data-hover-card>
    <a class="btn btn-outline btn-sm" href="#" data-hover-card-trigger>Right</a>
    <span class="hover-card-content hover-card-content-sm hover-card-content-right" data-hover-card-content>Opens to the right.</span>
  </span>
</span>
<span class="hover-card" data-hover-card>
  <a class="btn btn-outline btn-sm" href="#" data-hover-card-trigger>Bottom</a>
  <span class="hover-card-content hover-card-content-sm" data-hover-card-content>Opens below the trigger (the default).</span>
</span>
```

If the card would stick out of the window on its side, it opens on the opposite side instead, provided that side has more room: a card set to open above a link at the top of the screen opens below it. `data-side` on the card says which side it opened on. Like any absolutely positioned element, it is still clipped by an ancestor with `overflow: hidden`.

## Alignment

A card is centred on its trigger. `.hover-card-content-start` lines it up with the trigger's start edge and `.hover-card-content-end` with its end edge (the top and bottom edges for cards on the left or right).

```html
<span class="hover-card" data-hover-card>
  <a class="btn btn-outline btn-sm" href="#" data-hover-card-trigger>Start</a>
  <span class="hover-card-content hover-card-content-sm hover-card-content-start" data-hover-card-content>Aligned to the start edge of its trigger.</span>
</span>
<span class="hover-card" data-hover-card>
  <a class="btn btn-outline btn-sm" href="#" data-hover-card-trigger>Center</a>
  <span class="hover-card-content hover-card-content-sm" data-hover-card-content>Aligned to the centre of its trigger.</span>
</span>
<span class="hover-card" data-hover-card>
  <a class="btn btn-outline btn-sm" href="#" data-hover-card-trigger>End</a>
  <span class="hover-card-content hover-card-content-sm hover-card-content-end" data-hover-card-content>Aligned to the end edge of its trigger.</span>
</span>
```

## Size

Cards are `16rem` wide. `.hover-card-content-sm` makes them `12rem` and `.hover-card-content-lg` `20rem`; any `w-*` utility sets another width. They never get wider than the window.

```html
<span class="hover-card" data-hover-card>
  <a class="btn btn-outline btn-sm" href="#" data-hover-card-trigger>Small</a>
  <span class="hover-card-content hover-card-content-sm" data-hover-card-content>
    <span class="hover-card-title">Small</span>
    <span class="hover-card-description text-muted-foreground">A hover card with .hover-card-content-sm.</span>
  </span>
</span>
<span class="hover-card" data-hover-card>
  <a class="btn btn-outline btn-sm" href="#" data-hover-card-trigger>Default</a>
  <span class="hover-card-content" data-hover-card-content>
    <span class="hover-card-title">Default</span>
    <span class="hover-card-description text-muted-foreground">A hover card with the default width.</span>
  </span>
</span>
<span class="hover-card" data-hover-card>
  <a class="btn btn-outline btn-sm" href="#" data-hover-card-trigger>Large</a>
  <span class="hover-card-content hover-card-content-lg" data-hover-card-content>
    <span class="hover-card-title">Large</span>
    <span class="hover-card-description text-muted-foreground">A hover card with .hover-card-content-lg.</span>
  </span>
</span>
```

## Offset

The gap between trigger and card is `--hover-card-offset`, `0.25rem` by default. Set it on the wrapper or any ancestor; the invisible bridge the pointer crosses grows with it.

```html
<span class="hover-card [--hover-card-offset:1rem]" data-hover-card>
  <a class="btn btn-outline btn-sm" href="#" data-hover-card-trigger>1rem away</a>
  <span class="hover-card-content hover-card-content-sm" data-hover-card-content>Opens 1rem below its trigger.</span>
</span>
```

## In a paragraph

The usual home of a hover card: names and references in running text, each previewing the page it links to.

```html
<p class="max-w-md text-sm leading-relaxed text-muted-foreground">
  This release was written by
  <span class="hover-card" data-hover-card>
    <a class="link" href="#" data-hover-card-trigger>Ada Moreno</a>
    <span class="hover-card-content" data-hover-card-content>
      <span class="hover-card-header">
        <span class="avatar" aria-hidden="true">
          <img class="avatar-image" src="../../../images/avatar-1.svg" alt="" />
          <span class="avatar-fallback">AM</span>
        </span>
        <span class="hover-card-body">
          <span class="hover-card-title">Ada Moreno</span>
          <span class="hover-card-description">Maintainer. Works on the engine and the docs plugin.</span>
        </span>
      </span>
    </span>
  </span>
  and reviewed by
  <span class="hover-card" data-hover-card>
    <a class="link" href="#" data-hover-card-trigger>Sam Okafor</a>
    <span class="hover-card-content" data-hover-card-content>
      <span class="hover-card-header">
        <span class="avatar" aria-hidden="true">
          <img class="avatar-image" src="../../../images/avatar-3.svg" alt="" />
          <span class="avatar-fallback">SO</span>
        </span>
        <span class="hover-card-body">
          <span class="hover-card-title">Sam Okafor</span>
          <span class="hover-card-description">Reviews accessibility across the component library.</span>
        </span>
      </span>
    </span>
  </span>.
  It closes three issues.
</p>
```

## Delays

`--hover-card-open-delay` (`700ms`) is how long the pointer must rest on the trigger, and `--hover-card-close-delay` (`300ms`) how long the card waits after the pointer has left. Set them on the wrapper or any ancestor, in `ms` or `s`. Keyboard focus ignores the open delay.

```html
<span class="hover-card [--hover-card-open-delay:100ms]" data-hover-card>
  <a class="btn btn-outline btn-sm" href="#" data-hover-card-trigger>Quick</a>
  <span class="hover-card-content hover-card-content-sm" data-hover-card-content>Opens after 100ms.</span>
</span>
<span class="hover-card [--hover-card-close-delay:1s]" data-hover-card>
  <a class="btn btn-outline btn-sm" href="#" data-hover-card-trigger>Lingering</a>
  <span class="hover-card-content hover-card-content-sm" data-hover-card-content>Stays for a second after the pointer leaves.</span>
</span>
```

## Keyboard

| Key | Action |
| --- | --- |
| `Tab` | Focusing the trigger opens the card. The next `Tab` moves into the card's links, if it has any; leaving the card closes it. |
| `Enter` | Follows the trigger link, as usual. |
| `Esc` | Closes the card. Focus inside the card returns to the trigger. It opens again when the pointer comes back or focus returns to the trigger. |

## Accessibility

- A hover card is for sighted mouse and keyboard users. The trigger is a real link that leads to the same information, so everyone else loses nothing.
- The card has no role and isn't a dialog: it doesn't take focus or trap it, and opening it isn't announced.
- While closed it is hidden with `visibility`, so screen readers and `Tab` skip it. While open it is ordinary content after the link, which keyboard users can tab into.
- The trigger isn't linked to the card with `aria-describedby`, as a [tooltip](/docs/v0.2/components/tooltip) is: a profile card is too long to read out after every mention. For a short card, add it yourself: give the card an `id` and put it in the trigger's `aria-describedby`.
- It meets WCAG 1.4.13 (content on hover or focus): it can be dismissed with `Esc` without moving the pointer, the pointer can move onto it, and it stays until the pointer or focus leaves.
- With reduced motion, the card fades without sliding or zooming.

## With htmx

The card fires `hover-card:open` and `hover-card:close` (they bubble) each time it opens and closes. Load the preview from the server the first time it opens with `hx-trigger="hover-card:open once"` on the card, so a page full of mentions doesn't fetch every profile up front:

```html
<span class="hover-card" data-hover-card>
  <a class="link" href="#" data-hover-card-trigger>@htmx-ui</a>
  <span class="hover-card-content" data-hover-card-content
        hx-get="/api/profile?user=htmx-ui" hx-trigger="hover-card:open once">
    <span class="flex items-center gap-2 text-muted-foreground">
      <span class="spinner" role="status" aria-label="Loading"></span> Loading profile…
    </span>
  </span>
</span>
```

The server returns the card's inner markup, which replaces the placeholder. Components in it are initialised as usual, since htmx-ui runs its initialisers on new content.

## Reference

| Class / attribute | Description |
| --- | --- |
| `.hover-card` | Wrapper around the trigger and the card. Add data-hover-card. |
| `.hover-card-content` | The card: below the trigger, centred, 16rem wide. Add data-hover-card-content. |
| `.hover-card-content-top / -right / -bottom / -left` | The side it opens on (bottom by default). |
| `.hover-card-content-start / -end` | Align with the trigger's start or end edge (centred by default). |
| `.hover-card-content-sm / -lg` | 12rem / 20rem wide. |
| `.hover-card-header` | An avatar beside the body. |
| `.hover-card-body` | Stacks the title, description and meta line. |
| `.hover-card-title` | The name or title, in bold. |
| `.hover-card-description` | A line or two of text. |
| `.hover-card-meta` | A small muted line with an icon, such as a join date. |
| `[data-hover-card]` | Behaviour: delays, keyboard focus, Escape, flipping, events. |
| `[data-hover-card-trigger]` | Marks the trigger when it isn't the first link inside. |
| `[data-hover-card-content]` | Marks the card. |
| `[data-open]` | Set on the wrapper while the card is open. |
| `[data-side]` | Set on the card when it opens: the side it opened on, after any flip. |
| `--hover-card-open-delay` | How long the pointer rests on the trigger before the card opens (700ms). |
| `--hover-card-close-delay` | How long the card stays after the pointer leaves (300ms). |
| `--hover-card-offset` | Gap between trigger and card (0.25rem). |
| `hover-card:open / hover-card:close` | Events fired on the card (bubbling) when it opens and closes. |
