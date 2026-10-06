---
title: "Input"
description: "Text inputs, textareas, selects and file pickers, with focus, disabled, error, warning and success states."
url: "/docs/v0.2/components/input"
section: "Components"
---

# Input

Text inputs, textareas, selects and file pickers, with focus, disabled, error, warning and success states.

```html
<input class="input max-w-sm" type="email" placeholder="you@example.com" aria-label="Email" />
```

## Usage

Add `.input` to any text-like `<input>`. It fills its container's width; constrain it with a `max-w-*` utility or a wrapper. Every input needs a label: wrap it in a [field](/docs/v0.2/components/field) with a `.field-label`, or give it an `aria-label`.

```html
<div class="field max-w-sm">
  <label class="field-label" for="input-name">Name</label>
  <input class="input" id="input-name" placeholder="Ada Lovelace" />
</div>
```

## Types

```html
<div class="grid w-full max-w-sm gap-3">
  <input class="input" type="password" value="hunter22" aria-label="Password" />
  <input class="input" type="number" value="42" aria-label="Quantity" />
  <input class="input" type="date" aria-label="Date" />
  <input class="input" type="search" placeholder="Search…" aria-label="Search" />
</div>
```

## File

File inputs keep the native picker, with its button restyled. `multiple` and `accept` work as usual.

```html
<div class="field max-w-sm">
  <label class="field-label" for="input-avatar">Picture</label>
  <input class="input" id="input-avatar" type="file" accept="image/*" />
  <p class="field-description">PNG or JPG, up to 2 MB.</p>
</div>
<div class="field max-w-sm">
  <label class="field-label" for="input-docs">Documents</label>
  <input class="input" id="input-docs" type="file" multiple />
</div>
```

## Textarea

`.textarea` grows with its content in browsers that support `field-sizing`.

```html
<textarea class="textarea max-w-sm" placeholder="Type your message here." aria-label="Message"></textarea>
```

## Select

`.select` styles a native `<select>`.

```html
<select class="select max-w-48" aria-label="Fruit">
  <option>Apple</option>
  <option>Banana</option>
  <option>Blueberry</option>
</select>
```

## Sizes

`.input-sm` and `.input-lg` match the heights of `.btn-sm` and `.btn-lg`.

```html
<div class="flex w-full max-w-sm items-center gap-2">
  <input class="input input-sm" placeholder="Small" aria-label="Small" />
  <button class="btn btn-outline btn-sm">Go</button>
</div>
<div class="flex w-full max-w-sm items-center gap-2">
  <input class="input" placeholder="Default" aria-label="Default" />
  <button class="btn btn-outline">Go</button>
</div>
<div class="flex w-full max-w-sm items-center gap-2">
  <input class="input input-lg" placeholder="Large" aria-label="Large" />
  <button class="btn btn-outline btn-lg">Go</button>
</div>
```

## States

### Disabled

The `disabled` attribute fades the input; inside a field, the label fades too.

```html
<div class="field max-w-sm">
  <label class="field-label" for="input-disabled">Email</label>
  <input class="input" id="input-disabled" type="email" placeholder="you@example.com" disabled />
</div>
```

### Required

A field holding a `required` input marks its label with an asterisk automatically.

```html
<div class="field max-w-sm">
  <label class="field-label" for="input-required">Username</label>
  <input class="input" id="input-required" required />
</div>
```

### Error, warning, success

Set `aria-invalid="true"` for an error (the border turns red; so does the field's label). Native validation styles the same way once the user has interacted (`:user-invalid`). For softer states, add `.input-warning` or `.input-success`. Pair each with a message from the [field](/docs/v0.2/components/field#messages) classes and link it with `aria-describedby`.

```html
<div class="field-group max-w-sm">
  <div class="field">
    <label class="field-label" for="input-error">Email</label>
    <input class="input" id="input-error" type="email" value="ada@" aria-invalid="true" aria-describedby="input-error-msg" />
    <p class="field-error" id="input-error-msg"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/></svg> Enter a complete email address.</p>
  </div>
  <div class="field">
    <label class="field-label" for="input-warning">Password</label>
    <input class="input input-warning" id="input-warning" type="password" value="password" aria-describedby="input-warning-msg" />
    <p class="field-warning" id="input-warning-msg"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4M12 17h.01"/></svg> This password is common. Consider a longer one.</p>
  </div>
  <div class="field">
    <label class="field-label" for="input-success">Username</label>
    <input class="input input-success" id="input-success" value="ada" aria-describedby="input-success-msg" />
    <p class="field-success" id="input-success-msg"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg> Username is available.</p>
  </div>
</div>
```

### Validating with htmx

The server can return the whole field with its state, swapped in on `change`. Here the mock server just echoes the value back:

```html
<div class="field max-w-sm">
  <label class="field-label" for="input-htmx">Username</label>
  <input class="input" id="input-htmx" name="username" placeholder="Pick a username"
         hx-post="/api/echo" hx-trigger="change" hx-target="#input-htmx-msg" />
  <p class="field-description" id="input-htmx-msg" aria-live="polite">Checked when you leave the field.</p>
</div>
```

## Combining

Join an input to buttons with a [button group](/docs/v0.2/components/button-group), put icons, text, badges or buttons inside its border with an [input group](/docs/v0.2/components/input-group), and lay out labels, help text and grids of inputs with [field](/docs/v0.2/components/field).

```html
<div class="btn-group w-full max-w-sm" role="group" aria-label="Subscribe">
  <input class="input" type="email" placeholder="you@example.com" aria-label="Email" />
  <button class="btn btn-outline">Subscribe</button>
</div>
<div class="input-group max-w-sm">
  <input class="input" placeholder="Add tags…" aria-label="Tags" />
  <span class="input-group-addon"><span class="badge badge-secondary">htmx</span><span class="badge badge-secondary">css</span></span>
</div>
```

## Reference

| Class / attribute | Description |
| --- | --- |
| `.input` | Text-like inputs, including type="file". |
| `.textarea` | Multi-line input; grows with its content where supported. |
| `.select` | Native select with a chevron. |
| `.input-sm / .input-lg` | 32px or 44px tall instead of 36px. Also on .select. |
| `.input-warning / .input-success` | Amber or green border and focus ring. |
| `aria-invalid="true"` | Error state: red border and focus ring. :user-invalid looks the same. |
