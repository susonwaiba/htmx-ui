---
title: "Chain of thought"
description: "A sequence of steps on a connecting line, each folding its details away, for reasoning traces, tool calls and process logs."
url: "/docs/v0.2/components/chain-of-thought"
section: "Components"
---

# Chain of thought

A sequence of steps on a connecting line, each folding its details away, for reasoning traces, tool calls and process logs.

```html
<div class="chain-of-thought mx-auto max-w-lg">
  <details class="chain-of-thought-step" data-status="complete" open>
    <summary class="chain-of-thought-step-header">
      <span class="chain-of-thought-step-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></span>
      <span class="chain-of-thought-step-label">Searching for htmx 4 event names</span>
    </summary>
    <div class="chain-of-thought-step-content">
      <ul class="chain-of-thought-step-items">
        <li class="chain-of-thought-step-item">Events are colon-delimited: <code>htmx:after:swap</code>.</li>
        <li class="chain-of-thought-step-item"><code>htmx:after:process</code> fires on each new element.</li>
      </ul>
      <div class="chain-of-thought-results">
        <span class="badge badge-secondary">htmx.org</span>
        <span class="badge badge-secondary">github.com</span>
      </div>
    </div>
  </details>
  <details class="chain-of-thought-step" data-status="complete">
    <summary class="chain-of-thought-step-header">
      <span class="chain-of-thought-step-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4M10 9H8M16 13H8M16 17H8"/></svg></span>
      <span class="chain-of-thought-step-label">Reading the migration guide</span>
    </summary>
    <div class="chain-of-thought-step-content"><p>Three renamed events affect the components.</p></div>
  </details>
  <div class="chain-of-thought-step" data-status="active" aria-current="step">
    <div class="chain-of-thought-step-header">
      <span class="chain-of-thought-step-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spinner" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.22-8.56"/></svg></span>
      <span class="chain-of-thought-step-label">Writing the answer</span>
    </div>
  </div>
</div>
```

## Markup

- `.chain-of-thought` stacks the steps. Pure CSS: each step that has details is a `<details class="chain-of-thought-step">`, so it opens with no JavaScript.
- A step's `.chain-of-thought-step-header` (its `<summary>`) holds a `.chain-of-thought-step-icon` and a `.chain-of-thought-step-label`; the chevron is drawn for you. An empty icon is a dot.
- `.chain-of-thought-step-content` holds the details: a `.chain-of-thought-step-items` list of `.chain-of-thought-step-item`s, `.chain-of-thought-results` (a row of [badges](/docs/v0.2/components/badge)), a `.chain-of-thought-image`, or any text.
- A step without details is a plain `<div class="chain-of-thought-step">` with a `<div class="chain-of-thought-step-header">`: a row that doesn't open.
- A line runs from each step's icon, past its details, to the next step.

## Steps and status

`data-status` on a step: `complete` (or none) is muted, `active` is in the text colour with a pulsing dot (or put a [spinner](/docs/v0.2/components/spinner) in its icon), `pending` is faded and `error` is in the danger colour. Mark the active step `aria-current="step"`. To update a running chain, swap the steps from the server with htmx as they change.

```html
<div class="chain-of-thought mx-auto max-w-lg">
  <div class="chain-of-thought-step" data-status="complete">
    <div class="chain-of-thought-step-header"><span class="chain-of-thought-step-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span><span class="chain-of-thought-step-label">Fetched the invoices</span></div>
  </div>
  <div class="chain-of-thought-step" data-status="error">
    <div class="chain-of-thought-step-header"><span class="chain-of-thought-step-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/></svg></span><span class="chain-of-thought-step-label">Couldn't reach the payments API</span></div>
  </div>
  <div class="chain-of-thought-step" data-status="active" aria-current="step">
    <div class="chain-of-thought-step-header"><span class="chain-of-thought-step-icon"></span><span class="chain-of-thought-step-label">Retrying with the backup endpoint</span></div>
  </div>
  <div class="chain-of-thought-step" data-status="pending">
    <div class="chain-of-thought-step-header"><span class="chain-of-thought-step-icon"></span><span class="chain-of-thought-step-label">Reconcile the totals</span></div>
  </div>
</div>
```

## Without the line

`.chain-of-thought-plain` on the chain leaves out the line between the steps.

```html
<div class="chain-of-thought chain-of-thought-plain mx-auto max-w-lg">
  <div class="chain-of-thought-step"><div class="chain-of-thought-step-header"><span class="chain-of-thought-step-icon"></span><span class="chain-of-thought-step-label">Parsed the request</span></div></div>
  <div class="chain-of-thought-step"><div class="chain-of-thought-step-header"><span class="chain-of-thought-step-icon"></span><span class="chain-of-thought-step-label">Looked up the account</span></div></div>
  <div class="chain-of-thought-step"><div class="chain-of-thought-step-header"><span class="chain-of-thought-step-icon"></span><span class="chain-of-thought-step-label">Drafted the reply</span></div></div>
</div>
```

## Collapsible chain

The whole chain can fold away under one line: make it a `<details class="chain-of-thought">` with a `<summary class="chain-of-thought-header">`, and put the steps in a `.chain-of-thought-content`.

```html
<details class="chain-of-thought mx-auto max-w-lg">
  <summary class="chain-of-thought-header"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z"/><path d="M19 3v4M17 5h4"/></svg><span>Worked for 12 seconds</span></summary>
  <div class="chain-of-thought-content">
    <div class="chain-of-thought-step"><div class="chain-of-thought-step-header"><span class="chain-of-thought-step-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></span><span class="chain-of-thought-step-label">Searched 4 sources</span></div></div>
    <div class="chain-of-thought-step"><div class="chain-of-thought-step-header"><span class="chain-of-thought-step-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m4 17 6-6-6-6M12 19h8"/></svg></span><span class="chain-of-thought-step-label">Ran the test suite</span></div></div>
    <div class="chain-of-thought-step"><div class="chain-of-thought-step-header"><span class="chain-of-thought-step-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span><span class="chain-of-thought-step-label">All 212 tests pass</span></div></div>
  </div>
</details>
```

## With tool calls and search results

A step's details can hold anything: the sources a search found, a tool's input and output, or an image it looked at.

```html
<div class="chain-of-thought mx-auto max-w-lg">
  <details class="chain-of-thought-step" data-status="complete" open>
    <summary class="chain-of-thought-step-header">
      <span class="chain-of-thought-step-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></span>
      <span class="chain-of-thought-step-label">Searched "Sydney weather this weekend"</span>
    </summary>
    <div class="chain-of-thought-step-content">
      <div class="chain-of-thought-results">
        <a class="badge badge-outline" href="https://www.bom.gov.au"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg> bom.gov.au</a>
        <a class="badge badge-outline" href="https://www.weatherzone.com.au"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg> weatherzone.com.au</a>
      </div>
    </div>
  </details>
  <details class="chain-of-thought-step" data-status="complete" open>
    <summary class="chain-of-thought-step-header">
      <span class="chain-of-thought-step-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg></span>
      <span class="chain-of-thought-step-label">Called get_forecast</span>
    </summary>
    <div class="chain-of-thought-step-content">
      <pre class="overflow-x-auto rounded-(--radius) bg-muted p-2 font-mono text-xs">{"city": "Sydney", "days": 2} → {"sat": 24, "sun": 21}</pre>
    </div>
  </details>
  <div class="chain-of-thought-step" data-status="complete">
    <div class="chain-of-thought-step-header"><span class="chain-of-thought-step-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span><span class="chain-of-thought-step-label">Summarised the forecast</span></div>
  </div>
</div>
```

## In a message

Above an assistant's reply in a `.message-plain` body, folded away once the work is done.

```html
<div class="message-list mx-auto w-full max-w-lg">
  <div class="message" data-align="end">
    <div class="message-body"><div class="message-content">Why did last night's deploy fail?</div></div>
  </div>
  <div class="message message-plain">
    <span class="avatar message-avatar" role="img" aria-label="Assistant"><span class="avatar-fallback" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2M20 14h2M15 13v2M9 13v2"/></svg></span></span>
    <div class="message-body">
      <details class="chain-of-thought">
        <summary class="chain-of-thought-header"><span>3 steps</span></summary>
        <div class="chain-of-thought-content">
          <div class="chain-of-thought-step"><div class="chain-of-thought-step-header"><span class="chain-of-thought-step-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m4 17 6-6-6-6M12 19h8"/></svg></span><span class="chain-of-thought-step-label">Read the deploy log</span></div></div>
          <div class="chain-of-thought-step"><div class="chain-of-thought-step-header"><span class="chain-of-thought-step-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></span><span class="chain-of-thought-step-label">Found "DATABASE_URL is not set"</span></div></div>
          <div class="chain-of-thought-step"><div class="chain-of-thought-step-header"><span class="chain-of-thought-step-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg></span><span class="chain-of-thought-step-label">Checked the environment config</span></div></div>
        </div>
      </details>
      <div class="message-content">The deploy failed because <code>DATABASE_URL</code> isn't set in production. Add it to the environment and redeploy.</div>
    </div>
  </div>
</div>
```

## Macro

`chain_of_thought()` writes the chain (a `<details>` when it has a label) and `chain_of_thought_step()` a step: a `<details>` when it has a call body, else a plain row. Without an `icon`, a step's status picks one: a check (complete), a spinner (active), a cross (error), else a dot; `icon=false` always gives the dot.

```jinja
{% from "components/chain-of-thought/chain-of-thought.html" import chain_of_thought, chain_of_thought_step %}

{% call chain_of_thought() %}
  {% call chain_of_thought_step("Searching the docs", status="complete", icon="search", open=true) %}
    <ul class="chain-of-thought-step-items"><li class="chain-of-thought-step-item">Found 3 pages</li></ul>
  {% endcall %}
  {{ chain_of_thought_step("Writing the answer", status="active") }}
{% endcall %}

{% call chain_of_thought("Worked for 12 seconds", open=false, plain=true) %}…{% endcall %}
```

| Macro | Description |
| --- | --- |
| `chain_of_thought(label=none, open=true, icon=none, plain=false, attrs=none, class="")` | label folds the chain under a summary; plain drops the line. |
| `chain_of_thought_step(label, status=none, icon=none, open=false, attrs=none, class="")` | status: complete \| active \| pending \| error; open only with a call body. |

## Reference

| Class | Description |
| --- | --- |
| `.chain-of-thought` | The steps, stacked. A <div>, or a <details> to fold them away. |
| `.chain-of-thought-header / -content` | A folding chain's <summary>, and the steps under it. |
| `.chain-of-thought-plain` | On the chain: no line between the steps. |
| `.chain-of-thought-step` | One step: a <details> with details, else a <div>. |
| `[data-status]` | On a step: complete \| active \| pending \| error. |
| `.chain-of-thought-step-header` | The step's <summary> (or <div>): icon, label, chevron. |
| `.chain-of-thought-step-icon` | An icon, a spinner, or empty for a dot. |
| `.chain-of-thought-step-label` | The step's text. |
| `.chain-of-thought-step-content` | The step's details, indented under its label. |
| `.chain-of-thought-step-items / -item` | A list of findings. |
| `.chain-of-thought-results` | A wrapping row of badges, e.g. search results. |
| `.chain-of-thought-image` | An image in a step. |
