# Canvas Internals — Rendering, Layers & Toolbars

→ Back to [Index](../../INDEX.md) | [Web App](../README.md) | [Components](./README.md)

---

## Overview

The canvas rendering system is composed of ~30 files in `src/features/canvas/ui/` that handle everything from WebGL camera rendering to draggable overlays to snap guides. This document covers the internal architecture.

---

## File Map

```
src/features/canvas/ui/
├── CanvasView.tsx              (32KB) — Primary canvas viewport
├── CanvasContent.tsx           (9.4KB) — Content renderer within viewport
├── CanvasHoverToolbar.tsx      (30KB) — Hover toolbar for element manipulation
│
├── VideoCanvasCamera.tsx       (11KB) — Camera feed renderer
├── VideoCanvasSplitLayout.tsx  (7.8KB) — Split-screen layout handler
├── CameraOpacityOverlay.tsx    (2.5KB) — Camera opacity control
├── ScreenShareView.tsx         (5.6KB) — Screen share display
├── PipWindow.tsx               (8.9KB) — Picture-in-Picture camera window
│
├── OverlayLayer.tsx            (15KB) — Overlay rendering orchestrator
├── HybridDraggable.tsx         (23KB) — Universal drag/resize wrapper
├── SmartDraggable.tsx          (8.4KB) — Smart drag with constraints
├── UniversalOverlayWrapper.tsx (3.7KB) — Common overlay chrome
│
├── DraggableHtmlOverlay.tsx    (8.1KB) — AI-generated HTML overlay
├── DraggableFileViewer.tsx     (27KB) — Media file viewer (image/video/audio/PDF)
├── DraggableBrowser.tsx        (6.5KB) — Embedded browser iframe
├── DraggableTextOverlay.tsx    (11KB) — Rich text overlay
├── MultiLayerTextRenderer.tsx  (16KB) — Multi-effect text rendering
│
├── CaptionRenderer.tsx         (2.9KB) — Live caption display
├── HtmlOverlayRenderer.tsx     (2.7KB) — Sandboxed iframe for AI HTML
├── DynamicContentRenderer.tsx  (3.5KB) — Dynamic content display
├── ForegroundUserLayer.tsx     (4.6KB) — Foreground user elements
│
├── ExcalidrawOverlay.tsx       (10KB) — Excalidraw drawing canvas
├── ThreeDGSViewer.tsx          (6.4KB) — Three.js 3D Gaussian splat viewer
├── VideoPlayer.tsx             (780B) — Embedded video player
│
├── TextEditingToolbar.tsx      (6.2KB) — Rich text editing toolbar
├── OpacityToolbar.tsx          (7.3KB) — Element opacity controls
├── PanelOpacityToolbar.tsx     (9.2KB) — Panel-level opacity controls
│
├── SnapGuideLine.tsx           (2.1KB) — Individual snap guide line
├── SnapLines.tsx               (1.3KB) — Snap lines container
└── VideoCanvasHelpers.ts       (2.5KB) — Canvas utility functions
```

---

## CanvasView (32KB)
**The primary canvas viewport.** This is the actual rendered stage area.

**Responsibilities:**
- Manages the viewport transform (pan, zoom via CSS transforms)
- Handles spacebar + drag panning
- Mouse wheel zoom (centered on cursor)
- Renders background (solid color, image, or blur)
- Hosts the overlay layer and caption layer
- Manages the canvas capture stream for recording/streaming

**Key state:**
- `viewportTransform` — CSS `matrix()` for pan/zoom
- `isPanning` — Whether spacebar+drag is active
- `canvasRef` — `<div>` ref used for `captureStream()`

---

## CanvasContent (9.4KB)
Renders the actual content within the viewport — camera, screen share, or blank canvas.

---

## CanvasHoverToolbar (30KB)
**A context-aware toolbar that appears when an element is selected or hovered.**

**Capabilities:**
- **Delete** — Remove the selected element
- **Duplicate** — Clone the element with offset position
- **Lock/Unlock** — Lock element position (prevents dragging)
- **Visibility** — Toggle element visibility
- **Layer controls** — Bring to front, send to back, move up/down
- **Opacity** — Slider to adjust element transparency
- **Crop** — Image cropping (for file overlays)
- **Rotate** — Rotation handle
- **Flip** — Horizontal/vertical flip
- **Effects** — Apply visual effects to individual elements
- **Edit** — Open element-specific editor (text editing, URL changing)
- **Size presets** — Quick resize to predefined dimensions
- **Aspect ratio lock** — Maintain proportions during resize

**Design:** Glassmorphism floating bar with icon buttons, positioned above the selected element.

---

## OverlayLayer (15KB)
**Orchestrates the rendering of all overlays within the canvas.**

Maps over overlay arrays and renders the appropriate draggable component for each:
```
activeOverlays    → DraggableHtmlOverlay
textOverlays      → DraggableTextOverlay
fileOverlays      → DraggableFileViewer
browserOverlays   → DraggableBrowser
```

Handles z-index ordering across all overlay types.

---

## HybridDraggable (23KB)
**Universal drag-and-resize wrapper** that replaces raw `react-rnd` usage.

**Features:**
- Percentage-based positioning (responsive)
- Snap guides integration
- Min/max size constraints
- Aspect ratio locking
- Custom drag handles
- Touch support
- `onDragStart/onDrag/onDragStop` callbacks
- `onResizeStart/onResize/onResizeStop` callbacks

---

## DraggableFileViewer (27KB)
**The most complex draggable element.** Handles all media types:

| Media Type | Renderer | Features |
|---|---|---|
| **Image** | `<img>` | Crop, filters, opacity, rotation |
| **Video** | `<video>` | Play/pause, volume, seek, buffering indicator, loop |
| **Audio** | `<audio>` player | Waveform display, transport controls |
| **PDF** | `<iframe>` | Page navigation, zoom |
| **Text** | `<pre>` | File.text() rendering |

**Video-specific features:**
- Play/pause overlay button
- Volume slider
- Progress bar with seek
- Buffering indicator
- Auto-play/loop options
- Aspect ratio preservation

---

## MultiLayerTextRenderer (16KB)
Advanced text rendering with multiple visual effects stacked as layers:
- Base text layer
- Stroke/outline layer
- Shadow layer
- Gradient layer
- Background layer
- Glow/neon effect layer

Each layer renders the same text with different CSS properties, composited together.

---

## ExcalidrawOverlay (10KB)
Embedded Excalidraw drawing canvas:
- Draggable and resizable container
- Maximize/minimize toggle
- Background color control
- `@excalidraw/excalidraw` React component
- Elements persist with the scene state

---

## ThreeDGSViewer (6.4KB)
Three.js-based 3D viewer for Gaussian Splatting (.ply files):
- Uses `@react-three/fiber` and `@react-three/drei`
- OrbitControls for rotation/zoom
- Renders 3D point clouds and splats

---

## TextEditingToolbar (6.2KB)
Rich text formatting toolbar for `DraggableTextOverlay`:

| Control | Implementation |
|---|---|
| Bold | `document.execCommand('bold')` |
| Italic | `document.execCommand('italic')` |
| Underline | `document.execCommand('underline')` |
| Unordered List | `document.execCommand('insertUnorderedList')` |
| Ordered List | `document.execCommand('insertOrderedList')` |
| Font Size | `document.execCommand('fontSize', ...)` |
| Font Color | `document.execCommand('foreColor', ...)` |
| Font Family | `document.execCommand('fontName', ...)` |
| Alignment | `document.execCommand('justify...')` |

> ⚠️ `document.execCommand()` is deprecated. Should migrate to a modern rich text editor.

→ See [Draggable Elements](../features/draggable-elements.md) for overlay types  
→ See [Canvas System](../features/canvas-system.md) for the WebGL rendering pipeline
