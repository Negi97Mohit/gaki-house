# Gaps & TODOs

→ Back to [Index](../INDEX.md) | [Overview](./README.md)

---

This document tracks known gaps, incomplete features, and technical debt in the codebase.

## Architecture Gaps

### No Error Boundaries
The application has **no React Error Boundaries**. A single component crash (e.g., in the canvas renderer) will bring down the entire app. Error boundaries should wrap:
- `VideoCanvas` (the most side-effect-heavy component)
- Each `Draggable*` component
- The `Excalidraw` integration
- Platform page routes

### Deprecated APIs in Use
- `document.execCommand()` is used in `TextEditingToolbar` for rich text formatting (bold, italic, lists). This is a deprecated API. Should migrate to a proper rich text editor (Tiptap, Slate, or Lexical).

### Circular JSON Risk
- `rc-dock` layout persistence can produce circular JSON references when serializing, causing crashes. This was identified in previous conversations and may still be partially unresolved.

### No Service Worker / PWA
- No offline capability or service worker registration.

## Feature Gaps

### Stream Feature
- [x] Stream health monitoring (dropped frames, bitrate display) — See [Streaming](../electron/streaming.md)
- [ ] Stream preview before going live
- [ ] Multi-bitrate encoding options
- [ ] Stream key validation before connecting

### Recording Feature
- [ ] keyframe-based session recording is web-only and uses `localStorage` (size-limited)
- [ ] No video editing timeline (trim, cut, split)
- [ ] No export format options (only WebM/MP4)

### Canvas System
- [x] **Compositor replaced**: DOM-based `captureStream()` replaced with WebGL compositor (OffscreenCanvas + Web Worker) — See [Compositor](../electron/compositor.md)
- [x] **Scene model upgraded**: Flat overlay arrays replaced with OBS-compatible hierarchical `CompositorSource` model — See [compositor.ts](file:///c:/Users/Dell/Desktop/caption-cam/src/types/compositor.ts)
- [x] **Grid layout compositing**: Grid section panels now supported natively in the compositor
- [x] **Source grouping**: Group source type now supported in the scene model
- [ ] `useCanvasRenderer.ts` hook appears deprecated/superseded by `CameraRenderer.tsx`
- [ ] Empty component directories: `src/components/audio/`, `src/components/canvas/`, `src/components/chat/`, `src/components/obs/`, `src/components/filters/` — all are stubs
- [ ] No ruler/grid overlay for precise positioning

### AI Engine
- [ ] AI-generated overlays run in sandboxed iframes but have no content security policy
- [ ] No conversation history / context window management
- [ ] No rate limiting on Gemini API calls from the client

### Platform
- [ ] Most platform pages (Browse, Clips, Dashboard) likely use mock/seed data
- [ ] No actual RTMP ingest server for the platform
- [ ] Chat system appears incomplete

### OBS Integration
- [x] **Compositor engine built**: WebGL compositor with OBS-compatible source model — See [Compositor](../electron/compositor.md)
- [x] **Scene collection store**: Full Zustand store with CRUD for scenes, sources, filters, audio — See [sceneCollection.store](file:///c:/Users/Dell/Desktop/caption-cam/src/stores/sceneCollection.store.ts)
- [x] **Type system**: Complete OBS-compatible type definitions — See [compositor.ts](file:///c:/Users/Dell/Desktop/caption-cam/src/types/compositor.ts)
- [x] **Scene collection importers**: OBS JSON parser + Streamlabs .overlay parser — See [obsImporter.ts](file:///c:/Users/Dell/Desktop/caption-cam/src/services/importers/obsImporter.ts)
- [x] **Export to OBS-compatible JSON**: Round-trip export — See [sceneExporter.ts](file:///c:/Users/Dell/Desktop/caption-cam/src/services/importers/sceneExporter.ts)
- [x] **IPC handlers**: File dialog integration for import/export — See [main.ts](file:///c:/Users/Dell/Desktop/caption-cam/electron/main.ts) section 7

### Mobile
- [ ] Mobile pages exist but may lack feature parity with desktop
- [ ] No native mobile app (React Native or Capacitor)

## Technical Debt

### Code Organization
- [ ] Several deprecated/unused components still in codebase: `CaptionEditor.tsx`, `FloatingControls.tsx`, `TemplateSelector.tsx`, `TopToolbar.tsx`
- [ ] `types/layout.ts` is likely superseded by types in `types/caption.ts`
- [ ] Root-level log/debug files should be gitignored: `build_debug.log`, `build_log.txt`, `lint_output.txt`, `tsc_error.txt`, etc.
- [ ] `__pycache__/` directory and `.py` files at root level should be in separate backend directory

### Performance
- [ ] `VideoCanvas.tsx` is ~1000 LOC with many side effects — should be decomposed further
- [ ] `Index.tsx` is ~860 LOC managing all scene state — partially migrated to Zustand stores
- [ ] `src/index.css` is 113KB — should be split or generated
- [ ] No lazy loading of heavy libraries (MediaPipe, Three.js) at component level

### Testing
- [ ] **No unit tests** exist in the codebase
- [ ] **No integration tests** exist
- [ ] **No E2E tests** exist
- [ ] No CI/CD pipeline for automated testing

### Security
- [ ] API keys are exposed client-side via `VITE_*` env vars
- [ ] No CORS configuration beyond dev proxy
- [ ] Firebase security rules not documented
- [ ] `dangerouslySetInnerHTML` used for text overlay content

## Recently Resolved

### Phase 1: Compositor Overhaul (Completed)
- [x] WebGL compositor engine (OffscreenCanvas + Web Worker)
- [x] Hardware Encoding integration (NVENC, QSV, AMF)
- [x] WebAudio API based global Audio Mixer Engine
- [x] OBS-style Stinger Engine (WebGL texture-mapping .webm files)
- [x] `StingerController` and `local-asset://` file server implementation
- [x] IPC bridged Stream Health Telemetry Hub (fluent-ffmpeg progress sync)
- [x] Universal `SceneCollection` Vault (`.overlay` / `zip` unpacker support)
- [x] OBS-compatible source model with 14 source types
- [x] Scene collection Zustand store with full CRUD
- [x] GPU-accelerated transitions (10 types: cut, fade, slide, wipe, zoom, blur)
- [x] Per-source filter pipeline (color correction, chroma key)
- [x] Grid layout compositing (sources fit into grid cells)
- [x] Preview frame pipeline (compositor → main thread → UI canvas)
- [x] Output MediaStream pipeline (compositor → captureStream → FFmpeg)

→ See [Compositor Architecture](../electron/compositor.md) for details

### Phase 2: Source Model & Legacy Integration (Completed)
- [x] Source factory functions for all 14 source types
- [x] Legacy SceneState ↔ CompositorScene bidirectional adapter
- [x] Compositor sync hook (useCompositorSync) wired into editor orchestrator

→ See [compositor.md § Legacy Bridge Flow](../electron/compositor.md#legacy-bridge-flow)

### Phase 3: Scene Collection Import/Export (Completed)
- [x] OBS Studio JSON parser with full source type mapping (30+ OBS types)
- [x] ABGR color conversion, filter chain reconstruction, group hierarchy
- [x] Streamlabs .overlay/.zip importer with widget-to-source mapping
- [x] OBS-compatible JSON exporter with round-trip fidelity
- [x] Electron IPC handlers (file dialogs for import/export/asset resolution)
- [x] Preload API exposure (window.electron.import / window.electron.export)
- [x] Shared type system covering OBS + Streamlabs format definitions

→ See [OBS Compositor](../electron/obs-compositor.md) for details

---

## Cleanup Items
- [ ] Delete `md_files_list.txt` (temporary)
- [ ] Delete root-level log files: `*.log`, `*.txt` (build artifacts)
- [ ] Delete `robust_fix.js`, `scan_file.js`, `apply-snap-edits.ps1`, `fix_imports_final.ps1` (one-off scripts)
- [ ] Delete `UTF8` file (artifact)
- [ ] Move `MLSHARP_COLAB_UPDATED.py` and `modal_backend.py` to a `backend/` directory
