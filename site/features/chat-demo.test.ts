import { describe, expect, test } from "bun:test";
import { initChatDemo } from "./chat-demo";

describe("initChatDemo", () => {
  test("appends the prompt as a user turn, then a streaming reply that finishes", async () => {
    document.body.innerHTML = `
      <div id="chat"><div class="message-scroller-content"></div></div>
      <form data-chat-demo="#chat"><input name="prompt" value="Hello <b>there</b>" /></form>`;
    initChatDemo();
    const form = document.querySelector("form")!;
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    const rows = () => [...document.querySelectorAll(".message-scroller-content > *")];
    expect(rows()[0]!.getAttribute("data-align")).toBe("end");
    expect(rows()[0]!.textContent).toBe("Hello <b>there</b>"); // as text, not markup
    expect(rows()[1]!.hasAttribute("data-streaming")).toBe(true);
    expect(form.querySelector("input")!.value).toBe("");
    rows()[1]!.remove(); // stops the stream
    await new Promise((resolve) => setTimeout(resolve, 800));
    expect(form.hasAttribute("data-busy")).toBe(false);
  });
});
