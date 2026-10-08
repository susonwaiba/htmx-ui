// Command menu. Markup: see command.css.
// - Typing filters the items (their text plus data-keywords; letters in order, so "stng" finds
//   "Settings"). Groups with nothing left hide, as do separators that would end up doubled or at
//   an edge, and [data-command-empty] shows when nothing matches. data-command-filter="false"
//   leaves filtering to the server (an hx-get on the input that swaps the list): the highlight
//   follows whatever the list holds.
// - Up/Down (wrapping), Home/End and the pointer move the highlight; Enter activates it. The input
//   gets combobox roles and aria-activedescendant, so screen readers follow along.
// - Activating an item clicks it: a link navigates, an hx-* item sends its request. It also fires
//   command:select (detail: { value, item }) on the item, and closes the enclosing dialog unless
//   the item or the command has data-command-keep-open.
// - data-command-hotkey="mod+k" (mod = ⌘ on Apple devices, Ctrl elsewhere) on the .command opens
//   its dialog from anywhere on the page, or focuses its input when it isn't in one. An item's
//   data-command-hotkey="mod+shift+p" activates it while the command has focus.
// - Each time its dialog opens, the query is cleared and the first item highlighted.
import { queryAll } from "../../utils/dom";
import { matchesHotkey } from "../../utils/hotkey";
import { activeDescendant, filterOptions, reachable } from "../../utils/listbox";
import { ensureId, isEditable } from "../../utils/shared";

const ITEM = ".command-item, [data-command-item]";

/** Letters of `query` appear in `text` in order; whitespace-separated words each must match. */
export function commandMatches(text: string, query: string): boolean {
  const haystack = text.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => {
      if (haystack.includes(word)) return true;
      let i = 0;
      for (const ch of haystack) if (ch === word[i]) i++;
      return i === word.length;
    });
}

export function initCommand(root: ParentNode) {
  queryAll(root, "[data-command]:not([data-init])").forEach((command) => {
    command.dataset.init = "";
    const input = command.querySelector<HTMLInputElement>("[data-command-input], .command-input");
    const list = command.querySelector<HTMLElement>(".command-list, [role='listbox']");
    const empty = command.querySelector<HTMLElement>("[data-command-empty]");
    const dialog = command.closest("dialog");
    const filtering = command.dataset.commandFilter !== "false";
    if (!list) return;

    ensureId(list, "command-list");
    if (!list.hasAttribute("role")) list.setAttribute("role", "listbox");
    if (input) {
      input.setAttribute("role", "combobox");
      input.setAttribute("aria-expanded", "true");
      input.setAttribute("aria-controls", list.id);
      input.setAttribute("aria-autocomplete", "list");
      input.autocomplete = "off";
      input.spellcheck = false;
    }

    const items = () => [...list.querySelectorAll<HTMLElement>(ITEM)];
    const visible = () => reachable(list, ITEM);
    // The highlighted item is also aria-selected: it is the one Enter activates. The list
    // scrolls to it, never the page around it.
    const highlighter = activeDescendant(input ?? list, { all: items, options: visible, select: true });
    const highlight = (item: HTMLElement | null, scroll = true) => {
      if (item) ensureId(item, "command-item");
      highlighter.highlight(item, scroll);
    };

    const prepare = () =>
      items().forEach((item) => {
        if (!item.hasAttribute("role")) item.setAttribute("role", "option");
        if (!item.hasAttribute("aria-selected")) item.setAttribute("aria-selected", "false");
        if (item.tagName === "A") item.tabIndex = -1;
      });

    // Letters in order (commandMatches) over an item's text, data-keywords and data-value; groups
    // and separators left with nothing hide (utils/listbox.ts).
    const filter = () => {
      const query = filtering ? (input?.value.trim() ?? "") : "";
      const any = filterOptions(list, query, {
        matches: commandMatches,
        text: (item) => `${item.textContent ?? ""} ${item.dataset.keywords ?? ""} ${item.dataset.value ?? ""}`,
        option: ITEM,
        group: ".command-group, [role='group']",
        separator: ".command-separator, [role='separator']",
      });
      if (empty) empty.hidden = any > 0;
      const current = highlighter.active;
      if (!current || current.hidden || !current.isConnected) highlight(visible()[0] ?? null);
      else if (query) highlight(visible()[0] ?? null);
    };

    const move = highlighter.move;

    const activate = (item: HTMLElement) => {
      if (item.getAttribute("aria-disabled") === "true") return;
      const keepOpen = item.hasAttribute("data-command-keep-open") || command.hasAttribute("data-command-keep-open");
      item.dispatchEvent(new CustomEvent("command:select", { bubbles: true, detail: { value: item.dataset.value ?? item.textContent?.trim(), item } }));
      if (dialog?.open && !keepOpen) dialog.close();
    };

    // Clicks reach the item itself (links, hx-*), then this handler.
    list.addEventListener("click", (e) => {
      const item = (e.target as Element).closest<HTMLElement>(ITEM);
      if (item && list.contains(item)) activate(item);
    });
    list.addEventListener("pointermove", (e) => {
      const item = (e.target as Element).closest<HTMLElement>(ITEM);
      if (item && item !== highlighter.active && visible().includes(item)) highlight(item, false);
    });

    command.addEventListener("keydown", (e) => {
      if (e.isComposing) return;
      const hotkeyed = items().find((i) => i.dataset.commandHotkey && matchesHotkey(e, i.dataset.commandHotkey));
      if (hotkeyed) {
        e.preventDefault();
        hotkeyed.click();
        return;
      }
      switch (e.key) {
        case "ArrowDown":
          move(1);
          break;
        case "ArrowUp":
          move(-1);
          break;
        case "Home":
          if (e.target === input && input?.value) return;
          move("first");
          break;
        case "End":
          if (e.target === input && input?.value) return;
          move("last");
          break;
        case "Enter":
          if (!highlighter.active) return;
          highlighter.active.click();
          break;
        default:
          return;
      }
      e.preventDefault();
    });

    input?.addEventListener("input", filter);

    const reset = () => {
      if (input) input.value = "";
      filter();
      highlight(visible()[0] ?? null);
      input?.focus();
    };

    if (dialog) {
      new MutationObserver(() => dialog.open && reset()).observe(dialog, { attributes: true, attributeFilter: ["open"] });
    }

    const hotkey = command.dataset.commandHotkey;
    if (hotkey) {
      document.addEventListener("keydown", (e) => {
        if (!command.isConnected || !matchesHotkey(e, hotkey)) return;
        const bare = !e.ctrlKey && !e.metaKey && !e.altKey;
        if (bare && isEditable(e.target)) return;
        e.preventDefault();
        if (dialog) {
          if (dialog.open) dialog.close();
          else dialog.showModal();
        } else input?.focus();
      });
    }

    // Items swapped in by htmx (server-side search) or added by script
    new MutationObserver(() => {
      prepare();
      filter();
    }).observe(list, { childList: true, subtree: true });

    prepare();
    filter();
    if (!highlighter.active) highlight(visible()[0] ?? null, false);
  });
}
