# Hooks Reference

→ Back to [Index](../../INDEX.md) | [Hooks](./README.md)

> Last Updated: 2026-04-03

---

All hooks in `src/hooks/` with their signatures, purpose, and key behaviors.

---

## `useAutoFraming`
**File:** `src/hooks/useAutoFraming.ts` (~6.3KB)

**Purpose:** Uses MediaPipe Face Detection to track the user's face and smoothly adjust the camera crop to keep the face centered.

**Key behavior:**
- Runs face detection on each video frame
- Smoothly interpolates crop position (avoids jerky movement)
- Configurable tracking speed and zoom sensitivity
- Returns crop coordinates for CameraRenderer

**Store integration:** `useSceneStore.isAutoFramingEnabled`, `zoomSensitivity`, `trackingSpeed`

---

## `useCameraEffects`
**File:** `src/hooks/useCameraEffects.ts` (~8KB)

**Purpose:** Implements background blur and virtual backgrounds using MediaPipe Selfie Segmentation.

**Key behavior:**
- Segments person from background per frame
- Three modes: `none`, `blur` (Gaussian), `image` (custom background)
- Outputs a processed `<canvas>` element as a new MediaStream
- Manages segmentation model lifecycle

**Store integration:** `useSceneStore.cameraBackground`, `customBackgroundUrl`

---

## `useKeyboardShortcuts`
**File:** `src/hooks/useKeyboardShortcuts.ts` (~6.7KB)

**Purpose:** Global keyboard shortcuts for the studio workspace.

**Key shortcuts:**
| Key | Action |
|---|---|
| `Space` (hold) | Enable canvas panning |
| `/` | Open browser overlay |
| `Escape` | Deselect / close panels |
| `Delete` | Delete selected element |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` | Redo |
| `Ctrl+S` | Save |
| `F11` | Fullscreen |

---

## `useLayerControls`
**File:** `src/hooks/useLayerControls.ts` (~14.5KB)

**Purpose:** Manages z-ordering and layer operations for all canvas elements.

**Capabilities:**
- Bring to front / send to back
- Layer up / layer down
- Layer ordering across different element types (text, file, browser, AI)
- Maintains consistent z-index stack

**Store integration:** `useSceneStore` for overlay arrays

---

## `useSnapGuides`
**File:** `src/hooks/useSnapGuides.ts` (~8.3KB)

**Purpose:** Provides smart alignment guides when dragging elements on the canvas.

**Key behavior:**
- Calculates snap points (center, edges) for current element vs. all other elements
- Shows visual guide lines when within snap threshold
- Snaps element position to guide
- Configurable snap distance

---

## `usePictureInPicture`
**File:** `src/hooks/usePictureInPicture.ts` (~3.2KB)

**Purpose:** Custom PiP implementation for the camera feed.

**Key behavior:**
- Positions camera feed in corner of canvas
- Supports drag to reposition
- Supports resize
- Handles aspect ratio constraints

---

## `useRemotePeer`
**File:** `src/hooks/useRemotePeer.ts` (~3.3KB)

**Purpose:** Manages WebRTC connection for using a phone as a remote camera.

**Key behavior:**
- Creates PeerJS peer with unique ID
- Generates QR code URL for phone to scan
- On connection, receives phone's camera stream
- Handles reconnection and cleanup

---

## `useSceneCompositor`
**File:** `src/hooks/useSceneCompositor.ts` (~2.4KB)

**Purpose:** Handles scene composition logic for combining multiple layers.

---

## `useTransformMatrix`
**File:** `src/hooks/useTransformMatrix.ts` (~5KB)

**Purpose:** CSS transform matrix calculations for canvas pan/zoom.

**Key behavior:**
- Converts pan/zoom state to CSS `matrix()` transform
- Handles mouse wheel zoom (centered on cursor position)
- Handles spacebar+drag panning
- Returns transform string and event handlers

---

## `usePredictiveSmoothing`
**File:** `src/hooks/usePredictiveSmoothing.ts` (~5KB)

**Purpose:** Smooths drag operations with predictive inertia for a natural feel.

**Key behavior:**
- Anticipates drag direction based on velocity
- Applies smooth easing to position updates
- Reduces perceived latency of drag operations

---

## `usePointerInteraction`
**File:** `src/hooks/usePointerInteraction.ts` (~5.1KB)

**Purpose:** Advanced pointer interaction handling for canvas elements.

---

## `usePipGestures`
**File:** `src/hooks/usePipGestures.ts` (~4.6KB)

**Purpose:** Touch and mouse gesture handling for the PiP camera window.

---

## `useAnimeStyles`
**File:** `src/hooks/useAnimeStyles.ts` (~1.5KB)

**Purpose:** Applies Anime.js animation styles to DOM elements.

---

## `useCaptionPresets`
**File:** `src/hooks/useCaptionPresets.ts` (~856B)

**Purpose:** Loads and provides caption style presets from `captionPresets.ts`.

---

## `useFilters`
**File:** `src/hooks/useFilters.ts` (~1.5KB)

**Purpose:** Manages CSS filter application and provides filter presets.

---

## `useCursorFeedback`
**File:** `src/hooks/useCursorFeedback.ts` (~4.5KB)

**Purpose:** Provides visual feedback at the cursor position for interactions.

---

## `usePresetTemplates`
**File:** `src/hooks/usePresetTemplates.ts` (~862B)

**Purpose:** Loads layout preset templates.

---

## `usePublicPresets`
**File:** `src/hooks/usePublicPresets.ts` (~1.7KB)

**Purpose:** Fetches community-shared presets from Firebase.

---

## `useSubsceneTransition`
**File:** `src/hooks/useSubsceneTransition.ts` (~4.1KB)

**Purpose:** Handles sub-scene transition animations between layout changes within a scene.

---

## `useTextDesigns`
**File:** `src/hooks/useTextDesigns.ts` (~1KB)

**Purpose:** Provides pre-built text design templates.
