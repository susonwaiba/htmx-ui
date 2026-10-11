// Tailwind's automatic source detection scans from the bundler's root (else
// process.cwd()). Neither is the project root where htmx-ui bundles: the dev
// server has no root (it runs from the workspace above the project) and the
// static build bundles with root = pages/, which would leave out classes used
// only in layouts/ and partials/. Both hand the plugin the project root instead,
// so dev and build see the same classes.
import type { BunPlugin, PluginBuilder } from "bun";

export function rootedTailwind(tailwind: BunPlugin, root: string): BunPlugin {
  return {
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
  };
}
