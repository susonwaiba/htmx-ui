---
title: "Avatar"
description: "An image element with a fallback for representing the user."
url: "/docs/v0.2/components/avatar"
section: "Components"
---

# Avatar

An image element with a fallback for representing the user.

```html
<span class="avatar" role="img" aria-label="Ana Lima">
  <img class="avatar-image" src="../../../images/avatar-1.svg" alt="" />
  <span class="avatar-fallback" aria-hidden="true">AL</span>
</span>
<span class="avatar" role="img" aria-label="Kofi Mensah">
  <span class="avatar-fallback" aria-hidden="true">KM</span>
</span>
<span class="avatar avatar-square" role="img" aria-label="Ravi Patel">
  <img class="avatar-image" src="../../../images/avatar-3.svg" alt="" />
  <span class="avatar-fallback" aria-hidden="true">RP</span>
</span>
```

## Image and fallback

`.avatar` holds an `.avatar-image` on top of an `.avatar-fallback`, usually initials or an icon. The fallback shows while the image loads, when there is no image, and when it fails to load: the avatar behaviour hides an image that errors, so the fallback shows instead of a broken-image icon. It runs on avatars in fragments from the server too.

Name the person once, on the avatar: `role="img"` and `aria-label` on `.avatar`, `alt=""` on the image and `aria-hidden="true"` on the fallback. Next to the visible name, the avatar is decorative: drop the role and label and give it `aria-hidden="true"`.

```html
<span class="avatar avatar-lg" role="img" aria-label="Ana Lima">
  <img class="avatar-image" src="../../../images/avatar-1.svg" alt="" />
  <span class="avatar-fallback" aria-hidden="true">AL</span>
</span>
<span class="avatar avatar-lg" role="img" aria-label="Kofi Mensah">
  <span class="avatar-fallback" aria-hidden="true">KM</span>
</span>
<span class="avatar avatar-lg" role="img" aria-label="Unknown user">
  <span class="avatar-fallback" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span>
</span>
```

## Sizes

`.avatar-sm` (1.5rem), the default (2rem), `.avatar-lg` (2.5rem) and `.avatar-xl` (3.5rem). The fallback text and badge scale with them; any `size-*` utility works too.

```html
<span class="avatar avatar-sm" role="img" aria-label="Mei Chen">
  <img class="avatar-image" src="../../../images/avatar-4.svg" alt="" />
  <span class="avatar-fallback" aria-hidden="true">MC</span>
</span>
<span class="avatar " role="img" aria-label="Mei Chen">
  <img class="avatar-image" src="../../../images/avatar-4.svg" alt="" />
  <span class="avatar-fallback" aria-hidden="true">MC</span>
</span>
<span class="avatar avatar-lg" role="img" aria-label="Mei Chen">
  <img class="avatar-image" src="../../../images/avatar-4.svg" alt="" />
  <span class="avatar-fallback" aria-hidden="true">MC</span>
</span>
<span class="avatar avatar-xl" role="img" aria-label="Mei Chen">
  <img class="avatar-image" src="../../../images/avatar-4.svg" alt="" />
  <span class="avatar-fallback" aria-hidden="true">MC</span>
</span>
<span class="avatar avatar-sm" role="img" aria-label="Mei Chen">
  <span class="avatar-fallback" aria-hidden="true">MC</span>
</span>
<span class="avatar " role="img" aria-label="Mei Chen">
  <span class="avatar-fallback" aria-hidden="true">MC</span>
</span>
<span class="avatar avatar-lg" role="img" aria-label="Mei Chen">
  <span class="avatar-fallback" aria-hidden="true">MC</span>
</span>
<span class="avatar avatar-xl" role="img" aria-label="Mei Chen">
  <span class="avatar-fallback" aria-hidden="true">MC</span>
</span>
```

## Badge

`.avatar-badge` adds a dot at the bottom right, ringed in the page colour. It is `bg-primary`; colour it with any `bg-*` utility for a status. A dot means nothing to a screen reader, so say the status in the avatar's label.

```html
<span class="avatar" role="img" aria-label="Ana Lima, online">
  <img class="avatar-image" src="../../../images/avatar-1.svg" alt="" />
  <span class="avatar-fallback" aria-hidden="true">AL</span>
  <span class="avatar-badge bg-success"></span>
</span>
<span class="avatar avatar-lg" role="img" aria-label="Kofi Mensah, away">
  <img class="avatar-image" src="../../../images/avatar-2.svg" alt="" />
  <span class="avatar-fallback" aria-hidden="true">KM</span>
  <span class="avatar-badge bg-warning"></span>
</span>
<span class="avatar avatar-xl" role="img" aria-label="Ravi Patel, offline">
  <img class="avatar-image" src="../../../images/avatar-3.svg" alt="" />
  <span class="avatar-fallback" aria-hidden="true">RP</span>
  <span class="avatar-badge bg-muted-foreground"></span>
</span>
```

### Badge with an icon

An icon inside the badge makes it big enough to read.

```html
<span class="avatar" role="img" aria-label="Ana Lima, verified">
  <img class="avatar-image" src="../../../images/avatar-1.svg" alt="" />
  <span class="avatar-fallback" aria-hidden="true">AL</span>
  <span class="avatar-badge"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span>
</span>
<span class="avatar avatar-lg" role="img" aria-label="Kofi Mensah, admin">
  <img class="avatar-image" src="../../../images/avatar-2.svg" alt="" />
  <span class="avatar-fallback" aria-hidden="true">KM</span>
  <span class="avatar-badge bg-warning"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></svg></span>
</span>
<span class="avatar avatar-xl" role="img" aria-label="Ravi Patel, 2 new messages">
  <img class="avatar-image" src="../../../images/avatar-3.svg" alt="" />
  <span class="avatar-fallback" aria-hidden="true">RP</span>
  <span class="avatar-badge bg-danger"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg></span>
</span>
```

## Group

`.avatar-group` overlaps avatars in a row and rings each one in the page colour. Give it `role="group"` and a label.

```html
<div class="avatar-group" role="group" aria-label="Project members">
  <span class="avatar" role="img" aria-label="Ana Lima"><img class="avatar-image" src="../../../images/avatar-1.svg" alt="" /><span class="avatar-fallback" aria-hidden="true">AL</span></span>
  <span class="avatar" role="img" aria-label="Kofi Mensah"><img class="avatar-image" src="../../../images/avatar-2.svg" alt="" /><span class="avatar-fallback" aria-hidden="true">KM</span></span>
  <span class="avatar" role="img" aria-label="Ravi Patel"><img class="avatar-image" src="../../../images/avatar-3.svg" alt="" /><span class="avatar-fallback" aria-hidden="true">RP</span></span>
  <span class="avatar" role="img" aria-label="Mei Chen"><img class="avatar-image" src="../../../images/avatar-4.svg" alt="" /><span class="avatar-fallback" aria-hidden="true">MC</span></span>
</div>
```

### With a count

`.avatar-group-count` on an `.avatar` ends the group with the number of people not shown. It takes the avatar size classes.

```html
<div class="avatar-group" role="group" aria-label="Project members">
  <span class="avatar" role="img" aria-label="Ana Lima"><img class="avatar-image" src="../../../images/avatar-1.svg" alt="" /><span class="avatar-fallback" aria-hidden="true">AL</span></span>
  <span class="avatar" role="img" aria-label="Kofi Mensah"><img class="avatar-image" src="../../../images/avatar-2.svg" alt="" /><span class="avatar-fallback" aria-hidden="true">KM</span></span>
  <span class="avatar" role="img" aria-label="Ravi Patel"><img class="avatar-image" src="../../../images/avatar-3.svg" alt="" /><span class="avatar-fallback" aria-hidden="true">RP</span></span>
  <span class="avatar avatar-group-count" role="img" aria-label="and 3 more">+3</span>
</div>
<div class="avatar-group" role="group" aria-label="Reviewers">
  <span class="avatar avatar-lg" role="img" aria-label="Mei Chen"><img class="avatar-image" src="../../../images/avatar-4.svg" alt="" /><span class="avatar-fallback" aria-hidden="true">MC</span></span>
  <span class="avatar avatar-lg" role="img" aria-label="Ana Lima"><img class="avatar-image" src="../../../images/avatar-1.svg" alt="" /><span class="avatar-fallback" aria-hidden="true">AL</span></span>
  <span class="avatar avatar-lg avatar-group-count" role="img" aria-label="and 12 more">+12</span>
</div>
```

### With an icon

An icon in the count, on a button, makes an action at the end of the group, such as inviting someone.

```html
<div class="avatar-group" role="group" aria-label="Project members">
  <span class="avatar avatar-lg" role="img" aria-label="Ana Lima"><img class="avatar-image" src="../../../images/avatar-1.svg" alt="" /><span class="avatar-fallback" aria-hidden="true">AL</span></span>
  <span class="avatar avatar-lg" role="img" aria-label="Kofi Mensah"><img class="avatar-image" src="../../../images/avatar-2.svg" alt="" /><span class="avatar-fallback" aria-hidden="true">KM</span></span>
  <span class="avatar avatar-lg" role="img" aria-label="Ravi Patel"><img class="avatar-image" src="../../../images/avatar-3.svg" alt="" /><span class="avatar-fallback" aria-hidden="true">RP</span></span>
  <button type="button" class="avatar avatar-lg avatar-group-count" aria-label="Invite people"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M5 12h14M12 5v14"/></svg></button>
</div>
```

## As a menu trigger

An avatar can be the button itself, here opening a [dropdown](/docs/v0.2/components/dropdown) of account actions. `.avatar` on a `<button>` or `<a>` gets a pointer and a focus ring. Label the button for what it does.

```html
<div class="dropdown" data-dropdown>
  <button type="button" class="avatar avatar-lg" data-dropdown-trigger aria-haspopup="menu" aria-expanded="false" aria-label="Account menu for Ana Lima">
    <img class="avatar-image" src="../../../images/avatar-1.svg" alt="" />
    <span class="avatar-fallback" aria-hidden="true">AL</span>
  </button>
  <div class="dropdown-menu" role="menu" hidden>
    <div class="flex items-center gap-2 px-2 py-1.5">
      <span class="avatar" aria-hidden="true">
        <img class="avatar-image" src="../../../images/avatar-1.svg" alt="" />
        <span class="avatar-fallback">AL</span>
      </span>
      <div class="grid text-sm leading-tight">
        <span class="font-medium">Ana Lima</span>
        <span class="text-xs text-muted-foreground">ana@example.com</span>
      </div>
    </div>
    <div class="dropdown-separator" role="separator"></div>
    <a class="dropdown-item" role="menuitem" href="#profile"><span class="flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Profile</span></a>
    <a class="dropdown-item" role="menuitem" href="#billing"><span class="flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/></svg> Billing</span></a>
    <div class="dropdown-separator" role="separator"></div>
    <button type="button" class="dropdown-item" role="menuitem"><span class="flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></svg> Log out</span></button>
  </div>
</div>
```

## Reference

| Class | Description |
| --- | --- |
| `.avatar` | Round frame, 2rem. On a button or link: pointer and focus ring. |
| `.avatar-image` | The picture, covering the fallback. Give it alt="". Hidden if it fails to load. |
| `.avatar-fallback` | Initials or an icon underneath; shows when there is no image or it fails. |
| `.avatar-sm / -lg / -xl` | 1.5rem, 2.5rem, 3.5rem; fallback text and badge scale. |
| `.avatar-square` | Rounded square instead of a circle. |
| `.avatar-badge` | Bottom-right dot (bg-primary; colour with bg-*). Bigger with an icon inside. |
| `.avatar-group` | Overlapping row, each avatar ringed in the page colour. |
| `.avatar-group-count` | On an .avatar: "+3" or an icon at the end of a group. |
