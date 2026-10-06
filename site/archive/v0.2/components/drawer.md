---
title: "Drawer"
description: "A panel that slides in from an edge of the screen and can be swiped away, on the native <dialog> element."
url: "/docs/v0.2/components/drawer"
section: "Components"
---

# Drawer

A panel that slides in from an edge of the screen and can be swiped away, on the native <dialog> element.

```html
<button type="button" class="btn btn-outline" commandfor="drawer-goal" command="show-modal">Open drawer</button>
<dialog id="drawer-goal" class="drawer" data-dialog data-drawer data-swipe-direction="down" aria-labelledby="drawer-goal-title" aria-describedby="drawer-goal-description">
  <div class="drawer-handle"></div>
  <div class="mx-auto flex w-full max-w-sm flex-col gap-4">
    <div class="drawer-header">
      <h2 class="drawer-title" id="drawer-goal-title">Move goal</h2>
      <p class="drawer-description" id="drawer-goal-description">Set your daily activity goal.</p>
    </div>
    <div class="flex items-center justify-center gap-4">
      <button type="button" class="btn btn-outline btn-icon btn-rounded" aria-label="Decrease"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M5 12h14"/></svg></button>
      <div class="flex-1 text-center">
        <p class="text-7xl font-bold tracking-tighter">350</p>
        <p class="text-xs text-muted-foreground uppercase">Calories/day</p>
      </div>
      <button type="button" class="btn btn-outline btn-icon btn-rounded" aria-label="Increase"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M5 12h14M12 5v14"/></svg></button>
    </div>
    <div class="flex h-24 items-end gap-1" role="img" aria-label="Calories burned on each of the last 13 days, between 189 and 400">
      <div class="flex-1 rounded-sm bg-primary" style="height: 100%"></div>
      <div class="flex-1 rounded-sm bg-primary" style="height: 75%"></div>
      <div class="flex-1 rounded-sm bg-primary" style="height: 50%"></div>
      <div class="flex-1 rounded-sm bg-primary" style="height: 75%"></div>
      <div class="flex-1 rounded-sm bg-primary" style="height: 50%"></div>
      <div class="flex-1 rounded-sm bg-primary" style="height: 70%"></div>
      <div class="flex-1 rounded-sm bg-primary" style="height: 47%"></div>
      <div class="flex-1 rounded-sm bg-primary" style="height: 60%"></div>
      <div class="flex-1 rounded-sm bg-primary" style="height: 75%"></div>
      <div class="flex-1 rounded-sm bg-primary" style="height: 50%"></div>
      <div class="flex-1 rounded-sm bg-primary" style="height: 70%"></div>
      <div class="flex-1 rounded-sm bg-primary" style="height: 47%"></div>
      <div class="flex-1 rounded-sm bg-primary" style="height: 87%"></div>
    </div>
    <div class="drawer-footer">
      <button type="button" class="btn btn-outline" data-dialog-close>Cancel</button>
      <button type="button" class="btn btn-primary" data-dialog-close="submit">Submit</button>
    </div>
  </div>
</dialog>
```

## Markup

A drawer is a native `<dialog>` with `.drawer`, `data-dialog` and `data-drawer`. `data-dialog` makes it a [dialog](/docs/v0.2/components/dialog): it opens and closes the same ways, puts the rest of the page out of reach while it is open, and works with htmx the same way. `data-drawer` adds swiping and stacking. Without JavaScript it still opens (in browsers with invoker commands) and closes with `Esc` or a `<form method="dialog">`.

- `.drawer-handle` is the bar on the drawer's free edge. It is optional: the whole drawer can be dragged.
- `.drawer-header` holds `.drawer-title` and `.drawer-description`. Point `aria-labelledby` and `aria-describedby` at them.
- `.drawer-content` is an optional body that scrolls on its own, keeping the header and footer in view.
- `.drawer-footer` holds the actions, stacked with the last one on top.

A drawer on the bottom or top edge is full width and as tall as its content, up to 80% of the viewport. To keep its content narrow on wide screens, wrap it in a centred column, as the demo above does with `mx-auto w-full max-w-sm`.

## Swipe direction

`data-swipe-direction` is the way a swipe dismisses the drawer, and so the edge it is attached to: `down` (the default) on the bottom edge, `up` on the top, `right` on the right and `left` on the left. Side drawers are full height, three quarters of the screen wide and at most `max-w-sm`; change that with `max-w-*` or `w-*` utilities.

```html
<button type="button" class="btn btn-outline" commandfor="drawer-dir-up" command="show-modal">Up</button>
<dialog id="drawer-dir-up" class="drawer" data-dialog data-drawer data-swipe-direction="up" aria-labelledby="drawer-dir-up-title" aria-describedby="drawer-dir-up-description">
  <div class="drawer-handle"></div>
  <div class="drawer-header">
    <h2 class="drawer-title" id="drawer-dir-up-title">Swipe up</h2>
    <p class="drawer-description" id="drawer-dir-up-description">Drag this drawer up to dismiss it.</p>
  </div>
  <div class="drawer-footer">
    <button type="button" class="btn btn-outline" data-dialog-close>Close</button>
  </div>
</dialog>
<button type="button" class="btn btn-outline" commandfor="drawer-dir-right" command="show-modal">Right</button>
<dialog id="drawer-dir-right" class="drawer" data-dialog data-drawer data-swipe-direction="right" aria-labelledby="drawer-dir-right-title" aria-describedby="drawer-dir-right-description">
  <div class="drawer-handle"></div>
  <div class="drawer-header">
    <h2 class="drawer-title" id="drawer-dir-right-title">Swipe right</h2>
    <p class="drawer-description" id="drawer-dir-right-description">Drag this drawer right to dismiss it.</p>
  </div>
  <div class="drawer-footer">
    <button type="button" class="btn btn-outline" data-dialog-close>Close</button>
  </div>
</dialog>
<button type="button" class="btn btn-outline" commandfor="drawer-dir-down" command="show-modal">Down</button>
<dialog id="drawer-dir-down" class="drawer" data-dialog data-drawer data-swipe-direction="down" aria-labelledby="drawer-dir-down-title" aria-describedby="drawer-dir-down-description">
  <div class="drawer-handle"></div>
  <div class="drawer-header">
    <h2 class="drawer-title" id="drawer-dir-down-title">Swipe down</h2>
    <p class="drawer-description" id="drawer-dir-down-description">Drag this drawer down to dismiss it.</p>
  </div>
  <div class="drawer-footer">
    <button type="button" class="btn btn-outline" data-dialog-close>Close</button>
  </div>
</dialog>
<button type="button" class="btn btn-outline" commandfor="drawer-dir-left" command="show-modal">Left</button>
<dialog id="drawer-dir-left" class="drawer" data-dialog data-drawer data-swipe-direction="left" aria-labelledby="drawer-dir-left-title" aria-describedby="drawer-dir-left-description">
  <div class="drawer-handle"></div>
  <div class="drawer-header">
    <h2 class="drawer-title" id="drawer-dir-left-title">Swipe left</h2>
    <p class="drawer-description" id="drawer-dir-left-description">Drag this drawer left to dismiss it.</p>
  </div>
  <div class="drawer-footer">
    <button type="button" class="btn btn-outline" data-dialog-close>Close</button>
  </div>
</dialog>
```

## Swipe handle

`.drawer-handle`, first inside the drawer, draws a bar on its free edge (the top of a bottom drawer, the left of a right one) and leaves room for it. It tells people the drawer can be dragged. By default a drag can start anywhere on the drawer; `data-drawer-handle-only` limits it to the handle, so the content stays free for selecting text or for gestures of its own.

```html
<button type="button" class="btn btn-outline" commandfor="drawer-handle-only" command="show-modal">Handle only</button>
<dialog id="drawer-handle-only" class="drawer" data-dialog data-drawer data-drawer-handle-only aria-labelledby="drawer-handle-only-title">
  <div class="drawer-handle"></div>
  <div class="mx-auto flex w-full max-w-sm flex-col gap-4">
    <div class="drawer-header">
      <h2 class="drawer-title" id="drawer-handle-only-title">API key</h2>
      <p class="drawer-description">Only the handle drags this drawer, so the key below can be selected.</p>
    </div>
    <p class="rounded-md bg-muted p-3 text-center font-mono break-all">demo-7f3a9c2e-1b4d-4e8a-9c61-2d5f0b8e7a13</p>
    <div class="drawer-footer">
      <button type="button" class="btn btn-outline" data-dialog-close>Done</button>
    </div>
  </div>
</dialog>
```

## Nested drawers

A button inside a drawer can open another drawer. The first one stays open behind it, shrinks a little and steps back, so the stack shows; it returns when the one in front closes. `Esc`, a swipe or a click outside closes only the frontmost. The inner `<dialog>` can sit inside the outer one's markup or anywhere else on the page, referenced by `commandfor`; in this demo the second level is inside the first and the third is not.

```html
<button type="button" class="btn btn-outline" commandfor="drawer-nested-1" command="show-modal">Open drawer</button>
<dialog id="drawer-nested-1" class="drawer" data-dialog data-drawer aria-labelledby="drawer-nested-1-title">
  <div class="drawer-handle"></div>
  <div class="mx-auto flex w-full max-w-sm flex-col gap-4">
    <div class="drawer-header">
      <h2 class="drawer-title" id="drawer-nested-1-title">Account</h2>
      <p class="drawer-description">The first drawer.</p>
    </div>
    <div class="drawer-footer">
      <button type="button" class="btn btn-outline" data-dialog-close>Close</button>
      <button type="button" class="btn btn-primary" commandfor="drawer-nested-2" command="show-modal">Security settings</button>
    </div>
  </div>
  <dialog id="drawer-nested-2" class="drawer" data-dialog data-drawer aria-labelledby="drawer-nested-2-title">
    <div class="drawer-handle"></div>
    <div class="mx-auto flex w-full max-w-sm flex-col gap-4">
      <div class="drawer-header">
        <h2 class="drawer-title" id="drawer-nested-2-title">Security</h2>
        <p class="drawer-description">The second drawer, inside the first one's markup.</p>
      </div>
      <div class="drawer-footer">
        <button type="button" class="btn btn-outline" data-dialog-close>Back</button>
        <button type="button" class="btn btn-primary" commandfor="drawer-nested-3" command="show-modal">Change password</button>
      </div>
    </div>
  </dialog>
</dialog>
<dialog id="drawer-nested-3" class="drawer" data-dialog data-drawer aria-labelledby="drawer-nested-3-title">
  <div class="drawer-handle"></div>
  <div class="mx-auto flex w-full max-w-sm flex-col gap-4">
    <div class="drawer-header">
      <h2 class="drawer-title" id="drawer-nested-3-title">Change password</h2>
      <p class="drawer-description">The third drawer, elsewhere on the page.</p>
    </div>
    <form class="contents" method="dialog">
      <div class="field">
        <label class="field-label" for="drawer-nested-password">New password</label>
        <input class="input" id="drawer-nested-password" type="password" name="password" autocomplete="new-password" />
      </div>
      <div class="drawer-footer">
        <button type="button" class="btn btn-outline" data-dialog-close>Back</button>
        <button class="btn btn-primary" value="save">Save</button>
      </div>
    </form>
  </div>
</dialog>
```

Each open drawer gets `--nested-drawers`, the number of drawers open in front of it, and `data-nested-drawer-open` while that is more than zero; a drawer opened over another gets `data-drawer-nested` and a lighter backdrop. Style the stack with them, for example to fade the content of the drawers behind:

```css
.drawer[data-nested-drawer-open] > :not(dialog) {
  opacity: 0.5;
}
```

## Responsive dialog

`.drawer-responsive` makes one element serve as a drawer on small screens and as a centred [dialog](/docs/v0.2/components/dialog) from the `md` breakpoint up, where the handle is hidden and swiping is off. Resize the window to see both.

```html
<button type="button" class="btn btn-outline" commandfor="drawer-responsive" command="show-modal">Edit profile</button>
<dialog id="drawer-responsive" class="drawer drawer-responsive" data-dialog data-drawer aria-labelledby="drawer-responsive-title" aria-describedby="drawer-responsive-description">
  <div class="drawer-handle"></div>
  <div class="drawer-header">
    <h2 class="drawer-title" id="drawer-responsive-title">Edit profile</h2>
    <p class="drawer-description" id="drawer-responsive-description">Make changes to your profile here. Click save when you're done.</p>
  </div>
  <form class="contents" method="dialog">
    <div class="grid gap-4">
      <div class="field">
        <label class="field-label" for="drawer-responsive-email">Email</label>
        <input class="input" id="drawer-responsive-email" type="email" name="email" value="rin@example.com" />
      </div>
      <div class="field">
        <label class="field-label" for="drawer-responsive-username">Username</label>
        <input class="input" id="drawer-responsive-username" name="username" value="@rin" />
      </div>
    </div>
    <div class="drawer-footer">
      <button type="button" class="btn btn-outline" data-dialog-close>Cancel</button>
      <button class="btn btn-primary" value="save">Save changes</button>
    </div>
  </form>
</dialog>
```

The switch is the custom property `--drawer-swipe: none`, which `.drawer-responsive` sets from `md`. Set it yourself, in any media query or on any drawer, to turn swiping off.

## Scrolling content

Long content goes in `.drawer-content`, which scrolls between a header and footer that stay in view. A swipe that starts in it scrolls the content until it reaches the end it is moving towards; only then does the drawer move. Here, scroll the list back to the top and keep pulling down to dismiss it.

```html
<button type="button" class="btn btn-outline" commandfor="drawer-scroll" command="show-modal">Notifications</button>
<dialog id="drawer-scroll" class="drawer" data-dialog data-drawer aria-labelledby="drawer-scroll-title">
  <div class="drawer-handle"></div>
  <div class="drawer-header">
    <h2 class="drawer-title" id="drawer-scroll-title">Notifications</h2>
    <p class="drawer-description">You have 20 unread messages.</p>
  </div>
  <ul class="drawer-content mx-auto w-full max-w-md divide-y divide-border">
    <li class="py-3">
      <p class="font-medium">Deployment 1 finished</p>
      <p class="muted">htmx-ui · production · 3 minutes ago</p>
    </li>
    <li class="py-3">
      <p class="font-medium">Deployment 2 finished</p>
      <p class="muted">htmx-ui · production · 6 minutes ago</p>
    </li>
    <li class="py-3">
      <p class="font-medium">Deployment 3 finished</p>
      <p class="muted">htmx-ui · production · 9 minutes ago</p>
    </li>
    <li class="py-3">
      <p class="font-medium">Deployment 4 finished</p>
      <p class="muted">htmx-ui · production · 12 minutes ago</p>
    </li>
    <li class="py-3">
      <p class="font-medium">Deployment 5 finished</p>
      <p class="muted">htmx-ui · production · 15 minutes ago</p>
    </li>
    <li class="py-3">
      <p class="font-medium">Deployment 6 finished</p>
      <p class="muted">htmx-ui · production · 18 minutes ago</p>
    </li>
    <li class="py-3">
      <p class="font-medium">Deployment 7 finished</p>
      <p class="muted">htmx-ui · production · 21 minutes ago</p>
    </li>
    <li class="py-3">
      <p class="font-medium">Deployment 8 finished</p>
      <p class="muted">htmx-ui · production · 24 minutes ago</p>
    </li>
    <li class="py-3">
      <p class="font-medium">Deployment 9 finished</p>
      <p class="muted">htmx-ui · production · 27 minutes ago</p>
    </li>
    <li class="py-3">
      <p class="font-medium">Deployment 10 finished</p>
      <p class="muted">htmx-ui · production · 30 minutes ago</p>
    </li>
    <li class="py-3">
      <p class="font-medium">Deployment 11 finished</p>
      <p class="muted">htmx-ui · production · 33 minutes ago</p>
    </li>
    <li class="py-3">
      <p class="font-medium">Deployment 12 finished</p>
      <p class="muted">htmx-ui · production · 36 minutes ago</p>
    </li>
    <li class="py-3">
      <p class="font-medium">Deployment 13 finished</p>
      <p class="muted">htmx-ui · production · 39 minutes ago</p>
    </li>
    <li class="py-3">
      <p class="font-medium">Deployment 14 finished</p>
      <p class="muted">htmx-ui · production · 42 minutes ago</p>
    </li>
    <li class="py-3">
      <p class="font-medium">Deployment 15 finished</p>
      <p class="muted">htmx-ui · production · 45 minutes ago</p>
    </li>
    <li class="py-3">
      <p class="font-medium">Deployment 16 finished</p>
      <p class="muted">htmx-ui · production · 48 minutes ago</p>
    </li>
    <li class="py-3">
      <p class="font-medium">Deployment 17 finished</p>
      <p class="muted">htmx-ui · production · 51 minutes ago</p>
    </li>
    <li class="py-3">
      <p class="font-medium">Deployment 18 finished</p>
      <p class="muted">htmx-ui · production · 54 minutes ago</p>
    </li>
    <li class="py-3">
      <p class="font-medium">Deployment 19 finished</p>
      <p class="muted">htmx-ui · production · 57 minutes ago</p>
    </li>
    <li class="py-3">
      <p class="font-medium">Deployment 20 finished</p>
      <p class="muted">htmx-ui · production · 60 minutes ago</p>
    </li>
  </ul>
  <div class="drawer-footer mx-auto w-full max-w-md">
    <button type="button" class="btn btn-outline" data-dialog-close>Close</button>
  </div>
</dialog>
```

## Keyboard and gestures

- `Esc` closes the frontmost drawer.
- `Tab` and `Shift` + `Tab` move through the drawer's controls; the page behind it is inert.
- Dragging the drawer (with a finger, a pen or the mouse) towards its edge moves it. Released more than 30% of the way, or flicked, it closes; otherwise it springs back.
- A drag doesn't start on inputs, text areas, selects, buttons or links, on anything marked `data-drawer-no-drag`, or in content that can still scroll the way the pointer moves.
- A click outside the drawer closes it, as for a dialog.

A swipe that dismisses the drawer fires a cancelable `cancel` event first, as `Esc` does: call `preventDefault()` on it to keep the drawer open (it springs back). Then the native `close` event fires, with an empty `returnValue`. While a drag is under way the drawer has `data-swiping`, `--drawer-swipe-movement` (pixels towards its edge) and `--drawer-swipe-progress` (0 to 1), which also fades the backdrop.

## With htmx

### Posting a form, closing from the server

A form in a drawer posts with htmx like any other. When the server has saved it, the response header `HX-Trigger: dialog:close` closes the drawer it came from, while the body goes to the form's `hx-target`. On a validation error, leave the header off and return the form with its messages. This demo posts to the same endpoint as the dialog's.

```html
<button type="button" class="btn btn-outline" commandfor="drawer-rename" command="show-modal">Rename project</button>
<span id="drawer-rename-result" class="muted"></span>
<dialog id="drawer-rename" class="drawer drawer-responsive" data-dialog data-drawer aria-labelledby="drawer-rename-title">
  <div class="drawer-handle"></div>
  <div class="drawer-header">
    <h2 class="drawer-title" id="drawer-rename-title">Rename project</h2>
    <p class="drawer-description">The server closes this drawer once it has saved the name.</p>
  </div>
  <form class="contents" hx-post="/api/dialog/save" hx-target="#drawer-rename-result">
    <div class="field">
      <label class="field-label" for="drawer-rename-name">Name</label>
      <input class="input" id="drawer-rename-name" name="name" value="htmx-ui" required />
    </div>
    <div class="drawer-footer">
      <button type="button" class="btn btn-outline" data-dialog-close>Cancel</button>
      <button class="btn btn-primary">Save</button>
    </div>
  </form>
</dialog>
```

```text
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
HX-Trigger: dialog:close

<span class="text-success">Renamed to htmx-ui</span>
```

### A drawer from the server

A drawer can also come from the server. `data-dialog-show` opens it as soon as htmx inserts it, and `data-dialog-remove` takes it out of the page once it has slid away (swiped or not), so every click loads a fresh one. Append it to the body:

```html
<button class="btn btn-outline" hx-get="/api/share" hx-target="body" hx-swap="beforeend">Share</button>

<!-- The response <!-- The response -->
<dialog class="drawer" data-dialog data-drawer data-dialog-show data-dialog-remove aria-labelledby="share-title">
  <div class="drawer-handle"></div>
  <div class="drawer-header">
    <h2 class="drawer-title" id="share-title">Share</h2>
  </div>
  <div class="drawer-content">…</div>
</dialog>
```

## Macro

`drawer()` writes the `<dialog>`, its handle and header, with the ids and ARIA attributes wired up. The call body is everything after the header.

```jinja
{% from "components/drawer/drawer.html" import drawer %}

<button class="btn btn-outline" commandfor="filters" command="show-modal">Filters</button>
{% call drawer("filters", "Filters", "Narrow down the list.", responsive=true) %}
  <div class="drawer-content">…</div>
  <div class="drawer-footer">
    <button class="btn btn-outline" data-dialog-close>Reset</button>
    <button class="btn btn-primary" data-dialog-close="apply">Apply</button>
  </div>
{% endcall %}
```

| Parameter | Description |
| --- | --- |
| `id` | Required. The id buttons point commandfor at; also prefixes the title and description ids. |
| `title, description` | Header text. Each sets aria-labelledby / aria-describedby. |
| `direction="down"` | data-swipe-direction: "down", "up", "left" or "right". |
| `handle=true` | The .drawer-handle bar. false leaves it out. |
| `handle_only=false` | true adds data-drawer-handle-only. |
| `responsive=false` | true adds .drawer-responsive: a centred dialog from md. |
| `show, remove` | data-dialog-show and data-dialog-remove, for drawers returned by htmx. |
| `class` | More classes on the <dialog>. |

## Accessibility

- A drawer is a modal dialog: the browser moves focus into it, makes the page behind it inert and returns focus to the opening button when it closes.
- Give every drawer a name: `aria-labelledby` pointing at its title, or `aria-label`.
- Swiping is never the only way out. Keep a close or cancel button in the drawer for people who can't drag; `Esc` and a click outside work too.
- The handle is decoration for pointers and is not focusable.
- The slide is skipped for people who ask for reduced motion; dragging still works.

## Reference

| Class | Description |
| --- | --- |
| `.drawer` | The <dialog>: attached to an edge, slides in and out, follows a drag. Bottom and top: full width, up to 80dvh tall. Left and right: full height, w-3/4 up to max-w-sm. |
| `.drawer-handle` | The bar on the free edge; the drawer leaves room for it. |
| `.drawer-header / .drawer-title / .drawer-description` | Title block: centred on bottom and top drawers. |
| `.drawer-content` | Body that scrolls on its own. |
| `.drawer-footer` | Actions, stacked with the last on top (a right-aligned row in a responsive drawer from md). |
| `.drawer-responsive` | A centred dialog with no handle and no swiping from md up. |
| `[data-dialog]` | The dialog behaviour: closes on a click outside and on [data-dialog-close], opens command buttons in older browsers. |
| `[data-drawer]` | Swiping and nested-drawer state. |
| `[data-swipe-direction]` | down (default), up, right or left: the way a swipe dismisses it and the edge it is on. |
| `[data-drawer-handle-only]` | Only .drawer-handle starts a drag. |
| `[data-drawer-no-drag]` | On any element inside: a drag can't start there. |
| `[data-swiping]` | Set while it is being dragged. |
| `[data-nested-drawer-open]` | Set while another drawer is open in front of it. |
| `[data-drawer-nested]` | Set on a drawer opened over another; it gets a lighter backdrop. |
| `--nested-drawers` | The number of drawers open in front of it (0 for the frontmost). |
| `--drawer-swipe-movement / --drawer-swipe-progress` | During a drag: pixels towards its edge, and that as a fraction (0 to 1) of its size. |
| `--drawer-swipe: none` | Turns swiping off (set by .drawer-responsive from md). |
| `[data-dialog-close="value"]` | Closes the drawer it is in; the value becomes returnValue. |
| `[data-dialog-show] / [data-dialog-remove]` | Open as a modal when initialised / remove from the page once closed. |
| `cancel, close events` | A dismissing swipe fires cancel (cancelable), then close. |
| `dialog:close event` | Closes the drawer it is dispatched in, e.g. from an HX-Trigger response header. |
