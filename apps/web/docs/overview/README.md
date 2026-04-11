# GAKI Studio — Overview

→ Back to [Index](../INDEX.md)

---

## What Is GAKI Studio?

**GAKI Studio** is an AI-powered, multi-scene streaming and recording studio built as both an **Electron desktop app** and a **web application**. It is a single codebase that ships two products:

1. **Desktop App (Electron)** — Full broadcast studio with RTMP streaming via FFmpeg, native file recording, desktop capture, and Google OAuth.
2. **Web App (Browser)** — Feature-rich web version with canvas compositing, AI overlays, live captions, and a community streaming platform.

The application is branded *"GAKI — House of Video Creation"* and targets creators, streamers, and developers who want to blend AI automation with creative control.

---

## Core Product Capabilities

### 🎬 Multi-Scene Production
Create, name, reorder, and switch between multiple scenes—just like OBS Studio. Each scene holds its own camera settings, overlays, captions, filters, and layout. Scene transitions (Dissolve, Slide, Wipe, etc.) animate between scenes.

→ See [Scene Management](../webapp/features/scene-management.md)

### 🤖 AI Overlay Engine
Type or speak a natural language command (e.g., *"create a neon countdown timer"*) and the Google Gemini API generates a complete HTML/CSS/JS overlay rendered live on the canvas in a sandboxed iframe.

→ See [AI Engine](../webapp/features/ai-engine.md)

### 🗣️ Live Speech-to-Text Captions
Real-time, animated captions powered by Deepgram Nova-2. 15+ animation styles (Karaoke, Pop-up, Typewriter, Rainbow Wave, etc.) with per-scene styling.

→ See [Caption System](../webapp/features/caption-system.md)

### 🎨 WYSIWYG Canvas
A Figma-like infinite canvas with pan (Spacebar + drag), zoom (mouse wheel), and snap guides. All elements (text, browsers, files, graphs, effects) are draggable and resizable via `react-rnd`.

→ See [Canvas System](../webapp/features/canvas-system.md)

### 🔴 Live Streaming (Electron-only)
Multi-destination RTMP streaming through FFmpeg. The renderer captures the canvas as a `MediaStream`, sends WebM chunks via IPC, and the main process pipes them through FFmpeg to any RTMP endpoint (YouTube, Twitch, Kick, custom).

→ See [Streaming Pipeline](../electron/streaming.md)

### ⏺️ Recording & Editor
Two recording modes: (1) native file recording (Electron—writes WebM to disk, converts to MP4) and (2) keyframe session recording (web—captures all overlay state changes for replay in a post-production editor).

→ See [Recording Pipeline](../electron/recording.md) | [Recording Feature](../webapp/features/recording-feature.md)

### 📺 Streaming Platform
A Twitch/Kick-like streaming platform UI with browse, search, profiles, following, clips, and dashboard pages. Separate mobile-responsive layouts exist for phone viewing.

→ See [Platform Pages](../webapp/pages/platform-pages.md) | [Mobile Pages](../webapp/pages/mobile-pages.md)

### 🎭 Visual Effects Pipeline
- **WebGL shaders**: Neon Edge (Sobel detection), Hologram, VHS, Cyberpunk via a custom `GLRenderer` engine
- **CSS filters**: 50+ presets (Vintage, Noir, etc.)
- **Auto-framing**: Face tracking via MediaPipe for AI-powered centering
- **Background replacement**: Blur or image segmentation via MediaPipe SelfieSegmentation
- **Particle effects**: Snow, rain, fire, sparkles on a `<canvas>` overlay

→ See [Canvas System](../webapp/features/canvas-system.md)

### 🎨 Theming
Multiple theme presets (Default, Ocean, Forest, Sunset), dark/light mode, and custom Google Fonts—all persisted via Zustand.

→ See [Theme System](../webapp/features/theme-system.md)

### 🔐 Authentication
Firebase Auth with a custom Electron-compatible Google OAuth flow that opens a modal BrowserWindow, intercepts the redirect, and extracts tokens from the URL fragment.

→ See [Auth](../webapp/features/auth.md)

---

## Two Runtime Modes

| Aspect | Web (Browser) | Desktop (Electron) |
|---|---|---|
| Router | `BrowserRouter` (history API) | `HashRouter` (file:// protocol) |
| Streaming | Not available | RTMP via FFmpeg IPC |
| Recording | In-memory Blob + localStorage | File-system `.webm` → `.mp4` |
| Desktop Capture | `getDisplayMedia()` | `desktopCapturer` API |
| Storage | `localStorage` | `electron-store` (JSON on disk) |
| Auth | Firebase popup | Custom BrowserWindow OAuth |
| Proxy | Netlify/Vite dev proxy | `ipcMain.handle('proxy:request')` |

The app detects its environment at runtime via `navigator.userAgent.includes('electron')` and switches behavior accordingly.

→ See [Architecture](../architecture/README.md)
