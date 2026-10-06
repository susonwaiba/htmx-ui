// htmx-ui-engine config. Every option is optional; see
// https://github.com/susonwaiba/htmx-ui/tree/main/packages/engine
import { defineConfig } from "htmx-ui-engine";

const html = (body: string) => new Response(body, { headers: { "Content-Type": "text/html; charset=utf-8" } });

export default defineConfig({
  // Optional features are plugins: docs with Markdown and llms.txt (htmx-ui-plugin-docs),
  // versioned docs (htmx-ui-plugin-versions) and Ctrl/K search (htmx-ui-plugin-search).
  // Install one and list it: plugins: [docs()]. See /docs/plugins on the htmx-ui site.

  // Mock endpoints for hx-get/hx-post while developing. The static build doesn't
  // include them; a server adapter (htmx-ui-engine/elysia, ...) does, so turn them
  // off in production once your backend has the real routes.
  routes: {
    "/api/hello": () =>
      html(`<div class="alert alert-success" role="status">
  <div class="alert-title">Hello from the server</div>
  <div class="alert-description">Rendered at ${new Date().toLocaleTimeString()}.</div>
</div>`),
  },
});
