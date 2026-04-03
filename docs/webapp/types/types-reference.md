# Types Reference

→ Back to [Index](../../INDEX.md) | [Types](./README.md)

> Last Updated: 2026-04-03

---

Core type definitions from `src/types/`.

---

## `caption.ts` — Core Scene Model

→ Source: [caption.ts](file:///c:/Users/Dell/Desktop/caption-cam/src/types/caption.ts) (~17.7KB)

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

→ Source: [editor.ts](file:///c:/Users/Dell/Desktop/caption-cam/src/types/editor.ts)

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

→ Source: [videoCanvas.ts](file:///c:/Users/Dell/Desktop/caption-cam/src/types/videoCanvas.ts) (~7.3KB)

Defines the prop types for `VideoCanvas` and its sub-components.

---

## `streamStyle.ts` — Stream Design Types

→ Source: [streamStyle.ts](file:///c:/Users/Dell/Desktop/caption-cam/src/types/streamStyle.ts) (~5KB)

Types for stream scene designs (starting soon, BRB, etc.).

---

## `omegle.ts` — Random Chat Types

→ Source: [omegle.ts](file:///c:/Users/Dell/Desktop/caption-cam/src/types/omegle.ts) (~5KB)

Types for the Omegle-style matching and chat system.

---

## `vault.ts` — Vault Types

→ Source: [vault.ts](file:///c:/Users/Dell/Desktop/caption-cam/src/types/vault.ts)

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

## `compositor.ts` — GPU Compositor Types

→ Source: [compositor.ts](file:///c:/Users/Dell/Desktop/caption-cam/src/types/compositor.ts) (~14.9KB)

Defines the entire type system for the WebGL compositor pipeline, OBS-compatible scene model, and import/export formats.

### `SourceType`
All 14 supported source types:
```typescript
type SourceType =
  | 'camera' | 'screen_capture' | 'window_capture'
  | 'image' | 'media' | 'browser'
  | 'text' | 'color' | 'group' | 'scene'
  | 'generated' | 'caption'
  | 'slideshow' | 'ndi';
```

### `CompositorSource`
A single renderable element in a scene:
```typescript
interface CompositorSource {
  id: string;
  name: string;
  type: SourceType;
  settings: Record<string, any>;     // Type-specific settings
  transform: SourceTransform;         // Position, size, rotation, crop
  filters: SourceFilter[];            // Per-source filter chain
  visible: boolean;
  locked: boolean;
  audio: SourceAudioConfig;
  children: CompositorSource[];       // For groups
  opacity: number;
  blendMode: GlobalCompositeOperation;
  isBehindUser: boolean;              // Render behind camera
}
```

### `SourceTransform`
Pixel-based transforms (matching OBS coordinate system):
```typescript
interface SourceTransform {
  position: { x: number; y: number };  // Absolute pixels on 1920×1080
  size: { width: number; height: number };
  rotation: number;                     // Degrees
  crop: { top, bottom, left, right };   // Pixel crop
  alignment: Alignment;                 // 9-point alignment
  boundsType: 'none' | 'stretch' | 'scale_inner' | 'scale_outer';
  bounds: { width: number; height: number };
}
```

### `CompositorScene`
A single scene containing multiple sources:
```typescript
interface CompositorScene {
  id: string;
  name: string;
  sources: CompositorSource[];
  transition: SceneTransition;
  gridLayout: GridLayout | null;
}
```

### `SceneCollection`
Top-level container for an entire project:
```typescript
interface SceneCollection {
  id: string;
  name: string;
  scenes: CompositorScene[];
  activeSceneId: string;
  canvasResolution: { width, height };
  audioMixer: AudioMixerState;
  defaultTransition: SceneTransition;
  createdAt: string;
  updatedAt: string;
  importedFrom: string | null;
}
```

### `SourceFilter`
```typescript
interface SourceFilter {
  id: string;
  name: string;
  type: 'color_correction' | 'chroma_key' | 'custom';
  enabled: boolean;
  settings: Record<string, any>;
}
```

### `GridLayout` & `GridCell`
```typescript
interface GridLayout {
  rows: number;
  columns: number;
  gap: number;
  cells: GridCell[];
}
interface GridCell {
  id: string;
  row: number;
  column: number;
  rowSpan: number;
  columnSpan: number;
  sourceId: string | null;
}
```

### Default Constants
Exports `DEFAULT_TRANSFORM`, `DEFAULT_AUDIO`, `DEFAULT_TRANSITION`, `DEFAULT_OUTPUT_CONFIG` for use in source/scene factory functions.

→ See [Compositor Architecture](../../electron/compositor.md) for how these types are rendered
→ See [sceneCollection.store](../../webapp/stores/stores-reference.md#usescenecollectionstore--compositor-scene-collection) for the runtime store

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
