// Usage: <div data-dismissible> ... <button data-dismiss>×</button></div>

import { queryAll } from "../../utils/dom";

export function initDismissible(root: ParentNode) {
  queryAll(root, "[data-dismissible]:not([data-init])").forEach((el) => {
    el.dataset.init = "";
    el.querySelector("[data-dismiss]")?.addEventListener("click", () => el.remove());
  });
}
