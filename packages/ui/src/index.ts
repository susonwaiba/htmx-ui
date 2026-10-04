// htmx-ui: component behaviours.
//   import { initComponents } from "htmx-ui";   wire up components under a root
//   import "htmx-ui/styles.css";                tokens, dark variant, component styles
//   import { initTheme } from "htmx-ui/theme";  light/dark switcher
// `export *`, not `export { initComponents }`: Bun's bundler drops named re-exports
// from a package with a "sideEffects" list, leaving lib/index.js empty. The
// release check imports lib/ to catch that.
export * from "./components";

// Utilities for advanced usage
export { queryAll } from "./utils/dom";
