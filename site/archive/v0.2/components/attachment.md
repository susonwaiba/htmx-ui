---
title: "Attachment"
description: "Displays a file or image attachment with media, metadata, upload state and actions."
url: "/docs/v0.2/components/attachment"
section: "Components"
---

# Attachment

Displays a file or image attachment with media, metadata, upload state and actions.

```html
<div class="attachment">
  <div class="attachment-media"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4M10 9H8M16 13H8M16 17H8"/></svg></div>
  <div class="attachment-content">
    <p class="attachment-title">quarterly-report.pdf</p>
    <p class="attachment-description">2.4 MB · PDF</p>
  </div>
  <div class="attachment-actions">
    <button type="button" class="btn btn-ghost btn-icon btn-xs" aria-label="Remove quarterly-report.pdf"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
  </div>
</div>
<div class="attachment" data-state="uploading">
  <img class="attachment-media" src="../../../images/landscape.svg" alt="" />
  <div class="attachment-content">
    <p class="attachment-title">mountains-at-dusk.svg</p>
    <p class="attachment-description">Uploading · 64%</p>
  </div>
  <div class="attachment-actions">
    <button type="button" class="btn btn-ghost btn-icon btn-xs" aria-label="Cancel upload of mountains-at-dusk.svg"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
  </div>
  <progress class="attachment-progress" value="64" max="100" aria-label="Upload progress"></progress>
</div>
```

## Parts

- `.attachment` is the frame: media, content and actions in a row.
- `.attachment-media` holds an icon, or an image. It can also be the `<img>` or `<video>` itself.
- `.attachment-content` holds `.attachment-title` (the file name) and `.attachment-description` (size, type, progress or an error). Both truncate.
- `.attachment-actions` holds small icon buttons: remove, download, retry.
- `.attachment-progress` is an optional native `<progress>` along the bottom edge.
- `.attachment-trigger` is an optional link or button covering the whole attachment.

## Upload states

Set `data-state` to `idle`, `uploading`, `processing`, `error` or `done` (the default). Idle attachments have a dashed border. While uploading or processing, the title shimmers and the media pulses. An error turns the border, media and description red; write what went wrong in the description, so it isn't told by colour alone.

```html
<div class="attachment" data-state="idle">
  <div class="attachment-media"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg></div>
  <div class="attachment-content">
    <p class="attachment-title">contract-draft.docx</p>
    <p class="attachment-description">Waiting to upload</p>
  </div>
  <div class="attachment-actions">
    <button type="button" class="btn btn-ghost btn-icon btn-xs" aria-label="Remove contract-draft.docx"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
  </div>
</div>
<div class="attachment" data-state="uploading" aria-busy="true">
  <div class="attachment-media"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4M10 9H8M16 13H8M16 17H8"/></svg></div>
  <div class="attachment-content">
    <p class="attachment-title">quarterly-report.pdf</p>
    <p class="attachment-description">Uploading · 42%</p>
  </div>
  <div class="attachment-actions">
    <button type="button" class="btn btn-ghost btn-icon btn-xs" aria-label="Cancel upload of quarterly-report.pdf"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
  </div>
  <progress class="attachment-progress" value="42" max="100" aria-label="Upload progress"></progress>
</div>
<div class="attachment" data-state="processing" aria-busy="true">
  <div class="attachment-media"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg></div>
  <div class="attachment-content">
    <p class="attachment-title">product-demo.mp4</p>
    <p class="attachment-description">Processing…</p>
  </div>
</div>
<div class="attachment" data-state="error">
  <div class="attachment-media"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg></div>
  <div class="attachment-content">
    <p class="attachment-title">raw-footage.mov</p>
    <p class="attachment-description">Too large: the limit is 100 MB</p>
  </div>
  <div class="attachment-actions">
    <button type="button" class="btn btn-ghost btn-icon btn-xs" aria-label="Retry raw-footage.mov"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg></button>
    <button type="button" class="btn btn-ghost btn-icon btn-xs" aria-label="Remove raw-footage.mov"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
  </div>
</div>
<div class="attachment" data-state="done">
  <div class="attachment-media"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4M10 9H8M16 13H8M16 17H8"/></svg></div>
  <div class="attachment-content">
    <p class="attachment-title">meeting-notes.md</p>
    <p class="attachment-description">12 KB · Markdown</p>
  </div>
  <div class="attachment-actions">
    <button type="button" class="btn btn-ghost btn-icon btn-xs" aria-label="Download meeting-notes.md"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg></button>
  </div>
</div>
```

## Sizes

`.attachment-sm` and `.attachment-xs` shrink the frame, media and text. The extra small size drops the description.

```html
<div class="attachment">
  <div class="attachment-media"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4M10 9H8M16 13H8M16 17H8"/></svg></div>
  <div class="attachment-content">
    <p class="attachment-title">design-brief.pdf</p>
    <p class="attachment-description">840 KB · PDF</p>
  </div>
</div>
<div class="attachment attachment-sm">
  <div class="attachment-media"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4M10 9H8M16 13H8M16 17H8"/></svg></div>
  <div class="attachment-content">
    <p class="attachment-title">design-brief.pdf</p>
    <p class="attachment-description">840 KB · PDF</p>
  </div>
</div>
<div class="attachment attachment-xs">
  <div class="attachment-media"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4M10 9H8M16 13H8M16 17H8"/></svg></div>
  <div class="attachment-content">
    <p class="attachment-title">design-brief.pdf</p>
  </div>
</div>
```

## Orientation

`.attachment-vertical` puts the media on top at full width, for previews. The actions float over the media's corner. It combines with the sizes.

```html
<div class="attachment attachment-vertical">
  <img class="attachment-media" src="../../../images/forest.svg" alt="" />
  <div class="attachment-content">
    <p class="attachment-title">forest.svg</p>
    <p class="attachment-description">1.2 MB</p>
  </div>
  <div class="attachment-actions">
    <button type="button" class="btn btn-ghost btn-icon btn-xs" aria-label="Remove forest.svg"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
  </div>
</div>
<div class="attachment attachment-vertical attachment-sm">
  <img class="attachment-media" src="../../../images/forest.svg" alt="" />
  <div class="attachment-content">
    <p class="attachment-title">forest.svg</p>
    <p class="attachment-description">1.2 MB</p>
  </div>
</div>
<div class="attachment attachment-vertical attachment-xs">
  <img class="attachment-media" src="../../../images/forest.svg" alt="" />
  <div class="attachment-content">
    <p class="attachment-title">forest.svg</p>
  </div>
</div>
```

## Image, video, audio and file

The media says what kind of file it is: an image shows itself, a video its thumbnail with a play icon on top, audio and other files an icon. An icon placed over an image or video is centred and drawn in white. Each works in both orientations.

```html
<div class="flex flex-wrap justify-center gap-3">
  <div class="attachment">
    <img class="attachment-media" src="../../../images/ocean.svg" alt="" />
    <div class="attachment-content">
      <p class="attachment-title">sunset.svg</p>
      <p class="attachment-description">Image · 3.1 MB</p>
    </div>
  </div>
  <div class="attachment">
    <div class="attachment-media"><img src="../../../images/landscape.svg" alt="" /><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M6 4.5a1 1 0 0 1 1.5-.87l12 7.5a1 1 0 0 1 0 1.74l-12 7.5A1 1 0 0 1 6 19.5Z"/></svg></div>
    <div class="attachment-content">
      <p class="attachment-title">timelapse.mp4</p>
      <p class="attachment-description">Video · 0:48</p>
    </div>
  </div>
  <div class="attachment">
    <div class="attachment-media"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg></div>
    <div class="attachment-content">
      <p class="attachment-title">interview.mp3</p>
      <p class="attachment-description">Audio · 12:04</p>
    </div>
  </div>
  <div class="attachment">
    <div class="attachment-media"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg></div>
    <div class="attachment-content">
      <p class="attachment-title">archive.zip</p>
      <p class="attachment-description">File · 18 MB</p>
    </div>
  </div>
</div>
<div class="flex flex-wrap items-start justify-center gap-3">
  <div class="attachment attachment-vertical">
    <img class="attachment-media" src="../../../images/ocean.svg" alt="" />
    <div class="attachment-content">
      <p class="attachment-title">sunset.svg</p>
      <p class="attachment-description">Image · 3.1 MB</p>
    </div>
  </div>
  <div class="attachment attachment-vertical">
    <div class="attachment-media"><img src="../../../images/landscape.svg" alt="" /><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M6 4.5a1 1 0 0 1 1.5-.87l12 7.5a1 1 0 0 1 0 1.74l-12 7.5A1 1 0 0 1 6 19.5Z"/></svg></div>
    <div class="attachment-content">
      <p class="attachment-title">timelapse.mp4</p>
      <p class="attachment-description">Video · 0:48</p>
    </div>
  </div>
  <div class="attachment attachment-vertical">
    <div class="attachment-media"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg></div>
    <div class="attachment-content">
      <p class="attachment-title">interview.mp3</p>
      <p class="attachment-description">Audio · 12:04</p>
    </div>
  </div>
  <div class="attachment attachment-vertical">
    <div class="attachment-media"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg></div>
    <div class="attachment-content">
      <p class="attachment-title">archive.zip</p>
      <p class="attachment-description">File · 18 MB</p>
    </div>
  </div>
</div>
```

## Group

`.attachment-group` lays attachments out in a row that scrolls sideways, snapping to each one, with its edges fading out. Give it `role="group"` and an `aria-label`. Each attachment keeps its own width, so mix sizes and orientations freely.

```html
<div class="attachment-group mx-auto w-full max-w-xl" role="group" aria-label="Attachments">
  <div class="attachment attachment-vertical attachment-sm">
    <img class="attachment-media" src="../../../images/landscape.svg" alt="" />
    <div class="attachment-content"><p class="attachment-title">mountains.svg</p><p class="attachment-description">2.2 MB</p></div>
  </div>
  <div class="attachment attachment-vertical attachment-sm">
    <img class="attachment-media" src="../../../images/ocean.svg" alt="" />
    <div class="attachment-content"><p class="attachment-title">sunset.svg</p><p class="attachment-description">3.1 MB</p></div>
  </div>
  <div class="attachment attachment-vertical attachment-sm" data-state="uploading">
    <img class="attachment-media" src="../../../images/forest.svg" alt="" />
    <div class="attachment-content"><p class="attachment-title">forest.svg</p><p class="attachment-description">Uploading · 30%</p></div>
    <progress class="attachment-progress" value="30" max="100" aria-label="Upload progress"></progress>
  </div>
  <div class="attachment attachment-vertical attachment-sm">
    <div class="attachment-media"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg></div>
    <div class="attachment-content"><p class="attachment-title">interview.mp3</p><p class="attachment-description">12:04</p></div>
  </div>
  <div class="attachment attachment-vertical attachment-sm">
    <div class="attachment-media"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4M10 9H8M16 13H8M16 17H8"/></svg></div>
    <div class="attachment-content"><p class="attachment-title">notes.pdf</p><p class="attachment-description">96 KB</p></div>
  </div>
  <div class="attachment attachment-vertical attachment-sm">
    <div class="attachment-media"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg></div>
    <div class="attachment-content"><p class="attachment-title">archive.zip</p><p class="attachment-description">18 MB</p></div>
  </div>
</div>
```

Horizontal attachments scroll the same way, as in a chat composer above the message box:

```html
<div class="mx-auto w-full max-w-md rounded-[calc(var(--radius)+4px)] border border-border bg-surface py-2">
  <div class="attachment-group" role="group" aria-label="Attachments">
    <div class="attachment attachment-sm w-48">
      <img class="attachment-media" src="../../../images/ocean.svg" alt="" />
      <div class="attachment-content"><p class="attachment-title">sunset.svg</p><p class="attachment-description">3.1 MB</p></div>
      <div class="attachment-actions"><button type="button" class="btn btn-ghost btn-icon btn-xs" aria-label="Remove sunset.svg"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button></div>
    </div>
    <div class="attachment attachment-sm w-48">
      <div class="attachment-media"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4M10 9H8M16 13H8M16 17H8"/></svg></div>
      <div class="attachment-content"><p class="attachment-title">quarterly-report.pdf</p><p class="attachment-description">2.4 MB</p></div>
      <div class="attachment-actions"><button type="button" class="btn btn-ghost btn-icon btn-xs" aria-label="Remove quarterly-report.pdf"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button></div>
    </div>
    <div class="attachment attachment-sm w-48">
      <div class="attachment-media"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg></div>
      <div class="attachment-content"><p class="attachment-title">interview.mp3</p><p class="attachment-description">12:04</p></div>
      <div class="attachment-actions"><button type="button" class="btn btn-ghost btn-icon btn-xs" aria-label="Remove interview.mp3"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button></div>
    </div>
  </div>
  <div class="flex items-center gap-2 px-3 pt-2">
    <button type="button" class="btn btn-ghost btn-icon btn-sm" aria-label="Attach files"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg></button>
    <input class="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" placeholder="Write a message…" aria-label="Message" />
    <button type="button" class="btn btn-primary btn-icon btn-sm" aria-label="Send"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/></svg></button>
  </div>
</div>
```

## Opening an attachment

`.attachment-trigger` on an empty link or button stretches it over the whole attachment, so a click anywhere opens or previews the file, while the actions stay separately clickable above it. It has no text, so give it an `aria-label` saying what it does.

```html
<div class="attachment">
  <div class="attachment-media"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4M10 9H8M16 13H8M16 17H8"/></svg></div>
  <div class="attachment-content">
    <p class="attachment-title">quarterly-report.pdf</p>
    <p class="attachment-description">2.4 MB · PDF</p>
  </div>
  <div class="attachment-actions">
    <a class="btn btn-ghost btn-icon btn-xs" href="#download" aria-label="Download quarterly-report.pdf"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg></a>
  </div>
  <a class="attachment-trigger" href="#preview" aria-label="Open quarterly-report.pdf"></a>
</div>
```

## Upload progress with htmx

The server can own the state. Return the attachment as a fragment that asks for its next state with `hx-trigger="load delay:…"` and `hx-swap="outerHTML"`, and stop polling once it is `done` or in `error`. Each click below adds one that moves from uploading to processing to done:

```html
<button type="button" class="btn btn-outline" hx-get="/api/attachment" hx-target="#upload-list" hx-swap="beforeend"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg> Upload a file</button>
<div id="upload-list" class="flex flex-col gap-2"></div>
```

One step of the server's response:

```html
<div class="attachment" data-state="uploading"
     hx-get="/uploads/42?step=3" hx-trigger="load delay:600ms" hx-swap="outerHTML">
  <div class="attachment-media">…icon…</div>
  <div class="attachment-content">
    <p class="attachment-title">quarterly-report.pdf</p>
    <p class="attachment-description">Uploading · 60%</p>
  </div>
  <progress class="attachment-progress" value="60" max="100" aria-label="Upload progress"></progress>
</div>
```

## Accessibility

- Icon-only actions need an `aria-label` naming the file: “Remove quarterly-report.pdf”, not just “Remove”.
- So does `.attachment-trigger`, which has no text of its own.
- Media images are decorative next to the file name: give them `alt=""`.
- Mark attachments in progress with `aria-busy="true"`, and put errors in words in the description.
- A group of attachments gets `role="group"` and an `aria-label`.

## Reference

| Class | Description |
| --- | --- |
| `.attachment` | The frame: media, content and actions in a row, 16rem wide (override with w-*). |
| `.attachment-media` | Icon box, or an image/video (inside it or as it). An icon over an image is centred and white. |
| `.attachment-content / -title / -description` | File name and details; both truncate. |
| `.attachment-actions` | Icon buttons, kept clickable above the trigger. |
| `.attachment-trigger` | Empty link or button covering the attachment. |
| `.attachment-progress` | Native <progress> along the bottom edge. |
| `[data-state]` | idle (dashed), uploading / processing (shimmer), error (red), done (default). |
| `.attachment-sm / -xs` | Smaller sizes; -xs hides the description. |
| `.attachment-vertical` | Media on top at full width; actions over its corner. |
| `.attachment-group` | Sideways-scrolling row with snapping and faded edges. |
