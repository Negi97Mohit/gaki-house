# Add a New Package Export

When adding a new module to `packages/core`, `packages/engine`, `packages/ui`, or `packages/handoff-sdk`:

1. Create the module under `src/` (never create a barrel `index.ts`).
2. Declare its subpath in the package's `package.json` `"exports"` map (e.g. `"./lib/myHelper": "./src/lib/myHelper.ts"`).
3. Ensure any external npm package imported by the module is declared in that package's own `package.json` (using `"catalog:"` if shared in `pnpm-workspace.yaml`).
4. Run `pnpm boundary-check` and `pnpm type-check` from root.
