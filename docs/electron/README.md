# Electron App

→ Back to [Index](../INDEX.md)

---

## Overview

The Electron layer wraps the React SPA in a native desktop window and adds capabilities impossible in a browser:

| Capability | How |
|---|---|
| **RTMP Streaming** | FFmpeg piped via `fluent-ffmpeg`, receiving WebM chunks from the renderer |
| **File Recording** | `fs.createWriteStream()` → WebM → FFmpeg converts to MP4 |
| **Desktop Capture** | `desktopCapturer` API for screen/window sources |
| **Persistent Storage** | `electron-store` (JSON on disk) |
| **Google OAuth** | Custom BrowserWindow flow (bypasses Firebase domain restrictions) |
| **CORS Proxy** | `node-fetch` from main process bypasses browser CORS |
| **Cloudflare Bypass** | Hidden BrowserWindow loads pages to extract JSON |

## Directory Structure

```
electron/
├── main.ts              — Main process entry point (704 lines)
├── preload.ts           — Context bridge API (58 lines)
├── rtmp-server.ts       — Alternative RTMP server module
├── generate-config.js   — Post-compile config generation
├── obs/                 — OBS integration
│   ├── compositor/      — Scene compositor logic
│   └── sources/         — Source type definitions
└── dist/                — Compiled JS output
```

## Lifecycle

```
app.whenReady()
    ├── createWindow()          — BrowserWindow (1280×720, maximized)
    ├── setupIpcHandlers()      — Register all IPC channels
    ├── startStreamingServer()  — Socket.IO server on port 3000
    └── setDisplayMediaRequestHandler() — Auto-select first screen source
```

## Sub-Documents

| Document | Covers |
|---|---|
| [Main Process](./main-process.md) | `main.ts` walkthrough, window management, lifecycle |
| [Preload Script](./preload.md) | `preload.ts` API surface exposed to renderer |
| [Streaming Pipeline](./streaming.md) | RTMP streaming via FFmpeg (IPC + Socket.IO) |
| [Recording Pipeline](./recording.md) | File-based recording with MP4 conversion |
| [Compositor](./compositor.md) | WebGL GPU compositor pipeline (OffscreenCanvas + Web Worker) |
| [OBS Compositor](./obs-compositor.md) | OBS/Streamlabs scene architecture translation rules |
| [Scene & Vault Importer](./scene-importer.md) | .overlay extraction and missing asset directory resolution |
| [Stinger Transition Engine](./stinger-engine.md) | Native .webm streaming utilizing local-asset:// over `TRANSITION_FRAG` WebGL masks |
| [Audio Mixer Engine](./audio-mixer.md) | Native Web Audio Context bridging for OBS-style monitoring and routing |

→ See [IPC Bridge](../architecture/ipc-bridge.md) for the complete IPC channel reference
