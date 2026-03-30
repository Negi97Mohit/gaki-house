# Scene Management

→ Back to [Index](../../INDEX.md) | [Features](./README.md)

---

## Overview

GAKI Studio supports **multi-scene production** — users can create multiple scenes, each with independent overlays, camera settings, filters, and captions. Scenes can be switched with animated transitions.

## Scene Data Model

```typescript
// src/types/caption.ts
interface SceneState {
  id: string;
  name: string;

  // Overlays
  activeOverlays: GeneratedOverlay[];      // AI-generated HTML
  textOverlays: TextOverlayState[];        // Rich text elements
  fileOverlays: FileOverlayState[];        // Images, videos, PDFs
  browserOverlays: BrowserOverlayState[];  // Embedded web pages

  // Visual settings
  videoFilter: string | undefined;
  backgroundEffect: 'none' | 'blur' | 'image';
  backgroundImageUrl: string | undefined;
  blankCanvasColor: string;

  // Caption settings
  captionStyle: CaptionStyle;
  dynamicStyle: string;                    // Animation style name
  captionsEnabled: boolean;

  // Camera settings
  layoutMode: LayoutMode;
  cameraShape: CameraShape;
  pipPosition: { x: number; y: number };
  pipSize: { width: number; height: number };
  splitRatio: number;

  // Effects
  isNeonEdgeEnabled: boolean;
  isAutoFramingEnabled: boolean;
  activeInteractiveFilter: string;
  // ... more per-scene settings
}
```

## Scene Lifecycle

### Create
```
User clicks "+" in SceneTabs
    → New SceneState created with defaults
    → Appended to scenes array
    → Automatically selected as active
```

### Switch
```
User clicks scene in SceneTabs
    → activeSceneId updated
    → If transition defined:
        → VideoCanvas renders TWO scenes (current + next)
        → Transition animation plays (CSS keyframes)
        → After duration, old scene removed
    → All stores sync to new scene's state
```

### Delete
```
User clicks delete on scene tab
    → Scene removed from array
    → If it was active, switch to first remaining scene
    → Minimum 1 scene always exists
```

### Reorder
```
User drags scene in SceneTabs (drag-and-drop)
    → draggedIndex and dragOverIndex tracked
    → On drop, array is reordered
```

### Rename
```
User double-clicks scene name in SceneTabs
    → Inline text input appears
    → On blur/enter, name saved
```

## Scene Transitions

```typescript
interface SceneTransition {
  type: 'dissolve' | 'slide-left' | 'slide-right' | 'slide-up' | 'slide-down' |
        'wipe-left' | 'wipe-right' | 'zoom' | 'fade' | 'blur';
  duration: number;      // milliseconds
  easeIn: string;        // CSS easing function
  easeOut: string;
  blendMode?: string;    // CSS mix-blend-mode
}
```

During a transition:
1. `isTransitioning = true`
2. Two `VideoCanvas` instances render simultaneously
3. CSS animations handle the visual transition
4. Keyframe animations defined in `src/index.css`
5. After `duration` ms, transition completes

→ Source: `src/features/stream/transitions/`

## Undo/Redo

The scene store tracks `canUndo` and `canRedo` flags. The undo system captures scene state snapshots and allows reverting changes.

Managed via `useSceneStore`:
```typescript
triggerUndo: () => void;
triggerRedo: () => void;
triggerReset: () => void;
```

## Store Integration

Scene state is managed across two levels:
1. **`useSceneStore` (Zustand)** — Real-time reactive state for the active scene
2. **`scenes[]` array in Index.tsx** — Full scene collection (all scenes)

When the active scene changes, `useSceneStore` is synced with the new scene's data.

→ See [State Management](../../architecture/state-management.md) for store details  
→ See [Canvas System](./canvas-system.md) for rendering  
→ See [Studio Page](../pages/studio-page.md) for orchestration
