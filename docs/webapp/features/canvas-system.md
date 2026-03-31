# Canvas System

→ Back to [Index](../../INDEX.md) | [Features](./README.md)

---

## Overview

The canvas system is the **core rendering engine**. It composites camera feeds, screen shares, overlays, captions, and effects into a single WYSIWYG canvas that can be streamed, recorded, or exported.

## Compositor Pipeline (New)

The canvas system now uses a **dual-layer architecture**:

| Layer | Purpose | Thread |
|---|---|---|
| **Editing Layer** (React DOM) | Interactive overlays, drag handles, snap guides, toolbars | Main thread |
| **Compositing Layer** (WebGL) | GPU-accelerated source rendering for stream/recording output | Web Worker |

The editing layer is what the user interacts with. The compositing layer produces the actual video output that goes to FFmpeg for streaming/recording.

```
Editing Layer (React DOM — what the user sees & interacts with)
    │
    ├── CanvasView.tsx (interactive overlays + drag/resize)
    ├── sceneCollection.store (source transforms, settings)
    │
    ▼
Compositing Layer (WebGL Worker — what gets streamed)
    │
    ├── CompositorBridge → CompositorWorker (OffscreenCanvas)
    ├── SourceRenderer (textured quads per source)
    ├── FilterPipeline (GLSL filter passes)
    ├── TransitionRenderer (scene transitions)
    │
    ▼
MediaStream → FFmpeg → RTMP / File
```

→ See [Compositor Architecture](../../electron/compositor.md) for the full GPU pipeline
→ See [sceneCollection.store](file:///c:/Users/Dell/Desktop/caption-cam/src/stores/sceneCollection.store.ts) for scene state

---

## Architecture (Editing Layer)

```
┌─────────────────────────────────────────────────────┐
│                   VideoCanvas.tsx                     │
│  (The Stage — renders one scene)                     │
│                                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │  Viewport (pan + zoom via useTransformMatrix)│    │
│  │                                               │    │
│  │  ┌───────────────────────────────────────┐   │    │
│  │  │  Camera Layer                          │   │    │
│  │  │  CameraRenderer → GLRenderer (WebGL)   │   │    │
│  │  │  + CSS filters + auto-framing          │   │    │
│  │  └───────────────────────────────────────┘   │    │
│  │                                               │    │
│  │  ┌───────────────────────────────────────┐   │    │
│  │  │  Overlay Layer (z-indexed)             │   │    │
│  │  │  DraggableOverlay (AI HTML)            │   │    │
│  │  │  DraggableTextOverlay (rich text)      │   │    │
│  │  │  DraggableBrowser (iframe)             │   │    │
│  │  │  DraggableFileViewer (media)           │   │    │
│  │  │  DraggableGraph (recharts)             │   │    │
│  │  │  DraggableAmbientEffect (particles)    │   │    │
│  │  │  ExcalidrawOverlay (drawing)           │   │    │
│  │  └───────────────────────────────────────┘   │    │
│  │                                               │    │
│  │  ┌───────────────────────────────────────┐   │    │
│  │  │  Caption Layer                         │   │    │
│  │  │  CaptionRenderer (animated text)       │   │    │
│  │  └───────────────────────────────────────┘   │    │
│  │                                               │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

## Feature Module

```
src/features/canvas/
├── hooks/
│   └── (useCanvasCompositor, etc.)
├── model/
│   └── (canvas data models)
├── ui/
│   └── (canvas-specific UI components)
├── workers/
│   └── (Web Workers for offscreen processing)
└── index.ts
```

## WebGL Rendering Engine (Kernel)

The kernel provides a custom WebGL 2.0 rendering pipeline for video effects:

```
src/kernel/engine/
├── GLRenderer.ts       — Main renderer: manages render loop & compositing
├── GLContext.ts         — WebGL 2.0 context creation & management
├── ShaderManager.ts    — Compiles, caches, and applies GLSL programs
├── VideoTexture.ts     — Uploads video frames as WebGL textures
├── TimeWarp.ts         — Time-based shader effects (speed, reverse, etc.)
├── EventBus.ts         — Pub/sub for renderer events
├── webgl.ts            — WebGL utility functions
├── utils.ts            — Math & conversion utilities
└── shaders/            — GLSL vertex & fragment shaders
```

### Shader Pipeline
```
Video Frame → VideoTexture (GPU upload)
    │
    ▼
GLRenderer.render()
    │
    ├── Apply vertex shader (position, UV mapping)
    ├── Apply fragment shader (per-pixel effects)
    │   ├── Neon Edge (Sobel edge detection)
    │   ├── Hologram (scan lines + color shift)
    │   ├── VHS (noise + tracking lines)
    │   ├── Cyberpunk (color grading + glitch)
    │   └── Custom shaders via ShaderManager
    │
    ▼
WebGL canvas output → displayed in CameraRenderer
```

## Camera Effects

### CSS Filters (`src/lib/filters.ts`)
50+ CSS filter presets applied via `filter` CSS property:
- Vintage, Noir, Sepia, High Contrast
- Cyberpunk, Hologram, Neon
- Color tinting, brightness, saturation adjustments

### WebGL Filters (`src/lib/filterRenderer.ts`)
GPU-accelerated effects computed per-frame:
- Neon Edge Detection (Sobel operator)
- Color space transformations
- Custom shader effects

### Auto-Framing (`src/hooks/useAutoFraming.ts`)
MediaPipe Face Detection tracks face position and smoothly adjusts the camera crop to keep the face centered.

### Background Effects (`src/hooks/useCameraEffects.ts`)
MediaPipe Selfie Segmentation separates person from background:
- **Blur:** Gaussian blur on background only
- **Image:** Replace background with custom image
- **None:** No segmentation

## Viewport & Interaction

### Pan & Zoom
- **Pan:** Hold Spacebar + drag (or middle mouse button)
- **Zoom:** Mouse wheel (with sensitivity control)
- Managed by `useTransformMatrix` hook
- Stored in `useCanvasStore` (zoom, panX, panY)

### Snap Guides (`src/hooks/useSnapGuides.ts`)
When dragging elements, alignment guides appear:
- Center alignment (horizontal and vertical)
- Edge alignment with canvas boundaries
- Alignment with other elements
- Configurable snap distance threshold

### Drag & Resize
All elements use `react-rnd` for:
- Drag with position tracking
- 8-direction resize handles
- Percentage-based positioning (for responsive scaling)
- `onDragStop` and `onResizeStop` callbacks update scene state

### Predictive Smoothing (`src/hooks/usePredictiveSmoothing.ts`)
Smooths drag operations with inertia for a more natural feel.

## Layout System

### Layout Modes
| Mode | Description |
|---|---|
| Solo | Camera only |
| Split Horizontal | Camera + content side by side |
| Split Vertical | Camera + content stacked |
| PiP (Picture-in-Picture) | Camera in corner over content |
| Canvas Only | No camera, blank canvas |

### Dynamic Layouts
Any overlay can trigger a "dynamic layout" that splits the screen, placing the overlay on one side and the camera on the other.

→ See [Draggable Elements](./draggable-elements.md) for overlay components  
→ See [Scene Management](./scene-management.md) for multi-scene handling
