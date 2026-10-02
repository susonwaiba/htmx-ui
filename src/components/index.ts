// UI component library: behaviour for components (styles live in the matching .css files).
// Register each component's init here; called once on load and after every htmx swap.
import { initAccordion } from "./accordion/accordion";
import { initCode } from "./code/code";
import { initDismissible } from "./dismissible/dismissible";
import { initDropdown } from "./dropdown/dropdown";
import { initPopover } from "./popover/popover";
import { initSidebar } from "./sidebar/sidebar";
import { initTabs } from "./tabs/tabs";
import { initToggle } from "./toggle/toggle";
import { initToggleGroup } from "./toggle-group/toggle-group";

export function initComponents(root: ParentNode = document) {
  initTabs(root);
  initAccordion(root);
  initCode(root);
  initDismissible(root);
  initDropdown(root);
  initPopover(root);
  initSidebar(root);
  initToggle(root);
  initToggleGroup(root);
}
