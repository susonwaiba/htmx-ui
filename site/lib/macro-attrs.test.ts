// The shared attrs() helper (htmx-ui/macros/attrs.html) and the options every component macro takes.
import { describe, expect, test } from "bun:test";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { render } from "htmx-ui-engine";
import { UI } from "./paths";

async function html(source: string): Promise<HTMLElement> {
  const dir = await mkdtemp(join(tmpdir(), "macro-attrs-"));
  await writeFile(join(dir, "t.html"), source);
  const host = document.createElement("div");
  host.innerHTML = render(join(dir, "t.html"), { roots: [dir, UI] });
  return host;
}

describe("attrs()", () => {
  test("a dict: values escaped, true bare, none and false left out", async () => {
    const host = await html(
      `{% from "macros/attrs.html" import attrs %}<div{{ attrs({"hx-get": "/a?b=1&c=2", "title": '"q"', "hidden": true, "data-x": none, "data-y": false, "data-n": 3}) }}></div>`,
    );
    const el = host.firstElementChild!;
    expect(el.getAttribute("hx-get")).toBe("/a?b=1&c=2");
    expect(el.getAttribute("title")).toBe('"q"');
    expect(el.getAttribute("hidden")).toBe("");
    expect(el.hasAttribute("data-x")).toBe(false);
    expect(el.hasAttribute("data-y")).toBe(false);
    expect(el.getAttribute("data-n")).toBe("3");
  });

  test("a string is written as is, for older calls", async () => {
    const host = await html(`{% from "macros/attrs.html" import attrs %}<div{{ attrs('data-a="1" data-b') }}></div>`);
    expect(host.firstElementChild!.getAttribute("data-a")).toBe("1");
    expect(host.firstElementChild!.hasAttribute("data-b")).toBe(true);
  });
});

describe("class and attrs on every component macro", () => {
  const cases: [string, string, string][] = [
    ["alert", `{% call alert("T", class="mt-4", attrs={"id": "x"}) %}b{% endcall %}`, ".alert"],
    ["checkbox", `{{ checkbox("c", "C", class="mt-4", invalid=true, attrs={"name": "x"}) }}`, ".field"],
    ["combobox", `{{ combobox("cb", ["A"], class="mt-4", attrs={"hx-get": "/x"}) }}`, ".combobox"],
    ["dialog", `{% call dialog("d", "T", class="mt-4", attrs={"hx-get": "/x"}) %}b{% endcall %}`, "dialog"],
    ["drawer", `{% call drawer("d", "T", class="mt-4", attrs={"hx-get": "/x"}) %}b{% endcall %}`, "dialog"],
    ["sheet", `{% call sheet("d", "T", class="mt-4", attrs={"hx-get": "/x"}) %}b{% endcall %}`, "dialog"],
    ["empty", `{{ empty("T", class="mt-4", attrs={"hx-get": "/x"}) }}`, ".empty"],
    ["input-otp", `{{ input_otp("o", class="mt-4", attrs={"hx-get": "/x"}) }}`, ".input-otp"],
    ["prompt-input", `{{ prompt_input(class="mt-4", attrs={"hx-get": "/x"}) }}`, "form"],
    ["select", `{{ select("s", ["A"], class="mt-4", attrs={"hx-get": "/x"}) }}`, ".select"],
    ["code", `{{ code_block("x", "html", class="mt-4", attrs={"hx-get": "/x"}) }}`, ".code-block"],
  ];
  const imports: Record<string, string> = {
    alert: "alert", checkbox: "checkbox", combobox: "combobox", dialog: "dialog", drawer: "drawer", sheet: "sheet",
    empty: "empty", "input-otp": "input_otp", "prompt-input": "prompt_input", select: "select", code: "code_block",
  };
  for (const [component, call, selector] of cases) {
    test(component, async () => {
      const host = await html(`{% from "components/${component}/${component}.html" import ${imports[component]} %}${call}`);
      const el = host.querySelector(selector)!;
      expect(el.classList.contains("mt-4")).toBe(true);
      // attrs land on the macro's documented element: the wrapper, or the control inside it
      expect(host.querySelector("[hx-get], [name='x'], #x")).not.toBeNull();
    });
  }
});
