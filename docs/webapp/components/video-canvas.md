# VideoCanvas Component

→ Back to [Index](../../INDEX.md) | [Components](./README.md)

---

## Overview

`VideoCanvas` is the **most complex and critical component** in the entire application. It renders a single scene, including the camera/screen layout, all draggable overlays, captions, and the AI command interface. It also manages scene transition animations and the speech-to-text lifecycle.

**Approximate size:** ~1000 LOC  
**Side effects:** ResizeObserver, requestAnimationFrame, setTimeout, MediaRecorder, global mouse/keyboard listeners

## Responsibilities

1. **Camera/Screen rendering** — Delegates to `CameraRenderer` for WebGL-processed video
2. **Layout management** — Solo, Split, PiP arrangements with dynamic splitter
3. **Overlay rendering** — Maps over scene overlays and renders `Draggable*` components
4. **Caption management** — Manages Deepgram STT lifecycle and renders `CaptionRenderer`
5. **AI command interface** — Renders `AICommandPopover` and handles voice commands
6. **Scene transitions** — CSS animation during scene switches
7. **Viewport management** — Pan/zoom transformations

## Key Local State

| State | Type | Purpose |
|---|---|---|
| `containerSize` | `{width, height}` | Canvas dimensions (ResizeObserver) |
| `fullTranscript` | `string` | Confirmed Deepgram transcription |
| `interimTranscript` | `string` | Real-time Deepgram preview |
| `audioStreamForSpeech` | `MediaStream` | Dedicated audio stream for STT |
| `viewport` | `{x, y, zoom}` | Pan/zoom state |
| `isPanning` | `boolean` | Spacebar+drag state |
| `dynamicSplitRatio` | `number` | Split layout ratio |
| `dynamicPipPosition` | `{x, y}` | PiP camera position |
| `dynamicPipSize` | `{w, h}` | PiP camera size |

## Hooks Used

| Hook | Purpose |
|---|---|
| `useDeepgramSpeech` | Live speech-to-text |
| `useVideoStreams` | Camera/screen MediaStream management |
| `useOnClickOutside` | Deselect on outside click |
| `useTransformMatrix` | Pan/zoom CSS transforms |
| `useSnapGuides` | Alignment guides during drag |

## Rendering Structure

```tsx
<div className="video-canvas-container" ref={containerRef}>
  {/* Viewport wrapper (pan + zoom) */}
  <div style={{ transform: `matrix(...)` }}>
    
    {/* Camera/Screen Layout */}
    {renderContent()}  // Solo | Split | PiP | Canvas-only
    
    {/* Draggable Overlays */}
    {scene.activeOverlays.map(o => <DraggableOverlay />)}
    {scene.textOverlays.map(o => <DraggableTextOverlay />)}
    {scene.fileOverlays.map(o => <DraggableFileViewer />)}
    {scene.browserOverlays.map(o => <DraggableBrowser />)}
    
    {/* Captions */}
    {captionsEnabled && <CaptionRenderer />}
    
    {/* AI Interface */}
    <AICommandPopover />
    
  </div>
  
  {/* Snap guides (outside viewport transform) */}
  {snapGuides.map(guide => <div className="snap-guide" />)}
</div>
```

## Exports

| Export | Purpose |
|---|---|
| `VideoCanvas` | Main component |
| `DraggableOverlay` | AI overlay wrapper (Rnd + controls) |
| `HtmlOverlayRenderer` | Sandboxed iframe for AI HTML |

## Performance Considerations

- **ResizeObserver** tracks container size changes
- **requestAnimationFrame** drives camera rendering
- Multiple `useEffect` hooks manage async subscriptions (Deepgram, audio streams)
- During scene transitions, **two instances** render simultaneously
- Global mouse/keyboard listeners are added/removed on mount/unmount

> ⚠️ This component is the primary candidate for decomposition. It manages too many concerns and should be split into smaller sub-components.

→ See [Canvas System](../features/canvas-system.md) for the rendering pipeline  
→ See [Caption System](../features/caption-system.md) for STT integration  
→ See [Draggable Elements](../features/draggable-elements.md) for overlay components
