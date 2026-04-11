# IPC Bridge — Electron ↔ Renderer Communication

→ Back to [Index](../INDEX.md) | [Architecture](./README.md)

---

## Overview

The Electron app uses **context isolation** with a **preload script** to expose a safe API surface from the main process (Node.js) to the renderer process (React). All communication flows through `ipcMain` / `ipcRenderer` channels.

```
┌─────────────────┐          ┌──────────────┐          ┌──────────────────┐
│  Renderer (React)│  ──────► │  preload.ts  │  ──────► │  main.ts (Node)  │
│  window.electron │  invoke  │  contextBridge│  ipc     │  ipcMain.handle  │
└─────────────────┘  ◄────── └──────────────┘  ◄────── └──────────────────┘
                      result                     result
```

→ Source: [preload.ts](file:///c:/Users/Dell/Desktop/caption-cam/electron/preload.ts)  
→ Source: [main.ts](file:///c:/Users/Dell/Desktop/caption-cam/electron/main.ts)

---

## API Surface (`window.electron`)

The preload script exposes the following API via `contextBridge.exposeInMainWorld('electron', {...})`:

### Detection

```typescript
window.electron.isElectron: boolean  // Always true in Electron
```

### UI Controls

```typescript
window.electron.toggleFullscreen(): void
window.electron.restartServer(): void
window.electron.getAppVersion(): Promise<string>
```

### Stream Controls

| Method | Channel | Direction | Purpose |
|---|---|---|---|
| `stream.start(config)` | `stream:start` | send | Start FFmpeg RTMP stream |
| `stream.sendData(chunk)` | `stream:data` | send | Send WebM data chunk |
| `stream.stop(config)` | `stream:stop` | send | Stop stream(s) |
| `stream.onStatus(cb)` | `stream:status` | listen | Receive status updates |
| `stream.onFfmpegReady(cb)` | `stream:ffmpeg-ready` | listen | FFmpeg process ready |

**Config shape:**
```typescript
{
  id: string;        // Unique stream destination ID
  rtmpUrl: string;   // e.g., "rtmp://a.rtmp.youtube.com/live2"
  key: string;       // Stream key
  mimeType?: string; // e.g., "video/webm;codecs=h264"
}
```

→ See [Streaming Pipeline](../electron/streaming.md)

### Recorder Controls

| Method | Channel | Direction | Purpose |
|---|---|---|---|
| `recorder.start()` | `recorder:start` | invoke | Create file write stream |
| `recorder.write(chunk)` | `recorder:write` | invoke | Write data to file |
| `recorder.stop(durationMs?)` | `recorder:stop` | invoke | Close stream, convert to MP4 |

**Returns:**
- `start()` → `{ filePath: string }` (path of new WebM file)
- `stop(durationMs)` → `{ filePath: string }` (path of final MP4 file)

→ See [Recording Pipeline](../electron/recording.md)

### Storage Controls

| Method | Channel | Direction | Purpose |
|---|---|---|---|
| `storage.get(key)` | `storage:get` | invoke | Read from electron-store |
| `storage.set(key, value)` | `storage:set` | invoke | Write to electron-store |
| `storage.delete(key)` | `storage:delete` | invoke | Delete from electron-store |

Backed by `electron-store` which persists JSON to the user's app data directory.

### Desktop Capturer

```typescript
window.electron.getDesktopSources(options): Promise<DesktopSource[]>
```

Returns array of:
```typescript
{
  id: string;
  name: string;
  thumbnail: string;  // data URL
  appIcon: string | null;  // data URL
}
```

### Auth Controls

| Method | Channel | Direction | Purpose |
|---|---|---|---|
| `auth.start(url)` | `auth:start` | invoke | Open auth window, return callback URL |
| `auth.googleOAuth(apiKey)` | `auth:google-oauth` | invoke | Full Google OAuth flow |

**Google OAuth flow:**
1. Fetches Google client ID from Firebase project config
2. Opens a modal BrowserWindow with Google's OAuth URL
3. Intercepts the redirect to `http://localhost#tokens`
4. Extracts `id_token` and `access_token` from URL fragment
5. Returns `{ idToken, accessToken }` or `null`

→ See [Auth](../webapp/features/auth.md)

### Proxy Controls

```typescript
window.electron.proxy.request(url, options): Promise<{ok, status, data}>
```

Bypasses CORS by making the HTTP request from the main process (Node.js).

### Kick Browser Fetcher

```typescript
window.electron.kickFetch(url): Promise<{ok, data}>
```

Opens a hidden BrowserWindow to load the URL (bypasses Cloudflare), extracts JSON from the page body. 15-second timeout.

---

## IPC Channel Reference

| Channel | Type | Handler Location | Purpose |
|---|---|---|---|
| `stream:start` | `on` (send) | `setupIpcHandlers()` | Start FFmpeg stream |
| `stream:data` | `on` (send) | `setupIpcHandlers()` | Pipe data to FFmpeg stdin |
| `stream:stop` | `on` (send) | `setupIpcHandlers()` | Kill FFmpeg |
| `stream:status` | `send` (→renderer) | FFmpeg callbacks | Stream status updates |
| `stream:ffmpeg-ready` | `send` (→renderer) | FFmpeg `onStart` | FFmpeg process started |
| `recorder:start` | `handle` (invoke) | `setupIpcHandlers()` | Create file stream |
| `recorder:write` | `handle` (invoke) | `setupIpcHandlers()` | Write to file |
| `recorder:stop` | `handle` (invoke) | `setupIpcHandlers()` | Close + convert to MP4 |
| `storage:get` | `handle` (invoke) | `setupIpcHandlers()` | Read electron-store |
| `storage:set` | `handle` (invoke) | `setupIpcHandlers()` | Write electron-store |
| `storage:delete` | `handle` (invoke) | `setupIpcHandlers()` | Delete from electron-store |
| `auth:start` | `handle` (invoke) | `setupIpcHandlers()` | Generic auth window |
| `auth:google-oauth` | `handle` (invoke) | `setupIpcHandlers()` | Google OAuth flow |
| `proxy:request` | `handle` (invoke) | `setupIpcHandlers()` | CORS-free HTTP request |
| `kick-fetch-url` | `handle` (invoke) | `setupIpcHandlers()` | Browser-based URL fetch |
| `toggle-fullscreen` | `on` (send) | `app.whenReady()` | Toggle window fullscreen |
| `get-desktop-sources` | `handle` (invoke) | top-level | Desktop capturer sources |
