// Client entry, loaded by layouts/base.html: htmx, styles, and component behaviours.
import "htmx.org"; // registers window.htmx
import "./styles.css";
import { initComponents } from "htmx-ui";
import { initTheme } from "htmx-ui/theme";

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initComponents(document);
});

// Wire up components inside content swapped in by htmx (htmx 4 fires this on each new element).
document.addEventListener("htmx:after:process", (e) => {
  initComponents((e.target as ParentNode) ?? document);
});
