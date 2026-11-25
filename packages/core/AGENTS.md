# `@gaki/core`

## Purpose
Leaf package containing shared TypeScript types, constants, utility hooks, and browser helpers (`cn`, `generateId`, `notify`, `throttle`, `debounce`) used across all apps and packages.

## Commands
```bash
pnpm --filter @gaki/core type-check
pnpm --filter @gaki/core test
```

## Boundaries
- Leaf package: must have **zero** dependencies on any app or on `@gaki/ui`, `@gaki/engine`, or `@gaki/handoff-sdk`.
- All public subpaths are declared in `package.json` `exports`.
- Every dependency imported in `src/` (`clsx`, `tailwind-merge`, `sonner`) must be declared in `packages/core/package.json`.

## Gotchas
- Browser-targeted: `NodeJS.*` globals are unavailable; use `ReturnType<typeof setTimeout>` instead of `NodeJS.Timeout`.
- `ToastProps` in `src/types/toast.ts` uses `Omit<HTMLAttributes<HTMLLIElement>, "onPause">` to stay compatible with `@radix-ui/react-toast`.

## "Never" Rules
- Never import from `apps/*`, `@/...`, or `@gaki/ui` (breaks leaf boundary / recreates core<->ui cycle).
- Never create barrel `index.ts` files (`docs/decisions/no-barrel-exports.md`).

## Common Mistakes
- Importing a package like `clsx` without declaring it in `packages/core/package.json` (fails strict pnpm isolation).
