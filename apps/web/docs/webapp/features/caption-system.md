# Caption System

→ Back to [Index](../../INDEX.md) | [Features](./README.md)

---

## Overview

The caption system provides **real-time speech-to-text** with **word-by-word animated rendering**. It uses Deepgram Nova-2 for transcription and a library of 15+ animation styles for visual rendering.

## Architecture

```
Microphone
    │
    ▼
getUserMedia() → AudioStream
    │
    ▼
useContinuousAudio (MediaRecorder, timesliced chunks)
    │
    ▼
useDeepgramSpeech (WebSocket → Deepgram Nova-2)
    │
    ├── onPartialTranscript → interimTranscript (real-time preview)
    └── onFinalTranscript → fullTranscript (confirmed words)
           │
           ▼
    CaptionRenderer
           │
           ├── Static styles (CaptionStyle → background, font, size, color)
           └── Dynamic animation (DYNAMIC_STYLES[styleName])
                  │
                  ▼
           Word-by-word animation component
           (e.g., KaraokeComponent, PopUpComponent)
```

## Key Source Files

| File | Purpose |
|---|---|
| `src/hooks/useDeepgramSpeech.ts` | Deepgram WebSocket connection management |
| `src/hooks/useContinuousAudio.ts` | Audio stream → MediaRecorder chunks |
| `src/lib/dynamicCaptionStyles.tsx` | 15+ animation components |
| `src/lib/captionPresets.ts` | Pre-configured caption style presets |
| `src/features/caption/ui/StyleSync.tsx` | Syncs caption styles across components |
| `src/types/caption.ts` | `CaptionStyle` type definition |

## Speech-to-Text Pipeline

### `useContinuousAudio` Hook
1. Receives a `MediaStream` (audio-only)
2. Creates a `MediaRecorder` with time-sliced chunks
3. Provides chunks via `onDataAvailable` callback
4. Manages start/stop lifecycle

### `useDeepgramSpeech` Hook
1. Creates Deepgram client: `createClient(API_KEY)`
2. Opens live connection: `deepgram.listen.live({ model: 'nova-2' })`
3. Sends audio chunks from `useContinuousAudio` via `connection.send(chunk)`
4. Receives transcription events:
   - `Transcript` → parsed into partial/final transcripts
   - `Open/Close/Error` → connection lifecycle

## Caption Rendering

### `CaptionRenderer` Component
Combines static styling with dynamic animation:

```tsx
<div style={staticStyles}>  {/* background, font, size, colors */}
  <DynamicComponent        {/* word-by-word animation */}
    finalTranscript={finalTranscript}
    interimTranscript={interimTranscript}
    style={captionStyle}
  />
</div>
```

### `CaptionStyle` Type
```typescript
interface CaptionStyle {
  fontFamily: string;
  fontSize: number;
  fontColor: string;
  backgroundColor: string;
  backgroundOpacity: number;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  textShadow: string;
  textAlign: 'left' | 'center' | 'right';
  position: { x: number; y: number };  // percentage
  // ... more style properties
}
```

## Animation Styles

The `DYNAMIC_STYLES` object in `dynamicCaptionStyles.tsx` maps style names to React components:

| Style | Description |
|---|---|
| `karaoke` | Words highlight sequentially (like karaoke) |
| `popup` | Words pop in with scale animation |
| `typewriter` | Characters appear one by one |
| `rainbow-wave` | Words cycle through rainbow colors |
| `bounce` | Words bounce in from below |
| `fade-in` | Words fade in sequentially |
| `slide-up` | Words slide up from bottom |
| `glow` | Words appear with glow effect |
| `shake` | Words shake in |
| `zoom` | Words zoom in from small |
| `rotate` | Words rotate in |
| `flip` | Words flip in from the side |
| `elastic` | Words spring in with elastic easing |
| `blur-in` | Words unblur into view |
| `split` | Text splits and reforms |

Each animation component receives:
```typescript
{
  finalTranscript: string;
  interimTranscript: string;
  style: CaptionStyle;
}
```

## Per-Scene Styling

Each scene maintains its own:
- `captionStyle: CaptionStyle` — static visual styling
- `dynamicStyle` — which animation to use
- `captionsEnabled: boolean` — on/off toggle

Switching scenes switches the caption appearance instantly.

→ See [Integrations](../../architecture/integrations.md) for Deepgram API details  
→ See [Scene Management](./scene-management.md) for per-scene settings
