// `htmx-ui build` on Bun: every page is a Bun.build HTML entrypoint, rendered by
// the htmx-ui plugin, then Tailwind; the public directory is copied over as-is.
// Pages keep their paths (docs/intro.html); scripts, styles and assets go to
// assets/ with content hashes, shared by every page that uses them (./chunks.ts).
import { cp, rm } from "node:fs/promises";
import { relative } from "node:path";
import { pagesOf, type ResolvedConfig } from "../core/config";
import { optimizeChunks } from "./chunks";
import { htmxUiPlugin, PUBLIC_ORIGIN } from "./plugin";

export async function build(config: ResolvedConfig): Promise<boolean> {
  const { outDir } = config;
  const opts = config.user.build ?? {};
  const pages = pagesOf(config);
  await rm(outDir, { recursive: true, force: true });

  const plugins = [htmxUiPlugin(config)];
  try {
    plugins.push((await import(Bun.resolveSync("bun-plugin-tailwind", config.root))).default);
  } catch {
    console.warn("htmx-ui: bun-plugin-tailwind is not installed; building without Tailwind (bun add -d bun-plugin-tailwind tailwindcss)");
  }

  const result = await Bun.build({
    entrypoints: pages.map((p) => p.file),
    root: config.pagesDir,
    outdir: outDir,
    target: "browser",
    minify: opts.minify ?? true,
    splitting: true,
    naming: { entry: "[dir]/[name].[ext]", chunk: "assets/[name]-[hash].[ext]", asset: "assets/[name]-[hash].[ext]" },
    sourcemap: opts.sourcemap ?? "linked",
    plugins,
    define: { "process.env.NODE_ENV": JSON.stringify("production"), ...opts.define },
  });
  if (!result.success) {
    console.error("Build failed:");
    for (const log of result.logs) console.error(log);
    return false;
  }

  const removed = new Set(optimizeChunks(result.outputs.map((o) => o.path)));
  const outputs = result.outputs.filter((o) => !removed.has(o.path));

  if (config.publicDir) {
    // Links to public files were given a placeholder origin so Bun left them alone (./plugin.ts)
    for (const output of outputs) {
      if (!output.path.endsWith(".html")) continue;
      const html = await Bun.file(output.path).text();
      if (html.includes(PUBLIC_ORIGIN)) await Bun.write(output.path, html.replaceAll(PUBLIC_ORIGIN, ""));
    }
    await cp(config.publicDir, outDir, { recursive: true });
  }
  await opts.done?.({ config, outDir, pages });

  for (const output of outputs) {
    if (output.path.endsWith(".map")) continue;
    console.log(` -> ${relative(process.cwd(), output.path)} (${(output.size / 1024).toFixed(1)} KB)`);
  }
  return true;
}
