// Demo only (/docs/components/message-scroller): a <form data-chat-demo="#scroller"> appends the
// prompt as a user turn to that scroller's transcript, then streams a canned assistant reply into
// it word by word, marked data-streaming until it is done. All client-side, so the demo works on
// the static site; a real app would get these rows from its server (see the page's htmx section).
const REPLIES = [
  [
    "Your message was anchored near the top of the transcript, with a little of the previous turn still showing above it, and this reply is growing into the space below rather than pushing your question away.",
    "While you stay at the bottom, I stay in view as I write. Scroll up, select some text or press Page Up and I'll stop following: the rest of this answer keeps arriving out of sight, and the button at the bottom says I'm still writing.",
    "Press it, or scroll back down, and you're following again. Nothing moves unless you asked it to.",
  ],
  [
    "Here's a longer one, so it outgrows the viewport.",
    "First, the spacer under the transcript shrinks as these words arrive. Once the reply is taller than the view, the spacer is gone and following simply keeps the newest line on screen.",
    "Second, if anything above you changes size (an image loading, a code block highlighting, older messages loading in at the top) the first message you can see keeps its place. The scroller corrects the scroll position in the same frame, before anything is painted.",
    "Third, screen readers hear one short announcement when a reply finishes, not every word of it.",
    "Try a link to an earlier message, too: it scrolls the transcript, not the page, and flashes the message it lands on.",
  ],
  [
    "Short answer: yes.",
    "The scroller doesn't own any of this. It's the viewport; the messages, the prompt and the streaming are yours.",
  ],
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function row(html: string) {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  return template.content.firstElementChild as HTMLElement;
}

async function reply(content: HTMLElement, index: number) {
  const message = row(`<div class="message message-plain" data-streaming>
    <div class="message-body"><div class="message-content"><span class="message-typing" aria-hidden="true"><span></span><span></span><span></span></span></div></div>
  </div>`);
  // The transcript's assistant avatar, if it has one.
  const avatar = content.querySelector(".message-plain .message-avatar")?.cloneNode(true);
  if (avatar) message.prepend(avatar);
  content.append(message);

  await sleep(700);
  const body = message.querySelector<HTMLElement>(".message-content")!;
  body.replaceChildren();
  for (const paragraph of REPLIES[index % REPLIES.length]!) {
    const p = document.createElement("p");
    body.append(p);
    for (const word of paragraph.split(" ")) {
      if (!message.isConnected) return;
      p.textContent = p.textContent ? `${p.textContent} ${word}` : word;
      await sleep(25 + Math.random() * 45);
    }
  }
  message.removeAttribute("data-streaming");
}

export function initChatDemo() {
  let count = 0;
  document.addEventListener("submit", async (e) => {
    const form = e.target as HTMLFormElement;
    const selector = form.dataset?.chatDemo;
    if (!selector) return;
    e.preventDefault();
    const content = document.querySelector(selector)?.querySelector<HTMLElement>(".message-scroller-content");
    const input = form.querySelector<HTMLInputElement | HTMLTextAreaElement>("[name=prompt]");
    const text = input?.value.trim();
    if (!content || !input || !text || form.dataset.busy !== undefined) return;

    const turn = row(`<div class="message" data-align="end"><div class="message-body"><div class="message-content"></div></div></div>`);
    turn.querySelector(".message-content")!.textContent = text;
    input.value = "";
    form.dataset.busy = "";
    content.append(turn);
    try {
      await reply(content, count++);
    } finally {
      delete form.dataset.busy;
    }
  });
}
