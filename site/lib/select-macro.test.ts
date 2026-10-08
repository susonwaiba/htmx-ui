// The select() macro (htmx-ui/components/select/select.html), rendered by the engine with the package's src/ as a root.
import { describe, expect, test } from "bun:test";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { render } from "htmx-ui-engine";
import { initSelect } from "htmx-ui/components/select/select.ts";
import { UI } from "./paths";

async function macro(call: string): Promise<HTMLElement> {
  const dir = await mkdtemp(join(tmpdir(), "select-macro-"));
  await writeFile(join(dir, "t.html"), `{% from "components/select/select.html" import select %}${call}`);
  const host = document.createElement("div");
  host.innerHTML = render(join(dir, "t.html"), { roots: [dir, UI] });
  return host;
}

describe("select()", () => {
  test("ids, name and a preselected value that shows and submits before any script runs", async () => {
    const host = await macro(`{{ select("country", [{value: "nz", label: "New Zealand"}, {value: "pt", label: "Portugal"}], value="pt", name="country", label="Country") }}`);
    const trigger = host.querySelector<HTMLElement>(".select-trigger")!;
    const list = host.querySelector<HTMLElement>('[role="listbox"]')!;
    expect(trigger.id).toBe("country");
    expect(trigger.getAttribute("aria-label")).toBe("Country");
    expect(list.id).toBe("country-listbox");
    expect(list.getAttribute("aria-label")).toBe("Country");
    expect(host.querySelector(".select-value")!.textContent).toBe("Portugal");
    expect(host.querySelector<HTMLInputElement>("[data-select-input]")!.value).toBe("pt");
    const picked = host.querySelectorAll('[aria-selected="true"]');
    expect(picked).toHaveLength(1);
    expect(picked[0]!.getAttribute("value")).toBe("pt");
    expect(picked[0]!.querySelector(".select-check svg")).not.toBeNull();
  });

  test("labelledby names the trigger by the label and its own text, the list by the label", async () => {
    const host = await macro(`{{ select("role", ["Dev", "Design"], labelledby="role-label", describedby="role-help") }}`);
    const trigger = host.querySelector(".select-trigger")!;
    expect(trigger.getAttribute("aria-labelledby")).toBe("role-label role");
    expect(trigger.hasAttribute("aria-label")).toBe(false);
    expect(trigger.getAttribute("aria-describedby")).toBe("role-help");
    expect(host.querySelector('[role="listbox"]')!.getAttribute("aria-labelledby")).toBe("role-label");
    expect(host.querySelector(".select-value")!.textContent).toBe("");
  });

  test("size, states, alignment, class and attrs", async () => {
    const host = await macro(
      `{{ select("s", ["A"], size="sm", invalid=true, required=true, disabled=true, align="end", side="top", class="w-20", attrs={"hx-get": "/x"}) }}`,
    );
    const trigger = host.querySelector<HTMLButtonElement>(".select-trigger")!;
    expect(host.firstElementChild!.className).toBe("select w-20");
    expect(trigger.className).toBe("select-trigger select-sm");
    expect(trigger.getAttribute("aria-invalid")).toBe("true");
    expect(trigger.getAttribute("aria-required")).toBe("true");
    expect(trigger.disabled).toBe(true);
    expect(trigger.getAttribute("hx-get")).toBe("/x");
    expect(host.querySelector(".select-content")!.className).toBe("select-content select-content-end select-content-up");
  });

  test("groups, disabled options, keywords and icons; the empty message only with a search box", async () => {
    const host = await macro(
      `{{ select("f", [{label: "Fruit", options: ["Apple", {value: "d", label: "Durian", disabled: true}]}, {label: "Veg", options: [{value: "c", label: "Carrot", keywords: "root", icon: "star"}]}], value="c", searchable=true) }}`,
    );
    const groups = host.querySelectorAll('[role="group"]');
    expect(groups).toHaveLength(2);
    expect(groups[0]!.getAttribute("aria-labelledby")).toBe("f-group-1");
    expect(host.querySelector("#f-group-1")!.textContent).toBe("Fruit");
    expect(host.querySelectorAll('[role="separator"]')).toHaveLength(1);
    expect(host.querySelector('[value="d"]')!.getAttribute("aria-disabled")).toBe("true");
    const carrot = host.querySelector('[value="c"]')!;
    expect(carrot.getAttribute("data-keywords")).toBe("root");
    expect(carrot.textContent!.trim()).toBe("Carrot");
    expect(host.querySelector(".select-value")!.textContent).toBe("Carrot");
    expect(host.querySelector("[data-select-search]")).not.toBeNull();
    expect(host.querySelector("[data-select-empty]")).not.toBeNull();
    expect((await macro(`{{ select("g", ["A"]) }}`)).querySelector("[data-select-empty]")).toBeNull();
  });

  test("the rendered markup works with the behaviour", async () => {
    const host = await macro(`{{ select("t", ["Free", "Pro"], value="Free", name="plan", label="Plan") }}`);
    document.body.replaceChildren(host);
    initSelect(document);
    host.querySelector<HTMLElement>(".select-trigger")!.click();
    host.querySelector<HTMLElement>('[value="Pro"]')!.click();
    expect(host.querySelector(".select-value")!.textContent).toBe("Pro");
    expect(host.querySelector<HTMLInputElement>("[data-select-input]")!.value).toBe("Pro");
  });
});
