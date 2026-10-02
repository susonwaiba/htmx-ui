import { describe, expect, test } from "bun:test";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { initComponents } from "./index";

describe("initComponents", () => {
  test("initialises a component that is itself the root, as after an htmx swap", () => {
    const alert = document.createElement("div");
    alert.setAttribute("data-dismissible", "");
    alert.innerHTML = "<button data-dismiss>×</button>";
    document.body.append(alert);

    initComponents(alert);
    expect(alert.hasAttribute("data-init")).toBe(true);
    alert.querySelector<HTMLElement>("[data-dismiss]")!.click();
    expect(alert.isConnected).toBe(false);
  });

  test("is idempotent", () => {
    const root = document.createElement("div");
    root.innerHTML = '<div data-dismissible><button data-dismiss></button></div>';
    document.body.append(root);
    initComponents(root);
    initComponents(root);
    root.querySelector<HTMLElement>("[data-dismiss]")!.click();
    expect(root.children).toHaveLength(0);
  });
});

// Keeps the two hand-maintained lists in sync as the library grows: every
// component directory's stylesheet is imported in src/styles.css, and every
// behaviour (<name>/<name>.ts) is registered in initComponents.
describe("registry", () => {
  const dir = import.meta.dir;
  const components = readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name);
  const has = (name: string, ext: string) => readdirSync(join(dir, name)).includes(`${name}.${ext}`);

  test("every component directory has a stylesheet, behaviour or macro named after it", () => {
    for (const name of components) expect([has(name, "css"), has(name, "ts"), has(name, "html")]).toContain(true);
  });

  test("every component stylesheet is imported in src/styles.css", async () => {
    const styles = await Bun.file(join(dir, "../styles.css")).text();
    for (const name of components.filter((n) => has(n, "css"))) {
      expect(styles).toContain(`@import "./components/${name}/${name}.css";`);
    }
  });

  test("every component behaviour is registered in initComponents", async () => {
    const index = await Bun.file(join(dir, "index.ts")).text();
    for (const name of components.filter((n) => has(n, "ts"))) {
      expect(index).toContain(`from "./${name}/${name}";`);
    }
  });
});
