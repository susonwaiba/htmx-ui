// Small helpers shared by the behaviours. Internal: not part of the package's public exports.

const counters = new Map<string, number>();

/** A new id: "<prefix>-1", "<prefix>-2"… */
export function uniqueId(prefix: string): string {
  const n = (counters.get(prefix) ?? 0) + 1;
  counters.set(prefix, n);
  return `${prefix}-${n}`;
}

/** Gives `el` an id unless it has one; returns the id. */
export function ensureId(el: Element, prefix: string): string {
  el.id ||= uniqueId(prefix);
  return el.id;
}

/** Whether `el` is laid out right to left. */
export const isRtl = (el: Element) => getComputedStyle(el).direction === "rtl";

/** Whether keys pressed in `target` are typing (an input, textarea, select or editable element). */
export const isEditable = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.isContentEditable || /^(input|textarea|select)$/i.test(target.tagName));

/** Whether the user asked for less motion. */
export const reducedMotion = () =>
  typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/** A CSS time ("700ms", "0.3s") from custom property `name` on `el`, or `fallback`, in ms. */
export function cssTime(el: Element, name: string, fallback: number): number {
  const value = getComputedStyle(el).getPropertyValue(name).trim();
  const n = parseFloat(value);
  if (!value || Number.isNaN(n)) return fallback;
  return value.endsWith("ms") ? n : value.endsWith("s") ? n * 1000 : n;
}

/** The longest transition (duration + delay) on `el`, in ms; 150 when the browser doesn't say. */
export function transitionTime(el: Element): number {
  const style = getComputedStyle(el);
  const ms = (list: string) => list.split(",").map((v) => parseFloat(v) * (/ms\s*$/.test(v) ? 1 : 1000) || 0);
  const durations = ms(style.transitionDuration || "");
  const delays = ms(style.transitionDelay || "");
  if (!style.transitionDuration) return 150;
  return Math.max(0, ...durations.map((d, i) => d + (delays[i % delays.length] ?? 0)));
}

/** Whether the htmx 4 request behind event `e` (htmx:after:request, htmx:finally:request) succeeded. */
export function responseOk(e: Event): boolean {
  const ctx = (e as CustomEvent).detail?.ctx;
  return !!ctx?.response && ctx.response.status < 400 && !String(ctx.status ?? "").startsWith("error");
}

/** Whether an element (an option, an item) can't be used: aria-disabled="true" or disabled. */
export const isDisabled = (el: Element) => el.getAttribute("aria-disabled") === "true" || el.hasAttribute("disabled");

/**
 * The index to move to from `i` in a list of `n` for an arrow / Home / End key, or undefined for
 * another key. `orientation` picks the arrows (both by default); `rtl` swaps ← and →. Wraps around.
 */
export function nextIndex(
  key: string,
  i: number,
  n: number,
  { orientation, rtl = false }: { orientation?: "horizontal" | "vertical"; rtl?: boolean } = {},
): number | undefined {
  if (!n) return undefined;
  const steps: Record<string, number> = {};
  if (orientation !== "vertical") Object.assign(steps, { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 });
  if (orientation !== "horizontal") Object.assign(steps, { ArrowDown: 1, ArrowUp: -1 });
  if (key === "Home") return 0;
  if (key === "End") return n - 1;
  const step = steps[key];
  if (step === undefined) return undefined;
  if (i < 0) return step > 0 ? 0 : n - 1;
  return (i + step + n) % n;
}
