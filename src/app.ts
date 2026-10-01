import "htmx.org"; // registers window.htmx
import "./styles/app.css";
import { initComponents } from "./components";
import { initTheme } from "./features/theme";
import { initYear } from "./features/year";

function init(root: ParentNode = document) {
  initComponents(root);
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initYear();
  init();
});

// Re-initialise components inside content swapped in by htmx
document.addEventListener("htmx:after:swap", (e) => {
  init((e.target as ParentNode) ?? document);
});
