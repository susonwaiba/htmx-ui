// Hover card: a preview of what is behind a link, for sighted pointer users. Markup: see hover-card.css.
// - A mouse or pen resting on the trigger ([data-hover-card-trigger], else the first link) opens the card
//   after --hover-card-open-delay (700ms); leaving both the trigger and the card closes it after
//   --hover-card-close-delay (300ms), so the pointer can travel into the card. Touch never opens it:
//   a tap follows the link.
// - Keyboard focus on the trigger opens it at once. It stays open while focus is inside it, so its
//   links can be reached with Tab, and closes when focus leaves.
// - Escape closes any open card (returning focus to the trigger if it was inside the card); it
//   reopens once the pointer comes back or focus moves to the trigger again.
// - Open state is data-open on the wrapper. The card gets "hover-card:open" / "hover-card:close"
//   (bubbling) events, so htmx can load its content on first open: hx-trigger="hover-card:open once".
// - Before opening, a card that would overflow the viewport on its side flips to the opposite side
//   if that has room; data-side on the card is the side it opened on.
// No ARIA role: the card is supplementary to a real link. It is hidden (visibility) while closed.
import { queryAll } from "../../utils/dom";

type Side = "top" | "right" | "bottom" | "left";
const SIDES: Side[] = ["top", "right", "bottom", "left"];
const OPPOSITE: Record<Side, Side> = { top: "bottom", bottom: "top", left: "right", right: "left" };

type Card = { close: (refocus: boolean) => void; root: HTMLElement };
const open = new Set<Card>();
let listening = false;

/** A CSS time ("700ms", "0.3s") from a custom property, or the fallback in ms. */
function delay(el: Element, name: string, fallback: number) {
  const value = getComputedStyle(el).getPropertyValue(name).trim();
  const n = parseFloat(value);
  if (!value || Number.isNaN(n)) return fallback;
  return value.endsWith("ms") ? n : value.endsWith("s") ? n * 1000 : n;
}

function focusVisible(el: Element) {
  try {
    return el.matches(":focus-visible");
  } catch {
    return true;
  }
}

function sideOf(content: HTMLElement): Side {
  return SIDES.find((s) => content.classList.contains(`hover-card-content-${s}`)) ?? "bottom";
}

function setSide(content: HTMLElement, side: Side) {
  for (const s of SIDES) content.classList.toggle(`hover-card-content-${s}`, s === side);
}

/** How far the card sticks out of the viewport on its side (0 when it fits). */
function overflow(content: HTMLElement, side: Side) {
  const r = content.getBoundingClientRect();
  const vw = document.documentElement.clientWidth || window.innerWidth;
  const vh = document.documentElement.clientHeight || window.innerHeight;
  return Math.max(0, { top: -r.top, bottom: r.bottom - vh, left: -r.left, right: r.right - vw }[side]);
}

/** Puts the card on its own side, or the opposite one if that overflows less. */
function place(content: HTMLElement, side: Side) {
  setSide(content, side);
  let chosen = side;
  const out = overflow(content, side);
  if (out > 0) {
    const other = OPPOSITE[side];
    setSide(content, other);
    if (overflow(content, other) < out) chosen = other;
    else setSide(content, side);
  }
  content.dataset.side = chosen;
}

export function initHoverCard(root: ParentNode = document) {
  if (!listening) {
    listening = true;
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape" || !open.size) return;
      for (const card of [...open]) {
        const refocus = card.root.contains(document.activeElement);
        card.close(refocus);
      }
    });
  }

  queryAll(root, "[data-hover-card]:not([data-init])").forEach((wrapper) => {
    wrapper.dataset.init = "";
    const content = wrapper.querySelector<HTMLElement>(
      ":scope > [data-hover-card-content], :scope > .hover-card-content",
    );
    const trigger =
      wrapper.querySelector<HTMLElement>("[data-hover-card-trigger]") ??
      [...wrapper.querySelectorAll<HTMLElement>("a[href], button, [tabindex]")].find((el) => !content?.contains(el));
    if (!content || !trigger) return;

    const side = sideOf(content);
    let openTimer: ReturnType<typeof setTimeout> | undefined;
    let closeTimer: ReturnType<typeof setTimeout> | undefined;
    let hovering = false;
    let dismissed = false; // after Escape, until the pointer leaves or focus leaves
    const card: Card = { root: wrapper, close: (refocus) => hide(refocus, true) };

    const clear = () => {
      clearTimeout(openTimer);
      clearTimeout(closeTimer);
    };
    const isOpen = () => wrapper.hasAttribute("data-open");

    function show() {
      clear();
      if (isOpen() || dismissed) return;
      place(content!, side);
      wrapper.toggleAttribute("data-open", true);
      open.add(card);
      content!.dispatchEvent(new CustomEvent("hover-card:open", { bubbles: true }));
    }
    function hide(refocus = false, dismiss = false) {
      clear();
      if (dismiss) dismissed = true;
      if (!isOpen()) return;
      wrapper.removeAttribute("data-open");
      open.delete(card);
      if (refocus) trigger!.focus();
      content!.dispatchEvent(new CustomEvent("hover-card:close", { bubbles: true }));
    }
    // Whether focus keeps the card open: inside the card, or a keyboard-focused trigger.
    const holdsFocus = () => {
      const active = document.activeElement;
      return !!active && (content.contains(active) || (active === trigger && focusVisible(trigger)));
    };

    wrapper.addEventListener("pointerenter", (e) => {
      if (e.pointerType === "touch") return;
      hovering = true;
      clearTimeout(closeTimer);
      if (!isOpen() && !dismissed) openTimer = setTimeout(show, delay(wrapper, "--hover-card-open-delay", 700));
    });
    wrapper.addEventListener("pointerleave", (e) => {
      if (e.pointerType === "touch") return;
      hovering = false;
      dismissed = false;
      clearTimeout(openTimer);
      if (isOpen() && !holdsFocus()) closeTimer = setTimeout(hide, delay(wrapper, "--hover-card-close-delay", 300));
    });
    trigger.addEventListener("focus", () => {
      if (!dismissed && focusVisible(trigger)) show();
    });
    wrapper.addEventListener("focusout", (e) => {
      const next = e.relatedTarget as Node | null;
      if (next && wrapper.contains(next)) return;
      dismissed = false;
      if (!hovering) hide();
    });
  });
}
