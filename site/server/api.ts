// Mock htmx endpoints for local development. Each returns an HTML fragment.
import { join } from "node:path";
import { render } from "htmx-ui-engine";
import { SITE, UI } from "../lib/paths";

const html = (body: string) =>
  new Response(body, { headers: { "Content-Type": "text/html; charset=utf-8" } });

/** A fragment rendered from server/fragments/<name>.html, so it can use the component macros. */
const fragment = (name: string, context: Record<string, unknown> = {}) =>
  html(render(join(SITE, "server/fragments", `${name}.html`), { roots: [SITE, UI], context }).trim());
const time = () => new Date().toLocaleTimeString();

export const apiRoutes = {
  // Returns a dismissible alert, so it also shows components initialising after a swap.
  "/api/hello": () => fragment("hello", { time: time() }),

  // Table rows for the "load more" demo on /docs/components/table.
  "/api/invoices": () => {
    const statuses = [["Paid", "success"], ["Pending", "warning"], ["Overdue", "danger"]] as const;
    const rows = Array.from({ length: 3 }, () => {
      const [label, variant] = statuses[Math.floor(Math.random() * statuses.length)]!;
      const id = String(Math.floor(Math.random() * 900) + 100);
      const amount = (Math.random() * 500 + 50).toFixed(2);
      return `<tr><td class="font-medium">INV-${id}</td><td><span class="badge badge-${variant}">${label}</span></td><td class="text-right tabular-nums">$${amount}</td></tr>`;
    });
    return html(rows.join(""));
  },

  // Lists and rows re-rendered on every request, for /docs/preserve-scroll.
  "/api/preserve-scroll": () => fragment("preserve-scroll", { time: time() }),

  // Slow response for loading-state demos.
  "/api/slow": async () => {
    await Bun.sleep(1200);
    return html(`<span class="text-success">Saved at ${new Date().toLocaleTimeString()}</span>`);
  },

  // A dialog that opens itself once htmx inserts it, and is removed again when it closes
  // (/docs/components/dialog). Its form posts to /api/dialog/save.
  "/api/dialog": async () => {
    await Bun.sleep(300);
    return fragment("dialog", { time: time() });
  },

  // Answers the dialog's form, and closes the dialog with the HX-Trigger response header.
  "/api/dialog/save": async (req: Request) => {
    await Bun.sleep(400);
    const name = String((await req.formData()).get("name") ?? "");
    return new Response(`<span class="text-success">Renamed to ${Bun.escapeHTML(name)}</span>`, {
      headers: { "Content-Type": "text/html; charset=utf-8", "HX-Trigger": "dialog:close" },
    });
  },

  // An attachment fragment that polls itself through the upload states
  // (/docs/components/attachment): uploading 0-100%, processing, then done.
  "/api/attachment": (req: Request) => {
    const step = Number(new URL(req.url).searchParams.get("step") ?? 0);
    const progress = Math.min(step * 20, 100);
    const state = step < 5 ? "uploading" : step < 7 ? "processing" : "done";
    const detail = { uploading: `Uploading · ${progress}%`, processing: "Processing…", done: "2.4 MB · PDF" }[state];
    return fragment("attachment", { state, progress, detail, next: state === "done" ? null : step + 1 });
  },

  // Echoes the submitted values back, for demos that post a choice (toggles, toggle groups).
  // Server-side search for the combobox demo (/docs/components/combobox): option markup for ?q=.
  "/api/countries": async (req: Request) => {
    await Bun.sleep(250);
    const q = (new URL(req.url).searchParams.get("q") ?? "").trim().toLowerCase();
    const found = COUNTRIES.filter((c) => c.toLowerCase().includes(q)).slice(0, 8);
    const options = found.map(
      (c) => `<div class="combobox-item" role="option" value="${c.toLowerCase().replace(/\W+/g, "-")}">${Bun.escapeHTML(c)}</div>`,
    );
    return html(options.join("") || `<p class="combobox-empty">No country matches “${Bun.escapeHTML(q)}”.</p>`);
  },

  // A profile card's inner markup, loaded when a hover card first opens (/docs/components/hover-card).
  "/api/profile": async (req: Request) => {
    await Bun.sleep(500);
    const user = Bun.escapeHTML(new URL(req.url).searchParams.get("user") ?? "htmx-ui");
    return html(`<span class="hover-card-header">
  <span class="avatar avatar-lg" aria-hidden="true"><span class="avatar-fallback">${user.slice(0, 2).toUpperCase()}</span></span>
  <span class="hover-card-body">
    <span class="hover-card-title">@${user}</span>
    <span class="hover-card-description">Loaded from the server at ${new Date().toLocaleTimeString()}.</span>
    <span class="hover-card-meta">Joined December 2021</span>
  </span>
</span>`);
  },

  // Links for a navigation menu panel, loaded when it first opens (/docs/components/navigation-menu).
  "/api/recent": async () => {
    await Bun.sleep(500);
    const pages = [["Dialog", "/docs/components/dialog"], ["Sidebar", "/docs/components/sidebar"], ["Theming", "/docs/theming"]];
    const links = pages.map(([title, href]) => `<li><a class="navigation-menu-link" href="${href}"><span class="navigation-menu-link-title">${title}</span><span class="navigation-menu-link-description">Visited recently</span></a></li>`);
    return html(`<ul class="navigation-menu-grid">${links.join("")}</ul>`);
  },

  // Older request rows for the Switchboard example app (/examples/sidebar).
  "/api/requests": async () => {
    await Bun.sleep(400);
    const rows = [
      ["GET", "/orders?page=2", 200, "innerHTML #orders"],
      ["POST", "/search/saved", 201, "beforeend #views"],
      ["GET", "/cart", 304, "none"],
    ].map(([method, path, status, swap]) => {
      const badge = Number(status) < 400 ? "badge-success" : "badge-danger";
      const ms = Math.floor(Math.random() * 180) + 40;
      return `<tr><td class="font-mono text-xs"><span class="mr-2 inline-block w-14 font-semibold">${method}</span>${path}</td><td><span class="badge ${badge}">${status}</span></td><td class="hidden font-mono text-xs text-muted-foreground md:table-cell">${swap}</td><td class="text-right tabular-nums">${ms} ms</td></tr>`;
    });
    return html(rows.join(""));
  },

  "/api/echo": async (req: Request) => {
    await Bun.sleep(400);
    const body = req.method === "GET" ? new URL(req.url).searchParams : await req.formData();
    const pairs = [...body.entries()].map(([k, v]) => `${k}=${String(v)}`).join(", ") || "nothing";
    return html(`<span class="text-success">Server received ${Bun.escapeHTML(pairs)}</span>`);
  },

  // A toast from the server, via the HX-Trigger response header (/docs/components/toast).
  "/api/toast": async () => {
    await Bun.sleep(300);
    const trigger = { toast: { message: "Profile updated", type: "success", description: `Saved at ${new Date().toLocaleTimeString()}.` } };
    return new Response("", { headers: { "HX-Trigger": JSON.stringify(trigger) } });
  },

  // A slow save that fails when asked to, for loading toasts that turn into the outcome.
  "/api/toast/save": async (req: Request) => {
    await Bun.sleep(1500);
    const fail = new URL(req.url).searchParams.has("fail");
    return new Response("", { status: fail ? 500 : 200 });
  },

  // Content that takes a while, shown behind a skeleton until it arrives (/docs/components/skeleton).
  "/api/skeleton": async () => {
    await Bun.sleep(1800);
    return html(`<div class="card w-full max-w-sm">
  <div class="card-header">
    <h3 class="card-title">Quarterly report</h3>
    <p class="card-description">Loaded from the server at ${new Date().toLocaleTimeString()}.</p>
  </div>
  <div class="card-content text-sm text-muted-foreground">Revenue grew 12% on last quarter, led by the new self-serve plans.</div>
  <div class="card-footer gap-2"><button class="btn btn-primary btn-sm">Open</button><button class="btn btn-outline btn-sm">Share</button></div>
</div>`);
  },

  // Command menu items searched on the server (/docs/components/command).
  "/api/commands": async (req: Request) => {
    await Bun.sleep(250);
    const q = (new URL(req.url).searchParams.get("q") ?? "").trim().toLowerCase();
    const found = COUNTRIES.filter((c) => c.toLowerCase().includes(q)).slice(0, 8);
    if (!found.length) return html("");
    const items = found.map((c) => `<div class="command-item" role="option" data-value="${c}">${Bun.escapeHTML(c)}</div>`);
    return html(`<div class="command-group" role="group" aria-label="Countries"><div class="command-label">Countries</div>${items.join("")}</div>`);
  },

  // A chat reply for the prompt input demos (/docs/components/prompt-input): slow, so the stop
  // button has time to show. Returns the user's message and the assistant's answer.
  "/api/prompt-input/reply": async (req: Request) => {
    await Bun.sleep(2000);
    const form = await req.formData();
    const prompt = Bun.escapeHTML(String(form.get("prompt") ?? "").trim());
    const model = Bun.escapeHTML(String(form.get("model") ?? "the model"));
    return html(`<div class="message" data-align="end"><div class="message-body"><div class="message-content">${prompt}</div></div></div>
<div class="message message-plain" data-align="start"><div class="message-body"><div class="message-content">This is a mock answer from ${model}, sent at ${new Date().toLocaleTimeString()}. A real server would stream the model's reply here.</div></div></div>`);
  },

  // People for the prompt input's server-side @ mentions: option markup for ?q= (and ?trigger=).
  "/api/prompt-input/mentions": async (req: Request) => {
    await Bun.sleep(150);
    const q = (new URL(req.url).searchParams.get("q") ?? "").trim().toLowerCase();
    const people = [
      ["ada", "Ada Lovelace", "Analyst"], ["alan", "Alan Turing", "Cryptography"], ["grace", "Grace Hopper", "Compilers"],
      ["katherine", "Katherine Johnson", "Orbital mechanics"], ["linus", "Linus Torvalds", "Kernels"],
      ["margaret", "Margaret Hamilton", "Flight software"], ["tim", "Tim Berners-Lee", "The web"],
    ];
    const found = people.filter(([value, name]) => `${value} ${name}`.toLowerCase().includes(q)).slice(0, 6);
    if (!found.length) return html(`<p class="prompt-input-empty" data-prompt-input-empty>No one matches “${Bun.escapeHTML(q)}”.</p>`);
    const options = found.map(
      ([value, name, role]) =>
        `<div class="prompt-input-option" role="option" data-value="${value}"><span class="prompt-input-option-label">${name}</span><span class="prompt-input-option-description">${role}</span></div>`,
    );
    return html(options.join(""));
  },

  // Older turns for the message scroller's "Loading history" demo: ?before=N returns turns N-3..N-1
  // and, while there are more, a new sentinel that loads the next page when it scrolls into view.
  "/api/chat/history": async (req: Request) => {
    await Bun.sleep(500);
    const before = Math.max(0, Number(new URL(req.url).searchParams.get("before")) || 0);
    const from = Math.max(1, before - 3);
    const rows: string[] = [];
    if (from > 1) {
      rows.push(`<div class="flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground" hx-get="/api/chat/history?before=${from}" hx-trigger="intersect once" hx-swap="outerHTML"><span class="spinner spinner-sm" role="status" aria-label="Loading"></span> Loading older messages…</div>`);
    }
    for (let n = from; n < before; n++) {
      rows.push(n % 2
        ? `<div class="message" data-align="end" id="history-${n}"><div class="message-body"><div class="message-content">Question ${n}: what happened next?</div></div></div>`
        : `<div class="message message-plain" id="history-${n}"><div class="message-body"><div class="message-content"><p>Answer ${n}. Loaded from the server above the messages you were reading; they didn't move.</p></div></div></div>`);
    }
    if (from === 1) rows.unshift(`<div class="message-scroller-marker" role="separator">Start of the conversation</div>`);
    return html(rows.join("\n"));
  },
};

const COUNTRIES = [
  "Argentina", "Australia", "Austria", "Belgium", "Brazil", "Canada", "Chile", "China", "Colombia", "Denmark",
  "Egypt", "Finland", "France", "Germany", "Greece", "India", "Indonesia", "Ireland", "Italy", "Japan", "Kenya",
  "Mexico", "Morocco", "Nepal", "Netherlands", "New Zealand", "Nigeria", "Norway", "Peru", "Poland", "Portugal",
  "South Africa", "South Korea", "Spain", "Sweden", "Switzerland", "Thailand", "Turkey", "United Kingdom",
  "United States", "Vietnam",
];
