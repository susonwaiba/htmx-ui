# create-htmx-ui

Start a new [htmx-ui](https://www.npmjs.com/package/htmx-ui) site.

```bash
bun create htmx-ui my-site
npm create htmx-ui@latest my-site
pnpm create htmx-ui my-site
yarn create htmx-ui my-site
```

You get pages, a layout with a theme toggle, Tailwind with htmx-ui's styles, an htmx demo talking to a mock
endpoint, and `dev` / `build` / `preview` scripts powered by
[htmx-ui-engine](https://www.npmjs.com/package/htmx-ui-engine). Bun projects run on Bun; npm, pnpm and yarn
projects run on Node with Vite.

| Option | |
| :--- | :--- |
| `--pm <bun\|npm\|pnpm\|yarn>` | package manager (default: the one running the command) |
| `--runtime <bun\|node>` | runtime for dev and build (default: bun for bun, node otherwise) |
| `--install`, `--no-install` | install dependencies (asks when interactive) |
| `--force` | write into a non-empty directory |

## License

[MIT](LICENSE)
