---
title: "Components"
description: "Every component, grouped by what it is for: forms, actions, navigation, overlays, feedback, layout, data, typography and chat. Each is a set of CSS classes, plus a small behaviour where one is needed."
url: "/docs/v0.2/components"
section: "Components"
---

# Components

Every component, grouped by what it is for: forms, actions, navigation, overlays, feedback, layout, data, typography and chat. Each is a set of CSS classes, plus a small behaviour where one is needed.

58 components in 9 groups. Jump to one:

[Forms & inputs 12](#forms) [Actions & menus 8](#actions) [Navigation 5](#navigation) [Overlays 7](#overlays) [Feedback & status 8](#feedback) [Layout & disclosure 5](#layout) [Data display 3](#data) [Typography & media 4](#content) [Chat & AI 6](#chat)

## Forms & inputs

Controls that take input and submit with a form, and the fields that label them.

- [Checkbox](/docs/v0.2/components/checkbox): A box that toggles between checked and not checked, with sizes, states and every field feature.
- [Combobox](/docs/v0.2/components/combobox): An input with a filtered list of suggestions: groups, multiple picks as chips, a clear button, server search.
- [Field](/docs/v0.2/components/field): Labels, help text and messages for controls; inline, responsive and grid forms.
- [Input](/docs/v0.2/components/input): Text inputs, textareas, selects and file pickers with every state.
- [Input group](/docs/v0.2/components/input-group): Icons, text, buttons, menus and spinners inside an input's border.
- [Input OTP](/docs/v0.2/components/input-otp): A one-time code in a row of slots: digits or letters, groups, paste and SMS autofill, sizes and states.
- [Label](/docs/v0.2/components/label): An accessible label for any control, wrapping checkboxes and radios, or as a choice card.
- [Radio group](/docs/v0.2/components/radio-group): Radio buttons as cards or inline rows: one choice of a few, submitting with the form.
- [Select](/docs/v0.2/components/select): A list of options in a popup opened from a button: searchable, keyboard driven, styled like an input.
- [Slider](/docs/v0.2/components/slider): Pick a value, a range or several values on a track: native range inputs, vertical too, with every form state.
- [Switch](/docs/v0.2/components/switch): An on/off setting that applies at once: a sliding track on a real checkbox, no JavaScript.
- [Textarea](/docs/v0.2/components/textarea): Multi-line text that grows as you type: field, character count, every state, and Ctrl/⌘+Enter to submit.

## Actions & menus

Buttons, toggles and menus that do something.

- [Button](/docs/v0.2/components/button): Actions in every variant, size and state, including loading.
- [Button group](/docs/v0.2/components/button-group): Join buttons, inputs and menus: split buttons, toolbars, vertical groups.
- [Command](/docs/v0.2/components/command): A command menu for search and quick actions: filtering, keyboard, groups, shortcuts, inline or in a ⌘K dialog.
- [Dropdown](/docs/v0.2/components/dropdown): A menu of links, actions and options that opens from a button, with checkbox and radio items, shortcuts and submenus.
- [Menubar](/docs/v0.2/components/menubar): A persistent row of menus, as in desktop apps: submenus, checkbox and radio items, icons and shortcuts.
- [Scroll button](/docs/v0.2/components/scroll-button): A floating button that jumps back to the bottom or top of a container or the page.
- [Toggle](/docs/v0.2/components/toggle): A two-state button, on or off, in any button style.
- [Toggle group](/docs/v0.2/components/toggle-group): A set of toggle buttons: pick one, at most one, or many.

## Navigation

Moving between pages and between views of a page.

- [Breadcrumb](/docs/v0.2/components/breadcrumb): The path to the current page: custom separators, dropdowns, and collapsing to an ellipsis when space runs out.
- [Navigation menu](/docs/v0.2/components/navigation-menu): A site's main navigation: links, and buttons that open panels of links, from simple lists to mega menus.
- [Pagination](/docs/v0.2/components/pagination): Links to the pages of a long list, with previous and next, page numbers or icons only.
- [Sidebar](/docs/v0.2/components/sidebar): Composable app navigation: groups, menus, badges and actions, collapsing to icons or off-canvas, with a mobile panel.
- [Tabs](/docs/v0.2/components/tabs): Layered panels shown one at a time: line, pill and outline styles, icons, disabled tabs, vertical, synced and remembered.

## Overlays

Content that opens above the page: modals, panels, popups and hints.

- [Alert dialog](/docs/v0.2/components/alert-dialog): A modal that interrupts with important content and waits for an answer: small size, media and destructive actions.
- [Dialog](/docs/v0.2/components/dialog): A modal window over the page or another dialog: close button or outside click, scrolling content, sticky footer, htmx fragments.
- [Drawer](/docs/v0.2/components/drawer): A panel on an edge of the screen that can be swiped away: four directions, a handle, nested drawers, a responsive dialog.
- [Hover card](/docs/v0.2/components/hover-card): A card that previews what is behind a link when a mouse rests on it or the link gets keyboard focus.
- [Popover](/docs/v0.2/components/popover): A floating panel of rich content that opens from a button: a header, alignment, and forms.
- [Sheet](/docs/v0.2/components/sheet): A dialog that slides in from an edge of the screen: four sides, sizes, scrolling content, htmx fragments.
- [Tooltip](/docs/v0.2/components/tooltip): A short hint on hover or keyboard focus, on any side, with no JavaScript needed to show it.

## Feedback & status

Messages, progress, loading and empty states, and labels for status.

- [Alert](/docs/v0.2/components/alert): Callouts for info, success, warnings and errors.
- [Badge](/docs/v0.2/components/badge): Small status labels and counters.
- [Empty](/docs/v0.2/components/empty): An empty state with an icon, a message and a way forward.
- [Loader](/docs/v0.2/components/loader): Pure-CSS loading indicators: dots, waves, pulses and animated text.
- [Progress](/docs/v0.2/components/progress): A bar showing how far a task has got, with an optional label, value and help text.
- [Skeleton](/docs/v0.2/components/skeleton): Placeholders shaped like loading content: any shape, text, avatars, cards, lists, tables and forms.
- [Spinner](/docs/v0.2/components/spinner): Loading indicator from any icon or pure CSS; works in buttons, badges and inputs.
- [Toast](/docs/v0.2/components/toast): Stacking, swipeable notifications: success, info, warning, error and loading, actions, promises and server toasts.

## Layout & disclosure

Containers that group, separate, reveal or scroll through content.

- [Accordion](/docs/v0.2/components/accordion): Stacked headings that reveal sections; one or many open, no JavaScript.
- [Card](/docs/v0.2/components/card): Header, content and footer, with media, an action slot and scrolling content.
- [Carousel](/docs/v0.2/components/carousel): Slides that drag, swipe and snap with momentum (Embla): item sizes, spacing, vertical, options and plugins.
- [Collapsible](/docs/v0.2/components/collapsible): A button that shows and hides a panel: extra settings, nested file trees, or <details> with no JavaScript.
- [Separator](/docs/v0.2/components/separator): A horizontal or vertical line between content, semantic or purely visual.

## Data display

Rows, tables and people: structured content to scan.

- [Avatar](/docs/v0.2/components/avatar): An image with a fallback for a user: sizes, status badges, groups with a count, and menu triggers.
- [Item](/docs/v0.2/components/item): A row of content with media, a title, a description and actions, alone or in a list.
- [Table](/docs/v0.2/components/table): Readable data tables with optional hover rows.

## Typography & media

Long-form text, code, keys and icons.

- [Code block](/docs/v0.2/components/code-block): Highlighted source with a copy button and package-manager tabs.
- [Icon](/docs/v0.2/components/icon): SVG icons inlined at build time, or linked as images.
- [Kbd](/docs/v0.2/components/kbd): Keyboard keys and shortcuts, on their own or in buttons, tooltips and input groups.
- [Text](/docs/v0.2/components/text): Long-form content with .prose (Tailwind Typography), plus helpers for single elements.

## Chat & AI

Conversations, attachments and assistant replies.

- [Attachment](/docs/v0.2/components/attachment): A file, image, video or audio attachment with upload states, sizes, orientation and scrolling groups.
- [Chain of thought](/docs/v0.2/components/chain-of-thought): A sequence of steps on a connecting line, each folding its details away: reasoning traces, tool calls and process logs.
- [Message](/docs/v0.2/components/message): A chat message with avatar, header, footer and alignment; groups, attachments, and reasoning and tool calls for AI chat.
- [Message scroller](/docs/v0.2/components/message-scroller): Scrolling for a streaming chat transcript: new questions rise to the top, replies grow beneath them, and the view moves only when the reader does.
- [Prompt input](/docs/v0.2/components/prompt-input): The text box of an AI chat: a growing textarea, tools, send and stop, @ mentions and / commands.
- [Reasoning](/docs/v0.2/components/reasoning): A collapsible for AI reasoning that opens while it streams and closes, with its duration, when it ends.

## Anatomy of a component

Each component has its own directory, `htmx-ui/components/<name>/` (`packages/ui/src/components/<name>/` in the repository), holding:

- `<name>.css`: classes in `@layer components`, built from token utilities with `@apply`.
- `<name>.ts` (optional): an `init<Name>(root)` function that wires up `[data-<name>]` elements once each, with `<name>.test.ts` beside it.
- `<name>.html` (optional): a Nunjucks macro for markup that is tedious to write by hand.
