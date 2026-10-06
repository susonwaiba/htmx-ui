---
title: "Prompt input"
description: "The text box of an AI chat: a growing textarea with attachments, tools and a send button that turns into stop, plus @ mentions and / commands."
url: "/docs/v0.2/components/prompt-input"
section: "Components"
---

# Prompt input

The text box of an AI chat: a growing textarea with attachments, tools and a send button that turns into stop, plus @ mentions and / commands.

```html
<div id="pi-messages" class="message-list" aria-live="polite"></div>
<form class="prompt-input" data-prompt-input hx-post="/api/prompt-input/reply" hx-target="#pi-messages" hx-swap="beforeend">
  <textarea class="prompt-input-textarea" name="prompt" rows="1" data-textarea aria-label="Prompt"
            placeholder="Ask anything. Type @ to mention someone, / for commands."></textarea>
  <div class="prompt-input-actions">
    <div class="prompt-input-tools">
      <span class="tooltip" data-tooltip>
        <button type="button" class="btn btn-ghost btn-icon btn-sm" aria-label="Attach files"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg></button>
        <span class="tooltip-content" role="tooltip">Attach files</span>
      </span>
      <button type="button" class="btn btn-ghost btn-sm" data-toggle aria-pressed="false"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg> Search</button>
      <select class="select input-sm prompt-input-select" name="model" aria-label="Model">
        <option>GPT-5</option>
        <option selected>Claude Opus</option>
        <option>Gemini Pro</option>
      </select>
    </div>
    <button class="btn btn-primary btn-icon btn-sm btn-rounded prompt-input-submit" data-prompt-input-submit aria-label="Send">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg><span class="prompt-input-stop-icon" aria-hidden="true"></span>
    </button>
  </div>
  <div class="prompt-input-menu" data-prompt-input-menu="@" role="listbox" aria-label="People" hidden>
    <div class="prompt-input-option" role="option" data-value="ada">
      <span class="avatar avatar-sm" aria-hidden="true"><span class="avatar-fallback">A</span></span>
      <span class="prompt-input-option-label">Ada Lovelace</span>
      <span class="prompt-input-option-description">Analyst</span>
    </div>
    <div class="prompt-input-option" role="option" data-value="alan" data-keywords="enigma">
      <span class="avatar avatar-sm" aria-hidden="true"><span class="avatar-fallback">A</span></span>
      <span class="prompt-input-option-label">Alan Turing</span>
      <span class="prompt-input-option-description">Cryptography</span>
    </div>
    <div class="prompt-input-option" role="option" data-value="grace" data-keywords="cobol">
      <span class="avatar avatar-sm" aria-hidden="true"><span class="avatar-fallback">G</span></span>
      <span class="prompt-input-option-label">Grace Hopper</span>
      <span class="prompt-input-option-description">Compilers</span>
    </div>
    <div class="prompt-input-option" role="option" data-value="linus" data-keywords="linux git">
      <span class="avatar avatar-sm" aria-hidden="true"><span class="avatar-fallback">L</span></span>
      <span class="prompt-input-option-label">Linus Torvalds</span>
      <span class="prompt-input-option-description">Kernels</span>
    </div>
    <p class="prompt-input-empty" data-prompt-input-empty hidden>No one found.</p>
  </div>
  <div class="prompt-input-menu" data-prompt-input-menu="/" role="listbox" aria-label="Commands" hidden>
    <div class="prompt-input-option" role="option" data-value="summarize">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M15 12H3M17 18H3M21 6H3"/></svg>
      <span class="prompt-input-option-label">Summarize</span>
      <span class="prompt-input-option-description">Shorten the text</span>
    </div>
    <div class="prompt-input-option" role="option" data-value="translate">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      <span class="prompt-input-option-label">Translate</span>
      <span class="prompt-input-option-description">Into another language</span>
    </div>
    <div class="prompt-input-option" role="option" data-value="explain">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/></svg>
      <span class="prompt-input-option-label">Explain code</span>
      <span class="prompt-input-option-description">Step by step</span>
    </div>
    <div class="prompt-input-option" role="option" data-value="search">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      <span class="prompt-input-option-label">Search the web</span>
      <span class="prompt-input-option-description">With sources</span>
    </div>
    <p class="prompt-input-empty" data-prompt-input-empty hidden>No commands found.</p>
  </div>
</form>
```

A prompt input is where the user writes to an AI model. It looks like one big input, but holds a textarea that grows with the text, a toolbar for attachments, tools and the model, and a send button that turns into a stop button while the answer is on its way. Typing `@` or `/` opens a list of people, files or commands to insert. The demo posts to a mock endpoint that is part of the dev server, so it only answers on a running site, not on a static host.

## Markup

- The box is a `<form class="prompt-input" data-prompt-input>`. It shows one focus ring for everything inside it, and a click on its empty space puts the caret in the textarea.
- The text goes in a `<textarea class="prompt-input-textarea">` with a `name` and an accessible name (`aria-label`). It grows with its text up to `max-h-48` (put another `max-h-*` on it to change that), then scrolls. `rows="1"` starts it one line tall. Add `data-textarea` so the [textarea](/docs/v0.2/components/textarea) behaviour grows it in browsers without CSS `field-sizing`; leave out `data-textarea-submit`, as the prompt input already handles `Enter`.
- Below it, `.prompt-input-actions` is the toolbar: a `.prompt-input-tools` group at the start, and the submit button at the end.
- The submit button has `data-prompt-input-submit`, an `aria-label`, the `.prompt-input-submit` class and two icons: the send arrow, and a `.prompt-input-stop-icon` square that replaces it while a request runs.
- Optional: a `.prompt-input-attachments` row before the textarea, and one `.prompt-input-menu` per trigger character (see [Mentions and commands](#mentions-and-commands)).

```html Minimal
<form class="prompt-input" data-prompt-input hx-post="/api/chat" hx-target="#messages" hx-swap="beforeend">
  <textarea class="prompt-input-textarea" name="prompt" rows="1" data-textarea aria-label="Prompt" placeholder="Ask anything…"></textarea>
  <div class="prompt-input-actions">
    <button class="btn btn-primary btn-icon btn-sm btn-rounded prompt-input-submit" data-prompt-input-submit aria-label="Send">
      <svg>…arrow-up…</svg><span class="prompt-input-stop-icon" aria-hidden="true"></span>
    </button>
  </div>
</form>
```

## Actions

Anything can go in `.prompt-input-tools`: small ghost buttons (`btn btn-ghost btn-icon btn-sm`), [toggles](/docs/v0.2/components/toggle) with `aria-pressed` for tools the model may use, a native `select.select.input-sm.prompt-input-select` for the model (it looks like a ghost button until hovered), [tooltips](/docs/v0.2/components/tooltip) on icon buttons, or a [dropdown](/docs/v0.2/components/dropdown). Give them `type="button"` so they don't send the form.

The submit button is disabled while the box is empty: no text (spaces don't count) and no [attachment](/docs/v0.2/components/attachment) inside. Put attachments in `.prompt-input-attachments`, above the text; the button follows as they are added and removed.

```html
<form class="prompt-input" data-prompt-input hx-boost="false" onsubmit="event.preventDefault()">
  <div class="prompt-input-attachments">
    <div class="attachment attachment-xs">
      <div class="attachment-media"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4M10 9H8M16 13H8M16 17H8"/></svg></div>
      <div class="attachment-content"><p class="attachment-title">roadmap.pdf</p></div>
      <div class="attachment-actions">
        <button type="button" class="btn btn-ghost btn-icon btn-xs" aria-label="Remove roadmap.pdf" onclick="this.closest('.attachment').remove()"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
      </div>
    </div>
  </div>
  <textarea class="prompt-input-textarea" name="prompt" rows="1" data-textarea aria-label="Prompt" placeholder="Ask about the attachment…"></textarea>
  <div class="prompt-input-actions">
    <div class="prompt-input-tools">
      <button type="button" class="btn btn-ghost btn-icon btn-sm" aria-label="Add"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M5 12h14M12 5v14"/></svg></button>
      <button type="button" class="btn btn-ghost btn-sm" data-toggle aria-pressed="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z"/><path d="M19 3v4M17 5h4"/></svg> Think</button>
    </div>
    <button class="btn btn-primary btn-icon btn-sm btn-rounded prompt-input-submit" data-prompt-input-submit aria-label="Send">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg><span class="prompt-input-stop-icon" aria-hidden="true"></span>
    </button>
  </div>
</form>
```

Remove the attachment and the send button disables itself; type something and it comes back.

## Mentions and commands

A `.prompt-input-menu` with `data-prompt-input-menu="@"` and `role="listbox"` (and an `aria-label`) holds suggestions for one trigger character. Typing the trigger opens it above the box, and the text typed after the trigger filters it: an option matches on its `data-value`, its text and its `data-keywords`, ignoring case and accents. Each option is a `.prompt-input-option` with `role="option"` and a `data-value`; inside, anything goes: an icon or an [avatar](/docs/v0.2/components/avatar), a `.prompt-input-option-label` and a `.prompt-input-option-description`. A `.prompt-input-empty` with `data-prompt-input-empty` shows when nothing matches; without one the menu closes instead.

- **Where a trigger counts.** `@` (and any other character) opens its menu at the start of the text or after a space, so an email address doesn't. `/` only counts as the very first character of the text, as in most chat apps, so a URL or a fraction never opens it. Set `data-prompt-input-position="start"` or `"word"` on a menu to choose.
- **Picking** replaces the trigger and the query with the trigger, the option's `data-value` and a space (`@grace `, `/summarize `). Give an option `data-insert` to insert other text.
- **Groups:** wrap options in a `.prompt-input-group` with `role="group"`, headed by a `.prompt-input-label` it names through `aria-labelledby`. A group with nothing left in it hides.
- Menus open above the box, as wide as it, or below it when there is no room above. Add `.prompt-input-menu-down` to always open below.

```html
<form class="prompt-input" data-prompt-input hx-boost="false" onsubmit="event.preventDefault()">
  <textarea class="prompt-input-textarea" name="prompt" rows="1" data-textarea aria-label="Prompt" placeholder="Type @ for files, / for commands"></textarea>
  <div class="prompt-input-actions">
    <button class="btn btn-primary btn-icon btn-sm btn-rounded prompt-input-submit" data-prompt-input-submit aria-label="Send">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg><span class="prompt-input-stop-icon" aria-hidden="true"></span>
    </button>
  </div>
  <div class="prompt-input-menu" data-prompt-input-menu="@" role="listbox" aria-label="Files" hidden>
    <div class="prompt-input-group" role="group" aria-labelledby="pi-files-recent">
      <div class="prompt-input-label" id="pi-files-recent">Recent</div>
      <div class="prompt-input-option" role="option" data-value="README.md"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4M10 9H8M16 13H8M16 17H8"/></svg><span class="prompt-input-option-label">README.md</span></div>
      <div class="prompt-input-option" role="option" data-value="package.json"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg><span class="prompt-input-option-label">package.json</span></div>
    </div>
    <div class="prompt-input-group" role="group" aria-labelledby="pi-files-folders">
      <div class="prompt-input-label" id="pi-files-folders">Folders</div>
      <div class="prompt-input-option" role="option" data-value="src/" data-insert="@src/"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg><span class="prompt-input-option-label">src</span><span class="prompt-input-option-description">42 files</span></div>
      <div class="prompt-input-option" role="option" data-value="docs/" data-insert="@docs/"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg><span class="prompt-input-option-label">docs</span><span class="prompt-input-option-description">17 files</span></div>
    </div>
    <p class="prompt-input-empty" data-prompt-input-empty hidden>No files found.</p>
  </div>
  <div class="prompt-input-menu" data-prompt-input-menu="/" role="listbox" aria-label="Commands" hidden>
    <div class="prompt-input-option" role="option" data-value="summarize"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M15 12H3M17 18H3M21 6H3"/></svg><span class="prompt-input-option-label">Summarize</span><span class="prompt-input-option-description">Shorten the text</span></div>
    <div class="prompt-input-option" role="option" data-value="translate"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><span class="prompt-input-option-label">Translate</span><span class="prompt-input-option-description">Into another language</span></div>
    <div class="prompt-input-option" role="option" data-value="explain"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/></svg><span class="prompt-input-option-label">Explain code</span><span class="prompt-input-option-description">Step by step</span></div>
    <div class="prompt-input-option" role="option" data-value="search"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg><span class="prompt-input-option-label">Search the web</span><span class="prompt-input-option-description">With sources</span></div>
  </div>
</form>
```

The folders insert `@src/` with no space after it (`data-insert`), ready for a path. The textarea becomes a `role="combobox"` (still `aria-multiline`) whose `aria-expanded`, `aria-controls` and `aria-activedescendant` follow the open menu, so screen readers announce the highlighted suggestion while focus stays in the text.

## Suggestions from the server

For a list too long to put in the page, add `data-prompt-input-src` to the menu and leave it empty. As the user types, the behaviour fetches `src?q=<query>&trigger=@` (debounced: 150 ms, or `data-prompt-input-delay`; older answers are dropped), and the returned option markup replaces the menu's content. The server does the filtering. Return a `.prompt-input-empty` with `data-prompt-input-empty` to say nothing matched, or nothing to close the menu. The request carries `HX-Request: true`, so a route shared with htmx can return fragments as usual.

```html
<form class="prompt-input" data-prompt-input hx-boost="false" onsubmit="event.preventDefault()">
  <textarea class="prompt-input-textarea" name="prompt" rows="1" data-textarea aria-label="Prompt" placeholder="Type @ and a name: Ada, Grace, Tim…"></textarea>
  <div class="prompt-input-actions">
    <button class="btn btn-primary btn-icon btn-sm btn-rounded prompt-input-submit" data-prompt-input-submit aria-label="Send">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg><span class="prompt-input-stop-icon" aria-hidden="true"></span>
    </button>
  </div>
  <div class="prompt-input-menu" data-prompt-input-menu="@" data-prompt-input-src="/api/prompt-input/mentions" role="listbox" aria-label="People" hidden></div>
</form>
```

The endpoint answers with plain option markup, the same as inline options: `<div class="prompt-input-option" role="option" data-value="ada">…</div>`. This demo's endpoint is part of the dev server, so it only answers on a running site, not on a static host.

## With htmx

Put `hx-post` on the form. `Enter` sends it with `requestSubmit()`, so htmx, native validation (`required`, `maxlength`) and your own `submit` listeners all run, and every field in the form goes along: the prompt, the model select, hidden inputs for toggles or attachment ids.

- While the form's request runs (from htmx's `htmx:before:request` to `htmx:finally:request`), the form has `data-state="loading"`. `htmx:finally:request` is used rather than `htmx:after:request` because htmx 4 also fires it after an error or an abort.
- In the loading state the submit button shows the stop square, is labelled "Stop" (`data-prompt-input-stop-label` on the button changes that), and `Enter` sends nothing.
- Clicking stop fires `prompt-input:stop` on the form, then sends htmx an `htmx:abort`, which cancels the request. Call `preventDefault()` on the event to stop the answer your own way instead (say, by telling a streaming server to stop).
- When the response is under 400 the textarea is cleared. An error keeps the text, so the user can try again. Add `data-prompt-input-clear="false"` to keep it always.

Streaming the answer (server-sent events, or a request that appends as it goes) is the server's business; the prompt input only needs the request's start and end. An app that sends prompts without htmx sets and removes `data-state="loading"` on the form itself; the button follows, and stop then clears the state after firing its event.

```html A stop that tells the server
<form class="prompt-input" data-prompt-input hx-post="/chat" hx-target="#messages" hx-swap="beforeend"
      hx-on:prompt-input:stop="fetch('/chat/stop', { method: 'POST' })">
  …
</form>
```

## Keyboard

| Key | Action |
| --- | --- |
| `Enter` | Send the prompt (nothing while empty or loading) |
| `Shift` `Enter` | New line |
| `@`, `/` | Open that trigger's menu; the text after it filters the menu |
| `↓` `↑` | Menu open: move the highlight (wrapping round) |
| `Enter`, `Tab` | Menu open: insert the highlighted suggestion |
| `Esc` | Close the menu; it stays closed until the next trigger |

The first suggestion is highlighted as soon as a menu opens, so `Enter` takes it. While an IME composition is in progress, `Enter` is left to the IME.

## Events

Both events bubble from the form.

- `prompt-input:select`, after a suggestion is inserted, with `detail` `{ trigger, value, option, query }`: the trigger character, the option's value, the option element and the text that was typed after the trigger.
- `prompt-input:stop`, when the stop button is clicked. Cancelable: `preventDefault()` keeps the request running and the loading state on.

Picks are inserted as plain text, which the server can read straight from the prompt. To show them as chips instead, or to send the picked ids, listen for `prompt-input:select`:

```js app.js
document.addEventListener("prompt-input:select", (e) => {
  const { trigger, value } = e.detail;
  if (trigger !== "@") return;
  // Send the mentioned ids with the prompt, as hidden fields in the form.
  const input = Object.assign(document.createElement("input"), { type: "hidden", name: "mentions", value });
  e.target.append(input);
});
```

## Nunjucks macro

The `prompt_input` macro writes the form, the textarea, the toolbar with its submit button and the menus. The call body goes in the toolbar. `mentions` and `commands` take options as `{value, label, description, keywords, icon}`; `mentions_src` and `commands_src` fetch them from the server instead.

```html
<form class="prompt-input" data-prompt-input id="pi-macro" hx-boost="false" onsubmit="event.preventDefault()">
  <textarea class="prompt-input-textarea" name="prompt" rows="1" placeholder="Send a message" aria-label="Prompt" data-textarea id="pi-macro-textarea"></textarea>
  <div class="prompt-input-actions">
    <div class="prompt-input-tools">
            <button type="button" class="btn btn-ghost btn-icon btn-sm" aria-label="Attach files"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg></button>

    </div>
    <button class="btn btn-primary btn-icon btn-sm btn-rounded prompt-input-submit" data-prompt-input-submit aria-label="Send" data-prompt-input-stop-label="Stop">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg><span class="prompt-input-stop-icon" aria-hidden="true"></span>
    </button>
  </div>
  <div class="prompt-input-menu" data-prompt-input-menu="@" role="listbox" aria-label="Mentions" hidden>
  <div class="prompt-input-option" role="option" data-value="ada">
    <span class="prompt-input-option-label">Ada Lovelace</span>
<span class="prompt-input-option-description">Analyst</span>  </div>
  <div class="prompt-input-option" role="option" data-value="alan" data-keywords="enigma">
    <span class="prompt-input-option-label">Alan Turing</span>
<span class="prompt-input-option-description">Cryptography</span>  </div>
  <div class="prompt-input-option" role="option" data-value="grace" data-keywords="cobol">
    <span class="prompt-input-option-label">Grace Hopper</span>
<span class="prompt-input-option-description">Compilers</span>  </div>
  <div class="prompt-input-option" role="option" data-value="linus" data-keywords="linux git">
    <span class="prompt-input-option-label">Linus Torvalds</span>
<span class="prompt-input-option-description">Kernels</span>  </div>
  <p class="prompt-input-empty" data-prompt-input-empty hidden>No matches.</p>
</div>
  <div class="prompt-input-menu" data-prompt-input-menu="/" role="listbox" aria-label="Commands" hidden>
  <div class="prompt-input-option" role="option" data-value="summarize">
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M15 12H3M17 18H3M21 6H3"/></svg>    <span class="prompt-input-option-label">Summarize</span>
<span class="prompt-input-option-description">Shorten the text</span>  </div>
  <div class="prompt-input-option" role="option" data-value="translate">
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>    <span class="prompt-input-option-label">Translate</span>
<span class="prompt-input-option-description">Into another language</span>  </div>
  <div class="prompt-input-option" role="option" data-value="explain">
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/></svg>    <span class="prompt-input-option-label">Explain code</span>
<span class="prompt-input-option-description">Step by step</span>  </div>
  <div class="prompt-input-option" role="option" data-value="search">
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>    <span class="prompt-input-option-label">Search the web</span>
<span class="prompt-input-option-description">With sources</span>  </div>
  <p class="prompt-input-empty" data-prompt-input-empty hidden>No commands found.</p>
</div>
</form>
```

```jinja page.html
{% from "components/prompt-input/prompt-input.html" import prompt_input %}

{% call prompt_input(action="/chat", target="#messages", swap="beforeend",
                     mentions=json("data/people.json"), commands_src="/chat/commands") %}
  <button type="button" class="btn btn-ghost btn-icon btn-sm" aria-label="Attach files">{{ icon("paperclip") }}</button>
{% endcall %}
```

Other options: `name`, `placeholder`, `label`, `rows`, `maxlength` and `required` for the textarea; `attachments=true` for an empty attachments row (id `<id>-attachments`); `clear=false`; `submit_label` and `stop_label`; `id`, `class` and `attrs` for the form.

## Reference

| Class / attribute | Description |
| --- | --- |
| `.prompt-input` | The box: a <form> with data-prompt-input. One focus ring for all of it. |
| `.prompt-input-textarea` | The text. Grows with its content up to max-h-48. Add data-textarea for older browsers. |
| `.prompt-input-attachments` | A row of attachments above the text; takes no room while empty. |
| `.prompt-input-actions` | The toolbar under the text. |
| `.prompt-input-tools` | Buttons, toggles and selects at the start of the toolbar. |
| `.prompt-input-select` | A native select.select.input-sm that looks like a ghost button (the model). |
| `.prompt-input-submit` | The send button, at the end of the toolbar. Add data-prompt-input-submit. |
| `.prompt-input-stop-icon` | The square shown in the submit button while loading. |
| `.prompt-input-menu` | A listbox of suggestions for one trigger, above the box. data-prompt-input-menu="@". |
| `.prompt-input-menu-down` | Always open the menu below the box (otherwise it flips below on its own when there is no room above: data-side="bottom"). |
| `.prompt-input-option` | One suggestion (role="option", data-value). data-keywords: extra words to match; data-insert: the text to insert. |
| `.prompt-input-option-label / -description` | The option's name, and muted text at its end. |
| `.prompt-input-group / .prompt-input-label` | A group of options (role="group") and its heading. |
| `.prompt-input-empty` | Shown when nothing matches. Add data-prompt-input-empty. |
| `data-state="loading"` | On the form while its request runs: the submit button becomes stop. |
| `data-prompt-input-clear="false"` | Keep the text after a successful send. |
| `data-prompt-input-stop-label` | On the submit button: its label while loading (default "Stop"). |
| `data-prompt-input-position` | On a menu: "start" (only as the first character; the default for /) or "word" (after a space). |
| `data-prompt-input-src / -delay` | On a menu: fetch options from src?q=…&trigger=…, after delay ms (150). |
| `prompt-input:select` | Event with detail { trigger, value, option, query }. |
| `prompt-input:stop` | Cancelable event when stop is clicked; then htmx:abort. |
