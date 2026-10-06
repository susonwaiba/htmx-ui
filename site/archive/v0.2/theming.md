---
title: "Theming"
description: "Every colour and corner in HTMX UI comes from a CSS variable. Override the variables to restyle the whole library; scope them to restyle part of a page."
url: "/docs/v0.2/theming"
section: "Customization"
---

# Theming

Every colour and corner in HTMX UI comes from a CSS variable. Override the variables to restyle the whole library; scope them to restyle part of a page.

## How it works

Theming happens in two layers, both in `htmx-ui/styles.css`:

1. **Variables.** Plain custom properties on `:root` hold the actual values, with a second set under `:root.dark`.
2. **Tailwind colours.** A `@theme inline` block maps each variable to a Tailwind colour, so `--primary` becomes `bg-primary`, `text-primary`, `border-primary/30` and so on.

```css htmx-ui/styles.css (excerpt)
:root {
  --radius: 0.5rem;
  --primary: var(--color-indigo-600);
  --primary-foreground: var(--color-white);
  /* … */
}

:root.dark {
  --primary: var(--color-indigo-500);
  /* … */
}

@theme inline {
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  /* … */
}
```

Because the mapping is `inline`, the generated utilities read the variable at runtime: `.bg-primary` compiles to `background-color: var(--primary)`. Change the variable anywhere (globally, under `.dark`, or on one element) and everything using it updates. No rebuild needed.

## Tokens

Components only use these tokens. Swatches show the current theme; toggle dark mode in the header to compare.

| Variable | Utility | Used for | Light | Dark |
| --- | --- | --- | --- | --- |
| `--background` | `bg-background` | Page background | white | zinc-950 |
| `--foreground` | `text-foreground` | Default text | zinc-950 | zinc-50 |
| `--surface` | `bg-surface` | Cards, alerts, raised panels | white | zinc-900 |
| `--muted` | `bg-muted` | Subtle fills: code, table heads | zinc-100 | zinc-800 |
| `--muted-foreground` | `text-muted-foreground` | Secondary text | zinc-500 | zinc-400 |
| `--accent` | `bg-accent` | Hover and selected backgrounds | zinc-100 | zinc-800 |
| `--accent-foreground` | `text-accent-foreground` | Text on accent | zinc-900 | zinc-50 |
| `--border` | `border-border` | Borders and dividers (the default border colour) | zinc-200 | zinc-800 |
| `--ring` | `outline-ring` | Focus rings | indigo-500 | indigo-400 |
| `--primary` | `bg-primary` | Brand colour: primary buttons, links | indigo-600 | indigo-500 |
| `--primary-foreground` | `text-primary-foreground` | Text on primary | white | white |
| `--secondary` | `bg-secondary` | Secondary buttons and badges | zinc-100 | zinc-800 |
| `--secondary-foreground` | `text-secondary-foreground` | Text on secondary | zinc-900 | zinc-50 |
| `--info` | `text-info` | Info alerts and badges | sky-600 | sky-400 |
| `--success` | `text-success` | Success alerts and badges | emerald-600 | emerald-400 |
| `--warning` | `text-warning` | Warning alerts and badges | amber-600 | amber-400 |
| `--danger` | `bg-danger` | Destructive buttons, error alerts | red-600 | red-500 |
| `--danger-foreground` | `text-danger-foreground` | Text on danger | white | white |
| `--sidebar` | `bg-sidebar` | Sidebar background | zinc-50 | zinc-900 |
| `--sidebar-foreground` | `text-sidebar-foreground` | Sidebar text and icons | --foreground | --foreground |
| `--sidebar-primary` | `bg-sidebar-primary` | Accent fills in the sidebar, such as a logo tile | --primary | --primary |
| `--sidebar-primary-foreground` | `text-sidebar-primary-foreground` | Text on sidebar primary | --primary-foreground | --primary-foreground |
| `--sidebar-accent` | `bg-sidebar-accent` | Hovered and current sidebar items | --accent | --accent |
| `--sidebar-accent-foreground` | `text-sidebar-accent-foreground` | Text on sidebar accent | --accent-foreground | --accent-foreground |
| `--sidebar-border` | `border-sidebar-border` | Sidebar borders, separators and the rail | --border | --border |
| `--sidebar-ring` | `ring-sidebar-ring` | Focus rings in the sidebar | --ring | --ring |
| `--scrollbar-thumb` | `(scrollbars)` | Scrollbar thumb; every scrollbar is thin with a transparent track | foreground at 16% | foreground at 16% |
| `--scrollbar-thumb-hover` | `(scrollbars)` | Scrollbar thumb while hovering the scroll area | foreground at 32% | foreground at 32% |
| `--radius` | `rounded-(--radius)` | Corner radius for buttons, inputs, alerts; cards add 4px | 0.5rem | 0.5rem |

Values are Tailwind palette colours, for example `var(--color-indigo-600)`. Any CSS colour works: hex, `rgb()`, `oklch()`.

The `--sidebar-*` tokens colour the [Sidebar](/docs/v0.2/components/sidebar), so it can be tinted apart from the page. Apart from `--sidebar`, they follow the token named in the table unless you set them ([Sidebar theming](/docs/v0.2/components/sidebar#theming)).

## Overriding tokens

Redefine variables after importing the library. Set both the light and dark values for anything that should differ between them.

```css src/styles.css
@import "tailwindcss";
@import "htmx-ui/styles.css";

:root {
  --primary: oklch(0.6 0.2 30);          /* coral */
  --primary-foreground: white;
  --radius: 0.75rem;
}

:root.dark {
  --primary: oklch(0.7 0.17 30);
}
```

> **Selector specificity** The library declares its tokens on `:root` and `:root.dark` inside `@layer base`. Unlayered CSS beats layered CSS, so overrides written outside any layer (as above) always win, whatever the import order.

## Custom themes

A theme is just a selector that redefines tokens. Scope one to an attribute and you can apply it to a whole page or a single section. These previews use the same markup, with a different `data-theme` on each wrapper:

```css src/styles.css
[data-theme="rose"] {
  --primary: var(--color-rose-600);
  --ring: var(--color-rose-500);
  --radius: 1rem;
}
.dark [data-theme="rose"] {
  --primary: var(--color-rose-500);
}
```

```html
<!-- Whole page <!-- Whole page -->
<html data-theme="rose">

<!-- Or one section <!-- Or one section -->
<section data-theme="rose">…</section>
```

## Scrollbars

The library styles every scrollbar to match: thin, with a transparent track and a thumb tinted from `--foreground`, so it blends into any theme and follows dark mode. Browsers without `scrollbar-color` (Safari) get the same look through `::-webkit-scrollbar`.

```css src/styles.css
:root {
  --scrollbar-thumb: color-mix(in oklab, var(--primary) 30%, transparent);
}

/* Native scrollbars for one element */
.native-scrollbars { scrollbar-color: auto; scrollbar-width: auto; }
```

## Motion

Components animate with a small set of duration and easing tokens, so the whole library moves the same way and one override retimes it. With `prefers-reduced-motion: reduce` every duration is `0s`: panels still open and close, without moving.

| Token | Default | Used for |
| --- | --- | --- |
| `--motion-duration-fast` | 100ms | Small state changes, panels and tooltips leaving |
| `--motion-duration-normal` | 150ms | Popovers, menus, lists, tooltips, hover cards |
| `--motion-duration-moderate` | 200ms | Dialogs opening |
| `--motion-duration-slow` | 300ms | Sheets |
| `--motion-duration-slower` | 400ms | Drawers |
| `--motion-ease-out` | quick start, soft landing | Things appearing, responding and leaving |
| `--motion-ease-in-out` | symmetric | Things moving across the screen |
| `--motion-ease-drawer` | long glide | Panels sliding from an edge |
| `--motion-ease-spring` | about 8% overshoot | Playful moves; give it 200ms or more |

```css src/styles.css
/* A calmer library: everything a little slower */
:root {
  --motion-duration-normal: 200ms;
  --motion-duration-moderate: 260ms;
}
```

Use them in your own markup with Tailwind's variable shorthand:

```html
<div class="transition-opacity duration-(--motion-duration-normal) ease-(--motion-ease-out)">…</div>
```

## Adding your own tokens

Follow the same two steps to add a colour that Tailwind utilities can use:

```css src/styles.css
:root      { --brand-gradient-from: var(--color-fuchsia-500); }
:root.dark { --brand-gradient-from: var(--color-fuchsia-400); }

@theme inline {
  --color-brand-from: var(--brand-gradient-from);
}
```

Now `from-brand-from`, `text-brand-from` and the rest are available, and they follow dark mode.

## Customising components

Component classes live in `@layer components`, which sits below utilities. You can restyle them two ways:

- **One element:** add utilities. `<button class="btn btn-primary rounded-full px-8">` gets a pill shape because utilities win.
- **Everywhere:** extend the class in your own `@layer components` block.

```css src/styles.css
@layer components {
  .btn {
    @apply font-semibold tracking-tight;
  }
  .card {
    @apply shadow-md;
  }
}
```

## Using tokens in your own markup

Use the token utilities instead of raw palette colours, and your own UI themes and switches modes with the library:

```html
<aside class="rounded-(--radius) border border-border bg-surface p-4 text-muted-foreground">
  Follows the theme and dark mode automatically.
</aside>
```
