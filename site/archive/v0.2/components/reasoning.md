---
title: "Reasoning"
description: "A collapsible for an AI model's reasoning: open and shimmering while it streams, closed with how long it thought once it's done."
url: "/docs/v0.2/components/reasoning"
section: "Components"
---

# Reasoning

A collapsible for an AI model's reasoning: open and shimmering while it streams, closed with how long it thought once it's done.

```html
<div class="mx-auto w-full max-w-lg">
  <details class="reasoning" data-reasoning data-reasoning-duration="4" open>
    <summary class="reasoning-trigger"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z"/><path d="M19 3v4M17 5h4"/></svg><span class="reasoning-label">Thought for 4 seconds</span></summary>
    <div class="reasoning-content">
      <p>The user wants to know why the build is slower since Tuesday.</p>
      <ol>
        <li>Compare the two CI runs: the <code>install</code> step went from 20s to 2m.</li>
        <li>The lockfile changed on Tuesday, so the dependency cache missed.</li>
        <li>Suggest keying the cache on the lockfile's hash.</li>
      </ol>
    </div>
  </details>
</div>
```

## Markup

- `.reasoning` goes on a `<details>`, so it opens and closes with no JavaScript. `data-reasoning` adds the streaming behaviour.
- Its `<summary class="reasoning-trigger">` holds an optional icon and the `.reasoning-label`, the text the behaviour rewrites. The chevron is drawn for you and turns while open.
- `.reasoning-content` holds the reasoning: paragraphs, lists and code are styled, with a line down its side (`.reasoning-plain` on the `<details>` drops it).
- It opens and closes smoothly where the browser can animate to `height: auto`, and snaps for readers who prefer reduced motion.

## Streaming and auto-close

While `data-streaming` is on the `<details>` it stays open, is `aria-busy`, and its label is a [shimmering](/docs/v0.2/components/loader) "Thinking…". When the attribute goes, the label becomes "Thought for N seconds", timed from when it started streaming, and a second later it closes. The attribute is watched, so whatever removes it (a script, an htmx swap) ends the stream.

```html
<div class="mx-auto flex w-full max-w-lg flex-col items-start gap-4">
  <button type="button" class="btn btn-outline btn-sm" onclick="streamReasoning(this)"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M6 4.5a1 1 0 0 1 1.5-.87l12 7.5a1 1 0 0 1 0 1.74l-12 7.5A1 1 0 0 1 6 19.5Z"/></svg> Ask</button>
  <details class="reasoning" id="reasoning-live" data-reasoning>
    <summary class="reasoning-trigger"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z"/><path d="M19 3v4M17 5h4"/></svg><span class="reasoning-label">Reasoning</span></summary>
    <div class="reasoning-content"><p>Press Ask to stream some reasoning.</p></div>
  </details>
</div>
<script>
  function streamReasoning(button) {
    const reasoning = document.getElementById("reasoning-live");
    const content = reasoning.querySelector(".reasoning-content");
    const steps = ["Reading the question.", "Checking the release notes for 0.2.", "Writing a short answer."];
    button.disabled = true;
    content.replaceChildren();
    reasoning.setAttribute("data-streaming", "");
    steps.forEach((step, i) =>
      setTimeout(() => content.insertAdjacentHTML("beforeend", `<p>${step}</p>`), 800 * (i + 1)),
    );
    setTimeout(() => {
      reasoning.removeAttribute("data-streaming");
      button.disabled = false;
    }, 800 * (steps.length + 1));
  }
</script>
```

Open or close it by hand while it streams, or click it during the moment before it closes, and it is left as you put it. A reasoning that starts without `data-streaming` is left as written: the label isn't touched and it doesn't close.

| Attribute | Description |
| --- | --- |
| `data-reasoning-close-delay="1000"` | Milliseconds between the end of the stream and closing. |
| `data-reasoning-auto-close="false"` | Stay open when the stream ends. |
| `data-reasoning-streaming-label="Thinking…"` | The shimmering label while it streams. |
| `data-reasoning-done-label="Thought for {s} seconds"` | The label once it's done; {s} is the seconds. |
| `data-reasoning-duration="4"` | Seconds it took. Set it from the server to use the model's own timing; the behaviour fills it in otherwise. |

### From the server with htmx

Poll for the reasoning so far: each response is the whole `<details>` again, swapped with `hx-swap="outerHTML"`, still streaming and asking for the next one. Give it an `id`: the replacement then carries on the first one's timer and whether the reader opened or closed it. The last response leaves out `data-streaming` and the polling, and the reasoning closes as above.

```html
<!-- each response from /chat/7/reasoning while the model thinks <!-- each response from /chat/7/reasoning while the model thinks -->
<details class="reasoning" id="reasoning-7" data-reasoning data-streaming open
         hx-get="/chat/7/reasoning" hx-trigger="load delay:500ms" hx-swap="outerHTML">
  <summary class="reasoning-trigger">
    <span class="reasoning-label"><span class="loader loader-text-shimmer">Thinking…</span></span>
  </summary>
  <div class="reasoning-content"><p>The user wants…</p></div>
</details>

<!-- the last one: done, so no data-streaming and no polling <!-- the last one: done, so no data-streaming and no polling -->
<details class="reasoning" id="reasoning-7" data-reasoning data-reasoning-duration="6">
  <summary class="reasoning-trigger"><span class="reasoning-label">Thought for 6 seconds</span></summary>
  <div class="reasoning-content"><p>The user wants…</p><p>So the answer is…</p></div>
</details>
```

Streaming over SSE or a WebSocket instead, append the text to `.reasoning-content` as it arrives and remove `data-streaming` when the reasoning ends.

## Manual control

Leave out `data-reasoning` (or `data-streaming`) and it is a plain disclosure: `open` starts it open, and the reader toggles it. Script it like any `<details>`, with `el.open = true` and the `toggle` event. With the behaviour, `reasoning:start` and `reasoning:end` bubble from it, the second with `detail.duration` in seconds.

```html
<div class="mx-auto flex w-full max-w-lg flex-col gap-4">
  <details class="reasoning">
    <summary class="reasoning-trigger"><span class="reasoning-label">Show reasoning</span></summary>
    <div class="reasoning-content"><p>Closed until the reader opens it.</p></div>
  </details>
  <details class="reasoning reasoning-plain" open>
    <summary class="reasoning-trigger"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z"/><path d="M19 3v4M17 5h4"/></svg><span class="reasoning-label">Explanation</span></summary>
    <div class="reasoning-content"><p>Open from the start, with no line beside it.</p></div>
  </details>
</div>
```

## With a message

Put it in a `.message-plain` body, above the reply, as in the [Message](/docs/v0.2/components/message#ai) component's AI chat.

```html
<div class="message-list mx-auto w-full max-w-lg">
  <div class="message" data-align="end">
    <div class="message-body"><div class="message-content">Is 1013 prime?</div></div>
  </div>
  <div class="message message-plain">
    <span class="avatar message-avatar" role="img" aria-label="Assistant"><span class="avatar-fallback" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2M20 14h2M15 13v2M9 13v2"/></svg></span></span>
    <div class="message-body">
      <details class="reasoning" data-reasoning data-reasoning-duration="2">
        <summary class="reasoning-trigger"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z"/><path d="M19 3v4M17 5h4"/></svg><span class="reasoning-label">Thought for 2 seconds</span></summary>
        <div class="reasoning-content">
          <p>√1013 ≈ 31.8, so try the primes up to 31.</p>
          <p>None of 2, 3, 5, 7, 11, 13, 17, 19, 23, 29 or 31 divides it.</p>
        </div>
      </details>
      <div class="message-content">Yes, 1013 is prime: no prime up to its square root divides it.</div>
    </div>
  </div>
</div>
```

## Macro

`reasoning()` writes the markup, with the label worked out from `duration` and the options as data attributes. The call body is the content.

```jinja
{% from "components/reasoning/reasoning.html" import reasoning %}

{% call reasoning(duration=4) %}<p>The user wants…</p>{% endcall %}
{% call reasoning(streaming=true, id="reasoning-7") %}<p>The user wants…</p>{% endcall %}
{% call reasoning("Explanation", open=true, plain=true, icon=none) %}…{% endcall %}
```

| Argument | Description |
| --- | --- |
| `label=none` | The summary text. Defaults to "Thought for N seconds" with a duration, else "Reasoning". |
| `streaming=false` | Adds data-streaming: open, with the shimmering streaming_label. |
| `open=false` | Start open. |
| `duration=none` | Seconds it took (data-reasoning-duration). |
| `streaming_label / done_label` | The labels while streaming and once done ({s} = seconds). |
| `auto_close=true / close_delay=none` | Whether, and after how many ms, it closes when the stream ends. |
| `icon="sparkles"` | An icon before the label; none for none. |
| `plain=false` | No line beside the content. |
| `id / attrs / class` | An id (needed when htmx replaces it mid-stream), more attributes as a dict, more classes. |

## Reference

| Class | Description |
| --- | --- |
| `.reasoning` | On a <details>: the whole component. |
| `[data-reasoning]` | Adds the behaviour: open while streaming, label and close at the end. |
| `[data-streaming]` | Still streaming: open, aria-busy, shimmering label. |
| `.reasoning-trigger` | On the <summary>: icon, label and chevron. |
| `.reasoning-label` | The summary text, rewritten by the behaviour. |
| `.reasoning-content` | The reasoning, with a line beside it. |
| `.reasoning-plain` | On .reasoning: no line beside the content. |
| `reasoning:start / reasoning:end` | Events, bubbling; reasoning:end has detail.duration (seconds). |
