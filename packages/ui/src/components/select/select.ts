// Select: a listbox in a popup, opened from a button trigger. Markup: see select.css.
// - The trigger toggles the listbox and keeps aria-expanded in sync.
// - ↓/↑ on the trigger open on the picked option (or the first/last); ↓ ↑ Home End move
//   between options; Enter or Space picks the focused one; Escape closes and returns focus.
// - Clicking outside, tabbing away, or picking an option closes it.
// - Picking marks the option aria-selected, copies its text into the trigger's
//   .select-value, mirrors its value into a [data-select-input] hidden field and fires
//   a bubbling "select:change" with detail { value, label, option }.
// - A [data-select-search] input filters the options as you type, and reveals [data-select-empty]
//   when nothing matches. A preselected option fills the trigger and the hidden field on load.
// Options are looked up on every event, so lists filled in from fetched data keep working.
import { queryAll } from "../../utils/dom";

let ids = 0;

export function initSelect(root: ParentNode) {
  queryAll(root, "[data-select]:not([data-init])").forEach((select) => {
    select.dataset.init = "";
    const trigger = select.querySelector<HTMLElement>("[data-select-trigger]");
    const popup = select.querySelector<HTMLElement>('[role="listbox"]');
    if (!trigger || !popup) return;

    const search = select.querySelector<HTMLInputElement>("[data-select-search]");
    const empty = select.querySelector<HTMLElement>("[data-select-empty]");
    const field = select.querySelector<HTMLInputElement>("[data-select-input]");
    const value = trigger.querySelector<HTMLElement>(".select-value, [data-select-value]");

    popup.id ||= `select-${++ids}`;
    trigger.setAttribute("aria-controls", popup.id);
    trigger.setAttribute("aria-expanded", String(!popup.hidden));

    const all = () => [...popup!.querySelectorAll<HTMLElement>('[role="option"]')];
    // Filtered out (hidden) and unavailable options are not choices.
    const options = () => all().filter((o) => !o.hidden && o.getAttribute("aria-disabled") !== "true");
    const chosen = () => all().find((o) => o.getAttribute("aria-selected") === "true");
    // data-label when the option holds markup (a flag, a badge) the trigger should not repeat.
    const label = (o: HTMLElement) => o.getAttribute("data-label") ?? o.textContent?.trim() ?? "";
    // Options take focus as the arrow keys move, so they need to be focusable: a span is not.
    // Done on open as well, so a list swapped in by htmx is ready before it is used.
    const focusable = () => all().forEach((o) => o.setAttribute("tabindex", "-1"));

    const onOutside = (e: PointerEvent) => {
      if (!select.contains(e.target as Node)) close(false);
    };
    function open(focus?: "first" | "last") {
      popup!.hidden = false;
      trigger!.setAttribute("aria-expanded", "true");
      document.addEventListener("pointerdown", onOutside);
      focusable();
      if (search) search.focus();
      else if (focus === "last") options().at(-1)?.focus();
      else (chosen() ?? options().at(0))?.focus();
    }
    function close(refocus: boolean) {
      if (popup!.hidden) return;
      popup!.hidden = true;
      trigger!.setAttribute("aria-expanded", "false");
      document.removeEventListener("pointerdown", onOutside);
      if (search) {
        search.value = "";
        filter("");
      }
      if (refocus) trigger!.focus();
    }

    function filter(q: string) {
      const needle = q.trim().toLowerCase();
      let shown = 0;
      for (const o of all()) {
        o.hidden = !!needle && !label(o).toLowerCase().includes(needle);
        if (!o.hidden) shown++;
      }
      if (empty) empty.hidden = !needle || shown > 0;
    }

    function pick(option: HTMLElement) {
      for (const o of all()) o.setAttribute("aria-selected", String(o === option));
      const text = label(option);
      const val = option.getAttribute("value") ?? text;
      if (value) value.textContent = text;
      if (field) field.value = val;
      close(true);
      select!.dispatchEvent(new CustomEvent("select:change", { bubbles: true, detail: { value: val, label: text, option } }));
    }

    trigger.addEventListener("click", () => (popup!.hidden ? open() : close(false)));
    trigger.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        open(e.key === "ArrowDown" ? "first" : "last");
      }
    });

    popup.addEventListener("keydown", (e) => {
      const list = options();
      const i = list.indexOf(document.activeElement as HTMLElement);
      if (e.key === "Escape") {
        e.preventDefault();
        close(true);
        return;
      }
      if (e.key === "Tab") return close(false);
      // In the filter box, ↓/↓ moves into the options and Home/End stay with the caret.
      const step = { ArrowDown: 1, ArrowUp: -1 }[e.key];
      const jump = { Home: 0, End: list.length - 1 }[e.key];
      if (step !== undefined) {
        e.preventDefault();
        const to = i < 0 ? (step > 0 ? 0 : list.length - 1) : (i + step + list.length) % list.length;
        list[to]?.focus();
      } else if (jump !== undefined && i >= 0) {
        e.preventDefault();
        list[jump]?.focus();
      } else if ((e.key === "Enter" || e.key === " ") && i >= 0) {
        e.preventDefault();
        pick(list[i]!);
      }
    });
    popup.addEventListener("click", (e) => {
      const option = (e.target as Element).closest<HTMLElement>('[role="option"]');
      if (option && options().includes(option)) pick(option);
    });
    search?.addEventListener("input", () => filter(search.value));
    select.addEventListener("focusout", (e) => {
      const next = e.relatedTarget as Node | null;
      if (next && !select.contains(next)) close(false);
    });

    // Server-rendered choice: show it in the trigger and hand its value to the form.
    const start = chosen();
    if (start) {
      if (field) field.value = start.getAttribute("value") ?? label(start);
      if (value && !value.textContent?.trim()) value.textContent = label(start);
    }
  });
}
