---
title: "Accordion"
description: "A vertically stacked set of headings that each reveal a section of content. Built on <details>, so it works without JavaScript."
url: "/docs/v0.2/components/accordion"
section: "Components"
---

# Accordion

A vertically stacked set of headings that each reveal a section of content. Built on <details>, so it works without JavaScript.

```html
<div class="accordion max-w-lg">
  <details class="accordion-item" name="faq-basic" open>
    <summary class="accordion-trigger">Is it accessible?</summary>
    <div class="accordion-content">
      <p>Yes. It's a native <code>&lt;details&gt;</code> element, so keyboards and screen readers handle it out of the box.</p>
    </div>
  </details>
  <details class="accordion-item" name="faq-basic">
    <summary class="accordion-trigger">Does it need JavaScript?</summary>
    <div class="accordion-content">
      <p>No. Opening, closing and "one at a time" are all done by the browser. An optional behaviour fully locks disabled items.</p>
    </div>
  </details>
  <details class="accordion-item" name="faq-basic">
    <summary class="accordion-trigger">Can it load content from the server?</summary>
    <div class="accordion-content">
      <p>Yes, with htmx. See the example further down.</p>
    </div>
  </details>
</div>
```

## Markup

- Each item is a `<details class="accordion-item">` with a `<summary class="accordion-trigger">` heading and a `.accordion-content` body. Wrap the items in `.accordion`.
- Add `open` to an item to show it expanded on load.
- On older browsers that can't animate to `height: auto`, items open instantly instead of sliding.

## One open at a time

Give every item the same `name`. Opening one closes the others, as in the example above. Use a different name for each accordion on the page.

## Multiple open

Leave `name` out, and each item opens and closes on its own.

```html
<div class="accordion max-w-lg">
  <details class="accordion-item" open>
    <summary class="accordion-trigger">Shipping</summary>
    <div class="accordion-content"><p>Orders ship within two business days.</p></div>
  </details>
  <details class="accordion-item" open>
    <summary class="accordion-trigger">Returns</summary>
    <div class="accordion-content"><p>Return anything within 30 days for a full refund.</p></div>
  </details>
  <details class="accordion-item">
    <summary class="accordion-trigger">Warranty</summary>
    <div class="accordion-content"><p>Two years on every product, parts and labour.</p></div>
  </details>
</div>
```

## Disabled

Add `aria-disabled="true"` and `tabindex="-1"` to the summary: it fades, ignores pointer clicks and drops out of the tab order. Screen readers and scripts can still activate a `<summary>`, so also put `data-accordion` on the wrapper. Its one-line behaviour stops a disabled summary from opening its item.

```html
<div class="accordion max-w-lg" data-accordion>
  <details class="accordion-item" name="faq-disabled">
    <summary class="accordion-trigger">Available</summary>
    <div class="accordion-content"><p>This one opens.</p></div>
  </details>
  <details class="accordion-item" name="faq-disabled">
    <summary class="accordion-trigger" aria-disabled="true" tabindex="-1">Locked until you upgrade</summary>
    <div class="accordion-content"><p>Hidden content.</p></div>
  </details>
  <details class="accordion-item" name="faq-disabled">
    <summary class="accordion-trigger">Also available</summary>
    <div class="accordion-content"><p>So does this one.</p></div>
  </details>
</div>
```

## Borders

`.accordion-bordered` draws a box around the accordion. `.accordion-separated` gives each item its own box.

```html
<div class="accordion accordion-bordered max-w-lg">
  <details class="accordion-item" name="faq-bordered" open>
    <summary class="accordion-trigger">Billing</summary>
    <div class="accordion-content"><p>Invoices go out on the first of each month.</p></div>
  </details>
  <details class="accordion-item" name="faq-bordered">
    <summary class="accordion-trigger">Security</summary>
    <div class="accordion-content"><p>All data is encrypted at rest and in transit.</p></div>
  </details>
  <details class="accordion-item" name="faq-bordered">
    <summary class="accordion-trigger">Integrations</summary>
    <div class="accordion-content"><p>Connect over webhooks or the REST API.</p></div>
  </details>
</div>
<div class="accordion accordion-separated max-w-lg">
  <details class="accordion-item" name="faq-separated">
    <summary class="accordion-trigger">Separated item</summary>
    <div class="accordion-content"><p>Each item is its own box.</p></div>
  </details>
  <details class="accordion-item" name="faq-separated">
    <summary class="accordion-trigger">Another item</summary>
    <div class="accordion-content"><p>With space between them.</p></div>
  </details>
</div>
```

## Loading content with htmx

`<details>` fires a `toggle` event when it opens. `hx-trigger="toggle once"` fetches the body the first time the item is opened.

```html
<div class="accordion max-w-lg">
  <details class="accordion-item" hx-get="/api/hello" hx-trigger="toggle once" hx-target="find .accordion-content">
    <summary class="accordion-trigger">Server message</summary>
    <div class="accordion-content"><p>Loading…</p></div>
  </details>
</div>
```

## Reference

| Class | Description |
| --- | --- |
| `.accordion` | Wrapper around the items. Add data-accordion when any item is disabled. |
| `.accordion-item` | On <details>. Same name on several items: only one open at a time. |
| `.accordion-trigger` | On <summary>. Draws the chevron. aria-disabled="true" + tabindex="-1" disables it. |
| `.accordion-content` | The revealed body. |
| `.accordion-bordered` | Box around the whole accordion, with padded rows. |
| `.accordion-separated` | Each item in its own box. |
