# `@gaki/ui`

## Purpose
Shared Radix UI + Tailwind component library consumed by `apps/web` and `apps/gaki-mobile`.

## Commands
```bash
pnpm --filter @gaki/ui type-check
```

## Boundaries
- May import from `@gaki/core/*` (e.g. `@gaki/core/lib/utils`, `@gaki/core/types/toast`, `@gaki/core/hooks/use-toast`).
- Must never import from `apps/*` or `@/...`.
- All components are imported by subpath via `package.json` `exports` (e.g. `@gaki/ui/button`).

## Gotchas
- `AppLogo` accepts `AppLogoProps` including `style?: React.CSSProperties` (used by `Loader` in `apps/gaki-mobile`).
- Toast primitives import `ToastProps` / `ToastActionElement` from `@gaki/core/types/toast` (not the other way around) to avoid a `@gaki/core` <-> `@gaki/ui` cycle.

## "Never" Rules
- Never create barrel `index.ts` files (`docs/decisions/no-barrel-exports.md`).
- Never re-export types from `@gaki/ui` that `@gaki/core` needs to import.

## Common Mistakes
- Exporting shared types from `@gaki/ui` and importing them back in `@gaki/core`, re-introducing a circular package dependency.
