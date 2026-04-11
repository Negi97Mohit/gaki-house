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
- [ ] Stream health monitoring (dropped frames, bitrate display)
- [ ] Stream preview before going live
- [ ] Multi-bitrate encoding options
- [ ] Stream key validation before connecting

### Recording Feature
- [ ] keyframe-based session recording is web-only and uses `localStorage` (size-limited)
- [ ] No video editing timeline (trim, cut, split)
- [ ] No export format options (only WebM/MP4)

### Canvas System
- [ ] `useCanvasRenderer.ts` hook appears deprecated/superseded by `CameraRenderer.tsx`
- [ ] Empty component directories: `src/components/audio/`, `src/components/canvas/`, `src/components/chat/`, `src/components/obs/`, `src/components/filters/` — all are stubs
- [ ] Canvas does not support grouping or locking elements
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
- [ ] Scene collection importers (OBS/Streamlabs) are partially implemented
- [ ] `electron/obs/compositor/` and `electron/obs/sources/` exist but may be incomplete
- [ ] No support for OBS WebSocket protocol

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

## Cleanup Items
- [ ] Delete `md_files_list.txt` (temporary)
- [ ] Delete root-level log files: `*.log`, `*.txt` (build artifacts)
- [ ] Delete `robust_fix.js`, `scan_file.js`, `apply-snap-edits.ps1`, `fix_imports_final.ps1` (one-off scripts)
- [ ] Delete `UTF8` file (artifact)
- [ ] Move `MLSHARP_COLAB_UPDATED.py` and `modal_backend.py` to a `backend/` directory
