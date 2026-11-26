# GAKI Monorepo — Agent Instructions

Single source of truth for AI agents. Before modifying a workspace, also read that workspace's `AGENTS.md` (if present). See [docs/roadmap.md](docs/roadmap.md) for current priorities.

## Purpose & Repo Map
A **pnpm** + **Turborepo** monorepo for the GAKI live-streaming platform:
- `apps/web` — Main browser studio (React/Vite mixer, canvas compositor, multistream)
- `apps/gaki-mobile` — Mobile PWA (remote stream deck + camera source)
- `apps/desktop` — Electron wrapper around `apps/web` + native FFmpeg pipe
- `apps/api-handoff` — Express server vending LiveKit tokens for handoff sessions
- `apps/api-signaling` — Socket.io WebRTC broker for Omegle Mode
- `apps/ml-backend` — Modal FastAPI service for T4 GPU inference + ML-Sharp bridge
- `packages/core` — Shared types, constants, utility hooks (leaf package)
- `packages/engine` — WebGL/Canvas/Audio kernel pipeline (`BroadcastBus`, OBS parser)
- `packages/handoff-sdk` — Cross-device streaming coordination SDK
- `packages/ui` — Radix UI component library
- `packages/config-typescript`, `packages/config-eslint` — Shared TS/ESLint configs

## Commands
Run from monorepo root:
```bash
pnpm install              # Install all workspace dependencies
pnpm check                # Run type-check, lint, and test across all workspaces
pnpm boundary-check       # Verify package boundaries & zero cycles (dependency-cruiser)
pnpm env-check            # Verify .env.example parity and no VITE_* secrets
pnpm dead-code            # Run knip dead-code check
pnpm build                # Build all workspaces via Turborepo
pnpm --filter @gaki/web dev
pnpm --filter @gaki/mobile dev
```
Worktrees: override ports to run two checkouts side by side:
`VITE_WEB_PORT` (default `5173`), `VITE_MOBILE_PORT` (default `8080`), `SIGNALING_PORT` (default `3001`), `HANDOFF_PORT` (default `3001`), `NETLIFY_DEV_PORT` (default `8888`, pass `--port`/`--target-port` to `netlify dev`), plus `ALLOWED_ORIGINS` if using custom origins.

## Boundaries & Conventions
Enforced by `.dependency-cruiser.cjs` (`pnpm boundary-check`):
1. **No circular package dependencies** (`@gaki/core` <-> `@gaki/ui` or any cycle is forbidden).
2. **Packages never import from apps** (`packages/*` -> `apps/*` or `@/...` is forbidden).
3. **Explicit `exports` maps**: Import package subpaths declared in `package.json` `exports` (e.g. `@gaki/core/lib/utils`, `@gaki/ui/button`). Never create barrel `index.ts` files (`docs/decisions/no-barrel-exports.md`).
4. **Shared dependencies**: Declare shared versions in `pnpm-workspace.yaml` `catalog:` and reference `"catalog:"` in each importing package's `package.json`.

## Gotchas
- **Audio DSP**: Gate thresholds, attack/release times, and `-48/-40 dBFS` rules in `apps/web/src/features/stream/services/stream-audio-dsp.ts` and `stream.service.ts` are production-tuned (`docs/decisions/audio-dsp-no-touch.md`).
- **Audio feedback**: `stream.service.ts` routes mic sidetone to `monitorGain` (default 0), never system audio.
- **OffscreenCanvas**: Must be transferred via `transferControlToOffscreen()`, never copied.
- **BroadcastBus**: Re-instantiates on scene switches while mounted in `CanvasView`; never instantiate inside React render cycles.
- **Electron OAuth**: Google OAuth redirect in `apps/desktop` must stay `http://localhost:3456`.
- **Modal cold starts**: `apps/ml-backend` T4 containers take 10–30s to cold-start; handle client timeouts explicitly.
- **Secrets**: `TWITCH_CLIENT_SECRET`, `KICK_CLIENT_SECRET`, `DEEPGRAM_API_KEY`, `GEMINI_API_KEY`, `FIREBASE_WEB_API_KEY` must never use `VITE_`. Clients call hardened Netlify functions (`apps/web/netlify/functions/`).

## "Never" Rules
1. Never run `npm install` inside an app or package directory — use `pnpm add` from root.
2. Never hardcode a raw `z-index` number in CSS/Tailwind — use `apps/web/src/lib/zIndex.ts`.
3. Never modify audio DSP constants in `stream.service.ts` / `stream-audio-dsp.ts` without explicit instruction.
4. Never copy an `OffscreenCanvas` instead of `transferControlToOffscreen()`.
5. Never re-instantiate `BroadcastBus` inside a React render cycle.
6. Never change the Electron OAuth redirect away from `http://localhost:3456`.
7. Never call the Apple Silicon ML-Sharp subprocess in a non-Modal path or expose secrets in `VITE_*` or committed `.env` files.
8. Never create barrel `index.ts` files in `packages/*`.
9. Never exceed a workspace's ESLint `--max-warnings` ceiling.

## Common Mistakes
- **Importing `@/...` inside `packages/*`**: `@/` resolves to `apps/web/src/`. Use `@gaki/core/*` or relative paths.
- **Adding `React.Context` for global state**: Use Zustand stores (`src/stores/`) and `store.subscribe()` for high-frequency ticks.
- **Relying on hoisted dependencies**: Declare every imported package in the importing workspace's `package.json`.
- **Caching LiveKit handoff tokens client-side**: Fetch fresh scoped tokens from `api-handoff`.
- **Inspecting `.env` values**: Never print or commit real `.env` values; keep `.env.example` in sync (`pnpm env-check`).
