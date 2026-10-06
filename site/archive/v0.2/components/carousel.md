---
title: "Carousel"
description: "Slides that drag, swipe and snap with momentum, on Embla Carousel: item sizes, spacing, vertical orientation, options and plugins."
url: "/docs/v0.2/components/carousel"
section: "Components"
---

# Carousel

Slides that drag, swipe and snap with momentum, on Embla Carousel: item sizes, spacing, vertical orientation, options and plugins.

```html
<div class="carousel w-full max-w-xs" data-carousel aria-label="Numbers">
  <div class="carousel-viewport">
    <div class="carousel-container">
        <div class="carousel-item">
          <div class="card flex items-center justify-center font-semibold aspect-square text-4xl">1</div>
        </div>
        <div class="carousel-item">
          <div class="card flex items-center justify-center font-semibold aspect-square text-4xl">2</div>
        </div>
        <div class="carousel-item">
          <div class="card flex items-center justify-center font-semibold aspect-square text-4xl">3</div>
        </div>
        <div class="carousel-item">
          <div class="card flex items-center justify-center font-semibold aspect-square text-4xl">4</div>
        </div>
        <div class="carousel-item">
          <div class="card flex items-center justify-center font-semibold aspect-square text-4xl">5</div>
        </div>
    </div>
  </div>
  <button type="button" class="btn btn-outline btn-icon carousel-prev" data-carousel-prev aria-label="Previous slide"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7"/></svg></button>
  <button type="button" class="btn btn-outline btn-icon carousel-next" data-carousel-next aria-label="Next slide"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button>
</div>
```

## Installation

The carousel runs on [Embla Carousel](https://www.embla-carousel.com), a dependency of htmx-ui that is loaded only on pages with a carousel. Plugins are separate packages; add the ones you use:

```bash bun
bun add embla-carousel-autoplay
```

```bash npm
npm install embla-carousel-autoplay
```

```bash pnpm
pnpm add embla-carousel-autoplay
```

```bash yarn
yarn add embla-carousel-autoplay
```

## Markup

- `.carousel[data-carousel]` holds a `.carousel-viewport` (it clips), a `.carousel-container` (it moves) and the `.carousel-item`s.
- `[data-carousel-prev]` and `[data-carousel-next]` buttons scroll, and disable themselves at the ends. Give them an `aria-label`.
- The behaviour marks the carousel as a region and each item as a slide ("2 of 5"); name the region with `aria-label`. `←` `→` scroll when focus is inside it.
- Without JavaScript the slides are a clipped row; give the viewport `overflow-x-auto` if they must stay reachable then.

## Item size

Items fill the viewport. Size them with `basis-*` utilities on the items (responsive ones too), or `--carousel-size` on the carousel for all of them.

```html
<div class="carousel w-full max-w-sm" data-carousel aria-label="Thirds" data-carousel-options='{"align": "start"}'>
  <div class="carousel-viewport">
    <div class="carousel-container">
        <div class="carousel-item basis-1/2 md:basis-1/3">
          <div class="card flex aspect-square items-center justify-center text-3xl font-semibold">1</div>
        </div>
        <div class="carousel-item basis-1/2 md:basis-1/3">
          <div class="card flex aspect-square items-center justify-center text-3xl font-semibold">2</div>
        </div>
        <div class="carousel-item basis-1/2 md:basis-1/3">
          <div class="card flex aspect-square items-center justify-center text-3xl font-semibold">3</div>
        </div>
        <div class="carousel-item basis-1/2 md:basis-1/3">
          <div class="card flex aspect-square items-center justify-center text-3xl font-semibold">4</div>
        </div>
        <div class="carousel-item basis-1/2 md:basis-1/3">
          <div class="card flex aspect-square items-center justify-center text-3xl font-semibold">5</div>
        </div>
        <div class="carousel-item basis-1/2 md:basis-1/3">
          <div class="card flex aspect-square items-center justify-center text-3xl font-semibold">6</div>
        </div>
    </div>
  </div>
  <button type="button" class="btn btn-outline btn-icon carousel-prev" data-carousel-prev aria-label="Previous slide"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7"/></svg></button>
  <button type="button" class="btn btn-outline btn-icon carousel-next" data-carousel-next aria-label="Next slide"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button>
</div>
```

## Spacing

`--carousel-gap` on the carousel sets the space between items (1rem by default). It is padding on each item, so Embla's snap points stay exact.

```html
<div class="carousel w-full max-w-sm [--carousel-gap:0.25rem] [--carousel-size:33.333%]" data-carousel aria-label="Tight" data-carousel-options='{"align": "start"}'>
  <div class="carousel-viewport">
    <div class="carousel-container">
        <div class="carousel-item">
          <div class="card flex items-center justify-center font-semibold aspect-square text-2xl">1</div>
        </div>
        <div class="carousel-item">
          <div class="card flex items-center justify-center font-semibold aspect-square text-2xl">2</div>
        </div>
        <div class="carousel-item">
          <div class="card flex items-center justify-center font-semibold aspect-square text-2xl">3</div>
        </div>
        <div class="carousel-item">
          <div class="card flex items-center justify-center font-semibold aspect-square text-2xl">4</div>
        </div>
        <div class="carousel-item">
          <div class="card flex items-center justify-center font-semibold aspect-square text-2xl">5</div>
        </div>
        <div class="carousel-item">
          <div class="card flex items-center justify-center font-semibold aspect-square text-2xl">6</div>
        </div>
        <div class="carousel-item">
          <div class="card flex items-center justify-center font-semibold aspect-square text-2xl">7</div>
        </div>
        <div class="carousel-item">
          <div class="card flex items-center justify-center font-semibold aspect-square text-2xl">8</div>
        </div>
    </div>
  </div>
  <button type="button" class="btn btn-outline btn-icon carousel-prev" data-carousel-prev aria-label="Previous slide"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7"/></svg></button>
  <button type="button" class="btn btn-outline btn-icon carousel-next" data-carousel-next aria-label="Next slide"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button>
</div>
```

## Orientation

`data-orientation="vertical"` scrolls up and down (Embla's `axis: "y"`); give the viewport a height. The buttons move above and below and turn, and `↑` `↓` scroll.

```html
<div class="carousel w-full max-w-xs" data-carousel data-orientation="vertical" aria-label="Vertical" data-carousel-options='{"align": "start"}'>
  <div class="carousel-viewport h-48">
    <div class="carousel-container">
        <div class="carousel-item basis-1/2">
          <div class="card flex h-full items-center justify-center text-3xl font-semibold">1</div>
        </div>
        <div class="carousel-item basis-1/2">
          <div class="card flex h-full items-center justify-center text-3xl font-semibold">2</div>
        </div>
        <div class="carousel-item basis-1/2">
          <div class="card flex h-full items-center justify-center text-3xl font-semibold">3</div>
        </div>
        <div class="carousel-item basis-1/2">
          <div class="card flex h-full items-center justify-center text-3xl font-semibold">4</div>
        </div>
        <div class="carousel-item basis-1/2">
          <div class="card flex h-full items-center justify-center text-3xl font-semibold">5</div>
        </div>
    </div>
  </div>
  <button type="button" class="btn btn-outline btn-icon carousel-prev" data-carousel-prev aria-label="Previous slide"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7"/></svg></button>
  <button type="button" class="btn btn-outline btn-icon carousel-next" data-carousel-next aria-label="Next slide"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button>
</div>
```

## Options

`data-carousel-options` takes [Embla's options](https://www.embla-carousel.com/api/options/) as JSON and passes them on: `loop`, `align`, `dragFree`, `slidesToScroll`, `startIndex`, `breakpoints` and the rest. Below: a loop that starts on the third slide. `.carousel-controls` puts the buttons in a row underneath, with an empty `[data-carousel-dots]` that fills with a dot per snap point.

```html
<div class="carousel w-full max-w-xs" data-carousel aria-label="Looping" data-carousel-options='{"loop": true, "startIndex": 2}'>
  <div class="carousel-viewport">
    <div class="carousel-container">
        <div class="carousel-item">
          <div class="card flex items-center justify-center font-semibold aspect-[4/3] text-4xl">1</div>
        </div>
        <div class="carousel-item">
          <div class="card flex items-center justify-center font-semibold aspect-[4/3] text-4xl">2</div>
        </div>
        <div class="carousel-item">
          <div class="card flex items-center justify-center font-semibold aspect-[4/3] text-4xl">3</div>
        </div>
        <div class="carousel-item">
          <div class="card flex items-center justify-center font-semibold aspect-[4/3] text-4xl">4</div>
        </div>
        <div class="carousel-item">
          <div class="card flex items-center justify-center font-semibold aspect-[4/3] text-4xl">5</div>
        </div>
    </div>
  </div>
  <div class="carousel-controls">
    <button type="button" class="btn btn-ghost btn-icon carousel-prev" data-carousel-prev aria-label="Previous slide"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg></button>
    <div class="carousel-dots" data-carousel-dots></div>
    <button type="button" class="btn btn-ghost btn-icon carousel-next" data-carousel-next aria-label="Next slide"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></button>
  </div>
</div>
```

## Plugins

Register an Embla plugin under a name once, in your entry script, then ask for it by that name with its options in `data-carousel-plugins`:

```ts app.ts
import Autoplay from "embla-carousel-autoplay";
import { initComponents, registerCarouselPlugin } from "htmx-ui";

registerCarouselPlugin("autoplay", Autoplay); // before initComponents()
```

```html
<div class="carousel w-full max-w-xs" data-carousel aria-label="Autoplay"
  data-carousel-options='{"loop": true}'
  data-carousel-plugins='{"autoplay": {"delay": 2500, "stopOnInteraction": false, "stopOnMouseEnter": true}}'>
  <div class="carousel-viewport">
    <div class="carousel-container">
        <div class="carousel-item">
          <div class="card flex items-center justify-center font-semibold aspect-[4/3] text-4xl">1</div>
        </div>
        <div class="carousel-item">
          <div class="card flex items-center justify-center font-semibold aspect-[4/3] text-4xl">2</div>
        </div>
        <div class="carousel-item">
          <div class="card flex items-center justify-center font-semibold aspect-[4/3] text-4xl">3</div>
        </div>
        <div class="carousel-item">
          <div class="card flex items-center justify-center font-semibold aspect-[4/3] text-4xl">4</div>
        </div>
        <div class="carousel-item">
          <div class="card flex items-center justify-center font-semibold aspect-[4/3] text-4xl">5</div>
        </div>
    </div>
  </div>
  <div class="carousel-dots" data-carousel-dots></div>
</div>
```

## API

For anything else, take [Embla's API](https://www.embla-carousel.com/api/) from the element once it has loaded:

```ts
import { getCarousel } from "htmx-ui";

const el = document.querySelector("#gallery")!;
el.addEventListener("carousel:init", (e) => {
  const api = (e as CustomEvent).detail.api; // same as getCarousel(el)
  api.scrollTo(3);
});
el.addEventListener("carousel:select", (e) => console.log("slide", (e as CustomEvent).detail.index));
```

## With htmx

A carousel swapped in by htmx initialises like any component. To add slides to one already running, swap them into its `.carousel-container`: Embla notices new slides and re-measures, and the dots and labels follow.

## Reference

| Class | Description |
| --- | --- |
| `.carousel` | The carousel; sets --carousel-gap (1rem) and --carousel-size (100%). |
| `.carousel-viewport` | Clips the slides; give it a height when vertical. |
| `.carousel-container` | The moving row (column when vertical). |
| `.carousel-item` | A slide; basis-* utilities set its size. |
| `.carousel-prev / .carousel-next` | Buttons beside the slides (above and below when vertical). |
| `.carousel-controls` | A row under the slides for buttons and dots. |
| `.carousel-dots / .carousel-dot` | Dot buttons, built in an empty [data-carousel-dots]. |
| `[data-carousel]` | Behaviour: starts Embla, buttons, dots, keys, labels. |
| `[data-orientation="vertical"]` | Scroll vertically (axis "y"). |
| `[data-carousel-options]` | Embla options as JSON. |
| `[data-carousel-plugins]` | Plugins by registered name, with their options, as JSON. |
| `registerCarouselPlugin(name, factory)` | Make an Embla plugin available by name. |
| `getCarousel(el)` | The Embla API of a carousel (after carousel:init). |
| `carousel:init / carousel:select` | Events: ready (detail.api), slide changed (detail.index). |
