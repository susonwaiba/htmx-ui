// Production build: every src/pages/**/*.html is an entrypoint; output goes to dist/.
import { Glob } from "bun";
import tailwind from "bun-plugin-tailwind";
import { rm } from "node:fs/promises";

const outdir = "./dist";
await rm(outdir, { recursive: true, force: true });

const entrypoints = [...new Glob("src/pages/**/*.html").scanSync(".")];

const result = await Bun.build({
  entrypoints,
  root: "./src/pages",
  outdir,
  target: "browser",
  minify: true,
  splitting: true,
  sourcemap: "linked",
  plugins: [tailwind],
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
});

if (!result.success) {
  console.error("Build failed:");
  for (const log of result.logs) console.error(log);
  process.exit(1);
}

for (const output of result.outputs) {
  const kb = (output.size / 1024).toFixed(1);
  console.log(` -> ${output.path.replace(process.cwd() + "/", "")} (${kb} KB)`);
}
