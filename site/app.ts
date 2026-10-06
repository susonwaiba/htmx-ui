import "htmx.org"; // registers window.htmx
import "./styles/app.css";
import Autoplay from "embla-carousel-autoplay";
import { initComponents, registerCarouselPlugin } from "htmx-ui";
import { initTheme } from "htmx-ui/theme";
import { initMarkdownCopy } from "htmx-ui-plugin-docs/client";
import { initSearch } from "htmx-ui-plugin-search/client";
import { initVersions } from "htmx-ui-plugin-versions/client";
import { initChatDemo } from "./features/chat-demo";
import { initYear } from "./features/year";

// Carousel plugins, by the name data-carousel-plugins uses (the carousel docs demo autoplay)
registerCarouselPlugin("autoplay", Autoplay);

function init(root: ParentNode = document) {
  initComponents(root);
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initYear();
  initChatDemo();
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
