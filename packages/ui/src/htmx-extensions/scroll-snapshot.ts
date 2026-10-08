// Shared by the scroll extensions (preserve-scroll, sidebar-active-scroll): record the scroll
// position of elements marked with an attribute and put it back on their replacements.
// An element's key is the attribute's value, else its id; "false" opts it out. Elements
// sharing a key are matched in document order.

export type Position = { el: Element; top: number; left: number };
export type Snapshot = Map<string, Position[]>;

export function keyOf(el: Element, attr: string): string | null {
  const value = el.getAttribute(attr)?.trim();
  if (value === "false") return null;
  return value || el.id || null;
}

/** Marked elements under `root` (itself included) grouped by key, in document order. */
export function collect(root: ParentNode, attr: string): Map<string, Element[]> {
  const groups = new Map<string, Element[]>();
  const selector = `[${attr}]`;
  const found = [...root.querySelectorAll(selector)];
  if (root instanceof Element && root.matches(selector)) found.unshift(root);
  for (const el of found) {
    const key = keyOf(el, attr);
    if (key) groups.set(key, [...(groups.get(key) ?? []), el]);
  }
  return groups;
}

export function snapshot(root: ParentNode, attr: string): Snapshot {
  const result: Snapshot = new Map();
  for (const [key, els] of collect(root, attr)) {
    result.set(key, els.map((el) => ({ el, top: el.scrollTop, left: el.scrollLeft })));
  }
  return result;
}

/**
 * Scroll marked elements under `root` to their positions in `saved`, skipping elements that
 * are the same node as when it was taken (the swap didn't touch them). Returns the elements
 * it scrolled.
 */
export function restore(saved: Snapshot, root: ParentNode, attr: string): Element[] {
  const restored: Element[] = [];
  // Index by position among all same-key elements in the document, so a repeated key
  // restores the right one even when `root` holds only some of them.
  const all = collect(document, attr);
  for (const [key, els] of collect(root, attr)) {
    const positions = saved.get(key);
    if (!positions) continue;
    const order = all.get(key) ?? els;
    for (const el of els) {
      const position = positions[order.indexOf(el)] ?? (positions.length === 1 ? positions[0] : undefined);
      if (!position || position.el === el) continue;
      if (el.scrollTop !== position.top) el.scrollTop = position.top;
      if (el.scrollLeft !== position.left) el.scrollLeft = position.left;
      restored.push(el);
    }
  }
  return restored;
}

/** Whether `el` was in `saved` as the very same node (it survived the swap). */
export function survived(saved: Snapshot, el: Element): boolean {
  for (const positions of saved.values()) if (positions.some((p) => p.el === el)) return true;
  return false;
}

/**
 * htmx 4 extension hooks that snapshot before each swap, restore new content at
 * before:settle (before it is painted) and make a last pass at finally:swap, then call
 * `after(saved)` with the swap's snapshot.
 *
 * During settling htmx gives new elements that share an id with an old one the old attributes
 * (for CSS transitions), so an element whose own attribute is "false" may be restored at
 * before:settle; finally:swap undoes that once the real attributes are back.
 */
export function swapHooks(attr: string, after?: (saved: Snapshot) => void) {
  // Snapshots of swaps in flight, oldest first. before:settle doesn't carry the request
  // context, so it uses the latest one.
  const pending: Snapshot[] = [];
  const byContext = new WeakMap<object, Snapshot>();
  const early = new WeakMap<Snapshot, Element[]>();

  return {
    htmx_before_swap(_elt: Element, detail: { ctx?: object }) {
      if (!detail.ctx) return;
      const saved = snapshot(document, attr);
      pending.push(saved);
      byContext.set(detail.ctx, saved);
    },

    htmx_before_settle(_elt: Element, detail: { newContent?: Node[] }) {
      const saved = pending.at(-1);
      if (!saved?.size) return;
      const restored = early.get(saved) ?? [];
      // newContent holds every inserted node, text and comments included
      for (const el of detail.newContent ?? []) {
        if (el instanceof Element) restored.push(...restore(saved, el, attr));
      }
      early.set(saved, restored);
    },

    // A last pass over the whole document once every task (OOB and partials too) is in.
    htmx_finally_swap(_elt: Element, detail: { ctx?: object }) {
      const saved = detail.ctx && byContext.get(detail.ctx);
      if (!saved) return;
      byContext.delete(detail.ctx!);
      pending.splice(pending.indexOf(saved), 1);
      for (const el of early.get(saved) ?? []) {
        if (el.isConnected && !keyOf(el, attr)) el.scrollTop = el.scrollLeft = 0;
      }
      restore(saved, document, attr);
      after?.(saved);
    },
  };
}

// Minimal shape of the htmx 4 API the extensions use (htmx.org's own types declare it as `any`).
export type Htmx = { registerExtension(name: string, extension: Record<string, unknown>): unknown };

export function resolveHtmx(htmx: Htmx | undefined, caller: string): Htmx {
  htmx ??= (globalThis as { htmx?: Htmx }).htmx;
  if (!htmx) throw new Error(`${caller}: htmx not found; import htmx.org first or pass it in`);
  return htmx;
}
