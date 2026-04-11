# Stores Reference

→ Back to [Index](../../INDEX.md) | [Stores](./README.md)

---

Complete API reference for all Zustand stores.

---

## `useSceneStore` — Active Scene State

→ Source: [scene.store.ts](file:///c:/Users/Dell/Desktop/caption-cam/src/stores/scene.store.ts)

### State

| Field | Type | Default | Description |
|---|---|---|---|
| `activeOverlays` | `GeneratedOverlay[]` | `[]` | AI-generated HTML overlays |
| `textOverlays` | `TextOverlayState[]` | `[]` | Rich text elements |
| `fileOverlays` | `FileOverlayState[]` | `[]` | Image/video/PDF elements |
| `browserOverlays` | `any[]` | `[]` | Embedded browser iframes |
| `canvasLayout` | `any` | `null` | Canvas layout configuration |
| `backgroundEffect` | `'none'\|'blur'\|'image'` | `'none'` | Background mode |
| `backgroundImageUrl` | `string\|undefined` | `undefined` | Custom background URL |
| `blankCanvasColor` | `string` | `'#000000'` | Canvas background color |
| `videoFilter` | `string\|undefined` | `undefined` | Active CSS filter |
| `captionStyle` | `CaptionStyle` | `{}` | Caption styling |
| `dynamicStyle` | `any` | `{}` | Caption animation style |
| `isAiModeEnabled` | `boolean` | `false` | AI processes voice commands |
| `captionsEnabled` | `boolean` | `true` | Caption display toggle |
| `previousScene` | `SceneState\|null` | `null` | For transitions |
| `selectedBrowserId` | `string\|null` | `null` | Selected browser element |
| `selectedFileId` | `string\|null` | `null` | Selected file element |
| `selectedTextId` | `string\|null` | `null` | Selected text element |
| `selectedGeneratedId` | `string\|null` | `null` | Selected AI overlay |
| `pipRotation` | `number` | `0` | PiP camera rotation |
| `pipBorder` | `{color, width}` | `{#FFF, 0}` | PiP border style |
| `pipShadow` | `{blur, color}` | `{0, rgba(0,0,0,0.5)}` | PiP shadow |
| `cameraAspectRatio` | `string` | `'16:9'` | Camera aspect ratio |
| `activeInteractiveFilter` | `string` | `'none'` | Interactive filter |
| `filterIntensity` | `number` | `0.5` | Filter strength |
| `filterTarget` | `'both'\|'background'\|'person'` | `'both'` | Filter scope |
| `isAutoFramingEnabled` | `boolean` | `false` | Face tracking |
| `isNeonEdgeEnabled` | `boolean` | `false` | Neon edge effect |
| `neonIntensity` | `number` | `50` | Neon strength |
| `neonColor` | `string` | `'#00FFFF'` | Neon color |
| `cameraBackground` | `'none'\|'blur'\|'image'` | `'none'` | Camera background mode |
| `activeCinematicEffect` | `CinematicEffect` | `'none'` | Cinematic camera effect |
| `manualZoom` | `number` | `1.0` | Manual zoom level |
| `canUndo` / `canRedo` | `boolean` | `false` | Undo/redo availability |

### Actions
All state fields have corresponding `set*` actions plus:
- `deselectAll()` — Clear all element selections
- `triggerUndo()` / `triggerRedo()` / `triggerReset()` — History operations

---

## `useStreamStore` — Broadcast & Recording

→ Source: [stream.store.ts](file:///c:/Users/Dell/Desktop/caption-cam/src/stores/stream.store.ts)

**Persisted** via `zustand/middleware/persist` (destinations only).

### State

| Field | Type | Default | Description |
|---|---|---|---|
| `isBroadcasting` | `boolean` | `false` | Active stream |
| `isConnecting` | `boolean` | `false` | Connection in progress |
| `streamStatus` | `string` | `'idle'` | Status text |
| `countdown` | `number\|null` | `null` | Pre-stream countdown |
| `destinations` | `StreamDestination[]` | `[]` | RTMP endpoints |
| `fatalError` | `string\|null` | `null` | Fatal error message |
| `isRecording` | `boolean` | `false` | Recording active |
| `recordingStatus` | `RecordingStatus` | `'idle'` | Recording state |
| `recordingDuration` | `number` | `0` | Duration in ms |

### `StreamDestination` Shape
```typescript
{ id, platform, url, key, enabled, status, error? }
```

### Actions
- `setBroadcasting/setConnecting/setStreamStatus/setCountdown/setFatalError`
- `setRecording/setRecordingStatus/setRecordingDuration`
- `addDestination(dest)` / `removeDestination(id)` / `updateDestination(id, updates)`
- `setDestinationStatus(id, status, error?)`

---

## `useMediaStore` — Device Management

→ Source: [media.store.ts](file:///c:/Users/Dell/Desktop/caption-cam/src/stores/media.store.ts)

### State

| Field | Type | Default | Description |
|---|---|---|---|
| `isAudioOn` | `boolean` | `false` | Microphone enabled |
| `isVideoOn` | `boolean` | `false` | Camera enabled |
| `audioDevices` | `MediaDeviceInfo[]` | `[]` | Available mics |
| `videoDevices` | `MediaDeviceInfo[]` | `[]` | Available cameras |
| `selectedAudioDevice` | `string\|undefined` | `undefined` | Chosen mic |
| `selectedVideoDevice` | `string\|undefined` | `undefined` | Chosen camera |
| `selectedScreenSourceId` | `string\|undefined` | `undefined` | Screen source |
| `screenShareMode` | `'off'\|'screen'\|'canvas'` | `'off'` | Screen share mode |

---

## `useCanvasStore` — Viewport

→ Source: [canvas.store.ts](file:///c:/Users/Dell/Desktop/caption-cam/src/stores/canvas.store.ts)

Manages canvas zoom, pan, and viewport dimensions.

---

## `useUiStore` — UI Panels

→ Source: [ui.store.ts](file:///c:/Users/Dell/Desktop/caption-cam/src/stores/ui.store.ts)

### State

| Field | Type | Default | Description |
|---|---|---|---|
| `isMouseActive` | `boolean` | `true` | Mouse activity state |
| `isFullscreen` | `boolean` | `false` | Fullscreen mode |
| `isFsSidebarOpen` | `boolean` | `false` | Fullscreen sidebar |
| `showSettings` | `boolean` | `false` | Settings panel |
| `showSessionsPanel` | `boolean` | `false` | Sessions panel |
| `showAnimationLibrary` | `boolean` | `false` | Animation library |
| `isChatbotOpen` | `boolean` | `false` | AI chatbot |

All setters support both direct values and updater functions: `set(true)` or `set(prev => !prev)`.

---

## `useOmegleStore` — Random Chat

→ Source: [omegle.store.ts](file:///c:/Users/Dell/Desktop/caption-cam/src/stores/omegle.store.ts) (~8.6KB)

Manages the full Omegle-style matching lifecycle (searching, connected, disconnected, chat messages, interests).

---

## `useSceneAudioStore` — Per-Scene Audio

→ Source: [sceneAudio.store.ts](file:///c:/Users/Dell/Desktop/caption-cam/src/stores/sceneAudio.store.ts)

Per-scene audio settings (volume, mute state).

---

## `useGoLiveStore` — Go-Live Modal

→ Source: [goLive.store.ts](file:///c:/Users/Dell/Desktop/caption-cam/src/stores/goLive.store.ts)

Minimal store for go-live modal visibility.

---

## `useStreamManagerStore` — Stream Manager

→ Source: [stream-manager.store.ts](file:///c:/Users/Dell/Desktop/caption-cam/src/stores/stream-manager.store.ts)

Stream manager orchestration state.
