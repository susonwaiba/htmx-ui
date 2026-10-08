// 0.1.x -> 0.2.0. Breaking changes: CHANGELOG.md "## 0.2.0", /docs/changelog/0.2.0.
import { any, CONFIG, defineMigration, MARKUP, renameAttribute, renameClass, replace, SCRIPT, STYLE, warn } from "../transforms";

export default defineMigration({
  version: "0.2.0",
  changes: [
    // templates is now roots
    replace("htmx-ui.config: templates → roots", any(CONFIG), /(?<![\w.$])templates(\s*:)/g, (_, colon: string) => `roots${colon}`),
    warn(/\btemplateRoots\b/, "ResolvedConfig.templateRoots is gone; read config.roots (entries are { name?, dir })", any(SCRIPT)),

    // The sidebar is a composable app sidebar
    renameClass("sidebar-link", "sidebar-menu-button", { note: 'in a <li class="sidebar-menu-item"> of a <ul class="sidebar-menu">' }),
    renameClass("sidebar-label", "sidebar-group-label"),
    renameAttribute("data-sidebar-toggle", "data-sidebar-trigger"),
    warn(/(?<![\w-])sidebar-backdrop(?![\w-])/, ".sidebar-backdrop is gone: wrap the sidebar and its main area in .sidebar-layout, which draws the backdrop", any(MARKUP, SCRIPT, STYLE)),
    warn(/(?<![\w-])data-sidebar-close(?![\w-])/, "[data-sidebar-close] is now for close buttons inside the sidebar panel; the backdrop comes from .sidebar-layout", any(MARKUP, SCRIPT)),
  ],
  notes: [
    "The sidebar's links go in lists now: <ul class=\"sidebar-menu\"><li class=\"sidebar-menu-item\"><a class=\"sidebar-menu-button\">. For the 0.1 look (a sticky column from lg), set data-collapsible=\"none\" data-breakpoint=\"lg\", --sidebar-top: 3.5rem and --sidebar-width: 15rem. See /docs/components/sidebar.",
    "roots[0] is the project root: keep your project directory first in roots unless it already is.",
  ],
});
