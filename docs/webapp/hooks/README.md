# Custom Hooks

→ Back to [Index](../../INDEX.md) | [Web App](../README.md)

---

## Overview

Custom hooks live in `src/hooks/` (global) and `src/features/*/hooks/` (feature-scoped). They encapsulate reusable business logic, side effects, and state management.

→ See [Hooks Reference](./hooks-reference.md) for the complete API reference.

## Categories

### Media & Input Hooks
Manage camera, microphone, and screen capture:
- `useAutoFraming` — MediaPipe face tracking
- `useCameraEffects` — Background blur/replacement
- `usePictureInPicture` — Custom PiP implementation
- `useRemotePeer` — WebRTC phone camera

### Canvas & Interaction Hooks
Handle canvas manipulation and element interaction:
- `useSnapGuides` — Smart alignment guides
- `useLayerControls` — Z-ordering and layer management
- `useTransformMatrix` — Pan/zoom CSS transforms
- `usePredictiveSmoothing` — Drag inertia
- `usePointerInteraction` — Advanced pointer handling
- `usePipGestures` — PiP touch/mouse gestures
- `useCursorFeedback` — Visual cursor feedback

### Style & Preset Hooks
Load and apply visual styles:
- `useAnimeStyles` — Anime.js style integration
- `useCaptionPresets` — Caption preset loading
- `usePresetTemplates` — Template loading
- `useTextDesigns` — Text design presets
- `useFilters` — CSS filter management
- `usePublicPresets` — Firebase community presets

### Scene & Navigation Hooks
Manage scenes and navigation:
- `useSceneCompositor` — Scene composition logic
- `useSubsceneTransition` — Sub-scene transition handling
- `useKeyboardShortcuts` — Global keyboard shortcuts
