---
title: "Radio group"
description: "A set of radio buttons: pick one option of a few, on a card or inline, submitting with the form."
url: "/docs/v0.2/components/radio-group"
section: "Components"
---

# Radio group

A set of radio buttons: pick one option of a few, on a card or inline, submitting with the form.

```html
<fieldset class="fieldset max-w-lg">
  <legend class="field-legend">Plan</legend>
  <div class="radio-group">
    <label class="radio-card">
      <input class="radio" type="radio" name="radio-plan" value="free" checked />
      <span class="radio-content">
        <span class="radio-title">Free</span>
        <span class="radio-description">One project, community support.</span>
      </span>
    </label>
    <label class="radio-card">
      <input class="radio" type="radio" name="radio-plan" value="pro" />
      <span class="radio-content">
        <span class="radio-title">Pro</span>
        <span class="radio-description">Unlimited projects, email support.</span>
      </span>
    </label>
    <label class="radio-card">
      <input class="radio" type="radio" name="radio-plan" value="team" />
      <span class="radio-content">
        <span class="radio-title">Team</span>
        <span class="radio-description">Shared workspaces and invoicing.</span>
      </span>
    </label>
  </div>
</fieldset>
```

A radio group is for a choice between a few options that are all worth showing at once. Every option is a native `<input type="radio">`, so the browser enforces the whole contract for free: one is checked at a time, the arrow keys move between them, `Space` picks, and the value submits with the form. There is no behaviour to wire up.

## Markup

- Put the options in a `<fieldset class="fieldset">` with a `<legend class="field-legend">`, so a screen reader announces the question before each option.
- Give every radio the same `name` — that is what makes them one group — and a `value` for the form.
- A `.radio` is the dot; a `.radio-card` wraps it, the text and a description in one clickable block. The card is a `<label>`, so clicking the text picks the option too.
- Mark the starting option with `checked`, and put `required` on one of them to make a choice necessary.

## Inline

When an option is just a short word, skip the card: a bare `.radio` in a [field](/docs/v0.2/components/field) with `.field-horizontal`, like a checkbox.

```html
<fieldset class="fieldset w-36">
  <legend class="field-legend">Invoice</legend>
  <div class="field-group">
    <div class="field field-horizontal">
      <input class="radio" type="radio" name="radio-invoice" id="radio-invoice-card" value="card" checked />
      <label class="field-label" for="radio-invoice-card">Charge a card</label>
    </div>
    <div class="field field-horizontal">
      <input class="radio" type="radio" name="radio-invoice" id="radio-invoice-invoice" value="invoice" />
      <label class="field-label" for="radio-invoice-invoice">Send an invoice (net 30)</label>
    </div>
  </div>
</fieldset>
```

## Layouts

`.radio-group` stacks the options; `.radio-group-row` puts them side by side from the `sm` breakpoint, each taking an equal share, so the row below becomes a column on a phone. They take any layout utility too, so `grid grid-cols-3` works just as well.

```html
<fieldset class="fieldset max-w-2xl">
  <legend class="field-legend">Region</legend>
  <div class="radio-group radio-group-row">
    <label class="radio-card">
      <input class="radio" type="radio" name="radio-region" value="eu" checked />
      <span class="radio-content">
        <span class="radio-title">Europe</span>
        <span class="radio-description">Dublin</span>
      </span>
    </label>
    <label class="radio-card">
      <input class="radio" type="radio" name="radio-region" value="us" />
      <span class="radio-content">
        <span class="radio-title">US East</span>
        <span class="radio-description">Virginia</span>
      </span>
    </label>
    <label class="radio-card">
      <input class="radio" type="radio" name="radio-region" value="ap" />
      <span class="radio-content">
        <span class="radio-title">Asia Pacific</span>
        <span class="radio-description">Mumbai</span>
      </span>
    </label>
  </div>
</fieldset>
```

## States

### Disabled

`disabled` on the radio takes the whole card out of play: it fades, ignores clicks, and its value is not submitted. Leave it off every other radio of the group, since the browser keeps the group's value on the one that is left.

```html
<fieldset class="fieldset max-w-lg">
  <legend class="field-legend">Region</legend>
  <div class="radio-group">
    <label class="radio-card">
      <input class="radio" type="radio" name="radio-region-2" value="eu" checked />
      <span class="radio-content">
        <span class="radio-title">Europe (Dublin)</span>
        <span class="radio-description">4 ms latency.</span>
      </span>
    </label>
    <label class="radio-card">
      <input class="radio" type="radio" name="radio-region-2" value="us" />
      <span class="radio-content">
        <span class="radio-title">US East (Virginia)</span>
        <span class="radio-description">80 ms latency.</span>
      </span>
    </label>
    <label class="radio-card">
      <input class="radio" type="radio" name="radio-region-2" value="ap" disabled />
      <span class="radio-content">
        <span class="radio-title">Asia Pacific (Mumbai)</span>
        <span class="radio-description">Sold out this quarter.</span>
      </span>
    </label>
  </div>
</fieldset>
```

### Required and error

Put `required` on one radio: the group then has to have a choice before the form submits, and once the user has tried, `:user-invalid` turns every dot in the group red. `aria-invalid="true"` does the same on demand, which is what a server response should set.

```html
<fieldset class="fieldset max-w-lg" aria-describedby="radio-region-error">
  <legend class="field-legend">Billing region</legend>
  <div class="radio-group">
    <label class="radio-card">
      <input class="radio" type="radio" name="radio-billing" value="eu" aria-invalid="true" />
      <span class="radio-content">
        <span class="radio-title">Europe</span>
        <span class="radio-description">VAT charged in your local currency.</span>
      </span>
    </label>
    <label class="radio-card">
      <input class="radio" type="radio" name="radio-billing" value="us" aria-invalid="true" />
      <span class="radio-content">
        <span class="radio-title">United States</span>
        <span class="radio-description">Tax calculated from your state.</span>
      </span>
    </label>
  </div>
  <p class="field-error" id="radio-region-error"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/></svg> Choose a billing region.</p>
</fieldset>
```

## With htmx

The chosen radio's `name` and `value` are posted like any other form value, so a request on `change` carries the choice.

```html
<form onsubmit="return false" hx-post="/api/echo" hx-trigger="change" hx-target="#radio-result">
  <fieldset class="fieldset max-w-lg">
    <legend class="field-legend">Region</legend>
    <div class="radio-group radio-group-row">
      <label class="radio-card">
        <input class="radio" type="radio" name="region" value="eu-west" checked />
        <span class="radio-content">
          <span class="radio-title">Dublin</span>
          <span class="radio-description">eu-west-1</span>
        </span>
      </label>
      <label class="radio-card">
        <input class="radio" type="radio" name="region" value="us-east" />
        <span class="radio-content">
          <span class="radio-title">Virginia</span>
          <span class="radio-description">us-east-1</span>
        </span>
      </label>
      <label class="radio-card">
        <input class="radio" type="radio" name="region" value="ap-south" />
        <span class="radio-content">
          <span class="radio-title">Mumbai</span>
          <span class="radio-description">ap-south-1</span>
        </span>
      </label>
    </div>
  </fieldset>
</form>
<p id="radio-result" class="muted" aria-live="polite"></p>
```

## Buttons instead of radios?

A radio group is a form control. For a row of buttons that switch a view or a style — text alignment, a filter bar — use a [toggle group](/docs/v0.2/components/toggle-group) with `data-toggle-group="single"`, which presses one button at a time.

## Reference

| Class / attribute | Description |
| --- | --- |
| `.radio-group` | Stacks the options in a gap-2 column. |
| `.radio-group-row` | Side by side from the sm breakpoint, each option taking an equal share. |
| `.radio-card` | The clickable card around a radio, a title and a description. A <label>. |
| `.radio-content / .radio-title / .radio-description` | The card's text, its title and its muted description. |
| `.radio` | The dot. Same shape language as .checkbox. |
| `aria-invalid="true"` | Error border on the option, or on every option in the group when a required group is empty (:user-invalid). |
