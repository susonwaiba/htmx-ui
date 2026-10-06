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

const ITEM = ".command-item, [data-command-item]";
let ids = 0;

const isApple = () => /mac|iphone|ipad|ipod/i.test(navigator.platform || navigator.userAgent);

/** Does `e` match a combo like "mod+shift+k"? */
export function matchesHotkey(e: KeyboardEvent, combo: string): boolean {
  const parts = combo.toLowerCase().split("+").map((p) => p.trim());
  const key = parts.pop();
  if (!key) return false;
  const want = { ctrl: false, meta: false, alt: false, shift: false };
  for (const p of parts) {
    if (p === "mod") want[isApple() ? "meta" : "ctrl"] = true;
    else if (p === "cmd" || p === "meta") want.meta = true;
    else if (p === "ctrl" || p === "control") want.ctrl = true;
    else if (p === "alt" || p === "option") want.alt = true;
    else if (p === "shift") want.shift = true;
  }
  const pressed = e.key.toLowerCase();
  const code = e.code?.toLowerCase() ?? "";
  const keyMatches = pressed === key || code === `key${key}` || code === `digit${key}`;
  return keyMatches && e.ctrlKey === want.ctrl && e.metaKey === want.meta && e.altKey === want.alt && e.shiftKey === want.shift;
}

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

const editable = (el: EventTarget | null) =>
  el instanceof HTMLElement && (el.isContentEditable || /^(input|textarea|select)$/i.test(el.tagName));

export function initCommand(root: ParentNode) {
  queryAll(root, "[data-command]:not([data-init])").forEach((command) => {
    command.dataset.init = "";
    const input = command.querySelector<HTMLInputElement>("[data-command-input], .command-input");
    const list = command.querySelector<HTMLElement>(".command-list, [role='listbox']");
    const empty = command.querySelector<HTMLElement>("[data-command-empty]");
    const dialog = command.closest("dialog");
    const filtering = command.dataset.commandFilter !== "false";
    if (!list) return;

    list.id ||= `command-list-${++ids}`;
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
    const visible = () => items().filter((i) => !i.hidden && i.getAttribute("aria-disabled") !== "true");
    let current: HTMLElement | null = null;

    const highlight = (item: HTMLElement | null, scroll = true) => {
      if (current && current !== item) {
        delete current.dataset.highlighted;
        current.setAttribute("aria-selected", "false");
      }
      current = item;
      if (!item) return input?.removeAttribute("aria-activedescendant");
      item.id ||= `command-item-${++ids}`;
      item.dataset.highlighted = "";
      item.setAttribute("aria-selected", "true");
      input?.setAttribute("aria-activedescendant", item.id);
      // Scroll the list only, never the page around it.
      if (!scroll) return;
      const r = item.getBoundingClientRect();
      const l = list.getBoundingClientRect();
      if (r.top < l.top) list.scrollTop -= l.top - r.top;
      else if (r.bottom > l.bottom) list.scrollTop += r.bottom - l.bottom;
    };

    const prepare = () =>
      items().forEach((item) => {
        if (!item.hasAttribute("role")) item.setAttribute("role", "option");
        if (!item.hasAttribute("aria-selected")) item.setAttribute("aria-selected", "false");
        if (item.tagName === "A") item.tabIndex = -1;
      });

    const filter = () => {
      const query = filtering ? (input?.value.trim() ?? "") : "";
      items().forEach((item) => {
        const text = `${item.textContent ?? ""} ${item.dataset.keywords ?? ""} ${item.dataset.value ?? ""}`;
        item.hidden = !!query && !commandMatches(text, query);
      });
      // Groups with no item left
      list.querySelectorAll<HTMLElement>(".command-group, [role='group']").forEach((group) => {
        group.hidden = !group.querySelector(`:is(${ITEM}):not([hidden])`);
      });
      // Separators: hide those at an edge or next to another visible separator
      let previousVisible: HTMLElement | null = null;
      const children = [...list.children] as HTMLElement[];
      const shown = (el: HTMLElement) => !el.hidden && !el.matches("[data-command-empty], .command-empty");
      children.forEach((el) => {
        if (!el.matches(".command-separator, [role='separator']")) {
          if (shown(el)) previousVisible = el;
          return;
        }
        const next = children.slice(children.indexOf(el) + 1).find(shown);
        el.hidden = !previousVisible || previousVisible.matches(".command-separator, [role='separator']") || !next || next.matches(".command-separator, [role='separator']");
        if (!el.hidden) previousVisible = el;
      });
      const any = items().some((i) => !i.hidden);
      if (empty) empty.hidden = any;
      if (!current || current.hidden || !current.isConnected) highlight(visible()[0] ?? null);
      else if (query) highlight(visible()[0] ?? null);
    };

    const move = (by: number | "first" | "last") => {
      const all = visible();
      if (!all.length) return;
      let index: number;
      if (by === "first") index = 0;
      else if (by === "last") index = all.length - 1;
      else index = (all.indexOf(current!) + by + all.length) % all.length;
      if (!current && typeof by === "number") index = by > 0 ? 0 : all.length - 1;
      highlight(all[index]!);
    };

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
      if (item && item !== current && !item.hidden && item.getAttribute("aria-disabled") !== "true") highlight(item, false);
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
          if (!current) return;
          current.click();
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
        if (bare && editable(e.target)) return;
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
    if (!current) highlight(visible()[0] ?? null, false);
  });
}
