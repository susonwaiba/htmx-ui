---
title: "Table"
description: "Readable data tables with a bordered, horizontally scrollable wrapper."
url: "/docs/v0.2/components/table"
section: "Components"
---

# Table

Readable data tables with a bordered, horizontally scrollable wrapper.

```html
<div class="table-wrap">
  <table class="table table-hover">
    <caption>Recent invoices</caption>
    <thead>
      <tr><th>Invoice</th><th>Status</th><th>Method</th><th class="text-right">Amount</th></tr>
    </thead>
    <tbody>
      <tr>
        <td class="font-medium">INV-001</td>
        <td><span class="badge badge-success">Paid</span></td>
        <td>Credit card</td>
        <td class="text-right tabular-nums">$250.00</td>
      </tr>
      <tr>
        <td class="font-medium">INV-002</td>
        <td><span class="badge badge-warning">Pending</span></td>
        <td>Bank transfer</td>
        <td class="text-right tabular-nums">$150.00</td>
      </tr>
      <tr>
        <td class="font-medium">INV-003</td>
        <td><span class="badge badge-danger">Overdue</span></td>
        <td>Credit card</td>
        <td class="text-right tabular-nums">$350.00</td>
      </tr>
      <tr>
        <td class="font-medium">INV-004</td>
        <td><span class="badge badge-success">Paid</span></td>
        <td>PayPal</td>
        <td class="text-right tabular-nums">$450.00</td>
      </tr>
    </tbody>
  </table>
</div>
```

## Usage

- Wrap the table in `.table-wrap` for the border, rounded corners and horizontal scrolling on narrow screens.
- Add `.table-hover` to highlight rows under the pointer.
- Align numbers with `text-right tabular-nums`.
- A `<caption>` renders below the table as muted text.

## Rows from the server

Have the server return `<tr>` fragments and append them to the `<tbody>` with `hx-swap="beforeend"`. Badges in the new rows are plain classes, so they need no initialisation.

```html
<div class="table-wrap">
  <table class="table">
    <thead><tr><th>Invoice</th><th>Status</th><th class="text-right">Amount</th></tr></thead>
    <tbody id="invoice-rows">
      <tr><td class="font-medium">INV-001</td><td><span class="badge badge-success">Paid</span></td><td class="text-right tabular-nums">$250.00</td></tr>
    </tbody>
  </table>
</div>
<button class="btn btn-outline btn-sm mt-4" hx-get="/api/invoices" hx-target="#invoice-rows" hx-swap="beforeend">Load more</button>
```

## Reference

| Class | Description |
| --- | --- |
| `.table-wrap` | Bordered, rounded, horizontally scrollable wrapper. |
| `.table` | Base table styles: header row, cell padding, row dividers. |
| `.table-hover` | Highlights the row under the pointer. |
