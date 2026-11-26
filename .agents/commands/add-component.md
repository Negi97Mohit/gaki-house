# Add a UI Component

1. **Shared primitive (`@gaki/ui`):**
   - Create `packages/ui/src/<name>.tsx` (no barrel `index.ts`).
   - Import utilities from `@gaki/core/lib/utils` (`cn`) — never from `apps/*` or `@/...`.
   - Export the subpath in `packages/ui/package.json` `"exports"` (e.g. `"./<name>": "./src/<name>.tsx"`).
2. **Feature-specific component (`@gaki/web` or `@gaki/mobile`):**
   - Place under `apps/web/src/features/<feature>/ui/<Component>.tsx` (or `apps/gaki-mobile/src/...`).
   - Use Zustand stores in `apps/web/src/stores/` for global state; never add `React.Context` for global state.
   - Use `apps/web/src/lib/zIndex.ts` for any `z-index` — never hardcode numbers.
3. **Verify:**
   - `pnpm boundary-check`
   - `pnpm --filter @gaki/web type-check` and `pnpm --filter @gaki/web lint` (do not exceed `--max-warnings 607`).
