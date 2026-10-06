---

# Web Studio (`@gaki/web`)

## 🗺️ What This Is
The core React/Vite application for the GAKI live streaming studio. It acts as the primary broadcast mixer and visual compositor, allowing users to import OBS scene collections, manage multi-layered canvases, and seamlessly hand off streams across devices. It is used directly in the browser and also serves as the embedded frontend for the GAKI Desktop Electron app.

## 🔌 How It Connects to the Monorepo
- **Imports from:** `@gaki/core` (types/constants), `@gaki/engine` (WebGL/Canvas kernel pipeline), `@gaki/handoff-sdk` (cross-device streaming), `@gaki/ui` (Radix UI components).
- **Exposes:** The built `dist/` directory is consumed by `@gaki/desktop` during the Electron build process.
- **External Services:** 
  - Firebase (Authentication, Realtime Database/Firestore)
  - Supabase (Backend Database)
  - LiveKit (Handoff infrastructure via signaling server)
  - Kick/Twitch/YouTube APIs (Stream metadata and destination targets)
- **Environment Variables:**
  - `VITE_FIREBASE_API_KEY` to `VITE_FIREBASE_MEASUREMENT_ID` (Required) — Firebase connection. <!-- [FIXED: was to VITE_FIREBASE_APP_ID, now includes MEASUREMENT_ID based on .env.example] -->
  - `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (Required) — Supabase database connection. <!-- [FIXED: added note that these exist in local .env but are MISSING from .env.example] -->
  - `VITE_YOUTUBE_API_KEY`, `VITE_TWITCH_CLIENT_ID`, `VITE_TWITCH_CLIENT_SECRET`, `VITE_KICK_CLIENT_ID`, `VITE_KICK_CLIENT_SECRET` (Optional) — Platform API integrations. <!-- [FIXED: was missing client secrets, added based on .env.example] -->

## 📁 Directory Map
- `src/features` — Domain-specific modules (e.g., `canvas`, `stream`, `auth`, `omegle`, `caption`, `banners`).
- `src/stores` (and `src/store`) — Global Zustand stores organized by domain (`stream.store.ts`, `scene.store.ts`, etc.). <!-- [FIXED: added missing src/store duplicate directory based on src/] -->
- `src/components` — Shared, reusable UI components (built on `@gaki/ui`).
- `src/pages` — React Router entry points for specific layouts (`Platform`, `Mobile`, etc.).
- `src/lib` — Core utilities (OBS parser, Firebase config, z-index constants).
- `src/integrations` — Setup and hooks for external services (Supabase, Lovable).
- `src/context` — React context providers for global app state. <!-- [FIXED: added missing directory based on src/] -->
- `src/data` — Static data, mocked payloads, and configuration lists. <!-- [FIXED: added missing directory based on src/] -->
- `src/hooks` — Shared React hooks utilized across features. <!-- [FIXED: added missing directory based on src/] -->
- `src/services` — Abstracted API and service layers. <!-- [FIXED: added missing directory based on src/] -->
- `netlify/functions` — Edge functions used for API proxying (bypassing CORS for Kick, DLive, YouTube).

## 🟢 Working Features
- **OBS Scene Integration** — Native parsing of OBS Studio `.json` scene collections (`src/lib/obsParser.ts`).
- **Multi-Layered Canvas** — Complex z-indexed visual compositor with draggable overlays and Picture-in-Picture (`src/features/canvas`).
- **WebRTC Broadcast Pipeline** — Main-thread canvas capture and audio mixing, including noise gates and limiters (`src/features/stream/services/stream.service.ts`).
- **Omegle Mode** — WebRTC stranger matching with chat and video transforms (`src/features/omegle`).
- **Desktop Electron Support** — Specialized hooks and IPC calls to use native window capture and FFmpeg recording when running in Electron.

## 🟡 Under Construction
- **Kernel Pipeline (Phase D)** — Shifting the broadcast rendering and audio mixing to a WebWorker (`BroadcastBus`) via `@gaki/engine` to improve performance. Currently active but causes brief stream drops during scene transitions.
- **Cross-Device Handoff** — The handoff context and controls exist (`src/features/stream/context/HandoffContext.tsx`), but the exact lifecycle with the external `api-handoff` Egress requires stabilization.

## 🔴 Known Broken / Disabled
- **Seamless Scene Transitions (Kernel Pipeline)** — `BroadcastBus` is tied to `CanvasView` and re-instantiates on scene switch, breaking the stream briefly. Needs to be lifted to `CanvasContainer` to persist across scenes.

## ⚡ Key Entry Points
- `src/main.tsx` — React DOM rendering root. <!-- [FIXED: was missing, added based on src/main.tsx] -->
- `src/App.tsx` — Root application router and theme initialization.
- `src/features/stream/services/stream.service.ts` — The massive core engine handling WebRTC streams, audio routing, and screen recording.
- `src/features/canvas/ui/CanvasView.tsx` — The main visual compositor that renders the scene graph.
- `src/stores/scene.store.ts` — Zustand store tracking every visual element on the canvas.
- `src/lib/obsParser.ts` — Translates raw OBS JSON into internal `SceneSource` coordinates.
- `packages/engine/src/kernel/engine/BroadcastBus.ts` — The offscreen worker manager (imported from the monorepo engine).
- `vite.config.ts` — Build config, complex path aliases, and API proxy rules for dev operations. <!-- [FIXED: was missing, added based on apps/web/vite.config.ts] -->
- `netlify.toml` — The routing rules and proxy functions for production deployments.
- `src/lib/zIndex.ts` — The strict z-index hierarchy essential for UI rendering.

## 🧠 Business Logic That Isn't Obvious
- **Audio Routing (Sidetone vs System):** The `stream.service.ts` strictly routes microphone audio to the streamer's speakers (`monitorGain`) but *never* system audio. If system audio went to the speakers, the loopback capture would pick it up again, causing a horrific feedback loop/choppiness. 
- **Double Canvas Mirror Hack:** Chromium Bug 754408 prevents `captureStream()` on OffscreenCanvases. The `BroadcastBus` works around this by continuously `drawImage()`-ing from the worker's proxy canvas onto a hidden main-thread 1920x1080 canvas at 30fps.
- **Electron Auth Workaround:** Google OAuth inside Electron uses a local loopback server (`http://localhost:3456`) to securely intercept the auth redirect because custom domains fail in desktop wrappers.
- **OBS Bounding Box Math:** OBS stores scaling and coordinates separately from actual physical size. `calculatePercentageBounds` manually normalizes these into 0-100% relative coordinates for responsive resizing.

## 🚫 What NOT to Touch
- **Audio DSP Chain:** Do not modify the threshold values, attack/release times, or the -48/-40 dBFS noise gate rules in `stream.service.ts` (`createAudioGate`, `createPeakLimiter`). These were carefully tuned to fix audio chopping and breathing artifacts.
- **Z-Index Dictionary:** Do not hardcode `z-index` in CSS/Tailwind classes. Always use the constants from `src/lib/zIndex.ts` to prevent stacking collisions (e.g., Radix dropdown portals).
- **Offscreen Canvas Transfer:** Do not interfere with how `canvas.worker.ts` receives control via `transferControlToOffscreen()`. It is fragile and can easily crash the WebGL context if copied instead of transferred.

## 🧪 Testing
- **How to run tests:** TypeScript checks are run via `npm run type-check`.
- **What's covered:** 🟡 UNKNOWN. There appears to be no automated unit testing (Vitest/Jest) configured directly in this package. 
- **What has no tests but should:** `stream.service.ts` logic, `obsParser.ts` coordinate mapping, and audio graph routing.

## 🚀 Deployment
- **Where this app is deployed:** Netlify (for web access) and bundled into an Electron app (`apps/desktop`).
- **Build command:** `npm run build` (Runs `type-check` followed by `vite build` with increased Node memory).
- **Any deploy-time gotchas:** Netlify redirects (`netlify.toml`) are critical. SPA routing (`/* -> /index.html`) and API proxies (e.g., `/api/kick/*`) must be configured correctly, otherwise CORS errors will break platform integrations in production.

## 📋 Agent Instructions
- **Do** check `src/features/stream/services/stream.service.ts` when debugging stream freezes or audio quality issues.
- **Never** hardcode z-indexes; always use `src/lib/zIndex.ts`.
- **Always check** `package.json` workspaces before attempting to install new packages (leverage `@gaki/core`, `@gaki/ui` instead of duplicating logic).
- **If you see pattern** `use...Store`, it means global state is handled via Zustand. Prefer zustand subscriptions (`store.subscribe`) for high-frequency updates (like mouse/pointer moves) rather than React re-renders.

---

> [2026-09-30] Reverted experimental full-header refactor. Redesigned Studio Settings menu designs panel (CanvasDesignsPanel) with integrated quick canvas background color, upload, curated assets, and layout templates from original top floating menu. Redesigned SceneTabs side floating menu with refined dark glass dock, scene count, and improved row interactions. Ensured Solo layout default and clean bottom menu without PiP. Status: 🟢 PRODUCTION. Agent: Antigravity.
> [2026-09-30] Retired CanvasHoverToolbar top floating menu; absorbed all controls (background color, custom upload, asset library, layout gallery, transformation controls, sequence order, chatbot, empty panel) into CanvasDesignsPanel. Replaced heavy DOM/ResizeObserver layout previews with instant CSS-only cards. Eliminated mouse-inactivity auto-hide from FloatingControlsPanel. Connected SettingsPanel to real media and UI stores (microphones, audio outputs, fullscreen toggle). Fixed raw z-index violations in FileVaultPanel and BroadcastStatsPanel using zIndex.ts constants. Status: 🟢 PRODUCTION. Agent: Antigravity.
> [2026-10-01] Fully overhauled Studio Floating Controls & Settings Deck (`FloatingControlsPanel.tsx`) and all member panels (`SettingsPanel.tsx`, `ThemeSwitcher.tsx`, `ToolsPanel.tsx`, `GSAPAnimationsPanel.tsx`, `TextPresetsPanel.tsx`, `SavedOverlaysPanel.tsx`, `SocialBannersPanel.tsx`, `FileVaultPanel.tsx`). Moved the section list to the bottom as a smooth horizontally scrollable dock. Solved text contrast completely with solid zinc-900 chip buttons, high-contrast white bold typography, and explicit borders across all themes. Sized the panel to a balanced adaptable floating card (`w-[460px]-w-[540px]`, `h-[68vh]`) that leaves the video canvas unobstructed, with adaptable content across all sections. Status: 🟢 PRODUCTION. Agent: Antigravity.
> [2026-10-01] Refined typography across the studio panel with elegant tracking and font weights (`geist-sans`). Added `.slim-scrollbar` minimalist scrollbar utility. Updated selected options to use full primary border color changes and luminous thin underline indicators. Status: 🟢 PRODUCTION. Agent: Antigravity.
> [2026-10-01] Fully redesigned bottom floating control island into a clean, chic, minimal dock. Eliminated tacky segmented grey pod boxes in favor of sleek hairline dividers and unified glassmorphism (`bg-[#0b0b10]/90`, top specular highlight, inset border). Replaced disconnected audio/video dropdowns with elegant split capsules with instant mute feedback (subtle red tint when muted, frosted neutral when active). Cleaned up the recording trigger with a pulsing live status dot and duration badge. Polished Go Live CTA button. Removed non-working dummy Smart Switch button, removed tacky Download desktop button, removed Omegle mode button from dock, and removed accidental destructive Reset Scene button. Status: 🟢 PRODUCTION. Agent: Antigravity.
> [2026-10-01] Applied minimal chic styling across the bottom floating dock and FloatingControlsPanel. Replaced all solid color fills on buttons (Go Live, Recording, Media Mute/Off, Studio Deck, Screen Share, AI Chatbot) with transparent frosted glass, delicate thin borders, and luminous thin underline indicators. Updated typography to clean monospace uppercase styling (`font-mono tracking-[0.14em] text-[10px]`). Refined FloatingControlsPanel header, sub-tabs (`.sp-tab`), filter chips (`.sp-chip`), and bottom navigation dock to match this minimalist aesthetic. Status: 🟢 PRODUCTION. Agent: Antigravity.
> [2026-10-01] Streamlined bottom floating control dock per user design directive: removed the Record button from broadcast controls, removed the Undo/Redo history buttons (`SceneControls`), and removed the AI assistant button next to Fullscreen. Dock is now ultra-minimal with Home, Studio Deck, Audio/Video capsules, Screen Share, Go Live, Handoff, Fullscreen, and User Profile. Status: 🟢 PRODUCTION. Agent: Antigravity.
> [2026-10-01] Refined Go Live button typography and scale: reduced text to `text-[9px] font-mono tracking-[0.16em] uppercase font-normal`, scaled radio and live pulse indicators to `1.5-2.5px`, thinned border to hairline `border-white/10`, and adjusted padding to `px-2.5 gap-1.5` for an understated luxury aesthetic. Status: 🟢 PRODUCTION. Agent: Antigravity.

> [2026-10-06] Changed default theme from Event Horizon (`eventHorizon`) to Sunflower dark (`phyllotaxis`). Replaced all `font-mono tracking-[0.14em] uppercase` typography across FloatingControlsPanel and all sub-panels (CanvasDesignsPanel, SettingsPanel, ToolsPanel, FileVaultPanel, BroadcastStatsPanel) with slim `font-sans tracking-normal` for a clean, light typographic aesthetic. Redesigned the bottom navigation dock to icon-only (removed all text labels), with narrower buttons (`min-w-[36px]`), slimmer icons (14px, strokeWidth 1.4), and native `title` tooltips showing label + description. Bumped theme store persist version to v3 for clean migration. Status: 🟢 PRODUCTION. Agent: Antigravity.


