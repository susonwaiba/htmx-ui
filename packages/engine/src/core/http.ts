// The two halves of the web-standard bridge the engine keeps to: a web Request from a
// Node request, and a web Response sent to a Node response. Used by the Vite plugin's
// dev routes and by the server adapters in src/ (express.ts, elysia.ts, hono.ts), so a
// config's `routes` and `fetch` handlers work the same everywhere: they take a Request
// and return a Response, whatever the server underneath is.

import type { IncomingMessage, ServerResponse } from "node:http";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { ReadableStream as WebReadableStream } from "node:stream/web";

/**
 * Web Request from a Node request. Honours originalUrl, so it works when mounted on a sub-path.
 *
 * `parsed` is the body a framework's body parser already read off the stream
 * (Express's `req.body`, Fastify's `request.body`, Koa's `ctx.request.body`): the
 * stream is empty by then, so the body is rebuilt from it instead.
 */
export async function toRequest(req: IncomingMessage, parsed?: unknown): Promise<Request> {
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
    const buf = chunks.length ? Buffer.concat(chunks) : encode(parsed, headers);
    if (buf) body = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
  }
  return new Request(url, { method, headers, body });
}

/**
 * A parsed body back as bytes, in the format its Content-Type names, so a handler
 * calling `request.formData()` or `request.json()` reads what the client sent.
 */
function encode(parsed: unknown, headers: Headers): Buffer | undefined {
  if (parsed === undefined || parsed === null) return undefined;
  if (typeof parsed === "string") return Buffer.from(parsed);
  if (parsed instanceof Uint8Array) return Buffer.from(parsed);
  if (typeof parsed !== "object") return Buffer.from(String(parsed));
  // A parser that found nothing to parse leaves {}: there was no body.
  if (!Object.keys(parsed).length) return undefined;
  if (headers.get("content-type")?.includes("application/x-www-form-urlencoded")) {
    const form = new URLSearchParams();
    for (const [key, value] of Object.entries(parsed)) {
      for (const item of Array.isArray(value) ? value : [value]) form.append(key, String(item));
    }
    // Content-Length described the original bytes; the Request measures these.
    headers.delete("content-length");
    return Buffer.from(form.toString());
  }
  headers.delete("content-length");
  return Buffer.from(JSON.stringify(parsed));
}

/** A web Response body as a Node stream, for frameworks that take one (Fastify, Koa). */
export const nodeBody = (response: Response): Readable | Buffer =>
  response.body ? Readable.fromWeb(response.body as unknown as WebReadableStream) : Buffer.alloc(0);

/**
 * Send a web Response as a Node response, headers and body. The body is streamed, not
 * read whole first: a stream that never ends (the dev server's reload events) is a
 * response too.
 */
export async function send(res: ServerResponse, response: Response): Promise<void> {
  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    if (key !== "set-cookie") res.setHeader(key, value);
  });
  const cookies = response.headers.getSetCookie();
  if (cookies.length) res.setHeader("set-cookie", cookies);
  if (res.req.method === "HEAD" || !response.body) return void res.end();
  await pipeline(Readable.fromWeb(response.body as unknown as WebReadableStream), res).catch(() => {
    // The client went away mid-response (a closed tab's reload stream): nothing to send to.
  });
}