---
title: "Input OTP"
description: "An accessible one-time password input: a row of slots over one real input, so typing, pasting and SMS autofill just work."
url: "/docs/v0.2/components/input-otp"
section: "Components"
---

# Input OTP

An accessible one-time password input: a row of slots over one real input, so typing, pasting and SMS autofill just work.

```html
<div class="input-otp" data-input-otp>
  <input class="input-otp-input" data-input-otp-input name="code" aria-label="Verification code" />
  <div class="input-otp-group" aria-hidden="true">
    <div class="input-otp-slot"></div>
    <div class="input-otp-slot"></div>
    <div class="input-otp-slot"></div>
  </div>
  <div class="input-otp-separator" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M5 12h14"/></svg></div>
  <div class="input-otp-group" aria-hidden="true">
    <div class="input-otp-slot"></div>
    <div class="input-otp-slot"></div>
    <div class="input-otp-slot"></div>
  </div>
</div>
```

## Markup

- Wrap everything in `.input-otp` with `data-input-otp`.
- Inside goes one real `<input class="input-otp-input" data-input-otp-input>` with the `name` the form submits and an `aria-label` (or a `<label for>`). It lies transparent over the slots and takes every click and key.
- Then one empty `.input-otp-slot` per character, in `.input-otp-group`s, with an optional `.input-otp-separator` between groups. Mark the groups and separators `aria-hidden="true"`: screen readers read the input, not the boxes.
- The number of slots is the length of the code: the behaviour sets the input's `maxlength` to match.

Because the value lives in one ordinary input, everything a browser does for inputs keeps working: pasting a whole code, the code from a text message offered above the keyboard (`autocomplete="one-time-code"`, set for you), password managers, undo, form submission and validation. The behaviour only filters what goes in and paints the slots.

## Pattern

`data-pattern` on the wrapper decides which characters are allowed; anything else is dropped as it is typed or pasted, so `"123-456"` or `" 123 456 "` pasted from an email becomes `123456`.

| data-pattern | Allows | Mobile keyboard |
| --- | --- | --- |
| `digits` (default) | 0–9 | Number pad (`inputmode="numeric"`) |
| `alphanumeric` | A–Z, a–z, 0–9 | Text |
| `alpha` | A–Z, a–z | Text |
| `[0-9a-f]` | Any regular-expression character class | Text |

`data-case="upper"` (or `"lower"`) converts letters as they are typed and asks phone keyboards for capitals. The input also gets a `pattern` attribute for the full code (`[0-9]{6}`), so a `required` input with a partial code fails native form validation. Set `inputmode`, `autocomplete` or `pattern` yourself to override them.

```html
<div class="field w-fit">
  <label class="label" for="otp-pin">PIN (digits only)</label>
  <div class="input-otp input-otp-spaced" data-input-otp data-mask>
    <input class="input-otp-input" data-input-otp-input id="otp-pin" name="pin" />
    <div class="input-otp-group" aria-hidden="true">
      <div class="input-otp-slot"></div>
      <div class="input-otp-slot"></div>
      <div class="input-otp-slot"></div>
      <div class="input-otp-slot"></div>
    </div>
  </div>
</div>
<div class="field w-fit">
  <label class="label" for="otp-invite">Invite code (letters and digits)</label>
  <div class="input-otp" data-input-otp data-pattern="alphanumeric" data-case="upper">
    <input class="input-otp-input" data-input-otp-input id="otp-invite" name="invite" />
    <div class="input-otp-group" aria-hidden="true">
      <div class="input-otp-slot"></div>
      <div class="input-otp-slot"></div>
      <div class="input-otp-slot"></div>
      <div class="input-otp-slot"></div>
    </div>
    <div class="input-otp-separator" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M5 12h14"/></svg></div>
    <div class="input-otp-group" aria-hidden="true">
      <div class="input-otp-slot"></div>
      <div class="input-otp-slot"></div>
      <div class="input-otp-slot"></div>
      <div class="input-otp-slot"></div>
    </div>
  </div>
</div>
```

The PIN shows `•` in its slots with `data-mask`, and `.input-otp-spaced` gives every slot a box of its own.

## Groups and separators

Split the slots into as many groups as the code reads in. A separator holds an icon or text; left empty it draws a short dash.

```html
    <div class="input-otp" data-input-otp>
  <input class="input-otp-input" data-input-otp-input name="otp-sep-a" aria-label="Code in pairs" />
  <div class="input-otp-group" aria-hidden="true">
<div class="input-otp-slot"></div><div class="input-otp-slot"></div>  </div>
<div class="input-otp-separator" aria-hidden="true"></div>  <div class="input-otp-group" aria-hidden="true">
<div class="input-otp-slot"></div><div class="input-otp-slot"></div>  </div>
<div class="input-otp-separator" aria-hidden="true"></div>  <div class="input-otp-group" aria-hidden="true">
<div class="input-otp-slot"></div><div class="input-otp-slot"></div>  </div>
</div>
    <div class="input-otp" data-input-otp>
      <input class="input-otp-input" data-input-otp-input name="otp-sep-b" aria-label="Code with a dot" />
      <div class="input-otp-group" aria-hidden="true">
        <div class="input-otp-slot"></div>
        <div class="input-otp-slot"></div>
        <div class="input-otp-slot"></div>
      </div>
      <div class="input-otp-separator" aria-hidden="true">·</div>
      <div class="input-otp-group" aria-hidden="true">
        <div class="input-otp-slot"></div>
        <div class="input-otp-slot"></div>
        <div class="input-otp-slot"></div>
      </div>
    </div>
```

## Sizes and states

`.input-otp-sm` and `.input-otp-lg` match `.input-sm` and `.input-lg`. `aria-invalid="true"` on the input (or a `required` code left unfinished, `:user-invalid`) turns the slots red, `disabled` fades them, and `.input-otp-warning` / `.input-otp-success` on the wrapper colour them. Pair them with [field](/docs/v0.2/components/field) messages:

```html
    <div class="input-otp input-otp-sm" data-input-otp>
  <input class="input-otp-input" data-input-otp-input name="otp-sm" aria-label="Small" />
  <div class="input-otp-group" aria-hidden="true">
<div class="input-otp-slot"></div><div class="input-otp-slot"></div><div class="input-otp-slot"></div>  </div>
<div class="input-otp-separator" aria-hidden="true"></div>  <div class="input-otp-group" aria-hidden="true">
<div class="input-otp-slot"></div><div class="input-otp-slot"></div><div class="input-otp-slot"></div>  </div>
</div>
    <div class="input-otp input-otp-lg" data-input-otp>
  <input class="input-otp-input" data-input-otp-input name="otp-lg" aria-label="Large" />
  <div class="input-otp-group" aria-hidden="true">
<div class="input-otp-slot"></div><div class="input-otp-slot"></div><div class="input-otp-slot"></div>  </div>
<div class="input-otp-separator" aria-hidden="true"></div>  <div class="input-otp-group" aria-hidden="true">
<div class="input-otp-slot"></div><div class="input-otp-slot"></div><div class="input-otp-slot"></div>  </div>
</div>
    <div class="field w-fit">
      <label class="label" for="otp-invalid">Verification code</label>
      <div class="input-otp" data-input-otp>
        <input class="input-otp-input" data-input-otp-input id="otp-invalid" name="code" value="123" aria-invalid="true" aria-describedby="otp-invalid-error" />
        <div class="input-otp-group" aria-hidden="true">
          <div class="input-otp-slot"></div>
          <div class="input-otp-slot"></div>
          <div class="input-otp-slot"></div>
          <div class="input-otp-slot"></div>
          <div class="input-otp-slot"></div>
          <div class="input-otp-slot"></div>
        </div>
      </div>
      <p class="field-error" id="otp-invalid-error"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/></svg> That code has expired. We sent you a new one.</p>
    </div>
    <div class="field w-fit">
      <label class="label" for="otp-success">Verified</label>
      <div class="input-otp input-otp-success" data-input-otp>
  <input class="input-otp-input" data-input-otp-input name="code" id="otp-success" aria-label="One-time code" value="482913" />
  <div class="input-otp-group" aria-hidden="true">
<div class="input-otp-slot"></div><div class="input-otp-slot"></div><div class="input-otp-slot"></div><div class="input-otp-slot"></div><div class="input-otp-slot"></div><div class="input-otp-slot"></div>  </div>
</div>
    </div>
    <div class="field w-fit">
      <label class="label" for="otp-disabled">Disabled</label>
      <div class="input-otp" data-input-otp>
  <input class="input-otp-input" data-input-otp-input name="code" id="otp-disabled" aria-label="One-time code" value="12" disabled />
  <div class="input-otp-group" aria-hidden="true">
<div class="input-otp-slot"></div><div class="input-otp-slot"></div><div class="input-otp-slot"></div><div class="input-otp-slot"></div><div class="input-otp-slot"></div><div class="input-otp-slot"></div>  </div>
</div>
    </div>
```

## Typing, pasting and the keyboard

- Focus puts the caret after the last character; the active slot shows a blinking caret. `Backspace` deletes backwards.
- `←` `→` `Home` `End` move between slots, and clicking a filled slot selects it: typing then replaces that character.
- Pasting a full code replaces the whole value, even when the input is already full; a shorter paste goes in at the caret.
- On phones, the digits pattern opens the number pad, and the code from a text message is offered above the keyboard.

## With htmx

Filling the last slot fires a bubbling `input-otp:complete` with `detail.value`. Trigger a request on it to check the code as soon as it's entered, or add `data-submit` to submit the input's form:

```html
    <form class="flex flex-col items-center gap-3" hx-post="/api/echo" hx-trigger="input-otp:complete" hx-target="#otp-result">
      <div class="input-otp" data-input-otp>
  <input class="input-otp-input" data-input-otp-input name="code" aria-label="Verification code" />
  <div class="input-otp-group" aria-hidden="true">
<div class="input-otp-slot"></div><div class="input-otp-slot"></div><div class="input-otp-slot"></div>  </div>
<div class="input-otp-separator" aria-hidden="true"></div>  <div class="input-otp-group" aria-hidden="true">
<div class="input-otp-slot"></div><div class="input-otp-slot"></div><div class="input-otp-slot"></div>  </div>
</div>
      <p id="otp-result" class="muted" aria-live="polite">Enter any six digits.</p>
    </form>
```

## Nunjucks macro

The `input_otp` macro writes the input, groups, slots and separators from a few options.

```jinja page.html
{% from "components/input-otp/input-otp.html" import input_otp %}

{{ input_otp("code", groups=[3, 3], label="Verification code", required=true) }}
{{ input_otp("invite", length=8, groups=[4, 4], pattern="alphanumeric", case="upper") }}
{{ input_otp("pin", length=4, mask=true, spaced=true, size="lg") }}
{{ input_otp("code", invalid=true, attrs='aria-describedby="code-error"') }}
```

## Reference

| Class / attribute | Description |
| --- | --- |
| `.input-otp` | Wrapper. Add data-input-otp. |
| `.input-otp-input` | The real input, transparent over the slots. Add data-input-otp-input. |
| `.input-otp-group / .input-otp-slot` | A run of slots joined into one border / one character. |
| `.input-otp-separator` | Between groups: an icon, text, or a dash when empty. |
| `.input-otp-spaced` | Every slot a separate box. |
| `.input-otp-sm / .input-otp-lg` | Sizes, matching .input-sm / .input-lg. |
| `.input-otp-warning / .input-otp-success` | State colours. Errors: aria-invalid on the input. |
| `data-pattern` | digits (default), alphanumeric, alpha, or a regex character class. |
| `data-case` | upper or lower: convert letters as they are typed. |
| `data-mask` | Show • in the slots. |
| `data-submit` | Submit the form when the last slot is filled. |
| `input-otp:complete` | Event on the wrapper with detail { value }. |
