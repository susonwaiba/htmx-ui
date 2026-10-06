---
title: "Toast"
description: "A short message that stacks in a corner and leaves on its own: success, info, warning, error and loading types, actions, promises, swipe to dismiss, and toasts sent by the server."
url: "/docs/v0.2/components/toast"
section: "Components"
---

# Toast

A short message that stacks in a corner and leaves on its own: success, info, warning, error and loading types, actions, promises, swipe to dismiss, and toasts sent by the server.

```html
<button type="button" class="btn btn-outline" data-toast="Event has been created" data-toast-description="Sunday, December 3 at 9:00 AM" data-toast-action="Undo">Show toast</button>
```

## How it works

- Toasts stack in a corner, newest in front, the next two peeking out behind it. Hover or focus the stack to fan it out; that also pauses their timers (as does switching browser tab).
- Each slides in from its edge and leaves after 4 seconds, or when closed with its × (on hover), swiped towards the edge, or `Esc` while focused. `Alt`+`T` moves focus to the newest one.
- The toasts sit in a live region, so screen readers read them out; errors are `role="alert"`.
- Show one from script with `toast()`, from markup with `data-toast`, or from the server with an `HX-Trigger` header. No markup is needed in the page: the toaster is created with the first toast.

## Types

`data-toast-type` (or `toast.success()` and friends) sets the icon and its colour: `success`, `info`, `warning`, `error` and `loading`, which spins and stays until it's updated or dismissed.

```html
<button type="button" class="btn btn-outline" data-toast="Event has been created">Default</button>
<button type="button" class="btn btn-outline" data-toast="Changes saved" data-toast-type="success">Success</button>
<button type="button" class="btn btn-outline" data-toast="Be at the venue by 8:45" data-toast-type="info">Info</button>
<button type="button" class="btn btn-outline" data-toast="Your trial ends in 3 days" data-toast-type="warning">Warning</button>
<button type="button" class="btn btn-outline" data-toast="Could not reach the server" data-toast-type="error" data-toast-description="Check your connection and try again.">Error</button>
<button type="button" class="btn btn-outline" data-toast="Uploading report.pdf…" data-toast-type="loading" data-toast-duration="3000">Loading</button>
```

## Action and cancel

`data-toast-action="Undo"` adds a button that dismisses the toast and fires `toast:action` on the element that showed it, so `hx-trigger="toast:action"` can send a request; `data-toast-cancel` adds a quieter one that fires `toast:cancel`. From script, pass `action` / `cancel` with an `onClick` (call `event.preventDefault()` to keep the toast open).

```html
<button type="button" class="btn btn-outline" data-toast="Message archived" data-toast-action="Undo" data-toast-duration="8000" hx-post="/api/echo" hx-vals='{"undo": "archive"}' hx-trigger="toast:action" hx-target="#toast-undo-result">Archive</button>
<button type="button" class="btn btn-outline" data-toast="Delete 3 files?" data-toast-type="warning" data-toast-cancel="Keep" data-toast-action="Delete" data-toast-duration="infinite">Delete files</button>
<p class="text-sm text-muted-foreground" id="toast-undo-result">Archive, then Undo: the request goes out from the toast.</p>
```

## From script

`toast(message, options)` returns the toast's id. Showing another toast with the same `id` updates that one in place.

```ts app.ts
import { toast } from "htmx-ui";

toast("Event has been created", {
  description: "Sunday, December 3 at 9:00 AM",
  action: { label: "Undo", onClick: () => undo() },
});
toast.success("Saved");            // also .info, .warning, .error, .loading
const id = toast.loading("Uploading…");
toast.success("Uploaded", { id }); // replaces the loading toast
toast.dismiss(id);                 // or toast.dismiss() for all

// Loading, then success or error when the promise settles
toast.promise(fetch("/api/save", { method: "POST" }), {
  loading: "Saving…",
  success: (res) => `Saved (${res.status})`,
  error: "Could not save",
});
```

| Option | Description |
| --- | --- |
| `type` | "default" \| "success" \| "info" \| "warning" \| "error" \| "loading". |
| `description` | A second, muted line. |
| `duration` | Milliseconds before it leaves (default 4000; loading: Infinity). Infinity keeps it. |
| `action / cancel` | { label, onClick(event) }: buttons that dismiss the toast unless onClick calls preventDefault(). |
| `id` | Update the toast with this id instead of adding one. |
| `position` | top-left, top-center, top-right, bottom-left, bottom-center or bottom-right. |
| `dismissible` | false: no close button, swipe or Escape. |
| `closeButton / icon` | false hides the close button / the type's icon. |
| `onDismiss / onAutoClose` | Called with the id when the reader dismisses it / its timer ends. |
| `class` | More classes on the toast. |

## An htmx request

`data-toast-loading` on the element that makes a request shows a loading toast while it runs, which becomes `data-toast-success` or `data-toast-error` (any status from 400) when it finishes. Leave one out and the toast just goes.

```html
<button type="button" class="btn btn-outline" hx-post="/api/toast/save" hx-swap="none" data-toast-loading="Saving changes…" data-toast-success="Changes saved" data-toast-error="Could not save">Save</button>
<button type="button" class="btn btn-outline" hx-post="/api/toast/save?fail" hx-swap="none" data-toast-loading="Saving changes…" data-toast-success="Changes saved" data-toast-error="Could not save" data-toast-description="The server answered 500.">Save (fails)</button>
```

## From the server

Send a `toast` event in the `HX-Trigger` response header, with the options as its value (a string is taken as the message):

```http
HX-Trigger: {"toast": {"message": "Profile updated", "type": "success", "description": "Saved at 09:41."}}
```

```html
<button type="button" class="btn btn-outline" hx-post="/api/toast" hx-swap="none">Update profile</button>
```

htmx fires the event on the element that made the request. If the response swaps that element out, it never reaches the page, so add `"target": "body"` to the value. Or return an element instead: `<div data-toast-show="Saved" data-toast-type="success" hidden></div>` shows its toast as it's swapped in and removes itself, which suits an `hx-swap-oob` fragment.

## Position and the toaster

Place a `<section data-toaster>` anywhere in your layout to change the defaults: `data-position`, `data-duration`, `data-visible` (toasts shown in the stack, 3), `data-expand` (always fanned out), `data-close-button="false"` and `data-rich-colors` (tint the whole toast by its type). A toast's own `position` (`data-toast-position`) overrides the toaster's.

```html
<button type="button" class="btn btn-outline btn-sm" data-toast="Toast at top-left" data-toast-position="top-left">top-left</button>
<button type="button" class="btn btn-outline btn-sm" data-toast="Toast at top-center" data-toast-position="top-center">top-center</button>
<button type="button" class="btn btn-outline btn-sm" data-toast="Toast at top-right" data-toast-position="top-right">top-right</button>
<button type="button" class="btn btn-outline btn-sm" data-toast="Toast at bottom-left" data-toast-position="bottom-left">bottom-left</button>
<button type="button" class="btn btn-outline btn-sm" data-toast="Toast at bottom-center" data-toast-position="bottom-center">bottom-center</button>
<button type="button" class="btn btn-outline btn-sm" data-toast="Toast at bottom-right" data-toast-position="bottom-right">bottom-right</button>
```

```html layouts/base.html
<section data-toaster data-position="top-center" data-rich-colors data-visible="4"></section>
```

Width, spacing and distance from the edge are CSS variables on `.toaster-list`: `--toast-width` (356px), `--toast-gap` (14px) and `--toast-inset` (1.5rem). On narrow screens toasts span the width.

## Reference

| Class | Description |
| --- | --- |
| `toast(message, options)` | Show a toast (or update one by id); returns its id. |
| `toast.success / info / warning / error / loading` | toast() with that type. |
| `toast.promise(promise, { loading, success, error })` | A loading toast that turns into the outcome. |
| `toast.dismiss(id?)` | Dismiss one toast, or all. |
| `[data-toast="message"]` | Shows a toast on click; data-toast-type, -description, -duration, -position, -action, -cancel, -id. |
| `[data-toast-loading] / -success / -error` | On an element making an htmx request: loading toast, then the outcome. |
| `[data-toast-show="message"]` | An element that shows a toast when it's added to the page, then removes itself. |
| `HX-Trigger: {"toast": …}` | A toast from a response header. |
| `toast:action / toast:cancel` | Fired on the trigger element when the toast's buttons are clicked. |
| `[data-toaster]` | The toaster's defaults: data-position, -duration, -visible, -expand, -close-button, -rich-colors. |
| `.toast, .toast-title, .toast-description, .toast-action …` | The toast's parts, to restyle; data-type on .toast. |
