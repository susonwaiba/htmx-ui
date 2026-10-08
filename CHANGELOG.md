# Changelog

All notable changes to htmx-ui, htmx-ui-engine, the official plugins (htmx-ui-plugin-docs, -versions, -search) and
create-htmx-ui are listed here. The packages are released together with one version. Versions follow [semantic versioning](https://semver.org); before 1.0, minor
versions may contain breaking changes, each listed with migration notes.
The docs site has a fuller page per release (`/docs/changelog`).

## 0.3.0 — Unreleased

### Breaking

- **Code block copy buttons are clipboard buttons; `initCode()` is gone.** The `code()`, `code_block()`, `code_tabs()`
  and `cli()` macros render the new button for you. Hand-written blocks: replace
  `<button class="btn btn-ghost btn-xs code-copy" data-copy>…</button>` with an icon-only clipboard button,
  `<button type="button" class="btn btn-ghost btn-xs btn-icon clipboard code-copy" data-clipboard
  data-clipboard-target="pre:not([hidden]) code" aria-label="Copy code">` holding `.clipboard-idle` / `.clipboard-done`
  icons (see the code block page). `.code-copy-idle`, `.code-copied` and `data-copy-label` are gone. `initComponents()`
  runs it; drop any direct `initCode()` call.

### Added

- **Password input:** a show / hide toggle on an input group: eye icon or Show / Hide text, or a checkbox for several
  fields; keeps the caret, hides the password again on submit so password managers save it, hides Edge's own reveal
  button, an optional Caps Lock warning, and a `password_input()` macro.
- **Input OTP** is documented for visible 4-digit authenticator codes and PINs next to 6-digit codes.
- **Clipboard and timeline:** clipboard (copy buttons on any button variant and size, with an icon, a label or both,
  that swap to a green tick for two seconds without changing width; copy tags; copies text, an input's value or an
  element's text; the Clipboard API with an `execCommand` fallback for plain http, older Safari and iframes; announced
  to screen readers; `clipboard:copy` / `clipboard:error` events; `clipboard()` and `clipboard_tag()` macros) and
  timeline (CSS only: dot, icon, number or avatar markers in five colours and outline, a current step, opposite content,
  alternating sides, vertical or horizontal, dashed or dotted lines, three sizes). A clipboard copies a fixed text, the
  nearest element matching `data-clipboard-target` (its value or text), or a URL's text (`data-clipboard-url`).
- **Every copy button is now a clipboard button** that shows a green tick for two seconds: icon only on code blocks
  and the docs demos, icon and text on the docs plugin's "Copy Markdown" button ("Copied" after copying; it fetches
  the page's `.md` through `data-clipboard-url`, so it needs no plugin client). Code block copying now works over plain http
  too.

### Changed

- **The `select()` macro covers what the component does**, so the docs use it wherever they had a native `<select>`
  (field, button group, pagination, prompt input). New options: `id` on the trigger (for `<label for>`), `labelledby`,
  `describedby`, `size`, `align`, `side`, `invalid`, `required`, `class`, option groups `{label, options}`, and per-option
  `disabled`, `icon` and `keywords`. `attrs` also takes a dict. The preselected `value` is written into the trigger and
  the hidden field, so it shows and submits before JavaScript runs. The select's search now filters like the combobox's
  (accents, every word, `data-keywords`, empty groups hidden), from a shared `utils/listbox.ts`, and typing a letter in a
  list without a search box jumps to the next option starting with it. Button groups and `.prompt-input-select` accept
  the select component as well as a native select.
- **Components reuse each other instead of copying.**
  - **Shared CSS:** shared looks are Tailwind utilities in the new `utilities.css`. These are `menu-item`, `menu-label`, `menu-separator`, `menu-empty`, `popup-surface`, `focus-outline`, `input-bare`, `label-text`, `description-text`, `choice-card`, `panel-title`, `chevron-mask`, `summary-trigger` and `details-animate`. Select, combobox, command, dropdown, prompt input, popover, hover card, navigation menu, label/field, the radio card, accordion, reasoning and chain of thought are built on them.
  - **Button markup:** close buttons (dialog, sheet, alert), the code block's copy button, the sidebar trigger and the message scroller's jump button are `.btn` buttons. `.dialog-close`, `.sheet-close`, `.alert-close`, `.code-copy`, `.sidebar-trigger` and `.message-scroller-jump` now only position them. Add `btn btn-ghost btn-icon btn-sm` (copy: `btn btn-ghost btn-xs`; jump: `btn btn-outline btn-sm btn-rounded`) to hand-written markup. This also gives the alert's close and the copy button a focus ring.
  - **Select trigger:** `.select-trigger` shares the `.input` rules, including `.input-warning` / `.input-success`.
  - **Code tabs:** code block tabs are `.tabs-list.tabs-line.code-tabs` with `.tabs-trigger` buttons. `.code-tab` is gone.
  - **Item separator:** `.item-separator` is gone; use `.separator`.
  - **Reasoning and typing:** `.message-reasoning` and `.message-typing` are gone; use the reasoning component and `loader("typing")`. `reasoning()` renders its streaming label with `loader()`, and `loader(…, label=none)` on a text variant drops `role="status"`.
  - **Toast icons:** toast icons come from `src/icons`.
- **Shared behaviour helpers** in `packages/ui/src/utils/`:
  - `listbox.ts`: option filtering and the `activeDescendant()` highlight, used by combobox, command and prompt input, and filtering in select.
  - `dismiss.ts`: closing on an outside pointer down or when focus leaves.
  - `position.ts`: `place()`.
  - `shared.ts`: ids, arrow-key indexes, small checks.
  - `hotkey.ts`: `matchesHotkey`, still exported from `htmx-ui`.

  As a result:
  - Select, combobox and popover lists flip when they would leave the viewport, and so does the dropdown's own menu (before, only submenus did).
  - Tabs and toggle groups swap ← and → in right-to-left layouts.
  - The command menu's filter ignores accents.
  - The listboxes scroll their own list, never the page.
- **`dismissible`** reacts to any `[data-dismiss]` inside it, including buttons added later, and fires a cancelable `dismissible:dismiss`. It sets `data-state="closing"` and waits for a transition before removing the element.
- **Macro options are consistent.** Every component macro takes `class=""` and `attrs` as a dict, through `macros/attrs.html`. String `attrs` still work. `alert`, `dialog`, `drawer`, `sheet`, `empty`, `code_block`, `code_tabs`, `cli`, `checkbox` and `input_otp` gained the options they lacked, and `checkbox` gained `invalid`.
- **Tokens:** `--overlay` (`bg-overlay`) dims the page behind modals, sheets, drawers and the mobile sidebar. Accordion, reasoning, chain of thought, collapsible, progress, toast and sidebar transitions use the `--motion-duration-*` tokens, so they stop under reduced motion.
- **Search palette:** htmx-ui-plugin-search's palette is htmx-ui's command menu in a dialog (`.dialog.command-dialog`, `.command-*`). Its stylesheet only sizes it. `.search-field`, `.search-input`, `.search-group` and `.search-message` are gone.
- **Version banner:** htmx-ui-plugin-versions' old-version banner shows the alert's warning icon.

### Fixed

- **Scroll areas inside components show their scrollbar** without hovering: popup lists and menus (select, combobox,
  dropdown, command, popover...), `.command-list` and `.card-scroll` use `--scrollbar-thumb` through the new
  `scrollbar-visible` utility, so a long list looks scrollable. Other scrollbars still appear on hover.
- **The page no longer shifts sideways when a modal dialog, sheet or drawer opens**: `html` reserves its scrollbar's
  room (`scrollbar-gutter: stable`), so hiding the scrollbar to lock the page doesn't widen it.

## 0.2.0 — 2026-10-06

### Breaking

- **`templates` is gone from `htmx-ui.config.ts`; use `roots`.** The two options are now one, and `roots[0]` is the
  project root, which `templates` never moved. Rename the key, and put your project directory first unless it already
  is:

  ```ts
  // before
  export default defineConfig({ templates: ["."] });
  // after
  export default defineConfig({ roots: ["."] });
  ```

  A config that still says `templates` is a TypeScript error, not a silent fallback. `ResolvedConfig.templateRoots` is
  gone with it: read `ResolvedConfig.roots` (the same list, entries as `{ name?, dir }`) and map `dir` if you needed the
  bare directories.
- **`create-htmx-ui` defaults to `--pm bun`** instead of `npm`. Pass `--pm npm` (or `pnpm`, `yarn`) for the old
  behaviour. `bun create htmx-ui` already ran Bun, so this mostly changes what the scaffolder *writes* into a new
  project's `package.json` scripts and lockfile.

- **Sidebar is now a composable app sidebar** (header, content, groups, menus, footer, rail, trigger; variants,
  collapsible modes, a mobile panel). The old classes and attributes are renamed:

  | 0.1 | 0.2 |
  | :--- | :--- |
  | `.sidebar-link` | `.sidebar-menu-button`, in a `<li class="sidebar-menu-item">` of a `<ul class="sidebar-menu">` |
  | `.sidebar-label` | `.sidebar-group-label` |
  | `.sidebar-backdrop` | removed: wrap the sidebar and its main area in `.sidebar-layout`, which draws the backdrop |
  | `[data-sidebar-toggle]` | `[data-sidebar-trigger]` |
  | `[data-sidebar-close]` | unchanged, but for close buttons inside the panel (not the backdrop) |

  `.sidebar-group` now has padding and no margin between groups (put groups in `.sidebar-content` and set its gap).
  `.sidebar` is no longer a fixed sticky 240px column from `lg`: for the old layout use
  `data-collapsible="none" data-breakpoint="lg"` with `--sidebar-top: 3.5rem` and `--sidebar-width: 15rem`, as the docs
  layout does. The default mobile breakpoint is `md`. The [sidebar page](https://susonwaiba.github.io/htmx-ui/docs/components/sidebar)
  has the full upgrade table.

### Added

- **Plugins** (`plugins` in `htmx-ui.config.ts`): optional features as separate packages. A plugin can add template
  roots (searched after the project's, before htmx-ui's), globals, filters, a transform, routes, a fetch fallback, a
  `build.done` hook and CLI commands (`htmx-ui <name>`, listed by `htmx-ui --help`); the project's own options always
  win. Plugins work in dev, builds, on Bun and Node and behind every server adapter, because they are merged into the
  config once, in `resolveConfig()`. `htmx-ui-engine` exports `definePlugin()`, `editHtml()` (a streaming HTML editor
  for transforms, on both runtimes) and `contentType()` for writing them.
- **The first three plugins**, new packages released with the others: `htmx-ui-plugin-docs` (heading anchors,
  Markdown for every docs page, llms.txt, sitemaps, `docsNav()`, `demo()`/`classes()`/`markdown_actions()`),
  `htmx-ui-plugin-versions` (archived docs versions, the switcher and banner, `htmx-ui versions:name` and
  `htmx-ui versions:archive`) and `htmx-ui-plugin-search` (the Ctrl/⌘K palette). The docs site runs on them.
- **Components (37 new, each with a docs page):** checkbox (a native checkbox styled with tokens, sizes and every field state), radio-group (native
  radios as cards or inline rows, submitting with the form), select (a listbox in a popup opened from a button,
  searchable and keyboard driven, with a no-JS fallback to the native `<select>`), and switch (an on/off setting that
  applies immediately, drawn as a sliding track on a real checkbox).
- **More components:** dialog (a modal on the native `<dialog>`: opened with invoker commands, closed by Escape, a
  click outside or any `[data-dialog-close]`, with scrolling content, a sticky footer, stacking over another dialog,
  and htmx support: `data-dialog-show` / `data-dialog-remove` for dialogs a request returns, and `HX-Trigger:
  dialog:close` to close one from the server), alert dialog (`role="alertdialog"` on a dialog: no light dismiss, a
  small size, media and destructive actions), attachment (file, image, video and audio attachments with upload
  states, three sizes, vertical orientation and a scrolling, snapping group), avatar (image with a fallback that
  shows if it fails to load, sizes, status badges, groups with a count) and breadcrumb (custom separators,
  dropdowns, an ellipsis, and collapsing on its own when it doesn't fit).
- **Even more components:** tooltip (shown by CSS on hover and keyboard focus, on any side, with Escape to dismiss and
  `aria-describedby` wired by a small behaviour), label (`.label` for any control, wrapping checkboxes, radios and
  switches, and `.label-card` choice cards; it works as `.field-label` inside a field), separator (horizontal or
  vertical, semantic or decorative), collapsible (a button anywhere inside toggles a panel; nests into file trees, and
  styles `<details>` for no-JS use), combobox (an input with suggestions: accent- and order-insensitive filtering,
  keywords, groups with separators, auto highlight, multiple picks as chips, a clear button, form states, a macro, and
  server-side search with htmx), input OTP (one real input under the slots, so paste, SMS autofill and mobile keyboards
  work; digit, alphanumeric or custom patterns, groups, masking, sizes and states, a macro and an `input-otp:complete`
  event) and kbd (`.kbd` and `.kbd-group`, moved out of the text styles, adapting to buttons, tooltips and input
  groups).
- **New components:** progress (a styled native `<progress>` with label, value, help text, sizes, colours, an
  indeterminate state and a `progress()` macro), pagination (page links, previous/next, first/last, icon-only for data
  tables, a responsive mode, and a `pagination()` macro that computes the page range with ellipses), item (media, title,
  description and actions in variants and sizes, with icons, avatars, images, headers, groups, whole-item links and
  dropdowns), empty (empty states with media, outline and muted variants, and an `empty()` macro), menubar (the ARIA
  menubar pattern with roving focus, typeahead, submenus, checkbox and radio items, shortcuts and a vertical
  orientation), navigation menu (the disclosure navigation pattern: links and triggers opening panels, from lists to
  mega menus, with hover delays and arrow keys), hover card (a preview on hover or keyboard focus, on any side and
  alignment, in three widths, flipping at the viewport edge, with `hover-card:open` for lazy loading), sheet (a dialog
  attached to any edge, in sizes, with a `sheet()` macro) and drawer (swipe to dismiss in four directions, a drag
  handle, handle-only dragging, nested drawers stacking behind the frontmost, and a responsive dialog from `md`).
- **Components for apps and chat:** slider (one value, a range or any number of thumbs on native range inputs, so it
  submits and takes the keyboard with no JavaScript; thumbs that can't cross, an optional gap, a press on the track
  moving the nearest thumb, `<output for>` values, a vertical orientation, form states, sizes and a `slider()` macro),
  skeleton (any shape from utilities, text lines that follow the font size, avatar/button/input/badge/image shapes,
  pulse or shimmer, and macros for text, avatars, cards, lists, tables and forms), toast (stacking, Sonner-style
  notifications: success, info, warning, error and loading types, actions and cancel buttons, `toast.promise()`,
  updates by id, swipe to dismiss, a stack that fans out on hover and pauses its timers, six positions, rich colours;
  from script with `toast()`, from markup with `data-toast`, from the server with `HX-Trigger: {"toast": …}`, and
  loading-to-outcome toasts for any htmx request with `data-toast-loading`), command (a command menu filtered as you
  type, with groups, icons, separators, shortcuts, `aria-activedescendant`, a scrolling list, a ⌘K-style dialog with
  `data-command-hotkey`, item hotkeys, a `command:select` event and server-side search), carousel (on Embla Carousel,
  loaded on demand: item sizes, spacing, vertical orientation, prev/next and dots, Embla options and plugins from
  data attributes, `registerCarouselPlugin()` and `getCarousel()`) and message (chat messages with avatar, header,
  footer, start/end alignment, five variants, groups for consecutive messages, attachments, and reasoning, tool-call
  and typing parts for AI chat).
- **Components for AI chat:** loader (eight pure-CSS indicators: pulse, pulse dot, dots, typing, wave, text blink,
  text shimmer and loading dots, tuned with `--loader-size`, `--loader-duration`, `--loader-color` and
  `--loader-spread`, and a `loader()` macro), scroll button (a floating button that appears away from an edge of a
  container or the page and jumps back to the bottom or the top), reasoning (a `<details>` that opens while
  `data-streaming` is set and closes, with "Thought for N seconds", when it ends, unless the reader toggled it),
  chain of thought (steps on a connecting line, each with a status and details that fold away), prompt input (a
  growing textarea in one box with tools, send and stop driven by htmx request events, and `@` mention and `/` command
  menus from markup or the server) and message scroller (scrolling for a streaming chat transcript: a sent question rises to near the top and the
  reply grows into the room below it; the view follows the reply only from the bottom, holds the reader's place when
  content above changes or history loads, opens at the last question, jumps to linked messages and announces finished
  replies once).
- **Textarea** has its own page and directory: a character count against `maxlength`, Ctrl/⌘+Enter (or Enter) to
  submit, growing in browsers without `field-sizing`, `.textarea-fixed`, `.textarea-sm` / `-lg`, and
  `.textarea-warning` / `.textarea-success`.
- **Tabs:** `data-orientation="vertical"` (Up/Down keys, `aria-orientation`), disabled tabs that the keyboard skips,
  `.tabs-pills`, `.tabs-outline` and `.tabs-full`, and icon tabs.
- **Exports:** `toast` and its types, `registerCarouselPlugin`, `getCarousel`, `matchesHotkey`, `commandMatches`,
  `getMessageScroller`, `scrollToEdge`, `distanceFromEdge` and `scrollTargetOf` from `htmx-ui`. htmx-ui now depends on `embla-carousel`.
- **Dropdown:** checkbox and radio items (`role="menuitemcheckbox"` / `"menuitemradio"`), groups,
  `.dropdown-item-inset`, `.dropdown-shortcut`, `.dropdown-item-destructive`, submenus (`.dropdown-sub`) that flip at the
  viewport edge, typeahead, `data-keep-open`, a `menu:change` event, and hidden form fields for named checkbox and radio
  items, so a surrounding form submits them. Dropdowns and menubars share one menu engine.
- **Sidebar:** `data-variant` (sidebar, floating, inset), `data-collapsible` (offcanvas, icon with tooltips, none),
  `data-side`, the Ctrl/⌘+B shortcut, a rail, an opt-in cookie (`data-cookie`) so a server can render the saved state,
  an off-canvas mobile panel below a configurable breakpoint, badges, actions, sub-menus, skeletons, and
  `--sidebar-*` theme tokens.
- **Popover:** `.popover-header` and `.popover-footer`, `.popover-content-start` for explicit alignment, and
  `[data-popover-close]` buttons that close the panel and return focus to the trigger (forms in a popover).
- **Icons:** 37 new: `arrow-down`, `arrow-up`, `arrow-up-right`, `badge-check`, `bar-chart`, `bell`, `calendar`,
  `chevron-left`, `chevrons-left`, `chevrons-right`, `chevrons-up-down`, `circle`, `circle-alert`, `cloud`, `command`,
  `credit-card`, `ellipsis-vertical`, `file`, `folder`, `folder-open`, `folder-plus`, `house`, `inbox`, `log-in`,
  `log-out`, `message-square`, `music`, `panel-left`, `panel-right`, `paperclip`, `play`, `settings`, `shield-check`,
  `slash`, `user`, `users` and `video`.
- **Badge:** `.badge-ghost` and `.badge-link` variants, `.badge-solid` for filled status badges, `.badge-tone` with
  `--badge-tone` for any colour, and hover and focus styles on badges that are links or buttons.
- **`roots` in `htmx-ui.config.ts`:** an ordered list of template directories, each optionally named. The first entry is
  the project root (it decides `pages`, `outDir`, `publicDir` and `asset()` URLs); the rest are extra places to look. A
  `name` is the prefix templates reach that directory by, so a directory can move without a single template changing:

  ```ts
  export default defineConfig({
    roots: [".", { name: "layouts", dir: "new-layouts-2026" }, { name: "acme", dir: "../acme-ui" }],
  });
  ```

  Names work everywhere a template name does — `extends`, `include`, `import`, `from`, `json()`, `svg()`, `glob()` and
  `asset()` — because resolution moved into a loader Nunjucks uses for every template load. See
  [Roots](https://susonwaiba.github.io/htmx-ui/docs/engine#roots).
- **Serving a site from your own backend:** `createSite()` is the framework-free core of the dev servers, and five
  adapters wrap it, none importing its framework:
  - `htmx-ui-engine/elysia` — a plugin, so `.use(htmxUi()).listen()` chains and a specific route always beats the
    catch-all. **Recommended.**
  - `htmx-ui-engine/fastify` — a plugin that becomes Fastify's not-found handler; register it anywhere.
  - `htmx-ui-engine/koa` — middleware that answers only what nothing else did; mount it anywhere.
  - `htmx-ui-engine/express` and `htmx-ui-engine/hono` — `Request`/`Response` middleware; mount last.

  Elysia, Fastify and Koa answer only what your own routes don't, whatever order they are registered in; Express and
  Hono answer every request they see, so they are mounted last. Bodies a framework's parser already read
  (`express.urlencoded()`, `express.json()`, Fastify's JSON parser, Koa body parsers) reach the config's `routes`
  intact.

  `site.render()` renders a full page, `site.fragment()` renders any template as an htmx fragment, and `site.handle()`
  answers a request from config `routes`, the built `dist/`, the config's `fetch`, a 404, then returns `null`
  so your framework can answer. While `NODE_ENV` is not `production` it renders the page from its template when
  nothing is built yet, with the `context` you pass. See
  [Server frameworks](https://susonwaiba.github.io/htmx-ui/docs/servers).
- **A default 404 page:** a project without `pages/404.html` gets htmx-ui's own, from the server adapters,
  `htmx-ui dev`, `htmx-ui preview`, and as `dist/404.html` in every build. Add `pages/404.html` to replace it.
- **Code blocks highlight `docker` and `nginx`** (`Dockerfile` is mapped onto `docker`).
- **`render: true` in the config** checks at startup that the template roots and pages directory arrived, turning a
  packaging mistake into a failed boot instead of a 500 on the first request.
- **A cached runtime renderer:** `render(path, roots, { cache: true })`, with `warm()` to compile ahead of the first
  request (`createSite()` does both). A global that returns HTML can wrap its result in `markup()`.
- **`debug` in the config** — `debug: true` for everything, or a list of topics
  (`debug: ["requests", "render"]`; the topics are `requests`, `render`, `templates`, `build`) logs what answered each
  request, every render with its duration, what the template cache compiled, and builds and dev servers. Off by
  default.
- **Exports:** `queryAll` and the `Theme` type from `htmx-ui`; `createSite`, `Site`, `SiteOptions`, `normalizeRoots`,
  `tryLocate`, `locate`, `TemplateRoot`, `RootSpec`, `warm`, `markup`, `logger`, `TOPICS`, `Debug`, `Logger`, `Topic`,
  `Importer`, `definePlugin`, `Plugin`, `editHtml`, `HtmlElement`, `HtmlHandlers` and `contentType` from
  `htmx-ui-engine`.
- **Docs:** [Server frameworks](https://susonwaiba.github.io/htmx-ui/docs/servers) — how a request is answered, the
  404 page, pages and fragments, deploying, the `createSite()` API, and a page each for Elysia, Fastify, Koa, Express,
  Hono, `Bun.serve`, Deno / `node:http` / h3 / NestJS, and backends in other languages (Django, Rails, Go), including
  how to deploy templates that a server renders at runtime. [Plugins](https://susonwaiba.github.io/htmx-ui/docs/plugins)
  with a page per plugin and [writing one](https://susonwaiba.github.io/htmx-ui/docs/plugins/writing). The components
  index is grouped by category — forms, actions, navigation, overlays, feedback, layout, data, content and chat — so
  the sidebar, prev/next links and the agent outputs follow the same order.

### Changed

- **Motion tokens and animated panels.** Components animate with shared `--motion-duration-*` and `--motion-ease-*`
  tokens (see `/docs/theming#motion`), which collapse to `0s` for `prefers-reduced-motion`. Popovers, dropdown and
  menubar menus, select and combobox lists now fade and zoom in from their trigger and fade out (CSS only:
  `@starting-style` and `display` transitions); dialogs also rise slightly as they open. Tooltips, hover cards, the
  navigation menu, sheets and drawers use the tokens in place of fixed timings.
- **The dev watcher honours `.gitignore`** and skips `node_modules`, `dist`, `public` and `.git` whatever the roots say,
  so a root of `.` no longer adds a file watcher for every directory in `node_modules`. The trade-off: a new file under
  one of those directories shows up on the next refresh rather than immediately.
- **`bun run version:set <x.y.z>`** names the docs version in development, dates it, and sets the version on every
  package at once, so a release cannot leave one of them out of step.

- **Dropdown items** no longer spread their content apart (`justify-between`): content is left-aligned and trailing
  badges, shortcuts and icons are pushed right. Hovering an item focuses it, choosing one returns focus to the trigger,
  and Enter or Space on the trigger opens the menu on its first item.
- **`.tabs` is styled:** the wrapper is a column with a gap between the list and the panels (side by side when
  vertical), in place of the margin on `.tabs-panel`. A list and panels without the `.tabs` wrapper keep the margin.
- **`data-dialog-remove`** waits for the dialog's own transition before removing it, instead of a fixed 200ms, so
  sheets and drawers finish sliding out.

### Fixed

- `htmx-ui build` on Bun prints the bundler's errors (an unresolved import, say) instead of only "Bundle failed".
- **Icons in a badge are badge-sized** (0.75rem). The `size-4` class `icon()` puts on every icon used to win over the
  badge's own icon size.
- **`assetVer()`'s `?ver=` can no longer break a build** or be dropped by the bundler. Neither Bun nor Vite can resolve
  an asset URL with a query string, so the version is parked in a `data-ver` attribute before the bundler sees the page
  and moved onto the finished URL after it.
- **`.select` no longer restyles the new select component's trigger** as a native dropdown (the rule is scoped to
  `select.select`).
- **A field whose label sits in `.field-content`** — what a switch or a radio group produces — now marks an invalid
  field the same way a top-level label does, instead of losing the danger colour.
- **The dev server watches template roots**, not a hardcoded list, so a template that moved is still watched.
- **Links in a `.field-description` are underlined** again: the minified build dropped `[&_a]:underline` inside `@apply`.

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
