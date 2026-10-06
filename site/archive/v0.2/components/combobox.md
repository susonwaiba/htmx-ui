---
title: "Combobox"
description: "An input with a list of suggestions that filters as you type: groups, multiple picks as chips, a clear button and server-side search."
url: "/docs/v0.2/components/combobox"
section: "Components"
---

# Combobox

An input with a list of suggestions that filters as you type: groups, multiple picks as chips, a clear button and server-side search.

```html
<div class="combobox w-64" data-combobox>
  <div class="input-group">
    <input class="input" data-combobox-input placeholder="Pick a framework" aria-label="Framework" />
    <span class="input-group-addon input-group-addon-inline-end">
      <button type="button" class="btn btn-ghost btn-icon" data-combobox-clear aria-label="Clear" hidden><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
      <button type="button" class="btn btn-ghost btn-icon" data-combobox-toggle tabindex="-1" aria-label="Show suggestions"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg></button>
    </span>
  </div>
  <div class="combobox-content" role="listbox" aria-label="Frameworks" hidden>
    <div class="combobox-item" role="option" value="astro">
      Astro
      <span class="combobox-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span>
    </div>
    <div class="combobox-item" role="option" value="next" data-keywords="react vercel">
      Next.js
      <span class="combobox-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span>
    </div>
    <div class="combobox-item" role="option" value="nuxt" data-keywords="vue">
      Nuxt
      <span class="combobox-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span>
    </div>
    <div class="combobox-item" role="option" value="remix" data-keywords="react">
      Remix
      <span class="combobox-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span>
    </div>
    <div class="combobox-item" role="option" value="solid-start" data-keywords="solid">
      SolidStart
      <span class="combobox-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span>
    </div>
    <div class="combobox-item" role="option" value="sveltekit" data-keywords="svelte">
      SvelteKit
      <span class="combobox-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span>
    </div>
    <p class="combobox-empty" data-combobox-empty hidden>No framework found.</p>
  </div>
  <input type="hidden" name="framework" data-combobox-value />
</div>
```

A combobox is a text input that suggests values: the user can type to narrow a long list, or open it and pick. Use a [select](/docs/v0.2/components/select) when the list is short enough to scan, and a combobox when typing is the faster way in.

## Markup

- Wrap everything in `.combobox` with `data-combobox`.
- The input has `data-combobox-input` and a name for screen readers (`aria-label`, or a `<label for>`). The behaviour makes it a `role="combobox"` linked to the list, and turns browser autocomplete off. Put it in an [input group](/docs/v0.2/components/input-group) to give it buttons, or use a bare `.input`.
- The list is a `.combobox-content` with `role="listbox"`, starting `hidden`. Each suggestion is a `.combobox-item` with `role="option"` and a `value`; `aria-selected="true"` marks the starting choice. A `.combobox-check` inside shows while the option is picked.
- Optional parts: a `[data-combobox-clear]` button, shown only when there is something to clear; a `[data-combobox-toggle]` button that opens and closes the list (`tabindex="-1"`, as the input already takes focus); a `.combobox-empty` with `data-combobox-empty` for "no matches".
- To submit the value, add `<input type="hidden" name="framework" data-combobox-value>`. The text input shows the label; the hidden field carries the value.

## Keyboard

Focus stays in the input the whole time, so typing never stops working. The highlighted option is announced through `aria-activedescendant`.

| Key | Action |
| --- | --- |
| Typing | Open the list and filter it |
| `↓` `↑` | Open the list, or move the highlight (wrapping round) |
| `Enter` | Pick the highlighted option |
| `Esc` | Close the list |
| `Tab`, click outside | Close the list and move on |
| `Backspace` in an empty input | Multiple: remove the last pick |

Picking writes the option's label into the input and closes the list. Leaving the input with other text in it puts the label back; leaving it empty clears the choice.

## Filtering

Typing matches like a command palette rather than a plain prefix search: case and accents don't matter (`zurich` finds Zürich), and every word typed must appear somewhere in the option, in any order. Add `data-keywords` to make an option findable by words that aren't in its label: above, typing `react` finds Next.js and Remix. Groups with nothing left in them hide, along with their separators, and the empty message shows when nothing matches.

## Auto highlight

With `data-autohighlight` on the wrapper, the first match is highlighted as you type, so `Enter` takes it straight away. Without it, nothing is highlighted until an arrow key or the pointer picks one, and `Enter` submits the form as usual.

```html
    <div class="combobox w-64" data-combobox data-autohighlight>
  <div class="input-group">
    <input class="input" id="cb-autohighlight" data-combobox-input placeholder="Type, then Enter" aria-label="Framework" />
    <span class="input-group-addon input-group-addon-inline-end">
      <button type="button" class="btn btn-ghost btn-icon" data-combobox-clear aria-label="Clear" hidden><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
      <button type="button" class="btn btn-ghost btn-icon" data-combobox-toggle tabindex="-1" aria-label="Show suggestions"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg></button>
    </span>
  </div>
  <div class="combobox-content" role="listbox" aria-label="Framework" hidden>
    <div class="combobox-item" role="option" value="astro" aria-selected="false">Astro<span class="combobox-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span></div>
    <div class="combobox-item" role="option" value="next" aria-selected="false" data-keywords="react vercel">Next.js<span class="combobox-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span></div>
    <div class="combobox-item" role="option" value="nuxt" aria-selected="false" data-keywords="vue">Nuxt<span class="combobox-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span></div>
    <div class="combobox-item" role="option" value="remix" aria-selected="false" data-keywords="react">Remix<span class="combobox-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span></div>
    <div class="combobox-item" role="option" value="solid-start" aria-selected="false" data-keywords="solid">SolidStart<span class="combobox-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span></div>
    <div class="combobox-item" role="option" value="sveltekit" aria-selected="false" data-keywords="svelte">SvelteKit<span class="combobox-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span></div>
    <p class="combobox-empty" data-combobox-empty hidden>No results.</p>
  </div>
</div>
```

## Groups

Wrap a run of options in a `.combobox-group` with `role="group"`, headed by a `.combobox-label` that names it through `aria-labelledby`. A `.combobox-separator` with `role="separator"` goes between groups.

```html
    <div class="combobox w-72" data-combobox>
  <div class="input-group">
    <input class="input" id="cb-timezone" data-combobox-input placeholder="Search timezones" aria-label="Timezone" />
    <span class="input-group-addon input-group-addon-inline-end">
      <button type="button" class="btn btn-ghost btn-icon" data-combobox-clear aria-label="Clear" hidden><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
      <button type="button" class="btn btn-ghost btn-icon" data-combobox-toggle tabindex="-1" aria-label="Show suggestions"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg></button>
    </span>
  </div>
  <div class="combobox-content" role="listbox" aria-label="Timezone" hidden>
    <div class="combobox-group" role="group" aria-labelledby="cb-timezone-group-1">
      <div class="combobox-label" id="cb-timezone-group-1">Americas</div>
      <div class="combobox-item" role="option" value="america/new_york" aria-selected="false">New York (GMT-5)<span class="combobox-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span></div>
      <div class="combobox-item" role="option" value="america/chicago" aria-selected="false">Chicago (GMT-6)<span class="combobox-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span></div>
      <div class="combobox-item" role="option" value="america/los_angeles" aria-selected="false">Los Angeles (GMT-8)<span class="combobox-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span></div>
    </div>
    <div class="combobox-separator" role="separator"></div>
    <div class="combobox-group" role="group" aria-labelledby="cb-timezone-group-2">
      <div class="combobox-label" id="cb-timezone-group-2">Europe</div>
      <div class="combobox-item" role="option" value="europe/london" aria-selected="false">London (GMT+0)<span class="combobox-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span></div>
      <div class="combobox-item" role="option" value="europe/paris" aria-selected="false">Paris (GMT+1)<span class="combobox-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span></div>
      <div class="combobox-item" role="option" value="europe/athens" aria-selected="false">Athens (GMT+2)<span class="combobox-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span></div>
    </div>
    <div class="combobox-separator" role="separator"></div>
    <div class="combobox-group" role="group" aria-labelledby="cb-timezone-group-3">
      <div class="combobox-label" id="cb-timezone-group-3">Asia and Pacific</div>
      <div class="combobox-item" role="option" value="asia/kathmandu" aria-selected="true">Kathmandu (GMT+5:45)<span class="combobox-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span></div>
      <div class="combobox-item" role="option" value="asia/tokyo" aria-selected="false">Tokyo (GMT+9)<span class="combobox-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span></div>
      <div class="combobox-item" role="option" value="australia/sydney" aria-selected="false">Sydney (GMT+10)<span class="combobox-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span></div>
      <div class="combobox-item" role="option" value="pacific/auckland" aria-selected="false">Auckland (GMT+12)<span class="combobox-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span></div>
    </div>
    <p class="combobox-empty" data-combobox-empty hidden>No results.</p>
  </div>
  <input type="hidden" name="timezone" data-combobox-value />
</div>
```

## Multiple

Add `data-multiple` to the wrapper and replace the input group with a `.combobox-chips` box holding a `.combobox-chips-input`, both with their data attributes. Picking toggles an option and keeps the list open; each pick shows as a chip before the input, with a button to remove it, and `Backspace` in the empty input removes the last one. The hidden field is repeated, one per value, so the form submits `frameworks=next&frameworks=astro`.

```html
<div class="combobox w-80" data-combobox data-multiple>
  <div class="combobox-chips" data-combobox-chips>
    <input class="combobox-chips-input" data-combobox-input placeholder="Add frameworks" aria-label="Frameworks" />
    <button type="button" class="btn btn-ghost btn-icon" data-combobox-clear aria-label="Clear all" hidden><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
  </div>
  <div class="combobox-content" role="listbox" aria-label="Frameworks" hidden>
    <div class="combobox-item" role="option" value="astro" aria-selected="false">
      Astro
      <span class="combobox-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span>
    </div>
    <div class="combobox-item" role="option" value="next" aria-selected="true">
      Next.js
      <span class="combobox-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span>
    </div>
    <div class="combobox-item" role="option" value="nuxt" aria-selected="false">
      Nuxt
      <span class="combobox-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span>
    </div>
    <div class="combobox-item" role="option" value="remix" aria-selected="false">
      Remix
      <span class="combobox-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span>
    </div>
    <div class="combobox-item" role="option" value="solid-start" aria-selected="false">
      SolidStart
      <span class="combobox-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span>
    </div>
    <div class="combobox-item" role="option" value="sveltekit" aria-selected="true">
      SvelteKit
      <span class="combobox-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span>
    </div>
    <p class="combobox-empty" data-combobox-empty hidden>No framework found.</p>
  </div>
  <input type="hidden" name="frameworks" data-combobox-value />
</div>
```

## Clear button

A `[data-combobox-clear]` button empties the input and the choice (every chip, with `data-multiple`) and returns focus to the input. It hides itself while there is nothing to clear, so start it `hidden` unless the combobox starts with a value. Leave it out when a value is required.

## Form states

The combobox takes the input states, shown through its [input group](/docs/v0.2/components/input-group) or chip box: `aria-invalid="true"` for an error, `disabled` (its buttons are disabled with it), and `required`, which native validation checks against the text input — it only holds text once something is picked. Put it in a [field](/docs/v0.2/components/field) for the label and messages.

```html
    <div class="field w-64">
      <label class="label" for="cb-invalid">Framework</label>
      <div class="combobox" data-combobox>
  <div class="input-group">
    <input class="input" id="cb-invalid" data-combobox-input placeholder="Search…" aria-invalid="true" required aria-describedby="cb-invalid-error" />
    <span class="input-group-addon input-group-addon-inline-end">
      <button type="button" class="btn btn-ghost btn-icon" data-combobox-clear aria-label="Clear" hidden><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
      <button type="button" class="btn btn-ghost btn-icon" data-combobox-toggle tabindex="-1" aria-label="Show suggestions"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg></button>
    </span>
  </div>
  <div class="combobox-content" role="listbox" hidden>
    <div class="combobox-item" role="option" value="astro" aria-selected="false">Astro<span class="combobox-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span></div>
    <div class="combobox-item" role="option" value="next" aria-selected="false" data-keywords="react vercel">Next.js<span class="combobox-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span></div>
    <div class="combobox-item" role="option" value="nuxt" aria-selected="false" data-keywords="vue">Nuxt<span class="combobox-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span></div>
    <div class="combobox-item" role="option" value="remix" aria-selected="false" data-keywords="react">Remix<span class="combobox-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span></div>
    <div class="combobox-item" role="option" value="solid-start" aria-selected="false" data-keywords="solid">SolidStart<span class="combobox-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span></div>
    <div class="combobox-item" role="option" value="sveltekit" aria-selected="false" data-keywords="svelte">SvelteKit<span class="combobox-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span></div>
    <p class="combobox-empty" data-combobox-empty hidden>No results.</p>
  </div>
</div>
      <p class="field-error" id="cb-invalid-error"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/></svg> Pick the framework your project uses.</p>
    </div>
    <div class="field w-64">
      <label class="label" for="cb-disabled">Framework</label>
      <div class="combobox" data-combobox>
  <div class="input-group">
    <input class="input" id="cb-disabled" data-combobox-input placeholder="Search…" disabled />
    <span class="input-group-addon input-group-addon-inline-end">
      <button type="button" class="btn btn-ghost btn-icon" data-combobox-clear aria-label="Clear" hidden><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
      <button type="button" class="btn btn-ghost btn-icon" data-combobox-toggle tabindex="-1" aria-label="Show suggestions"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg></button>
    </span>
  </div>
  <div class="combobox-content" role="listbox" hidden>
    <div class="combobox-item" role="option" value="astro" aria-selected="true">Astro<span class="combobox-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span></div>
    <div class="combobox-item" role="option" value="next" aria-selected="false" data-keywords="react vercel">Next.js<span class="combobox-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span></div>
    <div class="combobox-item" role="option" value="nuxt" aria-selected="false" data-keywords="vue">Nuxt<span class="combobox-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span></div>
    <div class="combobox-item" role="option" value="remix" aria-selected="false" data-keywords="react">Remix<span class="combobox-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span></div>
    <div class="combobox-item" role="option" value="solid-start" aria-selected="false" data-keywords="solid">SolidStart<span class="combobox-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span></div>
    <div class="combobox-item" role="option" value="sveltekit" aria-selected="false" data-keywords="svelte">SvelteKit<span class="combobox-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span></div>
    <p class="combobox-empty" data-combobox-empty hidden>No results.</p>
  </div>
</div>
      <p class="field-description">Locked while a deploy is running.</p>
    </div>
    <div class="field w-80">
      <label class="label" for="cb-multi-invalid">Frameworks</label>
      <div class="combobox" data-combobox data-multiple>
  <div class="combobox-chips" data-combobox-chips>
    <input class="combobox-chips-input" id="cb-multi-invalid" data-combobox-input placeholder="Search…" aria-invalid="true" />
    <button type="button" class="btn btn-ghost btn-icon" data-combobox-clear aria-label="Clear" hidden><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
  </div>
  <div class="combobox-content" role="listbox" hidden>
    <div class="combobox-item" role="option" value="astro" aria-selected="false">Astro<span class="combobox-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span></div>
    <div class="combobox-item" role="option" value="next" aria-selected="false" data-keywords="react vercel">Next.js<span class="combobox-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span></div>
    <div class="combobox-item" role="option" value="nuxt" aria-selected="false" data-keywords="vue">Nuxt<span class="combobox-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span></div>
    <div class="combobox-item" role="option" value="remix" aria-selected="false" data-keywords="react">Remix<span class="combobox-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span></div>
    <div class="combobox-item" role="option" value="solid-start" aria-selected="false" data-keywords="solid">SolidStart<span class="combobox-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span></div>
    <div class="combobox-item" role="option" value="sveltekit" aria-selected="false" data-keywords="svelte">SvelteKit<span class="combobox-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span></div>
    <p class="combobox-empty" data-combobox-empty hidden>No results.</p>
  </div>
</div>
    </div>
```

## Input group

The input sits in an ordinary [input group](/docs/v0.2/components/input-group), so any addon works beside it: an icon, text, a button. Here an icon leads, and each option carries its region as a `.combobox-item-description`.

```html
<div class="combobox w-72" data-combobox data-autohighlight>
  <div class="input-group">
    <input class="input" data-combobox-input placeholder="Search timezones" aria-label="Timezone" />
    <span class="input-group-addon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8M12 17v4"/></svg></span>
    <span class="input-group-addon input-group-addon-inline-end">
      <button type="button" class="btn btn-ghost btn-icon" data-combobox-clear aria-label="Clear" hidden><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
    </span>
  </div>
  <div class="combobox-content" role="listbox" aria-label="Timezones" hidden>
    <div class="combobox-item" role="option" value="america/new_york">New York (GMT-5)<span class="combobox-item-description">Americas</span></div>
    <div class="combobox-item" role="option" value="america/chicago">Chicago (GMT-6)<span class="combobox-item-description">Americas</span></div>
    <div class="combobox-item" role="option" value="america/los_angeles">Los Angeles (GMT-8)<span class="combobox-item-description">Americas</span></div>
    <div class="combobox-item" role="option" value="europe/london">London (GMT+0)<span class="combobox-item-description">Europe</span></div>
    <div class="combobox-item" role="option" value="europe/paris">Paris (GMT+1)<span class="combobox-item-description">Europe</span></div>
    <div class="combobox-item" role="option" value="europe/athens">Athens (GMT+2)<span class="combobox-item-description">Europe</span></div>
    <div class="combobox-item" role="option" value="asia/kathmandu">Kathmandu (GMT+5:45)<span class="combobox-item-description">Asia and Pacific</span></div>
    <div class="combobox-item" role="option" value="asia/tokyo">Tokyo (GMT+9)<span class="combobox-item-description">Asia and Pacific</span></div>
    <div class="combobox-item" role="option" value="australia/sydney">Sydney (GMT+10)<span class="combobox-item-description">Asia and Pacific</span></div>
    <div class="combobox-item" role="option" value="pacific/auckland">Auckland (GMT+12)<span class="combobox-item-description">Asia and Pacific</span></div>
    <p class="combobox-empty" data-combobox-empty hidden>No timezone found.</p>
  </div>
</div>
```

## Searching on the server

For a list too long to send with the page, let htmx fetch the options as the user types and swap them into the list. `data-filter="none"` turns the browser-side filter off, as the server already did it. The behaviour watches the list, so the new options are highlighted, keyboard-ready and marked if already picked — picks are remembered by value, so they survive the list changing under them, chips included.

```html
<div class="combobox w-64" data-combobox data-filter="none" data-autohighlight>
  <div class="input-group">
    <input class="input" data-combobox-input name="q" placeholder="Search countries" aria-label="Country"
           hx-get="/api/countries" hx-trigger="input changed delay:200ms" hx-target="next [role=listbox]"
           hx-indicator="#cb-country-spinner" />
    <span class="input-group-addon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></span>
    <span class="input-group-addon input-group-addon-inline-end"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="cb-country-spinner" class="spinner htmx-indicator" role="status" aria-label="Searching"><path d="M21 12a9 9 0 1 1-6.22-8.56"/></svg></span>
  </div>
  <div class="combobox-content" role="listbox" aria-label="Countries" hidden>
    <div class="combobox-item" role="option" value="argentina">Argentina</div>
    <div class="combobox-item" role="option" value="australia">Australia</div>
    <div class="combobox-item" role="option" value="austria">Austria</div>
    <div class="combobox-item" role="option" value="belgium">Belgium</div>
  </div>
  <input type="hidden" name="country" data-combobox-value />
</div>
```

The endpoint returns plain option markup (`<div class="combobox-item" role="option" value="…">`), or a `.combobox-empty` paragraph when nothing matches. This demo's endpoint is part of the dev server, so it only answers on a running site, not on a static host.

## Submitting with htmx

Every change fires a bubbling `combobox:change` with `detail.value` and `detail.label` (the first pick) and `detail.values` / `detail.labels` (all of them). Inside a form, trigger on it and htmx posts the hidden `[data-combobox-value]` fields with the rest:

```html
    <form class="w-80" onsubmit="return false" hx-post="/api/echo" hx-trigger="combobox:change" hx-target="#cb-result">
      <div class="combobox w-80" data-combobox data-multiple>
  <div class="combobox-chips" data-combobox-chips>
    <input class="combobox-chips-input" id="cb-htmx" data-combobox-input placeholder="Add frameworks" aria-label="Frameworks" />
    <button type="button" class="btn btn-ghost btn-icon" data-combobox-clear aria-label="Clear" hidden><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
  </div>
  <div class="combobox-content" role="listbox" aria-label="Frameworks" hidden>
    <div class="combobox-item" role="option" value="astro" aria-selected="false">Astro<span class="combobox-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span></div>
    <div class="combobox-item" role="option" value="next" aria-selected="false" data-keywords="react vercel">Next.js<span class="combobox-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span></div>
    <div class="combobox-item" role="option" value="nuxt" aria-selected="false" data-keywords="vue">Nuxt<span class="combobox-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span></div>
    <div class="combobox-item" role="option" value="remix" aria-selected="false" data-keywords="react">Remix<span class="combobox-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span></div>
    <div class="combobox-item" role="option" value="solid-start" aria-selected="false" data-keywords="solid">SolidStart<span class="combobox-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span></div>
    <div class="combobox-item" role="option" value="sveltekit" aria-selected="false" data-keywords="svelte">SvelteKit<span class="combobox-check"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span></div>
    <p class="combobox-empty" data-combobox-empty hidden>No results.</p>
  </div>
  <input type="hidden" name="frameworks" data-combobox-value />
</div>
    </form>
    <p id="cb-result" class="muted" aria-live="polite"></p>
```

## Alignment

The list opens below the input, as wide as the combobox. `.combobox-content-up` opens it above, and `.combobox-content-end` aligns a list wider than the input (a `w-80` utility) to the right edge.

## Nunjucks macro

The `combobox` macro writes the input group or chip box, the options, groups and separators, and the hidden field. Options are strings, `{value, label, keywords, disabled}` objects, or groups `{label, options}`.

```jinja page.html
{% from "components/combobox/combobox.html" import combobox %}

<div class="field">
  <label class="label" for="framework">Framework</label>
  {{ combobox("framework", json("data/frameworks.json"), name="framework", autohighlight=true) }}
</div>

{{ combobox("tags", ["Bug", "Feature", "Docs"], multiple=true, value=["Bug"], name="tags", label="Tags") }}
{{ combobox("tz", [{label: "Europe", options: [...]}, {label: "Asia", options: [...]}], label="Timezone") }}
```

## Reference

| Class / attribute | Description |
| --- | --- |
| `.combobox` | Positioning wrapper. Add data-combobox. |
| `.combobox-content` | The listbox. Opens below, as wide as the combobox. |
| `.combobox-content-up / -end` | Open above / align to the right edge. |
| `.combobox-item` | One option (role="option", value). data-keywords: extra words to match. |
| `.combobox-check` | Icon in an option, shown while it is picked. |
| `.combobox-item-description` | Muted text at the end of an option. |
| `.combobox-group / .combobox-label` | A group of options (role="group") and its heading. |
| `.combobox-separator` | A line between groups (role="separator"); hidden when a filter empties one side. |
| `.combobox-empty` | Shown when nothing matches. Add data-combobox-empty. |
| `.combobox-chips / .combobox-chips-input` | Multiple: the box that looks like an input, and the input inside it. |
| `.combobox-chip / .combobox-chip-remove` | A pick and its remove button, built by the behaviour. |
| `[data-combobox-input]` | The text input (becomes role="combobox"). |
| `[data-combobox-value]` | Hidden field with the value; one per value with data-multiple. |
| `[data-combobox-clear] / [data-combobox-toggle]` | Clear button (hides itself when empty) / open-close button. |
| `data-multiple / data-autohighlight` | Several picks as chips / highlight the first match as you type. |
| `data-filter="none"` | No browser-side filtering, for lists the server filters. |
| `combobox:change` | Event with detail { value, label, values, labels }. |
