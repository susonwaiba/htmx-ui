// Reasoning: AI reasoning that opens while it streams and closes when it's done. Markup: see reasoning.css.
// - While data-streaming is on the <details> it is open, aria-busy, and its .reasoning-label is a
//   shimmering "Thinking…" (data-reasoning-streaming-label). Whoever flips the attribute (a script,
//   an htmx morph swap) is watched with a MutationObserver.
// - When data-streaming goes, the label becomes "Thought for N seconds" (data-reasoning-done-label,
//   {s} = seconds; N is data-reasoning-duration if the server set one, else the time it streamed),
//   and it closes after data-reasoning-close-delay ms (default 1000), unless
//   data-reasoning-auto-close="false" or the reader toggled it while it streamed.
// - Replaced by htmx (hx-swap="outerHTML") mid-stream? Give it an id: the new element picks up the
//   old one's start time and the reader's choice, so a final, non-streaming swap still closes it.
// - Fires bubbling "reasoning:start" and "reasoning:end" (detail { duration } in seconds).
// - Starting without data-streaming, it is left as authored.
import { queryAll } from "../../utils/dom";

type Run = { start: number; touched: boolean; open: boolean };
// Streams in progress, by element id, so a replacement element can carry on.
const runs = new Map<string, Run>();

const DEFAULT_DONE = "Thought for {s} seconds";

function doneLabel(el: HTMLElement, seconds: number) {
  const template = el.dataset.reasoningDoneLabel;
  if (template) return template.replaceAll("{s}", String(seconds));
  return seconds === 1 ? "Thought for 1 second" : DEFAULT_DONE.replace("{s}", String(seconds));
}

export function initReasoning(root: ParentNode = document) {
  queryAll<HTMLDetailsElement>(root, "[data-reasoning]:not([data-init])").forEach((el) => {
    el.dataset.init = "";
    const summary = [...el.children].find((c) => c.tagName === "SUMMARY") as HTMLElement | undefined;
    const label = summary?.querySelector<HTMLElement>(".reasoning-label") ?? null;

    // The previous element's run, when this one replaced it.
    const previous = el.id ? runs.get(el.id) : undefined;
    let run: Run | null = null;
    let closeTimer: ReturnType<typeof setTimeout> | undefined;

    const streaming = () => el.hasAttribute("data-streaming");
    const emit = (name: string, detail: object = {}) =>
      el.dispatchEvent(new CustomEvent(name, { bubbles: true, detail }));

    function start(from?: Run) {
      clearTimeout(closeTimer);
      closeTimer = undefined;
      run = from ?? { start: Date.now(), touched: false, open: true };
      if (el.id) runs.set(el.id, run);
      if (!from) el.removeAttribute("data-reasoning-duration");
      el.open = from?.touched ? from.open : true;
      el.setAttribute("aria-busy", "true");
      // The markup loader("text-shimmer", label=none) writes (components/loader/loader.html).
      if (label && !label.querySelector(".loader")) {
        const shimmer = document.createElement("span");
        shimmer.className = "loader loader-text-shimmer";
        shimmer.textContent = el.dataset.reasoningStreamingLabel ?? "Thinking…";
        label.replaceChildren(shimmer);
      }
      if (!from) emit("reasoning:start");
    }

    function end() {
      const done = run;
      run = null;
      if (!done) return;
      if (el.id) runs.delete(el.id);
      el.removeAttribute("aria-busy");
      const given = Number.parseFloat(el.dataset.reasoningDuration ?? "");
      const seconds = Number.isFinite(given) ? given : Math.max(1, Math.round((Date.now() - done.start) / 1000));
      el.dataset.reasoningDuration = String(seconds);
      if (label) label.textContent = doneLabel(el, seconds);
      emit("reasoning:end", { duration: seconds });
      if (done.touched || el.dataset.reasoningAutoClose === "false" || !el.open) return;
      const delay = Number.parseFloat(el.dataset.reasoningCloseDelay ?? "");
      closeTimer = setTimeout(
        () => {
          closeTimer = undefined;
          el.open = false;
        },
        Number.isFinite(delay) ? delay : 1000,
      );
    }

    // The reader's own toggles: while streaming, or before the auto-close, they win.
    summary?.addEventListener("click", () => {
      if (closeTimer !== undefined) {
        clearTimeout(closeTimer);
        closeTimer = undefined;
      }
      if (run) {
        run.touched = true;
        run.open = !el.open; // the click is about to toggle it
      }
    });

    new MutationObserver(() => {
      if (streaming() && !run) start();
      else if (!streaming() && run) end();
    }).observe(el, { attributes: true, attributeFilter: ["data-streaming"] });

    if (streaming()) start(previous);
    else if (previous) {
      // The final swap of a stream: show it as the reader had it, then finish as usual.
      el.open = previous.touched ? previous.open : true;
      run = previous;
      end();
    }
  });
}
