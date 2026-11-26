# Refactor Summary (`chore/agent-friendly-cleanup`)

## Overview
Monorepo cleanup, modularization, boundary enforcement, security hardening, and agent-readiness pass across `apps/*` and `packages/*`.

---

## 1. What Was Deleted, Split, and Moved

### Deleted
- **20 verified dead files** (0 static/dynamic imports or config references):
  - `apps/desktop/electron/rtmp-server.ts` (plus `async`, `node-media-server` deps)
  - `apps/web/src/components/studio/{EmptySlot,LiveVideo}.tsx`
  - `apps/web/src/features/ai-assistant/ui/AIChatbot.tsx`
  - `apps/web/src/features/banners/ui/editor/components/{BannerEditableElement,EditableBannerContent}.tsx`
  - `apps/web/src/features/layouts/hooks/useGridMotion.ts`, `layouts/HybridGridScene.tsx`
  - `apps/web/src/features/stream/hooks/useSessionPlayback.ts`, `ui/scenes/{AnimatedStreamScene,StreamSceneRenderer}.tsx`
  - `apps/web/src/features/studio/ui/controls/OBSImportButton.tsx`
  - `apps/web/src/integrations/supabase/client.ts`
  - `apps/web/src/lib/{customStyles,effects,filters,obsParser}.ts`
  - `apps/web/src/store/{useHardwareStore,useSceneStore}.ts`, `apps/web/src/stores/history.store.ts`
- **77 unused dependencies & 12 unused devDependencies** pruned across 7 workspace `package.json` files (plus 3 unused `pnpm-workspace.yaml` catalog entries).
- **Per-package `CLAUDE.md` files** removed and consolidated into root `AGENTS.md` + per-workspace `AGENTS.md` files (with root `CLAUDE.md` and `GEMINI.md` pointers).

### Split
1. `apps/web/src/index.css` (4,197 lines) -> `styles/{tokens,components,animations,cinematic,mobile}.css`
2. `apps/web/src/features/stream/ui/futuristic-canvas.tsx` (3,840 lines) -> `futuristic-canvas/{types,helpers,effects-cosmic,effects-artistic,effects-waves,effects-social,effects-geometry}.ts`
3. `apps/web/src/features/stream/services/stream.service.ts` -> extracted `stream-audio-dsp.ts`, `stream-recording.ts`, `stream.types.ts`, and `stream-publisher.ts` (270 lines; audio DSP constants preserved untouched)
4. `apps/web/src/features/studio/ui/panels/AudioMixerPanel.tsx` -> `audio-mixer/{MixerControls,TrackRow}.tsx`
5. `apps/web/src/lib/streamSceneDesigns.ts` -> `stream-scene-designs/{types,live-scenes,outro-scenes}.ts`
6. `apps/web/src/features/animation/lib/gsapAnimations.ts` -> `gsap/{types,creators-motion,creators-fx,presets}.ts`
7. `apps/web/src/features/theme/model/theme.store.ts` -> `theme.types.ts`, `theme.presets.ts`, `theme.store.ts`
8. `apps/web/src/pages/Mobile/components/MobileCanvasContainer.tsx` -> extracted `useMobileSceneAdapter.ts`
9. `apps/web/src/pages/Index/hooks/useSceneManager.ts` -> extracted `scene-manager/{sceneDefaults,streamStyleSubscenes}.ts`
10. `apps/web/src/pages/Mobile/pages/MobileStudioPage.tsx` -> extracted `MobileStudioToolPanel.tsx`

### Moved
- `ToastProps` / `ToastActionElement` moved from `@gaki/ui/toast` -> `@gaki/core/types/toast` (broke `@gaki/core` <-> `@gaki/ui` cycle).
- `packages/core/src/types/videoCanvas.ts` -> `apps/web/src/types/videoCanvas.ts` (removed package-to-app dependency).
- `TriToneConfig` / `AnimeStyles` moved to `packages/engine/src/kernel/engine/animeStylesStore.ts`; `apps/web/src/lib/animeStyles.ts` re-exports from engine.
- `VITE_TWITCH_CLIENT_SECRET`, `VITE_DEEPGRAM_API_KEY`, and `VITE_GEMINI_API_KEY` moved behind hardened Netlify functions (`twitch-token.ts`, `deepgram-token.ts`, `gemini-proxy.ts`) with strict origin allowlists, per-IP rate limits, and Firebase Auth verification on AI/STT endpoints.

---

## 2. Metrics

| Metric | Before (`main`) | After (`HEAD`) |
|---|---:|---:|
| Tracked files (`git ls-tree`) | 869 | 762 |
| Package boundary violations (`dependency-cruiser`) | Multiple cycles & app-alias leaks | **0** (766 modules, 1,791 deps) |
| Comment lines in `ts/tsx/js/jsx` diff | — | **1,594 removed**, 459 added (**net -1,135**) |
| Remaining files > 300 lines (`apps/`, `packages/`) | — | **104** (top: `animations.css` 2210, `tokens.css` 1556, `effects-geometry.ts` 1203, `stream.service.ts` ~675, `CinematicOverlay.tsx` 970) |
| ESLint errors | 17 (mobile) + web errors | **0** across all 12 workspaces |
| ESLint warnings (`@gaki/web` / `@gaki/mobile`) | Uncapped | **594** (`--max-warnings 594`) / **14** (`--max-warnings 14`) |
| `knip` dead-code issues | 23 files, 77 deps, 12 devDeps, 7 unresolved imports | **0** (`exclude: ["exports", "types", "duplicates"]`) |
| Automated Vitest tests | 1 dummy test (mobile) | **52 tests** across 6 workspaces (18 core, 4 engine, 24 web, 3 signaling, 2 handoff-sdk, 1 mobile) |

---

## 3. Remaining Lint Warnings & Knip Findings
- **`@gaki/web` (594 warnings, ceiling `--max-warnings 594`):** Dominated by `@typescript-eslint/no-explicit-any` (~479), `react-refresh/only-export-components` (34), `react-hooks/exhaustive-deps` (34), `@typescript-eslint/no-unused-expressions` (11), and `prefer-const` (9).
- **`@gaki/mobile` (14 warnings, ceiling `--max-warnings 14`):** `no-console` (6), `react-refresh/only-export-components` (5), `react-hooks/exhaustive-deps` (2), unused eslint-disable (1).
- **`knip`:** 0 blocking issues. `exports`, `types`, and `duplicates` are excluded in `knip.ts` while legacy unused exports (138) are pruned incrementally.

---

## 4. Risky Items for Manual Review
1. **Known `zIndex.ts` tie at `10000` (left unchanged):** `zIndex.streamModal` and `zIndex.fileVaultPreview` in `apps/web/src/lib/zIndex.ts` both equal `10000`. If a user opens `FileVaultPanel` preview while `StreamConfigurationModal` is open, they will tie at `10000`. Decision deferred to repo owner.
2. **Netlify functions auth & origins:** `deepgram-token.ts` and `gemini-proxy.ts` now require `Authorization: Bearer <firebase-id-token>` and `FIREBASE_WEB_API_KEY` (or `VITE_FIREBASE_API_KEY`) + `ALLOWED_ORIGINS` configured in Netlify production env vars. `twitch-token.ts` and `kick-proxy.ts` remain accessible without sign-in so public `/platform` discovery works, protected by strict origin allowlist and per-IP rate limiting.
3. **Kick client secret:** `KICK_CLIENT_SECRET` has no `VITE_` client exposure and is not yet wired to a `kick-token` Netlify function (`kick-proxy.ts` proxies public Kick v1 endpoints).
4. **Deleted dead files & deps:** Verified 0 references across `apps/`, `packages/`, and configs, but click-through testing of `apps/web` and `apps/desktop` is recommended before merging.
5. **Untracked local `apps/web/.env`:** Still contains legacy `VITE_TWITCH_CLIENT_SECRET`, `VITE_KICK_CLIENT_SECRET`, `VITE_DEEPGRAM_API_KEY` keys locally; rotate/clean locally.

---

## 5. Three-Task Agent Test

### Task A: Fix a multistream publisher bug
- **Files an agent reads (4 files, all <= 300 lines):**
  1. `apps/web/AGENTS.md` (50 lines)
  2. `apps/web/src/features/stream/services/stream-publisher.ts` (270 lines — extracted from `stream.service.ts` specifically so this task stays under 300 lines)
  3. `apps/web/src/stores/stream.store.ts` (125 lines)
  4. `apps/web/src/__tests__/stream.service.test.ts` (225 lines)
- **Result:** Pass (4 files, max 270 lines).

### Task B: Add a UI component
- **Files an agent reads (4 files, all <= 300 lines):**
  1. `packages/ui/AGENTS.md` (31 lines)
  2. `packages/ui/package.json` (~65 lines)
  3. `packages/core/src/lib/utils.ts` (~40 lines)
  4. `apps/web/src/lib/zIndex.ts` (40 lines, if layered)
- **Result:** Pass (4 files, max ~65 lines).

### Task C: Add an API route
- **Files an agent reads (4 files, all <= 300 lines):**
  1. `apps/web/netlify/functions/_security.ts` (175 lines)
  2. `apps/web/netlify.toml` (55 lines)
  3. `apps/web/src/__tests__/netlify-functions.test.ts` (~180 lines)
  4. *(Or for Handoff API)* `apps/api-handoff/src/index.ts` (92 lines) + `apps/api-handoff/AGENTS.md` (28 lines)
- **Result:** Pass (3–4 files, max 180 lines).
