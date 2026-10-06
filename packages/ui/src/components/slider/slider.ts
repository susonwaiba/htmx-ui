// Slider: one or more thumbs (native range inputs) on a shared track. Markup: see slider.css.
// - Paints the filled range (--slider-start / --slider-end) as the values change.
// - Keeps thumbs in order: a thumb stops at its neighbours (plus data-slider-gap).
// - A press on the track moves the nearest thumb there and drags it.
// - Fills every <output for="…"> naming the inputs' ids with their values, joined by " – ".
// - Set values from script with input.value = …, then dispatch an "input" event to repaint.
import { queryAll } from "../../utils/dom";

const RANGE = 'input[type="range"]';

const bounds = (input: HTMLInputElement) => {
  const min = input.min === "" ? 0 : Number(input.min);
  const max = input.max === "" ? 100 : Number(input.max);
  return { min, max };
};

/** Where the input's value sits between its min and max, 0–100. */
function percent(input: HTMLInputElement): number {
  const { min, max } = bounds(input);
  return max > min ? Math.min(100, Math.max(0, ((Number(input.value) - min) / (max - min)) * 100)) : 0;
}

export function initSlider(root: ParentNode) {
  queryAll(root, "[data-slider]:not([data-init])").forEach((slider) => {
    slider.dataset.init = "";
    const inputs = [...slider.querySelectorAll<HTMLInputElement>(`:scope > ${RANGE}`)];
    if (!inputs.length) return;
    const vertical = slider.dataset.orientation === "vertical";
    const gap = Number(slider.dataset.sliderGap) || 0;
    if (vertical) inputs.forEach((i) => i.setAttribute("aria-orientation", "vertical"));

    const paint = () => {
      const p = inputs.map(percent);
      slider.style.setProperty("--slider-start", `${inputs.length > 1 ? Math.min(...p) : 0}%`);
      slider.style.setProperty("--slider-end", `${Math.max(...p)}%`);
      // Thumbs at the top of the range stack lower ones above, at the bottom higher ones, so
      // two thumbs at the same end can always be pulled apart.
      inputs.forEach((input, i) => (input.style.zIndex = String(p[i]! > 50 ? inputs.length - i : i + 1)));
      const ids = new Set(inputs.map((i) => i.id).filter(Boolean));
      if (!ids.size) return;
      document.querySelectorAll<HTMLOutputElement>("output[for]").forEach((out) => {
        const named = out.getAttribute("for")!.split(/\s+/).filter((id) => ids.has(id));
        if (!named.length) return;
        out.textContent = named.map((id) => (document.getElementById(id) as HTMLInputElement).value).join(" – ");
      });
    };

    inputs.forEach((input, i) => {
      input.addEventListener("input", () => {
        const prev = inputs[i - 1];
        const next = inputs[i + 1];
        let value = Number(input.value);
        if (prev && value < Number(prev.value) + gap) value = Number(prev.value) + gap;
        if (next && value > Number(next.value) - gap) value = Number(next.value) - gap;
        if (value !== Number(input.value)) input.value = String(value);
        paint();
      });
    });

    // A press on the track (not on a thumb): move the nearest thumb there, then drag it.
    slider.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 || (e.target as Element).matches(RANGE)) return;
      const enabled = inputs.filter((i) => !i.disabled);
      if (!enabled.length) return;
      const track = slider.querySelector<HTMLElement>(".slider-track") ?? slider;
      const rtl = getComputedStyle(slider).direction === "rtl";
      const ratio = (ev: PointerEvent) => {
        const r = track.getBoundingClientRect();
        const size = vertical ? r.height : r.width;
        if (!size) return 0;
        let t = vertical ? (r.bottom - ev.clientY) / size : (ev.clientX - r.left) / size;
        if (rtl && !vertical) t = 1 - t;
        return Math.min(1, Math.max(0, t));
      };
      const at = ratio(e) * 100;
      // Nearest thumb; on a tie (stacked thumbs) the one on the side of the press.
      const input = enabled.reduce((best, cur) => {
        const d = Math.abs(percent(cur) - at);
        const b = Math.abs(percent(best) - at);
        return d < b || (d === b && at > percent(cur)) ? cur : best;
      });
      const set = (t: number) => {
        const { min, max } = bounds(input);
        const step = input.step === "any" ? 0 : Number(input.step) || 1;
        let value = min + t * (max - min);
        if (step) value = min + Math.round((value - min) / step) * step;
        const text = String(Number(value.toFixed(10)));
        if (text === input.value) return;
        input.value = text;
        input.dispatchEvent(new Event("input", { bubbles: true }));
      };

      e.preventDefault();
      input.focus();
      set(ratio(e));
      try {
        slider.setPointerCapture(e.pointerId);
      } catch {}
      const move = (ev: PointerEvent) => set(ratio(ev));
      const up = () => {
        slider.removeEventListener("pointermove", move);
        slider.removeEventListener("pointerup", up);
        slider.removeEventListener("pointercancel", up);
        input.dispatchEvent(new Event("change", { bubbles: true }));
      };
      slider.addEventListener("pointermove", move);
      slider.addEventListener("pointerup", up);
      slider.addEventListener("pointercancel", up);
    });

    // A form reset puts the values back after this event; repaint once it has.
    inputs[0]!.form?.addEventListener("reset", () => setTimeout(paint));
    paint();
  });
}
