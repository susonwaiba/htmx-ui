// Resizable panels. Markup: see resizable.css.
// - Sizes are percentages of the group, applied as flex-grow over a 0 basis, so they always
//   fill the group whatever its width; panels without data-size share what is left.
// - A handle resizes the nearest open panel before it and the panel after it, within both
//   panels' data-min / data-max. Dragging a data-collapsible panel under half its minimum
//   collapses it on release; dragging back out reopens it.
// - Keyboard on a handle (role="separator"): arrows move 5% (Shift: 1%), Home / End go to the
//   limits, Enter collapses / reopens a collapsible neighbour. Double-click restores the sizes
//   the group started with.
// - <button data-resizable-toggle="panel-id"> anywhere collapses / reopens that panel; the space
//   goes to (or comes from) its neighbour, so the other panels don't jump.
// - data-resizable-id saves sizes and collapsed panels in localStorage and restores them.
// - Fires "resizable:change" on the group with detail { sizes, collapsed } after each change.
import { queryAll } from "../../utils/dom";

type Panel = {
  el: HTMLElement;
  min: number;
  max: number;
  /** data-size, if given. */
  preset: number | null;
  collapsible: boolean;
  size: number;
  collapsed: boolean;
  /** The size to reopen at after a collapse. */
  restore: number;
};

type Group = {
  el: HTMLElement;
  panels: Panel[];
  handles: HTMLElement[];
  vertical: boolean;
  /** Sizes and collapsed states at init, for double-click reset. */
  initial: { size: number; collapsed: boolean }[];
};

const STEP = 5;
const FINE_STEP = 1;
const groups = new WeakMap<HTMLElement, Group>();
let togglesBound = false;

const num = (value: string | undefined, fallback: number) => {
  const n = Number.parseFloat(value ?? "");
  return Number.isFinite(n) ? n : fallback;
};
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const round = (v: number) => Math.round(v * 100) / 100;
const storageKey = (id: string) => `htmx-ui:resizable:${id}`;

const open = (g: Group) => g.panels.filter((p) => !p.collapsed);

/** Scale the open panels so they add up to 100. */
function normalize(g: Group) {
  const panels = open(g);
  const total = panels.reduce((sum, p) => sum + p.size, 0);
  if (!panels.length) return;
  if (total <= 0) panels.forEach((p) => (p.size = 100 / panels.length));
  else panels.forEach((p) => (p.size = (p.size / total) * 100));
}

/** The nearest open panel at or after `from` (dir 1) or before it (dir -1). */
function neighbour(g: Group, from: number, dir: 1 | -1): Panel | undefined {
  for (let i = from; i >= 0 && i < g.panels.length; i += dir) if (!g.panels[i]!.collapsed) return g.panels[i];
  return undefined;
}

/** The two panels a handle resizes, or null when it has nothing to do (a side is closed). */
function pairOf(g: Group, handle: HTMLElement): [Panel, Panel] | null {
  const index = g.handles.indexOf(handle);
  // Handle i sits between panel i and panel i + 1 (DOM order).
  const after = g.panels[index + 1];
  if (!after || after.collapsed) return null;
  const before = neighbour(g, index, -1);
  return before ? [before, after] : null;
}

function apply(g: Group) {
  g.panels.forEach((p) => {
    p.el.toggleAttribute("data-collapsed", p.collapsed);
    p.el.style.flex = p.collapsed ? "" : `${round(p.size)} 1 0px`;
  });
  g.handles.forEach((handle) => {
    const pair = pairOf(g, handle);
    handle.hidden = !pair;
    if (!pair) return;
    const [a] = pair;
    handle.setAttribute("aria-valuenow", String(Math.round(a.size)));
    handle.setAttribute("aria-valuemin", String(a.min));
    handle.setAttribute("aria-valuemax", String(a.max));
    if (a.el.id) handle.setAttribute("aria-controls", a.el.id);
  });
  g.panels.forEach((p) => {
    if (!p.el.id) return;
    document.querySelectorAll<HTMLElement>(`[data-resizable-toggle="${CSS.escape(p.el.id)}"]`).forEach((btn) => {
      btn.setAttribute("aria-expanded", String(!p.collapsed));
      btn.setAttribute("aria-controls", p.el.id);
    });
  });
}

function save(g: Group) {
  const id = g.el.dataset.resizableId;
  if (!id) return;
  try {
    localStorage.setItem(
      storageKey(id),
      JSON.stringify({ sizes: g.panels.map((p) => round(p.collapsed ? p.restore : p.size)), collapsed: g.panels.map((p) => p.collapsed) }),
    );
  } catch {}
}

function restoreSaved(g: Group) {
  const id = g.el.dataset.resizableId;
  if (!id) return;
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey(id)) ?? "null") as { sizes?: number[]; collapsed?: boolean[] } | null;
    if (!saved?.sizes || saved.sizes.length !== g.panels.length) return;
    g.panels.forEach((p, i) => {
      const size = saved.sizes![i]!;
      if (!Number.isFinite(size)) return;
      p.collapsed = Boolean(saved.collapsed?.[i]) && g.panels.length > 1;
      p.restore = clamp(size, p.min, p.max) || p.restore;
      p.size = p.collapsed ? 0 : clamp(size, p.min, p.max);
    });
    if (!open(g).length) g.panels[0]!.collapsed = false;
  } catch {}
}

function changed(g: Group) {
  normalize(g);
  apply(g);
  save(g);
  g.el.dispatchEvent(
    new CustomEvent("resizable:change", {
      bubbles: true,
      detail: {
        sizes: g.panels.map((p) => (p.collapsed ? 0 : round(p.size))),
        collapsed: g.panels.filter((p) => p.collapsed).map((p) => p.el.id || g.panels.indexOf(p)),
      },
    }),
  );
}

/** Set the panel before a handle to `size`, taking the difference from the one after it. */
function resizePair(a: Panel, b: Panel, size: number) {
  const total = a.size + b.size;
  const lo = Math.max(a.min, total - b.max);
  const hi = Math.min(a.max, total - b.min);
  a.size = clamp(size, lo, Math.max(lo, hi));
  b.size = total - a.size;
}

function collapse(g: Group, p: Panel) {
  if (p.collapsed || open(g).length < 2) return;
  const index = g.panels.indexOf(p);
  const heir = neighbour(g, index + 1, 1) ?? neighbour(g, index - 1, -1);
  if (p.size > 0) p.restore = p.size;
  if (heir) heir.size += p.size;
  p.size = 0;
  p.collapsed = true;
  changed(g);
}

function expand(g: Group, p: Panel) {
  if (!p.collapsed) return;
  const index = g.panels.indexOf(p);
  const want = clamp(p.restore || p.preset || Math.max(p.min, 20), p.min, p.max);
  p.collapsed = false;
  p.size = 0;
  // Take the space from the neighbour first (down to its minimum), then from everyone.
  let needed = want;
  const donor = neighbour(g, index + 1, 1) ?? neighbour(g, index - 1, -1);
  if (donor && donor !== p) {
    const give = Math.min(needed, Math.max(0, donor.size - donor.min));
    donor.size -= give;
    needed -= give;
  }
  p.size = want - needed;
  if (needed > 0) {
    const others = open(g).filter((o) => o !== p);
    const spare = others.reduce((sum, o) => sum + Math.max(0, o.size - o.min), 0);
    others.forEach((o) => {
      const share = spare > 0 ? (Math.max(0, o.size - o.min) / spare) * Math.min(needed, spare) : 0;
      o.size -= share;
    });
    p.size += Math.min(needed, spare);
  }
  changed(g);
}

function toggle(g: Group, p: Panel) {
  if (p.collapsed) expand(g, p);
  else collapse(g, p);
}

/** Pixels per percent along the group's axis (handles excluded). */
function pxPerPercent(g: Group): number {
  const rect = g.el.getBoundingClientRect();
  const handles = g.handles.reduce((sum, h) => {
    if (h.hidden) return sum;
    const r = h.getBoundingClientRect();
    return sum + (g.vertical ? r.height : r.width);
  }, 0);
  const size = (g.vertical ? rect.height : rect.width) - handles;
  return size > 0 ? size / 100 : 0;
}

function bindHandle(g: Group, handle: HTMLElement) {
  handle.setAttribute("role", "separator");
  handle.setAttribute("aria-orientation", g.vertical ? "horizontal" : "vertical");
  if (!handle.hasAttribute("tabindex")) handle.tabIndex = 0;

  handle.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    const pair = pairOf(g, handle);
    if (!pair) return;
    const [a, b] = pair;
    const scale = pxPerPercent(g);
    if (!scale) return;
    e.preventDefault();
    const start = g.vertical ? e.clientY : e.clientX;
    const rtl = !g.vertical && getComputedStyle(g.el).direction === "rtl";
    const startA = a.size;
    const startB = b.size;
    const total = startA + startB;
    try {
      handle.setPointerCapture(e.pointerId);
    } catch {}
    handle.dataset.dragging = "";
    g.el.dataset.resizing = "";

    const move = (ev: PointerEvent) => {
      let delta = ((g.vertical ? ev.clientY : ev.clientX) - start) / scale;
      if (rtl) delta = -delta;
      const wantA = startA + delta;
      const wantB = startB - delta;
      // Past half a collapsible panel's minimum it closes (shown at 0 until release).
      if (a.collapsible && wantA < a.min / 2) {
        a.size = 0;
        b.size = total;
      } else if (b.collapsible && wantB < b.min / 2) {
        a.size = total;
        b.size = 0;
      } else {
        a.size = startA;
        b.size = startB;
        resizePair(a, b, wantA);
      }
      apply(g);
    };
    const up = () => {
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", up);
      handle.removeEventListener("pointercancel", up);
      delete handle.dataset.dragging;
      delete g.el.dataset.resizing;
      for (const [p, other] of [
        [a, b],
        [b, a],
      ] as const) {
        if (p.size === 0 && p.collapsible) {
          p.restore = p === a ? startA : startB;
          p.collapsed = true;
          other.size = total;
        }
      }
      changed(g);
    };
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", up);
    handle.addEventListener("pointercancel", up);
  });

  handle.addEventListener("keydown", (e) => {
    const pair = pairOf(g, handle);
    if (!pair) return;
    const [a, b] = pair;
    const step = e.shiftKey ? FINE_STEP : STEP;
    const rtl = !g.vertical && getComputedStyle(g.el).direction === "rtl";
    const grow = g.vertical ? "ArrowDown" : rtl ? "ArrowLeft" : "ArrowRight";
    const shrink = g.vertical ? "ArrowUp" : rtl ? "ArrowRight" : "ArrowLeft";
    let target: number | null = null;
    if (e.key === grow) target = a.size + step;
    else if (e.key === shrink) target = a.size - step;
    else if (e.key === "Home") target = -Infinity;
    else if (e.key === "End") target = Infinity;
    else if (e.key === "Enter") {
      const p = a.collapsible ? a : b.collapsible ? b : null;
      if (!p) return;
      e.preventDefault();
      collapse(g, p);
      // The handle may now be hidden; keep focus on something that can reopen it.
      return;
    } else return;
    e.preventDefault();
    resizePair(a, b, target);
    changed(g);
  });

  handle.addEventListener("dblclick", () => {
    g.panels.forEach((p, i) => {
      p.size = g.initial[i]!.size;
      p.collapsed = g.initial[i]!.collapsed;
    });
    changed(g);
  });
}

function bindToggles() {
  if (togglesBound) return;
  togglesBound = true;
  document.addEventListener("click", (e) => {
    const btn = (e.target as Element | null)?.closest?.<HTMLElement>("[data-resizable-toggle]");
    if (!btn) return;
    const panel = document.getElementById(btn.dataset.resizableToggle ?? "");
    const groupEl = panel?.parentElement;
    const g = groupEl ? groups.get(groupEl) : undefined;
    const p = g?.panels.find((x) => x.el === panel);
    if (!g || !p) return;
    e.preventDefault();
    toggle(g, p);
  });
}

export function initResizable(root: ParentNode) {
  queryAll(root, "[data-resizable]:not([data-init])").forEach((el) => {
    el.dataset.init = "";
    const vertical = el.dataset.orientation === "vertical";
    const panelEls = [...el.querySelectorAll<HTMLElement>(":scope > [data-resizable-panel]")];
    if (!panelEls.length) return;
    const panels: Panel[] = panelEls.map((p) => {
      const min = clamp(num(p.dataset.min, 0), 0, 100);
      const preset = p.dataset.size === undefined ? null : clamp(num(p.dataset.size, 0), 0, 100);
      return {
        el: p,
        min,
        max: clamp(num(p.dataset.max, 100), min, 100),
        preset,
        collapsible: p.hasAttribute("data-collapsible"),
        size: preset ?? -1,
        collapsed: p.hasAttribute("data-collapsed"),
        restore: preset ?? 0,
      };
    });
    // Panels without a size share what the sized ones leave.
    const fixed = panels.filter((p) => p.size >= 0).reduce((sum, p) => sum + p.size, 0);
    const flexible = panels.filter((p) => p.size < 0);
    flexible.forEach((p) => {
      p.size = Math.max(p.min, (100 - fixed) / flexible.length);
      p.restore = p.size;
    });
    panels.forEach((p) => {
      if (p.collapsed) p.size = 0;
    });
    const g: Group = {
      el,
      panels,
      handles: [...el.querySelectorAll<HTMLElement>(":scope > [data-resizable-handle]")],
      vertical,
      initial: [],
    };
    normalize(g);
    g.initial = panels.map((p) => ({ size: p.size, collapsed: p.collapsed }));
    restoreSaved(g);
    normalize(g);
    groups.set(el, g);
    g.handles.forEach((h) => bindHandle(g, h));
    apply(g);
    bindToggles();
  });
}
