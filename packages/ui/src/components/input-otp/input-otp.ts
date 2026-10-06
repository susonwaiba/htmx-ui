// Input OTP: a one-time code typed into a row of slots. Markup: see input-otp.css.
// One real <input> lies transparent over the slots, so typing, pasting, SMS autofill
// (autocomplete="one-time-code"), the mobile keyboard and form submission are all native; the
// behaviour only filters what goes in and paints the slots.
// - data-pattern on the wrapper: "digits" (default), "alphanumeric", "alpha", or a regex
//   character class such as "[0-9a-f]". Other characters are dropped, so pasting "123-456" or
//   " 123 456 " gives 123456. data-case="upper" / "lower" converts letters as they are typed.
// - The input gets maxlength (one per slot) and, unless already set, inputmode (numeric for
//   digits), autocomplete="one-time-code" and a pattern for native validation.
// - ← → Home End move between slots; a filled slot is selected so typing replaces it.
// - data-mask shows "•" in the slots instead of the characters (PINs).
// - Filling the last slot fires a bubbling "input-otp:complete" with detail { value };
//   with data-submit the input's form is submitted too.
import { queryAll } from "../../utils/dom";

const PATTERNS: Record<string, string> = { digits: "[0-9]", alphanumeric: "[A-Za-z0-9]", alpha: "[A-Za-z]" };

export function initInputOtp(root: ParentNode) {
  queryAll(root, "[data-input-otp]:not([data-init])").forEach((otp) => {
    otp.dataset.init = "";
    const input = otp.querySelector<HTMLInputElement>("[data-input-otp-input], input");
    const slots = [...otp.querySelectorAll<HTMLElement>(".input-otp-slot, [data-input-otp-slot]")];
    if (!input || !slots.length) return;

    const length = slots.length;
    const kind = otp.dataset.pattern ?? "digits";
    const chars = PATTERNS[kind] ?? kind;
    const allowed = new RegExp(chars);
    const upper = otp.dataset.case === "upper";
    const lower = otp.dataset.case === "lower";

    input.maxLength = length;
    if (!input.hasAttribute("inputmode")) input.inputMode = kind === "digits" ? "numeric" : "text";
    if (!input.hasAttribute("autocomplete")) input.autocomplete = "one-time-code";
    if (!input.hasAttribute("pattern")) input.pattern = `${chars}{${length}}`;
    input.autocapitalize = upper ? "characters" : "off";
    input.spellcheck = false;
    input.setAttribute("autocorrect", "off");

    const clean = (text: string) => {
      const cased = upper ? text.toUpperCase() : lower ? text.toLowerCase() : text;
      return [...cased].filter((c) => allowed.test(c)).join("").slice(0, length);
    };
    const select = (start: number, end = start) => input.setSelectionRange(start, end);

    function render() {
      const value = input!.value;
      const focused = document.activeElement === input;
      const start = Math.min(input!.selectionStart ?? value.length, length - 1);
      const end = Math.max(input!.selectionEnd ?? start, start + 1);
      slots.forEach((slot, i) => {
        const char = value[i];
        slot.textContent = char === undefined ? "" : otp.hasAttribute("data-mask") ? "•" : char;
        slot.toggleAttribute("data-filled", char !== undefined);
        slot.toggleAttribute("data-active", focused && i >= start && i < end);
      });
    }

    let last = input.value;
    function update(e?: Event) {
      const value = clean(input!.value);
      if (value !== input!.value) {
        const caret = Math.min(input!.selectionStart ?? value.length, value.length);
        input!.value = value;
        select(caret);
      }
      // Typed over a slot in the middle: select the next one, so typing goes on replacing.
      const caret = input!.selectionStart ?? value.length;
      if ((e as InputEvent | undefined)?.inputType?.startsWith("insert") && caret < value.length) select(caret, caret + 1);
      render();
      if (value.length === length && value !== last) {
        otp.dispatchEvent(new CustomEvent("input-otp:complete", { bubbles: true, detail: { value } }));
        if (otp.hasAttribute("data-submit")) input!.form?.requestSubmit();
      }
      last = value;
    }

    input.addEventListener("input", update);
    // A pasted code replaces the whole value: a full input would otherwise refuse it (maxlength).
    input.addEventListener("paste", (e) => {
      const text = clean(e.clipboardData?.getData("text") ?? "");
      if (!text) return;
      e.preventDefault();
      const from = input.selectionStart ?? 0;
      const to = input.selectionEnd ?? from;
      const value = text.length >= length ? text : clean(input.value.slice(0, from) + text + input.value.slice(to));
      input.value = value;
      select(Math.min(from + text.length, value.length));
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });

    input.addEventListener("keydown", (e) => {
      const len = input.value.length;
      // Move from the slot that looks active: the caret's, or the last one once the code is full.
      const on = Math.min(input.selectionStart ?? len, length - 1);
      const at = { ArrowLeft: on - 1, ArrowRight: on + 1, Home: 0, End: len }[e.key];
      if (at === undefined || e.shiftKey || e.metaKey || e.ctrlKey || e.altKey) return;
      e.preventDefault();
      const to = Math.max(0, at);
      if (to < len) select(to, to + 1);
      else select(len);
      render();
    });

    // Clicking a filled slot selects it; anywhere else puts the caret after the last character.
    input.addEventListener("pointerup", (e) => {
      const len = input.value.length;
      const i = slots.findIndex((slot) => {
        const r = slot.getBoundingClientRect();
        return e.clientX >= r.left && e.clientX <= r.right;
      });
      if (i >= 0 && i < len) select(i, i + 1);
      else select(len);
      render();
    });
    input.addEventListener("focus", () => {
      select(input.value.length);
      render();
    });
    input.addEventListener("blur", render);
    input.addEventListener("select", render);
    input.addEventListener("keyup", render);

    // A server-rendered value (an error re-render) fills the slots on load.
    input.value = clean(input.value);
    last = input.value;
    render();
  });
}
