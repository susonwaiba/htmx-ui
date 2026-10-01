// Dev server: serves every src/pages/*.html as a route with HMR + Tailwind (via bunfig.toml),
// plus mock endpoints that return HTML fragments for htmx.
import { Glob } from "bun";
import { apiRoutes } from "./api";

const pagesDir = new URL("../pages/", import.meta.url).pathname;
const routes: Record<string, any> = { ...apiRoutes };

// index.html -> "/", about.html -> "/about", blog/post.html -> "/blog/post"
for (const file of new Glob("**/*.html").scanSync(pagesDir)) {
  const route = "/" + file.replace(/\.html$/, "").replace(/(^|\/)index$/, "");
  routes[route || "/"] = (await import(pagesDir + file)).default;
}

const server = Bun.serve({
  port: Number(process.env.PORT ?? 3000),
  routes,
  development: { hmr: true, console: true },
});

console.log(`Dev server: ${server.url}`);
for (const r of Object.keys(routes)) console.log("  ", r);
