// UI component library: behaviour for components (styles live in the matching .css files).
// Register each component's init here; called once on load and after every htmx swap.
import { initCode } from "./code/code";
import { initDismissible } from "./dismissible/dismissible";
import { initDropdown } from "./dropdown/dropdown";
import { initSidebar } from "./sidebar/sidebar";
import { initTabs } from "./tabs/tabs";

export function initComponents(root: ParentNode = document) {
  initTabs(root);
  initCode(root);
  initDismissible(root);
  initDropdown(root);
  initSidebar(root);
}
