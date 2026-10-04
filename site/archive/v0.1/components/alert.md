---
title: "Alert"
description: "A callout for information the reader should notice: tips, confirmations, warnings and errors."
url: "/docs/v0.1/components/alert"
section: "Components"
---

# Alert

A callout for information the reader should notice: tips, confirmations, warnings and errors.

```html
<div class="alert" role="status">
  <div class="alert-title">Heads up</div>
  <div class="alert-description">You can add components to your app using the CLI.</div>
</div>
```

## Variants with icons

Put an `<svg>` first and the text lines up beside it. Variant classes tint the border, background, icon and title.

```html
<div class="alert alert-info" role="status">
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
  <div class="alert-title">New version available</div>
  <div class="alert-description">v0.1.0 adds dark mode and five new components.</div>
</div>
<div class="alert alert-success" role="status">
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
  <div class="alert-title">Payment received</div>
  <div class="alert-description">A receipt is on its way to your inbox.</div>
</div>
<div class="alert alert-warning" role="status">
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4M12 17h.01"/></svg>
  <div class="alert-title">Your trial ends in 3 days</div>
  <div class="alert-description">Add a payment method to keep your projects online.</div>
</div>
<div class="alert alert-danger" role="alert">
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/></svg>
  <div class="alert-title">Deploy failed</div>
  <div class="alert-description">The build exited with code 1. Check the logs for details.</div>
</div>
```

## Dismissible

Add `data-dismissible` to the alert and `data-dismiss` to a button inside it. Clicking the button removes the alert. This also works for alerts that arrive in htmx fragments.

```html
<div class="alert alert-info" role="status" data-dismissible>
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
  <div class="alert-title">Cookies</div>
  <div class="alert-description">We only use essential cookies.</div>
  <button type="button" class="alert-close" data-dismiss aria-label="Dismiss"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
</div>
```

## Nunjucks macro

If your templates use Nunjucks, the `alert` macro picks the icon and ARIA role for you:

```jinja page.html
{% from "components/alert/alert.html" import alert %}

{% call alert("Deploy failed", variant="danger", dismissible=true) %}
  The build exited with code 1.
{% endcall %}
```

## Accessibility

- Use `role="alert"` for urgent, time-sensitive messages (screen readers announce it right away), and `role="status"` for everything else.
- Give icon-only close buttons an `aria-label`.

## Reference

| Class | Description |
| --- | --- |
| `.alert` | Container. A leading <svg> becomes the icon column. |
| `.alert-title` | Bold first line. |
| `.alert-description` | Body text in the muted colour. |
| `.alert-info / -success / -warning / -danger` | Status tint for border, background, icon and title. |
| `.alert-close` | Top-right close button. Pair with data-dismiss. |
| `[data-dismissible] + [data-dismiss]` | Behaviour: clicking [data-dismiss] removes the [data-dismissible] element. |
