// The clipboard() and clipboard_tag() macros (htmx-ui/components/clipboard/clipboard.html), rendered by the engine.
import { describe, expect, test } from "bun:test";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { render } from "htmx-ui-engine";
import { UI } from "./paths";

async function macro(call: string): Promise<HTMLElement> {
  const dir = await mkdtemp(join(tmpdir(), "clipboard-macro-"));
  await writeFile(join(dir, "t.html"), `{% from "components/clipboard/clipboard.html" import clipboard, clipboard_tag %}${call}`);
  const host = document.createElement("div");
  host.innerHTML = render(join(dir, "t.html"), { roots: [dir, UI] });
  return host;
}

describe("clipboard()", () => {
  test("an outline button with both looks and the text to copy", async () => {
    const button = (await macro(`{{ clipboard(text="npm i htmx-ui") }}`)).querySelector("button")!;
    expect(button.className).toBe("btn btn-outline clipboard");
    expect(button.getAttribute("type")).toBe("button");
    expect(button.dataset.clipboardText).toBe("npm i htmx-ui");
    expect(button.querySelector(".clipboard-idle")!.textContent!.trim()).toBe("Copy");
    expect(button.querySelector(".clipboard-done")!.textContent!.trim()).toBe("Copied");
    expect(button.querySelectorAll("svg")).toHaveLength(2);
    expect(button.hasAttribute("aria-label")).toBe(false);
  });

  test("icon only: an aria-label and no visible text", async () => {
    const button = (await macro(`{{ clipboard(target="#key", icon_only=true, variant="ghost", size="sm", label="Copy API key") }}`)).querySelector("button")!;
    expect(button.className).toBe("btn btn-ghost btn-sm btn-icon clipboard");
    expect(button.dataset.clipboardTarget).toBe("#key");
    expect(button.getAttribute("aria-label")).toBe("Copy API key");
    expect(button.textContent!.trim()).toBe("");
  });

  test("label only, timeout and announce", async () => {
    const button = (await macro(`{{ clipboard(text="x", icon=false, copied_icon=false, timeout=3000, announce="Link copied") }}`)).querySelector("button")!;
    expect(button.querySelectorAll("svg")).toHaveLength(0);
    expect(button.dataset.clipboardTimeout).toBe("3000");
    expect(button.dataset.clipboardAnnounce).toBe("Link copied");
  });
});

describe("clipboard_tag()", () => {
  test("copies the text it shows, or copy= when set", async () => {
    const host = await macro(`{{ clipboard_tag("npm i htmx-ui") }}{{ clipboard_tag("key_••••3f9a", copy="key_full", variant="outline", size="sm") }}`);
    const [plain, masked] = [...host.querySelectorAll("button")];
    expect(plain!.className).toBe("clipboard-tag");
    expect(plain!.hasAttribute("data-clipboard-text")).toBe(false);
    expect(plain!.querySelector("[data-clipboard-content]")!.textContent).toBe("npm i htmx-ui");
    expect(plain!.getAttribute("aria-label")).toBe("Copy npm i htmx-ui");
    expect(masked!.className).toBe("clipboard-tag clipboard-tag-sm clipboard-tag-outline");
    expect(masked!.dataset.clipboardText).toBe("key_full");
  });
});
