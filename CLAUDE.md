# GAKI Monorepo — Root CLAUDE.md

## 🗺️ What This Is
A **pnpm monorepo** managed by **Turborepo** for the GAKI live streaming platform — a production-grade browser and desktop studio that lets creators broadcast to multiple platforms simultaneously, with OBS scene imports, AI features, and cross-device handoff.

## 📁 Workspace Map

### Apps
| Path | Status | Description |
|---|---|---|
| `apps/web` | 🟢 PRODUCTION | React/Vite main studio — broadcast mixer, canvas compositor, multi-platform streaming |
| `apps/gaki-mobile` | 🟡 UNKNOWN | Mobile PWA — remote stream deck + camera source |
| `apps/desktop` | 🟡 UNKNOWN | Electron wrapper around `apps/web` + FFmpeg pipe |
| `apps/api-handoff` | 🟡 UNSTABLE | Express server — vends LiveKit tokens for handoff sessions |
| `apps/api-signaling` | 🟡 UNKNOWN | Socket.io WebRTC broker — powers Omegle Mode matching |
| `apps/ml-backend` | 🟡 UNKNOWN | Modal FastAPI — T4 GPU inference + ML-Sharp bridge |

### Packages
| Path | Status | Description |
|---|---|---|
| `packages/core` | 🟢 PRODUCTION | Shared types, constants, utility hooks |
| `packages/engine` | 🟡 UNSTABLE | WebGL/Canvas/Audio kernel pipeline |
| `packages/handoff-sdk` | 🟡 UNSTABLE | Cross-device streaming coordination SDK |
| `packages/ui` | 🟢 PRODUCTION | Radix UI component library |

## 🔌 External Services
- **Firebase** — Auth + Realtime Database
- **Supabase** — Backend Database + RLS
- **LiveKit** — Cross-device handoff infrastructure
- **Kick/Twitch/YouTube/Rumble/DLive/Trovo APIs** — Stream metadata and platform detection

## 🔴 Known Broken
- **Seamless Scene Transitions** — `BroadcastBus` in `packages/engine` re-instantiates on scene switch, breaking the stream briefly
- **Root CLAUDE.md was missing** — Created 2026-10-06

## 🟢 Recently Fixed
- **BroadcastStatsPanel contrast** — Was using `bg-background/30` (invisible). Now uses solid `bg-zinc-900/95` with hardcoded text colors for guaranteed readability
- **BroadcastStatsPanel auto-hide** — Was using independent corner-hover logic. Now syncs with `useMouseStore.isMouseActive` (same as BottomNavigation)

## 📋 Key Commands
```bash
pnpm install                                          # Install all deps
pnpm turbo run dev --filter=web                       # Dev the web studio
pnpm turbo run dev --filter=web --filter=api-signaling # Dev with signaling
pnpm turbo run build --filter=desktop                 # Build Electron
```

## 🚫 Monorepo Rules
See [AGENTS.md](AGENTS.md) for the full list. Critical ones:
- Never `npm install` inside an app — use `pnpm add` from root
- Never hardcode z-index — use `apps/web/src/lib/zIndex.ts`
- Never modify audio DSP constants in `stream.service.ts`
- Never copy OffscreenCanvas — must be **transferred**

---

> [2026-10-06] Created root CLAUDE.md. Cleaned up stale audit files (audit.md, CLEAN&PROD.md, diagnotis.md, PRODUCTION.md). Agent: Antigravity.
