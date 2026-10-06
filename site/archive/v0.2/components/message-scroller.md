---
title: "Message scroller"
description: "Scrolling for a chat transcript that streams: new questions rise to the top, replies grow beneath them, and the view only moves when the reader moves it."
url: "/docs/v0.2/components/message-scroller"
section: "Components"
---

# Message scroller

Scrolling for a chat transcript that streams: new questions rise to the top, replies grow beneath them, and the view only moves when the reader moves it.

The message scroller is the scrolling part of a chat window. Your messages, the prompt box and whatever produces the replies stay in your own markup and on your server; the scroller looks after one thing, the scroll position of the transcript while it changes underneath the person reading it.

In a chat that streams, the reader and the reply being written pull on the same scrollbar. The scroller settles that in the reader's favour: the view moves when they do something (send a message, press the jump button, follow a link), and otherwise what's on screen stays put.

## How it scrolls

Most of what it does comes down to one question, _is the reader at the bottom?_, asked again whenever the transcript or the reader changes something.

| When… | the scroller… |
| --- | --- |
| the page opens | shows the reader's last question near the top, or the message named in the URL, or an unread marker. No animation. |
| the reader sends a message | lifts it to just under the top, with a sliver of the previous reply above it, and leaves empty room below for the answer. |
| a reply streams in and the reader is at the bottom | keeps the newest line in view. The empty room fills first, so the question doesn't move until the answer is taller than the view. |
| a reply streams in and the reader is further up | stays still. The jump button appears, showing that more is being written below. |
| the reader scrolls up, selects text, presses Page Up or clicks a link | stops following at once. Scrolling back to the bottom, or pressing the jump button, picks it up again. |
| something above the reader changes height: an image loads, code is highlighted, older messages load, a reply is stopped, regenerated or removed | corrects the scroll position in the same frame, so the message being read doesn't shift. |
| the reader follows a link to a message | scrolls the transcript, not the page, to that message and flashes it. |
| a reply finishes | tells screen readers once ("Response complete") rather than reading the reply out word by word. |

It measures at most once per frame and listens passively, so long conversations with heavy Markdown stay smooth; rows out of view can also skip rendering (see [long threads](#long-threads)).

## Try it

Send a message: your turn moves near the top and the reply streams in below it. Scroll up while it's writing, or select some text, and it leaves you alone; the button at the bottom shows it's still going.

The demo's reply is simulated in the browser, so it works on this static site. A real app gets these rows from its server (see [streaming with htmx](#htmx)).

## Markup

One `[data-message-scroller]` element is both the state and the frame. Inside it: the `.message-scroller-viewport` that scrolls, the `.message-scroller-content` that holds the rows, and an optional jump button. Give the scroller a height, or `flex-1 min-h-0` in a column with the prompt input below it.

```html
<div class="flex h-dvh flex-col">
      <div class="message-scroller min-h-0 flex-1" data-message-scroller aria-label="Conversation">
        <div class="message-scroller-viewport">
          <div class="message-scroller-content message-list" id="transcript">
            <div class="message" data-align="end" id="m1">…</div>
            <div class="message message-plain" id="m2">…</div>
          </div>
        </div>
        <button type="button" class="message-scroller-jump" data-message-scroller-jump aria-label="Jump to latest">
          {{ icon("arrow-down") }}
          <span class="message-scroller-jump-unread">New messages</span>
          <span class="message-scroller-jump-streaming message-typing" aria-hidden="true"><span></span><span></span><span></span></span>
        </button>
      </div>
      <form>…prompt input…</form>
    </div>
```

- The rows are the content's children: `.message` rows, `.message-group`s, markers, anything. Give a row an `id` to link to it.
- The script adds a spacer after the content (not inside it, so rows you append land before it) and a visually hidden status for announcements.
- The viewport becomes a focusable region labelled with the scroller's `aria-label` (default "Conversation").

## Following the reply

The reader is _at the bottom_ when they are within `data-message-scroller-threshold` pixels of it (32 by default). While the reader is there, the scroller is _following_: as content grows, it keeps the newest line in view. Following stops when they scroll up by any means (wheel, touch, Page Up, Arrow Up, Home, Shift+Space, the scrollbar, find-in-page), select text in the transcript, or press a link. It starts again when they scroll back to the edge or press the jump button.

Content arriving never decides this, only what the reader does. The scroller can tell its own scrolling from the reader's, so following a stream doesn't count as the reader scrolling. The scroller carries `data-following` while following, `data-at-bottom` while at the bottom, and `data-unread` when rows arrived below the reader.

To never follow, so a long reply stops at the top of the view and the reader scrolls on when they choose, set `data-message-scroller-follow="false"`.

## New turns

When an _anchor_ row is appended to the end of the transcript, the scroller moves it near the top of the viewport. Anchors are the reader's own turns: rows with `data-message-anchor`, `data-role="user"`, or a `.message[data-align="end"]`. `data-message-anchor="false"` opts a row out, `data-message-scroller-anchor="selector"` sets your own selector (we recommend an explicit `data-message-anchor`), and `"none"` turns anchoring off.

`--message-scroller-anchor-offset` (3rem) is how much of the previous turn stays visible above the new one. Below it, the spacer leaves exactly enough room for the turn to sit there. As the reply grows into that room the spacer shrinks, so nothing moves, and it reaches zero once the reply fills the view. The offset is also each row's `scroll-margin-top`, so jumps and in-page links land the same way.

```css
.chat { --message-scroller-anchor-offset: 25%; }
```

An anchor appended while the reader is scrolled away still moves into view, because it's their own message. Rows from anyone else arrive without moving the view: the jump button shows "New messages" instead.

## Opening position

On load, without animation, the scroller opens at `data-message-scroller-open`:

- `last-anchor` (default): the last question near the top, with its answer below it. Without one, the bottom.
- `bottom` or `top`.
- `#id`: a row, for example an unread marker (see [jumping](#jumping)).

A `location.hash` that names a row wins over all of these, so a shared link to a message opens on that message, highlighted.

## Loading history

Older messages can load in above the reader without moving what they see. The scroller remembers the first visible row and its distance from the top of the viewport. When anything changes size (rows prepended, images loading, code rendering, Markdown expanding, a reply regenerated in place), it puts that row back before the next paint. It turns off the browser's own `overflow-anchor` so the position isn't corrected twice.

With htmx, put a sentinel at the top that swaps itself for the previous page of rows (and a new sentinel) when it scrolls into view:

```html
<div class="message-scroller mx-auto h-72 w-full max-w-lg rounded-(--radius) border border-border bg-background" data-message-scroller data-message-scroller-open="bottom" aria-label="Conversation history">
  <div class="message-scroller-viewport">
    <div class="message-scroller-content message-list">
      <div class="flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground" hx-get="/api/chat/history?before=10" hx-trigger="intersect once" hx-swap="outerHTML">
        <span class="spinner spinner-sm" role="status" aria-label="Loading"></span> Loading older messages…
      </div>
      <div class="message" data-align="end" id="history-10"><div class="message-body"><div class="message-content">Scroll up to load older messages.</div></div></div>
      <div class="message message-plain" id="history-11"><div class="message-body"><div class="message-content"><p>They load above this one, and this one stays where it is.</p></div></div></div>
      <div class="message" data-align="end" id="history-12"><div class="message-body"><div class="message-content">Nice.</div></div></div>
    </div>
  </div>
</div>
```

The demo's `/api/chat/history` is a mock route that only the dev server serves (`site/server/api.ts`). On the static site the sentinel stays as it is.

## Jumping to messages

Links to rows scroll the transcript, not the page, and briefly highlight the row they land on (`data-highlighted`). They can be inside the transcript (a citation, "see above") or anywhere on the page: try [the first question](#turn-1) or [the second answer](#turn-4) in the demo above.

```html
<a href="#m42">Jump to the decision</a>
```

From script:

```ts
import { getMessageScroller } from "htmx-ui";

const chat = getMessageScroller(document.querySelector("#chat"));
chat?.scrollToMessage("m42");                                   // near the top, highlighted
chat?.scrollToMessage("m42", { align: "center", highlight: false, smooth: true });
chat?.scrollToBottom({ smooth: true });                         // and follow from there
```

An **unread marker** is a row you insert yourself before the first message the reader hasn't seen. Open on it with `data-message-scroller-open="#unread"`:

```html
<div class="message-list mx-auto w-full max-w-lg">
  <div class="message"><div class="message-body"><div class="message-content">See you tomorrow!</div></div></div>
  <div class="message-scroller-marker" id="unread" role="separator">New</div>
  <div class="message"><div class="message-body"><div class="message-content">Morning! Did the deploy go out?</div></div></div>
</div>
```

## Streaming with htmx

The scroller watches the transcript; it doesn't care how rows get there. A typical flow: the prompt form posts with `hx-swap="beforeend"` into the content, and the server answers with the user's turn (an anchor) and an empty assistant row marked `data-streaming`. The reply then streams into that row, for example over SSE or by polling, and the last update leaves the row without `data-streaming`.

```html
<form hx-post="/chat" hx-target="#transcript" hx-swap="beforeend">
      <textarea class="textarea" name="prompt"></textarea>
      <button class="btn btn-primary">Send</button>
    </form>
```

```html
<!-- the response <!-- the response -->
    <div class="message" data-align="end">…the prompt…</div>
    <div class="message message-plain" id="reply-7" data-streaming
         hx-get="/chat/reply/7" hx-trigger="load delay:300ms" hx-swap="outerHTML">
      <div class="message-body"><div class="message-content">
        <span class="message-typing" aria-hidden="true"><span></span><span></span><span></span></span>
      </div></div>
    </div>
```

Each poll returns the row with the reply so far (and the same trigger), and the final one drops `data-streaming` and the trigger. Replacing a row, whether to stop it, retry, regenerate or show an error, goes through the same position-keeping, so it doesn't move the conversation. Put `data-streaming` on the scroller itself instead if the stream doesn't map to one row.

## Accessibility

- The viewport is a focusable `region` (`tabindex="0"`), so keyboard users can scroll it, labelled by the scroller's `aria-label`.
- The transcript is deliberately _not_ a live region: a streamed reply would be read out token by token. Instead a visually hidden polite status says `data-message-scroller-announce-new` ("New message") when a row arrives from someone else, and `data-message-scroller-announce-done` ("Response complete") when the last `data-streaming` goes away. Announcements are throttled. Set either attribute to `""` to stay quiet, or call `announce(text)`.
- The scroller never moves focus. The jump button is `inert` while hidden; if it had focus when pressed, focus moves to the viewport rather than being lost.
- Jumps respect `prefers-reduced-motion`.

## Long threads

Work is batched into one pass per frame, listeners are passive and the reading position is found by binary search, so the cost of a stream doesn't grow with the length of the thread. Add `.message-scroller-lazy` to skip rendering rows that are out of view (`content-visibility: auto`). Position-keeping absorbs the size changes as rows come into view. It clips absolutely positioned popups inside rows, so leave it off if your rows carry dropdown menus.

## API and events

```ts
import { getMessageScroller } from "htmx-ui";

const el = document.querySelector("#chat")!;
el.addEventListener("message-scroller:init", (e) => {
  const chat = (e as CustomEvent).detail.api; // same as getMessageScroller(el)
});
el.addEventListener("message-scroller:unread", (e) => console.log((e as CustomEvent).detail.rows));
```

| API | Description |
| --- | --- |
| `getMessageScroller(el)` | The API of the scroller containing el (once initialised). |
| `scrollToBottom({ smooth })` | Scroll to the end and follow. |
| `scrollToMessage(idOrEl, { align, highlight, smooth })` | Scroll a row into view: align start (default) \| center \| end; highlight defaults to true. False if it isn't in the transcript. |
| `anchor(row, { smooth })` | Treat a row as the newest turn: near the top, with room below. |
| `unfollow()` | Stop following, as if the reader scrolled away. |
| `update()` | Re-measure now, after a change the observers can't see. |
| `announce(text)` | Say something through the polite status. |
| `following / atBottom / unread` | Read-only state. |
| `message-scroller:init` | Ready; detail.api. |
| `message-scroller:follow / :unfollow` | Following started or stopped; detail.reason (scroll, wheel, touch, keyboard, selection, link, jump, api…). |
| `message-scroller:unread` | Rows arrived below the reader; detail.rows. |
| `message-scroller:anchor` | A turn was anchored near the top; detail.row. |

## Reference

| Class | Description |
| --- | --- |
| `.message-scroller` | The scroller: a column; give it a height. Sets --message-scroller-anchor-offset (3rem). |
| `.message-scroller-viewport` | The scrolling region (overflow-anchor: none). |
| `.message-scroller-content` | The rows; padded. Add .message-list for spacing. |
| `.message-scroller-jump` | The jump button, over the bottom of the viewport; data-state hidden \| latest \| unread \| streaming. |
| `.message-scroller-jump-unread / -streaming` | Inside the jump button: shown only in that state. |
| `.message-scroller-marker` | A divider row, e.g. "New" before the first unread message. |
| `.message-scroller-lazy` | On the scroller: rows out of view aren't rendered (content-visibility: auto). |
| `[data-message-scroller]` | Behaviour: following, anchoring, position-keeping, jumps, announcements. |
| `[data-message-scroller-open]` | last-anchor (default) \| bottom \| top \| #id. |
| `[data-message-scroller-threshold]` | Pixels from the bottom that still count as at the bottom (32). |
| `[data-message-scroller-follow="false"]` | Never follow growing content. |
| `[data-message-scroller-anchor]` | Selector for anchor turns, or "none". |
| `[data-message-scroller-announce-new / -done]` | Announcement texts; "" for none. |
| `[data-message-scroller-jump]` | On the jump button. |
| `[data-message-anchor]` | On a row: a turn to anchor (="false" opts out). |
| `[data-streaming]` | On a row or the scroller: a reply is being written. |
| `[data-highlighted]` | Set briefly on a row you jumped to. |
| `[data-following] / [data-at-bottom] / [data-unread]` | State, set on the scroller. |
