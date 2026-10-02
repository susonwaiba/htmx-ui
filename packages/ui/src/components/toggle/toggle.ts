// Toggle: [data-toggle] buttons flip aria-pressed on click and fire a bubbling
// "toggle:change" event with detail { pressed }. Styles: see toggle.css.
// Buttons inside a [data-toggle-group] are handled by the group instead.
import { queryAll } from "../../utils/dom";

export function initToggle(root: ParentNode) {
  queryAll(root, "[data-toggle]:not([data-init])").forEach((el) => {
    el.dataset.init = "";
    if (!el.hasAttribute("aria-pressed")) el.setAttribute("aria-pressed", "false");
    el.addEventListener("click", () => {
      if (el.closest("[data-toggle-group]")) return;
      const pressed = el.getAttribute("aria-pressed") !== "true";
      el.setAttribute("aria-pressed", String(pressed));
      el.dispatchEvent(new CustomEvent("toggle:change", { bubbles: true, detail: { pressed } }));
    });
  });
}
