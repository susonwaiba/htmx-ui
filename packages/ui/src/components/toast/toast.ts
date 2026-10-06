// Toast: short messages that stack in a corner and leave on their own, in the manner of Sonner.
// Markup is built here; styles in toast.css.
//
//   import { toast } from "htmx-ui";
//   toast("Event created", { description: "Sunday, December 3 at 9:00", action: { label: "Undo", onClick } });
//   toast.success("Saved")  .info  .warning  .error  .loading     toast.dismiss(id?)
//   toast.promise(fetch("/save"), { loading: "Saving…", success: "Saved", error: "Could not save" });
//   toast("Uploaded", { id })   an existing id updates that toast in place
//
// Without script:
// - <button data-toast="Saved" data-toast-type="success" data-toast-description="…">: a toast on click.
//   data-toast-action="Undo" adds a button that fires toast:action on the trigger (so
//   hx-trigger="toast:action" can send a request); data-toast-cancel="Dismiss" fires toast:cancel.
//   Also data-toast-duration (ms, or "infinite"), data-toast-position, data-toast-id.
// - A server: the response header HX-Trigger: {"toast": {"message": "Saved", "type": "success"}}.
//   (Add "target": "body" when the requesting element is swapped out by the response.)
// - An element swapped in: <div data-toast-show="Saved" data-toast-type="success" hidden></div>
//   shows the toast and removes itself (handy with hx-swap-oob).
// - An htmx request: data-toast-loading="Saving…" data-toast-success="Saved" data-toast-error="Failed"
//   on the requesting element shows a loading toast that turns into the outcome (with
//   data-toast-description, if any).
//
// The toaster: <section data-toaster data-position="bottom-right" …> anywhere in the page sets the
// defaults (data-position, data-duration, data-visible, data-rich-colors, data-expand,
// data-close-button="false"); without one it is created on the first toast. Hovering or focusing
// the stack expands it and pauses the timers; Alt+T focuses it; Escape dismisses the focused
// toast; swiping a toast towards the edge dismisses it.
import { queryAll } from "../../utils/dom";

export type ToastType = "default" | "success" | "info" | "warning" | "error" | "loading";
export type ToastPosition = "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";

export interface ToastButton {
  label: string;
  /** Call event.preventDefault() to keep the toast open. */
  onClick?: (event: MouseEvent) => void;
}

export interface ToastOptions {
  /** Reuse an id to update that toast in place. */
  id?: string;
  type?: ToastType;
  description?: string;
  /** Milliseconds before it leaves; Infinity keeps it. Default 4000 (loading: Infinity). */
  duration?: number;
  action?: ToastButton;
  cancel?: ToastButton;
  /** false: no close button, no swipe, no Escape; it leaves on its timer or toast.dismiss(). */
  dismissible?: boolean;
  closeButton?: boolean;
  position?: ToastPosition;
  /** false hides the type's icon. */
  icon?: boolean;
  class?: string;
  onDismiss?: (id: string) => void;
  onAutoClose?: (id: string) => void;
}

interface Entry {
  id: string;
  message: string;
  options: ToastOptions;
  el: HTMLLIElement;
  list: HTMLOListElement;
  height: number;
  remaining: number;
  started: number;
  timer?: ReturnType<typeof setTimeout>;
  removing: boolean;
}

const GAP = 14;
const EXIT_MS = 400;
const svg = (body: string, cls = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${cls ? ` class="${cls}"` : ""}>${body}</svg>`;
const ICONS: Partial<Record<ToastType, string>> = {
  success: svg('<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>'),
  info: svg('<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>'),
  warning: svg('<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4M12 17h.01"/>'),
  error: svg('<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>'),
  loading: svg('<path d="M21 12a9 9 0 1 1-6.22-8.56"/>'),
};
const CLOSE = svg('<path d="M18 6 6 18M6 6l12 12"/>');

const entries = new Map<string, Entry>();
let count = 0;

function toaster(): HTMLElement {
  let el = document.querySelector<HTMLElement>("[data-toaster]");
  if (!el) {
    el = document.createElement("section");
    el.className = "toaster";
    el.dataset.toaster = "";
    document.body.append(el);
  }
  if (!el.dataset.toasterInit) {
    el.dataset.toasterInit = "";
    el.classList.add("toaster");
    el.setAttribute("aria-label", el.getAttribute("aria-label") ?? "Notifications (Alt+T)");
    el.setAttribute("aria-live", "polite");
    el.setAttribute("aria-relevant", "additions text");
  }
  return el;
}

const settings = () => {
  const d = toaster().dataset;
  return {
    position: (d.position as ToastPosition) || "bottom-right",
    duration: d.duration ? Number(d.duration) : 4000,
    visible: Number(d.visible) || 3,
    closeButton: d.closeButton !== "false",
    expand: d.expand !== undefined && d.expand !== "false",
  };
};

function listFor(position: ToastPosition): HTMLOListElement {
  const host = toaster();
  let list = host.querySelector<HTMLOListElement>(`ol[data-position="${position}"]`);
  if (list) return list;
  list = document.createElement("ol");
  list.className = "toaster-list";
  list.dataset.position = position;
  list.tabIndex = -1;
  if (settings().expand) list.dataset.expanded = "";
  host.append(list);

  const listEntries = () => [...entries.values()].filter((e) => e.list === list);
  const hold = () => list!.matches(":hover") || list!.contains(document.activeElement) || list!.querySelector("[data-swiping]");
  const expand = () => {
    list!.dataset.expanded = "";
    listEntries().forEach(pause);
  };
  const collapse = () => {
    if (hold()) return;
    if (!settings().expand) delete list!.dataset.expanded;
    if (document.visibilityState !== "hidden") listEntries().forEach(resume);
  };
  list.addEventListener("pointerenter", expand);
  list.addEventListener("pointerleave", () => setTimeout(collapse));
  list.addEventListener("focusin", expand);
  list.addEventListener("focusout", () => setTimeout(collapse));
  return list;
}

/** Recompute every toast's place in its stack (newest first). */
function layout(list: HTMLOListElement) {
  const live = [...list.children].filter((li) => !(li as HTMLElement).dataset.removing) as HTMLElement[];
  const visible = settings().visible;
  let offset = 0;
  live.forEach((li, i) => {
    const entry = entries.get(li.dataset.id!);
    const height = entry?.height ?? li.offsetHeight;
    li.style.setProperty("--index", String(i));
    li.style.setProperty("--offset", `${offset}px`);
    li.style.setProperty("--height", `${height}px`);
    li.style.zIndex = String(live.length - i);
    li.toggleAttribute("data-front", i === 0);
    li.toggleAttribute("data-hidden", i >= visible);
    offset += height + GAP;
  });
  const front = live[0] ? (entries.get(live[0].dataset.id!)?.height ?? 0) : 0;
  list.style.setProperty("--front-height", `${front}px`);
  list.style.setProperty("--stack-height", `${Math.max(0, offset - GAP)}px`);
}

function measure(entry: Entry) {
  const { el } = entry;
  const height = el.style.height;
  el.style.height = "auto";
  entry.height = el.getBoundingClientRect().height;
  el.style.height = height;
}

function pause(entry: Entry) {
  if (!entry.timer) return;
  clearTimeout(entry.timer);
  entry.timer = undefined;
  entry.remaining -= Date.now() - entry.started;
}

function resume(entry: Entry) {
  if (entry.timer || entry.removing || !Number.isFinite(entry.remaining)) return;
  entry.started = Date.now();
  entry.timer = setTimeout(() => {
    entry.options.onAutoClose?.(entry.id);
    remove(entry, false);
  }, Math.max(0, entry.remaining));
}

function duration(options: ToastOptions): number {
  if (options.duration !== undefined) return options.duration;
  return options.type === "loading" ? Infinity : settings().duration;
}

function button(label: string, cls: string, onClick: (e: MouseEvent) => void): HTMLButtonElement {
  const b = document.createElement("button");
  b.type = "button";
  b.className = cls;
  b.textContent = label;
  b.addEventListener("click", onClick);
  return b;
}

function fill(entry: Entry) {
  const { el, options, message } = entry;
  const type = options.type ?? "default";
  const dismissible = options.dismissible !== false;
  el.className = `toast${options.class ? ` ${options.class}` : ""}`;
  el.dataset.type = type;
  el.setAttribute("role", type === "error" ? "alert" : "status");
  el.setAttribute("aria-atomic", "true");
  el.toggleAttribute("data-dismissible", dismissible);

  const parts: Node[] = [];
  const icon = ICONS[type];
  if (icon && options.icon !== false) {
    const span = document.createElement("span");
    span.className = "toast-icon";
    span.innerHTML = icon;
    parts.push(span);
  }
  const content = document.createElement("div");
  content.className = "toast-content";
  const title = document.createElement("div");
  title.className = "toast-title";
  title.textContent = message;
  content.append(title);
  if (options.description) {
    const description = document.createElement("div");
    description.className = "toast-description";
    description.textContent = options.description;
    content.append(description);
  }
  parts.push(content);
  if (options.cancel || options.action) {
    const actions = document.createElement("div");
    actions.className = "toast-actions";
    if (options.cancel) {
      const { label, onClick } = options.cancel;
      actions.append(
        button(label, "btn btn-outline btn-xs toast-cancel", (e) => {
          onClick?.(e);
          if (!e.defaultPrevented) remove(entry, true);
        }),
      );
    }
    if (options.action) {
      const { label, onClick } = options.action;
      actions.append(
        button(label, "btn btn-primary btn-xs toast-action", (e) => {
          onClick?.(e);
          if (!e.defaultPrevented) remove(entry, true);
        }),
      );
    }
    parts.push(actions);
  }
  if (dismissible && (options.closeButton ?? settings().closeButton)) {
    const close = button("", "toast-close", () => remove(entry, true));
    close.setAttribute("aria-label", "Close notification");
    close.innerHTML = CLOSE;
    parts.push(close);
  }
  el.replaceChildren(...parts);
}

function swipeable(entry: Entry) {
  const { el } = entry;
  el.addEventListener("pointerdown", (e) => {
    if (entry.options.dismissible === false || e.button !== 0 || entry.removing) return;
    if ((e.target as Element).closest("button, a, input, textarea, select")) return;
    const position = entry.list.dataset.position!;
    const startX = e.clientX;
    const startY = e.clientY;
    const startT = Date.now();
    let axis: "x" | "y" | null = null;
    let distance = 0;
    let raw = 0;
    // Positive is towards the toast's edge of the screen.
    const sign = (a: "x" | "y", d: number) => {
      if (a === "y") return position.startsWith("bottom") ? d : -d;
      if (position.endsWith("center")) return Math.abs(d);
      return position.endsWith("right") ? d : -d;
    };
    try {
      el.setPointerCapture(e.pointerId);
    } catch {}
    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      if (!axis) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 4) return;
        axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
        el.dataset.swiping = "";
      }
      raw = axis === "x" ? dx : dy;
      distance = sign(axis, raw);
      // Against the edge it resists, as if on a rubber band.
      const shown = distance >= 0 ? raw : raw * 0.15;
      el.style.setProperty("--swipe-x", axis === "x" ? `${shown}px` : "0px");
      el.style.setProperty("--swipe-y", axis === "y" ? `${shown}px` : "0px");
    };
    const up = () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      if (!axis) return;
      const velocity = distance / Math.max(1, Date.now() - startT);
      delete el.dataset.swiping;
      if (distance > 45 || velocity > 0.11) {
        const out = raw < 0 ? -1 : 1;
        el.dataset.swipeOut = axis;
        el.style.setProperty(axis === "x" ? "--swipe-x" : "--swipe-y", `${out * 110}%`);
        remove(entry, true);
      } else {
        el.style.setProperty("--swipe-x", "0px");
        el.style.setProperty("--swipe-y", "0px");
      }
      setTimeout(() => entry.list.dispatchEvent(new Event("pointerleave")));
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
  });
  el.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && entry.options.dismissible !== false) {
      e.preventDefault();
      const next = (el.nextElementSibling ?? el.previousElementSibling) as HTMLElement | null;
      remove(entry, true);
      (next && !next.dataset.removing ? next : entry.list).focus();
    }
  });
}

function remove(entry: Entry, byUser: boolean) {
  if (entry.removing) return;
  entry.removing = true;
  if (entry.timer) clearTimeout(entry.timer);
  entry.el.dataset.removing = "";
  entries.delete(entry.id);
  if (byUser) entry.options.onDismiss?.(entry.id);
  layout(entry.list);
  setTimeout(() => {
    entry.el.remove();
    if (!entry.list.children.length && !settings().expand) delete entry.list.dataset.expanded;
  }, EXIT_MS);
}

/** Show a toast; returns its id. */
export function toast(message: string, options: ToastOptions = {}): string {
  const existing = options.id ? entries.get(options.id) : undefined;
  if (existing) {
    existing.message = message;
    existing.options = { ...existing.options, ...options };
    pause(existing);
    fill(existing);
    measure(existing);
    existing.remaining = duration(existing.options);
    layout(existing.list);
    if (!existing.list.dataset.expanded) resume(existing);
    return existing.id;
  }

  const id = options.id ?? `toast-${++count}`;
  const list = listFor(options.position ?? settings().position);
  const el = document.createElement("li");
  el.dataset.id = id;
  el.tabIndex = 0;
  const entry: Entry = { id, message, options, el, list, height: 0, remaining: duration(options), started: 0, removing: false };
  entries.set(id, entry);
  fill(entry);
  swipeable(entry);
  list.prepend(el);
  measure(entry);
  layout(list);
  // Style it in its starting place first (a forced reflow), so data-mounted transitions it in.
  // Not requestAnimationFrame: that waits while the page is hidden.
  void el.offsetHeight;
  el.dataset.mounted = "";
  if (!list.dataset.expanded || settings().expand) resume(entry);
  if (list.matches(":hover") || list.contains(document.activeElement)) pause(entry);
  return id;
}

toast.success = (message: string, options: ToastOptions = {}) => toast(message, { ...options, type: "success" });
toast.info = (message: string, options: ToastOptions = {}) => toast(message, { ...options, type: "info" });
toast.warning = (message: string, options: ToastOptions = {}) => toast(message, { ...options, type: "warning" });
toast.error = (message: string, options: ToastOptions = {}) => toast(message, { ...options, type: "error" });
toast.loading = (message: string, options: ToastOptions = {}) => toast(message, { ...options, type: "loading" });

/** Dismiss one toast, or all of them. */
toast.dismiss = (id?: string) => {
  if (id === undefined) [...entries.values()].forEach((e) => remove(e, false));
  else if (entries.has(id)) remove(entries.get(id)!, false);
};

type Outcome<T> = string | ((value: T) => string);

/** A loading toast that turns into success or error when the promise settles. Returns its id. */
toast.promise = <T>(
  promise: Promise<T> | (() => Promise<T>),
  messages: { loading: string; success: Outcome<T>; error: Outcome<unknown> },
  options: ToastOptions = {},
): string => {
  const id = toast(messages.loading, { ...options, type: "loading" });
  const text = <V>(m: Outcome<V>, v: V) => (typeof m === "function" ? m(v) : m);
  const { duration: _loading, ...rest } = options;
  (typeof promise === "function" ? promise() : promise).then(
    (value) => toast(text(messages.success, value), { ...rest, id, type: "success", duration: duration({ ...rest }) }),
    (error) => toast(text(messages.error, error), { ...rest, id, type: "error", duration: duration({ ...rest }) }),
  );
  return id;
};

/** Options from data-toast-* attributes. */
function fromData(el: HTMLElement, onAction?: (name: string) => void): ToastOptions {
  const d = el.dataset;
  const options: ToastOptions = {};
  if (d.toastType) options.type = d.toastType as ToastType;
  if (d.toastDescription) options.description = d.toastDescription;
  if (d.toastDuration) options.duration = d.toastDuration === "infinite" ? Infinity : Number(d.toastDuration);
  if (d.toastPosition) options.position = d.toastPosition as ToastPosition;
  if (d.toastId) options.id = d.toastId;
  if (d.toastDismissible === "false") options.dismissible = false;
  if (d.toastAction) options.action = { label: d.toastAction, onClick: () => onAction?.("toast:action") };
  if (d.toastCancel) options.cancel = { label: d.toastCancel, onClick: () => onAction?.("toast:cancel") };
  return options;
}

const requests = new WeakMap<Element, string>();
let listening = false;

export function initToast(root: ParentNode) {
  if (!listening) {
    listening = true;
    document.addEventListener("click", (e) => {
      const trigger = (e.target as Element).closest?.<HTMLElement>("[data-toast]");
      if (!trigger || trigger.matches(":disabled")) return;
      toast(trigger.dataset.toast!, fromData(trigger, (name) => trigger.dispatchEvent(new CustomEvent(name, { bubbles: true }))));
    });
    // HX-Trigger: {"toast": {"message": "…", "type": "success"}} or {"toast": "…"}
    document.addEventListener("toast", (e) => {
      const detail = (e as CustomEvent).detail ?? {};
      const message = typeof detail === "string" ? detail : (detail.message ?? detail.value);
      if (typeof message === "string") toast(message, typeof detail === "object" ? detail : {});
    });
    document.addEventListener("htmx:before:request", (e) => {
      const el = e.target as HTMLElement;
      if (!el?.dataset?.toastLoading) return;
      // The description belongs to the outcome, not the wait.
      const { description: _description, ...options } = fromData(el);
      requests.set(el, toast.loading(el.dataset.toastLoading, options));
    });
    document.addEventListener("htmx:finally:request", (e) => {
      const el = e.target as HTMLElement;
      const id = el && requests.get(el);
      if (!id) return;
      requests.delete(el);
      const ctx = (e as CustomEvent).detail?.ctx;
      const ok = ctx?.response && ctx.response.status < 400 && !String(ctx.status ?? "").startsWith("error");
      const message = ok ? el.dataset.toastSuccess : el.dataset.toastError;
      const { type: _type, duration: _duration, ...rest } = fromData(el);
      if (message) toast(message, { ...rest, id, type: ok ? "success" : "error" });
      else toast.dismiss(id);
    });
    document.addEventListener("keydown", (e) => {
      if (!(e.altKey && e.code === "KeyT")) return;
      const first = document.querySelector<HTMLElement>(".toaster-list > .toast:not([data-removing])");
      if (!first) return;
      e.preventDefault();
      first.focus();
    });
    document.addEventListener("visibilitychange", () => {
      entries.forEach((entry) => {
        if (document.visibilityState === "hidden") pause(entry);
        else if (!entry.list.dataset.expanded) resume(entry);
      });
    });
  }

  queryAll(root, "[data-toast-show]:not([data-init])").forEach((el) => {
    el.dataset.init = "";
    toast(el.dataset.toastShow!, fromData(el));
    el.remove();
  });
}
