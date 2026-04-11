# Streaming Feature (UI)

→ Back to [Index](../../INDEX.md) | [Features](./README.md)

---

## Overview

The streaming feature provides the **user-facing controls** for going live. It manages stream destinations, the go-live flow, and the streaming UI. The actual RTMP pipeline runs in the Electron main process.

## Architecture

```
User clicks "Go Live"
    │
    ▼
Stream UI (Go Live panel)
    │ Configure destinations (RTMP URL + key)
    │ Optional: countdown timer
    │
    ▼
useStreamStore.setBroadcasting(true)
    │
    ▼
Canvas.captureStream(30)
    │
    ▼
MediaRecorder (WebM) → ondataavailable
    │
    ▼
window.electron.stream.start(config)  ← per destination
window.electron.stream.sendData(chunk) ← broadcast
    │
    ▼
[Electron Main Process → FFmpeg → RTMP]
```

## Feature Module

```
src/features/stream/
├── hooks/
│   ├── useBroadcast.ts          — Broadcast lifecycle management
│   └── useStreamManager.ts      — Multi-destination stream management
├── services/
│   └── (RTMP service wrappers)
├── transitions/
│   └── (Scene transition system, stingers)
└── ui/
    ├── GoLivePanel.tsx           — Go-live configuration UI
    ├── StreamStatusBar.tsx       — Live status indicator
    ├── DestinationCard.tsx       — Individual RTMP destination
    ├── pip/                      — PiP camera controls
    │   └── cinematicShotData.ts  — Cinematic camera effects
    └── (stinger transition UI)
```

## Multi-Destination Streaming

Users can stream to multiple platforms simultaneously:

```typescript
// useStreamStore
destinations: StreamDestination[] = [
  { id: '1', platform: 'youtube', url: 'rtmp://...', key: '...', enabled: true, status: 'idle' },
  { id: '2', platform: 'twitch', url: 'rtmp://...', key: '...', enabled: true, status: 'idle' },
];
```

Each destination has independent status tracking (`idle`, `starting`, `connected`, `live`, `error`).

## Go-Live Flow

1. User opens Go Live panel
2. Configures destinations (RTMP URL + stream key per platform)
3. Clicks "Go Live"
4. Optional countdown (3, 2, 1...)
5. Canvas capture starts → MediaRecorder → chunks sent via IPC
6. FFmpeg processes start (one per destination)
7. Status updates flow back via `stream:status` events
8. On stop, all FFmpeg processes are killed

## Cinematic Effects

The streaming feature includes cinematic camera effects:

| Effect | Description |
|---|---|
| `none` | Standard camera view |
| `dolly-zoom` | Vertigo/Hitchcock zoom effect |
| `rack-focus` | Simulated focus pull |
| `dutch-angle` | Tilted camera angle |
| `slow-push` | Gradual zoom in |
| `pull-back` | Gradual zoom out |

→ See [Streaming Pipeline](../../electron/streaming.md) for the Electron-side implementation  
→ See [State Management](../../architecture/state-management.md#usestreamstore) for store details
