// Message scroller: scrolling for a chat transcript. Messages, prompts and replies are the app's;
// this keeps the scroll position right while they change. Markup: see message-scroller.css.
//
// The view moves for something the reader did (sending, the jump button, a link), never on its own.
// - Following: while the reader is at the bottom (within data-message-scroller-threshold
//   px, default 32), growing content keeps the newest line in view. Any sign they want to read
//   elsewhere stops it: scrolling up (wheel, touch, keys, the scrollbar, find in page), selecting
//   text in the transcript, pressing on a link. Scrolling back to the edge, or the jump button,
//   resumes it. data-message-scroller-follow="false" never follows (the reader always jumps).
// - New turns: an anchor row appended at the end ([data-message-anchor], [data-role="user"] or
//   .message[data-align="end"]; data-message-scroller-anchor="<selector>" changes that, "none"
//   turns it off; data-message-anchor="false" opts one row out) is scrolled near the top, leaving
//   --message-scroller-anchor-offset of the previous turn in view, and a spacer after the content
//   keeps it there while the reply grows into the space below.
// - Keeping place: when rows resize, load, are prepended (history) or replaced (regenerate), the
//   first visible row keeps its offset from the top of the viewport (overflow-anchor is off).
// - Opening: data-message-scroller-open="last-anchor" (default) | "bottom" | "top" | "#row-id",
//   overridden by a location.hash that targets a row. No animation.
// - [data-message-scroller-jump] (a button) shows when the reader is away from the bottom;
//   its data-state is "latest", "unread" (rows arrived below) or "streaming" ([data-streaming] on
//   the scroller or any row), and "hidden" at the edge. Clicking it scrolls down and follows.
// - Links to rows (a[href="#row-id"], inside or outside the transcript) scroll the viewport, not
//   the page, and flash the row (data-highlighted).
// - A polite status announces data-message-scroller-announce-new ("New message") when a row
//   arrives from someone else, and data-message-scroller-announce-done ("Response complete") when
//   the last data-streaming is removed. Set either to "" to stay quiet.
// - getMessageScroller(el) returns the API below. Events on the scroller (they bubble):
//   message-scroller:init {api}, :follow, :unfollow {reason}, :unread {rows}, :anchor {row}.
import { queryAll } from "../../utils/dom";
import { isEditable, reducedMotion } from "../../utils/shared";

export type ScrollAlign = "start" | "center" | "end";

export interface ScrollToMessageOptions {
  /** Where the row lands: "start" (default; below the anchor offset), "center" or "end". */
  align?: ScrollAlign;
  /** Flash the row with data-highlighted. Default true. */
  highlight?: boolean;
  /** Animate (skipped under prefers-reduced-motion). Default false. */
  smooth?: boolean;
}

export interface MessageScroller {
  readonly element: HTMLElement;
  readonly viewport: HTMLElement;
  readonly content: HTMLElement;
  /** Growing content keeps the newest line in view. */
  readonly following: boolean;
  /** The reader is at the bottom (within the threshold). */
  readonly atBottom: boolean;
  /** Rows arrived below while the reader was away. */
  readonly unread: boolean;
  /** Scroll to the end and follow from there. */
  scrollToBottom(options?: { smooth?: boolean }): void;
  /** Scroll a row (an element or an id) into the viewport. False if it isn't in the transcript. */
  scrollToMessage(target: string | Element, options?: ScrollToMessageOptions): boolean;
  /** Treat a row as the newest turn: scroll it near the top and keep room below it. */
  anchor(row: Element, options?: { smooth?: boolean }): void;
  /** Stop following, as if the reader had scrolled away. */
  unfollow(): void;
  /** Re-measure after a change the observers can't see. */
  update(): void;
  /** Say something through the polite status (throttled). */
  announce(text: string): void;
}

const DEFAULT_ANCHOR = '[data-message-anchor], [data-role="user"], .message[data-align="end"]';
const DEFAULT_OFFSET = 48;
const HIGHLIGHT_MS = 2000;
const ANNOUNCE_GAP_MS = 1500;

const instances = new WeakMap<HTMLElement, MessageScroller>();

/** The API of a [data-message-scroller] (from it or any element inside it). */
export function getMessageScroller(el: Element | null): MessageScroller | undefined {
  const scroller = el?.closest<HTMLElement>("[data-message-scroller]");
  return scroller ? instances.get(scroller) : undefined;
}

const now = () => performance.now();

function setup(el: HTMLElement): MessageScroller {
  const viewport = el.querySelector<HTMLElement>("[data-message-scroller-viewport], .message-scroller-viewport") ?? el;
  const content =
    viewport.querySelector<HTMLElement>("[data-message-scroller-content], .message-scroller-content") ??
    (viewport.firstElementChild as HTMLElement | null) ??
    viewport;
  const jump = el.querySelector<HTMLElement>("[data-message-scroller-jump]");

  // The spacer sits after the content (not in it), so rows appended to the content land before it.
  const spacer = document.createElement("div");
  spacer.className = "message-scroller-spacer";
  spacer.setAttribute("aria-hidden", "true");
  spacer.dataset.messageScrollerSpacer = "";
  spacer.style.height = "0px";
  if (content === viewport) viewport.append(spacer);
  else content.after(spacer);

  let status = el.querySelector<HTMLElement>("[data-message-scroller-status]");
  if (!status) {
    status = document.createElement("div");
    status.className = "message-scroller-status";
    status.dataset.messageScrollerStatus = "";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    status.setAttribute("aria-atomic", "true");
    el.append(status);
  }

  // A focusable, labelled region for keyboard scrolling. Not a live region: streaming would flood it.
  if (!viewport.hasAttribute("tabindex")) viewport.tabIndex = 0;
  if (!viewport.hasAttribute("role")) viewport.setAttribute("role", "region");
  if (viewport !== el) {
    for (const attr of ["aria-label", "aria-labelledby"]) {
      const value = el.getAttribute(attr);
      if (value !== null && !viewport.hasAttribute(attr)) {
        viewport.setAttribute(attr, value);
        el.removeAttribute(attr);
      }
    }
  }
  if (!viewport.hasAttribute("aria-label") && !viewport.hasAttribute("aria-labelledby")) {
    viewport.setAttribute("aria-label", "Conversation");
  }

  // --- state
  let following = false;
  let atEdge = true;
  let unread = false;
  let streaming = false;
  let selecting = false;
  let anchorEl: Element | null = null;
  /** The reading position: a few rows and their offsets from the viewport's top. */
  let ref: { el: Element; offset: number }[] = [];
  /** Our own scroll in flight, so its scroll events aren't taken for the reader's. */
  let programmatic: { top: number; smooth: boolean; until: number } | null = null;
  let frame = 0;
  let added: Element[] = [];
  let touchY = 0;
  let lastAnnounce = -Infinity;
  let announceTimer: ReturnType<typeof setTimeout> | undefined;
  const highlights = new WeakMap<Element, ReturnType<typeof setTimeout>>();

  // --- settings, read when needed so they can change
  const threshold = () => {
    const n = Number(el.dataset.messageScrollerThreshold);
    return Number.isFinite(n) && el.dataset.messageScrollerThreshold !== "" && n >= 0 ? n : 32;
  };
  const followAllowed = () => el.dataset.messageScrollerFollow !== "false";
  const anchorSelector = () => {
    const s = el.dataset.messageScrollerAnchor;
    return s === undefined ? DEFAULT_ANCHOR : s.trim() === "none" ? "" : s.trim();
  };
  /** --message-scroller-anchor-offset, resolved to px through the spacer's scroll-margin-top. */
  const anchorOffset = () => {
    const n = parseFloat(getComputedStyle(spacer).scrollMarginTop);
    return Number.isFinite(n) ? n : DEFAULT_OFFSET;
  };

  // --- geometry
  const rows = () => [...content.children].filter((c) => c !== spacer && c !== status);
  const viewTop = () => viewport.getBoundingClientRect().top + viewport.clientTop;
  const maxTop = () => Math.max(0, viewport.scrollHeight - viewport.clientHeight);
  const isAtEdge = () => maxTop() - viewport.scrollTop <= threshold();
  /** An element's position in the scrolled content. */
  const posOf = (target: Element) => target.getBoundingClientRect().top - viewTop() + viewport.scrollTop;
  const rowOf = (node: Element) => {
    let n: Element | null = node;
    while (n && n.parentElement !== content) n = n.parentElement;
    return n;
  };

  const emit = (name: string, detail: Record<string, unknown> = {}) =>
    el.dispatchEvent(new CustomEvent(`message-scroller:${name}`, { bubbles: true, detail }));

  function setTop(top: number, smooth = false) {
    const target = Math.round(Math.min(Math.max(top, 0), maxTop()));
    if (Math.abs(target - viewport.scrollTop) < 1) return;
    smooth &&= !reducedMotion() && typeof viewport.scrollTo === "function";
    programmatic = { top: target, smooth, until: now() + (smooth ? 1500 : 250) };
    if (smooth) viewport.scrollTo({ top: target, behavior: "smooth" });
    else viewport.scrollTop = target;
  }
  const smoothing = () => !!programmatic?.smooth && now() < programmatic.until;

  function setFollowing(value: boolean, reason: string) {
    value &&= followAllowed();
    if (value === following) return;
    following = value;
    el.toggleAttribute("data-following", value);
    if (value) emit("follow");
    else emit("unfollow", { reason });
  }

  function setUnread(value: boolean, newRows: Element[] = []) {
    if (value === unread) return;
    unread = value;
    el.toggleAttribute("data-unread", value);
    if (value) emit("unread", { rows: newRows });
  }

  /** Remember where the reader is: the first visible row (binary search: rows are in order). */
  function capture() {
    const list = rows();
    const top = viewTop();
    let lo = 0;
    let hi = list.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (list[mid]!.getBoundingClientRect().bottom > top) hi = mid;
      else lo = mid + 1;
    }
    ref = list.slice(lo, lo + 3).map((row) => ({ el: row, offset: row.getBoundingClientRect().top - top }));
  }

  /** Hold this element (and its next rows, in case it goes) where it will be once the viewport
      reaches scrollTop `landed`: a smooth scroll has only just started, and scrollend restores. */
  function pin(target: Element, landed = viewport.scrollTop) {
    const top = viewTop() + landed - viewport.scrollTop;
    const row = rowOf(target);
    const next = row ? rows().slice(rows().indexOf(row) + 1, rows().indexOf(row) + 3) : [];
    ref = [target, ...next].map((e) => ({ el: e, offset: e.getBoundingClientRect().top - top }));
  }

  /** Put the remembered row back where it was. */
  function restore() {
    const top = viewTop();
    for (const r of ref) {
      if (!r.el.isConnected || !content.contains(r.el)) continue;
      const delta = r.el.getBoundingClientRect().top - top - r.offset;
      if (Math.abs(delta) >= 0.5) setTop(viewport.scrollTop + delta);
      return;
    }
    capture();
  }

  /** The spacer leaves room for the anchored turn to sit at the top until its reply fills the view. */
  function sizeSpacer() {
    const current = parseFloat(spacer.style.height) || 0;
    let height = 0;
    if (anchorEl?.isConnected && content.contains(anchorEl)) {
      const target = posOf(anchorEl) - anchorOffset();
      height = Math.max(0, Math.ceil(target + viewport.clientHeight - (viewport.scrollHeight - current)));
    } else anchorEl = null;
    if (height !== current) spacer.style.height = `${height}px`;
  }

  function refresh() {
    atEdge = isAtEdge();
    if (atEdge && unread) setUnread(false);
    el.toggleAttribute("data-at-bottom", atEdge);
    if (!jump) return;
    const state = atEdge ? "hidden" : streaming ? "streaming" : unread ? "unread" : "latest";
    if (jump.dataset.state !== state) jump.dataset.state = state;
    jump.toggleAttribute("inert", atEdge);
    if (atEdge) jump.setAttribute("aria-hidden", "true");
    else jump.removeAttribute("aria-hidden");
  }

  function anchorTo(row: Element, smooth = false) {
    anchorEl = row;
    sizeSpacer();
    const top = posOf(row) - anchorOffset();
    const landed = Math.round(Math.min(Math.max(top, 0), maxTop()));
    setTop(top, smooth);
    pin(row, landed);
    setUnread(false);
    setFollowing(landed >= maxTop() - threshold(), "anchor");
    emit("anchor", { row });
  }

  /** The run of rows just added at the end of the transcript (not prepended, not inserted mid-way). */
  function trailing(fresh: Set<Element>): Element[] {
    if (!fresh.size) return [];
    const list = rows();
    let i = list.length;
    while (i > 0 && fresh.has(list[i - 1]!)) i--;
    return list.slice(i);
  }

  /** The last anchor among the rows just appended. */
  function newAnchor(appended: Element[]): Element | null {
    const selector = anchorSelector();
    if (!selector) return null;
    for (const row of [...appended].reverse()) {
      const matches = queryAll<Element>(row, selector).filter((m) => !m.closest('[data-message-anchor="false"]'));
      if (matches.length) return matches[matches.length - 1]!;
    }
    return null;
  }

  function update() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    if (!el.isConnected) return;
    const fresh = new Set(added.map(rowOf).filter((r): r is Element => !!r));
    added = [];
    streaming = anyStreaming();

    const appended = trailing(fresh);
    const turn = newAnchor(appended);
    if (turn) {
      anchorTo(turn);
    } else {
      sizeSpacer();
      if (smoothing()) {
        // Our animation is running; scrollend settles it.
      } else if (following) setTop(maxTop());
      else restore();
      // Rows arrived at the end while the reader is away.
      if (appended.length && !following && !isAtEdge()) setUnread(true, appended);
    }
    refresh();
  }

  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  // --- announcements
  function announce(text: string) {
    if (!text) return;
    clearTimeout(announceTimer);
    const say = () => {
      lastAnnounce = now();
      status!.textContent = "";
      // A fresh text node, a tick later, so a repeated message is announced again.
      setTimeout(() => (status!.textContent = text), 50);
    };
    const wait = lastAnnounce + ANNOUNCE_GAP_MS - now();
    if (wait <= 0) say();
    else announceTimer = setTimeout(say, wait);
  }
  const text = (key: "messageScrollerAnnounceNew" | "messageScrollerAnnounceDone", fallback: string) =>
    el.dataset[key] ?? fallback;

  // --- observers
  const anyStreaming = () => el.hasAttribute("data-streaming") || !!content.querySelector("[data-streaming]");
  let wasStreaming = anyStreaming();
  /** Announce the end of a response: the last data-streaming went away. */
  const checkStreaming = () => {
    const still = anyStreaming();
    if (wasStreaming && !still) announce(text("messageScrollerAnnounceDone", "Response complete"));
    wasStreaming = still;
  };
  const contentObserver = new MutationObserver((records) => {
    for (const record of records) {
      if (record.type !== "childList") continue;
      for (const node of record.addedNodes) {
        if (!(node instanceof Element)) continue;
        // New rows, or new messages inside a row (e.g. appended to a .message-group).
        if (node.parentElement === content || node.matches(".message, [data-message]")) {
          added.push(node);
          const selector = anchorSelector();
          const own = selector && queryAll(node, selector).length;
          if (!own && !node.hasAttribute("data-streaming") && !node.querySelector("[data-streaming]")) {
            announce(text("messageScrollerAnnounceNew", "New message"));
          }
        }
      }
    }
    checkStreaming();
    schedule();
  });
  contentObserver.observe(content, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-streaming"] });
  const selfObserver = new MutationObserver(() => {
    checkStreaming();
    schedule();
  });
  selfObserver.observe(el, { attributes: true, attributeFilter: ["data-streaming"] });

  // Layout changes (images, code, markdown, the viewport itself) are handled in the same frame, before paint.
  const resizeObserver = typeof ResizeObserver === "function" ? new ResizeObserver(() => update()) : null;
  resizeObserver?.observe(content);
  resizeObserver?.observe(viewport);

  // --- the reader's signals
  const onScroll = () => {
    if (programmatic) {
      const fresh = now() < programmatic.until;
      if (programmatic.smooth && fresh) return refresh();
      if (fresh && Math.abs(viewport.scrollTop - programmatic.top) <= 1) {
        programmatic = null;
        return refresh();
      }
      programmatic = null;
    }
    // The reader moved (wheel, touch, keys, scrollbar, find in page…): follow only at the edge.
    capture();
    const edge = isAtEdge();
    if (!edge) setFollowing(false, "scroll");
    else if (!selecting) setFollowing(true, "scroll");
    refresh();
  };
  const onScrollEnd = () => {
    if (!programmatic?.smooth) return;
    programmatic = null;
    update();
  };
  const onWheel = (e: WheelEvent) => {
    if (e.deltaY < 0) {
      programmatic = null;
      setFollowing(false, "wheel");
    }
  };
  const onTouchStart = (e: TouchEvent) => (touchY = e.touches[0]?.clientY ?? 0);
  const onTouchMove = (e: TouchEvent) => {
    const y = e.touches[0]?.clientY ?? 0;
    if (y > touchY + 2) {
      programmatic = null;
      setFollowing(false, "touch");
    }
    touchY = y;
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (isEditable(e.target)) return;
    if (["PageUp", "ArrowUp", "Home"].includes(e.key) || (e.key === " " && e.shiftKey)) {
      programmatic = null;
      setFollowing(false, "keyboard");
    }
  };
  const onPointerDown = (e: PointerEvent) => {
    const target = e.target as Element | null;
    // A link about to open, or a press on the scrollbar.
    if (target?.closest?.("a[href]") || (target === viewport && e.offsetX > viewport.clientWidth)) {
      setFollowing(false, target === viewport ? "scroll" : "link");
    }
  };
  viewport.addEventListener("scroll", onScroll, { passive: true });
  viewport.addEventListener("scrollend", onScrollEnd, { passive: true });
  viewport.addEventListener("wheel", onWheel, { passive: true });
  viewport.addEventListener("touchstart", onTouchStart, { passive: true });
  viewport.addEventListener("touchmove", onTouchMove, { passive: true });
  viewport.addEventListener("keydown", onKeyDown);
  viewport.addEventListener("pointerdown", onPointerDown, { passive: true });

  jump?.addEventListener("click", () => {
    const hadFocus = jump.contains(document.activeElement);
    api.scrollToBottom({ smooth: true });
    // The button hides at the edge; keep focus in the transcript rather than losing it to <body>.
    if (hadFocus) viewport.focus({ preventScroll: true });
  });

  // Document-wide: text selection, links to rows, hash changes.
  const onSelection = () => {
    if (!el.isConnected) return teardown();
    const selection = document.getSelection();
    const node = selection && selection.rangeCount && !selection.isCollapsed ? selection.getRangeAt(0).commonAncestorContainer : null;
    selecting = !!node && content.contains(node);
    if (selecting) setFollowing(false, "selection");
  };
  const targetOf = (hash: string) => {
    if (!hash || hash === "#") return null;
    let id = hash.slice(1);
    try {
      id = decodeURIComponent(id);
    } catch {}
    const target = document.getElementById(id);
    return target && content.contains(target) ? target : null;
  };
  const onClick = (e: MouseEvent) => {
    if (!el.isConnected) return teardown();
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const link = (e.target as Element | null)?.closest?.("a[href]");
    const href = link?.getAttribute("href");
    if (!href || !href.includes("#")) return;
    let url: URL;
    try {
      url = new URL(href, location.href);
    } catch {
      return;
    }
    if (url.href.split("#")[0] !== location.href.split("#")[0]) return;
    const target = targetOf(url.hash);
    if (!target) return;
    e.preventDefault();
    try {
      history.replaceState(history.state, "", url.hash);
    } catch {}
    api.scrollToMessage(target, { smooth: true });
  };
  const onHash = () => {
    if (!el.isConnected) return teardown();
    const target = targetOf(location.hash);
    if (target) api.scrollToMessage(target, { smooth: true });
  };
  document.addEventListener("selectionchange", onSelection);
  document.addEventListener("click", onClick);
  window.addEventListener("hashchange", onHash);

  function teardown() {
    document.removeEventListener("selectionchange", onSelection);
    document.removeEventListener("click", onClick);
    window.removeEventListener("hashchange", onHash);
    contentObserver.disconnect();
    selfObserver.disconnect();
    resizeObserver?.disconnect();
    clearTimeout(announceTimer);
    if (frame) cancelAnimationFrame(frame);
  }

  function highlight(target: Element) {
    clearTimeout(highlights.get(target));
    target.removeAttribute("data-highlighted");
    void (target as HTMLElement).offsetWidth; // restart the animation
    target.setAttribute("data-highlighted", "");
    highlights.set(
      target,
      setTimeout(() => target.removeAttribute("data-highlighted"), HIGHLIGHT_MS),
    );
  }

  const api: MessageScroller = {
    element: el,
    viewport,
    content,
    get following() {
      return following;
    },
    get atBottom() {
      return atEdge;
    },
    get unread() {
      return unread;
    },
    scrollToBottom({ smooth = false } = {}) {
      sizeSpacer();
      setTop(maxTop(), smooth);
      setUnread(false);
      setFollowing(true, "jump");
      if (!smooth) capture();
      refresh();
    },
    scrollToMessage(target, { align = "start", highlight: flash = true, smooth = false } = {}) {
      const node = typeof target === "string" ? targetOf(target.startsWith("#") ? target : `#${target}`) : target;
      if (!node || !content.contains(node)) return false;
      sizeSpacer();
      const top = posOf(node);
      const height = node.getBoundingClientRect().height;
      const dest =
        align === "center"
          ? top - (viewport.clientHeight - height) / 2
          : align === "end"
            ? top + height - viewport.clientHeight
            : top - anchorOffset();
      const landed = Math.round(Math.min(Math.max(dest, 0), maxTop()));
      setTop(dest, smooth);
      pin(node, landed);
      setFollowing(landed >= maxTop() - threshold(), "jump");
      if (flash) highlight(node);
      if (!smooth) refresh();
      return true;
    },
    anchor(row, { smooth = false } = {}) {
      if (!content.contains(row)) return;
      anchorTo(row, smooth);
      refresh();
    },
    unfollow() {
      setFollowing(false, "api");
    },
    update,
    announce,
  };

  // --- open where the reader left off, without animation
  const open = () => {
    const how = el.dataset.messageScrollerOpen?.trim() || "last-anchor";
    const hashed = typeof location !== "undefined" ? targetOf(location.hash) : null;
    if (hashed) return api.scrollToMessage(hashed);
    if (how.startsWith("#")) {
      if (api.scrollToMessage(how, { highlight: false })) return;
    } else if (how === "top") {
      setTop(0);
      capture();
      return setFollowing(isAtEdge(), "open");
    } else if (how === "last-anchor") {
      const selector = anchorSelector();
      const all = selector
        ? queryAll<Element>(content, selector).filter((m) => m !== content && !m.closest('[data-message-anchor="false"]'))
        : [];
      if (all.length) return anchorTo(all[all.length - 1]!);
    }
    api.scrollToBottom();
  };
  open();
  refresh();
  instances.set(el, api);
  el.dataset.messageScrollerReady = "";
  return api;
}

export function initMessageScroller(root: ParentNode = document) {
  queryAll(root, "[data-message-scroller]:not([data-init])").forEach((el) => {
    el.dataset.init = "";
    const api = setup(el);
    el.dispatchEvent(new CustomEvent("message-scroller:init", { bubbles: true, detail: { api } }));
  });
}
