---
title: "Field"
description: "Labels, descriptions, help and error messages for form controls, and layouts for whole forms: stacked, inline, responsive and grid."
url: "/docs/v0.1/components/field"
section: "Components"
---

# Field

Labels, descriptions, help and error messages for form controls, and layouts for whole forms: stacked, inline, responsive and grid.

```html
<form class="field-group max-w-md" onsubmit="return false">
  <div class="field">
    <label class="field-label" for="field-email">Email</label>
    <input class="input" id="field-email" type="email" placeholder="you@example.com" required aria-describedby="field-email-help" />
    <p class="field-description" id="field-email-help">We'll only use this to send receipts.</p>
  </div>
  <div class="field">
    <label class="field-label" for="field-bio">Bio <span class="badge badge-outline">Optional</span></label>
    <textarea class="textarea" id="field-bio" placeholder="A sentence or two about you"></textarea>
  </div>
  <button class="btn btn-primary w-fit">Save</button>
</form>
```

## Anatomy

- `.field` wraps one control with its `.field-label` and any `.field-description` or message, stacked.
- Link the description and messages to the control with `aria-describedby`, so screen readers read them with it.
- Stack fields in a `.field-group`, and group related ones in a `<fieldset class="fieldset">` with a `<legend class="field-legend">`.

## Description and help

A `.field-description` can sit above or below the control. Links inside it are underlined.

```html
<div class="field max-w-sm">
  <label class="field-label" for="field-key">API key</label>
  <p class="field-description" id="field-key-help-top">Create one in your account settings.</p>
  <input class="input" id="field-key" placeholder="sk_live_…" aria-describedby="field-key-help-top field-key-help" />
  <p class="field-description" id="field-key-help">Keep it secret. <a href="#rotate">How to rotate keys</a>.</p>
</div>
```

## Required

The label gets a red asterisk when the field holds a `required` control. For a control that can't carry `required`, add `.field-label-required` to the label instead.

```html
<div class="field-group max-w-sm">
  <div class="field">
    <label class="field-label" for="field-required">Full name</label>
    <input class="input" id="field-required" required />
  </div>
  <div class="field">
    <span class="field-label field-label-required" id="field-plan-label">Plan</span>
    <div class="toggle-group btn-group" role="group" aria-labelledby="field-plan-label" data-toggle-group="single" data-toggle-group-required>
      <button type="button" class="btn btn-outline" aria-pressed="true" value="free">Free</button>
      <button type="button" class="btn btn-outline" aria-pressed="false" value="pro">Pro</button>
    </div>
  </div>
</div>
```

## Messages

`.field-error`, `.field-warning` and `.field-success` colour a message and size a leading icon. A field with an `aria-invalid="true"` control turns its label red. Several errors can go in a list.

```html
<div class="field max-w-sm">
  <label class="field-label" for="field-password">Password</label>
  <input class="input" id="field-password" type="password" value="abc" aria-invalid="true" aria-describedby="field-password-error" />
  <div class="field-error" id="field-password-error">
    <ul>
      <li>At least 8 characters</li>
      <li>At least one number</li>
    </ul>
  </div>
</div>
```

## Disabled

When the control is `disabled`, the label and description fade with it.

```html
<div class="field max-w-sm">
  <label class="field-label" for="field-disabled">Workspace URL</label>
  <input class="input" id="field-disabled" value="acme.example.com" disabled aria-describedby="field-disabled-help" />
  <p class="field-description" id="field-disabled-help">Contact an admin to change it.</p>
</div>
```

## Inline

`.field-horizontal` puts the label beside the control. Inputs, selects and groups take the remaining width. Give labels a fixed width (`w-24`) to line them up.

```html
<div class="field-group max-w-md">
  <div class="field field-horizontal">
    <label class="field-label w-24 shrink-0" for="field-first">First name</label>
    <input class="input" id="field-first" />
  </div>
  <div class="field field-horizontal">
    <label class="field-label w-24 shrink-0" for="field-role">Role</label>
    <select class="select" id="field-role"><option>Developer</option><option>Designer</option></select>
  </div>
</div>
```

### Checkboxes and radios

Put the control first. Wrap the label and a description in `.field-content` to stack them beside it. Native checkboxes take the brand colour with the `accent-primary` utility.

```html
<fieldset class="fieldset max-w-md">
  <legend class="field-legend">Notifications</legend>
  <div class="field field-horizontal">
    <input class="size-4 accent-primary" type="checkbox" id="field-mentions" checked />
    <div class="field-content">
      <label class="field-label" for="field-mentions">Mentions</label>
      <p class="field-description">When someone @mentions you.</p>
    </div>
  </div>
  <div class="field field-horizontal">
    <input class="size-4 accent-primary" type="checkbox" id="field-digest" />
    <label class="field-label" for="field-digest">Weekly digest</label>
  </div>
</fieldset>
```

## Responsive

`.field-responsive` stacks the label above the control in a narrow container and puts them side by side once the surrounding `.field-group` is at least 28rem wide. It reacts to the group's width, not the viewport's, so it also works in sidebars and dialogs. Resize the window to see it.

```html
<div class="field-group max-w-2xl">
  <div class="field field-responsive">
    <div class="field-content">
      <label class="field-label" for="field-r-name">Display name</label>
      <p class="field-description">Shown on your profile.</p>
    </div>
    <input class="input" id="field-r-name" placeholder="Ada" />
  </div>
  <div class="field field-responsive">
    <div class="field-content">
      <label class="field-label" for="field-r-email">Email</label>
      <p class="field-description">For sign-in and receipts.</p>
    </div>
    <input class="input" id="field-r-email" type="email" required />
  </div>
</div>
```

## Grid

`.field-grid` lays fields out in two columns from the `sm` breakpoint. Span a field across both with `sm:col-span-2`.

```html
<form class="fieldset max-w-lg" onsubmit="return false">
  <legend class="field-legend">Shipping address</legend>
  <p class="field-description">Where should we send your order?</p>
  <div class="field-grid">
    <div class="field">
      <label class="field-label" for="field-g-first">First name</label>
      <input class="input" id="field-g-first" required />
    </div>
    <div class="field">
      <label class="field-label" for="field-g-last">Last name</label>
      <input class="input" id="field-g-last" required />
    </div>
    <div class="field sm:col-span-2">
      <label class="field-label" for="field-g-street">Street</label>
      <input class="input" id="field-g-street" />
    </div>
    <div class="field">
      <label class="field-label" for="field-g-city">City</label>
      <input class="input" id="field-g-city" />
    </div>
    <div class="field">
      <label class="field-label" for="field-g-country">Country</label>
      <select class="select" id="field-g-country"><option>Australia</option><option>New Zealand</option></select>
    </div>
  </div>
</form>
```

## With input and button groups

```html
<div class="field-group max-w-sm">
  <div class="field">
    <label class="field-label" for="field-site">Website</label>
    <div class="input-group">
      <input class="input" id="field-site" placeholder="example.com" aria-describedby="field-site-help" />
      <span class="input-group-addon">https://</span>
    </div>
    <p class="field-description" id="field-site-help">Your public homepage.</p>
  </div>
  <div class="field">
    <label class="field-label" for="field-invite">Invite by email</label>
    <div class="btn-group w-full" role="group" aria-label="Invite">
      <input class="input" id="field-invite" type="email" placeholder="teammate@example.com" />
      <button class="btn btn-outline">Send invite</button>
    </div>
  </div>
</div>
```

## Separator

`.field-separator` divides sections of a form, with optional text.

```html
<div class="field-group max-w-sm">
  <button class="btn btn-outline w-full">Continue with GitHub</button>
  <div class="field-separator">Or continue with</div>
  <div class="field">
    <label class="field-label" for="field-sep-email">Email</label>
    <input class="input" id="field-sep-email" type="email" />
  </div>
</div>
```

## Reference

| Class | Description |
| --- | --- |
| `.field` | One control with its label and messages, stacked. |
| `.field-horizontal` | Label beside the control. |
| `.field-responsive` | Stacked, then side by side once the .field-group is 28rem wide. |
| `.field-label` | Label text. Gets an asterisk when the field holds a required control. |
| `.field-label-required` | Forces the asterisk. |
| `.field-content` | Stacks a label and description beside a control in horizontal fields. |
| `.field-description` | Muted help text, above or below the control. |
| `.field-error / -warning / -success` | Coloured message with an optional leading icon or list. |
| `.field-group` | Vertical stack of fields; the container .field-responsive measures. |
| `.field-grid` | Two columns of fields from the sm breakpoint. |
| `.fieldset / .field-legend` | Group of related fields with a heading. |
| `.field-separator` | Horizontal rule with optional centred text. |
