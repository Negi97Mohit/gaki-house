# @gaki/engine

## 🗺️ What This Is
The WebGL/Canvas/Audio kernel pipeline. Contains the `BroadcastBus` (OffscreenCanvas worker manager), audio mixer, scene graph, GL renderer, shader manager, OBS parser, and anime-style post-processing store.

## 📁 Directory Map
- `src/kernel/engine/` — Core rendering subsystem:
  - `BroadcastBus.ts` — OffscreenCanvas worker coordinator (**FRAGILE**: see below)
  - `AudioMixerEngine.ts`, `BroadcastEncoder.ts`, `BroadcastLogger.ts`
  - `GLContext.ts`, `GLRenderer.ts`, `SceneGraph.ts`, `ShaderManager.ts`
  - `EngineWatchdog.ts`, `StateSynchronizer.ts`, `TimeWarp.ts`, `TransitionEngine.ts`
  - `VideoTexture.ts`
  - `animeStylesStore.ts` — Mutable `AnimeStyles` record + `updateAnimeStyles()`
  - `shaders/` — GLSL shader strings (gridShaders, liquidShader)
- `src/kernel/hooks/` — `useOverlayMediaPool`
- `src/obs/` — `OBSParser.ts`, `OBSSourceMapper.ts`

## 🔴 Known Broken
- **BroadcastBus scene transitions** — Re-instantiates on scene switch (tied to CanvasView). Must be lifted to CanvasContainer to survive scene changes. This is Priority #1 per AGENTS.md.

## 🚫 What NOT to Touch
- **OffscreenCanvas:** Must be TRANSFERRED via `transferControlToOffscreen()`, never copied.
- **BroadcastBus:** Never instantiate inside a React render cycle.
- **Do NOT import app aliases (`@/...`)** — only `@gaki/core` workspace imports are allowed.

## 🧪 Testing
- **How to run:** `pnpm test` (vitest run, node env)
- **What's covered:** `animeStylesStore.ts` — 4 tests (merge, overwrite, shape)
- **Config:** `vitest.config.ts`

---

> [2026-11-25] Created CLAUDE.md. Added vitest smoke tests (4 tests: animeStylesStore). Status: 🟡 UNSTABLE (BroadcastBus scene transitions broken). Agent: Antigravity.
