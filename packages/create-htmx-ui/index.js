#!/usr/bin/env node
// create-htmx-ui: start a new htmx-ui site.
//
//   npm create htmx-ui@latest my-site
//   pnpm create htmx-ui my-site
//   yarn create htmx-ui my-site
//   bun create htmx-ui my-site
//
// Copies template/ into the directory and writes a package.json for the package
// manager that ran it. The runtime follows the package manager: Bun projects build
// with Bun (bun-plugin-tailwind); npm, pnpm and yarn projects build on Node (Vite,
// @tailwindcss/vite). --runtime overrides it.
//
// Plain JavaScript with no dependencies, so it runs straight from the registry on
// Node 18+ or Bun.

import { spawnSync } from "node:child_process";
import { cpSync, existsSync, readdirSync, readFileSync, realpathSync, renameSync, writeFileSync } from "node:fs";
import { basename, relative, resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const HELP = `Usage: create-htmx-ui [directory] [options]

Options:
  --pm <npm|pnpm|yarn|bun>   package manager (default: the one running this)
  --runtime <bun|node>       runtime for dev/build (default: bun for bun, else node)
  --install / --no-install   install dependencies (default: ask, or no when not interactive)
  --force                    write into a directory that isn't empty
  -h, --help                 show this help`;

const here = new URL(".", import.meta.url);
const self = JSON.parse(readFileSync(new URL("package.json", here), "utf8"));
const template = new URL("template/", here);

/** Versions of the third-party packages a new project starts with. */
const VERSIONS = {
  "htmx.org": "^4.0.0",
  tailwindcss: "^4.3.3",
  "bun-plugin-tailwind": "^0.1.2",
  vite: "^8.3.2",
  "@tailwindcss/vite": "^4.3.3",
};

const MANAGERS = ["npm", "pnpm", "yarn", "bun"];

/** The package manager that started us, from npm_config_user_agent ("pnpm/10.1.0 npm/? node/v24..."). */
export function detectManager(agent = process.env.npm_config_user_agent ?? "") {
  const name = agent.split("/")[0];
  return MANAGERS.includes(name) ? name : "npm";
}

/** package.json for a new project. */
export function projectPackage(name, { pm, runtime, version = self.version }) {
  const flag = runtime === "bun" && pm !== "bun" ? " --bun" : runtime === "node" && pm === "bun" ? " --node" : "";
  const tooling =
    runtime === "bun"
      ? { "bun-plugin-tailwind": VERSIONS["bun-plugin-tailwind"] }
      : { vite: VERSIONS.vite, "@tailwindcss/vite": VERSIONS["@tailwindcss/vite"] };
  return {
    name,
    private: true,
    type: "module",
    scripts: { dev: `htmx-ui dev${flag}`, build: `htmx-ui build${flag}`, preview: `htmx-ui preview${flag}` },
    dependencies: { "htmx-ui": `^${version}`, "htmx.org": VERSIONS["htmx.org"] },
    devDependencies: sortKeys({ "htmx-ui-engine": `^${version}`, tailwindcss: VERSIONS.tailwindcss, ...tooling }),
  };
}

const sortKeys = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));

const run = (pm, script) => (pm === "npm" ? `npm run ${script}` : `${pm} ${script}`);

/** npm-safe package name from a directory name. */
export const packageName = (dir) =>
  basename(resolve(dir))
    .toLowerCase()
    .replace(/[^a-z0-9._~-]+/g, "-")
    .replace(/^[._-]+|-+$/g, "") || "htmx-ui-site";

function readme(name, pm) {
  return `# ${name}

An [htmx-ui](https://github.com/susonwaiba/htmx-ui) site.

\`\`\`sh
${pm} install
${run(pm, "dev")}       # dev server with HMR at http://localhost:3000
${run(pm, "build")}     # static build in dist/
${run(pm, "preview")}   # serve dist/
\`\`\`

- \`pages/**/*.html\`: routes (\`pages/about.html\` -> \`/about\`), Nunjucks templates
- \`layouts/\`, \`partials/\`: shared markup; \`data/*.json\`: read with \`json()\`
- \`app.ts\`, \`styles.css\`: client entry and Tailwind + htmx-ui styles
- \`public/\`: served and copied as-is
- \`htmx-ui.config.ts\`: engine options and mock dev routes for htmx
`;
}

/** Write the project. Returns the absolute directory. */
export function scaffold(dir, { pm = "npm", runtime = pm === "bun" ? "bun" : "node", force = false, version } = {}) {
  const target = resolve(dir);
  if (existsSync(target) && readdirSync(target).length && !force) {
    throw new Error(`${relative(process.cwd(), target) || "."} is not empty (use --force to write into it anyway)`);
  }
  cpSync(template, target, { recursive: true, force: true });
  // npm drops .gitignore from published packages, so the template ships it as _gitignore
  renameSync(resolve(target, "_gitignore"), resolve(target, ".gitignore"));
  const name = packageName(target);
  writeFileSync(resolve(target, "package.json"), JSON.stringify(projectPackage(name, { pm, runtime, version }), null, 2) + "\n");
  writeFileSync(resolve(target, "README.md"), readme(name, pm));
  return target;
}

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      pm: { type: "string" },
      runtime: { type: "string" },
      install: { type: "boolean" },
      "no-install": { type: "boolean" },
      force: { type: "boolean" },
      help: { type: "boolean", short: "h" },
    },
  });
  if (values.help) return console.log(HELP);

  const pm = values.pm ?? detectManager();
  if (!MANAGERS.includes(pm)) throw new Error(`--pm must be one of ${MANAGERS.join(", ")}`);
  const runtime = values.runtime ?? (pm === "bun" ? "bun" : "node");
  if (!["bun", "node"].includes(runtime)) throw new Error("--runtime must be bun or node");

  const interactive = process.stdin.isTTY && process.stdout.isTTY;
  const rl = interactive ? createInterface({ input: process.stdin, output: process.stdout }) : null;
  let dir = positionals[0];
  if (!dir) dir = (rl ? (await rl.question("Project directory: (htmx-ui-site) ")).trim() : "") || "htmx-ui-site";

  const target = scaffold(dir, { pm, runtime, force: values.force });
  const shown = relative(process.cwd(), target) || ".";
  console.log(`\nCreated ${shown} (${pm}, ${runtime === "bun" ? "Bun" : "Node + Vite"}).`);

  let install = values["no-install"] ? false : values.install;
  if (install === undefined) install = rl ? !/^n/i.test((await rl.question(`Install dependencies with ${pm}? (Y/n) `)).trim()) : false;
  rl?.close();

  if (install) {
    const result = spawnSync(pm, ["install"], { cwd: target, stdio: "inherit", shell: process.platform === "win32" });
    if (result.status !== 0) throw new Error(`${pm} install failed`);
  }

  console.log(`\nNext:\n${shown === "." ? "" : `  cd ${shown}\n`}${install ? "" : `  ${pm} install\n`}  ${run(pm, "dev")}\n`);
}

// Run as a CLI (directly or through a bin symlink), not when imported by tests.
const isMain = (() => {
  try {
    return realpathSync(process.argv[1] ?? "") === fileURLToPath(import.meta.url);
  } catch {
    return false;
  }
})();
if (isMain) {
  main().catch((e) => {
    console.error(`create-htmx-ui: ${e instanceof Error ? e.message : e}`);
    process.exit(1);
  });
}
