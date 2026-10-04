---
title: "Dark mode"
description: "Light and dark are two sets of token values, switched by a .dark class on <html>. The theme switcher follows the OS until the user picks, and never flashes the wrong theme."
url: "/docs/v0.1/dark-mode"
section: "Customization"
---

# Dark mode

Light and dark are two sets of token values, switched by a .dark class on <html>. The theme switcher follows the OS until the user picks, and never flashes the wrong theme.

## How it works

1. **A class, not a media query.** Tailwind v4's `dark:` variant normally follows `prefers-color-scheme`, which a button can't change. The library redefines it to match a `.dark` class instead.
2. **Tokens swap.** `:root.dark` redefines every colour variable, so components don't need `dark:` classes at all.
3. **Native widgets follow.** `color-scheme` switches too, so scrollbars and form controls match.

```css htmx-ui/styles.css (excerpt)
@custom-variant dark (&:where(.dark, .dark *));

@layer base {
  :root      { color-scheme: light; --background: var(--color-white); /* … */ }
  :root.dark { color-scheme: dark;  --background: var(--color-zinc-950); /* … */ }
}
```

## Theme switcher

Any element with `data-theme-toggle` becomes a toggle. Try this one; it's the same toggle as the one in the header.

```html
<button type="button" class="btn btn-outline" data-theme-toggle aria-pressed="false">
  <span class="dark:hidden"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg></span>
  <span class="hidden dark:inline"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg></span>
  Theme: <span data-theme-label>light</span>
</button>
```

When clicked, `initTheme()` from `htmx-ui/theme`:

- flips the `.dark` class on `<html>`,
- saves the choice to `localStorage` under the key `theme`,
- sets `aria-pressed="true"` on every toggle while dark is active, and
- writes the current theme (`light` or `dark`) into any `[data-theme-label]` inside a toggle.

```ts src/app.ts
import { initTheme } from "htmx-ui/theme";

document.addEventListener("DOMContentLoaded", () => initTheme());
```

### Following the OS

Until the user clicks a toggle, the theme follows `prefers-color-scheme` and updates live when the OS changes. After a click, the stored choice wins. To go back to following the OS, clear it:

```ts
localStorage.removeItem("theme");
```

## Avoiding a flash of the wrong theme

Module scripts run after the first paint, so on a dark-mode visit the page would briefly render light. Put this tiny inline script in `<head>`, before your stylesheet and app script, so the class is set before anything is drawn:

```html <head>
<script>
  (() => {
    const stored = localStorage.getItem("theme");
    const dark = stored ? stored === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", dark);
  })();
</script>
```

> **Keep it in sync** This script repeats the logic in `initTheme()`. If you change the storage key or the class name, change both.

## Writing dark styles

Prefer tokens: `bg-surface` and `text-muted-foreground` already adapt. For one-off tweaks, use the `dark:` variant as usual:

```html
<div class="rounded-(--radius) bg-amber-100 px-4 py-3 text-sm text-amber-900 dark:bg-amber-400/10 dark:text-amber-300">
  Amber in light, a soft glow in dark.
</div>
```

## Forcing a theme

To keep part of the page dark (a code sample, a hero) whatever the global theme, add the `dark` class to that element. Everything inside picks up the dark variant. Note that `:root.dark` tokens only apply at the root, so set the tokens you need on the element too:

```css
.force-dark {
  --background: var(--color-zinc-950);
  --foreground: var(--color-zinc-50);
  --border: var(--color-zinc-800);
  color-scheme: dark;
}
```

```html
<section class="dark force-dark bg-background text-foreground">…</section>
```

## Building your own switcher

`getTheme()` returns the active theme. A light/dark/system menu, for example, only needs to set or remove the stored value and toggle the class:

```ts
import { getTheme } from "htmx-ui/theme";

function setTheme(choice: "light" | "dark" | "system") {
  if (choice === "system") localStorage.removeItem("theme");
  else localStorage.setItem("theme", choice);
  const dark = choice === "system"
    ? matchMedia("(prefers-color-scheme: dark)").matches
    : choice === "dark";
  document.documentElement.classList.toggle("dark", dark);
}

console.log(getTheme()); // "light" | "dark"
```
