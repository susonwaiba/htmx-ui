import { afterEach, describe, expect, test } from "bun:test";
import { initToast, toast } from "./toast";

const toasts = () => [...document.querySelectorAll<HTMLElement>(".toast:not([data-removing])")];

describe("toast", () => {
  afterEach(() => {
    toast.dismiss();
    document.body.innerHTML = "";
  });

  test("shows a toast with its type, description and newest in front", () => {
    toast("First");
    toast.success("Saved", { description: "All changes saved." });
    const [front, back] = toasts();
    expect(front!.dataset.type).toBe("success");
    expect(front!.querySelector(".toast-title")!.textContent).toBe("Saved");
    expect(front!.querySelector(".toast-description")!.textContent).toBe("All changes saved.");
    expect(front!.hasAttribute("data-front")).toBe(true);
    expect(back!.style.getPropertyValue("--index")).toBe("1");
    expect(document.querySelector("[data-toaster]")!.getAttribute("aria-live")).toBe("polite");
  });

  test("errors are alerts; an id updates in place", () => {
    const id = toast.loading("Saving…");
    expect(toasts()[0]!.getAttribute("role")).toBe("status");
    toast.error("Could not save", { id });
    expect(toasts()).toHaveLength(1);
    expect(toasts()[0]!.dataset.type).toBe("error");
    expect(toasts()[0]!.getAttribute("role")).toBe("alert");
  });

  test("action runs its callback and dismisses", () => {
    let undone = false;
    toast("Deleted", { action: { label: "Undo", onClick: () => (undone = true) } });
    toasts()[0]!.querySelector<HTMLButtonElement>(".toast-action")!.click();
    expect(undone).toBe(true);
    expect(toasts()).toHaveLength(0);
  });

  test("promise turns into success", async () => {
    const id = toast.promise(Promise.resolve(3), { loading: "Working", success: (n) => `Done ${n}`, error: "Failed" });
    await Promise.resolve();
    await Promise.resolve();
    const el = document.querySelector<HTMLElement>(`[data-id="${id}"]`)!;
    expect(el.dataset.type).toBe("success");
    expect(el.querySelector(".toast-title")!.textContent).toBe("Done 3");
  });

  test("data-toast triggers, toast events and data-toast-show elements", () => {
    document.body.innerHTML = `<button data-toast="Hi" data-toast-type="info" data-toast-action="Undo">Go</button>
      <div data-toast-show="From the server" hidden></div>`;
    initToast(document);
    expect(document.querySelector("[data-toast-show]")).toBeNull();
    expect(toasts()[0]!.querySelector(".toast-title")!.textContent).toBe("From the server");

    const button = document.querySelector("button")!;
    let fired = false;
    button.addEventListener("toast:action", () => (fired = true));
    button.click();
    expect(toasts()[0]!.dataset.type).toBe("info");
    toasts()[0]!.querySelector<HTMLButtonElement>(".toast-action")!.click();
    expect(fired).toBe(true);

    document.body.dispatchEvent(new CustomEvent("toast", { bubbles: true, detail: { message: "Via HX-Trigger", type: "warning" } }));
    expect(toasts()[0]!.dataset.type).toBe("warning");
  });
});
