// Shared by the listbox components: select, combobox, command and prompt input.
import { isDisabled } from "./shared";

export const OPTION = '[role="option"]';

/** Lowercased, accents folded: "Zürich" matches "zurich". */
export const normalize = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

/** The text an option shows in its trigger: data-label when it holds markup (a flag, a badge). */
export const optionLabel = (o: Element) => o.getAttribute("data-label") ?? o.textContent?.trim() ?? "";

/** Every word of `query` is somewhere in `text` (both already normalised). */
export const matchWords = (text: string, query: string) =>
  query
    .split(/\s+/)
    .filter(Boolean)
    .every((w) => text.includes(w));

/** The options in `popup` a user can reach: not filtered out, not in a hidden group, not disabled. */
export const reachable = (popup: ParentNode, option = OPTION) =>
  [...popup.querySelectorAll<HTMLElement>(option)].filter(
    (o) => !o.hidden && !o.closest("[role='group'][hidden]") && !isDisabled(o),
  );

export interface FilterOptions {
  /** false: show everything (the server filters) but still tidy groups and separators. */
  match?: boolean;
  /** Does an option's text match the query? Both are normalised first. Default: every word. */
  matches?: (text: string, query: string) => boolean;
  /** The text an option is matched on. Default: its label and data-keywords. */
  text?: (option: HTMLElement) => string;
  option?: string;
  group?: string;
  separator?: string;
}

/**
 * Filters the options in `popup` by `query`. Groups with nothing left in them hide, and a
 * separator shows only with something visible both before and after it. Returns how many
 * options are showing.
 */
export function filterOptions(
  popup: HTMLElement,
  query: string,
  {
    match = true,
    matches = matchWords,
    text = (o) => `${optionLabel(o)} ${o.dataset.keywords ?? ""}`,
    option = OPTION,
    group = "[role='group']",
    separator = "[role='separator']",
  }: FilterOptions = {},
): number {
  const q = normalize(query.trim());
  let shown = 0;
  for (const o of popup.querySelectorAll<HTMLElement>(option)) {
    o.hidden = match && !!q && !matches(normalize(text(o)), q);
    if (!o.hidden) shown++;
  }
  for (const g of popup.querySelectorAll<HTMLElement>(group)) {
    g.hidden = !g.querySelector(`:is(${option}):not([hidden])`);
  }
  let seen = false;
  let pending: HTMLElement | null = null;
  for (const el of popup.children as HTMLCollectionOf<HTMLElement>) {
    if (el.matches(separator)) {
      el.hidden = true;
      if (seen) pending = el;
    } else if (!el.hidden && el.matches(`${option}, ${group}`)) {
      if (pending) pending.hidden = false;
      pending = null;
      seen = true;
    }
  }
  return shown;
}

/** Scrolls the nearest scrolling list around `el` so `el` is in view, never the page. */
export function scrollIntoList(el: HTMLElement) {
  let list = el.parentElement;
  while (list && list.scrollHeight <= list.clientHeight) list = list.parentElement;
  if (!list || list === document.body || list === document.documentElement) return;
  const r = el.getBoundingClientRect();
  const l = list.getBoundingClientRect();
  if (r.top < l.top) list.scrollTop -= l.top - r.top;
  else if (r.bottom > l.bottom) list.scrollTop += r.bottom - l.bottom;
}

export interface ActiveDescendant {
  /** The highlighted option, if any. */
  readonly active: HTMLElement | null;
  /** Highlight `option` (or nothing), scrolling it into view in its list unless `scroll` is false. */
  highlight(option: HTMLElement | null | undefined, scroll?: boolean): void;
  /** Move the highlight by one (wrapping), or to the first or last option. */
  move(by: 1 | -1 | "first" | "last"): void;
  /** Follow the pointer over `popup`, and keep clicks on it from taking focus from the owner. */
  bindPointer(popup: HTMLElement): void;
}

/**
 * The highlight of a listbox whose focus stays in `owner` (an input or textarea): the highlighted
 * option gets data-highlighted, and `owner` aria-activedescendant. `options()` are the ones the
 * highlight can reach, `all()` every option it may have to clear. With `select`, the highlight
 * is also aria-selected (the command menu, where the highlighted item is the one Enter takes).
 */
export function activeDescendant(
  owner: HTMLElement,
  { all, options, select = false }: { all: () => HTMLElement[]; options: () => HTMLElement[]; select?: boolean },
): ActiveDescendant {
  let active: HTMLElement | null = null;
  let prefixed = 0;
  const api: ActiveDescendant = {
    get active() {
      return active;
    },
    highlight(option, scroll = true) {
      active = option ?? null;
      for (const o of all()) {
        o.toggleAttribute("data-highlighted", o === active);
        if (select) o.setAttribute("aria-selected", String(o === active));
      }
      if (!active) return owner.removeAttribute("aria-activedescendant");
      active.id ||= `${owner.id || "listbox"}-option-${++prefixed}`;
      owner.setAttribute("aria-activedescendant", active.id);
      if (scroll) scrollIntoList(active);
    },
    move(by) {
      const list = options();
      if (!list.length) return;
      const i = active ? list.indexOf(active) : -1;
      const to =
        by === "first" ? 0 : by === "last" ? list.length - 1 : i < 0 ? (by > 0 ? 0 : list.length - 1) : (i + by + list.length) % list.length;
      api.highlight(list[to]);
    },
    bindPointer(popup) {
      popup.addEventListener("mousedown", (e) => {
        if (e.target !== owner) e.preventDefault();
      });
      popup.addEventListener("mousemove", (e) => {
        const option = (e.target as Element).closest<HTMLElement>(OPTION);
        if (option && option !== active && options().includes(option)) api.highlight(option, false);
      });
    },
  };
  return api;
}
