---
title: "Loader"
description: "Pure-CSS loading indicators in eight styles, from bouncing dots and waves to shimmering text, tuned with custom properties."
url: "/docs/v0.2/components/loader"
section: "Components"
---

# Loader

Pure-CSS loading indicators in eight styles, from bouncing dots and waves to shimmering text, tuned with custom properties.

```html
<div class="grid w-full grid-cols-2 gap-8 sm:grid-cols-4">
  <div class="flex flex-col items-center gap-3">
    <div class="flex h-8 items-center"><span class="loader loader-pulse" role="status" aria-label="Loading"></span></div>
    <span class="text-xs text-muted-foreground">pulse</span>
  </div>
  <div class="flex flex-col items-center gap-3">
    <div class="flex h-8 items-center"><span class="loader loader-pulse-dot" role="status" aria-label="Loading"></span></div>
    <span class="text-xs text-muted-foreground">pulse-dot</span>
  </div>
  <div class="flex flex-col items-center gap-3">
    <div class="flex h-8 items-center"><span class="loader loader-dots" role="status"><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span><span class="sr-only">Loading</span></span></div>
    <span class="text-xs text-muted-foreground">dots</span>
  </div>
  <div class="flex flex-col items-center gap-3">
    <div class="flex h-8 items-center"><span class="loader loader-typing" role="status"><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span><span class="sr-only">Loading</span></span></div>
    <span class="text-xs text-muted-foreground">typing</span>
  </div>
  <div class="flex flex-col items-center gap-3">
    <div class="flex h-8 items-center"><span class="loader loader-wave" role="status"><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span><span class="sr-only">Loading</span></span></div>
    <span class="text-xs text-muted-foreground">wave</span>
  </div>
  <div class="flex flex-col items-center gap-3">
    <div class="flex h-8 items-center"><span class="loader loader-text-blink" role="status">Loading</span></div>
    <span class="text-xs text-muted-foreground">text-blink</span>
  </div>
  <div class="flex flex-col items-center gap-3">
    <div class="flex h-8 items-center"><span class="loader loader-text-shimmer" role="status">Loading</span></div>
    <span class="text-xs text-muted-foreground">text-shimmer</span>
  </div>
  <div class="flex flex-col items-center gap-3">
    <div class="flex h-8 items-center"><span class="loader loader-loading-dots" role="status">Loading<span aria-hidden="true">.</span><span aria-hidden="true">.</span><span aria-hidden="true">.</span></span></div>
    <span class="text-xs text-muted-foreground">loading-dots</span>
  </div>
</div>
```

## Markup

- A loader is `.loader` plus one variant class. It needs no JavaScript: every variant is drawn and animated with CSS.
- Dots and bars are empty child `<span>`s (three for `.loader-dots` and `.loader-typing`, five for `.loader-wave`), each `aria-hidden="true"`. The pulse variants have no children: the element itself is the shape.
- Give the loader `role="status"` and an accessible name: `aria-label`, or `<span class="sr-only">` text after the dots. The text variants show their own text, which is read out.
- The [`loader()` macro](#macro) writes all of this for you.

```html
<span class="loader loader-dots" role="status">
  <span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span>
  <span class="sr-only">Loading</span>
</span>
```

## Shapes

`.loader-pulse` is a ring that breathes in and out; `.loader-pulse-dot` a single dot. `.loader-dots` bounces three dots, `.loader-typing` fades them in turn like a chat typing indicator, and `.loader-wave` raises and lowers a row of bars.

```html
<span class="loader loader-pulse" role="status" aria-label="Loading"></span>
<span class="loader loader-pulse-dot" role="status" aria-label="Loading"></span>
<span class="loader loader-dots" role="status"><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span><span class="sr-only">Loading</span></span>
<span class="loader loader-typing" role="status"><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span><span class="sr-only">Assistant is typing</span></span>
<span class="loader loader-wave" role="status"><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span><span class="sr-only">Loading</span></span>
```

## Text

The text variants animate the words themselves, in the muted text colour at the surrounding font size. `.loader-text-blink` fades the text in and out, `.loader-text-shimmer` sweeps a light band across it, and `.loader-loading-dots` writes an ellipsis one dot at a time.

```html
<span class="loader loader-text-blink" role="status">Fetching results</span>
<span class="loader loader-text-shimmer" role="status">Thinking about your question</span>
<span class="loader loader-loading-dots" role="status">Generating<span aria-hidden="true">.</span><span aria-hidden="true">.</span><span aria-hidden="true">.</span></span>
```

## Sizes

`.loader-sm` and `.loader-lg` make the shapes 12px and 24px tall instead of 16px, and set the text variants in `text-xs` and `text-base`. For any other size set `--loader-size`; dots and bars are sized from it.

```html
<div class="flex items-center gap-8">
  <span class="loader loader-dots loader-sm" role="status"><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span><span class="sr-only">Loading</span></span>
  <span class="loader loader-dots" role="status"><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span><span class="sr-only">Loading</span></span>
  <span class="loader loader-dots loader-lg" role="status"><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span><span class="sr-only">Loading</span></span>
  <span class="loader loader-dots [--loader-size:2.5rem]" role="status"><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span><span class="sr-only">Loading</span></span>
</div>
<div class="flex items-center gap-8">
  <span class="loader loader-wave loader-sm" role="status"><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span><span class="sr-only">Loading</span></span>
  <span class="loader loader-wave" role="status"><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span><span class="sr-only">Loading</span></span>
  <span class="loader loader-wave loader-lg" role="status"><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span><span class="sr-only">Loading</span></span>
  <span class="loader loader-wave [--loader-size:2.5rem]" role="status"><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span><span class="sr-only">Loading</span></span>
</div>
<div class="flex items-center gap-8">
  <span class="loader loader-text-shimmer loader-sm" role="status">Small</span>
  <span class="loader loader-text-shimmer" role="status">Default</span>
  <span class="loader loader-text-shimmer loader-lg" role="status">Large</span>
</div>
```

## Customisation

Every variant reads its look from custom properties on the `.loader`. Set them in a `style` attribute, or with Tailwind's arbitrary properties such as `[--loader-duration:2s]`.

- `--loader-size`: the height of the shapes (`1rem`).
- `--loader-duration`: one cycle of the animation (`1.2s`; the text variants `2s`, loading dots `1.4s`). The dots' and bars' stagger follows it.
- `--loader-color`: the colour. Shapes use the current text colour, so `text-*` utilities work too; the text variants default to `muted-foreground`.
- `--loader-highlight` and `--loader-spread`: the colour of the shimmer's light band (`foreground`) and its half-width, as a share of the sweep (`20%`).

### Speed

```html
<span class="loader loader-wave" role="status" style="--loader-duration: 0.6s"><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span><span class="sr-only">Loading</span></span>
<span class="loader loader-wave" role="status"><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span><span class="sr-only">Loading</span></span>
<span class="loader loader-wave" role="status" style="--loader-duration: 2.4s"><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span><span class="sr-only">Loading</span></span>
```

### Colour

```html
<span class="loader loader-pulse text-primary" role="status" aria-label="Loading"></span>
<span class="loader loader-pulse-dot text-success" role="status" aria-label="Loading"></span>
<span class="loader loader-dots text-warning" role="status"><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span><span class="sr-only">Loading</span></span>
<span class="loader loader-typing text-muted-foreground" role="status"><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span><span class="sr-only">Loading</span></span>
<span class="loader loader-wave text-danger" role="status"><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span><span class="sr-only">Loading</span></span>
<span class="loader loader-text-blink [--loader-color:var(--primary)]" role="status">Saving</span>
```

### Shimmer band

A wider `--loader-spread` softens the band; a contrasting `--loader-highlight` tints it.

```html
<span class="loader loader-text-shimmer" role="status" style="--loader-spread: 8%">A narrow, sharp band</span>
<span class="loader loader-text-shimmer" role="status" style="--loader-spread: 40%">A wide, soft band</span>
<span class="loader loader-text-shimmer" role="status" style="--loader-highlight: var(--primary)">Tinted with the primary colour</span>
```

> With `prefers-reduced-motion` set, nothing moves: every variant fades its opacity slowly instead, so the loader still reads as busy.

## In a button

Shapes sit in a `.btn` like an icon. When the button text already says what's happening, pass `label=none` so the loader is hidden from screen readers.

```html
<button class="btn btn-primary" aria-busy="true"><span class="loader loader-dots loader-sm" aria-hidden="true"><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span></span> Sending</button>
<button class="btn btn-outline" disabled><span class="loader loader-wave loader-sm" aria-hidden="true"><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span></span> Processing</button>
<button class="btn btn-secondary" aria-busy="true"><span class="loader loader-pulse-dot loader-sm" aria-hidden="true"></span> Recording</button>
```

## With htmx requests

Add `.htmx-indicator` to show a loader only while a request runs. Inside a button it takes no space until then, and `.htmx-indicator-hide` swaps out an icon for it, as with the [spinner](/docs/v0.2/components/spinner#htmx).

```html
<div class="flex flex-wrap items-center gap-3">
  <button class="btn btn-primary" hx-post="/api/slow" hx-target="#loader-result" hx-disable="this">
    <span class="loader loader-dots loader-sm htmx-indicator" aria-hidden="true"><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span></span> Save
  </button>
  <button class="btn btn-outline" hx-post="/api/slow" hx-target="#loader-result" hx-disable="this" hx-indicator="#loader-status">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg> Refresh
  </button>
  <span class="loader loader-loading-dots htmx-indicator" role="status" id="loader-status">Refreshing<span aria-hidden="true">.</span><span aria-hidden="true">.</span><span aria-hidden="true">.</span></span>
</div>
<p id="loader-result" class="muted" aria-live="polite"></p>
```

> The `/api/slow` endpoint is a mock that only exists under `bun run dev`.

## Macro

`loader()` writes the variant's children, `role="status"` and the accessible name. Shapes are read out as `label`; text variants show `text` (or the label) and are read as it.

```jinja
{% from "components/loader/loader.html" import loader %}

{{ loader() }}                                       {# three bouncing dots, "Loading" #}
{{ loader("wave", size="lg", label="Uploading") }}
{{ loader("text-shimmer", text="Thinking") }}
{{ loader("pulse", label=none) }}                     {# decorative #}
{{ loader("typing", class="htmx-indicator", attrs={"id": "typing"}) }}
```

## Reference

| Class | Description |
| --- | --- |
| `.loader` | The base: an inline flex box that holds the custom properties below. |
| `.loader-pulse` | A ring breathing in and out. |
| `.loader-pulse-dot` | A single pulsing dot. |
| `.loader-dots` | Three bouncing dots (three child spans). |
| `.loader-typing` | Three dots fading in turn, a typing indicator (three child spans). |
| `.loader-wave` | Bars rising and falling (five child spans). |
| `.loader-text-blink` | Text fading in and out. |
| `.loader-text-shimmer` | Text with a light band sweeping across it. |
| `.loader-loading-dots` | Text followed by "..." written one dot at a time (three child spans). |
| `.loader-sm / .loader-lg` | 12px or 24px shapes; text-xs or text-base text. |
| `--loader-size` | The height of the shapes (1rem). |
| `--loader-duration` | One animation cycle (1.2s; text 2s, loading dots 1.4s). |
| `--loader-color` | The colour (currentColor; text variants muted-foreground). |
| `--loader-highlight / --loader-spread` | The shimmer band's colour (foreground) and half-width (20%). |

| Macro | Description |
| --- | --- |
| `loader(variant="dots", text=none, size=none, label="Loading", class="", attrs=none)` | Writes a loader. label=none hides a shape from assistive technology; text sets a text variant's words. |
