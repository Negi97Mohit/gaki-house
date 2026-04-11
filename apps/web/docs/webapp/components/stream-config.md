# Stream Configuration & Platform Selector

→ Back to [Index](../../INDEX.md) | [Web App](../README.md) | [Components](./README.md)

---

## Overview

The stream configuration system provides a **professional broadcast setup UI** for configuring RTMP destinations, managing multi-platform streaming, and going live. It's the largest single UI component at 46KB.

## Components

```
src/features/stream/ui/
├── StreamConfigurationModal.tsx  (47KB) — Full stream setup wizard
├── StreamPlatformSelector.tsx    (25KB) — Platform connection cards
├── FatalErrorDialog.tsx          (2.6KB) — Stream error recovery UI
└── SavedSessionsPanel.tsx        (5.4KB) — Past recording sessions
```

---

## StreamConfigurationModal (47KB)

→ Source: [StreamConfigurationModal.tsx](file:///c:/Users/Dell/Desktop/caption-cam/src/features/stream/ui/StreamConfigurationModal.tsx)

A **multi-step broadcast wizard** that opens when the user clicks "Go Live":

### Step 1: Platform Selection
- Pre-built platform cards for YouTube, Twitch, Kick, Facebook, Custom RTMP
- Each card shows the platform logo, name, and status
- Users enter RTMP URL and stream key per platform
- Multiple platforms can be enabled for simultaneous streaming

### Step 2: Stream Settings
- **Video resolution**: 720p, 1080p, 1440p, 4K
- **Frame rate**: 24, 30, 60 fps
- **Bitrate**: 2500-12000 kbps (with presets per resolution)
- **Encoder**: Software (libx264) or Hardware (NVENC if available)
- **Keyframe interval**: 1-4 seconds
- **Audio bitrate**: 128, 192, 256, 320 kbps

### Step 3: Preview & Go Live
- Stream preview (canvas capture)
- Countdown timer (3-2-1 Go!)
- Go Live button with confirmation

### Multi-Destination Management
```typescript
destinations.map(dest => (
  <DestinationCard
    platform={dest.platform}
    url={dest.url}
    key={dest.key}
    status={dest.status}        // idle, starting, connected, live, error
    enabled={dest.enabled}
    onToggle={() => toggleDestination(dest.id)}
    onRemove={() => removeDestination(dest.id)}
    onEdit={() => editDestination(dest.id)}
  />
));
```

### State Integration
- `useStreamStore` — manages destinations (persisted), broadcast state
- `useGoLiveStore` — modal visibility
- `useMediaStore` — camera/mic toggles

---

## StreamPlatformSelector (25KB)

→ Source: [StreamPlatformSelector.tsx](file:///c:/Users/Dell/Desktop/caption-cam/src/features/stream/ui/StreamPlatformSelector.tsx)

Pre-designed platform connection cards:

| Platform | Logo | RTMP Template |
|---|---|---|
| YouTube | Red play button | `rtmp://a.rtmp.youtube.com/live2` |
| Twitch | Purple Twitch icon | `rtmp://live.twitch.tv/app` |
| Kick | Green Kick icon | `rtmp://fa723fc1b171.global-contribute.live-video.net/app` |
| Facebook | Blue FB icon | `rtmp://live-api-s.facebook.com:443/rtmp` |
| Custom RTMP | Generic icon | User-provided URL |

Each card has:
- Platform branding (icon, name, color scheme)
- RTMP URL input (pre-filled for known platforms)
- Stream key input (password field)
- Enable/disable toggle
- Connection status indicator
- Validation feedback

---

## FatalErrorDialog (2.6KB)

Shows when a **fatal stream error** occurs (FFmpeg crash, network failure):
- Error message display
- "Retry" button — attempts to restart the stream
- "Stop" button — gracefully stops all streams
- Error is set via `useStreamStore.setFatalError()`

---

## SavedSessionsPanel (5.4KB)

→ Source: [SavedSessionsPanel.tsx](file:///c:/Users/Dell/Desktop/caption-cam/src/features/stream/ui/SavedSessionsPanel.tsx)

Browse and manage past recording sessions:
- Lists sessions from localStorage (`gaki-recorded-sessions`)
- Thumbnail preview for each session
- Duration and date display
- Click to open in editor (`/edit/:sessionId`)
- Delete session
- Managed by `useUiStore.showSessionsPanel`

→ See [Recording Feature](../features/recording-feature.md) for session details  
→ See [Streaming Pipeline](../../electron/streaming.md) for RTMP internals
