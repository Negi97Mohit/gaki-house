# Types Reference

→ Back to [Index](../../INDEX.md) | [Types](./README.md)

---

Core type definitions from `src/types/`.

---

## `caption.ts` — Core Scene Model

→ Source: [caption.ts](file:///c:/Users/Dell/Desktop/gaki/src/types/caption.ts) (~17.7KB)

The largest type file, defining the fundamental data model.

### `SceneState`
The root state object for a single scene:
```typescript
interface SceneState {
  id: string;
  name: string;
  
  // Overlays
  activeOverlays: GeneratedOverlay[];
  textOverlays: TextOverlayState[];
  fileOverlays: FileOverlayState[];
  browserOverlays: BrowserOverlayState[];
  
  // Visual
  videoFilter: string | undefined;
  backgroundEffect: 'none' | 'blur' | 'image';
  backgroundImageUrl: string | undefined;
  blankCanvasColor: string;
  
  // Captions
  captionStyle: CaptionStyle;
  dynamicStyle: string;
  captionsEnabled: boolean;
  
  // Layout
  layoutMode: LayoutMode;
  cameraShape: CameraShape;
  splitRatio: number;
  
  // Camera
  isAutoFramingEnabled: boolean;
  isNeonEdgeEnabled: boolean;
  activeInteractiveFilter: string;
  // ... more fields
}
```

### `CaptionStyle`
Complete styling specification for captions:
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
  position: { x: number; y: number };
  maxWidth: number;
  padding: number;
  letterSpacing: number;
  lineHeight: number;
  // ... animation, transition properties
}
```

### `GeneratedOverlay`
AI-generated HTML overlay:
```typescript
interface GeneratedOverlay {
  id: string;
  html: string;            // Complete HTML/CSS/JS string
  prompt: string;          // Original user prompt
  position: { x: number; y: number };    // percentage
  size: { width: number; height: number }; // percentage
  rotation: number;
  zIndex: number;
  visible: boolean;
  locked: boolean;
}
```

### `TextOverlayState`
Rich text element:
```typescript
interface TextOverlayState {
  id: string;
  content: string;         // HTML content (innerHTML)
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  backgroundColor: string;
  zIndex: number;
  designPreset?: string;
}
```

### `FileOverlayState`
Media file element:
```typescript
interface FileOverlayState {
  id: string;
  file?: File;
  fileUrl: string;
  fileType: 'image' | 'video' | 'audio' | 'pdf' | 'text';
  fileName: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
  zIndex: number;
}
```

### `BrowserOverlayState`
Embedded browser:
```typescript
interface BrowserOverlayState {
  id: string;
  url: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
}
```

### `SceneTransition`
```typescript
interface SceneTransition {
  type: 'dissolve' | 'slide-left' | 'slide-right' | 'slide-up' | 'slide-down' |
        'wipe-left' | 'wipe-right' | 'zoom' | 'fade' | 'blur';
  duration: number;
  easeIn: string;
  easeOut: string;
  blendMode?: string;
}
```

### Enums / Literal Unions

```typescript
type LayoutMode = 'solo' | 'split-horizontal' | 'split-vertical' | 'pip' | 'canvas-only';
type CameraShape = 'rectangle' | 'circle' | 'square' | 'rounded';
```

---

## `editor.ts` — Recording & Playback

→ Source: [editor.ts](file:///c:/Users/Dell/Desktop/gaki/src/types/editor.ts)

### `RecordingSession`
```typescript
interface RecordingSession {
  id: string;
  videoMetadata: {
    videoUrl: string;
    durationMs: number;
    width: number;
    height: number;
  };
  htmlOverlayTrack: ComponentTrack<GeneratedOverlay>[];
  fileOverlayTrack: ComponentTrack<FileOverlayState>[];
  browserOverlayTrack: ComponentTrack<BrowserOverlayState>[];
  captionStyleTrack: ComponentTrack<CaptionStyle>;
  layoutTrack: ComponentTrack<any>;
  settings: RecordingSettings;
}
```

### `ComponentTrack<T>`
```typescript
interface ComponentTrack<T> {
  componentId: string;
  keyframes: Keyframe<T>[];
}
```

### `Keyframe<T>`
```typescript
interface Keyframe<T> {
  timestamp: number;  // milliseconds from recording start
  state: T;           // complete state snapshot at this moment
}
```

---

## `videoCanvas.ts` — Canvas Component Types

→ Source: [videoCanvas.ts](file:///c:/Users/Dell/Desktop/gaki/src/types/videoCanvas.ts) (~7.3KB)

Defines the prop types for `VideoCanvas` and its sub-components.

---

## `streamStyle.ts` — Stream Design Types

→ Source: [streamStyle.ts](file:///c:/Users/Dell/Desktop/gaki/src/types/streamStyle.ts) (~5KB)

Types for stream scene designs (starting soon, BRB, etc.).

---

## `omegle.ts` — Random Chat Types

→ Source: [omegle.ts](file:///c:/Users/Dell/Desktop/gaki/src/types/omegle.ts) (~5KB)

Types for the Omegle-style matching and chat system.

---

## `vault.ts` — Vault Types

→ Source: [vault.ts](file:///c:/Users/Dell/Desktop/gaki/src/types/vault.ts)

```typescript
interface VaultAsset {
  id: string;
  name: string;
  category: 'screen' | 'overlay' | 'alert' | 'transition';
  type: string;
  path: string;
  thumbnail?: string;
}
```

---

## Other Type Files

| File | Size | Purpose |
|---|---|---|
| `banner.ts` | 1.6KB | Banner overlay types |
| `socialBanner.ts` | 2.4KB | Social media banner types |
| `animatedBanner.ts` | 1.2KB | Animated banner types |
| `animation.ts` | 1.1KB | Animation configuration types |
| `textDesign.ts` | 3.8KB | Text design preset types |
| `canvasPreset.ts` | 2.8KB | Canvas preset types |
| `layoutPreset.ts` | 702B | Layout preset types |
| `layout.ts` | 1.5KB | Layout types (may be deprecated) |
| `ai.ts` | 472B | AI-related types |
