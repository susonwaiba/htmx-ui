// Prompt input: the text box of a chat with an AI model. Markup: see prompt-input.css.
// - Enter submits the form with requestSubmit() (so htmx and validation run), Shift+Enter starts a
//   new line. Nothing is sent while the box is empty (no text and no .attachment inside) or a
//   request is running. The textarea grows with its text (CSS field-sizing, or data-textarea's
//   fallback from textarea.ts) up to its max height.
// - [data-prompt-input-submit] is disabled while the box is empty. While the form has
//   data-state="loading" it becomes a stop button: enabled, labelled data-prompt-input-stop-label
//   ("Stop"), and a click fires a cancelable "prompt-input:stop" on the form, then aborts the
//   form's htmx request (htmx:abort), or clears data-state when there is no htmx request.
// - htmx: data-state="loading" is set on htmx:before:request from the form and cleared on
//   htmx:finally:request (htmx 4 fires it after success, error and abort alike; htmx:after:request
//   is skipped on abort). A response under 400 clears the textarea, unless
//   data-prompt-input-clear="false". Apps without htmx set and clear data-state themselves.
// - Menus: [data-prompt-input-menu="@"] is a listbox of suggestions opened by typing its trigger
//   at the start of the text or after a space; "/" menus only open at the very start of the text
//   (data-prompt-input-position="start" | "word" overrides that). The text after the trigger
//   filters the options (value, text and data-keywords; case and accents ignored). With
//   data-prompt-input-src the options come from the server instead: GET src?q=…&trigger=…
//   (debounced, data-prompt-input-delay ms) returns option markup that replaces the menu's content.
// - While a menu is open: ↓ ↑ move the highlight (aria-activedescendant on the textarea), Enter or
//   Tab picks, Escape closes it until the next trigger. Picking replaces the trigger and query with
//   the trigger + the option's data-value + a space (or the option's data-insert), then fires
//   "prompt-input:select" on the form with detail { trigger, value, option, query }.
import { queryAll } from "../../utils/dom";
import { dismissable } from "../../utils/dismiss";
import { activeDescendant, filterOptions, reachable } from "../../utils/listbox";
import { ensureId, responseOk } from "../../utils/shared";

type Token = { menu: HTMLElement; trigger: string; start: number; end: number; query: string };


export function initPromptInput(root: ParentNode) {
  queryAll<HTMLFormElement>(root, "[data-prompt-input]:not([data-init])").forEach((form) => {
    form.dataset.init = "";
    const textarea = form.querySelector<HTMLTextAreaElement>("textarea");
    if (!textarea) return;

    const menus = [...form.querySelectorAll<HTMLElement>("[data-prompt-input-menu]")];
    const submits = [...form.querySelectorAll<HTMLButtonElement>("[data-prompt-input-submit]")];
    const labels = new Map(submits.map((b) => [b, b.getAttribute("aria-label")]));
    let token: Token | null = null;
    let dismissed: { menu: HTMLElement; start: number } | null = null;
    let inflight = false;

    // --- Submitting ---------------------------------------------------------------------------
    const loading = () => form.dataset.state === "loading";
    const empty = () => !textarea.value.trim() && !form.querySelector(".attachment, [data-prompt-input-attachment]");

    function update() {
      const busy = loading();
      for (const b of submits) {
        b.disabled = !busy && (empty() || textarea!.disabled);
        const label = busy ? (b.dataset.promptInputStopLabel ?? "Stop") : labels.get(b);
        if (label) b.setAttribute("aria-label", label);
        else b.removeAttribute("aria-label");
      }
    }

    function submit() {
      if (empty() || loading() || textarea!.disabled) return;
      form.requestSubmit();
    }

    function stop() {
      const go = form.dispatchEvent(new CustomEvent("prompt-input:stop", { bubbles: true, cancelable: true }));
      if (!go) return;
      if (inflight) form.dispatchEvent(new CustomEvent("htmx:abort"));
      else {
        delete form.dataset.state;
        update();
      }
    }

    for (const b of submits) {
      b.addEventListener("click", (e) => {
        if (!loading()) return;
        e.preventDefault();
        stop();
      });
    }

    form.addEventListener("htmx:before:request", (e) => {
      if (e.target !== form) return;
      inflight = true;
      form.dataset.state = "loading";
      update();
    });
    form.addEventListener("htmx:finally:request", (e) => {
      if (e.target !== form) return;
      inflight = false;
      delete form.dataset.state;
      if (responseOk(e) && form.dataset.promptInputClear !== "false") {
        textarea.value = "";
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
      }
      update();
    });

    // Attachments added or removed, or data-state set by the app.
    new MutationObserver(update).observe(form, {
      attributes: true,
      attributeFilter: ["data-state"],
      childList: true,
      subtree: true,
    });

    // --- Menus --------------------------------------------------------------------------------
    for (const menu of menus) {
      ensureId(menu, "prompt-input-menu");
      if (!menu.hasAttribute("role")) menu.setAttribute("role", "listbox");
      menu.hidden = true;
    }
    if (menus.length) {
      textarea.setAttribute("role", "combobox");
      textarea.setAttribute("aria-multiline", "true");
      textarea.setAttribute("aria-autocomplete", "list");
      textarea.setAttribute("aria-haspopup", "listbox");
      textarea.setAttribute("aria-expanded", "false");
    }

    const triggerOf = (menu: HTMLElement) => menu.dataset.promptInputMenu || "@";
    const options = (menu: HTMLElement) => reachable(menu);
    const valueOf = (o: HTMLElement) => o.dataset.value ?? o.getAttribute("value") ?? o.textContent?.trim() ?? "";

    // The trigger and query the caret is in, if any: the one starting closest to the caret.
    function find(): Token | null {
      const caret = textarea!.selectionStart;
      if (caret !== textarea!.selectionEnd) return null;
      const text = textarea!.value;
      const before = text.slice(0, caret);
      let found: Token | null = null;
      for (const menu of menus) {
        const trigger = triggerOf(menu);
        const position = menu.dataset.promptInputPosition ?? (trigger === "/" ? "start" : "word");
        const start = before.lastIndexOf(trigger);
        if (start < 0 || (found && found.start >= start)) continue;
        const query = before.slice(start + trigger.length);
        if (/\s/.test(query)) continue;
        if (position === "start" ? start !== 0 : start > 0 && !/\s/.test(before[start - 1]!)) continue;
        const end = caret + (text.slice(caret).match(/^\S*/)?.[0].length ?? 0);
        found = { menu, trigger, start, end, query };
      }
      return found;
    }

    // Matches the query anywhere in an option's value, text or data-keywords.
    function filter(menu: HTMLElement, query: string) {
      const shown = filterOptions(menu, query, {
        matches: (text, q) => text.includes(q),
        text: (o) => `${valueOf(o)} ${o.textContent ?? ""} ${o.dataset.keywords ?? ""}`,
      });
      const none = menu.querySelector<HTMLElement>("[data-prompt-input-empty]");
      if (none) none.hidden = shown > 0;
    }

    // The highlight moves through the open menu while focus stays in the textarea.
    const open = () => menus.find((m) => !m.hidden);
    const list = activeDescendant(textarea, {
      all: () => menus.flatMap((m) => [...m.querySelectorAll<HTMLElement>('[role="option"]')]),
      options: () => {
        const menu = open();
        return menu ? options(menu) : [];
      },
    });
    const highlight = list.highlight;
    const dismiss = dismissable(form, () => close());

    // Show `menu` for the current token, or close it when there is nothing to show.
    function show(menu: HTMLElement) {
      menu.querySelectorAll<HTMLElement>('[role="option"]').forEach((o, i) => (o.id ||= `${menu.id}-option-${i}`));
      const reach = options(menu);
      const none = menu.querySelector<HTMLElement>("[data-prompt-input-empty]:not([hidden])");
      if (!reach.length && !none) return close();
      for (const m of menus) if (m !== menu) m.hidden = true;
      if (menu.hidden) {
        menu.hidden = false;
        dismiss.opened();
        // Opens above the box; below instead when it doesn't fit above and there's more room there.
        if (!menu.classList.contains("prompt-input-menu-down")) {
          const box = form.getBoundingClientRect();
          const need = menu.offsetHeight + 8;
          if (box.top < need && innerHeight - box.bottom > box.top) menu.dataset.side = "bottom";
          else delete menu.dataset.side;
        }
      }
      textarea!.setAttribute("aria-expanded", "true");
      textarea!.setAttribute("aria-controls", menu.id);
      const active = list.active;
      highlight(active && reach.includes(active) ? active : reach[0], false);
    }

    function close() {
      token = null;
      highlight(null);
      dismiss.closed();
      for (const m of menus) m.hidden = true;
      if (menus.length) textarea!.setAttribute("aria-expanded", "false");
      textarea!.removeAttribute("aria-controls");
    }
    const isOpen = () => menus.some((m) => !m.hidden);

    // Server suggestions: debounced, and only the newest answer counts.
    let timer: ReturnType<typeof setTimeout> | undefined;
    let controller: AbortController | undefined;
    function load(t: Token, src: string) {
      clearTimeout(timer);
      controller?.abort();
      timer = setTimeout(async () => {
        const ctrl = (controller = new AbortController());
        const params = new URLSearchParams({ q: t.query, trigger: t.trigger });
        t.menu.setAttribute("aria-busy", "true");
        try {
          const res = await fetch(`${src}${src.includes("?") ? "&" : "?"}${params}`, {
            signal: ctrl.signal,
            headers: { "HX-Request": "true" },
          });
          const body = await res.text();
          if (ctrl.signal.aborted || token?.menu !== t.menu || token.start !== t.start) return;
          highlight(null);
          t.menu.innerHTML = res.ok ? body : "";
          show(t.menu);
        } catch {
          // Aborted by a newer query, or offline: keep what is shown.
        } finally {
          if (controller === ctrl) t.menu.removeAttribute("aria-busy");
        }
      }, Number(t.menu.dataset.promptInputDelay ?? 150));
    }

    function evaluate() {
      if (!menus.length) return;
      const t = find();
      if (dismissed && (!t || t.menu !== dismissed.menu || t.start !== dismissed.start)) dismissed = null;
      if (!t || dismissed) return close();
      const changed = !token || token.menu !== t.menu || token.query !== t.query || token.start !== t.start;
      token = t;
      if (!changed) return;
      const src = t.menu.dataset.promptInputSrc;
      if (src) load(t, src);
      else {
        filter(t.menu, t.query);
        show(t.menu);
      }
    }

    function pick(option: HTMLElement) {
      if (!token) return;
      const { trigger, start, end, query } = token;
      const value = valueOf(option);
      let insert = option.dataset.insert ?? `${trigger}${value} `;
      const text = textarea!.value;
      const tail = text.slice(end);
      let caret = start + insert.length;
      if (insert.endsWith(" ") && /^\s/.test(tail)) {
        insert = insert.slice(0, -1); // the space is already there: step over it
      }
      textarea!.value = text.slice(0, start) + insert + tail;
      textarea!.setSelectionRange(caret, caret);
      close();
      textarea!.dispatchEvent(new Event("input", { bubbles: true }));
      form.dispatchEvent(new CustomEvent("prompt-input:select", { bubbles: true, detail: { trigger, value, option, query } }));
    }

    // --- Keys ---------------------------------------------------------------------------------
    // Capture phase on the form, so this runs before any keydown handler on the textarea itself
    // (data-textarea-submit would otherwise send the form on Enter too).
    form.addEventListener(
      "keydown",
      (e) => {
        if (e.target !== textarea || e.isComposing) return;
        if (isOpen()) {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            list.move(e.key === "ArrowDown" ? 1 : -1);
            return;
          }
          if ((e.key === "Enter" && !e.shiftKey) || (e.key === "Tab" && !e.shiftKey)) {
            if (list.active) {
              e.preventDefault();
              e.stopPropagation();
              pick(list.active);
              return;
            }
          }
          if (e.key === "Escape") {
            e.preventDefault();
            e.stopPropagation();
            if (token) dismissed = { menu: token.menu, start: token.start };
            close();
            return;
          }
        }
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          e.stopPropagation();
          submit();
        }
      },
      true,
    );

    textarea.addEventListener("input", () => {
      update();
      evaluate();
    });
    textarea.addEventListener("click", evaluate);
    textarea.addEventListener("keyup", (e) => {
      if (/^(Arrow(Left|Right)|Home|End)$/.test(e.key)) evaluate();
    });

    for (const menu of menus) {
      // Clicks on the list must not take focus from the textarea; the highlight follows the pointer.
      list.bindPointer(menu);
      menu.addEventListener("click", (e) => {
        const option = (e.target as Element).closest<HTMLElement>('[role="option"]');
        if (option && options(menu).includes(option)) {
          pick(option);
          textarea.focus();
        }
      });
    }

    // A click on the box's empty space puts the caret in the textarea, as in one big input.
    form.addEventListener("click", (e) => {
      const target = e.target as Element;
      if (target === form || target.matches(".prompt-input-actions, .prompt-input-tools")) textarea.focus();
    });
    form.addEventListener("reset", () => setTimeout(() => (update(), close())));

    update();
  });
}
