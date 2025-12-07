# gaki

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![React](https://img.shields.io/badge/React-18-blue)
![Vite](https://img.shields.io/badge/Vite-latest-purple)

# 🎥 GAKI

**GAKI ()** is an **AI-powered, multi-scene streaming and recording studio** built with React.  
It provides a **WYSIWYG (What You See Is What You Get)** canvas for building dynamic video scenes — complete with AI-generated overlays, live speech-to-text captions, and a full-fledged recording and post-production editor.

---

## ✨ Core Features

### 🎬 Multi-Scene Production

- Create, name, reorder, and switch between multiple scenes — just like professional broadcast software.

### 🌈 Scene Transitions

- Apply animated transitions like **"Dissolve"** or **"Slide"** between your scenes.

### 🤖 AI Overlay Engine

- Use natural language commands (e.g., _“create a neon countdown timer”_) to generate complex HTML/CSS/JS overlays on the fly, powered by the **Gemini API**.

### 🧩 Draggable WYSIWYG Canvas

- A **Figma-like** canvas where all elements can be dragged, resized, and rotated.
  - Pan with **Spacebar + Drag**
  - Zoom with **Mouse Wheel**

### 🗣️ Live Speech-to-Text

- Real-time, live-animated captions powered by **Deepgram**.

### 🧵 Per-Scene Caption Styling

- Each scene remembers its own caption style, animation, position, and on/off state.

### 🪟 Dynamic Layouts

- Instantly arrange your **camera**, **screen share**, and **overlays** into split-screen or picture-in-picture layouts.

### 🖼️ Rich Media Elements

- **Text Overlays:** Add rich text with a floating toolbar for font, size, color, and list styling.
- **Browser Overlays:** Embed live, draggable web pages directly into your scene.
- **File Overlays:** Drag-and-drop images, videos, PDFs, and even code files onto the canvas.

---

## 🎥 Session Recording & Editor

### ⏺️ Keyframe Recording

- Records not just the final video but a **complete timeline** of every state change for every overlay.

### 🎞️ Post-Production Editor

- A separate editor page (`/edit/:id`) that loads the recorded session for non-linear editing.

### 🔁 Playback Engine

- Reconstructs the entire scene (overlays, styles, layouts) perfectly in sync with recorded playback.

### ⚡ Real-time Video Effects

- Apply dozens of filters (e.g., **"Noir"**, **"Cyberpunk"**) and camera effects like **"Neon Edge"**.

---

## 💻 Tech Stack

| Category            | Technology                               |
| ------------------- | ---------------------------------------- |
| Framework           | React                                    |
| Styling             | Tailwind CSS (with `clsx` and `twMerge`) |
| Routing             | React Router DOM                         |
| AI (Generation)     | Gemini API (`gemini-2.0-flash-exp`)      |
| AI (Speech-to-Text) | Deepgram (`nova-2`)                      |
| State Management    | React Hooks, Context, and Local Storage  |
| Draggable UI        | `react-rnd` + custom logic               |
| Asset APIs          | Pexels, Pixabay, GIPHY                   |
| Charts              | Recharts                                 |
| UI Components       | shadcn/ui                                |
| Preview Generation  | `html-to-image`                          |

---

## 📁 Application Structure

### `src/` (Root)

- **main.tsx:** Entry point — renders `App.tsx` into DOM.
- **App.tsx:**
  - Sets up routing (`/` for Studio, `/edit/:id` for Editor).
  - Wraps app in global providers (Theme, Log, Debug, Query).
  - Manages the loading screen.
- **index.css:** Global stylesheet and Tailwind setup.

---

### `src/pages/` (Main Views)

- **Index.tsx (Studio):**

  - Manages all scenes (`useState<SceneState[]>`) and active scene.
  - Passes props to `VideoCanvas` for live production.

- **Edit.tsx (Editor):**

  - Loads `RecordingSession` from local storage.
  - Uses `useSessionPlayback` for timeline sync.

- **NotFound.tsx:**
  - Simple 404 page.

---

### `src/components/` (Core UI)

- **VideoCanvas.tsx:**

  - The main “Stage”. Manages pan/zoom viewport.
  - Renders camera, screen share, and overlays.
  - Displays floating control bar.

- **SceneTabs.tsx:** Manage and switch between scenes.
- **TransitionPopover.tsx:** Configure scene transitions.
- **FloatingControlsPanel.tsx:** Accordion sidebar for captions, effects, and overlays.
- **SavedSessionsPanel.tsx:** Slide-in library of saved sessions.
- **AICommandPopover.tsx:** AI command input bubble.
- **TextEditingToolbar.tsx:** Rich text toolbar for selected overlays.
- **LayoutControls.tsx:** Dropdown to adjust scene layouts (PiP, Split).
- **FloatingAssetSearch.tsx:** Popover containing the Asset Library.
- **AssetLibrary.tsx:** Search and add assets from Pexels/Pixabay/GIPHY.

---

### `src/components/` (Draggable Elements)

- **DraggableTextOverlay.tsx:**
  - Rich text element with drag, resize, and inline edit.
- **DraggableBrowser.tsx:**
  - Draggable iframe with editable URL bar.
- **DraggableFileViewer.tsx:**
  - Container for images, videos, PDFs, etc.
- **DraggableGraph.tsx:**
  - Renders charts using Recharts.
- **DraggableAmbientEffect.tsx:**
  - Zone for particle effects (snow, fire).

---

### `src/components/` (Renderers)

- **CaptionRenderer.tsx:** Renders live captions with animation.
- **CameraRenderer.tsx:** Renders webcam feed to canvas with real-time effects.
- **AmbientEffectsOverlay.tsx:** Full-screen effects (snow, fire, etc.).

---

### `src/hooks/` (Core Logic)

- **useRecordingSession.ts:**
  - Captures main canvas stream and records all overlay states.
- **useSessionPlayback.ts:**
  - Calculates overlay state at a specific timestamp.
- **useDeepgramSpeech.ts:**
  - Handles Deepgram live transcription.
- **useContinuousAudio.ts:**
  - Streams mic input to Deepgram.
- **useVideoStreams.ts:**
  - Manages camera and screen share.
- **useLocalStorage.ts:**
  - Saves and retrieves sessions locally.

---

### `src/lib/` (AI, Utilities & Constants)

- **ai.ts:**
  - Contains `MASTER_PROMPT`, `UPDATE_PROMPT`, and AI command logic (Gemini API).
- **dynamicCaptionStyles.tsx:**
  - React components for caption animations.
- **assetApis.ts:**
  - Search logic for Pexels, Pixabay, GIPHY APIs.
- **fonts.ts:**
  - 100+ font names grouped by style.
- **filters.ts:**
  - 50+ CSS filter presets (e.g., Vintage, Cyberpunk).
- **captionPresets.ts / customStyles.ts:**
  - Predefined caption styles.
- **zIndex.ts:**
  - Constant z-index values for layering.
- **utils.ts:**
  - Tailwind class merge utility (`cn`).
- **preview.ts:**
  - Generates overlay PNG previews via `html-to-image`.

---

### `src/types/` (Data Models)

- **caption.ts:**

  - Defines `SceneState`, `CaptionStyle`, and all overlay state types.

- **editor.ts:**
  - Defines `RecordingSession`, `ComponentTrack`, and `Keyframe` types for editor timeline.

---

## 🧠 Summary

GAKI combines **AI generation**, **real-time media rendering**, and **React-driven interactivity** into one modular, extensible video production system — designed for creators, developers, and streamers who want to blend **AI automation** with **creative control**.

---
