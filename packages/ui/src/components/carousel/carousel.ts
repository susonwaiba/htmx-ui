// Carousel, on Embla Carousel (embla-carousel, loaded on demand: pages without a carousel never
// download it). Markup: see carousel.css.
// - data-carousel-options='{"loop": true, "align": "start"}': Embla options (JSON), passed as is.
//   data-orientation="vertical" sets axis "y". RTL pages scroll right to left.
// - data-carousel-plugins='{"autoplay": {"delay": 4000}}': plugins by name, with their options.
//   Register a plugin once, before the carousels initialise:
//     import Autoplay from "embla-carousel-autoplay";
//     registerCarouselPlugin("autoplay", Autoplay);
// - [data-carousel-prev] / [data-carousel-next] scroll and disable themselves at the ends;
//   an empty [data-carousel-dots] gets a button per snap point, aria-current on the selected one.
// - Arrow keys scroll when focus is in the carousel (Up/Down when vertical).
// - getCarousel(el) returns the Embla API once it's ready; the carousel fires carousel:init
//   (detail: { api }) then, and carousel:select (detail: { index, api }) when the slide changes.
import type { EmblaCarouselType, EmblaOptionsType, EmblaPluginType } from "embla-carousel";
import { queryAll } from "../../utils/dom";

// Each plugin factory takes its own options type.
type PluginFactory = (options?: any) => EmblaPluginType;

const plugins = new Map<string, PluginFactory>();
const instances = new WeakMap<HTMLElement, EmblaCarouselType>();

/** Make a plugin available to data-carousel-plugins under `name`. */
export function registerCarouselPlugin(name: string, factory: PluginFactory) {
  plugins.set(name, factory);
}

/** The Embla API of a [data-carousel] element (undefined until it has loaded). */
export function getCarousel(el: Element | null): EmblaCarouselType | undefined {
  const carousel = el?.closest<HTMLElement>("[data-carousel]");
  return carousel ? instances.get(carousel) : undefined;
}

function parse<T>(json: string | undefined, what: string, el: HTMLElement): T | undefined {
  if (!json) return undefined;
  try {
    return JSON.parse(json) as T;
  } catch {
    console.warn(`htmx-ui carousel: ${what} is not valid JSON`, el);
    return undefined;
  }
}

async function setup(carousel: HTMLElement) {
  const viewport = carousel.querySelector<HTMLElement>("[data-carousel-viewport], .carousel-viewport");
  if (!viewport) return;
  const vertical = carousel.dataset.orientation === "vertical";
  const rtl = getComputedStyle(carousel).direction === "rtl";
  const options: EmblaOptionsType = {
    axis: vertical ? "y" : "x",
    ...(rtl && !vertical ? { direction: "rtl" as const } : {}),
    ...parse<EmblaOptionsType>(carousel.dataset.carouselOptions, "data-carousel-options", carousel),
  };
  const wanted = parse<Record<string, unknown>>(carousel.dataset.carouselPlugins, "data-carousel-plugins", carousel) ?? {};
  const list = Object.entries(wanted).flatMap(([name, opts]) => {
    const factory = plugins.get(name);
    if (!factory) {
      console.warn(`htmx-ui carousel: no plugin registered as "${name}" (registerCarouselPlugin)`, carousel);
      return [];
    }
    return [factory(opts && typeof opts === "object" ? opts : undefined)];
  });

  const { default: EmblaCarousel } = await import("embla-carousel");
  if (!carousel.isConnected) return;
  const api = EmblaCarousel(viewport, options, list);
  instances.set(carousel, api);

  // Accessible names for the region and its slides
  if (!carousel.hasAttribute("role")) carousel.setAttribute("role", "region");
  if (!carousel.hasAttribute("aria-roledescription")) carousel.setAttribute("aria-roledescription", "carousel");
  const label = () =>
    api.slideNodes().forEach((slide, i, all) => {
      if (!slide.hasAttribute("role")) slide.setAttribute("role", "group");
      if (!slide.hasAttribute("aria-roledescription")) slide.setAttribute("aria-roledescription", "slide");
      if (!slide.hasAttribute("aria-label") || slide.dataset.carouselLabel !== undefined) {
        slide.setAttribute("aria-label", `${i + 1} of ${all.length}`);
        slide.dataset.carouselLabel = "";
      }
    });

  const prev = [...carousel.querySelectorAll<HTMLButtonElement>("[data-carousel-prev]")];
  const next = [...carousel.querySelectorAll<HTMLButtonElement>("[data-carousel-next]")];
  prev.forEach((b) => b.addEventListener("click", () => api.scrollPrev()));
  next.forEach((b) => b.addEventListener("click", () => api.scrollNext()));

  const dots = carousel.querySelector<HTMLElement>("[data-carousel-dots]");
  const buildDots = () => {
    if (!dots) return;
    dots.replaceChildren(
      ...api.scrollSnapList().map((_, i) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "carousel-dot";
        dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
        dot.addEventListener("click", () => api.scrollTo(i));
        return dot;
      }),
    );
  };

  const sync = () => {
    prev.forEach((b) => (b.disabled = !api.canScrollPrev()));
    next.forEach((b) => (b.disabled = !api.canScrollNext()));
    const index = api.selectedScrollSnap();
    dots?.querySelectorAll("button").forEach((dot, i) => {
      if (i === index) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });
    carousel.dispatchEvent(new CustomEvent("carousel:select", { detail: { index, api } }));
  };

  api.on("select", sync);
  api.on("reInit", () => {
    label();
    buildDots();
    sync();
  });
  label();
  buildDots();
  sync();

  carousel.addEventListener("keydown", (e) => {
    const target = e.target as HTMLElement;
    if (/^(input|textarea|select)$/i.test(target.tagName) || target.isContentEditable) return;
    const [back, forward] = vertical ? ["ArrowUp", "ArrowDown"] : rtl ? ["ArrowRight", "ArrowLeft"] : ["ArrowLeft", "ArrowRight"];
    if (e.key === back) api.scrollPrev();
    else if (e.key === forward) api.scrollNext();
    else return;
    e.preventDefault();
  });

  carousel.dataset.carouselReady = "";
  carousel.dispatchEvent(new CustomEvent("carousel:init", { detail: { api } }));
}

export function initCarousel(root: ParentNode) {
  queryAll(root, "[data-carousel]:not([data-init])").forEach((carousel) => {
    carousel.dataset.init = "";
    setup(carousel).catch((error) => console.error("htmx-ui carousel:", error));
  });
}
