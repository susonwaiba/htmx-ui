---
title: "Popover"
description: "A floating panel of rich content, such as text or a small form, that opens from a button."
url: "/docs/v0.1/components/popover"
section: "Components"
---

# Popover

A floating panel of rich content, such as text or a small form, that opens from a button.

```html
<div class="popover" data-popover>
  <button class="btn btn-outline" data-popover-trigger aria-expanded="false">Dimensions</button>
  <div class="popover-content" data-popover-content hidden>
    <p class="popover-title">Dimensions</p>
    <p class="popover-description">Set the dimensions for the layer.</p>
    <div class="field-group mt-4 gap-3">
      <div class="field field-horizontal">
        <label class="field-label w-16" for="pop-width">Width</label>
        <input class="input input-sm" id="pop-width" value="100%" autofocus />
      </div>
      <div class="field field-horizontal">
        <label class="field-label w-16" for="pop-height">Height</label>
        <input class="input input-sm" id="pop-height" value="25px" />
      </div>
    </div>
  </div>
</div>
```

## Markup

- Wrap the trigger and panel in `.popover` with `data-popover`.
- The trigger gets `data-popover-trigger` and `aria-expanded="false"`. The behaviour links it to the panel with `aria-controls`.
- The panel gets `.popover-content`, `data-popover-content` and starts `hidden`.
- Focus stays on the trigger when it opens, unless an element in the panel has `autofocus`.
- For a list of actions, use a [dropdown](/docs/v0.1/components/dropdown) instead: it adds menu semantics and arrow-key navigation.

## Closing

`Esc` closes the popover and returns focus to the trigger. Clicking outside or tabbing out of it also closes it.

## Alignment

The panel opens below the trigger, aligned to its left edge. `.popover-content-center` and `.popover-content-end` align it to the centre or right edge; `.popover-content-up` opens it above.

```html
<div class="popover" data-popover>
  <button class="btn btn-ghost btn-icon" data-popover-trigger aria-expanded="false" aria-label="About this metric"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg></button>
  <div class="popover-content popover-content-center popover-content-up w-60" data-popover-content hidden>
    <p class="popover-description mt-0">Active users counts everyone who signed in during the last 28 days.</p>
  </div>
</div>
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

| Class | Description |
| --- | --- |
| `.popover` | Positioning wrapper around the trigger and panel. Add data-popover. |
| `.popover-content` | The floating panel. Add data-popover-content and hidden. |
| `.popover-content-center / -end` | Centre the panel on the trigger, or align it to the right edge. |
| `.popover-content-up` | Open above the trigger. |
| `.popover-title` | Heading text in the panel. |
| `.popover-description` | Muted supporting text. |
