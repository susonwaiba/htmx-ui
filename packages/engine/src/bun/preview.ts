// `htmx-ui preview` on Bun: serve the built outDir with clean URLs.
import { resolve } from "node:path";
import type { ResolvedConfig } from "../core/config";
import { staticFile } from "../core/static";

export function preview(config: ResolvedConfig) {
  const dir = config.outDir;
  const missing = resolve(dir, "404.html");
  const server = Bun.serve({
    port: config.port,
    async fetch(req) {
      const file = staticFile(dir, new URL(req.url).pathname);
      if (file) return new Response(Bun.file(file));
      return (await Bun.file(missing).exists()) ? new Response(Bun.file(missing), { status: 404 }) : new Response("Not found", { status: 404 });
    },
  });
  console.log(`htmx-ui preview of ${dir}: ${server.url}`);
  return server;
}
