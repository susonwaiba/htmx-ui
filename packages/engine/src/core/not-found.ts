// The 404 page htmx-ui answers with when a project has none of its own. A project
// replaces it by adding pages/404.html: the build writes that to dist/404.html, and
// createSite() serves it (or, in development, renders it) instead of this. A build
// without one gets this page as dist/404.html, so a static host serves it too.
//
// It is a whole document with its styles inline, because it is served without a
// build: no Tailwind, no hashed stylesheet, nothing to fetch. The colours follow the
// visitor's light/dark preference like htmx-ui's own theme does.

import { existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

export const NOT_FOUND_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>404 Not Found</title>
<style>
  :root { color-scheme: light dark; --bg: #fff; --fg: #0a0a0a; --muted: #737373; --link: #2563eb; }
  @media (prefers-color-scheme: dark) { :root { --bg: #0a0a0a; --fg: #fafafa; --muted: #a3a3a3; --link: #60a5fa; } }
  body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: var(--bg); color: var(--fg);
    font: 16px/1.5 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; }
  main { max-width: 32rem; padding: 2rem 1rem; text-align: center; }
  p.code { margin: 0; color: var(--muted); font-size: .875rem; font-weight: 600; letter-spacing: .1em; }
  h1 { margin: .5rem 0 1rem; font-size: 2rem; line-height: 1.2; }
  p { color: var(--muted); }
  a { color: var(--link); }
</style>
</head>
<body>
<main>
  <p class="code">404</p>
  <h1>Page not found</h1>
  <p>Sorry, we couldn't find the page you're looking for.</p>
  <p><a href="/">Go back to the homepage</a></p>
</main>
</body>
</html>
`;

/** After a build: write the default page as outDir/404.html unless the project built its own. */
export function writeNotFound(outDir: string): void {
  const file = resolve(outDir, "404.html");
  if (!existsSync(file)) writeFileSync(file, NOT_FOUND_HTML);
}
