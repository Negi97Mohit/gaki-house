# Streaming Pipeline

→ Back to [Index](../INDEX.md) | [Electron](./README.md)

---

## Overview

GAKI Studio supports live RTMP streaming to any destination (YouTube, Twitch, Kick, custom servers). The pipeline captures the canvas as a `MediaStream`, encodes chunks as WebM, sends them to the Electron main process, and pipes them through FFmpeg to the RTMP endpoint.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Renderer Process                      │
│                                                          │
│  Canvas → captureStream(30) → MediaRecorder (WebM)      │
│       │                                                  │
│       └──► ondataavailable(chunk) ──────────────────────┤
│                                                          │
│  Two paths:                                              │
│  ① IPC:     window.electron.stream.sendData(chunk)      │
│  ② Socket:  socket.emit('binary-stream', chunk)         │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│                    Main Process                           │
│                                                           │
│  ① ipcMain.on('stream:data') ──► ffmpeg.stdin.write()   │
│  ② io.on('binary-stream')    ──► ffmpeg.stdin.write()   │
│                                                           │
│  FFmpeg command:                                          │
│  ┌──────────────────────────────────────────────┐        │
│  │  Input:  pipe:0 (stdin, WebM format)          │        │
│  │  Video:  libx264 (or copy if H.264 input)     │        │
│  │  Audio:  aac                                   │        │
│  │  Output: flv → rtmp://server/key               │        │
│  │                                                 │        │
│  │  Options (re-encode):                           │        │
│  │    -preset ultrafast                            │        │
│  │    -tune zerolatency                            │        │
│  │    -b:v 4500k -maxrate 4500k -bufsize 9000k    │        │
│  │    -g 60 -r 30                                  │        │
│  │    -vf scale=1920:-1                            │        │
│  │    -pix_fmt yuv420p                             │        │
│  └──────────────────────────────────────────────┘        │
│                       │                                    │
│                       ▼                                    │
│              RTMP Server (YouTube/Twitch/Kick)            │
└───────────────────────────────────────────────────────────┘
```

## Two Streaming Backends

### Path ① — IPC-based (Primary)

Used by the `useStreamStore` and stream feature UI.

**Start:** `window.electron.stream.start({ id, rtmpUrl, key, mimeType })`  
**Data:** `window.electron.stream.sendData(chunk)` — broadcasts to ALL active FFmpeg commands  
**Stop:** `window.electron.stream.stop({ id })` or `stop({})` for all  
**Status:** `window.electron.stream.onStatus(cb)` → `{ id, status: 'started'|'stopped'|'error', error? }`

The main process maintains a `Map<string, FfmpegCommand>` allowing **multi-destination** streaming.

### Path ② — Socket.IO-based (Legacy/Alternative)

A Socket.IO server runs on `localhost:3000`:

**Start:** `socket.emit('start-stream', { rtmpUrl, key })`  
**Data:** `socket.emit('binary-stream', chunk)`  
**Stop:** `socket.emit('stop-stream')`  
**Status:** `socket.on('stream-status', status)` / `socket.on('ffmpeg-ready')`

Only supports **single destination** per socket connection.

## FFmpeg Configuration

### `createFfmpegCommand()` (shared by both paths)

```typescript
function createFfmpegCommand(
  input: string,            // 'pipe:0' for stdin
  options: { rtmpUrl, key, mimeType? },
  onStart: (cmd) => void,
  onError: (err) => void,
  onEnd: () => void
): ffmpeg.FfmpegCommand
```

**Codec selection:**
- If `mimeType` includes `h264` → `videoCodec('copy')` + `-bsf:v h264_mp4toannexb` (passthrough, fast)
- Otherwise → `videoCodec('libx264')` with full encoding options (CPU-intensive but compatible)

**Output:** Always `-f flv` (FLV container for RTMP)

### Hardware Encoding & Stream Health Telemetry

**Encoder Priority:** At startup, `window.electron.stream.getEncoders()` invokes an `ffprobe` scan mapping hardware silicon backends (`h264_nvenc`, `h264_qsv`, `h264_amf`, `h264_videotoolbox`). Users can explicitly pick an encoder, or use "Auto", which selects the first hardware-accelerated encoder prior to falling back to `libx264`.

**Fluent-FFmpeg Metrics:** During active streaming, `fluent-ffmpeg` streams continuous internal `on('progress')` reports out through an IPC `stream:health` event. This supplies our native `useStreamHealthStore` strictly bound UI (`StreamHealthPanel.tsx`) with real-time encoding FPS, live Bitrates, and timemarks to identify dropped frames or thermal throttling immediately on the broadcast deck.

## Multi-Destination Streaming

The IPC-based path supports streaming to multiple RTMP endpoints simultaneously:

```typescript
// Renderer
destinations.forEach(dest => {
  window.electron.stream.start({
    id: dest.id,
    rtmpUrl: dest.url,
    key: dest.key,
  });
});

// Each data chunk is broadcast to ALL active streams:
ipcMain.on('stream:data', (_, data) => {
  ffmpegCommands.forEach((command, id) => {
    command.ffmpegProc.stdin.write(Buffer.from(data));
  });
});
```

## Store Integration

→ Source: [stream.store.ts](file:///c:/Users/Dell/Desktop/caption-cam/src/stores/stream.store.ts)

The `useStreamStore` manages destination state:
```typescript
interface StreamDestination {
  id: string;
  platform: string;  // 'youtube', 'twitch', 'custom'
  url: string;       // RTMP URL
  key: string;       // Stream key
  enabled: boolean;
  status: 'idle' | 'starting' | 'connected' | 'live' | 'error';
  error?: string;
}
```

Destinations are **persisted** to localStorage (with status reset on reload).

## Error Handling

- FFmpeg `SIGKILL` errors are silently ignored (expected on stop)
- Other FFmpeg errors are forwarded to the renderer via `stream:status { status: 'error', error: message }`
- Stdin write errors are caught and logged (stream may have been killed)
- Dead FFmpeg processes are cleaned up from the command map

→ See [IPC Bridge](../architecture/ipc-bridge.md) for channel details
