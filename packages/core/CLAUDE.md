# @gaki/core

## 🗺️ What This Is
Shared types, constants, and utility hooks used by every app and package in the monorepo. Zero app-level dependencies.

## 📁 Directory Map
- `src/constants/` — Color presets, visual constants
- `src/hooks/` — `useMobile`, `useToast`, `useLocalStorage`, `useRAFThrottle`
- `src/lib/` — `cn` (class merge), `generateId`, `notify` (sonner wrapper), `throttle`/`debounce`, keyboard shortcuts, color utils
- `src/types/` — Shared TypeScript types: `caption`, `banner`, `toast`, `streamStyle`, `textDesign`, `vault`, `omegle`, etc.

## 🟢 Working Features
- All utility functions (cn, generateId, throttle, debounce, notify) — tested
- All types exported via `exports` map

## 🚫 What NOT to Touch
- Do NOT import from any app or `@gaki/ui` — this package must remain a leaf (no circular deps)
- Do NOT use `NodeJS.*` types — this is browser-targeted

## 🧪 Testing
- **How to run:** `pnpm test` (vitest run, node env)
- **What's covered:** `id.ts`, `notify.ts`, `utils.ts` — 18 tests total
- **Config:** `vitest.config.ts`

---

> [2026-11-25] Created CLAUDE.md. Added vitest smoke tests (18 tests: id, notify, utils). Status: 🟢 PRODUCTION. Agent: Antigravity.
