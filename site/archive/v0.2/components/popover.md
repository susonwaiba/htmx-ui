---
title: "Popover"
description: "A floating panel of rich content, such as text or a small form, that opens from a button."
url: "/docs/v0.2/components/popover"
section: "Components"
---

# Popover

A floating panel of rich content, such as text or a small form, that opens from a button.

```html
<div class="popover" data-popover>
  <button class="btn btn-outline" data-popover-trigger aria-expanded="false">Open popover</button>
  <div class="popover-content" data-popover-content hidden>
    <div class="popover-header">
      <h2 class="popover-title">Title</h2>
      <p class="popover-description">Description text here.</p>
    </div>
  </div>
</div>
```

## Markup

- Wrap the trigger and panel in `.popover` with `data-popover`.
- The trigger gets `data-popover-trigger` and `aria-expanded="false"`. The behaviour links it to the panel with `aria-controls`.
- The panel gets `.popover-content`, `data-popover-content` and starts `hidden`.
- A `.popover-header` stacks a `.popover-title` (any heading level that fits the page) and a `.popover-description`, and spaces them from what follows.
- Focus stays on the trigger when it opens, unless an element in the panel has `autofocus`.
- For a list of actions, use a [dropdown](/docs/v0.2/components/dropdown) instead: it adds menu semantics and arrow-key navigation.

## Closing

`Esc` closes the popover and returns focus to the trigger. Clicking outside or tabbing out of it also closes it, and so does any button inside marked `data-popover-close` (see [With a form](#form)).

## Alignment

The panel opens below the trigger, aligned to its left edge (`.popover-content-start`, the default). `.popover-content-center` centres it on the trigger and `.popover-content-end` aligns it to the right edge: pick the one that keeps a panel wider than its trigger on screen.

```html
<div class="popover" data-popover>
  <button class="btn btn-outline btn-sm" data-popover-trigger aria-expanded="false">Start</button>
  <div class="popover-content popover-content-start w-48" data-popover-content hidden>
    <p class="popover-description mt-0">Aligned to the left edge of its trigger.</p>
  </div>
</div>
<div class="popover" data-popover>
  <button class="btn btn-outline btn-sm" data-popover-trigger aria-expanded="false">Center</button>
  <div class="popover-content popover-content-center w-48" data-popover-content hidden>
    <p class="popover-description mt-0">Aligned to the centre of its trigger.</p>
  </div>
</div>
<div class="popover" data-popover>
  <button class="btn btn-outline btn-sm" data-popover-trigger aria-expanded="false">End</button>
  <div class="popover-content popover-content-end w-48" data-popover-content hidden>
    <p class="popover-description mt-0">Aligned to the right edge of its trigger.</p>
  </div>
</div>
```

`.popover-content-up` opens it above instead, for a trigger near the bottom of the screen:

```html
<div class="popover" data-popover>
  <button class="btn btn-ghost btn-icon" data-popover-trigger aria-expanded="false" aria-label="About this metric"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg></button>
  <div class="popover-content popover-content-center popover-content-up w-60" data-popover-content hidden>
    <p class="popover-description mt-0">Active users counts everyone who signed in during the last 28 days.</p>
  </div>
</div>
```

## With a form

A panel can hold a whole form. Give the panel `role="dialog"` and point its `aria-labelledby` at the title so screen readers announce what opened, and put `autofocus` on the first field. A button with `data-popover-close` closes the panel and returns focus to the trigger; on the submit button the form still submits, so with htmx the request goes and the panel closes in one click.

```html
<div class="popover" data-popover>
  <button class="btn btn-outline" data-popover-trigger aria-expanded="false">Dimensions</button>
  <form class="popover-content w-80" data-popover-content role="dialog" aria-labelledby="pop-dim-title" hidden
        hx-post="/api/echo" hx-target="#pop-dim-result">
    <div class="popover-header">
      <h2 class="popover-title" id="pop-dim-title">Dimensions</h2>
      <p class="popover-description">Set the dimensions for the layer.</p>
    </div>
    <div class="field-group gap-3">
      <div class="field field-horizontal">
        <label class="label w-24" for="pop-width">Width</label>
        <input class="input input-sm" id="pop-width" name="width" value="100%" autofocus />
      </div>
      <div class="field field-horizontal">
        <label class="label w-24" for="pop-max-width">Max. width</label>
        <input class="input input-sm" id="pop-max-width" name="max-width" value="300px" />
      </div>
      <div class="field field-horizontal">
        <label class="label w-24" for="pop-height">Height</label>
        <input class="input input-sm" id="pop-height" name="height" value="25px" />
      </div>
      <div class="field field-horizontal">
        <label class="label w-24" for="pop-max-height">Max. height</label>
        <input class="input input-sm" id="pop-max-height" name="max-height" value="none" />
      </div>
    </div>
    <div class="popover-footer">
      <button type="button" class="btn btn-ghost btn-sm" data-popover-close>Cancel</button>
      <button class="btn btn-primary btn-sm" data-popover-close>Apply</button>
    </div>
  </form>
</div>
<p id="pop-dim-result" class="muted self-center" aria-live="polite"></p>
```

## Content from the server

The panel is an ordinary element, so htmx can fill it. This one loads its content the first time it's opened:

```html
<div class="popover" data-popover>
  <button class="btn btn-outline" data-popover-trigger aria-expanded="false"
          hx-get="/api/hello" hx-trigger="click once" hx-target="next [data-popover-content]">Server message</button>
  <div class="popover-content w-80 p-2" data-popover-content hidden><p class="p-2 muted">Loading…</p></div>
</div>
```

## Reference

| Class / attribute | Description |
| --- | --- |
| `.popover` | Positioning wrapper around the trigger and panel. Add data-popover. |
| `.popover-content` | The floating panel. Add data-popover-content and hidden. |
| `.popover-content-start / -center / -end` | Align the panel to the trigger's left edge (default), centre or right edge. |
| `.popover-content-up` | Open above the trigger. |
| `.popover-header` | Stacks the title and description, spaced from the content below. |
| `.popover-title` | Heading text in the panel. |
| `.popover-description` | Muted supporting text. |
| `.popover-footer` | Right-aligned row of buttons at the bottom of a form. |
| `[data-popover-close]` | Closes the panel and returns focus to the trigger. |
