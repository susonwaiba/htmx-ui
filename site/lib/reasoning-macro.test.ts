// The reasoning() macro (htmx-ui/components/reasoning/reasoning.html), rendered by the engine with the package's src/ as a root.
import { describe, expect, test } from "bun:test";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { render } from "htmx-ui-engine";
import { UI } from "./paths";

describe("reasoning()", () => {
  async function reasoning(call: string) {
    const dir = await mkdtemp(join(tmpdir(), "reasoning-macro-"));
    await writeFile(join(dir, "t.html"), `{% from "components/reasoning/reasoning.html" import reasoning %}${call}`);
    const host = document.createElement("div");
    host.innerHTML = render(join(dir, "t.html"), { roots: [dir, UI] });
    return host.querySelector<HTMLDetailsElement>("details.reasoning")!;
  }

  test("done, with a duration", async () => {
    const el = await reasoning(`{% call reasoning(duration=4) %}<p>Because.</p>{% endcall %}`);
    expect(el.hasAttribute("data-reasoning")).toBe(true);
    expect(el.hasAttribute("open")).toBe(false);
    expect(el.dataset.reasoningDuration).toBe("4");
    expect(el.querySelector(".reasoning-label")!.textContent).toBe("Thought for 4 seconds");
    expect(el.querySelector(".reasoning-content")!.innerHTML).toBe("<p>Because.</p>");
  });

  test("streaming: open, busy, a shimmering label and the options as data attributes", async () => {
    const el = await reasoning(
      `{{ reasoning(streaming=true, id="r1", done_label="Reasoned for {s}s", auto_close=false, close_delay=500, icon=none) }}`,
    );
    expect(el.id).toBe("r1");
    expect(el.hasAttribute("open")).toBe(true);
    expect(el.hasAttribute("data-streaming")).toBe(true);
    expect(el.getAttribute("aria-busy")).toBe("true");
    expect(el.querySelector(".reasoning-label .loader.loader-text-shimmer")!.textContent).toBe("Thinking…");
    expect(el.dataset.reasoningDoneLabel).toBe("Reasoned for {s}s");
    expect(el.dataset.reasoningAutoClose).toBe("false");
    expect(el.dataset.reasoningCloseDelay).toBe("500");
    expect(el.querySelector("summary svg")).toBeNull();
  });

  test("label and done_label", async () => {
    expect((await reasoning(`{{ reasoning() }}`)).querySelector(".reasoning-label")!.textContent).toBe("Reasoning");
    expect((await reasoning(`{{ reasoning(duration=1) }}`)).querySelector(".reasoning-label")!.textContent).toBe("Thought for 1 second");
    expect((await reasoning(`{{ reasoning(duration=7, done_label="{s}s") }}`)).querySelector(".reasoning-label")!.textContent).toBe("7s");
    expect((await reasoning(`{{ reasoning("Plan", duration=7) }}`)).querySelector(".reasoning-label")!.textContent).toBe("Plan");
  });
});
