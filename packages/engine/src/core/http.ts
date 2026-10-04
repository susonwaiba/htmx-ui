// The two halves of the web-standard bridge the engine keeps to: a web Request from a
// Node request, and a web Response sent to a Node response. Used by the Vite plugin's
// dev routes and by the server adapters in src/ (express.ts, elysia.ts, hono.ts), so a
// config's `routes` and `fetch` handlers work the same everywhere: they take a Request
// and return a Response, whatever the server underneath is.

import type { IncomingMessage, ServerResponse } from "node:http";

/** Web Request from a Node request. Honours originalUrl, so it works when mounted on a sub-path. */
export async function toRequest(req: IncomingMessage): Promise<Request> {
  const url = new URL((req as IncomingMessage & { originalUrl?: string }).originalUrl ?? req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (Array.isArray(v)) for (const item of v) headers.append(k, item);
    else if (v !== undefined) headers.set(k, v);
  }
  const method = req.method ?? "GET";
  let body: ArrayBuffer | undefined;
  if (method !== "GET" && method !== "HEAD") {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk as Buffer);
    const buf = Buffer.concat(chunks);
    body = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
  }
  return new Request(url, { method, headers, body });
}

/** Send a web Response as a Node response, headers and body. */
export async function send(res: ServerResponse, response: Response): Promise<void> {
  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    if (key !== "set-cookie") res.setHeader(key, value);
  });
  const cookies = response.headers.getSetCookie();
  if (cookies.length) res.setHeader("set-cookie", cookies);
  if (res.req.method === "HEAD") return void res.end();
  res.end(Buffer.from(await response.arrayBuffer()));
}