---
title: "Label"
description: "An accessible label for a control: beside it, around a checkbox or radio, or as a whole choice card."
url: "/docs/v0.2/components/label"
section: "Components"
---

# Label

An accessible label for a control: beside it, around a checkbox or radio, or as a whole choice card.

```html
<label class="label">
  <input class="checkbox" type="checkbox" name="terms" />
  Accept terms and conditions
</label>
```

## Markup

- `.label` styles a `<label>`. Point it at its control with `for` and the control's `id`, or put the control inside it: either way clicking the text focuses or toggles the control, and screen readers read the text as its name.
- Around a [checkbox](/docs/v0.2/components/checkbox), [radio](/docs/v0.2/components/radio-group) or [switch](/docs/v0.2/components/switch), the label lines the box up with the first line of text and shows a pointer.
- A disabled control dims its label and shows the not-allowed cursor: wrapped in it, or as the label's sibling right before or after it.
- Use a real `<label>` for a form control. For something that isn't one — a custom [select](/docs/v0.2/components/select) trigger, a group — give the text an `id` and point the control's `aria-labelledby` at it.

## In a field

Inside a [field](/docs/v0.2/components/field), `.label` works like `.field-label`: it gets a red asterisk when the control is `required`, turns red with `aria-invalid="true"` and fades when the control is disabled.

```html
<div class="field max-w-sm">
  <label class="label" for="label-email">Email</label>
  <input class="input" id="label-email" type="email" placeholder="you@example.com" required aria-describedby="label-email-help" />
  <p class="field-description" id="label-email-help">We send the receipt here.</p>
</div>
```

## In a form

Labels in a `.field-group`, one per control. A label can hold more than text: an icon, or, beside it, a link that belongs to the field.

```html
<form class="field-group max-w-sm" onsubmit="return false">
  <div class="field">
    <label class="label" for="label-name"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Name</label>
    <input class="input" id="label-name" autocomplete="name" />
  </div>
  <div class="field">
    <div class="flex items-center justify-between">
      <label class="label" for="label-password">Password</label>
      <a class="link text-sm" href="#">Forgot it?</a>
    </div>
    <input class="input" id="label-password" type="password" autocomplete="current-password" aria-invalid="true" aria-describedby="label-password-error" />
    <p class="field-error" id="label-password-error"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/></svg> That password is not right.</p>
  </div>
  <div class="field field-horizontal">
    <input class="switch" type="checkbox" role="switch" id="label-remember" checked />
    <label class="label" for="label-remember">Remember me</label>
  </div>
  <button class="btn btn-primary w-full">Sign in</button>
</form>
```

## Checkbox, radio and switch

Wrapping the control in the label makes the text part of its hit area with no `for` or `id`. Long text wraps beside the box rather than under it.

```html
<label class="label">
  <input class="checkbox" type="checkbox" name="news" checked />
  Send me product news
</label>
<label class="label max-w-xs">
  <input class="checkbox" type="checkbox" name="digest" />
  Email me a weekly digest of everything that changed in the projects I follow
</label>
<fieldset class="flex flex-col gap-3">
  <legend class="label mb-3">Notify me about</legend>
  <label class="label"><input class="radio" type="radio" name="notify" value="all" checked /> All new messages</label>
  <label class="label"><input class="radio" type="radio" name="notify" value="mentions" /> Direct messages and mentions</label>
  <label class="label"><input class="radio" type="radio" name="notify" value="none" /> Nothing</label>
</fieldset>
<label class="label">
  <input class="switch" type="checkbox" role="switch" name="airplane" />
  Airplane mode
</label>
```

## Choice card

`.label-card` is a bordered label around a control and its text, highlighted while checked. Put the title and a `.label-description` in a `.label-content`: it fills the row, so a switch placed after it sits at the right edge.

```html
<div class="flex w-full max-w-sm flex-col gap-3">
  <label class="label-card">
    <input class="checkbox" type="checkbox" name="alerts" checked />
    <span class="label-content">
      Enable notifications
      <span class="label-description">You can turn them off again at any time.</span>
    </span>
  </label>
  <label class="label-card">
    <span class="label-content">
      Share usage data
      <span class="label-description">Anonymous statistics that help us improve.</span>
    </span>
    <input class="switch" type="checkbox" role="switch" name="telemetry" />
  </label>
  <label class="label-card">
    <input class="checkbox" type="checkbox" name="beta" disabled />
    <span class="label-content">
      Beta features
      <span class="label-description">Not available on the free plan.</span>
    </span>
  </label>
</div>
```

For a set of radio cards, [`.radio-card`](/docs/v0.2/components/radio-group) adds the group layout.

## Disabled

The label follows its control: no extra class.

```html
<label class="label"><input class="checkbox" type="checkbox" disabled /> Wrapped</label>
<div class="flex items-center gap-2">
  <input class="checkbox" type="checkbox" id="label-disabled" disabled />
  <label class="label" for="label-disabled">After the control</label>
</div>
<div class="flex flex-col gap-2">
  <label class="label" for="label-disabled-input">Before the control</label>
  <input class="input w-64" id="label-disabled-input" disabled value="Read only for now" />
</div>
```

## Reference

| Class | Description |
| --- | --- |
| `.label` | A label for a control. Around a checkbox, radio or switch it lines them up with the text. |
| `.label-card` | A bordered label around a control, tinted while checked, ringed while focused. |
| `.label-content` | Title and description beside the control in a card; fills the row. |
| `.label-description` | Muted supporting text in a card. |
