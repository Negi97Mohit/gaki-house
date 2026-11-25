# GAKI Desktop (`@gaki/desktop`)

## Purpose
Electron wrapper around `apps/web/dist` providing native window capture, local RTMP server (`node-media-server`), bundled FFmpeg broadcasting (`ffmpeg-static`), and persistent device IDs (`electron-store`).

## Commands
```bash
pnpm --filter @gaki/desktop type-check
pnpm --filter @gaki/desktop build       # Depends on @gaki/web#build
```

## Boundaries
- Consumes built `apps/web/dist`.
- Exposes `window.electron` IPC bridge via `electron/preload.ts` from `electron/main.ts`.
- Local RTMP server lives in `electron/rtmp-server.ts`.

## Gotchas
- **Electron OAuth**: Google OAuth uses a local loopback server on `http://localhost:3456`; custom domains fail silently inside Electron wrappers.
- **FFmpeg pipe**: Desktop receives raw video chunks from the web renderer over IPC and pipes them into a spawned FFmpeg process.
- **Device ID isolation**: Uses `electron-store` instead of browser `localStorage` for LiveKit handoff device IDs.

## "Never" Rules
- Never change the Electron OAuth redirect away from `http://localhost:3456`.
- Never upgrade `node-media-server` or Electron major versions without testing native packaging and IPC.

## Common Mistakes
- Building `@gaki/desktop` without `@gaki/web` built first (Turborepo handles this via `dependsOn: ["@gaki/web#build"]`).
- Exposing Node primitives directly to the renderer instead of going through `electron/preload.ts`.
