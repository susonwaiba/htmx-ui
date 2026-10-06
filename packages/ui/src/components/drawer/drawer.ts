// Drawer: a <dialog class="drawer" data-dialog data-drawer> attached to an edge, which a swipe
// dismisses. Markup and styles: see drawer.css. Opening, closing, Escape and light dismiss are
// the dialog's (data-dialog, dialog.ts); this adds:
// - Swiping in data-swipe-direction (down by default; up, left, right) with Pointer Events. A
//   press becomes a drag once it moves a few pixels towards dismissal; a release past 30% of the
//   drawer's size, or a flick, dismisses it (a cancelable "cancel" event, then close()); anything
//   less springs back. data-drawer-handle-only limits dragging to .drawer-handle.
// - A drag doesn't start on form controls, buttons and links, on [data-drawer-no-drag], or in
//   content that can still scroll the way the finger moves (a list scrolled down scrolls back up
//   first). It is off when the drawer's --drawer-swipe is none (.drawer-responsive from md) and
//   for closedby="none".
// - Nested drawers: each open drawer gets --nested-drawers (how many drawers are open in front
//   of it) and [data-nested-drawer-open] when that is more than 0; a drawer opened over another
//   gets [data-drawer-nested]. Works whether the child <dialog> sits inside the parent or not.
// Its own init marker, data-drawer-init: the element also carries data-dialog, whose
// initialiser stamps data-init.
import { queryAll } from "../../utils/dom";

type Direction = "up" | "down" | "left" | "right";
const VECTORS: Record<Direction, [number, number]> = { down: [0, 1], up: [0, -1], right: [1, 0], left: [-1, 0] };

const NO_DRAG =
  "input, textarea, select, button, a[href], [contenteditable]:not([contenteditable='false']), [data-drawer-no-drag]";
/** Pixels a press moves before it counts as a drag (or as a scroll, if it goes the other way) */
const SLOP = 6;
/** A release past this fraction of the drawer's size dismisses it */
const DISTANCE = 0.3;
/** ...and so does a flick faster than this, in px/ms */
const VELOCITY = 0.4;

/** Open drawers, the frontmost last */
const stack: HTMLDialogElement[] = [];

function directionOf(drawer: HTMLElement): Direction {
  const d = drawer.dataset.swipeDirection as Direction;
  return d in VECTORS ? d : "down";
}

function syncStack(changed: HTMLDialogElement) {
  if (changed.open && changed.isConnected && !stack.includes(changed)) {
    changed.toggleAttribute("data-drawer-nested", stack.some((d) => d.open && d.isConnected));
    stack.push(changed);
  }
  for (let i = stack.length - 1; i >= 0; i--) {
    const d = stack[i]!;
    if (d.open && d.isConnected) continue;
    stack.splice(i, 1);
    d.style.removeProperty("--nested-drawers");
    d.removeAttribute("data-nested-drawer-open");
  }
  stack.forEach((d, i) => {
    const front = stack.length - 1 - i;
    d.style.setProperty("--nested-drawers", String(front));
    d.toggleAttribute("data-nested-drawer-open", front > 0);
  });
}

/** Whether something between `from` and the drawer can scroll the content the way a finger moving in `dir` would. */
function canScroll(from: Element, drawer: Element, dir: Direction) {
  for (let el: Element | null = from; el; el = el === drawer ? null : el.parentElement) {
    const style = getComputedStyle(el);
    const vertical = dir === "up" || dir === "down";
    if (!/auto|scroll|overlay/.test(vertical ? style.overflowY : style.overflowX)) continue;
    if (dir === "down" && el.scrollTop > 0) return true;
    if (dir === "up" && el.scrollTop + el.clientHeight < el.scrollHeight - 1) return true;
    if (dir === "right" && el.scrollLeft > 0) return true;
    if (dir === "left" && el.scrollLeft + el.clientWidth < el.scrollWidth - 1) return true;
  }
  return false;
}

function inside(el: Element, x: number, y: number) {
  const r = el.getBoundingClientRect();
  return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
}

function swipeable(drawer: HTMLDialogElement) {
  return (
    drawer.getAttribute("closedby") !== "none" &&
    getComputedStyle(drawer).getPropertyValue("--drawer-swipe").trim() !== "none"
  );
}

function initSwipe(drawer: HTMLDialogElement) {
  type Press = { id: number; x: number; y: number; dir: Direction; target: Element; handle: boolean };
  let press: Press | null = null;
  let dragging = false;
  let offset = 0;
  let size = 1;
  let samples: { t: number; d: number }[] = [];
  let dragged = false;

  const set = (name: string, value: string | null) =>
    value === null ? drawer.style.removeProperty(name) : drawer.style.setProperty(name, value);

  // Returns true while the press is a drag, so a touchmove can stop the page from scrolling.
  const move = (x: number, y: number, t: number): boolean => {
    if (!press) return false;
    const [vx, vy] = VECTORS[press.dir];
    const mx = x - press.x;
    const my = y - press.y;
    const along = mx * vx + my * vy; // towards dismissal
    const across = Math.abs(mx * vy) + Math.abs(my * vx);
    if (!dragging) {
      if (Math.hypot(mx, my) < SLOP) return false;
      const scrolls =
        across > Math.abs(along) ||
        (!press.handle && (along < 0 || canScroll(press.target, drawer, press.dir)));
      if (scrolls) {
        press = null;
        return false;
      }
      dragging = true;
      const r = drawer.getBoundingClientRect();
      size = (vx ? r.width : r.height) || 1;
      drawer.dataset.swiping = "";
      try {
        drawer.setPointerCapture(press.id);
      } catch {
        // the pointer is already gone
      }
      document.getSelection()?.removeAllRanges();
    }
    // Free towards dismissal, resisting the other way
    offset = along >= 0 ? along : -Math.sqrt(-along) * 2;
    set("--drawer-swipe-movement", `${offset}px`);
    set("--drawer-swipe-progress", String(Math.min(Math.max(offset / size, 0), 1)));
    samples.push({ t, d: along });
    samples = samples.filter((s) => t - s.t <= 100);
    return true;
  };

  const end = (cancelled: boolean, t: number) => {
    const was = dragging;
    press = null;
    dragging = false;
    if (!was) return;
    dragged = true;
    delete drawer.dataset.swiping;
    set("--drawer-swipe-movement", null);
    set("--drawer-swipe-progress", null);
    const first = samples[0];
    const last = samples[samples.length - 1];
    const velocity = first && last && last.t > first.t && t - last.t < 100 ? (last.d - first.d) / (last.t - first.t) : 0;
    samples = [];
    const dismiss = !cancelled && offset > 0 && (offset > size * DISTANCE || velocity > VELOCITY);
    offset = 0;
    // Without the movement the drawer transitions to its closed position, or back to rest.
    if (dismiss && drawer.dispatchEvent(new Event("cancel", { cancelable: true }))) drawer.close();
  };

  drawer.addEventListener("pointerdown", (e) => {
    dragged = false;
    if (!drawer.open || !e.isPrimary || e.button !== 0) return;
    const target = e.target as Element;
    // Not from a drawer (or dialog) nested inside this one, nor from the backdrop
    if (target.closest("dialog") !== drawer || !inside(drawer, e.clientX, e.clientY)) return;
    if (!swipeable(drawer)) return;
    const handle = !!target.closest(".drawer-handle");
    if (drawer.hasAttribute("data-drawer-handle-only") ? !handle : !handle && target.closest(NO_DRAG)) return;
    press = { id: e.pointerId, x: e.clientX, y: e.clientY, dir: directionOf(drawer), target, handle };
  });
  drawer.addEventListener("pointermove", (e) => {
    if (press && e.pointerId === press.id) move(e.clientX, e.clientY, e.timeStamp);
  });
  drawer.addEventListener("pointerup", (e) => {
    if (press && e.pointerId === press.id) end(false, e.timeStamp);
  });
  drawer.addEventListener("pointercancel", (e) => {
    if (press && e.pointerId === press.id) end(true, e.timeStamp);
  });
  // On touch screens the browser scrolls unless the touchmove is cancelled. Deciding here too
  // (touchmove can come first) lets a drag win before scrolling starts.
  drawer.addEventListener(
    "touchmove",
    (e) => {
      const touch = e.touches[0];
      if (press && touch && move(touch.clientX, touch.clientY, e.timeStamp) && e.cancelable) e.preventDefault();
    },
    { passive: false },
  );
  // A drag of an image or a link would start the browser's own drag and drop.
  drawer.addEventListener("dragstart", (e) => {
    if (press) e.preventDefault();
  });
  // The click that ends a drag isn't a click on whatever was under the pointer.
  drawer.addEventListener(
    "click",
    (e) => {
      if (!dragged) return;
      dragged = false;
      e.preventDefault();
      e.stopImmediatePropagation();
    },
    true,
  );
}

export function initDrawer(root: ParentNode = document) {
  queryAll<HTMLDialogElement>(root, "dialog[data-drawer]:not([data-drawer-init])").forEach((drawer) => {
    drawer.dataset.drawerInit = "";
    initSwipe(drawer);
    new MutationObserver(() => syncStack(drawer)).observe(drawer, { attributes: true, attributeFilter: ["open"] });
    if (drawer.open) syncStack(drawer);
  });
}
