// Password input: a password field with a show / hide toggle. Markup: see password-input.css.
// - The toggle is a button with data-password-toggle (aria-pressed shows the state; its label stays
//   "Show password") or a checkbox with data-password-toggle ("Show passwords" under a form).
// - It switches every input[data-password] (or type="password") in the wrapper between
//   type="password" and type="text", keeping the caret and selection.
// - Submitting the form hides the password again first, so browsers offer to save it and it isn't
//   left on screen after an htmx swap. Disabled inputs disable the toggle.
// - Elements with data-password-caps in the wrapper's .field (or parent) are shown while Caps Lock
//   is on as the user types.
// - Fires a bubbling "password-input:toggle" with detail { visible } on the wrapper.
import { queryAll } from "../../utils/dom";
import { ensureId } from "../../utils/shared";

export function initPasswordInput(root: ParentNode) {
  queryAll(root, "[data-password-input]:not([data-init])").forEach((el) => {
    el.dataset.init = "";
    const inputs = [...el.querySelectorAll<HTMLInputElement>("input[data-password], input[type='password']")];
    if (!inputs.length) return;
    const toggles = [...el.querySelectorAll<HTMLElement>("[data-password-toggle]")];
    const scope = el.closest(".field") ?? el.parentElement ?? el;
    const caps = [...scope.querySelectorAll<HTMLElement>("[data-password-caps]")];
    const ids = inputs.map((input) => ensureId(input, "password")).join(" ");
    let visible = false;

    function show(on: boolean) {
      if (on === visible) return;
      visible = on;
      for (const input of inputs) {
        const focused = document.activeElement === input;
        const { selectionStart: start, selectionEnd: end } = input;
        input.type = on ? "text" : "password";
        if (focused && start !== null) input.setSelectionRange(start, end);
      }
      sync();
      el.dispatchEvent(new CustomEvent("password-input:toggle", { bubbles: true, detail: { visible: on } }));
    }

    function sync() {
      el.toggleAttribute("data-visible", visible);
      const disabled = inputs.every((input) => input.disabled);
      for (const toggle of toggles) {
        if (toggle instanceof HTMLInputElement) toggle.checked = visible;
        else toggle.setAttribute("aria-pressed", String(visible));
        toggle.toggleAttribute("disabled", disabled);
      }
    }

    for (const toggle of toggles) {
      toggle.setAttribute("aria-controls", ids);
      if (toggle instanceof HTMLInputElement) {
        toggle.addEventListener("change", () => show(toggle.checked));
      } else {
        if (!toggle.hasAttribute("aria-label")) toggle.setAttribute("aria-label", "Show password");
        toggle.addEventListener("click", () => show(!visible));
        // Keep focus (and the phone keyboard) in the input when the toggle is tapped while typing.
        toggle.addEventListener("pointerdown", (e) => {
          if (inputs.includes(document.activeElement as HTMLInputElement)) e.preventDefault();
        });
      }
    }

    inputs[0]!.form?.addEventListener("submit", () => show(false));

    const hideCaps = () => caps.forEach((hint) => (hint.hidden = true));
    const capsLock = (e: KeyboardEvent) => {
      const on = typeof e.getModifierState === "function" && e.getModifierState("CapsLock");
      for (const hint of caps) hint.hidden = !on;
    };
    if (caps.length) {
      hideCaps();
      for (const input of inputs) {
        input.addEventListener("keydown", capsLock);
        input.addEventListener("keyup", capsLock);
        input.addEventListener("blur", hideCaps);
      }
    }

    sync();
  });
}
