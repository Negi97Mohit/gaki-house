# Project Map — Full Directory Tree

→ Back to [Index](../INDEX.md) | [Overview](./README.md)

---

This document maps every directory in the codebase with annotations explaining what each directory and key file does. Empty component directories (stubs for future work) are marked with `[STUB]`.

```
gaki/
│
├── .env / .env.local / .env.example    — Environment variables (API keys)
├── package.json                         — Project config, scripts, dependencies
├── vite.config.ts                       — Vite build config + dev proxy plugins
├── tsconfig.json                        — TypeScript project references
├── tailwind.config.ts                   — Tailwind CSS configuration
├── postcss.config.js                    — PostCSS (used by Tailwind)
├── eslint.config.js                     — ESLint flat config
├── netlify.toml                         — Netlify deployment configuration
├── index.html                           — HTML entry point (loads fonts, mounts React)
│
├── electron/                            — Electron main process code
│   ├── main.ts                          — Main process: window, IPC, FFmpeg, Socket.IO
│   ├── preload.ts                       — Context bridge: exposes API to renderer
│   ├── rtmp-server.ts                   — Alternative RTMP server (Socket.IO approach)
│   ├── generate-config.js              — Post-compile config generation
│   ├── obs/                             — OBS integration
│   │   ├── compositor/                  — Scene compositor logic
│   │   └── sources/                     — Source type definitions
│   └── dist/                            — Compiled JS output (gitignored)
│
├── src/                                 — React web application source
│   ├── main.tsx                         — React entry point
│   ├── App.tsx                          — Root component: providers, routing, theme
│   ├── index.css                        — Global styles, Tailwind, theme variables, animations
│   ├── vite-env.d.ts                    — Vite TypeScript declarations
│   │
│   ├── pages/                           — Route-level page components
│   │   ├── Index.tsx                    — Main studio page (orchestrator)
│   │   ├── Index/                       — Studio page sub-components and hooks
│   │   │   ├── components/              — Studio-specific UI components
│   │   │   ├── hooks/                   — Studio-specific hooks
│   │   │   └── utils/                   — Studio-specific utilities
│   │   ├── Edit/                        — Post-production editor page
│   │   │   ├── components/              — Editor-specific components
│   │   │   └── hooks/                   — Editor-specific hooks
│   │   ├── RemoteCamera.tsx             — Phone-as-camera via WebRTC (PeerJS)
│   │   ├── NotFound.tsx                 — 404 page
│   │   ├── platform/                    — Streaming platform (Twitch-like)
│   │   │   ├── PlatformLayout.tsx       — Shared layout with sidebar
│   │   │   ├── pages/                   — Individual platform pages
│   │   │   ├── components/              — Platform UI components
│   │   │   ├── context/                 — AuthContext for platform
│   │   │   ├── hooks/                   — Platform-specific hooks
│   │   │   ├── services/                — Platform API services
│   │   │   └── data/                    — Mock / seed data
│   │   └── Mobile/                      — Mobile-responsive platform pages
│   │       ├── MobileLayout.tsx         — Mobile layout shell
│   │       └── pages/                   — Mobile-optimized page variants
│   │
│   ├── features/                        — Feature modules (domain-driven)
│   │   ├── ai-assistant/                — AI overlay generation UI & hooks
│   │   │   ├── hooks/                   — useAiCommand, etc.
│   │   │   └── ui/                      — AICommandPopover, etc.
│   │   ├── animation/                   — GSAP/Anime.js animation system
│   │   │   ├── hooks/                   — useAnimationEngine
│   │   │   ├── lib/                     — Animation generators & library
│   │   │   └── ui/                      — Animation picker UI
│   │   ├── assets/                      — Asset library (stock search)
│   │   │   └── (hooks, ui)
│   │   ├── auth/                        — Authentication
│   │   │   ├── hooks/                   — useAuth
│   │   │   └── ui/                      — Login UI components
│   │   ├── banners/                     — Animated banners / social banners
│   │   ├── canvas/                      — Canvas compositor system
│   │   │   ├── hooks/                   — useCanvasCompositor
│   │   │   ├── model/                   — Canvas data models
│   │   │   ├── ui/                      — Canvas UI components
│   │   │   ├── workers/                 — Web Workers for canvas ops
│   │   │   └── index.ts                 — Feature barrel export
│   │   ├── caption/                     — Live caption system
│   │   │   └── ui/                      — StyleSync, CaptionRenderer, etc.
│   │   ├── layouts/                     — Layout presets & management
│   │   │   ├── hooks/                   — useLayoutPresets
│   │   │   └── ui/                      — Layout picker components
│   │   ├── omegle/                      — Random chat feature
│   │   │   ├── api/                     — Omegle-like matching API
│   │   │   ├── data/                    — Interests / categories
│   │   │   ├── hooks/                   — Matching & chat hooks
│   │   │   ├── services/                — Signaling service
│   │   │   └── ui/                      — Chat UI components
│   │   ├── random-chat/                 — Alternative random chat implementation
│   │   ├── stream/                      — Streaming / broadcast feature
│   │   │   ├── hooks/                   — useBroadcast, useStreamManager
│   │   │   ├── services/                — RTMP service wrappers
│   │   │   ├── transitions/             — Scene transition system
│   │   │   └── ui/                      — Stream control UI, PiP, stingers
│   │   ├── studio/                      — Studio workspace UI
│   │   │   └── ui/                      — DockablePanel, workspace layout
│   │   ├── theme/                       — Theme management
│   │   │   └── (store, UI)
│   │   └── vault/                       — Asset vault (overlay packages)
│   │       ├── hooks/                   — useVault
│   │       ├── ui/                      — Vault browser UI
│   │       └── index.ts                 — Barrel export
│   │
│   ├── stores/                          — Zustand global state stores
│   │   ├── scene.store.ts               — Scene overlays, filters, selections
│   │   ├── stream.store.ts              — Broadcast destinations, recording state
│   │   ├── media.store.ts               — Audio/video device management
│   │   ├── canvas.store.ts              — Canvas zoom, pan, viewport
│   │   ├── ui.store.ts                  — UI panel visibility states
│   │   ├── goLive.store.ts              — Go-live modal state
│   │   ├── omegle.store.ts              — Omegle matching state
│   │   ├── sceneAudio.store.ts          — Per-scene audio state
│   │   └── stream-manager.store.ts      — Stream manager state
│   │
│   ├── kernel/                          — Low-level rendering engine
│   │   └── engine/                      — WebGL rendering pipeline
│   │       ├── GLRenderer.ts            — Main WebGL renderer
│   │       ├── GLContext.ts             — WebGL context manager
│   │       ├── ShaderManager.ts         — Shader compilation & caching
│   │       ├── VideoTexture.ts          — Video-to-texture bridge
│   │       ├── TimeWarp.ts              — Time-based shader effects
│   │       ├── EventBus.ts              — Pub/sub event system
│   │       ├── webgl.ts                 — WebGL utility functions
│   │       ├── utils.ts                 — Engine utilities
│   │       └── shaders/                 — GLSL shader programs
│   │
│   ├── hooks/                           — Global custom React hooks
│   │   ├── useAutoFraming.ts            — MediaPipe face tracking
│   │   ├── useCameraEffects.ts          — Background blur/replacement
│   │   ├── useKeyboardShortcuts.ts      — Global keyboard shortcuts
│   │   ├── useLayerControls.ts          — Layer ordering & management
│   │   ├── useSnapGuides.ts             — Smart alignment guides
│   │   ├── usePictureInPicture.ts       — Custom PiP implementation
│   │   ├── useRemotePeer.ts             — WebRTC phone camera
│   │   ├── useSceneCompositor.ts        — Scene composition logic
│   │   ├── useTransformMatrix.ts        — CSS transform math
│   │   ├── usePredictiveSmoothing.ts    — Drag smoothing with inertia
│   │   ├── usePointerInteraction.ts     — Advanced pointer handling
│   │   ├── usePipGestures.ts            — PiP touch/mouse gestures
│   │   ├── useAnimeStyles.ts            — Anime.js style integration
│   │   ├── useCaptionPresets.ts         — Caption preset loading
│   │   ├── useCursorFeedback.ts         — Cursor visual feedback
│   │   ├── useFilters.ts                — CSS filter management
│   │   ├── usePresetTemplates.ts        — Template loading
│   │   ├── usePublicPresets.ts          — Firebase community presets
│   │   ├── useSubsceneTransition.ts     — Sub-scene transition logic
│   │   └── useTextDesigns.ts            — Text design presets
│   │
│   ├── lib/                             — Utility libraries & configuration
│   │   ├── ai.ts                        — Gemini API client & prompt system
│   │   ├── ai/                          — Extended AI modules
│   │   ├── assetApis.ts                 — Pexels, Pixabay, GIPHY clients
│   │   ├── dynamicCaptionStyles.tsx     — Caption animation components
│   │   ├── effects.ts                   — Visual effect definitions
│   │   ├── filterRenderer.ts            — WebGL filter rendering
│   │   ├── streamSceneDesigns.ts        — Stream scene preset designs
│   │   ├── gsapHtmlGenerator.ts         — GSAP animation HTML generator
│   │   ├── transformUtils.ts            — Transform matrix utilities
│   │   ├── presetValidation.ts          — Preset schema validation
│   │   ├── responsiveUtils.ts           — Responsive layout utilities
│   │   ├── particleEffects.ts           — Particle system definitions
│   │   ├── animationGenerator.ts        — Procedural animation generator
│   │   ├── animeStyles.ts               — Anime.js style presets
│   │   ├── backgrounds.ts              — Background image presets
│   │   ├── canvasPresets.ts             — Canvas layout presets
│   │   ├── captionPresets.ts            — Caption style presets
│   │   ├── customStyles.ts             — Intent-based custom styles
│   │   ├── filters.ts                   — CSS filter presets
│   │   ├── fonts.ts                     — Font family registry
│   │   ├── preview.ts                   — HTML-to-image preview
│   │   ├── zIndex.ts                    — Z-index stack constants
│   │   ├── firebase.ts                  — Firebase app initialization
│   │   ├── obs/                          — OBS importer utilities
│   │   ├── chat/                         — Chat system utilities
│   │   └── utils/                        — General utility functions
│   │
│   ├── services/                        — Backend service clients
│   │   ├── mlsharp-api.ts               — ML-Sharp AI backend client
│   │   └── importers/                   — Scene collection importers
│   │
│   ├── shared/                          — Shared infrastructure
│   │   ├── ui/                          — shadcn/ui component library
│   │   ├── hooks/                       — Shared utility hooks
│   │   ├── lib/                         — Shared utility functions
│   │   └── constants/                   — Application-wide constants
│   │
│   ├── context/                         — React Context providers
│   │   ├── DebugContext.tsx             — AI debug info context
│   │   └── LogContext.tsx               — Application logging context
│   │
│   ├── types/                           — TypeScript type definitions
│   │   ├── caption.ts                   — Core types (SceneState, CaptionStyle, etc.)
│   │   ├── videoCanvas.ts               — VideoCanvas-specific types
│   │   ├── editor.ts                    — Recording/editor types
│   │   ├── layout.ts                    — Layout types
│   │   ├── omegle.ts                    — Omegle feature types
│   │   ├── streamStyle.ts              — Stream style types
│   │   ├── vault.ts                     — Vault types
│   │   ├── banner.ts                    — Banner types
│   │   ├── animation.ts                — Animation types
│   │   ├── socialBanner.ts             — Social banner types
│   │   ├── textDesign.ts               — Text design types
│   │   ├── canvasPreset.ts             — Canvas preset types
│   │   ├── layoutPreset.ts             — Layout preset types
│   │   ├── animatedBanner.ts           — Animated banner types
│   │   └── ai.ts                        — AI-related types
│   │
│   ├── templates/                       — Template definitions
│   ├── data/                            — Static data files
│   └── integrations/                    — Third-party integrations
│       ├── supabase/                    — Supabase client
│       └── lovable/                     — Lovable platform integration
│
├── build/                               — Electron builder assets (icons, entitlements)
├── public/                              — Static assets served by Vite
├── dist/                                — Production build output
├── server/                              — Backend server code
├── functions/                           — Serverless functions
├── netlify/                             — Netlify-specific functions
├── supabase/                            — Supabase project config
├── scripts/                             — Build & maintenance scripts
├── huggingface-deployment/              — HuggingFace Spaces deployment
└── mobile/                              — Mobile-specific assets
```

→ See [Architecture](../architecture/README.md) for how these pieces connect
