---
title: "Card"
description: "Displays a card with a header, content and footer, plus optional media, a header action and scrolling content."
url: "/docs/v0.2/components/card"
section: "Components"
---

# Card

Displays a card with a header, content and footer, plus optional media, a header action and scrolling content.

```html
<div class="card w-full max-w-sm">
  <div class="card-header">
    <h3 class="card-title">Log in to your account</h3>
    <p class="card-description">Enter your email below to log in.</p>
    <div class="card-action"><a href="#signup" class="btn btn-link">Sign up</a></div>
  </div>
  <div class="card-content">
    <div class="field">
      <label class="field-label" for="card-email">Email</label>
      <input class="input" id="card-email" type="email" placeholder="you@example.com" />
    </div>
  </div>
  <div class="card-footer flex-col">
    <button class="btn btn-primary w-full">Log in</button>
    <button class="btn btn-outline w-full">Log in with SSO</button>
  </div>
</div>
```

## Parts

Every part is optional. `.card` itself has no padding; the header, content and footer each pad themselves, so media, tables and lists can run edge to edge.

- `.card-header` holds `.card-title` and `.card-description`.
- `.card-action`, inside the header, sits in its top-right corner beside the title and description.
- `.card-content` is the body. `.card-footer` is a row for actions, pinned to the bottom of tall cards.

```html
<div class="card w-full max-w-sm">
  <div class="card-header">
    <h3 class="card-title">Notifications</h3>
    <p class="card-description">You have 3 unread messages.</p>
    <div class="card-action">
      <button class="btn btn-ghost btn-icon btn-sm" aria-label="Settings"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></button>
    </div>
  </div>
  <div class="card-content">
    <p class="muted">Your call has been confirmed. Your subscription is expiring soon.</p>
  </div>
  <div class="card-footer justify-end">
    <button class="btn btn-ghost">Dismiss</button>
    <button class="btn btn-primary"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg> Mark all as read</button>
  </div>
</div>
```

## Image

`.card-image` on an `<img>` (or video, or any media block) runs it edge to edge. As the first or last child, its outer corners follow the card's.

```html
<div class="card w-full max-w-xs">
  <img class="card-image aspect-video" src="../../../images/landscape.svg" alt="Mountains at dusk" />
  <div class="card-header pt-5">
    <h3 class="card-title">Weekend in the mountains</h3>
    <p class="card-description">Two nights, guided hikes, all meals.</p>
    <div class="card-action"><span class="badge badge-secondary">New</span></div>
  </div>
  <div class="card-footer pt-5">
    <button class="btn btn-primary w-full">Book now</button>
  </div>
</div>
<div class="card w-full max-w-xs">
  <div class="card-header pb-5">
    <h3 class="card-title">Image at the bottom</h3>
    <p class="card-description">Last child, so the bottom corners round.</p>
  </div>
  <img class="card-image aspect-video" src="../../../images/landscape.svg" alt="Mountains at dusk" />
</div>
```

### Horizontal

`.card-horizontal` puts the media beside the text from the `sm` breakpoint. Wrap the other parts in `.card-body`.

```html
<div class="card card-horizontal w-full max-w-lg">
  <img class="card-image aspect-video sm:aspect-auto" src="../../../images/landscape.svg" alt="Mountains at dusk" />
  <div class="card-body">
    <div class="card-header">
      <h3 class="card-title">Alpine route</h3>
      <p class="card-description">12 km, 800 m of climbing.</p>
    </div>
    <div class="card-content"><p class="muted">A full-day loop past three lakes. Start early.</p></div>
    <div class="card-footer"><button class="btn btn-outline btn-sm">View map</button></div>
  </div>
</div>
```

## Scrolling content

Add `.card-scroll` to `.card-content` to give long content its own scrollbar while the header and footer stay put. Limit the height on the card (`h-80`, `max-h-96`…) or on the content (`max-h-48`).

```html
<div class="card h-80 w-full max-w-sm">
  <div class="card-header">
    <h3 class="card-title">Terms of service</h3>
    <p class="card-description">Last updated October 2026.</p>
  </div>
  <div class="card-content card-scroll space-y-3 text-sm text-muted-foreground">
    <p>By using the service you agree to these terms. Please read them carefully.</p>
    <p>You are responsible for the content you publish and for keeping your account secure.</p>
    <p>We may change the service at any time. We'll tell you about significant changes in advance.</p>
    <p>We can suspend accounts that break these terms, after warning you where we reasonably can.</p>
    <p>The service is provided as is, without warranties of any kind.</p>
    <p>These terms are governed by the laws of the place where we are registered.</p>
  </div>
  <div class="card-footer border-t pt-4 justify-end">
    <button class="btn btn-ghost">Decline</button>
    <button class="btn btn-primary">Accept</button>
  </div>
</div>
```

## Size

`.card-sm` uses tighter padding.

```html
<div class="card card-sm w-full max-w-xs">
  <div class="card-header">
    <h3 class="card-title">Small card</h3>
    <p class="card-description">16px padding instead of 24px.</p>
  </div>
  <div class="card-content"><p class="muted text-sm">Good for dense dashboards.</p></div>
</div>
```

## Clickable card

Make the whole card an `<a>` and add `.card-link` for a hover state.

```html
<a href="/docs/components" class="card card-link w-full max-w-sm">
  <div class="card-header pb-6">
    <h3 class="card-title flex items-center justify-between">All components <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg></h3>
    <p class="card-description">Browse every component in the library.</p>
  </div>
</a>
```

## Loading content with htmx

Cards make good swap targets. This one fetches its body from the server:

```html
<div class="card w-full max-w-sm">
  <div class="card-header">
    <h3 class="card-title">Server message</h3>
    <p class="card-description">Fetched with hx-get.</p>
  </div>
  <div class="card-content" id="card-body">
    <button class="btn btn-outline btn-sm" hx-get="/api/hello" hx-target="#card-body">Load</button>
  </div>
</div>
```

## Reference

| Class | Description |
| --- | --- |
| `.card` | Container: border, surface colour, radius and shadow. |
| `.card-header` | Top section, padded on three sides. |
| `.card-title` | Heading text. |
| `.card-description` | Muted supporting text. |
| `.card-action` | Inside the header: top-right slot beside the title and description. |
| `.card-content` | Main body, padded on all sides. |
| `.card-scroll` | On .card-content: scrolls on its own when the card or content has a height limit. |
| `.card-footer` | Bottom row for actions; pinned to the bottom of tall cards. |
| `.card-image` | Edge-to-edge media; outer corners follow the card's. |
| `.card-horizontal` | Media beside the content from the sm breakpoint. Wrap the parts in .card-body. |
| `.card-sm` | Tighter padding. |
| `.card-link` | Hover style for cards that are links. |
