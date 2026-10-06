---
title: "Message"
description: "A message in a conversation, with an avatar, a header, a footer, attachments and start or end alignment; groups for consecutive messages, and reasoning, tool calls and typing for AI chat."
url: "/docs/v0.2/components/message"
section: "Components"
---

# Message

A message in a conversation, with an avatar, a header, a footer, attachments and start or end alignment; groups for consecutive messages, and reasoning, tool calls and typing for AI chat.

```html
<div class="message-list mx-auto w-full max-w-lg">
  <div class="message">
    <span class="avatar message-avatar" role="img" aria-label="Ada"><span class="avatar-fallback" aria-hidden="true">AL</span></span>
    <div class="message-body">
      <div class="message-header"><span class="message-author">Ada</span><time class="message-time" datetime="09:41">09:41</time></div>
      <div class="message-content">Is the release still on for Friday?</div>
    </div>
  </div>
  <div class="message" data-align="end">
    <div class="message-body">
      <div class="message-content">Yes! Docs are done, just waiting on the last review.</div>
      <div class="message-footer"><span class="message-status"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg> Read 09:42</span></div>
    </div>
  </div>
</div>
```

## Markup

- `.message` lays out one message: an optional `.message-avatar` (any [avatar](/docs/v0.2/components/avatar)) beside a `.message-body`.
- The body stacks a `.message-header` (`.message-author`, `.message-time`), the `.message-content` itself, `.message-attachments` and a `.message-footer`. Every part but the content is optional.
- Pure CSS. Wrap a conversation in `.message-list` to space it; give it `role="log"` and `aria-live="polite"` when new messages arrive while it's on screen.

## Alignment

`data-align="end"` puts a message on the right, for the reader's own: the avatar, header, attachments and footer all move to that side, and the default bubble turns primary. `data-align="start"` (or nothing) is everyone else.

```html
<div class="message-list mx-auto w-full max-w-lg">
  <div class="message">
    <span class="avatar message-avatar" role="img" aria-label="Jane"><span class="avatar-fallback" aria-hidden="true">JC</span></span>
    <div class="message-body">
      <div class="message-header"><span class="message-author">Jane</span><time class="message-time">10:02</time></div>
      <div class="message-content">Lunch at 12:30?</div>
    </div>
  </div>
  <div class="message" data-align="end">
    <span class="avatar message-avatar" role="img" aria-label="You"><span class="avatar-fallback" aria-hidden="true">ME</span></span>
    <div class="message-body">
      <div class="message-header"><span class="message-author">You</span><time class="message-time">10:03</time></div>
      <div class="message-content">Perfect, see you at the usual place.</div>
    </div>
  </div>
</div>
```

## Variants

On `.message`: the default filled bubble, `.message-secondary`, `.message-outline`, `.message-soft` (tinted primary) and `.message-plain` (no bubble, full width: for assistant replies and long text).

```html
<div class="message-list mx-auto w-full max-w-lg">
    <div class="message" data-align="start">
      <div class="message-body">
        <div class="message-content">default: the other side.</div>
      </div>
    </div>
    <div class="message message-secondary" data-align="end">
      <div class="message-body">
        <div class="message-content">message-secondary: the reader&#39;s side.</div>
      </div>
    </div>
    <div class="message message-outline" data-align="start">
      <div class="message-body">
        <div class="message-content">message-outline: the other side.</div>
      </div>
    </div>
    <div class="message message-soft" data-align="end">
      <div class="message-body">
        <div class="message-content">message-soft: the reader&#39;s side.</div>
      </div>
    </div>
  <div class="message message-plain">
    <span class="avatar message-avatar" role="img" aria-label="Assistant"><span class="avatar-fallback" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2M20 14h2M15 13v2M9 13v2"/></svg></span></span>
    <div class="message-body">
      <div class="message-content">
        <p>message-plain: no bubble, the full width of the row. Suits assistant replies that run to paragraphs, lists and code.</p>
        <p>Put <code class="code">.prose</code> inside for long-form formatting.</p>
      </div>
    </div>
  </div>
</div>
```

## Header and footer

The header carries the sender's name and the time; the footer a status and `.message-actions`. Both follow the message's side, and on an `data-align="end"` row the actions stay at the end. `.message-actions-hover` shows them only on hover or focus (always on touch screens).

```html
<div class="message-list mx-auto w-full max-w-lg">
  <div class="message">
    <span class="avatar message-avatar" role="img" aria-label="Ada"><span class="avatar-fallback" aria-hidden="true">AL</span></span>
    <div class="message-body">
      <div class="message-header"><span class="message-author">Ada Lovelace</span><span class="badge badge-secondary">Admin</span><time class="message-time">Yesterday</time></div>
      <div class="message-content">I've pushed the fix for the flaky test.</div>
      <div class="message-footer">
        <span class="message-status">Edited</span>
        <div class="message-actions message-actions-hover">
          <button type="button" class="btn btn-ghost btn-icon" aria-label="Reply"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/></svg></button>
          <button type="button" class="btn btn-ghost btn-icon" aria-label="Copy" data-toast="Copied"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg></button>
          <button type="button" class="btn btn-ghost btn-icon" aria-label="More"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></button>
        </div>
      </div>
    </div>
  </div>
  <div class="message" data-align="end">
    <div class="message-body">
      <div class="message-content">Thanks, merging now.</div>
      <div class="message-footer">
        <span class="message-status"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg> Delivered</span>
        <div class="message-actions">
          <button type="button" class="btn btn-ghost btn-icon" aria-label="Edit"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4M10 9H8M16 13H8M16 17H8"/></svg></button>
          <button type="button" class="btn btn-ghost btn-icon" aria-label="Delete"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
        </div>
      </div>
    </div>
  </div>
</div>
```

## Group

`.message-group` stacks consecutive messages from one sender close together: the avatar and header show on the first only (the avatar keeps its space), and the bubbles tuck together on the sender's side.

```html
<div class="message-list mx-auto w-full max-w-lg">
  <div class="message-group">
    <div class="message">
      <span class="avatar message-avatar" role="img" aria-label="Jane"><span class="avatar-fallback" aria-hidden="true">JC</span></span>
      <div class="message-body">
        <div class="message-header"><span class="message-author">Jane</span><time class="message-time">14:10</time></div>
        <div class="message-content">Heads up: the staging deploy is red.</div>
      </div>
    </div>
    <div class="message">
      <span class="avatar message-avatar" role="img" aria-label="Jane"><span class="avatar-fallback" aria-hidden="true">JC</span></span>
      <div class="message-body"><div class="message-content">Looks like a missing env var.</div></div>
    </div>
    <div class="message">
      <span class="avatar message-avatar" role="img" aria-label="Jane"><span class="avatar-fallback" aria-hidden="true">JC</span></span>
      <div class="message-body"><div class="message-content">I'll add it to the config.</div></div>
    </div>
  </div>
  <div class="message-group">
    <div class="message" data-align="end"><div class="message-body"><div class="message-content">Good catch.</div></div></div>
    <div class="message" data-align="end"><div class="message-body"><div class="message-content">Ping me when it's green.</div></div></div>
  </div>
</div>
```

## Attachments

`.message-attachments` holds [attachments](/docs/v0.2/components/attachment) and lines them up on the message's side. A lone picture can be a `.message-image`.

```html
<div class="message-list mx-auto w-full max-w-lg">
  <div class="message" data-align="end">
    <div class="message-body">
      <div class="message-attachments">
        <div class="attachment attachment-sm">
          <div class="attachment-media"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4M10 9H8M16 13H8M16 17H8"/></svg></div>
          <div class="attachment-content"><p class="attachment-title">q3-report.pdf</p><p class="attachment-description">PDF · 2.4 MB</p></div>
        </div>
        <div class="attachment attachment-sm" data-state="uploading">
          <div class="attachment-media"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"/></svg></div>
          <div class="attachment-content"><p class="attachment-title">chart.png</p><p class="attachment-description">Uploading · 60%</p></div>
          <progress class="attachment-progress" value="60" max="100" aria-label="Upload progress"></progress>
        </div>
      </div>
      <div class="message-content">Here's the report and the chart for the slides.</div>
    </div>
  </div>
</div>
```

## AI chat

For assistants: `.message-reasoning` is a `<details>` of thinking steps (add `data-state="streaming"` to shimmer its summary while it runs), `.message-tool` a tool call with its input and output, its state in `data-state` (`running`, `done`, `error`), and `.message-typing` three dots for a reply on its way. Stream them in with htmx, swapping or appending to the conversation.

For more, use the standalone components: [Reasoning](/docs/v0.2/components/reasoning) opens while the reasoning streams and closes with how long it took, and [Chain of thought](/docs/v0.2/components/chain-of-thought) shows a model's steps, searches and tool calls on a line.

```html
<div class="message-list mx-auto w-full max-w-lg" role="log" aria-live="polite" aria-label="Conversation">
  <div class="message" data-align="end">
    <div class="message-body"><div class="message-content">What's the weather in Sydney tomorrow?</div></div>
  </div>
  <div class="message message-plain">
    <span class="avatar message-avatar" role="img" aria-label="Assistant"><span class="avatar-fallback" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2M20 14h2M15 13v2M9 13v2"/></svg></span></span>
    <div class="message-body">
      <details class="message-reasoning">
        <summary><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z"/><path d="M19 3v4M17 5h4"/></svg> Thought for 3 seconds</summary>
        <ol>
          <li>The user wants tomorrow's forecast for Sydney, Australia.</li>
          <li>Call the weather tool with the city and date.</li>
        </ol>
      </details>
      <details class="message-tool" data-state="done">
        <summary class="message-tool-header"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg> get_weather <span class="message-tool-status"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg> Done</span></summary>
        <div class="message-tool-content">
          <span class="message-tool-label">Input</span>
          <pre>{"city": "Sydney", "date": "tomorrow"}</pre>
          <span class="message-tool-label">Output</span>
          <pre>{"high": 24, "low": 17, "sky": "partly cloudy"}</pre>
        </div>
      </details>
      <div class="message-content">Tomorrow in Sydney: partly cloudy, a high of 24°C and a low of 17°C.</div>
      <div class="message-footer">
        <div class="message-actions">
          <button type="button" class="btn btn-ghost btn-icon" aria-label="Copy" data-toast="Copied to clipboard"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg></button>
          <button type="button" class="btn btn-ghost btn-icon" aria-label="Regenerate"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg></button>
        </div>
      </div>
    </div>
  </div>
  <div class="message" data-align="end">
    <div class="message-body"><div class="message-content">And the weekend?</div></div>
  </div>
  <div class="message message-plain">
    <span class="avatar message-avatar" role="img" aria-label="Assistant"><span class="avatar-fallback" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2M20 14h2M15 13v2M9 13v2"/></svg></span></span>
    <div class="message-body">
      <details class="message-reasoning" data-state="streaming">
        <summary><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z"/><path d="M19 3v4M17 5h4"/></svg> Thinking…</summary>
        <p>Looking up Saturday and Sunday.</p>
      </details>
      <details class="message-tool" data-state="running" open>
        <summary class="message-tool-header"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg> get_weather <span class="message-tool-status"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.22-8.56"/></svg> Running</span></summary>
        <div class="message-tool-content"><span class="message-tool-label">Input</span><pre>{"city": "Sydney", "date": "weekend"}</pre></div>
      </details>
      <div class="message-content text-muted-foreground"><span class="message-typing" role="status" aria-label="Assistant is typing"><span></span><span></span><span></span></span></div>
    </div>
  </div>
</div>
```

## Reference

| Class | Description |
| --- | --- |
| `.message` | One message: avatar and body, start-aligned. |
| `[data-align="end"]` | The reader's own message, on the right; everything follows. |
| `.message-avatar` | On an .avatar beside the body. |
| `.message-body` | Header, content, attachments and footer, stacked. |
| `.message-header / .message-author / .message-time` | Name and time above the message. |
| `.message-content` | The message: a bubble (default) or plain text. |
| `.message-secondary / -outline / -soft / -plain` | Variants, on .message. |
| `.message-attachments / .message-image` | Attachments, or a single picture. |
| `.message-footer / .message-status` | Status line under the message. |
| `.message-actions / .message-actions-hover` | Small icon buttons; the second shows on hover or focus. |
| `.message-group` | Consecutive messages from one sender. |
| `.message-list` | A conversation's spacing. |
| `.message-reasoning` | On a <details>: thinking steps; data-state="streaming" shimmers. |
| `.message-tool (-header, -status, -content, -label)` | On a <details>: a tool call; data-state running \| done \| error. |
| `.message-typing` | Three animated dots (three empty spans inside). |
