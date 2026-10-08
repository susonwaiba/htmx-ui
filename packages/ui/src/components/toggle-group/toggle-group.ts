// Toggle group: a set of aria-pressed buttons. Markup: see toggle-group.css.
// - data-toggle-group="single": pressing one releases the others (pressing it again releases
//   it too, unless the group has data-toggle-group-required). Any other value: each button
//   toggles on its own.
// - One tab stop for the group; arrow keys, Home and End move between buttons.
// - Fires a bubbling "toggle-group:change" with detail { value }: the pressed buttons'
//   `value` attributes (falling back to their text).
// Buttons are looked up on every event, so buttons swapped in by htmx just work.
import { queryAll } from "../../utils/dom";
import { isRtl, nextIndex } from "../../utils/shared";

const valueOf = (b: HTMLElement) => b.getAttribute("value") ?? b.textContent?.trim() ?? "";

export function initToggleGroup(root: ParentNode) {
  queryAll(root, "[data-toggle-group]:not([data-init])").forEach((group) => {
    group.dataset.init = "";
    const single = group.dataset.toggleGroup === "single";
    const required = group.hasAttribute("data-toggle-group-required");
    const items = () =>
      [...group.querySelectorAll<HTMLElement>("[aria-pressed]")].filter(
        (b) => b.closest("[data-toggle-group]") === group && !b.matches(":disabled, [aria-disabled='true']"),
      );
    const isOn = (b: HTMLElement) => b.getAttribute("aria-pressed") === "true";

    // Roving tabindex: the first pressed button (or the first button) is the tab stop
    const rove = (current?: HTMLElement) => {
      const list = items();
      const stop = current ?? list.find(isOn) ?? list[0];
      list.forEach((b) => (b.tabIndex = b === stop ? 0 : -1));
    };
    rove();

    group.addEventListener("click", (e) => {
      const button = (e.target as Element).closest<HTMLElement>("[aria-pressed]");
      if (!button || !items().includes(button)) return;
      const pressed = !isOn(button);
      if (!pressed && single && required) return;
      if (pressed && single) items().forEach((b) => b.setAttribute("aria-pressed", "false"));
      button.setAttribute("aria-pressed", String(pressed));
      rove(button);
      group.dispatchEvent(
        new CustomEvent("toggle-group:change", { bubbles: true, detail: { value: items().filter(isOn).map(valueOf) } }),
      );
    });

    group.addEventListener("keydown", (e) => {
      const list = items();
      const i = list.indexOf(document.activeElement as HTMLElement);
      if (i < 0) return;
      const next = nextIndex(e.key, i, list.length, { rtl: isRtl(group) });
      if (next === undefined) return;
      e.preventDefault();
      const target = list[next]!;
      rove(target);
      target.focus();
    });
  });
}
