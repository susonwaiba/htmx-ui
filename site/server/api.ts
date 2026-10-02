// Mock htmx endpoints for local development. Each returns an HTML fragment.
const html = (body: string) =>
  new Response(body, { headers: { "Content-Type": "text/html; charset=utf-8" } });

export const apiRoutes = {
  // Returns a dismissible alert, so it also shows components initialising after a swap.
  "/api/hello": () =>
    html(`<div class="alert alert-success" role="status" data-dismissible>
  <div class="alert-title">Hello from the server</div>
  <div class="alert-description">Rendered at ${new Date().toLocaleTimeString()}. Dismiss me; I was wired up after the swap.</div>
  <button type="button" class="alert-close" data-dismiss aria-label="Dismiss">×</button>
</div>`),

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

  // Slow response for loading-state demos.
  "/api/slow": async () => {
    await Bun.sleep(1200);
    return html(`<span class="text-success">Saved at ${new Date().toLocaleTimeString()}</span>`);
  },

  // Echoes the submitted values back, for demos that post a choice (toggles, toggle groups).
  "/api/echo": async (req: Request) => {
    await Bun.sleep(400);
    const body = req.method === "GET" ? new URL(req.url).searchParams : await req.formData();
    const pairs = [...body.entries()].map(([k, v]) => `${k}=${String(v)}`).join(", ") || "nothing";
    return html(`<span class="text-success">Server received ${Bun.escapeHTML(pairs)}</span>`);
  },
};
