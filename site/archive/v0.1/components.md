---
title: "Components"
description: "Every component is a set of CSS classes, plus a small behaviour where one is needed. Pick one to see live examples and the full class reference."
url: "/docs/v0.1/components"
section: "Components"
---

# Components

Every component is a set of CSS classes, plus a small behaviour where one is needed. Pick one to see live examples and the full class reference.

- [Accordion](/docs/v0.1/components/accordion): Stacked headings that reveal sections; one or many open, no JavaScript.
- [Alert](/docs/v0.1/components/alert): Callouts for info, success, warnings and errors.
- [Badge](/docs/v0.1/components/badge): Small status labels and counters.
- [Button](/docs/v0.1/components/button): Actions in every variant, size and state, including loading.
- [Button group](/docs/v0.1/components/button-group): Join buttons, inputs and menus: split buttons, toolbars, vertical groups.
- [Card](/docs/v0.1/components/card): Header, content and footer, with media, an action slot and scrolling content.
- [Code block](/docs/v0.1/components/code-block): Highlighted source with a copy button and package-manager tabs.
- [Dropdown](/docs/v0.1/components/dropdown): A menu of links or actions that opens from a button.
- [Field](/docs/v0.1/components/field): Labels, help text and messages for controls; inline, responsive and grid forms.
- [Icon](/docs/v0.1/components/icon): SVG icons inlined at build time, or linked as images.
- [Input](/docs/v0.1/components/input): Text inputs, textareas, selects and file pickers with every state.
- [Input group](/docs/v0.1/components/input-group): Icons, text, buttons, menus and spinners inside an input's border.
- [Popover](/docs/v0.1/components/popover): A floating panel of rich content that opens from a button.
- [Sidebar](/docs/v0.1/components/sidebar): Responsive navigation column with off-canvas mode.
- [Spinner](/docs/v0.1/components/spinner): Loading indicator from any icon or pure CSS; works in buttons, badges and inputs.
- [Table](/docs/v0.1/components/table): Readable data tables with optional hover rows.
- [Tabs](/docs/v0.1/components/tabs): Switch between panels; optionally synced and remembered.
- [Text](/docs/v0.1/components/text): Long-form content with .prose (Tailwind Typography), plus helpers for single elements.
- [Toggle](/docs/v0.1/components/toggle): A two-state button, on or off, in any button style.
- [Toggle group](/docs/v0.1/components/toggle-group): A set of toggle buttons: pick one, at most one, or many.

## Anatomy of a component

Each component has its own directory, `htmx-ui/components/<name>/` (`packages/ui/src/components/<name>/` in the repository), holding:

- `<name>.css`: classes in `@layer components`, built from token utilities with `@apply`.
- `<name>.ts` (optional): an `init<Name>(root)` function that wires up `[data-<name>]` elements once each, with `<name>.test.ts` beside it.
- `<name>.html` (optional): a Nunjucks macro for markup that is tedious to write by hand.
