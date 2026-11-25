# GAKI Monorepo — Agent Instructions

Single source of truth for AI agents working in this repository. Before modifying any workspace, also read that workspace's `AGENTS.md` (if present).

---

## Purpose

A **pnpm** + **Turborepo** monorepo for the GAKI live-streaming platform:
- `apps/web` — Main browser studio (React/Vite broadcast mixer, canvas compositor, multi-platform streaming)
- `apps/gaki-mobile` — Mobile PWA (remote stream deck + camera source)
- `apps/desktop` — Electron wrapper around `apps/web` + native FFmpeg pipe
- `apps/api-handoff` — Express server vending LiveKit tokens for handoff sessions
- `apps/api-signaling` — Socket.io WebRTC broker for Omegle Mode matching
- `apps/ml-backend` — Modal FastAPI service for T4 GPU inference + ML-Sharp bridge
- `packages/core` — Shared types, constants, and utility hooks (leaf package)
- `packages/engine` — WebGL/Canvas/Audio kernel pipeline (`BroadcastBus`, OBS parser)
- `packages/handoff-sdk` — Cross-device streaming coordination SDK
- `packages/ui` — Radix UI component library
- `packages/config-typescript` — Shared TypeScript base configs

---

## Commands

Run from the monorepo root:

```bash
pnpm install              # Install all workspace dependencies
pnpm check                # Run type-check, lint, and test across all workspaces
pnpm boundary-check       # Verify package boundaries & zero cycles (dependency-cruiser)
pnpm build                # Build all workspaces via Turborepo
pnpm type-check           # Run TypeScript checks across all workspaces
pnpm lint                 # Run ESLint across all workspaces
pnpm test                 # Run Vitest test suites across all workspaces
pnpm --filter @gaki/web dev
pnpm --filter @gaki/mobile dev
```

---

## Boundaries

Enforced by `.dependency-cruiser.cjs` (`pnpm boundary-check`):
1. **No circular package dependencies** (`@gaki/core` <-> `@gaki/ui` or any other cycle is forbidden).
2. **Packages never import from apps** (no `packages/*` -> `apps/*` or `@/...` app alias inside packages).
3. **Use explicit `exports` maps**: Import package subpaths declared in each package's `package.json` `exports` field (e.g. `@gaki/core/lib/utils`, `@gaki/ui/button`). Do **not** create barrel `index.ts` files (`docs/decisions/no-barrel-exports.md`).
4. **Shared dependencies**: Declare shared versions in `pnpm-workspace.yaml` `catalog:` and reference `"catalog:"` in workspace `package.json` files. Each package must declare the dependencies it imports itself.

---

## Gotchas

- **Audio DSP**: Noise gate thresholds, attack/release times, and `-48/-40 dBFS` rules in `apps/web/src/features/stream/services/stream-audio-dsp.ts` and `stream.service.ts` are production-tuned (`docs/decisions/audio-dsp-no-touch.md`).
- **Audio feedback**: `stream.service.ts` routes mic sidetone to `monitorGain` (default 0), never system audio, to prevent loopback feedback.
- **OffscreenCanvas**: Must be **transferred** via `transferControlToOffscreen()`, never copied.
- **BroadcastBus**: Currently tied to `CanvasView` and re-instantiates on scene switches (known issue causing brief stream drops). Do not instantiate `BroadcastBus` inside React render cycles.
- **Electron OAuth**: Google OAuth redirect inside `apps/desktop` must stay `http://localhost:3456`; custom domains fail inside Electron wrappers.
- **Modal cold starts**: `apps/ml-backend` T4 GPU containers take 10–30s on cold start; clients must handle timeouts with user feedback.
- **Secrets**: Server-only secrets (`TWITCH_CLIENT_SECRET`, `KICK_CLIENT_SECRET`, `DEEPGRAM_API_KEY`) must never use the `VITE_` prefix. Browser clients obtain short-lived tokens from Netlify functions (`apps/web/netlify/functions/`).

---

## "Never" Rules

1. Never run `npm install` inside an app or package directory — use `pnpm add` from the root.
2. Never hardcode a raw `z-index` number in CSS or Tailwind — use `apps/web/src/lib/zIndex.ts`.
3. Never modify audio DSP constants in `stream.service.ts` / `stream-audio-dsp.ts` without explicit instruction.
4. Never copy an `OffscreenCanvas` instead of transferring it via `transferControlToOffscreen()`.
5. Never re-instantiate `BroadcastBus` inside a React render cycle.
6. Never change the Electron OAuth redirect away from `http://localhost:3456`.
7. Never call the Apple Silicon ML-Sharp subprocess in a non-Modal path or expose secrets in `VITE_*` variables or committed `.env` files.
8. Never create barrel `index.ts` files in `packages/*`.
9. Never increase `@gaki/web` ESLint warnings past the `--max-warnings` ceiling.

---

## Common Mistakes

- **Importing `@/...` inside `packages/*`**: `@/` resolves to `apps/web/src/`. Always import from `@gaki/core/*` or relative paths inside packages.
- **Adding `React.Context` for global state**: Global state belongs in Zustand stores (`src/stores/`). For high-frequency updates (pointer, audio ticks), use `store.subscribe()` instead of React re-renders.
- **Relying on hoisted dependencies**: Always declare imported packages in the importing workspace's own `package.json`.
- **Caching LiveKit handoff tokens client-side**: Tokens are short-lived and scoped per session; fetch fresh tokens from `api-handoff`.
- **Checking `.env` values**: Never print or commit real `.env` values; document required keys in `.env.example`.

---

## Current Production Priorities

1. **Seamless scene transitions** (`apps/web`, `packages/engine`) — Lift `BroadcastBus` above `CanvasView` so it survives scene switches.
2. **Cross-device handoff lifecycle** (`apps/web`, `apps/api-handoff`, `packages/handoff-sdk`) — Stabilize full start -> transfer -> resume.
3. **Desktop Electron build** (`apps/desktop`) — Verify auto-update and native window capture end-to-end.
4. **Mobile streaming client** (`apps/gaki-mobile`) — Verify go-live with camera + effects end-to-end.
5. **ML backend integration** (`apps/ml-backend`, `apps/web`) — Verify production Modal inference.
6. **Signaling server hardening** (`apps/api-signaling`) — Connection drop handling, room cleanup, health checks.
