// Guards against a silent CSS-optimiser bug: when one rule has several
// color-mix() values, the minified build keeps only one and drops the others
// (it happened to the alert/badge tints and --scrollbar-thumb-hover). Compiles
// the library CSS exactly like the production build and checks every custom
// property, and every color-mix() override, declared in src/ survives.
import { expect, test } from "bun:test";
import tailwind from "bun-plugin-tailwind";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
const SRC = join(import.meta.dir, "src");

test("every custom property and color-mix() in src/ survives the minified build", async () => {
  // Inside the package so "tailwindcss" resolves from its node_modules
  const dir = join(import.meta.dir, "node_modules/.cache/css-test");
  await mkdir(dir, { recursive: true });
  const entry = join(dir, "entry.css");
  // Built-in themes (src/themes/) are opt-in imports, not part of styles.css, so import them
  // here too: their custom properties must survive the build as well.
  const themes = [...new Bun.Glob("themes/*.css").scanSync(SRC)]
    .map((file) => `@import "${join(SRC, file)}";`)
    .join("\n");
  // @source inline: generate utilities defined in src/ (e.g. .prose) with no markup to scan
  await Bun.write(
    entry,
    `@import "tailwindcss";\n@import "${join(SRC, "styles.css")}";\n${themes}\n@source inline("prose");\n`,
  );
  const result = await Bun.build({ entrypoints: [entry], outdir: join(dir, "out"), minify: true, plugins: [tailwind] });
  expect(result.success).toBe(true);
  const css = await result.outputs[0]!.text();

  for await (const file of new Bun.Glob("**/*.css").scan(SRC)) {
    const source = (await Bun.file(join(SRC, file)).text())
      .replace(/\/\*[\s\S]*?\*\//g, "")
      // @theme inline variables are inlined into utilities by design, not emitted
      .replace(/@theme[^{]*\{[\s\S]*?\n\}/g, "");
    for (const [, name, value] of source.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
      expect(css, `${file}: ${name}`).toContain(`${name}:`);
      if (value!.includes("color-mix(")) {
        // Declared with color-mix() -> the optimised output must still contain a color-mix() value for it
        expect(css, `${file}: ${name} lost its color-mix()`).toMatch(new RegExp(`${name}:color-mix\\(`));
      }
    }
  }
}, 30_000);
