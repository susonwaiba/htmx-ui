// htmx-ui-plugin-search: site search as a Ctrl/⌘K command palette.
//
//   import { defineConfig } from "htmx-ui-engine";
//   import docs from "htmx-ui-plugin-docs";
//   import search from "htmx-ui-plugin-search";
//   export default defineConfig({ plugins: [docs(), search()] });
//
// The server side is only its templates: search/macros.html, with search() for the
// button and the dialog. The palette itself runs in the browser
// (htmx-ui-plugin-search/client) over a sitemap.json, which htmx-ui-plugin-docs
// publishes with every page's title, outline and section text; any file in that
// format works (see ./search-index.ts, `Sitemap`). With htmx-ui-plugin-versions, a
// reader of archived docs searches that version's own sitemap.

import { definePlugin, type Plugin } from "htmx-ui-engine";
import { fileURLToPath } from "node:url";

export { buildIndex, search as searchIndex, snippet, type SearchRecord, type SearchResult, type Sitemap } from "./search-index";

/** The plugin's templates: src/templates, from src/ and from the compiled lib/ alike. */
export const TEMPLATES = fileURLToPath(new URL("../src/templates", import.meta.url));

export function search(): Plugin {
  return definePlugin({
    name: "search",
    roots: [TEMPLATES],
  });
}

export default search;
