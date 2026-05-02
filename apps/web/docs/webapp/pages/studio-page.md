# Studio Page (Index.tsx)

→ Back to [Index](../../INDEX.md) | [Pages](./README.md)

---

→ Source: [Index.tsx](file:///c:/Users/Dell/Desktop/gaki/src/pages/Index.tsx)

## Overview

The studio page (`/`) is the **heart of the application**. It orchestrates all scene management, overlay handling, recording, and renders the main workspace. This is the page users see when they open the app.

## Architecture

`Index.tsx` acts as the **page-level orchestrator** — it connects Zustand stores, feature modules, and hooks, then renders the workspace layout.

```
Index.tsx (orchestrator)
├── Zustand stores (scene, media, stream, ui, canvas)
├── Feature hooks (useKeyboardShortcuts, useLayerControls, etc.)
│
├── Renders:
│   ├── VideoCanvas (the main stage — one or two during transitions)
│   ├── SceneTabs (right panel — scene management)
│   ├── BottomNavigation (control bar)
│   ├── FloatingControlsPanel (settings sidebar)
│   ├── SavedSessionsPanel (session library)
│   ├── ExcalidrawOverlay (drawing canvas)
│   └── DebugPanel (AI debugging)
```

## Responsibilities

### Scene Management
- Manages `scenes: SceneState[]` array (all scenes and their overlays)
- Handles `activeSceneId` selection
- Delegates to `useSceneStore` for reactive state
- Scene transitions with cross-fade rendering of two `VideoCanvas` instances

### Overlay Orchestration
- Adding/removing overlays (text, browser, file, AI-generated)
- Drag-drop file handling (global `window.onDrop`)
- Paste URL handling (global `window.onPaste`)
- Keyboard shortcut `/` to open browser overlay

### Recording Integration
- Controls recording start/stop via `useStreamStore`
- Captures keyframe snapshots during recording
- Navigates to editor on recording complete

### AI Processing
- Receives AI commands from `AICommandPopover` or voice
- Calls `processCommandWithAgent()` / `updateOverlay()`
- Adds generated overlays to scene state

## Sub-Components Directory

```
src/pages/Index/
├── components/          — Studio-specific UI components
│   ├── (workspace layout components)
│   └── (studio-specific overlays)
├── hooks/               — Studio-specific hooks
│   ├── (scene management hooks)
│   └── (overlay management hooks)
└── utils/               — Studio-specific utilities
```

## Key Event Handlers

| Event | Handler | Action |
|---|---|---|
| `window.ondrop` | `handleDrop` | Add dropped files as FileOverlays |
| `window.ondragover` | — | Prevent default (allows dropping) |
| `window.onpaste` | `handlePaste` | Add files or URLs from clipboard |
| `window.onkeydown /` | — | Open browser overlay at Google |
| `window.onkeydown Escape` | — | Delete selected browser |

## Related Documents

→ [Scene Management](../features/scene-management.md) — Multi-scene handling  
→ [Canvas System](../features/canvas-system.md) — Canvas rendering  
→ [Video Canvas Component](../components/video-canvas.md) — Core stage component  
→ [Bottom Navigation](../components/bottom-navigation.md) — Control bar  
→ [State Management](../../architecture/state-management.md) — Zustand stores
