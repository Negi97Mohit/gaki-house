# Electron ↔ Web App Bridge

→ Back to [Index](../INDEX.md) | [Architecture](./README.md)

> Last Updated: 2026-04-03

---

## Overview

GAKI Studio is a **single codebase** that ships two products: a browser-based **web app** and an **Electron desktop app**. This document explains exactly how these two runtime modes share code, how they communicate, and where their behaviors diverge.

---

## Shared Codebase Model

```
caption-cam/
├── src/                    ← Shared React SPA (runs in BOTH runtimes)
│   ├── App.tsx             ← Root: detects runtime, selects router
│   ├── features/           ← All feature modules (shared)
│   ├── stores/             ← All Zustand stores (shared)
│   ├── hooks/              ← All hooks (shared, with runtime branches)
│   ├── kernel/             ← WebGL engine (shared)
│   └── types/              ← All types (shared)
│
├── electron/               ← Electron-ONLY code (main process + preload)
│   ├── main.ts             ← Node.js main process (844 lines)
│   ├── preload.ts          ← Context bridge API (73 lines)
│   └── obs/                ← OBS integration modules
│
├── vite.config.ts          ← Builds the shared SPA
└── package.json            ← Contains both web and electron scripts
```

The React SPA in `src/` is **identical** in both runtimes. There is no separate "web" vs "desktop" source tree. Instead, the app detects its runtime environment and conditionally enables capabilities.

---

## Runtime Detection

The app determines which environment it is running in at startup:

```typescript
// App.tsx — Router selection
const isElectron = navigator.userAgent.toLowerCase().includes('electron');
const Router = isElectron ? HashRouter : BrowserRouter;
```

```typescript
// Feature code — Capability gating
if (window.electron?.isElectron) {
  // Electron-only path: use IPC bridge
  await window.electron.recorder.start();
} else {
  // Web-only path: use browser APIs
  const mediaRecorder = new MediaRecorder(canvasStream);
}
```

The `window.electron` object only exists when running inside Electron (injected by `preload.ts` via `contextBridge.exposeInMainWorld`).

---

## The IPC Bridge — Connection Layer

The IPC bridge is the **single point of communication** between the Electron shell and the React SPA:

```
┌─────────────────────────────────────────────────────────────┐
│                     Electron Main Process                     │
│  ┌─────────────┐  ┌──────────┐  ┌───────────────────────┐  │
│  │  FFmpeg      │  │ electron │  │  File System           │  │
│  │  Streaming   │  │  -store  │  │  (recordings, assets)  │  │
│  └──────┬──────┘  └────┬─────┘  └──────────┬────────────┘  │
│         │              │                     │               │
│  ┌──────┴──────────────┴─────────────────────┴────────────┐ │
│  │              ipcMain.handle / ipcMain.on                │ │
│  └────────────────────────┬────────────────────────────────┘ │
├────────────────────────────┼────────────────────────────────-─┤
│                            │                                  │
│  ┌─────────────────────────┴────────────────────────────────┐│
│  │                   preload.ts                              ││
│  │          contextBridge.exposeInMainWorld('electron', {     ││
│  │            stream: { start, sendData, stop, ... },        ││
│  │            recorder: { start, write, stop },              ││
│  │            storage: { get, set, delete },                 ││
│  │            import: { openSceneCollection, resolveAsset }, ││
│  │            export: { saveSceneCollection },               ││
│  │            auth: { start, googleOAuth },                  ││
│  │            ...                                            ││
│  │          })                                               ││
│  └─────────────────────────┬────────────────────────────────┘│
├────────────────────────────┼─────────────────────────────────┤
│                            ▼                                  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              React SPA (Renderer Process)               │  │
│  │                                                         │  │
│  │   window.electron.stream.start(config)                  │  │
│  │   window.electron.storage.get('scenes')                 │  │
│  │   window.electron.import.openSceneCollection()          │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Communication Patterns

| Pattern | Direction | Use Case | Example |
|---|---|---|---|
| **Fire-and-forget** (`send`) | Renderer → Main | High-frequency, no response | `stream.sendData(chunk)` |
| **Request-response** (`invoke`) | Renderer → Main → Renderer | Operations returning data | `recorder.start()` → `{ filePath }` |
| **Event listener** (`on`) | Main → Renderer | Async push notifications | `stream.onStatus(callback)` |

→ See [IPC Bridge](./ipc-bridge.md) for the complete channel reference
→ See [Preload Script](../electron/preload.md) for the full API surface

---

## Feature Availability Matrix

| Feature | Web App | Electron App | Difference |
|---|---|---|---|
| **Canvas / Scene Editing** | ✅ | ✅ | Identical |
| **AI Overlay Generation** | ✅ | ✅ | Identical (Gemini API) |
| **Live Captions** | ✅ | ✅ | Identical (Deepgram) |
| **WebGL Effects** | ✅ | ✅ | Identical |
| **Drag & Drop Overlays** | ✅ | ✅ | Identical |
| **RTMP Streaming** | ❌ | ✅ | Electron uses FFmpeg via IPC |
| **File Recording** | Blob (in-memory) | File system (WebM → MP4) | Different pipeline |
| **Desktop Capture** | `getDisplayMedia()` | `desktopCapturer` API | Different API |
| **Persistent Storage** | `localStorage` | `electron-store` (JSON) | Different backend |
| **Authentication** | Firebase popup | Custom OAuth BrowserWindow | Different flow |
| **CORS Proxy** | Netlify/Vite proxy | `ipcMain.handle('proxy:request')` | Different proxy |
| **Scene Import/Export** | ❌ | ✅ | Requires file dialog |
| **Hardware Encoding** | ❌ | ✅ | Requires FFmpeg probing |
| **Stream Health Metrics** | ❌ | ✅ | Requires FFmpeg progress |
| **Stinger Transitions** | ❌ | ✅ | Requires `local-asset://` protocol |
| **Platform Pages** | ✅ | ✅ | Identical |
| **Mobile Pages** | ✅ | ✅ | Identical |

---

## Data Flow Comparison

### Streaming

**Web App**: No RTMP streaming capability. Canvas compositing for preview only.

**Electron App**:
```
Canvas (Renderer)
  → captureStream(30fps)
  → MediaRecorder (WebM chunks)
  → window.electron.stream.sendData(chunk)     ← IPC bridge
  → ipcMain: ffmpegCommand.stdin.write(chunk)
  → FFmpeg: libx264/copy → flv
  → RTMP server (YouTube/Twitch/Kick)
```

### Recording

**Web App**:
```
Canvas → MediaRecorder → Blob → localStorage (session recording)
```

**Electron App**:
```
Canvas → MediaRecorder → window.electron.recorder.write(chunk) ← IPC
  → main process: fs.createWriteStream → .webm file
  → on stop: FFmpeg converts → .mp4
```

### Storage

**Web App**:
```
Zustand store → zustand/persist middleware → localStorage
```

**Electron App**:
```
Zustand store → window.electron.storage.set(key, value) ← IPC
  → main process: electron-store (JSON file on disk)
```

### Authentication

**Web App**:
```
Firebase Auth → signInWithPopup(googleProvider) → token
```

**Electron App**:
```
window.electron.auth.googleOAuth(apiKey) ← IPC
  → main process: fetch Google client ID from Firebase config
  → open modal BrowserWindow → Google OAuth page
  → intercept redirect → extract id_token + access_token
  → return to renderer → create Firebase credential
```

---

## Build Pipeline

Both apps are built from the same source but with different pipelines:

### Web App
```bash
npm run dev          # Vite dev server on :5173
npm run build        # Vite production build → dist/
```
Deployed to Netlify with serverless functions for API proxying.

### Electron App
```bash
npm run electron:dev     # Vite + Electron concurrently
npm run electron:build   # Vite build → tsc (electron/) → electron-builder
```

The Electron app loads the same `dist/index.html` as the web app, either from the Vite dev server (development) or from the packaged `dist/` folder (production).

```typescript
// electron/main.ts — URL loading priority
if (process.env.VITE_DEV_SERVER_URL) {
  mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);     // Dev
} else if (!app.isPackaged) {
  mainWindow.loadURL('http://localhost:5173');                // Fallback dev
} else {
  mainWindow.loadFile(path.join(__dirname, '../dist/index.html')); // Production
}
```

---

## Key Integration Points

### Stores That Branch on Runtime

| Store / Hook | Web Behavior | Electron Behavior |
|---|---|---|
| `useStreamStore` | Destinations persisted to localStorage | Same (Zustand persist) |
| `useBroadcast` | No-op (streaming not available) | Calls `window.electron.stream.*` |
| `useNativeRecorder` | Falls back to Blob recording | Calls `window.electron.recorder.*` |
| `useAuth` | Firebase popup | `window.electron.auth.googleOAuth()` |
| `useImportSceneCollection` | File input fallback | `window.electron.import.*` |

### Shared Infrastructure (No Runtime Branching)

| Module | Notes |
|---|---|
| `useSceneStore` | All scene state (overlays, filters, captions) |
| `useSceneCollectionStore` | Compositor scenes and sources |
| `useCanvasStore` | Canvas zoom/pan viewport |
| `useMediaStore` | Device enumeration (browser API in both) |
| `kernel/compositor/` | WebGL pipeline (OffscreenCanvas in both) |
| `kernel/engine/` | WebGL shader engine |
| All `features/` modules | UI components render identically |

---

## Related Docs

→ See [Architecture](./README.md) for the high-level system overview
→ See [IPC Bridge](./ipc-bridge.md) for the complete IPC channel reference
→ See [Preload Script](../electron/preload.md) for the full `window.electron` API
→ See [Streaming Pipeline](../electron/streaming.md) for FFmpeg details
→ See [Recording Pipeline](../electron/recording.md) for native recording
→ See [Dev Guide](../overview/dev-guide.md) for build and run instructions
→ Source: [App.tsx](file:///c:/Users/Dell/Desktop/caption-cam/src/App.tsx) — runtime detection and router selection
→ Source: [preload.ts](file:///c:/Users/Dell/Desktop/caption-cam/electron/preload.ts) — bridge API definition
→ Source: [main.ts](file:///c:/Users/Dell/Desktop/caption-cam/electron/main.ts) — IPC handler implementations
