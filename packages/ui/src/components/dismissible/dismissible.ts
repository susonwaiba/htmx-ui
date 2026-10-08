// Usage: <div data-dismissible> ... <button data-dismiss>×</button></div>
// - Any [data-dismiss] inside removes the element (the nearest [data-dismissible] around it, so
//   dismissibles can nest). Buttons added later work too: the click is delegated.
// - Fires a bubbling, cancelable "dismissible:dismiss" first; preventDefault() keeps the element.
// - Sets data-state="closing", so CSS can transition it out, and removes it once the transition
//   is over (at once without one).
import { queryAll } from "../../utils/dom";
import { transitionTime } from "../../utils/shared";

export function initDismissible(root: ParentNode) {
  queryAll(root, "[data-dismissible]:not([data-init])").forEach((el) => {
    el.dataset.init = "";
    el.addEventListener("click", (e) => {
      const button = (e.target as Element).closest("[data-dismiss]");
      if (!button || button.closest("[data-dismissible]") !== el || el.dataset.state === "closing") return;
      if (!el.dispatchEvent(new CustomEvent("dismissible:dismiss", { bubbles: true, cancelable: true }))) return;
      el.dataset.state = "closing";
      const wait = getComputedStyle(el).transitionDuration ? transitionTime(el) : 0;
      if (wait > 0) setTimeout(() => el.remove(), wait);
      else el.remove();
    });
  });
}
