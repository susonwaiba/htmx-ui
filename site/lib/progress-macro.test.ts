// The progress() macro (htmx-ui/components/progress/progress.html), rendered by the engine with the package's src/ as a root.
import { describe, expect, test } from "bun:test";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { render } from "htmx-ui-engine";
import { UI } from "./paths";

const SRC = UI;

async function macro(call: string): Promise<HTMLElement> {
  const dir = await mkdtemp(join(tmpdir(), "progress-macro-"));
  await writeFile(join(dir, "t.html"), `{% from "components/progress/progress.html" import progress %}${call}`);
  const host = document.createElement("div");
  host.innerHTML = render(join(dir, "t.html"), { roots: [dir, SRC] });
  return host;
}

describe("progress()", () => {
  test("a bare bar with a value, max and accessible name", async () => {
    const host = await macro(`{{ progress(33, aria_label="Upload") }}`);
    const bar = host.querySelector("progress")!;
    expect(host.children).toHaveLength(1);
    expect(bar.className).toBe("progress");
    expect(bar.getAttribute("value")).toBe("33");
    expect(bar.getAttribute("max")).toBe("100");
    expect(bar.getAttribute("aria-label")).toBe("Upload");
    expect(bar.textContent).toBe("33%");
  });

  test("no value renders an indeterminate bar", async () => {
    const bar = (await macro(`{{ progress(aria_label="Loading") }}`)).querySelector("progress")!;
    expect(bar.hasAttribute("value")).toBe(false);
    expect(bar.textContent).toBe("");
  });

  test("label, value and description are wired to the bar by id", async () => {
    const host = await macro(`{{ progress(3, max=9, label="Uploading files", show_value=true, description="3 of 9 files") }}`);
    const field = host.querySelector(".progress-field")!;
    const bar = field.querySelector("progress")!;
    expect(bar.id).toBe("progress-uploading-files");
    expect(field.querySelector("label")!.getAttribute("for")).toBe(bar.id);
    expect(bar.hasAttribute("aria-label")).toBe(false);
    expect(field.querySelector(".progress-value")!.textContent).toBe("33%");
    expect(field.querySelector(".progress-value")!.getAttribute("aria-hidden")).toBe("true");
    const help = field.querySelector(".progress-description")!;
    expect(bar.getAttribute("aria-describedby")).toBe(help.id);
  });

  test("clamps the shown percentage and honours id, size, variant, class and attrs", async () => {
    const host = await macro(
      `{{ progress(120, label="Quota", show_value=true, id="quota", size="lg", variant="danger", class="mt-4", attrs={"hx-get": "/quota"}) }}`,
    );
    const field = host.querySelector(".progress-field")!;
    expect(field.className).toBe("progress-field mt-4");
    expect(field.getAttribute("hx-get")).toBe("/quota");
    expect(field.querySelector(".progress-value")!.textContent).toBe("100%");
    const bar = field.querySelector("progress")!;
    expect(bar.id).toBe("quota");
    expect(bar.className).toBe("progress progress-lg progress-danger");
  });
});
