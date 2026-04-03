# Preload Script

→ Back to [Index](../INDEX.md) | [Electron](./README.md)

> Last Updated: 2026-04-03

---

→ Source: [preload.ts](file:///c:/Users/Dell/Desktop/caption-cam/electron/preload.ts) (73 lines)

## Purpose

The preload script runs in a **sandboxed context** between the main process and the renderer. It uses `contextBridge.exposeInMainWorld()` to expose a safe, typed API surface on `window.electron`.

## Security Model

```
Main Process (Node.js, full access)
    ↕ ipcMain / ipcRenderer (controlled channels)
Preload Script (limited Node.js access)
    ↕ contextBridge (object cloning, no prototype pollution)
Renderer Process (browser context, window.electron only)
```

- `contextIsolation: true` — Renderer cannot access Node.js APIs directly
- `nodeIntegration: true` — Preload can use Node.js APIs
- Only explicitly exposed methods are available to the renderer

## Exposed API

```typescript
window.electron = {
  isElectron: true,

  // UI Controls
  toggleFullscreen: () => void,
  restartServer: () => void,
  getAppVersion: () => Promise<string>,

  // Stream Controls
  stream: {
    getEncoders: () => Promise<EncoderInfo[]>,    // Probe HW encoders
    start: (config) => void,                       // Fire-and-forget (ipcRenderer.send)
    sendData: (chunk) => void,                     // Fire-and-forget (ipcRenderer.send)
    stop: (config) => void,                        // Fire-and-forget (ipcRenderer.send)
    onStatus: (callback) => void,                  // Event listener (ipcRenderer.on)
    onFfmpegReady: (callback) => void,             // Event listener (ipcRenderer.on)
    onHealth: (callback) => void,                  // Event listener (stream health metrics)
  },

  // Recorder Controls
  recorder: {
    start: () => Promise<{filePath}>,
    write: (chunk: ArrayBuffer) => Promise<void>,
    stop: (durationMs?) => Promise<{filePath}>,
  },

  // Persistent Storage
  storage: {
    get: (key) => Promise<any>,
    set: (key, value) => Promise<boolean>,
    delete: (key) => Promise<boolean>,
  },

  // Desktop Capturer
  getDesktopSources: (options) => Promise<DesktopSource[]>,

  // Auth
  auth: {
    start: (url) => Promise<string | null>,
    googleOAuth: (apiKey) => Promise<{idToken, accessToken} | null>,
  },

  // CORS Proxy
  proxy: {
    request: (url, options) => Promise<{ok, status, data}>,
  },

  // Kick Browser Fetcher
  kickFetch: (url) => Promise<{ok, data}>,

  // Scene Collection Import/Export
  import: {
    openSceneCollection: () => Promise<{ok, format, content, fileName}>,
    resolveAsset: (originalPath, assetType) => Promise<{ok, resolvedPath}>,
  },
  export: {
    saveSceneCollection: (json, defaultName?) => Promise<{ok, filePath}>,
  },
};
```

## Usage in Renderer

The renderer detects Electron at startup:
```typescript
// App.tsx
const checkElectron = navigator.userAgent.toLowerCase().includes('electron');
```

Then conditionally uses the Electron APIs:
```typescript
if (window.electron?.isElectron) {
  await window.electron.recorder.start();
} else {
  // Use browser MediaRecorder + Blob
}
```

### Communication Patterns

| Pattern | Methods | Use Case |
|---|---|---|
| **Fire-and-forget** (`send`) | `stream.start/stop/sendData`, `toggleFullscreen` | High-frequency events, no response needed |
| **Request-response** (`invoke`) | `recorder.*`, `storage.*`, `auth.*`, `proxy.*`, `import.*`, `export.*` | Operations that return data |
| **Event listener** (`on`) | `stream.onStatus`, `stream.onFfmpegReady`, `stream.onHealth` | Async notifications from main process |

## Related Docs

→ See [IPC Bridge](../architecture/ipc-bridge.md) for the complete channel reference
→ See [Electron–Webapp Bridge](../architecture/electron-webapp-bridge.md) for how the two runtimes connect
→ See [OBS Compositor](./obs-compositor.md) for the import/export scene collection system
