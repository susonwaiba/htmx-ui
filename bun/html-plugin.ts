// Bun plugin: renders .html pages with Nunjucks before Bun's HTML bundler.
//
// Load order matters. This must run BEFORE bun-plugin-tailwind so Tailwind scans
// the fully rendered markup and sees every class from layouts and partials.
//
// Registered in:
//   bunfig.toml  -> [serve.static] plugins (dev server)
//   build.ts     -> Bun.build({ plugins })

import type { BunPlugin } from "bun";
import { renderPage } from "./render";

const plugin: BunPlugin = {
  name: "html-nunjucks",
  setup(build) {
    build.onLoad({ filter: /\.html$/ }, ({ path }) => {
      return { contents: renderPage(path), loader: "html" };
    });
  },
};

export default plugin;
