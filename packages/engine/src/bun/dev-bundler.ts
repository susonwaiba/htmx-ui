// Dev bundles on Bun (../core/dev.ts): a page's sources bundled in memory by
// Bun.build, with Tailwind when the project has it. `root` is the project root, so
// entries keep their path from it ("app.ts" -> "app.js") and Tailwind detects
// sources from there, as `htmx-ui build` does.
import { normalize } from "node:path/posix";
import type { ResolvedConfig } from "../core/config";
import type { BundleFile, Bundler } from "../core/dev";

export const bundle: Bundler = async (config: ResolvedConfig, sources: string[], base: string) => {
  const plugins = [];
  try {
    plugins.push((await import(Bun.resolveSync("bun-plugin-tailwind", config.root))).default);
  } catch {
    // No Tailwind installed: the bundle is just the scripts and stylesheets.
  }
  const result = await Bun.build({
    entrypoints: sources,
    root: config.root,
    target: "browser",
    splitting: true,
    publicPath: base,
    naming: { entry: "[dir]/[name].[ext]", chunk: "_chunks/[name]-[hash].[ext]", asset: "_assets/[name]-[hash].[ext]" },
    sourcemap: "inline",
    plugins,
    define: { "process.env.NODE_ENV": JSON.stringify("development"), ...config.user.build?.define },
  }).catch((e: unknown) => {
    // Bun.build throws an AggregateError whose message says nothing; the reasons are in it.
    if (e instanceof AggregateError) throw new Error(e.errors.map(String).join("\n"));
    throw e;
  });
  if (!result.success) throw new Error(result.logs.map(String).join("\n"));
  const files = new Map<string, BundleFile>();
  for (const output of result.outputs) {
    files.set(normalize(output.path).replace(/^\.\//, ""), { body: new Uint8Array(await output.arrayBuffer()), type: output.type });
  }
  return files;
};
