// bun-plugin-tailwind as Bun.serve loads it in dev, listed in the bunfig.toml that
// `htmx-ui dev` generates (./dev.ts), after ./serve-plugin.ts.
//
// The dev server runs from the directory holding the project and its linked
// packages (../core/workspace.ts), not the project itself. Tailwind takes the bundler's
// root, else process.cwd(), as the base for automatic source detection, and
// Bun.serve gives it no root: so this hands it the project's, or a stylesheet with
// no source(...) would have Tailwind scan every package in the workspace.
import type { BunPlugin, PluginBuilder } from "bun";

const root = process.env.HTMX_UI_ROOT ?? process.cwd();
const tailwind = (await import(Bun.resolveSync("bun-plugin-tailwind", root))).default as BunPlugin;

export default {
  ...tailwind,
  setup(build: PluginBuilder) {
    const rooted = new Proxy(build, {
      get(target, key) {
        if (key === "config") return { ...target.config, root };
        const value = Reflect.get(target, key, target);
        return typeof value === "function" ? value.bind(target) : value;
      },
    });
    return tailwind.setup(rooted);
  },
} satisfies BunPlugin;
