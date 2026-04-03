# GAKI Studio — AI Assistant Rules

> **MANDATORY**: Read `docs/INDEX.md` at the start of every session before writing any code.

---

## Project Identity

**GAKI Studio** is an AI-powered, multi-scene streaming and recording studio. It ships as both an **Electron desktop app** and a **browser-based web app** from a single React + TypeScript codebase.

- **Repository root**: `caption-cam/`
- **Web app source**: `src/` (React 18, Vite, Zustand, Tailwind, shadcn/ui)
- **Electron shell**: `electron/` (main process, preload bridge, OBS integration)
- **Documentation**: `docs/` (centralized, cross-linked `.md` files)

---

## Session Start Checklist

1. **Read** `docs/INDEX.md` — understand the documentation structure
2. **Read** `docs/architecture/electron-webapp-bridge.md` — understand how Electron ↔ Webapp connect
3. **Skim** the relevant section docs based on the task:
   - UI / canvas work → `docs/webapp/`
   - Streaming / recording / IPC → `docs/electron/`
   - State management → `docs/architecture/state-management.md`
   - Integrations / APIs → `docs/architecture/integrations.md`

---

## Code Conventions

### Path Alias
- `@/` maps to `src/` (configured in `vite.config.ts` and `tsconfig.json`)

### Feature Modules
- Feature code lives in `src/features/<name>/` with subdirectories: `hooks/`, `ui/`, `lib/`, `services/`, `model/`
- Each feature exports via a barrel `index.ts`

### Zustand Stores
- Stores live in `src/stores/<domain>.store.ts`
- Created with `create<T>()`
- Persistence via `zustand/middleware/persist` where needed (currently only `stream.store.ts`)

### Shared UI
- shadcn/ui components live in `src/shared/ui/`
- Global hooks in `src/hooks/`, shared hooks in `src/shared/hooks/`
- Type definitions in `src/types/`

### Electron IPC
- Main process handlers registered in `setupIpcHandlers()` inside `electron/main.ts`
- Preload bridge exposes typed API via `contextBridge.exposeInMainWorld('electron', {...})`
- Renderer detects Electron via `navigator.userAgent.toLowerCase().includes('electron')`

### Lazy Loading
- All page-level components are `React.lazy()` imported in `App.tsx`

---

## Documentation Rules

### When to Update Docs
- **Any new feature**: Create a new `.md` in the appropriate `docs/` subdirectory
- **Any modified feature**: Update the corresponding `.md` to reflect changes
- **Any new store**: Add to `docs/webapp/stores/stores-reference.md`
- **Any new hook**: Add to `docs/webapp/hooks/hooks-reference.md`
- **Any new type file**: Add to `docs/webapp/types/types-reference.md`
- **Any new IPC channel**: Update both `docs/architecture/ipc-bridge.md` and `docs/electron/preload.md`
- **Any new integration**: Add to `docs/architecture/integrations.md`

### Standard Document Template
Every `.md` in `docs/` must follow this structure:

```markdown
# [Title]

→ Back to [Index](../INDEX.md) | [Parent Section](./README.md)

> Last Updated: YYYY-MM-DD

---

## Overview

[Brief description of what this document covers]

## [Content Sections]

[Technical details, data flows, API references, etc.]

## Related Docs

→ See [Document Name](relative-link)
→ Source: [filename](file:///absolute/path/to/source)
```

### Cross-Reference Conventions
- `→ See [Document Name](relative-link)` — navigates to another doc
- `→ Source: [filename](file:///path)` — links to actual source code
- Type references formatted as `TypeName` with a link to `types-reference.md`
- Store references link to `stores-reference.md#store-name`
- Hook references link to `hooks-reference.md#hook-name`

---

## Key Technical Context

### Two Runtime Modes

| Aspect | Web (Browser) | Desktop (Electron) |
|---|---|---|
| Router | `BrowserRouter` | `HashRouter` |
| Streaming | Not available | RTMP via FFmpeg IPC |
| Recording | In-memory Blob | File-system WebM → MP4 |
| Storage | `localStorage` | `electron-store` |
| Auth | Firebase popup | Custom BrowserWindow OAuth |

### Critical Stores
| Store | File | Role |
|---|---|---|
| `useSceneStore` | `scene.store.ts` | Active scene overlays, filters, camera settings |
| `useSceneCollectionStore` | `sceneCollection.store.ts` | Compositor scenes, sources, grid layouts |
| `useStreamStore` | `stream.store.ts` | Broadcast destinations, recording state |
| `useMediaStore` | `media.store.ts` | Audio/video device management |
| `useStreamHealthStore` | `streamHealth.store.ts` | Real-time stream health metrics |

### Rendering Pipeline
```
Legacy UI (SceneState) → useCompositorSync → legacySceneAdapter
  → sceneCollection.store → CompositorBridge → CompositorWorker (WebGL)
  → OffscreenCanvas → captureStream → FFmpeg → RTMP
```
