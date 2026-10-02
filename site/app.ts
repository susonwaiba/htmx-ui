import "htmx.org"; // registers window.htmx
import "./styles/app.css";
import { initComponents } from "htmx-ui";
import { initMarkdownCopy } from "./features/markdown-copy";
import { initTheme } from "htmx-ui/theme";
import { initSearch } from "./features/search";
import { initVersions } from "./features/versions";
import { initYear } from "./features/year";

function init(root: ParentNode = document) {
  initComponents(root);
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initYear();
  initMarkdownCopy();
  initVersions();
  initSearch();
  init();
});

// Initialise components inside content swapped in by htmx. htmx 4 fires
// htmx:after:process on each newly inserted element (htmx:after:swap fires on
// the element that made the request, not on the new content).
document.addEventListener("htmx:after:process", (e) => {
  init((e.target as ParentNode) ?? document);
});
