# Web Studio (`@gaki/web`)

## Purpose
Main React/Vite browser studio for GAKI: multi-layered canvas compositor, OBS scene collection importer, WebRTC/RTMP broadcast mixer, Omegle Mode, and cross-device handoff. Its `dist/` output is also embedded by `@gaki/desktop`.

## Commands
```bash
pnpm --filter @gaki/web dev
pnpm --filter @gaki/web type-check
pnpm --filter @gaki/web lint          # Enforces --max-warnings 649
pnpm --filter @gaki/web test          # Vitest (jsdom)
pnpm --filter @gaki/web build
```

## Boundaries
- Imports from `@gaki/core/*`, `@gaki/engine/*`, `@gaki/handoff-sdk`, `@gaki/ui/*` via declared `exports` maps.
- Edge proxies in `netlify/functions/` (`twitch-token.ts`, `deepgram-token.ts`, `kick-proxy.ts`, `youtube-live-proxy.ts`, `proxy.ts`).
- Global state lives in Zustand stores (`src/stores/`).
- **Adding a studio sidebar panel**: Create the panel component under `src/features/studio/ui/panels/` (reading from a Zustand store in `src/stores/`), and register it in `STUDIO_PANEL_SECTIONS` in `src/features/studio/ui/panels/panelRegistry.tsx`.

## Gotchas
- **Audio routing**: `stream.service.ts` routes mic sidetone to `monitorGain` (default 0) but never system audio (prevents loopback feedback).
- **Double canvas mirror**: Chromium Bug 754408 blocks `captureStream()` on `OffscreenCanvas`; `BroadcastBus` mirrors onto a hidden main-thread 1920x1080 canvas.
- **BroadcastBus lifecycle**: Currently tied to `CanvasView`, causing brief stream drops on scene switch.
- **Z-index tiers**: Some peer/mutually-exclusive layers intentionally share values in `src/lib/zIndex.ts` (`videoPip`/`draggableElement` = 100, HUD triggers = 2020, popovers = 2030, modals = 10000).
- **Secrets**: `TWITCH_CLIENT_SECRET`, `DEEPGRAM_API_KEY`, `GEMINI_API_KEY`, `KICK_CLIENT_SECRET` (if used), `ALLOWED_ORIGINS`, and `FIREBASE_WEB_API_KEY` are server-only in Netlify functions (`netlify/functions/`); never prefix secrets with `VITE_`. All functions enforce strict origin allowlists and per-IP rate limits (note: rate limiting is per-instance and best-effort; Firebase Auth verification in `deepgram-token.ts` and `gemini-proxy.ts` is the real protection).

## "Never" Rules
- Never hardcode raw `z-index` values outside `src/lib/zIndex.ts`.
- Never modify audio DSP constants in `src/features/stream/services/stream.service.ts` or `stream-audio-dsp.ts`.
- Never increase ESLint warnings above `--max-warnings 649`.
- Never create React Context for global state or duplicate utilities from `@gaki/core` / `@gaki/ui`.

## Common Mistakes
- Using `npm install` inside `apps/web` instead of `pnpm add` from root.
- Using React state instead of `store.subscribe()` for high-frequency pointer/audio ticks.
- Breaking Netlify proxy routes in `netlify.toml` (breaks Kick/YouTube/Twitch CORS in prod).
