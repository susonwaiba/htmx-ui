// UI component library: behaviour for components (styles live in the matching .css files).
// Register each component's init here; called once on load and after every htmx swap.
import { initDismissible } from "./dismissible";

export function initComponents(root: ParentNode = document) {
  initDismissible(root);
}
