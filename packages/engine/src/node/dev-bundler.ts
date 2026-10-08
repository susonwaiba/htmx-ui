// Dev bundles on Node (../core/dev.ts): a page's sources bundled in memory by Vite's
// build (write: false), with @tailwindcss/vite when the project has it. Entries keep
// their path from the project root ("app.ts" -> "app.js"), as on Bun.
import { relative } from "node:path";
import type { ResolvedConfig } from "../core/config";
import type { BundleFile, Bundler } from "../core/dev";
import { contentType } from "../core/site";
import { fromProject, vite } from "./index";

const entryName = (config: ResolvedConfig, file: string) =>
  relative(config.root, file)
    .split("\\")
    .join("/")
    .replace(/\.[^./]+$/, "");

export const bundle: Bundler = async (config: ResolvedConfig, sources: string[], base: string) => {
  const v = await vite(config.root);
  const tailwind = await fromProject<{ default: () => unknown }>(config.root, "@tailwindcss/vite");
  const built = await v.build({
    configFile: false,
    root: config.root,
    base,
    mode: "development",
    logLevel: "silent",
    publicDir: false,
    plugins: (tailwind ? [tailwind.default()] : []) as import("vite").PluginOption[],
    define: { "process.env.NODE_ENV": JSON.stringify("development"), ...config.user.build?.define },
    build: {
      write: false,
      minify: false,
      sourcemap: "inline",
      modulePreload: false,
      rollupOptions: {
        input: Object.fromEntries(sources.map((s) => [entryName(config, s), s])),
        output: { entryFileNames: "[name].js", chunkFileNames: "_chunks/[name]-[hash].js", assetFileNames: "_assets/[name]-[hash][extname]" },
      },
    },
  });
  const files = new Map<string, BundleFile>();
  for (const output of (Array.isArray(built) ? built : [built]) as { output: { fileName: string; type: string; code?: string; source?: string | Uint8Array }[] }[]) {
    for (const item of output.output) {
      files.set(item.fileName, { body: item.type === "chunk" ? item.code! : (item.source as string | Uint8Array<ArrayBuffer>), type: contentType(item.fileName) });
    }
  }
  return files;
};
