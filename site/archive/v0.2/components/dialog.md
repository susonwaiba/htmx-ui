---
title: "Dialog"
description: "A window overlaid on the page or on another dialog, rendering the content underneath inert. Built on the native <dialog> element."
url: "/docs/v0.2/components/dialog"
section: "Components"
---

# Dialog

A window overlaid on the page or on another dialog, rendering the content underneath inert. Built on the native <dialog> element.

```html
<button type="button" class="btn btn-outline" commandfor="edit-profile" command="show-modal">Edit profile</button>
<dialog id="edit-profile" class="dialog dialog-sm" data-dialog aria-labelledby="edit-profile-title" aria-describedby="edit-profile-description">
  <div class="dialog-header">
    <h2 class="dialog-title" id="edit-profile-title">Edit profile</h2>
    <p class="dialog-description" id="edit-profile-description">Make changes to your profile here. Click save when you're done.</p>
  </div>
  <form class="contents" method="dialog">
    <div class="grid gap-4">
      <div class="field">
        <label class="field-label" for="edit-profile-name">Name</label>
        <input class="input" id="edit-profile-name" name="name" value="Pedro Duarte" />
      </div>
      <div class="field">
        <label class="field-label" for="edit-profile-username">Username</label>
        <input class="input" id="edit-profile-username" name="username" value="@peduarte" />
      </div>
    </div>
    <div class="dialog-footer">
      <button type="button" class="btn btn-outline" data-dialog-close>Cancel</button>
      <button class="btn btn-primary" value="save">Save changes</button>
    </div>
  </form>
  <button type="button" class="dialog-close" data-dialog-close aria-label="Close"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
</dialog>
```

## Markup

A dialog is a native `<dialog>` with `.dialog` and `data-dialog`. Opened as a modal, the browser puts it in the top layer above everything else, makes the rest of the page inert (no clicks, no focus, hidden from screen readers), moves focus into it and returns focus to the button that opened it when it closes. The page behind it stops scrolling.

- `.dialog-header` holds `.dialog-title` and `.dialog-description`. Point `aria-labelledby` and `aria-describedby` at them.
- `.dialog-content` is an optional body that scrolls on its own, keeping the header and footer in view.
- `.dialog-footer` is a row of actions: stacked on small screens with the last button on top, right-aligned from the `sm` breakpoint.
- `.dialog-close` is the corner close button. It is optional.

The same behaviour drives the [sheet](/docs/v0.2/components/sheet), a dialog that slides in from an edge of the screen, and the [drawer](/docs/v0.2/components/drawer), one that can also be swiped away.

## Opening and closing

Open it with an [invoker command](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button#command): a button with `commandfor="<dialog id>"` and `command="show-modal"`. Browsers with invoker commands need no script for it; for the rest, the dialog behaviour handles the click. From script, call `dialog.showModal()`.

It closes on any of these:

- `Esc`.
- A click outside it, on the backdrop. (Not for an [alert dialog](/docs/v0.2/components/alert-dialog).)
- A click on any element inside with `data-dialog-close`. Its value, or the button's `value`, becomes `dialog.returnValue`.
- Submitting a `<form method="dialog">` inside it (no JavaScript). The submit button's `value` becomes `returnValue`.
- A button with `commandfor` and `command="close"`.

Each fires the native `close` event on the `<dialog>`, so `hx-trigger="close"` on it, or a listener reading `returnValue`, can act on the answer.

## No close button

Leave out `.dialog-close` for a dialog that closes only with `Esc` or a click outside.

```html
<button type="button" class="btn btn-outline" commandfor="no-close" command="show-modal">No close button</button>
<dialog id="no-close" class="dialog" data-dialog aria-labelledby="no-close-title" aria-describedby="no-close-description">
  <div class="dialog-header">
    <h2 class="dialog-title" id="no-close-title">No close button</h2>
    <p class="dialog-description" id="no-close-description">This dialog has no close button. Press Escape or click outside to close it.</p>
  </div>
</dialog>
```

## Custom close button

Any element with `data-dialog-close` closes the dialog it is in, so the footer's own button can do it.

```html
<button type="button" class="btn btn-outline" commandfor="share-link" command="show-modal">Share</button>
<dialog id="share-link" class="dialog dialog-sm" data-dialog aria-labelledby="share-link-title" aria-describedby="share-link-description">
  <div class="dialog-header">
    <h2 class="dialog-title" id="share-link-title">Share link</h2>
    <p class="dialog-description" id="share-link-description">Anyone who has this link will be able to view this.</p>
  </div>
  <div class="field">
    <label class="field-label sr-only" for="share-link-url">Link</label>
    <input class="input" id="share-link-url" value="https://htmx-ui.dev/docs/installation" readonly />
  </div>
  <div class="dialog-footer sm:justify-start">
    <button type="button" class="btn btn-secondary" data-dialog-close>Close</button>
  </div>
</dialog>
```

## Scrollable content

Long content scrolls inside `.dialog-content` while the header stays in view. A dialog is never taller than the viewport less a margin; give it a `max-h-*` to cap it lower.

```html
<button type="button" class="btn btn-outline" commandfor="scrollable" command="show-modal">Scrollable content</button>
<dialog id="scrollable" class="dialog max-h-[min(30rem,calc(100dvh-2rem))]" data-dialog aria-labelledby="scrollable-title">
  <div class="dialog-header">
    <h2 class="dialog-title" id="scrollable-title">Scrollable content</h2>
    <p class="dialog-description">This is a dialog with scrollable content.</p>
  </div>
  <div class="dialog-content space-y-4 leading-relaxed">
    <p>Pages are plain HTML rendered by Nunjucks at build time. Components are CSS classes, with a small behaviour where one is needed.</p>
    <p>htmx swaps fragments from your server into the page. Components inside a fragment initialise as soon as it arrives, so a dialog returned by a request works like one written in the page.</p>
    <p>Every colour is a CSS variable. Override the tokens on :root, or on any element, to theme the whole library, in light and dark.</p>
    <p>The native dialog element does the hard parts: the top layer, an inert page underneath, focus moving in and coming back, and Escape.</p>
    <p>Dialogs can open over other dialogs. Each new one stacks on top with its own backdrop, and Escape closes the topmost first.</p>
    <p>A form inside a dialog can post with htmx. The server answers with a fragment for the page and closes the dialog with a response header.</p>
    <p>Alert dialogs are the same element with role="alertdialog". They don't close on a click outside, because they need an answer.</p>
    <p>Without JavaScript, a form with method="dialog" still closes it, and browsers with invoker commands still open it.</p>
  </div>
  <button type="button" class="dialog-close" data-dialog-close aria-label="Close"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
</dialog>
```

## Sticky footer

With a `.dialog-content` between them, the footer stays visible while the content scrolls. `.dialog-footer-sticky` sets it apart: tinted, edge to edge, with a border on top.

```html
<button type="button" class="btn btn-outline" commandfor="terms" command="show-modal">Sticky footer</button>
<dialog id="terms" class="dialog max-h-[min(30rem,calc(100dvh-2rem))]" data-dialog aria-labelledby="terms-title">
  <div class="dialog-header">
    <h2 class="dialog-title" id="terms-title">Terms of service</h2>
    <p class="dialog-description">Please read and accept the terms to continue.</p>
  </div>
  <div class="dialog-content space-y-4 leading-relaxed">
    <p><strong>1. Acceptance.</strong> By using the service you agree to these terms. If you don't agree, don't use it.</p>
    <p><strong>2. Accounts.</strong> You are responsible for your account and for everything done with it. Keep your password safe.</p>
    <p><strong>3. Content.</strong> You keep the rights to what you upload. You give us the permission we need to store and show it to the people you share it with.</p>
    <p><strong>4. Acceptable use.</strong> Don't break the law, don't attack the service, and don't use it to harm other people.</p>
    <p><strong>5. Payment.</strong> Paid plans are billed in advance and renew until you cancel. Cancelling stops the next renewal.</p>
    <p><strong>6. Termination.</strong> You can stop using the service at any time. We may suspend accounts that break these terms.</p>
    <p><strong>7. Changes.</strong> We will tell you before these terms change. Using the service after a change means you accept it.</p>
  </div>
  <div class="dialog-footer dialog-footer-sticky">
    <button type="button" class="btn btn-outline" data-dialog-close="decline">Decline</button>
    <button type="button" class="btn btn-primary" data-dialog-close="accept">Accept</button>
  </div>
</dialog>
```

## Sizes

A dialog is `max-w-lg` wide. `.dialog-sm`, `.dialog-lg` and `.dialog-xl` change that, or use any `max-w-*` utility.

```html
<button type="button" class="btn btn-outline" commandfor="size-sm" command="show-modal">Small</button>
<button type="button" class="btn btn-outline" commandfor="size-xl" command="show-modal">Extra large</button>
<dialog id="size-sm" class="dialog dialog-sm" data-dialog aria-labelledby="size-sm-title">
  <div class="dialog-header"><h2 class="dialog-title" id="size-sm-title">Small dialog</h2></div>
  <p class="muted">.dialog-sm is max-w-sm.</p>
  <button type="button" class="dialog-close" data-dialog-close aria-label="Close"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
</dialog>
<dialog id="size-xl" class="dialog dialog-xl" data-dialog aria-labelledby="size-xl-title">
  <div class="dialog-header"><h2 class="dialog-title" id="size-xl-title">Extra large dialog</h2></div>
  <p class="muted">.dialog-xl is max-w-4xl.</p>
  <button type="button" class="dialog-close" data-dialog-close aria-label="Close"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
</dialog>
```

## Dialog over a dialog

A button inside one dialog can open another. It stacks on top with its own backdrop, the first dialog becomes inert, and `Esc` or a click outside closes the topmost one first.

```html
<button type="button" class="btn btn-outline" commandfor="nested-outer" command="show-modal">Open settings</button>
<dialog id="nested-outer" class="dialog" data-dialog aria-labelledby="nested-outer-title">
  <div class="dialog-header">
    <h2 class="dialog-title" id="nested-outer-title">Settings</h2>
    <p class="dialog-description">Manage your workspace.</p>
  </div>
  <div class="dialog-footer sm:justify-between">
    <button type="button" class="btn btn-danger" commandfor="nested-inner" command="show-modal"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Delete workspace</button>
    <button type="button" class="btn btn-outline" data-dialog-close>Done</button>
  </div>
</dialog>
<dialog id="nested-inner" class="dialog dialog-sm" data-dialog aria-labelledby="nested-inner-title">
  <div class="dialog-header">
    <h2 class="dialog-title" id="nested-inner-title">Are you sure?</h2>
    <p class="dialog-description">This is a second dialog, over the first.</p>
  </div>
  <div class="dialog-footer">
    <button type="button" class="btn btn-outline" data-dialog-close>Cancel</button>
    <button type="button" class="btn btn-danger" data-dialog-close>Delete</button>
  </div>
</dialog>
```

## With htmx

### A dialog from the server

A dialog can come from the server instead of the page. `data-dialog-show` opens it as a modal as soon as htmx inserts it, and `data-dialog-remove` takes it out of the page again once it has closed, so every click loads a fresh one. Append it to the body:

```html
<button type="button" class="btn btn-outline" hx-get="/api/dialog" hx-target="body" hx-swap="beforeend">
  Rename project
</button>
<span id="server-dialog-result" class="muted"></span>
```

The server returns:

```html
<dialog class="dialog" data-dialog data-dialog-show data-dialog-remove aria-labelledby="rename-title">
  <div class="dialog-header">
    <h2 class="dialog-title" id="rename-title">Rename project</h2>
  </div>
  <form class="contents" hx-post="/api/dialog/save" hx-target="#server-dialog-result">
    <div class="field">
      <label class="field-label" for="rename-name">Name</label>
      <input class="input" id="rename-name" name="name" required autofocus />
    </div>
    <div class="dialog-footer">
      <button type="button" class="btn btn-outline" data-dialog-close>Cancel</button>
      <button class="btn btn-primary">Save</button>
    </div>
  </form>
</dialog>
```

### Closing it from the server

A `dialog:close` event dispatched inside a dialog closes it. htmx dispatches the events named in an `HX-Trigger` response header on the element that made the request, so a server that has saved the form closes the dialog it came from with one header, while the response body goes to the form's `hx-target`. On a validation error, leave the header off and return the form with its messages instead.

```text
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
HX-Trigger: dialog:close

<span class="text-success">Renamed to htmx-ui</span>
```

## Macro

`dialog()` writes the `<dialog>`, its header and the close button, with the ids and ARIA attributes wired up. The call body is everything after the header.

```jinja
{% from "components/dialog/dialog.html" import dialog %}

<button class="btn btn-outline" commandfor="invite" command="show-modal">Invite</button>
{% call dialog("invite", "Invite people", "They will get an email with a link.", size="sm") %}
  <div class="dialog-footer">
    <button class="btn btn-outline" data-dialog-close>Cancel</button>
    <button class="btn btn-primary" data-dialog-close="send">Send invites</button>
  </div>
{% endcall %}
```

| Parameter | Description |
| --- | --- |
| `id` | Required. The id buttons point commandfor at; also prefixes the title and description ids. |
| `title, description` | Header text. Each sets aria-labelledby / aria-describedby. |
| `close=true` | The corner close button. false leaves it out. |
| `alert=false` | true makes it an alert dialog: role="alertdialog", no corner button, no closing on a click outside. |
| `size` | "sm", "lg" or "xl". |
| `media, media_variant` | An icon name shown above the title, and "danger" to tint it. |
| `show, remove` | data-dialog-show and data-dialog-remove, for dialogs returned by htmx. |
| `class` | More classes on the <dialog>. |

## Accessibility

- Give every dialog a name: `aria-labelledby` pointing at its title, or `aria-label`.
- Focus moves to the first focusable element inside, or to one marked `autofocus`. Put `autofocus` on the field the user needs first, or on the safest button.
- An icon-only close button needs an `aria-label`.
- Use an [alert dialog](/docs/v0.2/components/alert-dialog) when the user must answer before going on.

## Reference

| Class | Description |
| --- | --- |
| `.dialog` | The <dialog>: centred, padded, scrolls when taller than the viewport. Fades and zooms in and out. |
| `.dialog-header / .dialog-title / .dialog-description` | Title block, centred on small screens. |
| `.dialog-content` | Body that scrolls on its own, keeping the header and footer in view. |
| `.dialog-footer` | Actions: stacked on small screens, a right-aligned row from sm. |
| `.dialog-footer-sticky` | Tinted, edge-to-edge footer with a top border. |
| `.dialog-close` | Corner close button. |
| `.dialog-sm / -lg / -xl` | Widths: max-w-sm, max-w-2xl, max-w-4xl (default max-w-lg). |
| `.dialog-media / .dialog-media-danger` | An icon or image above the title; see Alert dialog. |
| `[data-dialog]` | Behaviour: closes on a click outside and on [data-dialog-close], opens command buttons in older browsers. |
| `[data-dialog-close="value"]` | Closes the dialog it is in; the value becomes returnValue. |
| `[data-dialog-show] / [data-dialog-remove]` | Open as a modal when initialised / remove from the page once closed. |
| `dialog:close event` | Closes the dialog it is dispatched in, e.g. from an HX-Trigger response header. |
