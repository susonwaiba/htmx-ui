// htmx-ui: component behaviours.
//   import { initComponents } from "htmx-ui";   wire up components under a root
//   import "htmx-ui/styles.css";                tokens, dark variant, component styles
//   import { initTheme } from "htmx-ui/theme";  light/dark switcher
// `export *`, not `export { initComponents }`: Bun's bundler drops named re-exports
// from a package with a "sideEffects" list, leaving lib/index.js empty. The
// release check imports lib/ to catch that.
export * from "./components";

// Component APIs for script: toast(), the carousel's Embla instance and plugin registry, the
// command menu's matcher, getMessageScroller(), scrollToEdge(). `export *` for the same reason.
export * from "./components/carousel/carousel";
export * from "./components/command/command";
export * from "./components/message-scroller/message-scroller";
export * from "./components/scroll-button/scroll-button";
export * from "./components/toast/toast";

// Utilities for advanced usage: queryAll(root, selector), which includes root itself.
// `export *` for the same reason as above (a named re-export left queryAll undeclared in lib/).
export * from "./utils/dom";

// Keyboard shortcuts: matchesHotkey(event, "mod+k"), as data-command-hotkey uses.
export * from "./utils/hotkey";
