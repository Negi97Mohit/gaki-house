# Development Guide

→ Back to [Index](../INDEX.md) | [Overview](./README.md)

> Last Updated: 2026-04-03

---

## Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x (or **bun** — a `bun.lock` exists)
- **Git**
- For Electron builds: platform-specific build tools (see electron-builder docs)

## Quick Start

### 1. Clone & Install

```bash
git clone <repo-url> caption-cam
cd caption-cam
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in the API keys:

```bash
cp .env.example .env.local
```

→ See [Tech Stack](./tech-stack.md) for the full list of required env vars.

### 3. Run Web App (Development)

```bash
npm run dev
```

This starts Vite on `http://localhost:5173` with HMR.

### 4. Run Electron App (Development)

```bash
npm run electron:dev
```

This runs `concurrently`:
1. `npm run dev` — starts Vite dev server
2. `npm run electron:compile && wait-on tcp:5173 && electron .` — compiles TS → JS, waits for Vite, then launches Electron

### 5. Build for Production

**Web only:**
```bash
npm run build
```

**Electron installer:**
```bash
npm run electron:build
```

This runs `vite build` → `tsc` (electron) → `electron-builder`. Output goes to `/release/`.

## NPM Scripts Reference

| Script | Description |
|---|---|
| `dev` | Start Vite dev server on port 5173 |
| `build` | Type-check + production Vite build (8GB heap) |
| `build:dev` | Development-mode Vite build |
| `build:vite` | Vite build only (no type-check) |
| `type-check` | Run `tsc --noEmit` |
| `lint` | Run ESLint |
| `preview` | Preview production build |
| `analyze` | Visualize bundle size |
| `electron:compile` | Compile Electron TS to JS + generate config |
| `electron:dev` | Run Vite + Electron concurrently |
| `electron:build` | Full production build + electron-builder |

## Code Architecture Conventions

1. **Feature modules** live in `src/features/<name>/` with `hooks/`, `ui/`, `lib/`, `services/` subdirectories
2. **Zustand stores** live in `src/stores/` with the naming convention `<domain>.store.ts`
3. **Shared UI components** (shadcn/ui) live in `src/shared/ui/`
4. **Path alias**: `@/` maps to `src/` (configured in `vite.config.ts` and `tsconfig.json`)
5. **Lazy loading**: All page-level components are `lazy()` imported in `App.tsx`

## Build Configuration

### Vite (`vite.config.ts`)
- `base: "./"` — relative paths for Electron file:// compatibility
- Custom `youtubeLiveLocalPlugin` for dev-time YouTube API proxy
- Manual chunks: `mediapipe`, `firebase`, `vendor`
- External: `node-media-server`, `fluent-ffmpeg`, `ffmpeg-static`, `electron`
- Dev proxy: `/api/kick` → kick.com, `/api/dlive` → DLive

### Electron Builder (`package.json > build`)
- App ID: `com.gaki.studio`
- Platforms: Windows (NSIS), macOS (DMG universal), Linux (AppImage, deb)
- Files: `dist/**/*` + `electron/dist/**/*`
- Compression: `store` (fast builds, larger output)

### TypeScript
- `tsconfig.json` — project references to `tsconfig.app.json` and `tsconfig.node.json`
- Strict mode enabled
- Path alias: `@/*` → `src/*`

## Deployment

### Web (Netlify)
- Auto-deploy from Git (configured in `netlify.toml`)
- Build command: `npm run build`
- Publish directory: `dist`
- Serverless functions in `netlify/functions/`

### HuggingFace Spaces
- Deployment instructions in `huggingface-deployment/`
- Uses a Gradio or Docker-based deployment

### ML-Sharp Backend (Google Colab)
- Run the `MLSHARP_COLAB_UPDATED.py` notebook in Google Colab
- Exposes an ngrok URL — set `VITE_MLSHARP_API_URL` in `.env.local`
- URL changes on every Colab restart
