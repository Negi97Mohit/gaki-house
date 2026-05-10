# GAKI Desktop App (`@gaki/desktop`)

## 🗺️ What This Is
The Electron wrapper that powers the desktop version of GAKI Studio. It embeds the React frontend (`apps/web/dist`) and provides native system capabilities like window capture, local file system access, and native FFmpeg broadcasting.

## 🔌 How It Connects to the Monorepo
- **Consumes:** `@gaki/web` (The compiled `dist/` is bundled into the Electron app during the build process).
- **Exposes:** Native IPC endpoints (`window.electron`) for the web studio to trigger streams, recordings, and authentication.
- **External Dependencies:** `node-media-server` (for local RTMP), `ffmpeg-static` (bundled encoder), `electron-store` (persistent device configuration).

## 📁 Directory Map
- `electron/main.ts` — The main Electron process and IPC handler registry.
- `electron/preload.ts` — Secure context bridge exposing `window.electron` APIs.
- `electron/rtmp-server.ts` — A local `node-media-server` instance.
- `build/` — Assets for packaging (icons, macOS entitlements).

## ⚡ Key Business Logic
- **FFmpeg Stream Pipe:** Instead of WebRTC, the desktop app receives raw video chunks from the web renderer and pipes them directly into a spawned FFmpeg process for high-quality RTMP broadcasting.
- **Local Loopback Auth:** Captures Google OAuth redirects via a local HTTP server on port 3456, bypassing restrictive Electron protocol limitations.
- **Persistent Device ID:** Uses `electron-store` to generate and persist a unique device ID for LiveKit handoff coordination, strictly isolated from the web browser's `localStorage`.
