// Tidies Bun.build's output for multi-page sites.
//
// Bun gives every HTML entrypoint its own entry chunk. When a page's scripts are
// all shared with other pages (the usual case: every layout loads the same
// app.ts), that chunk is a one-line forwarder, `import"./index-1a2b.js";`, so a
// 30-page site gets 30 stubs (+ 30 source maps) and every page pays a request
// waterfall: HTML -> stub -> the real code. This points each page straight at the
// chunk its stub imports and deletes the stubs, then adds <link rel="modulepreload">
// for whatever a page's scripts still import statically, so the browser fetches
// those in parallel. Vite already emits one shared entry, so this is Bun-only.

import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";

const stripComments = (js: string) => js.replace(/^\s*\/\/[#@].*$/gm, "").trim();

/** The chunk a forwarding stub imports ("./index-1a2b.js"), or null if the file does anything else. */
export function forwardTarget(js: string): string | null {
  return /^import\s*["'](\.\/[^"']+\.js)["'];?$/.exec(stripComments(js))?.[1] ?? null;
}

/** Relative specifiers a chunk imports statically: `import"./a.js"`, `from"./b.js"` (not dynamic import()). */
export function staticImports(js: string): string[] {
  const found = new Set<string>();
  for (const m of stripComments(js).matchAll(/(?:\bimport|\bfrom)\s*["'](\.\.?\/[^"']+\.js)["']/g)) found.add(m[1]!);
  return [...found];
}

const scriptSrcs = (html: string) => [...html.matchAll(/<script\b[^>]*\btype="module"[^>]*\bsrc="([^"]+)"[^>]*>/g)].map((m) => m[1]!);

/**
 * Collapse forwarding entry chunks and add modulepreload links. `files` are the
 * build's output paths; returns the paths it deleted.
 */
export function optimizeChunks(files: string[]): string[] {
  const js = files.filter((f) => f.endsWith(".js"));
  const html = files.filter((f) => f.endsWith(".html"));
  const source = new Map(js.map((f) => [f, readFileSync(f, "utf8")]));

  // Stubs nothing else imports -> the chunk they forward to
  const forwards = new Map<string, string>();
  for (const [file, code] of source) {
    const target = forwardTarget(code);
    if (target) forwards.set(file, resolve(dirname(file), target));
  }
  for (const [file, code] of source) {
    if (forwards.has(file)) continue;
    for (const spec of staticImports(code)) forwards.delete(resolve(dirname(file), spec));
  }

  for (const page of html) {
    let text = readFileSync(page, "utf8");
    const dir = dirname(page);
    const url = (file: string) => {
      const rel = relative(dir, file).split("\\").join("/");
      return rel.startsWith(".") ? rel : `./${rel}`;
    };

    for (const src of scriptSrcs(text)) {
      const target = forwards.get(resolve(dir, src));
      if (target) text = text.replace(`src="${src}"`, `src="${url(target)}"`);
    }

    // Everything the page's scripts import statically, transitively
    const preload = new Set<string>();
    const visit = (file: string) => {
      for (const spec of staticImports(source.get(file) ?? "")) {
        const dep = resolve(dirname(file), spec);
        if (!preload.has(dep) && source.has(dep)) preload.add(dep), visit(dep);
      }
    };
    for (const src of scriptSrcs(text)) visit(resolve(dir, src));
    const links = [...preload]
      .map(url)
      .filter((href) => !text.includes(`href="${href}"`))
      .map((href) => `<link rel="modulepreload" crossorigin href="${href}">`);
    if (links.length) text = text.includes("</head>") ? text.replace("</head>", `${links.join("")}</head>`) : links.join("") + text;

    writeFileSync(page, text);
  }

  const removed: string[] = [];
  for (const stub of forwards.keys()) {
    for (const f of [stub, `${stub}.map`]) {
      if (existsSync(f)) rmSync(f), removed.push(f);
    }
  }
  return removed;
}

