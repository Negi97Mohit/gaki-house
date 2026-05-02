# Electron Main Process

→ Back to [Index](../INDEX.md) | [Electron](./README.md)

---

→ Source: [main.ts](file:///c:/Users/Dell/Desktop/gaki/electron/main.ts) (704 lines)

## Initialization Sequence

```
1. fixPath()                    — Fix PATH for macOS/Linux
2. new Store()                  — Initialize electron-store
3. ffmpeg.setFfmpegPath(...)    — Configure FFmpeg binary path
4. app.whenReady() →
   ├── createWindow()           — Create BrowserWindow
   ├── setupIpcHandlers()       — Register all IPC handlers
   ├── startStreamingServer()   — Socket.IO on port 3000
   └── setDisplayMediaRequestHandler()
```

## Window Management

### `createWindow()`
Creates the main `BrowserWindow` with these settings:

| Setting | Value | Rationale |
|---|---|---|
| Width/Height | 1280×720 (min 800×600) | Standard HD, maximized on startup |
| `backgroundColor` | `#000000` | Prevents white flash on load |
| `nodeIntegration` | `true` | Required for some modules |
| `contextIsolation` | `true` | Security: preload bridge only |
| `backgroundThrottling` | `false` | Keeps rendering at full speed when backgrounded |
| `preload` | `preload.js` | Context bridge script |

### URL Loading Priority
1. `process.env.VITE_DEV_SERVER_URL` → dev server (set by `electron:dev`)
2. `http://localhost:5173` → fallback dev URL
3. `dist/index.html` → production build (`app.isPackaged`)

### Window Open Handler
- **Auth URLs** (Google, Firebase): Open in modal child window
- **Other HTTP(S) URLs**: Open in system default browser
- **Everything else**: Denied

## IPC Handler Groups

The `setupIpcHandlers()` function registers handlers in these categories:

### 1. Streaming Handlers
→ See [Streaming Pipeline](./streaming.md)

### 2. Recorder Handlers
→ See [Recording Pipeline](./recording.md)

### 3. Storage Handlers
Simple get/set/delete against `electron-store`:
```typescript
ipcMain.handle('storage:get', (_, key) => store.get(key));
ipcMain.handle('storage:set', (_, key, value) => { store.set(key, value); return true; });
ipcMain.handle('storage:delete', (_, key) => { store.delete(key); return true; });
```

### 4. Auth Handlers

**Generic Auth (`auth:start`):**
Opens a BrowserWindow to `authUrl`, watches for `access_token` or `code` in navigation URLs.

**Google OAuth (`auth:google-oauth`):**
1. Fetches Google client ID from Firebase project config via `node-fetch`
2. Constructs Google OAuth URL with `response_type=token id_token`
3. Opens modal BrowserWindow
4. On redirect to `http://localhost`, reads `window.location.href` via `executeJavaScript`
5. Extracts `id_token` and `access_token` from URL fragment
6. Returns `{ idToken, accessToken }` to renderer

**Why this exists:** Electron apps can't use Firebase popup auth because `file://` origins are unauthorized. This flow uses a real HTTP redirect URI and extracts tokens before the page loads.

### 5. Proxy Handler
```typescript
ipcMain.handle('proxy:request', async (_, url, options) => {
  const response = await fetch(url, options);
  return { ok: response.ok, status: response.status, data: await response.json() };
});
```
Bypasses CORS by making requests from the main process.

### 6. Browser Fetch Handler (`kick-fetch-url`)
Creates a **hidden BrowserWindow** that loads a URL, waits for page load, then extracts `document.body.innerText` as JSON. This bypasses Cloudflare anti-bot protection that blocks `fetch()`. Has a 15-second timeout.

## Desktop Capturer
```typescript
ipcMain.handle('get-desktop-sources', async (_, options) => {
  const sources = await desktopCapturer.getSources(options);
  return sources.map(s => ({
    id: s.id, name: s.name,
    thumbnail: s.thumbnail.toDataURL(),
    appIcon: s.appIcon?.toDataURL() ?? null,
  }));
});
```

Also sets up auto-selection for `getDisplayMedia`:
```typescript
session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
  desktopCapturer.getSources({ types: ['screen'] }).then(sources => {
    callback({ video: sources[0], audio: 'loopback' });
  });
});
```

## App Lifecycle

| Event | Handler |
|---|---|
| `window-all-closed` | Quit on non-macOS |
| `activate` | Recreate window if none exist (macOS) |
| `before-quit` | Close Socket.IO server and HTTP server |
| `toggle-fullscreen` | Toggle main window fullscreen |
