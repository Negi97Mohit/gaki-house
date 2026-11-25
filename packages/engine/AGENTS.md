# `@gaki/engine`

## Purpose
WebGL, OffscreenCanvas, and Audio kernel pipeline (`BroadcastBus`, `AudioMixerEngine`, `BroadcastEncoder`, `GLRenderer`, `SceneGraph`, `OBSParser`, `animeStylesStore`).

## Commands
```bash
pnpm --filter @gaki/engine type-check
pnpm --filter @gaki/engine test
```

## Boundaries
- May import from `@gaki/core/*` only (never from `apps/*` or `@/...`).
- Exposes subpaths via `package.json` `exports`.

## Gotchas
- **OffscreenCanvas**: Must be transferred via `transferControlToOffscreen()`, never copied.
- **BroadcastBus**: Re-instantiates on scene switches while mounted inside `CanvasView` (known cause of brief stream drops during scene transitions).
- **AnimeStyles**: `animeStylesStore.ts` holds `AnimeStyles` and `updateAnimeStyles()` inside `@gaki/engine` so `apps/web` re-exports it without creating a package-to-app dependency.

## "Never" Rules
- Never import `@/...` app aliases inside `packages/engine`.
- Never copy `OffscreenCanvas` instead of transferring control.
- Never instantiate `BroadcastBus` inside a React render cycle.
- Never create barrel `index.ts` files.

## Common Mistakes
- Moving `animeStylesStore` state back into `apps/web` and importing `@/lib/animeStyles` from engine code.
