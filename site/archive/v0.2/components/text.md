---
title: "Text"
description: "Style long-form content without a class on every element: wrap it in .prose from @tailwindcss/typography, tuned to htmx-ui's tokens. Small helper classes cover single elements in UI chrome."
url: "/docs/v0.2/components/text"
section: "Components"
---

# Text

Style long-form content without a class on every element: wrap it in .prose from @tailwindcss/typography, tuned to htmx-ui's tokens. Small helper classes cover single elements in UI chrome.

## Prose

Wrap plain HTML (an article, Markdown output, CMS content, a server-rendered fragment) in `.prose`. Every heading, paragraph, list, link, quote, table and code element inside is styled. No per-element classes.

```html
<article class="prose">
  <h2>Shipping hypermedia</h2>
  <p class="lead">Your server already renders HTML. htmx swaps it in; htmx-ui makes it look good.</p>
  <p>Return a fragment from any endpoint, point <code>hx-target</code> at it, and you're done. See <a href="/docs/installation">installation</a>.</p>
  <ul>
    <li>Plain <strong>HTML</strong> in, styled content out</li>
    <li>Works with Markdown renderers and CMS output</li>
  </ul>
  <blockquote><p>Hypermedia is the engine of application state.</p></blockquote>
  <p>Press <kbd>Ctrl</kbd> + <kbd>K</kbd> to search.</p>
</article>
```

`.prose` comes from [@tailwindcss/typography](https://github.com/tailwindlabs/tailwindcss-typography), which `htmx-ui/styles.css` loads for you. Everything in its docs works: sizes (`prose-sm`, `prose-lg`), element modifiers (`prose-a:text-primary`, `prose-headings:tracking-tight`), and `max-w-none` to drop the default line-length limit.

## What htmx-ui changes

- **Colours come from the [tokens](/docs/v0.2/theming)**: body and headings use `--foreground`, links `--primary`, rules and table borders `--border`, code blocks `--code-background`. Prose therefore follows custom themes and dark mode on its own. **Don't add `dark:prose-invert`.**
- Inline `code` is a pill on a muted background instead of being wrapped in backticks.
- Links get a soft underline that firms up on hover.
- Headings get `scroll-margin-top` so `#anchor` links clear a sticky header.
- Components placed inside prose with `not-prose` (alerts, code blocks, tables) get the same vertical spacing as paragraphs.

## Components inside prose

Prose styles every element inside it, which would also restyle a component's markup. Add `not-prose` to a component to keep its own styles. htmx-ui's Nunjucks macros (`code`, `alert`) already do. The flip side: `.prose` placed _inside_ a `not-prose` element gets no styles at all, so don't nest them that way.

```html
<article class="prose">
  <p>Before you deploy:</p>

  <div class="alert alert-warning not-prose" role="status">
    <div class="alert-title">Back up your database</div>
  </div>

  <p>Then run the migration.</p>
</article>
```

## Sizes

```html
<div class="prose prose-sm"><p><strong>prose-sm</strong>: for sidebars, cards and dense UIs.</p></div>
<div class="prose"><p><strong>prose</strong>: the default, for articles and docs.</p></div>
<div class="prose prose-lg"><p><strong>prose-lg</strong>: for landing-page copy.</p></div>
```

## Customising further

Tweak one block with element modifiers, or change prose everywhere by adding to the `prose` utility:

```html
<article class="prose prose-headings:font-bold prose-a:no-underline">…</article>
```

```css src/styles.css
@utility prose {
  --tw-prose-bullets: var(--primary);

  & :where(h2):not(:where([class~="not-prose"] *)) {
    border-bottom: 1px solid var(--border);
    padding-bottom: 0.5rem;
  }
}
```

## Single elements

UI chrome (a page title, a hint under a form field) isn't long-form content. For one-off elements outside prose, use these helpers:

```html
<p class="eyebrow">Settings</p>
<h1 class="h1">Account</h1>
<p class="lead">Manage your profile and preferences.</p>
<h3 class="h3">Danger zone</h3>
<p class="muted">Deleting your account can't be undone.</p>
<p>Read the <a class="link" href="/docs/theming">theming guide</a>, run <code class="code">bun run dev</code>, press <kbd class="kbd">Esc</kbd>.</p>
```

> **Which one?** More than a couple of text elements in a row is content: use `.prose`. A single label or title in a layout: use a helper.

## Reference

| Class | Description |
| --- | --- |
| `.prose` | Long-form content (@tailwindcss/typography), mapped to htmx-ui tokens. |
| `.prose-sm / .prose-lg` | Smaller / larger prose. |
| `.not-prose` | Opt a subtree (usually a component) out of prose styles. |
| `.h1 / .h2 / .h3 / .h4` | Heading scale for single titles outside prose. |
| `.lead` | Intro paragraph: larger, muted. |
| `.muted` | Small secondary text. |
| `.eyebrow` | Small primary-coloured label above a heading. |
| `.link` | Underlined link in the primary colour. |
| `.code` | Inline code outside prose. |
| `.kbd` | Keyboard key outside prose; see Kbd for groups and keys in buttons and tooltips. |
