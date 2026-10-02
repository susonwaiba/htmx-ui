# Changelog

All notable changes to htmx-ui, htmx-ui-engine and create-htmx-ui are listed here. The three packages are
released together with one version. Versions follow [semantic versioning](https://semver.org); before 1.0, minor
versions may contain breaking changes, each listed with migration notes.
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
- **Macros:** Nunjucks macros for alerts, code blocks, command tabs, icons and spinners in
  `htmx-ui/components/*.html`, resolved by name in htmx-ui-engine sites.
- **htmx-ui-engine:** `htmx-ui dev`, `build` and `preview` for sites made of Nunjucks pages: file-based routing,
  Tailwind, hot reload (including layouts, partials and data), mock htmx endpoints (`routes` in
  `htmx-ui.config.ts`), and static builds. Runs on Bun (Bun.serve, Bun.build, `bun-plugin-tailwind`) or Node (Vite,
  `@tailwindcss/vite`), chosen from whatever started it, or with `--bun` / `--node`. Also usable as a Bun plugin
  (`htmx-ui-engine/bun`) or a Vite plugin (`htmx-ui-engine/vite`).
- **create-htmx-ui:** `npm create htmx-ui`, `pnpm create htmx-ui`, `yarn create htmx-ui`, `bun create htmx-ui`.

### Notes

- Macro parameters may still change in a minor release before 1.0; each change will be listed here.
