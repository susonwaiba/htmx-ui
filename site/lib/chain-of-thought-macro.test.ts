// The chain_of_thought() and chain_of_thought_step() macros (htmx-ui/components/chain-of-thought/chain-of-thought.html),
// rendered by the engine with the package's src/ as a root.
import { describe, expect, test } from "bun:test";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { render } from "htmx-ui-engine";
import { UI } from "./paths";

async function macro(call: string): Promise<HTMLElement> {
  const dir = await mkdtemp(join(tmpdir(), "chain-of-thought-macro-"));
  await writeFile(
    join(dir, "t.html"),
    `{% from "components/chain-of-thought/chain-of-thought.html" import chain_of_thought, chain_of_thought_step %}${call}`,
  );
  const host = document.createElement("div");
  host.innerHTML = render(join(dir, "t.html"), { roots: [dir, UI] });
  return host;
}

describe("chain_of_thought()", () => {
  test("a plain chain of steps: details with a call body, rows without", async () => {
    const host = await macro(`{% call chain_of_thought(class="mt-4") %}
      {% call chain_of_thought_step("Searching", status="complete", icon="search", open=true) %}<p>Found 3</p>{% endcall %}
      {{ chain_of_thought_step("Answering", status="active") }}
      {{ chain_of_thought_step("Checking", status="pending") }}
    {% endcall %}`);
    const chain = host.firstElementChild as HTMLElement;
    expect(chain.tagName).toBe("DIV");
    expect(chain.className).toBe("chain-of-thought mt-4");
    const steps = chain.querySelectorAll<HTMLElement>(":scope > .chain-of-thought-step");
    expect(steps).toHaveLength(3);

    const [search, answer, check] = steps;
    expect(search!.tagName).toBe("DETAILS");
    expect(search!.hasAttribute("open")).toBe(true);
    expect(search!.dataset.status).toBe("complete");
    expect(search!.querySelector("summary.chain-of-thought-step-header")).not.toBeNull();
    expect(search!.querySelector(".chain-of-thought-step-label")!.textContent).toBe("Searching");
    expect(search!.querySelector(".chain-of-thought-step-content")!.innerHTML).toBe("<p>Found 3</p>");

    expect(answer!.tagName).toBe("DIV");
    expect(answer!.getAttribute("aria-current")).toBe("step");
    expect(answer!.querySelector("div.chain-of-thought-step-header")).not.toBeNull();
    expect(answer!.querySelector(".chain-of-thought-step-content")).toBeNull();
    expect(answer!.querySelector(".chain-of-thought-step-icon svg.spinner")).not.toBeNull();

    // A pending step without an icon gets an empty icon slot: CSS draws a dot.
    expect(check!.querySelector(".chain-of-thought-step-icon")!.innerHTML).toBe("");
  });

  test("status icons, and icon=false for a dot", async () => {
    const host = await macro(`{{ chain_of_thought_step("Done", status="complete") }}{{ chain_of_thought_step("Failed", status="error") }}{{ chain_of_thought_step("Done", status="complete", icon=false) }}`);
    const icons = [...host.querySelectorAll(".chain-of-thought-step-icon")];
    expect(icons[0]!.querySelector("svg")).not.toBeNull();
    expect(icons[1]!.querySelector("svg")).not.toBeNull();
    expect(icons[2]!.innerHTML).toBe("");
  });

  test("a label folds the whole chain into a <details>", async () => {
    const host = await macro(`{% call chain_of_thought("Worked for 12s", open=false, plain=true, attrs={"id": "cot"}) %}{{ chain_of_thought_step("One") }}{% endcall %}`);
    const chain = host.querySelector("details.chain-of-thought")!;
    expect(chain.className).toBe("chain-of-thought chain-of-thought-plain");
    expect(chain.id).toBe("cot");
    expect(chain.hasAttribute("open")).toBe(false);
    expect(chain.querySelector(":scope > summary.chain-of-thought-header")!.textContent).toBe("Worked for 12s");
    expect(chain.querySelector(":scope > .chain-of-thought-content > .chain-of-thought-step")).not.toBeNull();
  });
});
