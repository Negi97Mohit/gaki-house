# GAKI Studio — Documentation Index

> **The blueprint for the entire codebase.** Every `.md` in this directory is cross-linked so any human or AI can navigate from high-level architecture down to individual component internals.

---

## How to Read This Documentation

| Start here if you want to… | Document |
|---|---|
| Understand what the app **is** | [Overview](./overview/README.md) |
| See the full **directory tree** and where code lives | [Project Map](./overview/project-map.md) |
| Understand the **high-level architecture** and data flow | [Architecture](./architecture/README.md) |
| Dive into the **Electron desktop shell** | [Electron App](./electron/README.md) |
| Dive into the **React web application** | [Web App](./webapp/README.md) |
| Understand **state management** (Zustand stores) | [State Management](./architecture/state-management.md) |
| Learn how **streaming / RTMP** works | [Streaming Pipeline](./electron/streaming.md) |
| Learn how **recording** works | [Recording Pipeline](./electron/recording.md) |
| Understand the **AI overlay engine** (Gemini) | [AI Engine](./webapp/features/ai-engine.md) |
| Understand **live captions** (Deepgram) | [Caption System](./webapp/features/caption-system.md) |
| Understand the **canvas / scene compositor** | [Canvas System](./webapp/features/canvas-system.md) |
| See all **external integrations** and API keys | [Integrations](./architecture/integrations.md) |
| Get **dev setup** instructions | [Development Guide](./overview/dev-guide.md) |
| Understand the **studio panels** (audio mixer, designs, etc.) | [Studio Panels](./webapp/components/studio-panels.md) |
| Understand the **canvas internal components** (30 files) | [Canvas Internals](./webapp/components/canvas-internals.md) |
| Understand **PiP camera controls** and menus | [PiP Controls](./webapp/components/pip-controls.md) |
| Understand the **stream configuration** wizard | [Stream Config](./webapp/components/stream-config.md) |
| Understand the **media controls** and video settings | [Media Controls](./webapp/components/media-controls.md) |
| Understand **ambient effects** and cinematic overlays | [Ambient & Cinematic](./webapp/components/ambient-cinematic.md) |
| Understand the **layout system** (15+ templates) | [Layout System](./webapp/features/layout-system.md) |
| Understand the **animation editor** | [Animation Editor](./webapp/components/animation-editor.md) |
| Understand the **grid section panels** (add/remove content) | [Grid Sections](./webapp/components/grid-sections.md) |
| See what's **missing / TODO** | [Gaps & TODOs](./overview/gaps-and-todos.md) |

---

## Documentation Tree

```
docs/
├── INDEX.md                          ← You are here
│
├── overview/
│   ├── README.md                     — What is GAKI Studio?
│   ├── project-map.md                — Full directory tree with annotations
│   ├── tech-stack.md                 — Every dependency and why it exists
│   ├── dev-guide.md                  — Setup, build, run, deploy
│   └── gaps-and-todos.md             — Known issues, missing pieces
│
├── architecture/
│   ├── README.md                     — High-level architecture & data flow
│   ├── state-management.md           — Zustand stores, React Context, localStorage
│   ├── routing.md                    — Route map for desktop and web
│   ├── ipc-bridge.md                 — Electron ↔ Renderer IPC contract
│   └── integrations.md              — All external APIs and services
│
├── electron/
│   ├── README.md                     — Electron app overview
│   ├── main-process.md               — main.ts walkthrough
│   ├── preload.md                    — preload.ts API surface
│   ├── streaming.md                  — RTMP / FFmpeg pipeline
│   ├── recording.md                  — File-based recording & MP4 conversion
│   └── obs-compositor.md             — OBS scene import / compositor
│
└── webapp/
    ├── README.md                     — Web app overview
    ├── pages/
    │   ├── README.md                 — Pages index
    │   ├── studio-page.md            — Index.tsx (main studio)
    │   ├── platform-pages.md         — Twitch-like streaming platform
    │   └── mobile-pages.md           — Mobile-responsive pages
    │
    ├── features/
    │   ├── README.md                 — Features index
    │   ├── ai-engine.md              — AI overlay generation (Gemini)
    │   ├── caption-system.md         — Live captions (Deepgram + animations)
    │   ├── canvas-system.md          — Scene compositor, WebGL, shaders
    │   ├── scene-management.md       — Multi-scene, transitions, undo/redo
    │   ├── draggable-elements.md     — Text, browser, file, graph overlays
    │   ├── streaming-feature.md      — Go-live UI & multi-destination
    │   ├── layout-system.md          — 15+ layout templates & grid system
    │   ├── recording-feature.md      — Session recording & editor
    │   ├── asset-library.md          — Pexels, Pixabay, GIPHY search
    │   ├── vault.md                  — Asset vault & overlay packages
    │   ├── animation-system.md       — GSAP / Anime.js animation engine
    │   ├── omegle-feature.md         — Random chat (Omegle-style)
    │   ├── auth.md                   — Firebase + Google OAuth
    │   └── theme-system.md           — Theming, fonts, dark/light mode
    │
    ├── components/
    │   ├── README.md                 — Component architecture
    │   ├── video-canvas.md           — The core stage component
    │   ├── bottom-navigation.md      — Main control bar
    │   ├── scene-tabs.md             — Scene management panel
    │   ├── settings-panel.md         — Floating controls / settings
    │   ├── studio-panels.md          — All 12 studio sidebar panels (deep)
    │   ├── canvas-internals.md       — 30 canvas rendering components (deep)
    │   ├── pip-controls.md           — PiP camera controls & 7 sub-menus
    │   ├── stream-config.md          — Stream config modal & platform selector
    │   ├── media-controls.md         — Media controls & video settings dialog
    │   ├── ambient-cinematic.md      — Ambient backgrounds & cinematic overlays
    │   ├── animation-editor.md       — Animation library & GSAP editor
    │   └── grid-sections.md          — Grid section panels (add/remove/configure content)
    │
    ├── hooks/
    │   ├── README.md                 — Custom hooks index
    │   └── hooks-reference.md        — All hooks with signatures and purpose
    │
    ├── stores/
    │   ├── README.md                 — Zustand stores index
    │   └── stores-reference.md       — All stores with state shape and actions
    │
    └── types/
        ├── README.md                 — Type system index
        └── types-reference.md        — Core types and interfaces
```

---

## Cross-Reference Convention

Every document uses the following conventions:

- **`→ See [Document Name](relative-link)`** — navigates to another doc
- **`→ Source: [filename](file:///path)`** — links to actual source code
- **Type references** are formatted as `TypeName` with a link to `types-reference.md`
- **Store references** link to `stores-reference.md#store-name`
- **Hook references** link to `hooks-reference.md#hook-name`
