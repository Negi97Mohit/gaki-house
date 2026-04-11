# Draggable Elements

→ Back to [Index](../../INDEX.md) | [Features](./README.md)

---

## Overview

All canvas elements are **draggable and resizable** using `react-rnd`. Users can position, resize, rotate, and layer overlays in a WYSIWYG manner.

## Element Types

### DraggableOverlay (AI-Generated HTML)
- **Source:** VideoCanvas.tsx → `DraggableOverlay` + `HtmlOverlayRenderer`
- **Content:** Sandboxed `<iframe srcdoc={html}>` with AI-generated HTML/CSS/JS
- **Features:** Drag, resize, rotate, delete, z-ordering
- **Data type:** `GeneratedOverlay`

### DraggableTextOverlay (Rich Text)
- **Source:** `DraggableTextOverlay.tsx`
- **Content:** `contentEditable` div with rich text formatting
- **Toolbar:** `TextEditingToolbar` appears on selection (bold, italic, font, color, lists)
- **Features:** Drag, resize, rotate, inline editing, design presets
- **Data type:** `TextOverlayState`
- **Note:** Uses deprecated `document.execCommand()` for formatting

### DraggableBrowser (Web Pages)
- **Source:** `DraggableBrowser.tsx`
- **Content:** Live `<iframe>` with URL bar and navigation controls
- **Features:** URL editing, forward/back/reload, drag, resize
- **Layout integration:** `DynamicLayoutPicker` for split-screen
- **Data type:** `BrowserOverlayState`

### DraggableFileViewer (Media Files)
- **Source:** `DraggableFileViewer.tsx` + `FileRenderer`
- **Content:** Images, videos, audio, PDFs, text files
- **Format support:**
  | Type | Renderer |
  |---|---|
  | Image | `<img>` tag |
  | Video | `<video>` with controls, buffering indicator |
  | Audio | `<audio>` player |
  | PDF | `<iframe>` |
  | Text | `<pre>` with file.text() |
- **Data type:** `FileOverlayState`

### DraggableGraph (Charts)
- **Source:** `DraggableGraph.tsx`
- **Content:** Recharts-based charts (bar, line, pie)
- **Features:** Custom drag/resize logic (not using `react-rnd`)
- **Data type:** `GraphOverlayState`
- **Note:** Uses manual mouse listeners for drag, which can be buggy

### DraggableAmbientEffect (Particles)
- **Source:** `DraggableAmbientEffect.tsx` + `AmbientEffectsOverlay.tsx`
- **Content:** Canvas-based particle effects (snow, rain, fire, sparkles)
- **Features:** Constrains particles to drag area, resize
- **Rendering:** `requestAnimationFrame` loop with particle physics

### ExcalidrawOverlay (Drawing)
- **Source:** `ExcalidrawOverlay.tsx`
- **Content:** Full Excalidraw drawing editor
- **Features:** Drag, resize, maximize/minimize, background color
- **Integration:** `@excalidraw/excalidraw` React component

## Common Patterns

### Percentage-Based Positioning
All elements store position/size as percentages of the canvas:

```typescript
interface Position {
  x: number;  // 0-100 percentage
  y: number;
}
interface Size {
  width: number;   // 0-100 percentage
  height: number;
}
```

On `onDragStop` and `onResizeStop`, pixel values are converted to percentages:
```typescript
const newX = (d.x / containerWidth) * 100;
const newY = (d.y / containerHeight) * 100;
```

### Selection State
Each element type has a selection state in `useSceneStore`:
- `selectedBrowserId`, `selectedFileId`, `selectedTextId`, `selectedGeneratedId`
- `deselectAll()` clears all selections

### Rotation
Text overlays and AI overlays support rotation:
- Rotation handle at the bottom of the element
- Global `mousemove`/`mouseup` listeners calculate angle
- Stored as degrees in the overlay state

### Layer Ordering
Managed by `useLayerControls` hook:
- Bring to front, send to back
- Layer up, layer down
- Z-index managed via `src/lib/zIndex.ts`

→ See [Canvas System](./canvas-system.md) for the rendering context  
→ See [Hooks Reference](../hooks/hooks-reference.md) for drag/interaction hooks
