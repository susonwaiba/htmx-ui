// The htmx-ui CLI on Node, on top of Vite. bin/htmx-ui.js imports the compiled
// lib/node/index.js when running under Node.
//
// Same commands and output as on Bun: pages rendered by the htmx-ui Vite plugin,
// Tailwind through @tailwindcss/vite, the public directory, dev routes, and the
// config's build.done hook. Vite and the Tailwind plugin are optional peer
// dependencies, loaded from the project only when the Node runtime is used.
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { HELP, parse } from "../core/cli";
import { loadConfig, pagesOf, type ResolvedConfig } from "../core/config";

type Vite = typeof import("vite");

/** Import a package as the project resolves it (it's the project's dependency, not ours). */
async function fromProject<T>(root: string, name: string): Promise<T | null> {
  try {
    const require = createRequire(resolve(root, "package.json"));
    return (await import(pathToFileURL(require.resolve(name)).href)) as T;
  } catch {
    return null;
  }
}

async function vite(root: string): Promise<Vite> {
  const v = await fromProject<Vite>(root, "vite");
  if (!v) throw new Error("htmx-ui on Node needs Vite: npm install -D vite @tailwindcss/vite (or run on Bun with --bun)");
  return v;
}

/** Vite config for the project: the engine's defaults, then the config's `vite` overrides. */
export async function viteConfig(config: ResolvedConfig, command: "serve" | "build") {
  const v = await vite(config.root);
  const { htmxUi } = await import("./vite-plugin");
  const plugins: unknown[] = [htmxUi(config)];
  const tailwind = await fromProject<{ default: () => unknown }>(config.root, "@tailwindcss/vite");
  if (tailwind) plugins.push(tailwind.default());
  else console.warn("htmx-ui: @tailwindcss/vite is not installed; running without Tailwind (npm install -D @tailwindcss/vite tailwindcss)");

  const opts = config.user.build ?? {};
  const sourcemap = opts.sourcemap ?? "linked";
  const base = {
    configFile: false as const,
    root: config.root,
    appType: "mpa" as const,
    publicDir: config.publicDir ?? false,
    server: { port: config.port, fs: { allow: [config.root, ...config.templateRoots] } },
    preview: { port: config.port },
    define: command === "build" ? opts.define : undefined,
    build: {
      outDir: config.outDir,
      emptyOutDir: true,
      minify: opts.minify ?? true,
      sourcemap: sourcemap === "none" ? false : sourcemap === "external" ? ("hidden" as const) : sourcemap === "linked" ? true : ("inline" as const),
    },
    plugins,
  };
  return v.mergeConfig(base, (config.user.vite ?? {}) as Record<string, unknown>);
}

/** Load the config with Vite's loader, which bundles TypeScript configs for Node. */
export async function loadNodeConfig(root: string): Promise<ResolvedConfig> {
  const v = await vite(root);
  return loadConfig(root, async (file) => (await v.loadConfigFromFile({ command: "serve", mode: "development" }, file, root))?.config);
}

export async function dev(config: ResolvedConfig) {
  const v = await vite(config.root);
  const server = await v.createServer(await viteConfig(config, "serve"));
  await server.listen();
  server.printUrls();
  return server;
}

export async function build(config: ResolvedConfig): Promise<boolean> {
  const v = await vite(config.root);
  await v.build({ ...(await viteConfig(config, "build")), mode: "production" });
  await config.user.build?.done?.({ config, outDir: config.outDir, pages: pagesOf(config) });
  return true;
}

export async function preview(config: ResolvedConfig) {
  const v = await vite(config.root);
  const server = await v.preview(await viteConfig(config, "build"));
  server.printUrls();
  return server;
}

export async function main(argv: string[]): Promise<number> {
  const args = parse(argv);
  if (args.command === "help") return console.log(HELP), 0;
  if (args.command === "version") return 0; // bin/htmx-ui.js prints it
  const config = await loadNodeConfig(args.root);
  if (args.port) config.port = args.port;
  if (args.command === "build") return (await build(config)) ? 0 : 1;
  await (args.command === "dev" ? dev(config) : preview(config));
  return new Promise(() => {}); // serve until killed
}
