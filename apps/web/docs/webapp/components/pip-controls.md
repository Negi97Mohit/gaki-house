# PiP Controls & Camera Menus

→ Back to [Index](../../INDEX.md) | [Web App](../README.md) | [Components](./README.md)

---

## Overview

The Picture-in-Picture (PiP) system provides a **floating camera window** with extensive customization options. The PiP toolbar appears when the camera is in PiP mode and provides access to 6 sub-menus for complete camera control.

## Component Hierarchy

```
PipControlsToolbar.tsx (9.4KB)           — Main PiP toolbar container
├── PipLayoutMenu.tsx (19KB)             — Camera layout & position
├── PipStyleMenu.tsx (13KB)              — Camera visual styling
├── PipEffectsMenu.tsx (7.6KB)           — Camera visual effects
├── PipCinematicMenu.tsx (7.5KB)         — Cinematic camera effects
├── PipBackgroundMenu.tsx (2.9KB)        — Camera background options
├── PipCameraMenu.tsx (1.8KB)            — Camera device selection
├── PipZoomSlider.tsx (3.3KB)            — Manual zoom control
├── CinematicFilters.tsx (4.1KB)         — Cinematic filter presets
└── cinematicShotData.ts (20KB)          — Cinematic effect definitions
```

---

## PipControlsToolbar
→ Source: [PipControlsToolbar.tsx](file:///c:/Users/Dell/Desktop/gaki/src/features/stream/ui/PipControlsToolbar.tsx)

A floating toolbar that appears below or beside the PiP camera window. Renders icon buttons for each sub-menu.

---

## PiP Layout Menu (19KB)
Camera position and layout customization:

| Control | Options |
|---|---|
| **Position presets** | Top-left, top-right, bottom-left, bottom-right, center |
| **Size presets** | Small, medium, large, custom |
| **Camera shape** | Rectangle, circle, rounded rectangle, square |
| **Aspect ratio** | 16:9, 4:3, 1:1, 9:16, custom |
| **Custom position** | X/Y percentage sliders |
| **Custom size** | Width/height percentage sliders |
| **Flip** | Horizontal mirror toggle |

---

## PiP Style Menu (13KB)
Visual decoration of the camera frame:

| Control | Options |
|---|---|
| **Border color** | Color picker (any hex color) |
| **Border width** | Slider (0-20px) |
| **Border radius** | Slider (0-50% — circle at 50%) |
| **Shadow blur** | Slider (0-50px) |
| **Shadow color** | Color picker |
| **Rotation** | Slider (-180° to 180°) |
| **Opacity** | Slider (0-100%) |

---

## PiP Effects Menu (7.6KB)
Real-time visual effects applied to the camera feed:

| Effect | Description | Technology |
|---|---|---|
| **Auto-framing** | AI face tracking & centering | MediaPipe Face Detection |
| **Beautify** | Skin smoothing filter | CSS filter |
| **Low Light** | Brightness & contrast boost | CSS filter |
| **Neon Edge** | Edge detection glow | WebGL Sobel shader |
| **Background blur** | Gaussian blur behind person | MediaPipe Selfie Segmentation |
| **Virtual background** | Replace background with image | MediaPipe Selfie Segmentation |

Each effect has enable/disable toggle and intensity controls.

---

## PiP Cinematic Menu (7.5KB)
Cinematic camera movement effects:

| Effect | Description |
|---|---|
| `dolly-zoom` | Vertigo / Hitchcock zoom (background zooms while subject stays same size) |
| `rack-focus` | Simulated focus pull (blur transition) |
| `dutch-angle` | Tilted camera angle with sway |
| `slow-push` | Gradual slow zoom toward subject |
| `pull-back` | Gradual pull-back zoom |
| `handheld` | Simulated handheld camera shake |
| `orbital` | Slow orbital rotation around center |

Effects are defined in `cinematicShotData.ts` (20KB) with timing curves, keyframe data, and CSS transform calculations.

Canvas-level cinematic CSS styles are in `cinematicCanvasStyles.ts` (3.5KB).

---

## PiP Background Menu (2.9KB)
Camera background options:
- **None** — No background processing
- **Blur** — Background blur behind person
- **Image** — Custom background image (file picker)

---

## PiP Camera Menu (1.8KB)
Camera device selection:
- Lists available video devices from `useMediaStore.videoDevices`
- Click to switch camera
- Shows currently selected device

---

## PiP Zoom Slider (3.3KB)
Manual zoom control:
- Slider (1x to 4x zoom)
- Zoom centered on face (when auto-framing enabled)
- Zoom centered on center (when auto-framing disabled)

→ See [Canvas System](../features/canvas-system.md) for the rendering context  
→ See [State Management](../../architecture/state-management.md#usescenestore) for PiP state fields
