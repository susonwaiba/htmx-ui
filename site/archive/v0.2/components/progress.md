---
title: "Progress"
description: "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar."
url: "/docs/v0.2/components/progress"
section: "Components"
---

# Progress

Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.

```html
<progress class="progress w-3/5" value="33" max="100" aria-label="Upload progress">33%</progress>
```

## Markup

- A native `<progress class="progress">` with `value` and `max` (1 if left out). The browser exposes it as a progress bar with its percentage; no ARIA attributes are needed.
- Give it an accessible name: a `<label for>` (see [Label and value](#label-and-value)), or `aria-label`.
- The text inside is a fallback for browsers that don't draw progress bars.
- It fills its container's width; set another with a width utility (`w-3/5` above).

## Label and value

`.progress-field` lays out a `.progress-label` and a `.progress-value` above the bar, and a `.progress-description` below it. Each part is optional. The value repeats what the bar already announces, so it is `aria-hidden`; the description is linked with `aria-describedby`.

```html
<div class="progress-field">
  <label class="progress-label" for="upload-files">Uploading files</label>
  <span class="progress-value" aria-hidden="true">66%</span>
  <progress class="progress" id="upload-files" value="66" max="100" aria-describedby="upload-files-help">66%</progress>
  <p class="progress-description" id="upload-files-help">6 of 9 files, about a minute left.</p>
</div>
<div class="progress-field">
  <label class="progress-label" for="storage-used">Storage</label>
  <span class="progress-value" aria-hidden="true">7.2 of 10 GB</span>
  <progress class="progress" id="storage-used" value="7.2" max="10">72%</progress>
</div>
```

## Indeterminate

Leave out `value` when the amount of work isn't known yet: a bar slides along the track. With reduced motion, the track is striped instead, still and full width, so it can't be read as a value.

```html
<progress class="progress" aria-label="Loading"></progress>
<div class="progress-field">
  <label class="progress-label" for="preparing-export">Preparing export…</label>
  <progress class="progress" id="preparing-export"></progress>
</div>
```

## Sizes

`.progress-sm` is 4px high, the default 8px and `.progress-lg` 12px.

```html
<progress class="progress progress-sm" value="40" max="100" aria-label="Small">40%</progress>
<progress class="progress" value="60" max="100" aria-label="Default">60%</progress>
<progress class="progress progress-lg" value="80" max="100" aria-label="Large">80%</progress>
```

## Colours

`.progress-success`, `.progress-warning` and `.progress-danger` use the status colours; the track is the same colour, faded. For any other colour, set `--progress-tone`. Colour alone doesn't say what is wrong, so put that in the label or description too.

```html
<div class="progress-field">
  <label class="progress-label" for="tests-passed">Tests passed</label>
  <span class="progress-value" aria-hidden="true">100%</span>
  <progress class="progress progress-success" id="tests-passed" value="100" max="100">100%</progress>
</div>
<div class="progress-field">
  <label class="progress-label" for="quota-used">Monthly quota</label>
  <span class="progress-value" aria-hidden="true">85%</span>
  <progress class="progress progress-warning" id="quota-used" value="85" max="100" aria-describedby="quota-used-help">85%</progress>
  <p class="progress-description" id="quota-used-help">Nearly used up. It resets on the 1st.</p>
</div>
<div class="progress-field">
  <label class="progress-label" for="disk-full">Disk</label>
  <span class="progress-value" aria-hidden="true">97%</span>
  <progress class="progress progress-danger" id="disk-full" value="97" max="100" aria-describedby="disk-full-help">97%</progress>
  <p class="progress-description" id="disk-full-help">Almost full: delete old backups to free space.</p>
</div>
<progress class="progress [--progress-tone:var(--color-violet-600)]" value="50" max="100" aria-label="Custom colour">50%</progress>
```

## Macro

`progress()` writes the bar, and the field around it when there is a label, value or description, with the ids wired up and the percentage worked out (rounded, and kept within 0–100%).

```jinja
{% from "components/progress/progress.html" import progress %}

{{ progress(3, max=9, label="Uploading files", show_value=true, description="3 of 9 files") }}
{{ progress(aria_label="Loading") }}
```

renders:

```html
    <div class="progress-field">
  <label class="progress-label" for="progress-uploading-files">Uploading files</label>
  <span class="progress-value" aria-hidden="true">33%</span>
  <progress class="progress" id="progress-uploading-files" value="3" max="9" aria-describedby="progress-uploading-files-description">33%</progress>
  <p class="progress-description" id="progress-uploading-files-description">3 of 9 files</p>
</div>
    <progress class="progress" max="100" aria-label="Loading"></progress>
```

| Parameter | Description |
| --- | --- |
| `value` | The current value. Left out (or none): indeterminate. |
| `max=100` | The value at completion. |
| `label` | A visible <label>. Without one, pass aria_label. |
| `aria_label` | The accessible name when there is no visible label. |
| `show_value=false` | true shows the percentage beside the label (aria-hidden). |
| `description` | Help text under the bar, linked with aria-describedby. |
| `id` | The <progress> id. Defaults to one made from the label (progress-uploading-files); pass it when two bars on a page share a label. |
| `size` | "sm" or "lg". |
| `variant` | "success", "warning" or "danger". |
| `attrs` | More attributes for the outer element, as a dict, e.g. {"hx-get": "/jobs/42/progress"}. |
| `class` | More classes on the outer element: the .progress-field, or the <progress> when there is no field. |

## With htmx

For a job running on the server, let the progress fragment fetch its own replacement. Each response is the field at its new value, polling again after a short delay; the last one leaves the polling attributes out, which stops it. Start it with a button whose `hx-post` starts the job and returns the first fragment.

```html
<button class="btn btn-primary" hx-post="/exports" hx-target="#export" hx-swap="innerHTML">Export</button>
<div id="export"></div>

<!-- each response from /exports/42/progress while the job runs <!-- each response from /exports/42/progress while the job runs -->
<div class="progress-field" hx-get="/exports/42/progress" hx-trigger="load delay:1s" hx-swap="outerHTML">
  <label class="progress-label" for="export-progress">Exporting invoices</label>
  <span class="progress-value" aria-hidden="true">40%</span>
  <progress class="progress" id="export-progress" value="40" max="100">40%</progress>
</div>

<!-- the last one: no hx-trigger, so polling stops <!-- the last one: no hx-trigger, so polling stops -->
<div class="progress-field">
  <label class="progress-label" for="export-progress">Exporting invoices</label>
  <span class="progress-value" aria-hidden="true">100%</span>
  <progress class="progress progress-success" id="export-progress" value="100" max="100">100%</progress>
  <p class="progress-description" role="status">Done. <a href="/exports/42.csv">Download the CSV</a></p>
</div>
```

The bar's width animates from the old value to the new one only when the same element is updated. Swapping in a new `<progress>` jumps to the new width, which is fine for polling. The [Attachment](/docs/v0.2/components/attachment) component uses the same polling pattern for uploads.

## Accessibility

- `<progress>` has the `progressbar` role and reports its value as a percentage, or as busy when indeterminate.
- Screen readers don't announce every change of value. Announce the end of a task (or a failure) in a `role="status"` element, as in the htmx example.
- When the value is more meaningful as text ("Step 2 of 5"), set `aria-valuetext="Step 2 of 5"` on the `<progress>`.
- An indeterminate bar standing in for content that is loading needs a name saying what is loading ("Loading invoices"), not just "Loading".

## Reference

| Class | Description |
| --- | --- |
| `.progress` | On a <progress>: a rounded track; the bar is the value. No value: indeterminate. |
| `.progress-sm / .progress-lg` | 4px / 12px high (8px by default). |
| `.progress-success / -warning / -danger` | Status colours for the bar and track. |
| `--progress-tone` | The bar colour (the track is it at 20%). Defaults to --primary. |
| `.progress-field` | Grid laying out a label and value above the bar and a description below. |
| `.progress-label` | The <label for> naming the bar, on the left. |
| `.progress-value` | The value as text, on the right; aria-hidden when it repeats the percentage. |
| `.progress-description` | Help text under the bar, linked with aria-describedby. |
