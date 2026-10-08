// 0.2.x -> 0.3.0. Breaking changes: CHANGELOG.md "## 0.3.0", /docs/changelog/0.3.0.
import { addClasses, any, defineMigration, MARKUP, renameClass, replace, SCRIPT, STYLE, warn } from "../transforms";

/** An icon in a hand-written button: inline <svg> or the icon() macro. */
const ICON = /<svg\b[\s\S]*?<\/svg>|\{\{-?\s*icon\([^}]*\)\s*-?\}\}/g;

/**
 * The 0.2 code block copy button (class="code-copy" data-copy, a .code-copy-idle and a
 * .code-copied span) becomes the icon-only clipboard button, keeping its two icons.
 */
function copyButton(button: string, open: string) {
  const [idle, done, ...more] = button.slice(open.length).match(ICON) ?? [];
  const classes = open.match(/\bclass\s*=\s*(["'])(.*?)\1/s)?.[2] ?? "";
  if (!/(^|\s)code-copy(\s|$)/.test(classes) || !idle || !done || more.length) return button;
  return (
    `<button type="button" class="btn btn-ghost btn-xs btn-icon clipboard code-copy" data-clipboard data-clipboard-target="pre:not([hidden]) code" aria-label="Copy code">` +
    `<span class="clipboard-idle">${idle}</span><span class="clipboard-done">${done}</span></button>`
  );
}

export default defineMigration({
  version: "0.3.0",
  changes: [
    // Code block copy buttons are clipboard buttons; initCode() is gone
    replace("code block copy button → clipboard button", any(MARKUP), /(<button\b(?:[^>"']|"[^"]*"|'[^']*')*\sdata-copy(?![\w-])(?:[^>"']|"[^"]*"|'[^']*')*>)[\s\S]*?<\/button>/g, copyButton),
    replace("initCode() call removed (initComponents() runs the clipboard)", any(SCRIPT), /^[ \t]*initCode\([^)]*\);?[ \t]*\r?\n/gm, () => ""),
    replace("initCode import removed", any(SCRIPT), /^([ \t]*)import\s*\{([^}]*)\}(\s*from\s*["'][^"']+["'];?[ \t]*\r?\n?)/gm, (all, indent: string, names: string, from: string) => {
      const list = names.split(",").map((n) => n.trim()).filter(Boolean);
      if (!list.includes("initCode")) return all;
      const rest = list.filter((n) => n !== "initCode");
      return rest.length ? `${indent}import { ${rest.join(", ")} }${from}` : "";
    }),
    warn(/\binitCode\b/, "initCode() is gone; initComponents() runs the clipboard", any(SCRIPT)),
    warn(/(?<![\w-])(code-copy-idle|code-copied|data-copy-label)(?![\w-])/, "gone with the old copy button: use .clipboard-idle / .clipboard-done (see /docs/components/code)"),
    warn(/<[^>]*\sdata-copy(?![\w-])/, "data-copy is gone: copy buttons are clipboard buttons (data-clipboard; see /docs/components/clipboard)", any(MARKUP)),

    // Buttons that are .btn buttons now: the component class only positions them
    ...["dialog-close", "sheet-close", "alert-close", "sidebar-trigger"].map((c) => addClasses(c, ["btn", "btn-ghost", "btn-icon", "btn-sm"])),
    addClasses("code-copy", ["btn", "btn-ghost", "btn-xs"]),
    addClasses("message-scroller-jump", ["btn", "btn-outline", "btn-sm", "btn-rounded"]),

    // Code tabs are tabs
    renameClass("code-tab", "tabs-trigger"),
    addClasses("code-tabs", ["tabs-list", "tabs-line"]),

    renameClass("item-separator", "separator"),
    warn(/(?<![\w-])message-reasoning(?![\w-])/, ".message-reasoning is gone: use the reasoning component (/docs/components/reasoning)"),
    warn(/(?<![\w-])message-typing(?![\w-])/, '.message-typing is gone: use loader("typing") (/docs/components/loader)'),
    warn(/(?<![\w-])search-(field|input|group|message)(?![\w-])/, "htmx-ui-plugin-search's palette is the command menu now (.command-*); .search-field, .search-input, .search-group and .search-message are gone", any(STYLE, SCRIPT)),
  ],
  notes: [
    "htmx-ui-plugin-docs: initMarkdownCopy() still works but is deprecated; the docs plugin's Copy Markdown button needs no client now.",
  ],
});
