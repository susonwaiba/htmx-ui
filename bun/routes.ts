// File-based routing shared by the dev server and the template renderer.
//   index.html -> "/", about.html -> "/about", docs/index.html -> "/docs",
//   docs/changelog/0.1.0.html -> "/docs/changelog/0.1.0"

/** Route for a page path relative to site/pages, using "/" separators. */
export function routeFor(file: string): string {
  const route = "/" + file.replace(/\.html$/, "").replace(/(^|\/)index$/, "");
  return route === "/" ? route : route.replace(/\/$/, "");
}
