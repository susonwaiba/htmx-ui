# htmx-ui-upgrade

Upgrade an [htmx-ui](https://www.npmjs.com/package/htmx-ui) project's code to a newer htmx-ui.

```bash
npx htmx-ui-upgrade@latest
bunx htmx-ui-upgrade@latest
pnpm dlx htmx-ui-upgrade@latest
yarn dlx htmx-ui-upgrade@latest
```

It reads the htmx-ui version your project is on from its `package.json` (`htmx-ui`, else `htmx-ui-engine`, else a
plugin), then runs every migration after it, oldest first, over your templates, scripts, stylesheets and
`htmx-ui.config.*`:

- renames classes and attributes that changed (`.sidebar-link` → `.sidebar-menu-button`, `[data-sidebar-toggle]` →
  `[data-sidebar-trigger]`, …) in `class="…"` values, selectors and strings;
- rewrites markup that changed shape (the 0.2 code block copy button becomes a clipboard button), adds classes that
  are now required (close buttons are `.btn` buttons since 0.3), drops removed APIs (`initCode()`) and renames config
  keys (`templates` → `roots`);
- sets the htmx-ui packages in `package.json` to the new version;
- lists, as `file:line`, everything it couldn't change safely: markup it doesn't recognise, removed classes with no
  one-to-one replacement, and old names left in prose and comments.

Then install the new versions with your package manager and build. Release notes:
[/docs/changelog](https://susonwaiba.github.io/htmx-ui/docs/changelog).

`node_modules`, `dist`, `build`, `lib`, `archive` (frozen docs from htmx-ui-plugin-versions) and dot-directories
like `.git` are never touched. It refuses to run on a git working tree with uncommitted changes, so the upgrade is one
diff you can review and undo.

| Option | |
| :--- | :--- |
| `[directory]` | the project to upgrade (default: `.`) |
| `--from <version>` | the version the code is written for (default: read from `package.json`) |
| `--to <version>` | upgrade to this version (default: the newest this release knows) |
| `--dry-run` | show what would change; write nothing |
| `--force` | run with uncommitted changes |
| `--list` | list the migrations |

Always run `@latest`: each htmx-ui release ships an htmx-ui-upgrade with the same version that knows every migration
up to it.

No dependencies; runs on Node 18.3+ (compiled `lib/`) and Bun (the TypeScript source). The API behind the command,
`upgrade(dir, { from, to, dryRun })`, is exported for scripts.

## License

[MIT](LICENSE)
