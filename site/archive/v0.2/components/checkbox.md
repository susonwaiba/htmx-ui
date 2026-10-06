---
title: "Checkbox"
description: "A box that toggles between checked and not checked, with sizes, states and every field feature."
url: "/docs/v0.2/components/checkbox"
section: "Components"
---

# Checkbox

A box that toggles between checked and not checked, with sizes, states and every field feature.

```html
<div class="field field-horizontal max-w-sm">
  <input class="checkbox" type="checkbox" id="checkbox-reminders" checked />
  <label class="field-label" for="checkbox-reminders">Email me about new releases</label>
</div>
```

A [toggle](/docs/v0.2/components/toggle) is a button that switches something on or off on the spot. A checkbox is part of a form: it takes a `name` and a `value`, submits with the rest, and is reset by the form.

## Usage

- Add `.checkbox` to a native `<input type="checkbox">`. Everything else is plain HTML: `checked`, `required`, `name`, `value`, `disabled`.
- Wrap it in a [field](/docs/v0.2/components/field) with `.field-horizontal`: the box first, then `.field-content` holding the `.field-label` and an optional `.field-description`. The label is clickable, so give it the `for` that matches the box's `id`.
- Put related boxes in a `<fieldset class="fieldset">` with a `<legend class="field-legend">`, so a screen reader announces the group's question.
- A `required` checkbox must be checked to submit, and its label gets the field's asterisk.

```html
<fieldset class="fieldset max-w-md">
  <legend class="field-legend">Notifications</legend>
  <div class="field field-horizontal">
    <input class="checkbox" type="checkbox" id="checkbox-mentions" checked />
    <div class="field-content">
      <label class="field-label" for="checkbox-mentions">Mentions</label>
      <p class="field-description">When someone @mentions you.</p>
    </div>
  </div>
  <div class="field field-horizontal">
    <input class="checkbox" type="checkbox" id="checkbox-digest" />
    <label class="field-label" for="checkbox-digest">Weekly digest</label>
  </div>
</fieldset>
```

## Sizes

`.checkbox-sm` and `.checkbox-lg` match the heights of `.input-sm` and `.input-lg`.

```html
<div class="field field-horizontal">
  <input class="checkbox checkbox-sm" type="checkbox" id="checkbox-sm" aria-label="Small, checked" checked />
  <label class="field-label text-xs" for="checkbox-sm">Small</label>
</div>
<div class="field field-horizontal">
  <input class="checkbox" type="checkbox" id="checkbox-md" aria-label="Default, checked" checked />
  <label class="field-label" for="checkbox-md">Default</label>
</div>
<div class="field field-horizontal">
  <input class="checkbox checkbox-lg" type="checkbox" id="checkbox-lg" aria-label="Large, checked" checked />
  <label class="field-label text-base" for="checkbox-lg">Large</label>
</div>
```

## States

### Disabled

`disabled` fades the box; inside a field the label and description fade with it.

```html
<div class="field-group max-w-md">
  <div class="field field-horizontal">
    <input class="checkbox" type="checkbox" id="checkbox-archived" disabled checked />
    <label class="field-label" for="checkbox-archived">Archived</label>
  </div>
  <div class="field field-horizontal">
    <input class="checkbox" type="checkbox" id="checkbox-beta" disabled />
    <div class="field-content">
      <label class="field-label" for="checkbox-beta">Beta features</label>
      <p class="field-description">Available on the Pro plan.</p>
    </div>
  </div>
</div>
```

### Error, warning, success

Set `aria-invalid="true"` for an error, which turns the border red and the field's label with it, or add `.checkbox-warning` or `.checkbox-success` for the softer states. Pair each with a [field message](/docs/v0.2/components/field#messages) linked with `aria-describedby`.

```html
<div class="field-group max-w-md">
  <div class="field field-horizontal">
    <input class="checkbox" type="checkbox" id="checkbox-terms" aria-invalid="true" aria-describedby="checkbox-terms-msg" />
    <div class="field-content">
      <label class="field-label" for="checkbox-terms">I accept the terms</label>
      <p class="field-error" id="checkbox-terms-msg"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/></svg> You must accept the terms to continue.</p>
    </div>
  </div>
  <div class="field field-horizontal">
    <input class="checkbox checkbox-warning" type="checkbox" id="checkbox-2fa" checked aria-describedby="checkbox-2fa-msg" />
    <div class="field-content">
      <label class="field-label" for="checkbox-2fa">Two-factor authentication</label>
      <p class="field-warning" id="checkbox-2fa-msg"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4M12 17h.01"/></svg> Highly recommended for admin accounts.</p>
    </div>
  </div>
  <div class="field field-horizontal">
    <input class="checkbox checkbox-success" type="checkbox" id="checkbox-strong" checked aria-describedby="checkbox-strong-msg" />
    <label class="field-label" for="checkbox-strong">Use a strong password</label>
    <p class="field-success" id="checkbox-strong-msg"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg> Done.</p>
  </div>
</div>
```

## Partly selected

A box that controls a group is **indeterminate** when some, but not all, of its children are checked. The state is a DOM property rather than an attribute, so markup it with `data-indeterminate`: a small behaviour sets it on load, paints a dash instead of the tick, and clears it when you click the box.

```html
<fieldset class="fieldset max-w-md">
  <legend class="field-legend">Services to monitor</legend>
  <div class="field field-horizontal">
    <input class="checkbox" type="checkbox" id="checkbox-all" data-indeterminate />
    <label class="field-label" for="checkbox-all">All services</label>
  </div>
  <div class="field field-horizontal ps-6">
    <input class="checkbox checkbox-sm" type="checkbox" id="checkbox-api" checked />
    <label class="field-label" for="checkbox-api">API</label>
  </div>
  <div class="field field-horizontal ps-6">
    <input class="checkbox checkbox-sm" type="checkbox" id="checkbox-worker" checked />
    <label class="field-label" for="checkbox-worker">Worker</label>
  </div>
  <div class="field field-horizontal ps-6">
    <input class="checkbox checkbox-sm" type="checkbox" id="checkbox-db" />
    <label class="field-label" for="checkbox-db">Database</label>
  </div>
</fieldset>
```

Nothing checks the children for you: that is server state, so keep the box in step in your own code, or read the children on `change` and set the property:

```js app.js
const all = document.querySelector("#all");
const children = [...document.querySelectorAll("[data-child]")];

const sync = () => {
  const checked = children.filter((box) => box.checked).length;
  all.indeterminate = checked > 0 && checked < children.length;
  all.checked = checked === children.length;
};

all.addEventListener("change", () => children.forEach((box) => (box.checked = all.checked)));
children.forEach((box) => box.addEventListener("change", sync));
```

## With htmx

Checkboxes submit like any other input, so trigger on `change` and send the state in `hx-vals`:

```html
<div class="field field-horizontal">
  <input class="checkbox" type="checkbox" id="checkbox-star" name="starred"
         hx-post="/api/echo" hx-trigger="change" hx-vals='js:{starred: this.checked}' hx-target="#checkbox-result" />
  <label class="field-label" for="checkbox-star">Star this repository</label>
</div>
<p id="checkbox-result" class="muted" aria-live="polite"></p>
```

## Nunjucks macro

If your templates use Nunjucks, the `checkbox` macro writes the field markup, with the description optional and every attribute passed through `attrs`:

```jinja page.html
{% from "components/checkbox/checkbox.html" import checkbox %}

{{ checkbox("terms", "I accept the terms", required=true) }}
{{ checkbox("digest", "Weekly digest", description="A summary every Monday.", checked=true) }}
{{ checkbox("alerts", "Deploy alerts", size="sm", state="warning", attrs='hx-post="/api/settings"') }}
```

## Reference

| Class / attribute | Description |
| --- | --- |
| `.checkbox` | Native checkbox. Take checked, name, value, required and disabled as usual. |
| `.checkbox-sm / -lg` | Matches the height of .input-sm / .input-lg. |
| `data-indeterminate` | Paints the mixed state (behaviour: checkbox.ts); cleared when the box is clicked. |
| `aria-invalid="true"` | Error border, and a red label in a field. So does :user-invalid. |
| `.checkbox-warning / -success` | Warning or success border. |
| `checkbox(id, label, …)` | Macro: the whole field. description, checked, indeterminate, disabled, required, size, state, attrs. |
