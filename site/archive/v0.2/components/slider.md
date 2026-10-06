---
title: "Slider"
description: "Pick a value, a range or several values on a track: native range inputs, horizontal or vertical, with every form state."
url: "/docs/v0.2/components/slider"
section: "Components"
---

# Slider

Pick a value, a range or several values on a track: native range inputs, horizontal or vertical, with every form state.

```html
<div class="slider w-3/5" data-slider style="--slider-start: 0%; --slider-end: 50%">
  <div class="slider-track"><div class="slider-range"></div></div>
  <input type="range" name="volume" min="0" max="100" value="50" aria-label="Volume" />
</div>
```

## Markup

- Each thumb is a native `<input type="range">` inside `.slider`, after a `.slider-track` holding the `.slider-range` fill. The inputs submit with the form and take the keyboard (`←` `→`, `Page Up` `Page Down`, `Home` `End`) with no JavaScript.
- Give every input an accessible name: `aria-label`, or a `<label for>`.
- `data-slider` adds the behaviour: it paints the range as the values change, keeps thumbs from crossing, moves the nearest thumb to a press on the track, and fills `<output for>`. The inline `--slider-start` / `--slider-end` paint the range before it runs; the [`slider()` macro](#macro) writes them for you.

## Range

Two inputs make a range: the fill spans from one thumb to the other. Give them the same `name` and the form sends both values (`price=20&price=80`), or a name each.

```html
<div class="slider w-3/5" data-slider style="--slider-start: 20%; --slider-end: 80%">
  <div class="slider-track"><div class="slider-range"></div></div>
  <input type="range" name="price" min="0" max="100" value="20" aria-label="Minimum price" />
  <input type="range" name="price" min="0" max="100" value="80" aria-label="Maximum price" />
</div>
```

## Multiple thumbs

Any number of inputs, in ascending order. A thumb stops at its neighbours; `data-slider-gap` keeps them at least that far apart, in value units.

```html
<div class="slider w-3/5" data-slider data-slider-gap="10" style="--slider-start: 10%; --slider-end: 80%">
  <div class="slider-track"><div class="slider-range"></div></div>
  <input type="range" min="0" max="100" step="5" value="10" aria-label="Low" />
  <input type="range" min="0" max="100" step="5" value="45" aria-label="Middle" />
  <input type="range" min="0" max="100" step="5" value="80" aria-label="High" />
</div>
```

## Orientation

`data-orientation="vertical"` stands the slider up, the minimum at the bottom. Give it (or its parent) a height; `↑` `↓` move it.

```html
<div class="slider h-44" data-slider data-orientation="vertical" style="--slider-start: 0%; --slider-end: 60%">
  <div class="slider-track"><div class="slider-range"></div></div>
  <input type="range" min="0" max="100" value="60" aria-label="Bass" aria-orientation="vertical" />
</div>
<div class="slider h-44" data-slider data-orientation="vertical" style="--slider-start: 25%; --slider-end: 75%">
  <div class="slider-track"><div class="slider-range"></div></div>
  <input type="range" min="0" max="100" value="25" aria-label="Lowest" aria-orientation="vertical" />
  <input type="range" min="0" max="100" value="75" aria-label="Highest" aria-orientation="vertical" />
</div>
```

## In a field, with its value

`.slider-field` puts a label and a `.slider-value` above the slider and a description below it. An `<output for="…">` naming the inputs' ids shows their values, joined with an en dash, and screen readers announce it as the result of those inputs.

```html
<div class="slider-field max-w-sm">
  <label class="field-label" for="budget-min">Budget</label>
  <span class="slider-value">$<output for="budget-min budget-max">200 – 800</output></span>
  <div class="slider" data-slider style="--slider-start: 20%; --slider-end: 80%">
    <div class="slider-track"><div class="slider-range"></div></div>
    <input type="range" id="budget-min" name="budget_min" min="0" max="1000" step="10" value="200" aria-label="Minimum budget" aria-describedby="budget-help" />
    <input type="range" id="budget-max" name="budget_max" min="0" max="1000" step="10" value="800" aria-label="Maximum budget" aria-describedby="budget-help" />
  </div>
  <p class="field-description" id="budget-help">Per month, before tax.</p>
</div>
```

## States

Disable the inputs (or a `<fieldset disabled>` around them) to fade the slider. `aria-invalid="true"` on an input turns it red, as on [inputs](/docs/v0.2/components/input); `.slider-warning` and `.slider-success` tint it too.

```html
<div class="slider" data-slider style="--slider-start: 0%; --slider-end: 40%">
  <div class="slider-track"><div class="slider-range"></div></div>
  <input type="range" min="0" max="100" value="40" aria-label="Disabled" disabled />
</div>
<div class="slider" data-slider style="--slider-start: 0%; --slider-end: 90%">
  <div class="slider-track"><div class="slider-range"></div></div>
  <input type="range" min="0" max="100" value="90" aria-label="Invalid" aria-invalid="true" />
</div>
<div class="slider slider-warning" data-slider style="--slider-start: 0%; --slider-end: 70%">
  <div class="slider-track"><div class="slider-range"></div></div>
  <input type="range" min="0" max="100" value="70" aria-label="Warning" />
</div>
<div class="slider slider-success" data-slider style="--slider-start: 0%; --slider-end: 30%">
  <div class="slider-track"><div class="slider-range"></div></div>
  <input type="range" min="0" max="100" value="30" aria-label="Success" />
</div>
```

## Sizes

```html
<div class="slider slider-sm" data-slider style="--slider-start: 0%; --slider-end: 40%">
  <div class="slider-track"><div class="slider-range"></div></div>
  <input type="range" min="0" max="100" value="40" aria-label="Small" />
</div>
<div class="slider" data-slider style="--slider-start: 0%; --slider-end: 55%">
  <div class="slider-track"><div class="slider-range"></div></div>
  <input type="range" min="0" max="100" value="55" aria-label="Default" />
</div>
<div class="slider slider-lg" data-slider style="--slider-start: 0%; --slider-end: 70%">
  <div class="slider-track"><div class="slider-range"></div></div>
  <input type="range" min="0" max="100" value="70" aria-label="Large" />
</div>
```

## With htmx

The inputs are ordinary form controls, so `hx-trigger="change"` sends the value once a drag ends (the behaviour fires `change` after a press on the track too), or `input changed delay:300ms` while it moves.

```html
<form hx-post="/api/echo" hx-trigger="change" hx-target="#slider-result">
  <div class="slider" data-slider style="--slider-start: 30%; --slider-end: 70%">
    <div class="slider-track"><div class="slider-range"></div></div>
    <input type="range" name="from" min="0" max="100" value="30" aria-label="From" />
    <input type="range" name="to" min="0" max="100" value="70" aria-label="To" />
  </div>
</form>
<p class="text-sm text-muted-foreground" id="slider-result">Move a thumb.</p>
```

## Macro

`slider()` writes the inputs, their names and labels, and the starting fill. Pass a number for one thumb or a list for several.

```jinja
{% from "components/slider/slider.html" import slider %}

{{ slider(50, aria_label="Volume", name="volume") }}
{{ slider([20, 80], name="price", min=0, max=500, step=10) }}
{{ slider([10, 40, 70], labels=["Low", "Mid", "High"], gap=10) }}
{{ slider(60, orientation="vertical", aria_label="Bass", class="h-44") }}
{{ slider(30, id="volume", disabled=true, variant="warning", size="sm") }}
```

## Reference

| Class | Description |
| --- | --- |
| `.slider` | The slider: a track and its thumbs (range inputs) laid over each other. |
| `.slider-track / .slider-range` | The track, and the filled part between --slider-start and --slider-end. |
| `.slider-field / .slider-value` | Label and value above the slider, description below. |
| `.slider-warning / .slider-success` | Tints the range and thumbs. |
| `.slider-sm / .slider-lg` | Thumb and track sizes. |
| `--slider-color, --slider-thumb, --slider-track` | The colour, thumb size and track thickness, to override. |
| `[data-slider]` | Behaviour: paints the range, orders thumbs, track presses, outputs. |
| `[data-orientation="vertical"]` | Vertical slider, minimum at the bottom. |
| `[data-slider-gap]` | The least distance between neighbouring thumbs, in value units. |
