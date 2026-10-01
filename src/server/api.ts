// Mock htmx endpoints for local development. Each returns an HTML fragment.
const html = (body: string) =>
  new Response(body, { headers: { "Content-Type": "text/html; charset=utf-8" } });

export const apiRoutes = {
  "/api/hello": () =>
    html(`<p class="text-green-700 dark:text-green-400">Hello from the server at ${new Date().toLocaleTimeString()}</p>`),
};
