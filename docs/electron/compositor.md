# Compositor — WebGL GPU Rendering Pipeline

→ Back to [Index](../INDEX.md) | [Electron](./README.md) | [Canvas System](../webapp/features/canvas-system.md)

---

## Overview

The compositor is the **GPU-accelerated rendering engine** that produces the final video output for streaming and recording. It replaces the legacy DOM-based `captureStream()` approach with a dedicated **OffscreenCanvas + WebGL 2.0 pipeline** running in a **Web Worker**.

This architecture ensures:
- **Smooth frame output** at 30 or 60 FPS, decoupled from the UI thread
- **GPU-accelerated compositing** of all source types (camera, screen, images, text, etc.)
- **Grid layout support** — sources assigned to grid cells are positioned automatically
- **Per-source filters** (color correction, chroma key) via GLSL shaders
- **GPU transitions** (fade, slide, wipe, zoom, blur) between scenes
- **Professional output resolution** (1920×1080 default)

## Architecture

```
Main Thread (React UI)                    Web Worker (Compositor)
┌────────────────────────┐               ┌────────────────────────────────┐
│ sceneCollection.store  │               │  CompositorWorker.ts           │
│ (Zustand)              │               │                                │
│                        │               │  ┌─────────────────────┐      │
│ useCompositeStream()   │─ updateScene ─▶│  │  SourceRenderer     │      │
│                        │               │  │  (textured quads)   │      │
│ registerVideoSource()  │─ ImageBitmap ─▶│  └────────┬────────────┘      │
│ registerCanvasSource() │               │           │                    │
│ registerImageSource()  │               │  ┌────────▼────────────┐      │
│                        │               │  │  FilterPipeline      │      │
│                        │◀─  preview  ──│  │  (FBO ping-pong)    │      │
│  previewRef (canvas)   │  ImageBitmap  │  └────────┬────────────┘      │
│                        │               │           │                    │
│                        │               │  ┌────────▼────────────┐      │
│  outputStream ─────────│───────────────│──│  OffscreenCanvas     │      │
│  (captureStream)       │               │  │  (1920×1080 WebGL)  │      │
│                        │               │  └────────┬────────────┘      │
│  ┌─────────────────┐   │               │           │                    │
│  │ CompositorBridge │   │               │  ┌────────▼────────────┐      │
│  │ (orchestrator)   │   │               │  │  TransitionRenderer  │      │
│  └─────────────────┘   │               │  │  (scene blending)   │      │
│                        │               │  └─────────────────────┘      │
└────────────────────────┘               └────────────────────────────────┘
         │
         ▼
  FFmpeg (IPC) → RTMP / File
```

## Module Structure

```
src/kernel/compositor/
├── index.ts                — Barrel export
├── types.ts                — Internal worker-safe types (serializable)
├── CompositorWorker.ts     — Web Worker: render loop + WebGL context
├── CompositorBridge.ts     — Main thread: worker lifecycle + frame feeding
├── SceneGraph.ts           — Serializes scenes for worker transfer
├── SourceRenderer.ts       — Renders sources as textured quads
├── TransitionRenderer.ts   — GPU-accelerated scene transitions
└── FilterPipeline.ts       — Per-source filter chain (FBO passes)

src/features/canvas/model/   (Phase 2: Source model integration)
├── index.ts                — Barrel export
├── sourceFactory.ts        — Factory functions for all 14 source types
└── legacySceneAdapter.ts   — SceneState ↔ CompositorScene conversion

src/features/canvas/hooks/   (Phase 2: Sync integration)
├── useCompositorSync.ts    — Legacy → compositor store sync bridge
└── useCompositorPreview.ts — Preview frame display
```

## Data Flow

### 1. Scene Updates

The `sceneCollection.store` holds the canonical scene state. When any source, transform, or filter changes:

```
sceneCollection.store (Zustand)
    │
    ▼
useCompositeStream hook (subscribes to store)
    │
    ▼
CompositorBridge.updateScene(activeScene)
    │
    ▼
SceneGraph.serializeScene(scene)  →  postMessage to Worker
    │
    ▼
CompositorWorker receives SerializedScene  →  renders next frame
```

→ Source: [SceneGraph.ts](file:///c:/Users/Dell/Desktop/caption-cam/src/kernel/compositor/SceneGraph.ts)
→ Source: [CompositorBridge.ts](file:///c:/Users/Dell/Desktop/caption-cam/src/kernel/compositor/CompositorBridge.ts)

### 2. Source Frame Feeding

Live sources (camera, screen share, media) produce video frames that must be sent to the worker as `ImageBitmap` objects:

```
HTMLVideoElement (camera/screen/media)
    │
    ▼
CompositorBridge.registerVideoSource(sourceId, videoElement)
    │
    ├── setInterval at target FPS
    │
    ▼
createImageBitmap(videoElement)  →  postMessage(ImageBitmap, [transfer])
    │
    ▼
CompositorWorker.SourceRenderer.updateSourceFrame(sourceId, bitmap)
    │
    ▼
WebGL texImage2D  →  GPU texture updated
```

→ Source: [SourceRenderer.ts](file:///c:/Users/Dell/Desktop/caption-cam/src/kernel/compositor/SourceRenderer.ts)

### 3. Output Pipeline

The compositor produces two outputs:

| Output | Method | Consumer |
|---|---|---|
| **Preview** | `transferToImageBitmap()` → main thread at ~15fps | Preview `<canvas>` in UI |
| **Stream** | `captureStream()` on the OffscreenCanvas | `MediaRecorder` → IPC → FFmpeg → RTMP |

→ See [Streaming Pipeline](./streaming.md) for FFmpeg configuration

### 4. Grid Layout Compositing

When a scene has a `gridLayout`, sources assigned to grid cells are rendered into their cell bounds instead of their individual transforms:

```
Grid Layout (3×2, gap=8px)
┌──────────┬──────────┬──────────┐
│ Camera   │ Screen   │ Browser  │
│ (cell 0) │ (cell 1) │ (cell 2) │
├──────────┼──────────┼──────────┤
│ Media    │  Empty   │  Image   │
│ (cell 3) │ (cell 4) │ (cell 5) │
└──────────┴──────────┴──────────┘

Each cell's bounds are computed from:
  cellWidth  = (canvasWidth  - gap * (cols - 1)) / cols
  cellHeight = (canvasHeight - gap * (rows - 1)) / rows
  cellX      = col * (cellWidth + gap)
  cellY      = row * (cellHeight + gap)
```

→ See [Grid Sections](../webapp/components/grid-sections.md) for the UI side
→ See [Layout System](../webapp/features/layout-system.md) for layout templates

## Source Types

The compositor supports all defined source types:

| Source Type | Frame Source | Rendering Method |
|---|---|---|
| `camera` | `HTMLVideoElement` → `createImageBitmap` | Textured quad |
| `screen_capture` | `HTMLVideoElement` (screen) → `createImageBitmap` | Textured quad |
| `window_capture` | `HTMLVideoElement` (window) → `createImageBitmap` | Textured quad |
| `image` | One-time `fetch` → `createImageBitmap` | Textured quad |
| `media` | `HTMLVideoElement` → `createImageBitmap` | Textured quad |
| `browser` | Hidden `<canvas>` capture (V1: limited) | Textured quad |
| `text` | OffscreenCanvas 2D → `transferToImageBitmap` | Textured quad |
| `color` | Solid color fragment shader | Color quad |
| `group` | Renders children in order | N/A |
| `generated` | Hidden `<canvas>` capture | Textured quad |
| `caption` | Pre-rendered caption text | Textured quad |

→ See [src/types/compositor.ts](file:///c:/Users/Dell/Desktop/caption-cam/src/types/compositor.ts) for type definitions

## Transition System

The `TransitionRenderer` provides 10 GPU-accelerated transition types:

| Type | Shader Enum | Description |
|---|---|---|
| `cut` | 0 | Instant switch |
| `fade` | 1 | Linear crossfade |
| `slide_left` | 2 | New scene slides from right |
| `slide_right` | 3 | New scene slides from left |
| `slide_up` | 4 | New scene slides from bottom |
| `slide_down` | 5 | New scene slides from top |
| `wipe_left` | 6 | Hard edge wipe |
| `wipe_right` | 7 | Hard edge wipe |
| `zoom` | 8 | Outgoing zooms out + fade |
| `blur` | 9 | Outgoing blurs + fade |

Transitions work by rendering both scenes to separate FBOs and blending them:

```
Scene A → FBO A ─┐
                  ├── Transition Shader (u_progress) → Output
Scene B → FBO B ─┘
```

→ Source: [TransitionRenderer.ts](file:///c:/Users/Dell/Desktop/caption-cam/src/kernel/compositor/TransitionRenderer.ts)

## Filter Pipeline

Per-source filters are applied as FBO render passes:

```
Source Texture → [Color Correction] → [Chroma Key] → ... → Final Texture
                      FBO 0               FBO 1
```

Available filters:
- **Color Correction** — brightness, contrast, saturation, hue shift, gamma
- **Chroma Key** — green/blue screen removal with similarity + smoothness controls

→ Source: [FilterPipeline.ts](file:///c:/Users/Dell/Desktop/caption-cam/src/kernel/compositor/FilterPipeline.ts)

## Integration Points

### Stores
- [sceneCollection.store](file:///c:/Users/Dell/Desktop/caption-cam/src/stores/sceneCollection.store.ts) — Scene & source state
→ See [State Management](../architecture/state-management.md)

### Hooks
- [useCompositeStream](file:///c:/Users/Dell/Desktop/caption-cam/src/features/stream/hooks/useCompositeStream.ts) — Bridge lifecycle management
- [useCompositorPreview](file:///c:/Users/Dell/Desktop/caption-cam/src/features/canvas/hooks/useCompositorPreview.ts) — Preview display
- [useCompositorSync](file:///c:/Users/Dell/Desktop/caption-cam/src/features/canvas/hooks/useCompositorSync.ts) — Legacy scene → compositor store sync

### Source Model (Phase 2)
- [sourceFactory.ts](file:///c:/Users/Dell/Desktop/caption-cam/src/features/canvas/model/sourceFactory.ts) — Factory functions for creating sources
- [legacySceneAdapter.ts](file:///c:/Users/Dell/Desktop/caption-cam/src/features/canvas/model/legacySceneAdapter.ts) — SceneState ↔ CompositorScene conversion

### Legacy Bridge Flow

Existing UI components continue to modify the legacy `SceneState` (via `useSceneManager`). The `useCompositorSync` hook watches those changes and pushes them to `sceneCollection.store`, which the compositor bridge reads from:

```
UI Action (drag overlay, change filter, etc.)
    │
    ▼
useSceneManager.updateActiveScene()  →  SceneState updated
    │
    ▼
useCompositorSync (watches SceneState)
    │
    ▼
legacySceneAdapter.legacySceneToCompositorScene()
    │  • Flat overlay arrays → hierarchical CompositorSource[]
    │  • Percentage positions → absolute pixels (1920×1080)
    │  • Camera effects → filter chains
    │  • Canvas layouts → GridLayout
    │
    ▼
sceneCollection.store.setCollection()  →  Zustand update
    │
    ▼
useCompositeStream (subscribes to store)
    │
    ▼
CompositorBridge.updateScene()  →  postMessage to Worker
    │
    ▼
CompositorWorker renders frame
```

→ See [useEditorOrchestrator](file:///c:/Users/Dell/Desktop/caption-cam/src/pages/Index/hooks/useEditorOrchestrator.ts) for where useCompositorSync is called

### Related Docs
→ See [Canvas System](../webapp/features/canvas-system.md) for the UI editing layer
→ See [Scene Management](../webapp/features/scene-management.md) for scene CRUD
→ See [Streaming Pipeline](./streaming.md) for FFmpeg output
→ See [OBS Compositor](./obs-compositor.md) for import/export (planned)
