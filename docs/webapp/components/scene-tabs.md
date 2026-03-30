# Scene Tabs

→ Back to [Index](../../INDEX.md) | [Components](./README.md)

---

## Overview

`SceneTabs` is the **vertical panel on the right side** of the studio workspace for managing scenes. It has a cyberpunk-inspired design and supports full scene CRUD operations.

## Features

| Feature | Interaction | Implementation |
|---|---|---|
| **View scenes** | Scene list with thumbnails | Rendered from `scenes[]` array |
| **Select scene** | Click scene tab | `onSceneSelect(id)` callback |
| **Add scene** | Click "+" button | Creates new `SceneState` with defaults |
| **Delete scene** | Click delete icon | Removes from array (min 1 scene) |
| **Rename** | Double-click name | Inline `<input>` appears, saves on blur/enter |
| **Reorder** | Drag and drop | `onDragStart/onDragOver/onDrop` handlers |
| **Transitions** | Click between-scene arrow | Opens `TransitionPopover` |

## Drag-and-Drop Reordering

```
onDragStart → store draggedIndex
onDragOver → update dragOverIndex (visual feedback)
onDrop → reorder scenes array
```

State tracked:
- `draggedIndex: number | null`
- `dragOverIndex: number | null`

## Scroll Management

For many scenes, the panel scrolls vertically with:
- Auto-scroll buttons (top/bottom) that appear when content overflows
- `showTopScroll` / `showBottomScroll` states
- Scroll/resize event listeners manage button visibility

## Transition Integration

Between each pair of scenes, a small transition indicator appears. Clicking it opens the `TransitionPopover` for configuring the transition type, duration, easing, and blend mode.

→ See [Scene Management](../features/scene-management.md) for multi-scene logic  
→ See [Studio Page](../pages/studio-page.md) for integration context
