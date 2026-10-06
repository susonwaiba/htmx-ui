---
title: "Textarea"
description: "Multi-line text that grows with what's typed: field labels and messages, a character count, every form state, and submitting with Ctrl/⌘+Enter."
url: "/docs/v0.2/components/textarea"
section: "Components"
---

# Textarea

Multi-line text that grows with what's typed: field labels and messages, a character count, every form state, and submitting with Ctrl/⌘+Enter.

```html
<textarea class="textarea max-w-sm" placeholder="Type your message here." aria-label="Message"></textarea>
```

## Markup

- A native `<textarea class="textarea">`. It shares its border, focus ring and states with [`.input`](/docs/v0.2/components/input).
- It grows with its content (CSS `field-sizing`) from `min-h-16`; add a `max-h-*` and it scrolls beyond that. `.textarea-fixed` keeps the height of its `rows` instead.
- Optional behaviour, `data-textarea`: growing in browsers without `field-sizing`, a [character count](#count) and [submitting with the keyboard](#submit).

## Field

In a [`.field`](/docs/v0.2/components/field), with a label, a description linked by `aria-describedby`, and the required asterisk when the textarea is `required`.

```html
<div class="field mx-auto max-w-sm">
  <label class="field-label" for="textarea-bio">Bio</label>
  <textarea class="textarea" id="textarea-bio" name="bio" placeholder="Tell us a little about yourself" aria-describedby="textarea-bio-help" required></textarea>
  <p class="field-description" id="textarea-bio-help">A sentence or two, shown on your profile.</p>
</div>
```

## Character count

With `data-textarea`, a `[data-textarea-count]` in the same field shows the length, against `maxlength` when there is one. It turns amber from 90% and red at the limit. Put it in a `.field-footer` to sit opposite the description.

```html
<div class="field mx-auto max-w-sm">
  <label class="field-label" for="textarea-status">Status</label>
  <textarea class="textarea" id="textarea-status" maxlength="80" data-textarea aria-describedby="textarea-status-help">Shipping the 0.2 release</textarea>
  <div class="field-footer">
    <p class="field-description" id="textarea-status-help">Shown next to your name.</p>
    <span class="textarea-count" data-textarea-count aria-live="polite"></span>
  </div>
</div>
```

## States

As on inputs: `disabled`, `readonly`, `aria-invalid="true"` (with a `.field-error` message), `.textarea-warning` and `.textarea-success`.

```html
<div class="field">
  <label class="field-label" for="textarea-disabled">Disabled</label>
  <textarea class="textarea" id="textarea-disabled" disabled>Can't be changed.</textarea>
</div>
<div class="field">
  <label class="field-label" for="textarea-readonly">Read only</label>
  <textarea class="textarea" id="textarea-readonly" readonly>Can be selected and copied.</textarea>
</div>
<div class="field">
  <label class="field-label" for="textarea-error">Description</label>
  <textarea class="textarea" id="textarea-error" aria-invalid="true" aria-describedby="textarea-error-msg">Too short</textarea>
  <p class="field-error" id="textarea-error-msg"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/></svg> Write at least 20 characters.</p>
</div>
<div class="field">
  <label class="field-label" for="textarea-warning">Notes</label>
  <textarea class="textarea textarea-warning" id="textarea-warning" aria-describedby="textarea-warning-msg">Call the supplier on Monday</textarea>
  <p class="field-warning" id="textarea-warning-msg"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4M12 17h.01"/></svg> Visible to the whole team.</p>
</div>
<div class="field sm:col-span-2">
  <label class="field-label" for="textarea-success">Address</label>
  <textarea class="textarea textarea-success" id="textarea-success" aria-describedby="textarea-success-msg">1 Martin Place, Sydney NSW 2000</textarea>
  <p class="field-success" id="textarea-success-msg"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg> Address verified.</p>
</div>
```

## Sizes and height

`.textarea-sm` and `.textarea-lg` change the text size and padding. `.textarea-fixed` with `rows` holds a height and drops the resize handle; `max-h-*` caps a growing one.

```html
<textarea class="textarea textarea-sm" placeholder="Small" aria-label="Small"></textarea>
<textarea class="textarea textarea-lg" placeholder="Large" aria-label="Large"></textarea>
<textarea class="textarea textarea-fixed" rows="3" placeholder="Fixed at three rows" aria-label="Fixed"></textarea>
<textarea class="textarea max-h-32" placeholder="Grows up to 8rem, then scrolls" aria-label="Capped"></textarea>
```

## Submit with the keyboard

`data-textarea-submit` submits the form on `Ctrl`/`⌘`+`Enter`; `data-textarea-submit="enter"` on `Enter`, with `Shift`+`Enter` for a new line, as in chat. It calls `requestSubmit()`, so validation and htmx run as for a click.

```html
<form class="field mx-auto max-w-sm" hx-post="/api/echo" hx-target="#textarea-result" hx-on::after:request="this.reset()">
  <label class="field-label" for="textarea-reply">Reply</label>
  <div class="input-group">
    <textarea class="textarea" id="textarea-reply" name="reply" placeholder="Write a reply…" data-textarea data-textarea-submit required></textarea>
    <div class="input-group-addon input-group-addon-block-end">
      <span class="text-xs text-muted-foreground"><kbd class="kbd">Ctrl</kbd> <kbd class="kbd">Enter</kbd> to send</span>
      <button class="btn btn-primary btn-xs ms-auto" type="submit">Send</button>
    </div>
  </div>
  <p class="field-description" id="textarea-result">Nothing sent yet.</p>
</form>
```

## Reference

| Class | Description |
| --- | --- |
| `.textarea` | Multi-line input; grows with its content where supported. |
| `.textarea-fixed` | Keeps its rows height, no resize handle. |
| `.textarea-sm / .textarea-lg` | Smaller or larger text and padding. |
| `.textarea-warning / .textarea-success` | Warning and success borders (aria-invalid="true" for errors). |
| `.field-footer` | A row under a field's control: description and count. |
| `.textarea-count` | The character count; data-state="near" / "limit" colour it. |
| `[data-textarea]` | Behaviour: grows without field-sizing, fills the count. |
| `[data-textarea-count]` | Where the count goes (in the same .field, or by id). |
| `[data-textarea-submit]` | Ctrl/⌘+Enter submits; ="enter": Enter submits, Shift+Enter is a new line. |
