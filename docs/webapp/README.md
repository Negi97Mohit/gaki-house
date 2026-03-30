# Web App

→ Back to [Index](../INDEX.md)

---

## Overview

The web application is a React 18 SPA built with Vite and TypeScript. It runs both standalone in browsers and inside the Electron shell. The architecture follows a **feature-module** pattern with Zustand for state management.

## Entry Point

`src/main.tsx` → renders `src/App.tsx` into `#root`.

## App.tsx Responsibilities

1. **Provider tree** — QueryClient, Log, Debug, Auth, Theme, Tooltip
2. **Router selection** — `BrowserRouter` (web) vs `HashRouter` (Electron)
3. **Lazy loading** — All pages are `React.lazy()` imported
4. **Theme initialization** — `ThemeInitializer` applies CSS classes from Zustand store
5. **Cursor inactivity** — Auto-hides UI after 5 seconds of no mouse movement
6. **Splash screen** — `Loader` component shown for 2 seconds on startup

→ Source: [App.tsx](file:///c:/Users/Dell/Desktop/caption-cam/src/App.tsx)

## Architecture Layers

```
Pages → Features → Stores → Hooks → Kernel → Shared → Lib → Types
```

| Layer | Location | Responsibility |
|---|---|---|
| **Pages** | `src/pages/` | Route-level orchestration, layout |
| **Features** | `src/features/` | Domain-specific modules (ai, canvas, caption, stream, etc.) |
| **Stores** | `src/stores/` | Global reactive state (Zustand) |
| **Hooks** | `src/hooks/` | Reusable business logic |
| **Kernel** | `src/kernel/` | Low-level rendering (WebGL) |
| **Shared** | `src/shared/` | Infrastructure (shadcn/ui, utilities) |
| **Lib** | `src/lib/` | Configuration, API clients, data |
| **Types** | `src/types/` | TypeScript interfaces and type definitions |

## Sub-Documents

### Pages
| Document | Covers |
|---|---|
| [Pages Index](./pages/README.md) | Overview of all pages |
| [Studio Page](./pages/studio-page.md) | Index.tsx — the main studio workspace |
| [Platform Pages](./pages/platform-pages.md) | Twitch-like streaming platform |
| [Mobile Pages](./pages/mobile-pages.md) | Mobile-responsive platform |

### Features
| Document | Covers |
|---|---|
| [Features Index](./features/README.md) | Overview of all feature modules |
| [AI Engine](./features/ai-engine.md) | Gemini-powered overlay generation |
| [Caption System](./features/caption-system.md) | Live speech-to-text and animations |
| [Canvas System](./features/canvas-system.md) | Scene compositor and WebGL engine |
| [Scene Management](./features/scene-management.md) | Multi-scene, transitions, undo/redo |
| [Draggable Elements](./features/draggable-elements.md) | Text, browser, file, graph overlays |
| [Streaming Feature](./features/streaming-feature.md) | Go-live UI and multi-destination |
| [Recording Feature](./features/recording-feature.md) | Session recording and editor |
| [Asset Library](./features/asset-library.md) | Stock media search |
| [Vault](./features/vault.md) | Asset vault and overlay packages |
| [Animation System](./features/animation-system.md) | GSAP/Anime.js animations |
| [Omegle Feature](./features/omegle-feature.md) | Random chat |
| [Auth](./features/auth.md) | Authentication system |
| [Theme System](./features/theme-system.md) | Theming and fonts |

### Reference
| Document | Covers |
|---|---|
| [Components](./components/README.md) | Component architecture overview |
| [Hooks Reference](./hooks/hooks-reference.md) | All custom hooks |
| [Stores Reference](./stores/stores-reference.md) | All Zustand stores |
| [Types Reference](./types/types-reference.md) | All type definitions |
