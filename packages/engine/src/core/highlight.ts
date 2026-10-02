// Build-time syntax highlighting with Shiki, synchronous so Nunjucks can call it.
//
// Uses Shiki's CSS-variables theme: tokens come out as `color: var(--code-token-keyword)`
// and so on, and src/styles.css defines those variables for light and dark.
// So highlighted code follows dark mode and custom themes with no JS in the browser.

import { createCssVariablesTheme, createHighlighterCoreSync } from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";
import bash from "shiki/langs/bash.mjs";
import css from "shiki/langs/css.mjs";
import html from "shiki/langs/html.mjs";
import javascript from "shiki/langs/javascript.mjs";
import jinja from "shiki/langs/jinja.mjs"; // also brings jinja-html
import json from "shiki/langs/json.mjs";
import markdown from "shiki/langs/markdown.mjs";
import toml from "shiki/langs/toml.mjs";
import typescript from "shiki/langs/typescript.mjs";
import xml from "shiki/langs/xml.mjs";

const theme = createCssVariablesTheme({ name: "htmx-ui", variablePrefix: "--code-", fontStyle: true });

const highlighter = createHighlighterCoreSync({
  themes: [theme],
  langs: [bash, css, html, javascript, jinja, json, markdown, toml, typescript, xml],
  // Oniguruma (the regex engine TextMate grammars are written for) loads once,
  // asynchronously; after that the highlighter is fully synchronous.
  engine: await createOnigurumaEngine(import("shiki/wasm")),
});

/** Names used in templates -> Shiki language ids. */
const ALIASES: Record<string, string> = {
  sh: "bash",
  shell: "bash",
  jinja: "jinja-html",
  nunjucks: "jinja-html",
  njk: "jinja-html",
  js: "javascript",
  ts: "typescript",
  md: "markdown",
  svg: "xml",
};

const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * Highlight `code` as `lang`, returning the inner HTML of a <code> element
 * (one <span class="line"> per line). Unknown languages come back escaped, unhighlighted.
 */
export function highlight(code: string, lang = "text"): string {
  const id = ALIASES[lang] ?? lang;
  if (!highlighter.getLoadedLanguages().includes(id)) return escape(code);
  const out = highlighter.codeToHtml(code, { lang: id, theme: "htmx-ui" });
  return out.slice(out.indexOf("<code>") + 6, out.lastIndexOf("</code>"));
}
