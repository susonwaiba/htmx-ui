---
title: "Alert dialog"
description: "A modal dialog that interrupts the user with important content and expects a response."
url: "/docs/v0.2/components/alert-dialog"
section: "Components"
---

# Alert dialog

A modal dialog that interrupts the user with important content and expects a response.

```html
<button type="button" class="btn btn-outline" commandfor="alert-basic" command="show-modal">Show dialog</button>
<dialog id="alert-basic" class="dialog" data-dialog role="alertdialog" aria-labelledby="alert-basic-title" aria-describedby="alert-basic-description">
  <div class="dialog-header">
    <h2 class="dialog-title" id="alert-basic-title">Are you absolutely sure?</h2>
    <p class="dialog-description" id="alert-basic-description">This action cannot be undone. This will permanently delete your account and remove your data from our servers.</p>
  </div>
  <div class="dialog-footer">
    <button type="button" class="btn btn-outline" data-dialog-close="cancel" autofocus>Cancel</button>
    <button type="button" class="btn btn-primary" data-dialog-close="continue">Continue</button>
  </div>
</dialog>
```

## Markup

An alert dialog is a [dialog](/docs/v0.2/components/dialog) with `role="alertdialog"`: the same classes, the same behaviour, the same ways to open it. The role changes two things. Screen readers announce it as an alert, and a click outside doesn't close it, because the user has to answer. `Esc` still closes it, as a cancel.

- Give it a title and a description, linked with `aria-labelledby` and `aria-describedby`.
- Leave out the corner close button; the footer's buttons are the answers.
- Put `autofocus` on the least destructive button, usually Cancel, so `Enter` can't confirm by accident.
- Give each button a `data-dialog-close` value. It becomes the dialog's `returnValue`, which tells the `close` event which answer was given.

## Small

`.dialog-sm` makes it narrower, centres the text and sets the two buttons side by side at equal width.

```html
<button type="button" class="btn btn-outline" commandfor="alert-small" command="show-modal">Show dialog</button>
<dialog id="alert-small" class="dialog dialog-sm" data-dialog role="alertdialog" aria-labelledby="alert-small-title" aria-describedby="alert-small-description">
  <div class="dialog-header">
    <h2 class="dialog-title" id="alert-small-title">Allow accessory to connect?</h2>
    <p class="dialog-description" id="alert-small-description">Do you want to allow the USB accessory to connect to this device?</p>
  </div>
  <div class="dialog-footer">
    <button type="button" class="btn btn-outline" data-dialog-close="deny" autofocus>Don't allow</button>
    <button type="button" class="btn btn-primary" data-dialog-close="allow">Allow</button>
  </div>
</dialog>
```

## Media

`.dialog-media`, first in the header, adds an icon or an image. In the default size it sits beside the title and description from the `sm` breakpoint, and above them on smaller screens.

```html
<button type="button" class="btn btn-outline" commandfor="alert-media" command="show-modal">Share project</button>
<dialog id="alert-media" class="dialog" data-dialog role="alertdialog" aria-labelledby="alert-media-title" aria-describedby="alert-media-description">
  <div class="dialog-header">
    <div class="dialog-media"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-8" aria-hidden="true"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/></svg></div>
    <h2 class="dialog-title" id="alert-media-title">Share this project?</h2>
    <p class="dialog-description" id="alert-media-description">Anyone with the link will be able to view and edit this project.</p>
  </div>
  <div class="dialog-footer">
    <button type="button" class="btn btn-outline" data-dialog-close="cancel" autofocus>Cancel</button>
    <button type="button" class="btn btn-primary" data-dialog-close="share">Share</button>
  </div>
</dialog>
```

## Small with media

In a small alert dialog the media is centred above the title. It can hold an image as well as an icon.

```html
<button type="button" class="btn btn-outline" commandfor="alert-small-icon" command="show-modal">With an icon</button>
<button type="button" class="btn btn-outline" commandfor="alert-small-image" command="show-modal">With an image</button>
<dialog id="alert-small-icon" class="dialog dialog-sm" data-dialog role="alertdialog" aria-labelledby="alert-small-icon-title" aria-describedby="alert-small-icon-description">
  <div class="dialog-header">
    <div class="dialog-media"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-8" aria-hidden="true"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2M20 14h2M15 13v2M9 13v2"/></svg></div>
    <h2 class="dialog-title" id="alert-small-icon-title">Enable the assistant?</h2>
    <p class="dialog-description" id="alert-small-icon-description">It can read the pages you open in this workspace.</p>
  </div>
  <div class="dialog-footer">
    <button type="button" class="btn btn-outline" data-dialog-close="cancel" autofocus>Not now</button>
    <button type="button" class="btn btn-primary" data-dialog-close="enable">Enable</button>
  </div>
</dialog>
<dialog id="alert-small-image" class="dialog dialog-sm" data-dialog role="alertdialog" aria-labelledby="alert-small-image-title" aria-describedby="alert-small-image-description">
  <div class="dialog-header">
    <div class="dialog-media size-20 rounded-full"><img src="../../../images/landscape.svg" alt="" /></div>
    <h2 class="dialog-title" id="alert-small-image-title">Use as cover image?</h2>
    <p class="dialog-description" id="alert-small-image-description">Everyone in the workspace will see it at the top of the project.</p>
  </div>
  <div class="dialog-footer">
    <button type="button" class="btn btn-outline" data-dialog-close="cancel" autofocus>Cancel</button>
    <button type="button" class="btn btn-primary" data-dialog-close="use">Use image</button>
  </div>
</dialog>
```

## Destructive

For an action that destroys something, make the confirming button `.btn-danger` and tint the media with `.dialog-media-danger`. Name the action on the button (“Delete chat”), not just “Continue”.

```html
<button type="button" class="btn btn-danger" commandfor="alert-destructive" command="show-modal">Delete chat</button>
<dialog id="alert-destructive" class="dialog dialog-sm" data-dialog role="alertdialog" aria-labelledby="alert-destructive-title" aria-describedby="alert-destructive-description">
  <div class="dialog-header">
    <div class="dialog-media dialog-media-danger"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-8" aria-hidden="true"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></div>
    <h2 class="dialog-title" id="alert-destructive-title">Delete chat?</h2>
    <p class="dialog-description" id="alert-destructive-description">This will permanently delete this chat conversation. View <a class="link" href="#settings">Settings</a> to delete any memories saved during this chat.</p>
  </div>
  <div class="dialog-footer">
    <button type="button" class="btn btn-outline" data-dialog-close="cancel" autofocus>Cancel</button>
    <button type="button" class="btn btn-danger" data-dialog-close="delete">Delete</button>
  </div>
</dialog>
```

## Confirming an htmx request

Put the request on the confirming button. `data-dialog-close` closes the dialog at once and htmx sends the request; the response goes to the button's `hx-target`.

```html
<button type="button" class="btn btn-outline" commandfor="alert-htmx" command="show-modal"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg> Reset API key</button>
<dialog id="alert-htmx" class="dialog" data-dialog role="alertdialog" aria-labelledby="alert-htmx-title" aria-describedby="alert-htmx-description">
  <div class="dialog-header">
    <h2 class="dialog-title" id="alert-htmx-title">Reset your API key?</h2>
    <p class="dialog-description" id="alert-htmx-description">Apps using the current key will stop working until you update them.</p>
  </div>
  <div class="dialog-footer">
    <button type="button" class="btn btn-outline" data-dialog-close="cancel" autofocus>Cancel</button>
    <button type="button" class="btn btn-danger" data-dialog-close="reset" hx-post="/api/slow" hx-target="#alert-htmx-result">Reset key</button>
  </div>
</dialog>
<span id="alert-htmx-result" class="muted"></span>
```

To act on the answer in your own script instead, listen for the dialog's `close` event and read `returnValue`:

```ts
const dialog = document.querySelector<HTMLDialogElement>("#alert-basic")!;
dialog.addEventListener("close", () => {
  if (dialog.returnValue === "continue") deleteAccount();
  dialog.returnValue = ""; // reset for the next time it opens
});
```

## Macro

`dialog()` with `alert=true` writes an alert dialog: the role, no corner button, and the header with optional media.

```jinja
{% from "components/dialog/dialog.html" import dialog %}

<button class="btn btn-danger" commandfor="delete-project" command="show-modal">Delete project</button>
{% call dialog("delete-project", "Delete project?", "All of its pages and files will be removed.",
               alert=true, size="sm", media="trash", media_variant="danger") %}
  <div class="dialog-footer">
    <button class="btn btn-outline" data-dialog-close="cancel" autofocus>Cancel</button>
    <button class="btn btn-danger" data-dialog-close="delete" hx-delete="/projects/42">Delete</button>
  </div>
{% endcall %}
```

## Reference

Alert dialogs use the [dialog classes](/docs/v0.2/components/dialog#reference). These are the parts specific to them:

| Class | Description |
| --- | --- |
| `role="alertdialog"` | On the .dialog: announced as an alert, and a click outside doesn't close it. |
| `.dialog-sm` | Narrow, centred text, buttons side by side at equal width. |
| `.dialog-media` | Icon or image first in the header: beside the title in the default size from sm, centred above it in .dialog-sm. |
| `.dialog-media-danger` | Danger-tinted media, for destructive actions. |
| `[data-dialog-close="value"]` | An answer button: closes the dialog and sets returnValue. |
