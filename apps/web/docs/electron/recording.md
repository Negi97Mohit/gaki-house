# Recording Pipeline

→ Back to [Index](../INDEX.md) | [Electron](./README.md)

---

## Overview

Recording in GAKI Studio works differently depending on the runtime:

| Mode | Runtime | Mechanism | Output |
|---|---|---|---|
| **Native File Recording** | Electron | `fs.createWriteStream` → FFmpeg conversion | `.mp4` file in Videos folder |
| **Session Recording** | Web/Electron | `MediaRecorder` + keyframe state tracking | In-memory Blob + state JSON |

This document covers the **native file recording** pipeline. For session recording, → See [Recording Feature](../webapp/features/recording-feature.md).

## Native Recording Flow (Electron)

```
Canvas.captureStream()
    │
    ▼
MediaRecorder (WebM, 1s timeslice)
    │
    ├── ondataavailable(chunk)
    │      │
    │      ▼
    │   window.electron.recorder.write(chunk.arrayBuffer())
    │      │
    │      ▼
    │   ipcMain 'recorder:write' → recorderStream.write(Buffer.from(data))
    │      │
    │      ▼
    │   WebM file on disk (Videos/GAKI_Recording_<timestamp>.webm)
    │
    ▼ (on stop)
window.electron.recorder.stop(durationMs)
    │
    ▼
ipcMain 'recorder:stop'
    │
    ├── Close write stream
    ├── convertToMp4(webmPath) → FFmpeg
    │      │
    │      ├── -c:v copy (no re-encoding)
    │      ├── -c:a aac
    │      ├── -movflags +faststart
    │      │
    │      ▼
    │   .mp4 file (same name, different extension)
    │   Original .webm deleted
    │
    └── Return { filePath: '/path/to/recording.mp4' }
```

## IPC Handlers

### `recorder:start`
```typescript
ipcMain.handle('recorder:start', async () => {
  const videosPath = app.getPath('videos');
  const filename = `GAKI_Recording_${timestamp}.webm`;
  recorderStream = fs.createWriteStream(filePath);
  currentRecordingPath = filePath;
  return { filePath };
});
```

### `recorder:write`
```typescript
ipcMain.handle('recorder:write', async (_, buffer) => {
  if (recorderStream && !recorderStream.destroyed) {
    recorderStream.write(Buffer.from(buffer));
  }
});
```

### `recorder:stop`
```typescript
ipcMain.handle('recorder:stop', async (_, durationMs) => {
  return new Promise((resolve) => {
    recorderStream.end(async () => {
      const finalPath = await convertToMp4(rawPath);
      resolve({ filePath: finalPath });
    });
  });
});
```

## MP4 Conversion

The `convertToMp4()` function uses FFmpeg to convert the raw WebM recording to MP4:

```typescript
ffmpeg(inputPath)
  .outputOptions([
    '-c:v copy',           // No re-encoding (fast)
    '-c:a aac',            // Standard audio codec
    '-strict experimental',
    '-movflags +faststart', // Move metadata to start for streaming
  ])
  .save(outputPath)
```

**Why convert?**
- WebM files from `MediaRecorder` often have missing/incorrect duration metadata
- MP4 with `faststart` flag enables immediate playback without downloading the entire file
- MP4 is universally compatible (unlike WebM)

**Error handling:** If conversion fails, the original WebM path is returned so the user doesn't lose their recording.

## State Variables (Main Process)

```typescript
let recorderStream: fs.WriteStream | null = null;    // Active file stream
let currentRecordingPath: string | null = null;       // Path being written to
```

Only one recording can be active at a time (single-instance).

→ See [Streaming Pipeline](./streaming.md) for live streaming  
→ See [Recording Feature](../webapp/features/recording-feature.md) for session recording
