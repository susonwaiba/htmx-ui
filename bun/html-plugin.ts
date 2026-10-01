// Bun plugin: composes .html templates (layouts + includes) before Bun's HTML bundler.
//
// Load order matters. This must run BEFORE bun-plugin-tailwind so Tailwind scans
// the fully composed markup and sees every class from layouts and partials.
//
// Registered in:
//   bunfig.toml  -> [serve.static] plugins (dev server)
//   build.ts     -> Bun.build({ plugins })

import type { BunPlugin } from "bun";
import { compose } from "./compose";

const plugin: BunPlugin = {
  name: "html-compose",
  setup(build) {
    build.onLoad({ filter: /\.html$/ }, async ({ path }) => {
      return { contents: await compose(path), loader: "html" };
    });
  },
};

export default plugin;
