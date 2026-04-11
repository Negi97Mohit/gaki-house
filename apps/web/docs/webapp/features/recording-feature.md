# Recording Feature

→ Back to [Index](../../INDEX.md) | [Features](./README.md)

---

## Overview

Recording in GAKI Studio captures not just video but the **entire state timeline** of the workspace — every overlay position, caption style, and layout change is recorded as keyframes alongside the video stream.

## Two Recording Modes

### 1. Native File Recording (Electron-only)
Records raw WebM to disk via `fs.createWriteStream`, then converts to MP4.
→ See [Recording Pipeline (Electron)](../../electron/recording.md)

### 2. Session Recording (Web + Electron)
Records everything as a `RecordingSession` object:
- Video as in-memory Blob
- State changes as timestamped keyframe tracks

## Session Recording Architecture

```
User clicks Record
    │
    ▼
useRecordingSession.startRecording(canvasRef)
    │
    ├── Canvas.captureStream() → MediaRecorder → Blob chunks
    │
    └── setInterval(takeSnapshot, 250ms)
           │
           ├── recordHtmlOverlay(id, state)       → htmlOverlayTrack
           ├── recordFileOverlay(id, state)       → fileOverlayTrack
           ├── recordBrowserOverlay(id, state)    → browserOverlayTrack
           ├── recordCaptionStyle(style)          → captionStyleTrack
           ├── recordLayout(layout)               → layoutTrack
           └── (each with timestamp)
    
User clicks Stop
    │
    ▼
useRecordingSession.stopRecording()
    │
    ├── MediaRecorder.stop() → Blob → URL.createObjectURL
    ├── Bundle all keyframe tracks
    │
    ▼
RecordingSession object
    │
    ▼
Saved to localStorage ('gaki-recorded-sessions')
    │
    ▼
Navigate to /edit/:sessionId
```

## Data Model

```typescript
// src/types/editor.ts
interface RecordingSession {
  id: string;
  videoMetadata: {
    videoUrl: string;          // Object URL for the video Blob
    durationMs: number;
    width: number;
    height: number;
  };
  htmlOverlayTrack: ComponentTrack<GeneratedOverlay>[];
  fileOverlayTrack: ComponentTrack<FileOverlayState>[];
  browserOverlayTrack: ComponentTrack<BrowserOverlayState>[];
  captionStyleTrack: ComponentTrack<CaptionStyle>;
  layoutTrack: ComponentTrack<LayoutState>;
  settings: RecordingSettings;
}

interface ComponentTrack<T> {
  componentId: string;
  keyframes: Keyframe<T>[];
}

interface Keyframe<T> {
  timestamp: number;  // milliseconds from start
  state: T;           // complete state snapshot
}
```

## Playback Engine

The editor (`/edit/:sessionId`) uses `useSessionPlayback` to reconstruct the workspace state at any timestamp:

```typescript
// src/hooks/useSessionPlayback.ts
function findStateAtTime<T>(track: ComponentTrack<T>, timeMs: number): T | undefined {
  // Binary search through sorted keyframes
  // Returns the last keyframe before or at timeMs
  let foundKeyframe: Keyframe<T> | undefined;
  for (let i = 0; i < track.keyframes.length; i++) {
    if (track.keyframes[i].timestamp <= timeMs) {
      foundKeyframe = track.keyframes[i];
    } else {
      break;
    }
  }
  return foundKeyframe?.state ?? track.keyframes[0]?.state;
}
```

**Playback flow:**
1. `<video>` element plays the recorded video
2. `timeupdate` event updates `currentTime`
3. `useSessionPlayback(session, currentTimeMs)` returns state snapshot
4. Editor renders overlays matching that moment

## Key Source Files

| File | Purpose |
|---|---|
| `src/hooks/useRecordingSession.ts` | Recording lifecycle, keyframe capture |
| `src/hooks/useSessionPlayback.ts` | Timeline-based state reconstruction |
| `src/pages/Edit/` | Editor page and components |
| `src/types/editor.ts` | Recording/editor type definitions |

## Limitations

- Session recordings stored in `localStorage` have a size limit (~5-10MB)
- No video editing (trim, cut, split) — playback only
- Only WebM export format
- Object URLs are lost between browser sessions

→ See [Recording Pipeline (Electron)](../../electron/recording.md) for native recording
