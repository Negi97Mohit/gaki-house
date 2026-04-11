# Type System

→ Back to [Index](../../INDEX.md) | [Web App](../README.md)

---

→ See [Types Reference](./types-reference.md) for the complete type reference.

## Overview

TypeScript types live in `src/types/` and define the data model for the entire application.

| File | Domain | Key Types |
|---|---|---|
| `caption.ts` | Core scene model | `SceneState`, `CaptionStyle`, `GeneratedOverlay`, `TextOverlayState`, `FileOverlayState`, `BrowserOverlayState`, `SceneTransition` |
| `videoCanvas.ts` | Canvas rendering | `VideoCanvasProps`, `LayoutMode`, `CameraShape` |
| `editor.ts` | Recording/playback | `RecordingSession`, `ComponentTrack`, `Keyframe` |
| `layout.ts` | Layout system | Layout types |
| `streamStyle.ts` | Stream designs | Stream style types |
| `omegle.ts` | Random chat | Omegle/chat types |
| `vault.ts` | Asset vault | Vault asset types |
| `banner.ts` | Banners | Banner types |
| `socialBanner.ts` | Social banners | Social banner types |
| `animatedBanner.ts` | Animated banners | Animated banner types |
| `animation.ts` | Animation system | Animation types |
| `textDesign.ts` | Text designs | Text design preset types |
| `canvasPreset.ts` | Canvas presets | Canvas preset types |
| `layoutPreset.ts` | Layout presets | Layout preset types |
| `ai.ts` | AI engine | AI-related types |
