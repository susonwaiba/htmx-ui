// The loader() macro (htmx-ui/components/loader/loader.html), rendered by the engine with the package's src/ as a root.
import { describe, expect, test } from "bun:test";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { render } from "htmx-ui-engine";
import { UI } from "./paths";

const SRC = UI;

async function macro(call: string): Promise<HTMLElement> {
  const dir = await mkdtemp(join(tmpdir(), "loader-macro-"));
  await writeFile(join(dir, "t.html"), `{% from "components/loader/loader.html" import loader %}${call}`);
  const host = document.createElement("div");
  host.innerHTML = render(join(dir, "t.html"), { roots: [dir, SRC] });
  return host;
}

describe("loader()", () => {
  test("defaults to three dots announced as Loading", async () => {
    const host = await macro(`{{ loader() }}`);
    const el = host.querySelector(".loader")!;
    expect(host.children).toHaveLength(1);
    expect(el.className).toBe("loader loader-dots");
    expect(el.getAttribute("role")).toBe("status");
    expect(el.hasAttribute("aria-label")).toBe(false);
    const dots = el.querySelectorAll(':scope > span[aria-hidden="true"]');
    expect(dots).toHaveLength(3);
    expect(el.lastElementChild!.className).toBe("sr-only");
    expect(el.textContent).toBe("Loading");
  });

  test("wave has five bars, typing three", async () => {
    expect((await macro(`{{ loader("wave") }}`)).querySelectorAll(".loader > span:not(.sr-only)")).toHaveLength(5);
    expect((await macro(`{{ loader("typing") }}`)).querySelectorAll(".loader > span:not(.sr-only)")).toHaveLength(3);
  });

  test("pulse shapes have no children and an aria-label", async () => {
    for (const variant of ["pulse", "pulse-dot"]) {
      const el = (await macro(`{{ loader("${variant}", label="Saving") }}`)).querySelector(".loader")!;
      expect(el.className).toBe(`loader loader-${variant}`);
      expect(el.children).toHaveLength(0);
      expect(el.getAttribute("role")).toBe("status");
      expect(el.getAttribute("aria-label")).toBe("Saving");
    }
  });

  test("text variants show their text, defaulting to the label", async () => {
    const shimmer = (await macro(`{{ loader("text-shimmer", text="Thinking") }}`)).querySelector(".loader")!;
    expect(shimmer.className).toBe("loader loader-text-shimmer");
    expect(shimmer.textContent).toBe("Thinking");
    expect(shimmer.getAttribute("role")).toBe("status");
    expect(shimmer.hasAttribute("aria-label")).toBe(false);

    const blink = (await macro(`{{ loader("text-blink", label="Fetching") }}`)).querySelector(".loader")!;
    expect(blink.textContent).toBe("Fetching");

    const dots = (await macro(`{{ loader("loading-dots", text="Generating") }}`)).querySelector(".loader")!;
    expect(dots.textContent).toBe("Generating...");
    expect(dots.querySelectorAll('span[aria-hidden="true"]')).toHaveLength(3);
  });

  test("label=none makes a shape decorative", async () => {
    const el = (await macro(`{{ loader("wave", label=none) }}`)).querySelector(".loader")!;
    expect(el.getAttribute("aria-hidden")).toBe("true");
    expect(el.hasAttribute("role")).toBe(false);
    expect(el.querySelector(".sr-only")).toBeNull();
  });

  test("size, class and attrs", async () => {
    const el = (
      await macro(`{{ loader("pulse-dot", size="lg", class="htmx-indicator text-primary", attrs={"id": "busy", "style": "--loader-duration: 2s"}) }}`)
    ).querySelector(".loader")!;
    expect(el.className).toBe("loader loader-pulse-dot loader-lg htmx-indicator text-primary");
    expect(el.id).toBe("busy");
    expect(el.getAttribute("style")).toBe("--loader-duration: 2s");
  });
});
