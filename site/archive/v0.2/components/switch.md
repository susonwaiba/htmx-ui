---
title: "Switch"
description: "An on/off setting that takes effect at once: a sliding track on a real checkbox, so it submits with the form and needs no JavaScript."
url: "/docs/v0.2/components/switch"
section: "Components"
---

# Switch

An on/off setting that takes effect at once: a sliding track on a real checkbox, so it submits with the form and needs no JavaScript.

```html
<div class="field field-horizontal max-w-sm">
  <input class="switch" type="checkbox" role="switch" id="switch-digest" checked />
  <label class="field-label" for="switch-digest">Email me a digest every Monday</label>
</div>
```

A switch is for a preference you flip and forget: dark mode, notifications, autosave. It is a real `<input type="checkbox">` with `role="switch"`, so it takes a `name` and a `value`, submits with the form, is skipped by `Tab` when `disabled`, and screen readers announce it as "on" and "off" rather than "checked".

## Usage

- Add `.switch` and `role="switch"` to a checkbox input, and put the `id` its `.field-label` points at.
- Everything is the browser's: `checked`, `disabled`, `required`, and the `change` event. There is no behaviour to wire up.
- Wrap it in a [field](/docs/v0.2/components/field) with `.field-horizontal` so the label sits beside it, or use `.field-responsive` to stack them in a narrow container.

```html
<div class="field-group max-w-md">
  <div class="field field-horizontal">
    <input class="switch" type="checkbox" role="switch" id="switch-public" />
    <label class="field-label" for="switch-public">Public profile</label>
  </div>
  <div class="field field-horizontal">
    <input class="switch" type="checkbox" role="switch" id="switch-2fa" checked />
    <div class="field-content">
      <label class="field-label" for="switch-2fa">Two-factor authentication</label>
      <p class="field-description">Required for admin accounts.</p>
    </div>
  </div>
</div>
```

## Sizes

`.switch-sm` and `.switch-lg` match the height of `.input-sm` and `.input-lg`.

```html
<div class="field field-horizontal">
  <input class="switch switch-sm" type="checkbox" role="switch" id="switch-sm" checked />
  <label class="field-label text-xs" for="switch-sm">Small</label>
</div>
<div class="field field-horizontal">
  <input class="switch" type="checkbox" role="switch" id="switch-md" checked />
  <label class="field-label" for="switch-md">Default</label>
</div>
<div class="field field-horizontal">
  <input class="switch switch-lg" type="checkbox" role="switch" id="switch-lg" checked />
  <label class="field-label text-base" for="switch-lg">Large</label>
</div>
```

## States

### Disabled

`disabled` fades the switch; inside a field the label fades with it.

```html
<div class="field-group max-w-md">
  <div class="field field-horizontal">
    <input class="switch" type="checkbox" role="switch" id="switch-beta" disabled />
    <label class="field-label" for="switch-beta">Beta features</label>
  </div>
  <div class="field field-horizontal">
    <input class="switch" type="checkbox" role="switch" id="switch-sync" disabled checked />
    <div class="field-content">
      <label class="field-label" for="switch-sync">Sync with mobile</label>
      <p class="field-description">Coming back soon.</p>
    </div>
  </div>
</div>
```

### Error, warning, success

Set `aria-invalid="true"` for an error, which turns the border red and the field's label with it, or add `.switch-warning` or `.switch-success` for a track in those colours. Pair an error with a [field message](/docs/v0.2/components/field#messages) linked using `aria-describedby`.

```html
<div class="field-group max-w-md">
  <div class="field field-horizontal">
    <input class="switch" type="checkbox" role="switch" id="switch-terms" aria-invalid="true" aria-describedby="switch-terms-msg" />
    <div class="field-content">
      <label class="field-label" for="switch-terms">I accept the terms</label>
      <p class="field-error" id="switch-terms-msg"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/></svg> Turn this on to continue.</p>
    </div>
  </div>
  <div class="field field-horizontal">
    <input class="switch switch-warning" type="checkbox" role="switch" id="switch-quota" checked aria-describedby="switch-quota-msg" />
    <div class="field-content">
      <label class="field-label" for="switch-quota">Metered requests</label>
      <p class="field-warning" id="switch-quota-msg"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4M12 17h.01"/></svg> This may raise your bill.</p>
    </div>
  </div>
  <div class="field field-horizontal">
    <input class="switch switch-success" type="checkbox" role="switch" id="switch-backup" checked aria-describedby="switch-backup-msg" />
    <label class="field-label" for="switch-backup">Nightly backups</label>
    <p class="field-success" id="switch-backup-msg"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg> Last backup ran at 03:00.</p>
  </div>
</div>
```

## With htmx

A switch posts like any other checkbox: give it a `name` and trigger on `change`.

```html
<form class="field field-horizontal" onsubmit="return false" hx-post="/api/echo" hx-trigger="change" hx-target="#switch-result">
  <input class="switch" type="checkbox" role="switch" name="backups" value="on" id="switch-htmx" checked />
  <label class="field-label" for="switch-htmx">Nightly backups</label>
</form>
<p id="switch-result" class="muted" aria-live="polite"></p>
```

## Switch, checkbox or toggle?

| Use | When |
| --- | --- |
| [Switch](/docs/v0.2/components/switch) | A preference that applies the moment it is flipped. |
| [Checkbox](/docs/v0.2/components/checkbox) | Part of a form the user submits: terms, a list of choices, a confirmation. |
| [Toggle](/docs/v0.2/components/toggle) | A button that switches formatting or a view on the spot, like bold in a toolbar. |

## Reference

| Class / attribute | Description |
| --- | --- |
| `.switch` | The track and its sliding thumb. Add role="switch" to the input. |
| `.switch-sm / .switch-lg` | Matches the height of .input-sm / .input-lg. |
| `aria-invalid="true"` | Error border, and a red label in a field. So does :user-invalid. |
| `.switch-warning / .switch-success` | Warning or success track, for the on state. |
