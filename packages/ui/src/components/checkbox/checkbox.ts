// Checkbox: [data-indeterminate] paints the mixed state of a parent box whose children
// are partly checked. The state is a DOM property, not an attribute, so HTML can't set
// it; this sets it on init and clears it when the box is clicked, as browsers do.
// Styles: see checkbox.css.
import { queryAll } from "../../utils/dom";

export function initCheckbox(root: ParentNode) {
  queryAll<HTMLInputElement>(root, ".checkbox[data-indeterminate]:not([data-init])").forEach((el) => {
    el.dataset.init = "";
    el.indeterminate = true;
    el.addEventListener("change", () => {
      el.indeterminate = false;
    });
  });
}