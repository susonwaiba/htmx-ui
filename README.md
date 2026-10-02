# htmx-ui

Tailwind CSS v4 components for [htmx](https://htmx.org) apps, and the engine that builds sites with them.

| Package | |
| :--- | :--- |
| [`htmx-ui`](packages/ui) | The component library: CSS classes, design tokens, dark mode, small behaviours that work inside htmx swaps |
| [`htmx-ui-engine`](packages/engine) | `htmx-ui dev` / `build` / `preview`: Nunjucks pages, file-based routing, Tailwind, HMR, mock htmx endpoints. Runs on Bun or Node (Vite); also a Bun plugin and a Vite plugin |
| [`create-htmx-ui`](packages/create-htmx-ui) | `npm create htmx-ui` / `pnpm create htmx-ui` / `yarn create htmx-ui` / `bun create htmx-ui` |

```bash
npm create htmx-ui@latest my-site
cd my-site
npm install
npm run dev
```

Already have a build? Install just the components: `npm install htmx-ui htmx.org` and see
[packages/ui](packages/ui/README.md).

## Development

A [Bun](https://bun.sh) workspace: the packages in `packages/`, the docs website in `site/` (built with the engine,
like any user site), and repo scripts in `scripts/`.

```bash
bun install
bun run dev            # docs site with hot reload at http://localhost:3000
bun test
bun run release:check  # everything that must pass before publishing
```

See [AGENTS.md](AGENTS.md) for architecture and conventions, and [CHANGELOG.md](CHANGELOG.md) for releases.

## License

[MIT](LICENSE)
