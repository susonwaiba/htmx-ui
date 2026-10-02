// Clean URLs for serving a built site: "/about" -> about.html, "/docs" -> docs/index.html
// (or docs.html), mirroring how the dev server routes pages. Used by `htmx-ui preview` on Bun.
import { existsSync, statSync } from "node:fs";
import { resolve, sep } from "node:path";

const isFile = (f: string) => existsSync(f) && statSync(f).isFile();

/** The file in `dir` for a request pathname, or null. Never leaves `dir`. */
export function staticFile(dir: string, pathname: string): string | null {
  const base = resolve(dir, "." + decodeURIComponent(pathname));
  if (base !== dir && !base.startsWith(dir + sep)) return null;
  const candidates = base === dir ? [resolve(dir, "index.html")] : [base, `${base}.html`, resolve(base, "index.html")];
  for (const f of candidates) if (isFile(f)) return f;
  return null;
}
