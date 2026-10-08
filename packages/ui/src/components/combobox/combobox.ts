// Combobox: a text input that filters a list of suggestions. Markup: see combobox.css.
// - Focus stays in the input. Typing opens the list and filters it; ↓ ↑ move the highlight
//   (aria-activedescendant), Enter picks, Escape closes, Tab or a click outside closes.
// - Filtering ignores case and accents and matches every word typed, anywhere in an option's
//   label or its data-keywords. Groups ([role=group]) with no match hide, and so do separators
//   left with nothing on one side. data-filter="none" leaves filtering to the server (htmx).
// - data-autohighlight highlights the first match as you type, so Enter takes it.
// - Single: picking writes the label into the input and closes; leaving with other text puts
//   the label back, leaving it empty clears the choice.
// - data-multiple: picking toggles the option and keeps the list open; picks show as chips in
//   [data-combobox-chips], Backspace in an empty input removes the last one.
// - The choice is kept here, not in the options, so it survives a list swapped in by htmx.
//   Options marked aria-selected="true" in the markup are the starting choice.
// - [data-combobox-value]: a hidden field with the value (multiple: one field per value, same
//   name). [data-combobox-clear] clears, shown only when there is something to clear.
//   [data-combobox-toggle] opens and closes the list.
// - Every change fires a bubbling "combobox:change" with detail { value, label, values, labels }.
import { queryAll } from "../../utils/dom";
import { dismissable } from "../../utils/dismiss";
import { activeDescendant, filterOptions, OPTION, optionLabel, reachable } from "../../utils/listbox";
import { place } from "../../utils/position";
import { ensureId } from "../../utils/shared";

type Choice = { value: string; label: string };


export function initCombobox(root: ParentNode) {
  queryAll(root, "[data-combobox]:not([data-init])").forEach((box) => {
    box.dataset.init = "";
    const input = box.querySelector<HTMLInputElement>("[data-combobox-input]");
    const popup = box.querySelector<HTMLElement>('[role="listbox"]');
    if (!input || !popup) return;

    const multiple = box.hasAttribute("data-multiple");
    const autoHighlight = box.hasAttribute("data-autohighlight");
    const filtering = box.dataset.filter !== "none";
    const clear = box.querySelector<HTMLButtonElement>("[data-combobox-clear]");
    const toggle = box.querySelector<HTMLButtonElement>("[data-combobox-toggle]");
    const chips = box.querySelector<HTMLElement>("[data-combobox-chips]");
    const field = box.querySelector<HTMLInputElement>("[data-combobox-value]");
    const placeholder = input.placeholder;
    // Multiple values submit as one hidden field each, cloned from the one in the markup.
    if (multiple) field?.remove();

    ensureId(popup, "combobox");
    input.setAttribute("role", "combobox");
    input.setAttribute("aria-controls", popup.id);
    input.setAttribute("aria-expanded", "false");
    input.setAttribute("aria-autocomplete", "list");
    input.autocomplete = "off";
    if (multiple) popup.setAttribute("aria-multiselectable", "true");
    if (input.disabled) for (const b of [clear, toggle]) if (b) b.disabled = true;

    const all = () => [...popup!.querySelectorAll<HTMLElement>(OPTION)];
    // What the keyboard can reach: not filtered out, not in a hidden group, not disabled.
    const options = () => reachable(popup!);
    const label = optionLabel;
    const valueOf = (o: HTMLElement) => o.getAttribute("value") ?? label(o);
    const choiceOf = (o: HTMLElement): Choice => ({ value: valueOf(o), label: label(o) });
    const isChosen = (value: string) => chosen.some((c) => c.value === value);

    let chosen: Choice[] = all()
      .filter((o) => o.getAttribute("aria-selected") === "true")
      .map(choiceOf)
      .slice(0, multiple ? undefined : 1);
    const initial = [...chosen];
    const list = activeDescendant(input, { all, options });
    const highlight = list.highlight;

    // Options carry the choice as aria-selected, and an id for aria-activedescendant.
    function mark() {
      all().forEach((o, i) => {
        o.id ||= `${popup!.id}-option-${i}`;
        o.setAttribute("aria-selected", String(isChosen(valueOf(o))));
      });
    }

    function filter(query: string) {
      const shown = filterOptions(popup!, query, { match: filtering, separator: "[role='separator'], .combobox-separator" });
      const empty = box.querySelector<HTMLElement>("[data-combobox-empty]");
      if (empty) empty.hidden = shown > 0;
    }

    // After typing or a new list: keep the highlight if it is still there, or take the first.
    function rehighlight() {
      const reach = options();
      const active = list.active;
      highlight(autoHighlight ? reach[0] : active && reach.includes(active) ? active : null);
    }

    function sync() {
      mark();
      if (multiple) {
        for (const el of box.querySelectorAll("input[data-combobox-value]")) el.remove();
        for (const c of chosen) {
          if (!field) break;
          const hidden = field.cloneNode() as HTMLInputElement;
          hidden.value = c.value;
          box.append(hidden);
        }
        if (chips) {
          for (const el of chips.querySelectorAll(".combobox-chip")) el.remove();
          for (const c of chosen) {
            const chip = document.createElement("span");
            chip.className = "combobox-chip";
            chip.dataset.value = c.value;
            const remove = document.createElement("button");
            remove.type = "button";
            remove.className = "combobox-chip-remove";
            remove.tabIndex = -1;
            remove.disabled = input!.disabled;
            remove.setAttribute("aria-label", `Remove ${c.label}`);
            chip.append(c.label, remove);
            chips.insertBefore(chip, input!.parentElement === chips ? input! : null);
          }
        }
        input!.placeholder = chosen.length ? "" : placeholder;
      } else if (field) field.value = chosen[0]?.value ?? "";
      showClear();
      box.toggleAttribute("data-filled", chosen.length > 0);
    }
    const showClear = () => {
      if (clear) clear.hidden = input!.disabled || (!chosen.length && !input!.value);
    };

    function changed() {
      sync();
      box.dispatchEvent(
        new CustomEvent("combobox:change", {
          bubbles: true,
          detail: {
            value: chosen[0]?.value ?? "",
            label: chosen[0]?.label ?? "",
            values: chosen.map((c) => c.value),
            labels: chosen.map((c) => c.label),
          },
        }),
      );
    }

    // A pointer down outside or focus leaving the combobox closes the list.
    const dismiss = dismissable(box, () => close());
    function open() {
      if (!popup!.hidden) return;
      popup!.hidden = false;
      input!.setAttribute("aria-expanded", "true");
      dismiss.opened();
      mark();
      // Single: the input shows the current label, which is not a search, so list everything.
      filter(multiple ? input!.value : "");
      const reach = options();
      highlight(autoHighlight ? reach[0] : (reach.find((o) => isChosen(valueOf(o))) ?? null));
      place(popup!, box);
    }
    function close() {
      if (popup!.hidden) return;
      popup!.hidden = true;
      input!.setAttribute("aria-expanded", "false");
      dismiss.closed();
      highlight(null);
      if (multiple) input!.value = "";
      else if (!input!.value.trim() && chosen.length) {
        chosen = [];
        changed();
      } else input!.value = chosen[0]?.label ?? "";
      showClear();
    }

    function pick(option: HTMLElement) {
      const choice = choiceOf(option);
      if (multiple) {
        chosen = isChosen(choice.value) ? chosen.filter((c) => c.value !== choice.value) : [...chosen, choice];
        input!.value = "";
        filter("");
        highlight(option, false);
      } else {
        chosen = [choice];
        input!.value = choice.label;
        close();
      }
      changed();
    }

    input.addEventListener("input", () => {
      open();
      filter(input.value);
      rehighlight();
      showClear();
    });
    input.addEventListener("click", open);
    input.addEventListener("keydown", (e) => {
      const closed = popup.hidden;
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (closed) open();
        if (!closed || !list.active) list.move(e.key === "ArrowDown" ? 1 : -1);
      } else if (e.key === "Enter" && !closed && list.active) {
        e.preventDefault();
        pick(list.active);
      } else if (e.key === "Escape" && !closed) {
        e.preventDefault();
        close();
      } else if (e.key === "Tab") close();
      else if (e.key === "Backspace" && multiple && !input.value && chosen.length) {
        chosen = chosen.slice(0, -1);
        changed();
      }
    });

    // Clicks on the list, chips and buttons must not take focus from the input; the highlight
    // follows the pointer over the list.
    list.bindPointer(popup);
    for (const el of [chips, clear, toggle]) {
      el?.addEventListener("mousedown", (e) => {
        if (e.target !== input) e.preventDefault();
      });
    }
    popup.addEventListener("click", (e) => {
      const option = (e.target as Element).closest<HTMLElement>(OPTION);
      if (option && options().includes(option)) pick(option);
    });
    chips?.addEventListener("click", (e) => {
      const remove = (e.target as Element).closest(".combobox-chip-remove");
      const value = remove?.closest<HTMLElement>(".combobox-chip")?.dataset.value;
      if (value !== undefined) {
        chosen = chosen.filter((c) => c.value !== value);
        changed();
      }
      input.focus();
    });
    clear?.addEventListener("click", () => {
      chosen = [];
      input.value = "";
      filter("");
      rehighlight();
      changed();
      input.focus();
    });
    toggle?.addEventListener("click", () => {
      if (popup.hidden) open();
      else close();
      input.focus();
    });
    input.form?.addEventListener("reset", () => {
      chosen = [...initial];
      // The form puts the input's own value back after this event; ours goes on top.
      setTimeout(() => {
        input.value = multiple ? "" : (chosen[0]?.label ?? "");
        sync();
      });
    });

    // A list swapped in by htmx (data-filter="none" with a server search) gets the choice
    // marked, the filter and the highlight applied.
    new MutationObserver(() => {
      mark();
      if (popup.hidden) return;
      filter(filtering ? input.value : "");
      rehighlight();
    }).observe(popup, { childList: true, subtree: true });

    sync();
    if (!multiple && chosen[0] && !input.value) input.value = chosen[0].label;
    showClear();
  });
}
