// htmx-ui-engine config. Every option is optional; see
// https://github.com/susonwaiba/htmx-ui/tree/main/packages/engine
import { defineConfig } from "htmx-ui-engine";

const html = (body: string) => new Response(body, { headers: { "Content-Type": "text/html; charset=utf-8" } });

export default defineConfig({
  // Mock endpoints for hx-get/hx-post while developing. Dev server only: the
  // production build is static, so point these at your real backend there.
  routes: {
    "/api/hello": () =>
      html(`<div class="alert alert-success" role="status">
  <div class="alert-title">Hello from the server</div>
  <div class="alert-description">Rendered at ${new Date().toLocaleTimeString()}.</div>
</div>`),
  },
});
