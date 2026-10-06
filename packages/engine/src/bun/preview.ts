// `htmx-ui preview` on Bun: serve the built outDir with clean URLs.
import { resolve } from "node:path";
import type { ResolvedConfig } from "../core/config";
import { NOT_FOUND_HTML } from "../core/not-found";
import { staticFile } from "../core/static";

export function preview(config: ResolvedConfig) {
  const dir = config.outDir;
  const missing = resolve(dir, "404.html");
  const server = Bun.serve({
    port: config.port,
    async fetch(req) {
      const file = staticFile(dir, new URL(req.url).pathname);
      if (file) return new Response(Bun.file(file));
      // The project's 404 page when it built one, htmx-ui's default otherwise.
      if (await Bun.file(missing).exists()) return new Response(Bun.file(missing), { status: 404 });
      return new Response(NOT_FOUND_HTML, { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } });
    },
  });
  console.log(`htmx-ui preview of ${dir}: ${server.url}`);
  return server;
}
