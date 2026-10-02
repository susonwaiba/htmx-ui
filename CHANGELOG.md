# Changelog

All notable changes to htmx-ui are listed here. Versions follow [semantic versioning](https://semver.org);
before 1.0, minor versions may contain breaking changes, each listed with migration notes.
The docs site has a fuller page per release (`/docs/changelog`).

## 0.1.0 — 2026-10-02

First release.

### Added

- **Components:** accordion, alert, badge, button, button group, card, code block, dropdown, field, icon, input,
  input group, popover, sidebar, spinner, table, tabs, text, toggle, toggle group.
- **Forms:** text inputs, textareas, selects and file inputs with disabled, error (`aria-invalid` / `:user-invalid`),
  warning and success states; fields with labels, descriptions, messages and an automatic required asterisk; inline,
  responsive and grid layouts; input groups with addons on any side.
- **Loading states:** spinners from any icon or pure CSS, in buttons, badges, button groups and input groups. An
  `.htmx-indicator` inside a button, badge or input-group addon takes no space until its request starts.
- **Behaviours** (`initComponents(root)`): accordion, code copy, dismissible, dropdown, popover, sidebar, tabs, toggle,
  toggle group. They are idempotent and initialise inside htmx-swapped content (`htmx:after:process`).
- **Theming:** every colour and the corner radius are CSS variables (`--primary`, `--border`, `--radius`, …) exposed as
  Tailwind colours (`bg-primary`, `text-muted-foreground`, …).
- **Dark mode:** class-based `dark:` variant, token swaps, and a theme switcher (`htmx-ui/theme`) that follows the OS
  until the user picks.
- **Text:** `@tailwindcss/typography` (`.prose`) mapped onto the tokens, plus helpers for single elements and
  `.heading-anchor` for "#" section links.
- **Scrollbars:** every scrollbar is thin and tinted from the theme (`--scrollbar-thumb`, `--scrollbar-thumb-hover`), in
  light and dark.
- **Syntax-highlighting colours** (`--code-token-*`) for build-time highlighters using Shiki's CSS-variables theme.
- **Icons:** SVG icons in `htmx-ui/icons/*`.

### Notes

- The Nunjucks macros in `htmx-ui/components/*.html` rely on template helpers from the docs site's renderer and are
  not yet a public API; they may change in any release.
