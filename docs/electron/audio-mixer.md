# Audio Mixer Engine

→ Back to [Index](../INDEX.md) | [Electron](./README.md)

> Last Updated: 2026-04-03

---

## Overview

The Audio Mixer Engine handles the routing, leveling, and metering of all audio sources before they are merged into the final broadcast Canvas stream. We utilize the native Web Audio API to ensure low latency and precise control over gain.

→ Source: [AudioMixerEngine.ts](file:///c:/Users/Dell/Desktop/caption-cam/src/kernel/audio/AudioMixerEngine.ts) (~6.9KB)

---

## Architecture

```
[System/Screen Audio] ──► MediaElementAudioSourceNode ──► GainNode (Volume/Mute) ──► AnalyserNode (Peak/RMS) ─┐
                                                                                                             │
[Microphone Audio] ──────► MediaStreamAudioSourceNode ───► GainNode (Volume/Mute) ──► AnalyserNode ─────────┼──► MasterGain ──► MediaStreamAudioDestinationNode
                                                                                                             │
[Browser Overlays] ──────► MediaElementAudioSourceNode ──► GainNode (Volume/Mute) ──► AnalyserNode ─────────┘
```

---

## Features

### 1. Zero-Latency Graph
All audio passes directly through the Web Audio `AudioContext`. Node connections are extremely lightweight. The final `MediaStreamAudioDestinationNode` extracts a raw `MediaStream` containing just the mixed audio track which gets injected into the `useCompositeStream.ts` video output before going to FFmpeg.

→ Source: [useCompositeStream.ts](file:///c:/Users/Dell/Desktop/caption-cam/src/features/stream/hooks/useCompositeStream.ts) — where the audio stream is merged with video

### 2. Multi-channel Metering
Each audio input source receives an `AnalyserNode` before it connects to the Master mix. The `requestAnimationFrame` loop in the UI reads the raw Time-Domain output data (e.g., `getFloatTimeDomainData`) to compute precise Peak and RMS (Root Mean Square) volume values. This drives the visual volume meter bars inside `AudioMixer.tsx`.

### 3. Safe Monitoring Defaults
Monitoring (listening to the stream audio through the desktop speakers) is explicitly disabled internally to prevent deafening feedback loops from the user's microphone. All audio mixing strictly routes directly to the broadcast.

---

## State Management

The frontend state bindings are decoupled from the Web Audio graph via `AudioMixerState` in `sceneCollection.store.ts`:

→ Source: [sceneCollection.store.ts](file:///c:/Users/Dell/Desktop/caption-cam/src/stores/sceneCollection.store.ts) — `setMasterVolume`, `setMasterMuted`, `setSourceAudio`

| Field | Type | Description |
|---|---|---|
| `volume` | `number` (0.0–1.0) | Floating gain value |
| `muted` | `boolean` | Strict mute toggle |
| `syncToEngine(engine)` | method | Copies UI states back into the hardware audio graph without React re-renders |

---

## Related Docs

→ See [Compositor](./compositor.md) for the video rendering pipeline
→ See [Streaming Pipeline](./streaming.md) for how the audio reaches FFmpeg
→ See [State Management](../architecture/state-management.md) for the Zustand store architecture
→ See [Stores Reference](../webapp/stores/stores-reference.md#usescenecollectionstore--compositor-scene-collection) for `useSceneCollectionStore` audio actions
