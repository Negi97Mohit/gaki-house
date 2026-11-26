# GAKI Mobile (`@gaki/mobile`)

## Purpose
Mobile-optimized React/Vite PWA companion app acting as a remote stream deck and mobile camera source via LiveKit.

## Commands
```bash
pnpm --filter @gaki/mobile dev
pnpm --filter @gaki/mobile type-check
pnpm --filter @gaki/mobile lint
pnpm --filter @gaki/mobile test
pnpm --filter @gaki/mobile build
```

## Boundaries
- Imports from `@gaki/core/*`, `@gaki/engine/*`, `@gaki/ui/*` via declared `exports` maps.
- `src/data/types.ts` re-exports shared types from `@gaki/core/*` and defines mobile-local types (`Position`, `Size`, `CaptionPreset`, `CinematicPreset`).
- Integrates with `apps/api-handoff` for session linkage.

## Gotchas
- `vite.config.ts` sets `server.fs.allow: ["..", "../../packages"]` and dedupes `react`, `react-dom`, and `@tanstack/react-query` to prevent duplicate React instances.
- `CinematicPreset.hardwareConstraint.capability` is narrowed to `"pan" | "zoom" | "focusMode" | "tilt" | "exposureMode"`.

## "Never" Rules
- Never introduce `any` escapes or disable `@typescript-eslint/no-explicit-any` in mobile components.
- Never use `require()` in `tailwind.config.ts` (use ESM imports).

## Common Mistakes
- Importing internal files from `@gaki/core` or `@gaki/ui` outside their `exports` maps.
- Running `npm install` inside `apps/gaki-mobile` instead of `pnpm add` from root.
