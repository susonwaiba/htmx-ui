---
title: "Select"
description: "A list of options in a popup, opened from a button: searchable, keyboard driven, and styled like an input."
url: "/docs/v0.2/components/select"
section: "Components"
---

# Select

A list of options in a popup, opened from a button: searchable, keyboard driven, and styled like an input.

```html
<div class="field w-64">
  <span class="field-label" id="select-country-label">Country</span>
  <div class="select" data-select>
    <button type="button" class="select-trigger" data-select-trigger
            aria-haspopup="listbox" aria-expanded="false" aria-labelledby="select-country-label"
            aria-describedby="select-country-help">
      <span class="select-value" data-placeholder="Choose a country"></span>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
    </button>
    <div class="select-content" role="listbox" aria-labelledby="select-country-label" hidden>
      <div class="select-search">
        <input class="input input-sm" data-select-search placeholder="Search countries…" aria-label="Search countries" />
      </div>
      <span class="select-item" role="option" aria-selected="false" value="au">
        Australia
        <span class="select-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span>
      </span>
      <span class="select-item" role="option" aria-selected="false" value="br">
        Brazil
        <span class="select-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span>
      </span>
      <span class="select-item" role="option" aria-selected="false" value="ca">
        Canada
        <span class="select-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span>
      </span>
      <span class="select-item" role="option" aria-selected="false" value="de">
        Germany
        <span class="select-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span>
      </span>
      <span class="select-item" role="option" aria-selected="false" value="jp">
        Japan
        <span class="select-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span>
      </span>
      <span class="select-item" role="option" aria-selected="false" value="mx">
        Mexico
        <span class="select-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span>
      </span>
      <span class="select-item" role="option" aria-selected="true" value="nz">
        New Zealand
        <span class="select-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span>
      </span>
      <span class="select-item" role="option" aria-selected="false" value="pt">
        Portugal
        <span class="select-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span>
      </span>
      <span class="select-item" role="option" aria-selected="false" value="za">
        South Africa
        <span class="select-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span>
      </span>
      <p class="select-empty" data-select-empty hidden>No country matches that.</p>
    </div>
  </div>
  <p class="field-description" id="select-country-help">Where the invoice is billed.</p>
</div>
```

A select is a [dropdown](/docs/v0.2/components/dropdown) that picks a value: the trigger takes the label's place in a [field](/docs/v0.2/components/field), and the chosen option is what the form submits. Reach for it when the native `<select>` is not enough — filtering, groups, disabled options, markup inside an option — and for a plain `<select>` that only needs styling, keep the [.select](/docs/v0.2/components/input) input class.

## Markup

- Wrap the trigger and the list in `.select` with `data-select`, like a dropdown.
- The trigger is a `button` with `data-select-trigger`, `aria-haspopup="listbox"` and `aria-expanded="false"`. Its text goes in an empty `.select-value` span, with `data-placeholder` for the text shown until something is picked. Name the button after the field's label with `aria-labelledby`.
- The list is a `.select-content` with `role="listbox"` that starts `hidden`. Each entry is a `.select-item` with `role="option"`, a `value`, and `aria-selected="true"` on the picked one.
- Add `aria-disabled="true"` to an option the user can't pick: it is skipped by the keyboard and can't be clicked.
- To submit the value, put a hidden field inside the select: `<input type="hidden" name="country" data-select-input>`. A preselected option fills it, and every choice rewrites it.
- An option holding more than text (a flag, a badge) can carry `data-label`, the plain text the trigger shows.

## Keyboard

| Key | Action |
| --- | --- |
| `↓` `↑` on the trigger | Open on the picked option, or the first / last |
| `↓` `↑` `Home` `End` | Move between options |
| `Enter` `Space` | Pick the focused option and close |
| `Esc` | Close and return focus to the trigger |
| `Tab`, click outside | Close |

## Searching

Put an `.input` in a `.select-search` wrapper inside the list with `data-select-search`. Typing filters the options, `↓` moves into them, and a matching option can carry `aria-selected="true"` so it comes first. Add a `.select-empty` with `data-select-empty` for the "no matches" message: it stays hidden until a search finds nothing, and the filter resets when the list closes.

```html
<div class="select w-56" data-select>
  <button type="button" class="select-trigger" data-select-trigger aria-haspopup="listbox" aria-expanded="false" aria-label="Timezone">
    <span class="select-value" data-placeholder="Pick a timezone"></span>
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
  </button>
  <div class="select-content" role="listbox" aria-label="Timezone" hidden>
    <div class="select-search">
      <input class="input input-sm" data-select-search placeholder="Search…" aria-label="Search timezones" />
    </div>
    <span class="select-item" role="option" aria-selected="true" value="utc">UTC</span>
    <span class="select-item" role="option" aria-selected="false" value="cet">Central European Time</span>
    <span class="select-item" role="option" aria-selected="false" value="jst">Japan Standard Time</span>
    <span class="select-item" role="option" aria-selected="false" value="pst">Pacific Time</span>
    <p class="select-empty" data-select-empty hidden>No timezone matches that.</p>
  </div>
</div>
```

## Groups

A `.select-label` heads a run of options and a `.select-separator` divides them. They are text, not options, so the keyboard skips them.

```html
<div class="select w-56" data-select>
  <button type="button" class="select-trigger" data-select-trigger aria-haspopup="listbox" aria-expanded="false" aria-label="Region">
    <span class="select-value" data-placeholder="All regions"></span>
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
  </button>
  <div class="select-content" role="listbox" aria-label="Region" hidden>
    <p class="select-label">Americas</p>
    <span class="select-item" role="option" aria-selected="false" value="na">North America</span>
    <span class="select-item" role="option" aria-selected="false" value="sa">South America</span>
    <div class="select-separator" role="separator"></div>
    <p class="select-label">Europe and Africa</p>
    <span class="select-item" role="option" aria-selected="false" value="eu">Europe</span>
    <span class="select-item" role="option" aria-selected="false" value="af">Africa</span>
    <span class="select-item" role="option" aria-selected="false" value="me" aria-disabled="true">Middle East (coming soon)</span>
  </div>
</div>
```

## Sizes and states

`.select-sm` and `.select-lg` match `.input-sm` and `.input-lg`. `disabled` on the trigger, and `aria-invalid="true"` for an error, work as they do on an input.

```html
<div class="select w-56">
  <button type="button" class="select-trigger select-sm" data-select-trigger aria-haspopup="listbox" aria-expanded="false" aria-label="Small">
    <span class="select-value" data-placeholder="Small"></span>
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
  </button>
  <div class="select-content" role="listbox" aria-label="Small" hidden>
    <span class="select-item" role="option" aria-selected="false" value="a">A</span>
    <span class="select-item" role="option" aria-selected="false" value="b">B</span>
  </div>
</div>
<div class="select w-56">
  <button type="button" class="select-trigger" data-select-trigger aria-haspopup="listbox" aria-expanded="false" aria-invalid="true" aria-label="Invalid">
    <span class="select-value" data-placeholder="Invalid"></span>
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
  </button>
  <div class="select-content" role="listbox" aria-label="Invalid" hidden>
    <span class="select-item" role="option" aria-selected="false" value="a">A</span>
    <span class="select-item" role="option" aria-selected="false" value="b">B</span>
  </div>
</div>
<div class="select w-56">
  <button type="button" class="select-trigger" data-select-trigger aria-haspopup="listbox" aria-expanded="false" disabled aria-label="Disabled">
    <span class="select-value" data-placeholder="Disabled"></span>
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
  </button>
  <div class="select-content" role="listbox" aria-label="Disabled" hidden>
    <span class="select-item" role="option" aria-selected="false" value="a">A</span>
  </div>
</div>
```

## Alignment

The list opens below the trigger, as wide as the trigger and aligned to its left edge. Add `.select-content-end` to align it to the right edge, or `.select-content-up` to open it upwards.

```html
<div class="select w-48">
  <button type="button" class="select-trigger" data-select-trigger aria-haspopup="listbox" aria-expanded="false" aria-label="Right-aligned">
    <span class="select-value" data-placeholder="Right-aligned"></span>
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
  </button>
  <div class="select-content select-content-end" role="listbox" aria-label="Right-aligned" hidden>
    <span class="select-item" role="option" aria-selected="false" value="au">Australia</span>
    <span class="select-item" role="option" aria-selected="false" value="nz">New Zealand</span>
  </div>
</div>
```

## With htmx

Every choice fires a bubbling `select:change` with `detail.value` (the option's `value`), `detail.label` and `detail.option`. Trigger requests on it rather than on `click`, so they run once the value has been set. Inside a form, htmx posts the form's values — the hidden `[data-select-input]` among them — so the request carries the choice with no extra wiring:

```html
<form class="select w-56" data-select onsubmit="return false" hx-post="/api/echo" hx-trigger="select:change" hx-target="#select-result">
  <button type="button" class="select-trigger" data-select-trigger aria-haspopup="listbox" aria-expanded="false" aria-label="Deploy region">
    <span class="select-value" data-placeholder="Deploy region"></span>
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
  </button>
  <div class="select-content" role="listbox" aria-label="Deploy region" hidden>
    <span class="select-item" role="option" aria-selected="false" value="eu-west">Europe (Dublin)</span>
    <span class="select-item" role="option" aria-selected="false" value="us-east">US East (Virginia)</span>
    <span class="select-item" role="option" aria-selected="false" value="ap-south">Mumbai</span>
  </div>
  <input type="hidden" name="region" data-select-input />
</form>
<p id="select-result" class="muted" aria-live="polite"></p>
```

Outside a form, pass the value yourself with the event: `hx-vals='js:{region: event.detail.value}'`.

## Loading options with htmx

Swap the option list in on `load`, or after a request elsewhere: the behaviour looks options up on every event, so a list that arrives from the server keeps filtering and navigating. Mark the picked one with `aria-selected="true"` and put the value in `[data-select-input]` in the swapped markup and the new list starts out in step.

## Nunjucks macro

The `select` macro writes the trigger, the options and the hidden field from a list. Options are `[{value, label}]` pairs, or plain strings when the value is the label.

```jinja page.html
{% from "components/select/select.html" import select %}

<div class="field">
  <span class="field-label" id="country">Country</span>
  {{ select("country", json("data/countries.json"), value="nz", name="country", searchable=true, label="Country") }}
</div>

{{ select("plan", ["Free", "Pro"], value="Free", label="Plan") }}
```

## Reference

| Class / attribute | Description |
| --- | --- |
| `.select` | Positioning wrapper (relative, inline-block). |
| `.select-trigger` | The button that opens the list. Looks like an .input. |
| `.select-sm / .select-lg` | Trigger sizes, matching .input-sm / .input-lg. |
| `.select-value` | The picked text. Empty, with data-placeholder, until something is picked. |
| `.select-content` | The listbox. Opens below, as wide as the trigger. |
| `.select-content-end / .select-content-up` | Align to the right edge / open above. |
| `.select-search` | Sticky wrapper for a [data-select-search] filter input. |
| `.select-item` | One option. aria-selected marks the picked one, aria-disabled an unavailable one. |
| `.select-check` | Icon inside an option, shown only while it is picked. |
| `.select-label / .select-separator` | Heading and divider inside the list. |
| `.select-empty` | Shown by the behaviour when a search finds nothing. |
| `[data-select] / [data-select-trigger]` | Behaviour: open/close, keyboard, filtering, and select:change { value, label, option }. |
| `[data-select-input]` | Hidden field mirroring the picked value, so a form can submit it. |
