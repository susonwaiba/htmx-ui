// The password_input() macro (htmx-ui/components/password-input/password-input.html), rendered by the engine.
import { describe, expect, test } from "bun:test";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { render } from "htmx-ui-engine";
import { initPasswordInput } from "htmx-ui/components/password-input/password-input.ts";
import { UI } from "./paths";

async function macro(call: string): Promise<HTMLElement> {
  const dir = await mkdtemp(join(tmpdir(), "password-macro-"));
  await writeFile(join(dir, "t.html"), `{% from "components/password-input/password-input.html" import password_input %}${call}`);
  const host = document.createElement("div");
  host.innerHTML = render(join(dir, "t.html"), { roots: [dir, UI] });
  return host;
}

describe("password_input()", () => {
  test("a password input in a group with an eye toggle that works", async () => {
    const host = await macro(`{{ password_input("password", id="pw", required=true) }}`);
    const input = host.querySelector("input")!;
    const toggle = host.querySelector<HTMLElement>("[data-password-toggle]")!;
    expect(host.querySelector(".input-group.password-input[data-password-input]")).not.toBeNull();
    expect([input.type, input.id, input.name, input.autocomplete, input.required]).toEqual(["password", "pw", "password", "current-password", true]);
    expect(toggle.getAttribute("type")).toBe("button");
    expect(toggle.getAttribute("aria-label")).toBe("Show password");
    expect(toggle.classList.contains("btn-icon")).toBe(true);
    document.body.replaceChildren(host);
    initPasswordInput(document);
    toggle.click();
    expect(input.type).toBe("text");
    expect(toggle.getAttribute("aria-pressed")).toBe("true");
  });

  test("text toggle, new-password, states and the Caps Lock hint", async () => {
    const host = await macro(`{{ password_input("new", autocomplete="new-password", toggle="text", minlength=12, invalid=true, caps=true, attrs={"aria-describedby": "e"}) }}`);
    const input = host.querySelector("input")!;
    expect(input.autocomplete).toBe("new-password");
    expect(input.getAttribute("minlength")).toBe("12");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toBe("e");
    expect(host.querySelector(".password-toggle-show")!.textContent).toBe("Show");
    expect(host.querySelector<HTMLElement>("[data-password-caps]")!.hidden).toBe(true);
  });
});
