# Tech Stack

→ Back to [Index](../INDEX.md) | [Overview](./README.md)

> Last Updated: 2026-04-03

---

## Core Framework

| Technology | Version | Purpose |
|---|---|---|
| React | 18.3.1 | UI framework — component-based rendering |
| TypeScript | 5.8.3 | Type-safe development across the entire codebase |
| Vite | 5.4.19 | Build tool, dev server, HMR, and plugin system |
| React Router DOM | 6.30.1 | Client-side routing (BrowserRouter for web, HashRouter for Electron) |

## State Management

| Technology | Version | Purpose |
|---|---|---|
| Zustand | 5.0.9 | Global state stores (scene, stream, media, UI, canvas, omegle) |
| React Context | built-in | Cross-cutting concerns (Debug, Log, Auth) |
| zustand/middleware `persist` | — | localStorage persistence for stream destinations |

→ See [State Management](../architecture/state-management.md)

## Styling & UI

| Technology | Version | Purpose |
|---|---|---|
| Tailwind CSS | 3.4.17 | Utility-first CSS framework |
| shadcn/ui | Latest | Pre-built accessible component library (in `src/shared/ui/`) |
| Radix UI | Various | Accessible primitive components (Dialog, Popover, Select, etc.) |
| Lucide React | 0.462.0 | Icon library |
| Framer Motion | 12.23.22 | React animation library |
| GSAP | 3.14.2 | Professional-grade animation engine |
| Anime.js | 4.2.2 | Lightweight animation library |
| class-variance-authority | 0.7.1 | Component variant management |
| tailwind-merge | 2.6.0 | Intelligent Tailwind class merging |
| tailwindcss-animate | 1.0.7 | Animation utilities for Tailwind |

## AI & Speech

| Technology | Version | Purpose |
|---|---|---|
| Google Gemini | API (`gemini-2.0-flash-exp`) | AI overlay generation from natural language |
| Deepgram SDK | 4.11.2 | Real-time speech-to-text (Nova-2 model) |
| MediaPipe Face Detection | 0.4.x | Face tracking for auto-framing |
| MediaPipe Selfie Segmentation | 0.1.x | Background removal/replacement |
| MediaPipe Tasks Vision | 0.10.22 | Advanced vision tasks |

## Media & Canvas

| Technology | Version | Purpose |
|---|---|---|
| WebGL 2.0 | Native | Custom shader-based video effects (GLRenderer engine) |
| react-rnd | 10.5.2 | Drag-and-resize for all canvas elements |
| html-to-image | 1.11.13 | Generate PNG previews from HTML elements |
| Excalidraw | 0.18.0 | Embedded drawing canvas overlay |
| Recharts | 2.15.4 | Chart/graph overlay rendering |
| react-player | 3.4.0 | Embedded video player |
| Three.js | 0.182.0 | 3D rendering (Gaussian splats, 3D scenes) |
| @react-three/fiber | 8.18.0 | React renderer for Three.js |
| @react-three/drei | 9.122.0 | Three.js helper components |
| fix-webm-duration | 1.0.6 | Fix WebM duration metadata |

## Networking & Backend

| Technology | Version | Purpose |
|---|---|---|
| PeerJS | 1.5.5 | WebRTC peer connections (remote phone camera) |
| Firebase | 12.6.0 | Authentication, Firestore (community presets) |
| Supabase | 2.95.3 | Alternative backend (database, auth) |
| TanStack Query | 5.83.0 | Server state management, caching |
| Socket.IO | 4.8.3 | Real-time streaming engine communication |
| Socket.IO Client | 4.8.3 | Client-side socket connections |

## Asset APIs

| Service | Purpose | Key Env Var |
|---|---|---|
| Pexels | Stock photos & videos | `VITE_PEXELS_API_KEY` |
| Pixabay | Free images | `VITE_PIXABAY_API_KEY` |
| GIPHY | GIF search | `VITE_GIPHY_API_KEY` |

## Electron-Specific

| Technology | Version | Purpose |
|---|---|---|
| Electron | 39.2.7 | Desktop application shell |
| electron-builder | 26.0.12 | Cross-platform packaging (NSIS, DMG, AppImage) |
| electron-store | 8.2.0 | Persistent JSON storage for settings/scenes |
| fluent-ffmpeg | 2.1.3 | FFmpeg command builder for RTMP streaming |
| ffmpeg-static | 5.3.0 | Bundled FFmpeg binary |
| fix-path | 5.0.0 | Fix PATH for macOS/Linux Electron |
| node-media-server | 4.2.4 | Alternative media server |

## Development Tools

| Technology | Version | Purpose |
|---|---|---|
| ESLint | 9.32.0 | Code linting |
| concurrently | 9.2.1 | Run Vite + Electron in parallel |
| cross-env | 10.1.0 | Cross-platform env variable setting |
| wait-on | 9.0.3 | Wait for dev server before launching Electron |
| madge | 6.1.0 | Circular dependency detection |
| vite-bundle-visualizer | 1.2.1 | Bundle size analysis |
| Netlify Functions | 5.1.2 | Serverless function development |

## Environment Variables

```env
# AI
VITE_GEMINI_API_KEY=           # Google Gemini API key

# Speech
VITE_DEEPGRAM_API_KEY=         # Deepgram STT API key

# Assets
VITE_PEXELS_API_KEY=           # Pexels stock photos
VITE_PIXABAY_API_KEY=          # Pixabay images
VITE_GIPHY_API_KEY=            # GIPHY GIF search

# Backend
VITE_MLSHARP_API_URL=          # ML-Sharp Colab backend URL (ngrok)

# Firebase
VITE_FIREBASE_API_KEY=         # Firebase project API key
VITE_FIREBASE_AUTH_DOMAIN=     # Firebase auth domain
VITE_FIREBASE_PROJECT_ID=      # Firebase project ID

# Supabase
VITE_SUPABASE_URL=             # Supabase project URL
VITE_SUPABASE_ANON_KEY=        # Supabase anonymous key
```
