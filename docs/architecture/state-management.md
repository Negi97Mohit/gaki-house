# State Management

→ Back to [Index](../INDEX.md) | [Architecture](./README.md)

> Last Updated: 2026-04-03

---

The application uses a **hybrid state management** approach:

| Layer | Technology | Purpose |
|---|---|---|
| Global stores | **Zustand** | Shared state across components (reactive, performant) |
| Cross-cutting | **React Context** | Debug info, logging, auth, theme initialization |
| Persistent | **localStorage** / **electron-store** | Sessions, stream destinations, theme prefs |
| Component-local | **useState / useRef** | UI-specific ephemeral state |

---

## Zustand Stores

All stores live in `src/stores/` and are created with `create<T>()`.

### `useSceneStore` (`scene.store.ts`)
**The most critical store.** Holds all scene-level state for the active scene.

| State Field | Type | Purpose |
|---|---|---|
| `activeOverlays` | `GeneratedOverlay[]` | AI-generated HTML overlays |
| `textOverlays` | `TextOverlayState[]` | Rich text elements |
| `fileOverlays` | `FileOverlayState[]` | Image/video/PDF elements |
| `browserOverlays` | `any[]` | Embedded browser iframes |
| `captionStyle` | `CaptionStyle` | Current caption styling |
| `dynamicStyle` | `any` | Active caption animation style |
| `videoFilter` | `string \| undefined` | Active CSS/WebGL filter |
| `backgroundEffect` | `'none' \| 'blur' \| 'image'` | Background mode |
| `isAiModeEnabled` | `boolean` | Whether AI processes voice commands |
| `captionsEnabled` | `boolean` | Whether captions display |
| `selectedBrowserId/FileId/TextId/GeneratedId` | `string \| null` | Currently selected element |
| `pipRotation/Border/Shadow` | various | PiP camera decorations |
| `isAutoFramingEnabled` | `boolean` | MediaPipe face tracking |
| `isNeonEdgeEnabled` | `boolean` | WebGL neon edge effect |
| `activeCinematicEffect` | `CinematicEffect` | Active cinematic camera effect |
| `canUndo / canRedo` | `boolean` | Undo/redo availability |

### `useStreamStore` (`stream.store.ts`)
Manages broadcast and recording state. **Persisted** via `zustand/middleware/persist`.

| State Field | Type | Purpose |
|---|---|---|
| `isBroadcasting` | `boolean` | Whether actively streaming |
| `isConnecting` | `boolean` | Connection in progress |
| `streamStatus` | `string` | User-facing status text |
| `countdown` | `number \| null` | Pre-stream countdown |
| `destinations` | `StreamDestination[]` | RTMP endpoints (persisted) |
| `fatalError` | `string \| null` | Fatal stream error |
| `isRecording` | `boolean` | Whether recording |
| `recordingStatus` | `RecordingStatus` | idle/recording/stopping/saved/error |
| `recordingDuration` | `number` | Current recording duration |

**Persistence:** Only `destinations` are persisted (with status reset to `idle` on reload).

### `useMediaStore` (`media.store.ts`)
Manages audio/video device state.

| State Field | Type | Purpose |
|---|---|---|
| `isAudioOn` | `boolean` | Microphone enabled (default: false) |
| `isVideoOn` | `boolean` | Camera enabled (default: false) |
| `audioDevices` | `MediaDeviceInfo[]` | Available microphones |
| `videoDevices` | `MediaDeviceInfo[]` | Available cameras |
| `selectedAudioDevice` | `string \| undefined` | Chosen mic device ID |
| `selectedVideoDevice` | `string \| undefined` | Chosen camera device ID |
| `screenShareMode` | `'off' \| 'screen' \| 'canvas'` | Screen share state |

### `useCanvasStore` (`canvas.store.ts`)
Manages canvas viewport state.

| State Field | Type | Purpose |
|---|---|---|
| `zoom` | `number` | Current zoom level |
| `panX / panY` | `number` | Canvas pan offsets |
| `viewportWidth / Height` | `number` | Canvas container dimensions |

### `useUiStore` (`ui.store.ts`)
Manages UI panel visibility.

| State Field | Type | Purpose |
|---|---|---|
| `isMouseActive` | `boolean` | Mouse activity (auto-hide controls) |
| `isFullscreen` | `boolean` | Fullscreen mode |
| `isFsSidebarOpen` | `boolean` | Fullscreen sidebar |
| `showSettings` | `boolean` | Settings panel open |
| `showSessionsPanel` | `boolean` | Sessions panel open |
| `showAnimationLibrary` | `boolean` | Animation library open |
| `isChatbotOpen` | `boolean` | AI chatbot panel open |

### `useOmegleStore` (`omegle.store.ts`)
Manages the random chat matching state.

### `useSceneAudioStore` (`sceneAudio.store.ts`)
Manages per-scene audio settings (volume, mute, etc.).

### `useGoLiveStore` (`goLive.store.ts`)
Manages the go-live modal state.

### `useStreamManagerStore` (`stream-manager.store.ts`)
Manages the overall stream manager state.

---

## React Context

### `LogContext` (`context/LogContext.tsx`)
Provides `useLog()` hook for application-wide structured logging.

```typescript
const { log, logEntries } = useLog();
log('info', 'Stream started', { destination: 'youtube' });
```

### `DebugContext` (`context/DebugContext.tsx`)
Provides `useDebug()` hook for AI debugging information.

```typescript
const { debugInfo, setDebugInfo } = useDebug();
// debugInfo = { transcript, aiResponse, error }
```

### `AuthContext` (`pages/platform/context/AuthContext.tsx`)
Provides authentication state and methods for the streaming platform.

---

## Persistent Storage

### Web: `localStorage`
| Key | Contents | Used By |
|---|---|---|
| `stream-destinations-storage` | `StreamDestination[]` | `useStreamStore` (via zustand persist) |
| Theme preferences | Theme, mode, font | `useThemeStore` |

### Electron: `electron-store`
Accessed via IPC bridge:
```typescript
window.electron.storage.get(key)
window.electron.storage.set(key, value)
window.electron.storage.delete(key)
```

Used for persisting scene collections, settings, and vault data.

→ See [IPC Bridge](./ipc-bridge.md) for the full storage API
