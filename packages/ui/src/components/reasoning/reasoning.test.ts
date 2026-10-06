import { afterEach, describe, expect, test } from "bun:test";
import { initReasoning } from "./reasoning";

const tick = () => new Promise((r) => setTimeout(r, 0));
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function mount(attrs = "", label = "Reasoning") {
  document.body.innerHTML = `<details class="reasoning" data-reasoning ${attrs}>
    <summary class="reasoning-trigger"><span class="reasoning-label">${label}</span></summary>
    <div class="reasoning-content">Step one.</div>
  </details>`;
  const el = document.querySelector<HTMLDetailsElement>("[data-reasoning]")!;
  initReasoning(document);
  return {
    el,
    label: el.querySelector<HTMLElement>(".reasoning-label")!,
    summary: el.querySelector<HTMLElement>("summary")!,
  };
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("reasoning", () => {
  test("initialises once", () => {
    const { el } = mount();
    initReasoning(document);
    expect(el.hasAttribute("data-init")).toBe(true);
  });

  test("starting without data-streaming leaves it as authored", () => {
    const { el, label } = mount("", "Thought for 3 seconds");
    expect(el.open).toBe(false);
    expect(label.textContent).toBe("Thought for 3 seconds");
    expect(el.hasAttribute("aria-busy")).toBe(false);
  });

  test("opens and shimmers while streaming", () => {
    const { el, label } = mount("data-streaming");
    expect(el.open).toBe(true);
    expect(el.getAttribute("aria-busy")).toBe("true");
    const shimmer = label.querySelector(".loader.loader-text-shimmer")!;
    expect(shimmer.textContent).toBe("Thinking…");
  });

  test("a custom streaming label", () => {
    const { label } = mount('data-streaming data-reasoning-streaming-label="Pondering…"');
    expect(label.textContent).toBe("Pondering…");
  });

  test("opens when data-streaming is added later", async () => {
    const { el } = mount();
    let started = 0;
    el.addEventListener("reasoning:start", () => started++);
    el.setAttribute("data-streaming", "");
    await tick();
    expect(el.open).toBe(true);
    expect(started).toBe(1);
  });

  test("closes after the delay once streaming ends, with the duration in the label", async () => {
    const { el, label } = mount('data-streaming data-reasoning-close-delay="20"');
    let detail: { duration: number } | undefined;
    el.addEventListener("reasoning:end", (e) => (detail = (e as CustomEvent).detail));
    el.removeAttribute("data-streaming");
    await tick();
    expect(label.textContent).toBe("Thought for 1 second");
    expect(el.dataset.reasoningDuration).toBe("1");
    expect(detail).toEqual({ duration: 1 });
    expect(el.hasAttribute("aria-busy")).toBe(false);
    expect(el.open).toBe(true);
    await wait(40);
    expect(el.open).toBe(false);
  });

  test("a server-given duration and a custom done label", async () => {
    const { el, label } = mount('data-streaming data-reasoning-done-label="Reasoned for {s}s"');
    el.dataset.reasoningDuration = "12";
    el.removeAttribute("data-streaming");
    await tick();
    expect(label.textContent).toBe("Reasoned for 12s");
  });

  test("data-reasoning-auto-close=false keeps it open", async () => {
    const { el } = mount('data-streaming data-reasoning-close-delay="0" data-reasoning-auto-close="false"');
    el.removeAttribute("data-streaming");
    await wait(20);
    expect(el.open).toBe(true);
  });

  test("a toggle by the reader while streaming is respected", async () => {
    const { el, summary } = mount('data-streaming data-reasoning-close-delay="0"');
    summary.click();
    el.open = true; // the reader kept it open (re-opened it)
    el.removeAttribute("data-streaming");
    await wait(20);
    expect(el.open).toBe(true);
  });

  test("a click during the close delay cancels the auto-close", async () => {
    const { el, summary } = mount('data-streaming data-reasoning-close-delay="30"');
    el.removeAttribute("data-streaming");
    await tick();
    summary.click();
    el.open = true;
    await wait(50);
    expect(el.open).toBe(true);
  });

  test("an htmx-style replacement by id carries the stream on and closes it at the end", async () => {
    document.body.innerHTML = `<div id="host"><details class="reasoning" id="r1" data-reasoning data-streaming data-reasoning-close-delay="10">
      <summary class="reasoning-trigger"><span class="reasoning-label"></span></summary><div class="reasoning-content">a</div></details></div>`;
    initReasoning(document);
    const host = document.getElementById("host")!;
    // Mid-stream replacement: still streaming.
    host.innerHTML = `<details class="reasoning" id="r1" data-reasoning data-streaming data-reasoning-close-delay="10">
      <summary class="reasoning-trigger"><span class="reasoning-label"></span></summary><div class="reasoning-content">a b</div></details>`;
    initReasoning(host);
    // Final swap: done, authored closed.
    host.innerHTML = `<details class="reasoning" id="r1" data-reasoning data-reasoning-close-delay="10">
      <summary class="reasoning-trigger"><span class="reasoning-label">Reasoning</span></summary><div class="reasoning-content">a b c</div></details>`;
    const final = host.querySelector<HTMLDetailsElement>("details")!;
    initReasoning(host);
    expect(final.open).toBe(true);
    expect(final.querySelector(".reasoning-label")!.textContent).toBe("Thought for 1 second");
    await wait(30);
    expect(final.open).toBe(false);
  });
});
