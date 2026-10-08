import "htmx.org"; // registers window.htmx
import "./styles/app.css";
import Autoplay from "embla-carousel-autoplay";
import { initComponents, queryAll, registerCarouselPlugin, registerPreserveScroll, registerSidebarActiveScroll } from "htmx-ui";
import { initTheme } from "htmx-ui/theme";
import { initSearch } from "htmx-ui-plugin-search/client";
import { initVersions } from "htmx-ui-plugin-versions/client";
import { initChatDemo } from "./features/chat-demo";
import { initYear } from "./features/year";

// Carousel plugins, by the name data-carousel-plugins uses (the carousel docs demo autoplay)
registerCarouselPlugin("autoplay", Autoplay);

// htmx extensions: [hx-preserve-scroll] (the /docs/preserve-scroll demo), and the docs
// sidebar keeping its scroll across boosted navigations and its current page in view
registerPreserveScroll();
registerSidebarActiveScroll();

// Scroll-in entrances for .reveal elements; null when the browser can't observe.
let revealObserver: IntersectionObserver | null = null;

if ("IntersectionObserver" in window) {
  revealObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        revealObserver?.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
  );
}

/** Reveals (.reveal) and the pointer-tracked glow on [data-spotlight] cards. */
function initPage(root: ParentNode) {
  queryAll<HTMLElement>(root, ".reveal:not([data-reveal-ready])").forEach((el) => {
    el.dataset.revealReady = "";
    if (!revealObserver) el.classList.add("is-visible");
    else revealObserver.observe(el);
  });

  queryAll<HTMLElement>(root, "[data-spotlight]:not([data-spotlight-ready])").forEach((el) => {
    el.dataset.spotlightReady = "";
    el.classList.add("spotlight");
    el.addEventListener("pointermove", (event) => {
      const box = el.getBoundingClientRect();
      el.style.setProperty("--spot-x", `${event.clientX - box.left}px`);
      el.style.setProperty("--spot-y", `${event.clientY - box.top}px`);
    });
  });
}

function init(root: ParentNode = document) {
  initComponents(root);
  initPage(root);
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initYear();
  initChatDemo();
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
