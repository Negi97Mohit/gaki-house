# 🤖 GAKI Monorepo — Agent Standing Orders
> **For:** Antigravity Agent (persistent workspace instructions)
> **Goal:** Ship every app in this monorepo to production grade.
> **Rule #1:** If you are unsure about anything, STOP and read the relevant CLAUDE.md before touching code.

---

## 🔴 MANDATORY BOOT SEQUENCE
**Every single session, before writing a single line of code:**

```
1. Read  →  /CLAUDE.md                          (root monorepo overview)
2. Read  →  /apps/<relevant-app>/CLAUDE.md      (the app you are working in)
3. Read  →  /packages/<relevant-pkg>/CLAUDE.md  (any package you will touch)
4. Scan  →  The 🔴 Known Broken section of every CLAUDE.md you read
5. Confirm → You understand the current status before proceeding
```

Do not skip this even if the task seems trivial.
A 30-second read prevents a 3-hour regression.

---

## 📍 MONOREPO MAP
This is a **pnpm monorepo** using **Turborepo**.

### Apps
| Path | What It Is | CLAUDE.md |
|---|---|---|
| `apps/web` | Main browser studio — React/Vite broadcast mixer | ✅ Exists |
| `apps/gaki-mobile` | Mobile PWA — remote stream deck + camera source | ✅ Exists |
| `apps/desktop` | Electron wrapper around `apps/web` + FFmpeg pipe | ✅ Exists |
| `apps/api-handoff` | Express server — vends LiveKit tokens for handoff sessions | ✅ Exists |
| `apps/api-signaling` | Socket.io WebRTC broker — powers Omegle Mode matching | ✅ Exists |
| `apps/ml-backend` | Modal FastAPI — T4 GPU inference + ML-Sharp bridge | ✅ Exists |

### Packages
| Path | What It Is | CLAUDE.md |
|---|---|---|
| `packages/core` | Shared types, constants, utility hooks | ✅ Exists |
| `packages/engine` | WebGL/Canvas/Audio kernel pipeline | ✅ Exists |
| `packages/handoff-sdk` | Cross-device streaming coordination SDK | ✅ Exists |
| `packages/ui` | Radix UI component library | ✅ Exists |

**Never** treat these as independent projects. Every change can cascade.

---

## 🧠 HOW TO THINK ABOUT EVERY TASK

Before writing a single line of code, answer these 5 questions in your reasoning:

```
1. SCOPE    — Which apps AND packages does this task touch?
2. STATUS   — What does the CLAUDE.md say about the current state of that area?
3. RISK     — What is in the 🚫 "Do Not Touch" section that is nearby?
4. CONTRACT — What does this module expose to other apps? Will I break it?
5. GOAL     — Does my solution move this toward production grade, or just patch?
```

If you cannot answer all 5, read more code before acting.

---

## 🏗️ PRODUCTION GRADE DEFINITION
> A feature is **production grade** when ALL of the following are true:

- [ ] No `console.log`, `TODO`, `FIXME`, or `throw new Error("not implemented")` in the hot path
- [ ] No hardcoded secrets, test keys, or localhost URLs (except documented OAuth exceptions)
- [ ] Error states are handled — network failures, permission denials, stream drops, GPU timeouts
- [ ] No silent failures — the user sees clear feedback when something goes wrong
- [ ] TypeScript strict mode passes with zero `any` escapes in new code
- [ ] Environment variables are validated at startup with a clear error if missing
- [ ] The relevant CLAUDE.md status is updated to 🟢
- [ ] If you added a workaround or non-obvious pattern, it is in 🧠 Business Logic

---

## 🎯 CURRENT PRODUCTION TARGETS (Priority Order)

Work top-to-bottom. Do not start a lower priority while a higher one is 🔴.
Update this table in the CLAUDE.md after every task that changes a status.

| # | Target | Touches | Status | Done When |
|---|---|---|---|---|
| 1 | Seamless scene transitions | `apps/web`, `packages/engine` | 🔴 BROKEN | `BroadcastBus` survives scene switches, zero stream drop |
| 2 | Cross-device handoff lifecycle | `apps/web`, `apps/api-handoff`, `packages/handoff-sdk` | 🟡 UNSTABLE | Full start → transfer → resume with no dropped frames or auth failures |
| 3 | Desktop Electron build | `apps/desktop` | 🟡 UNKNOWN | Clean build, auto-update working, native window capture confirmed |
| 4 | Mobile streaming client | `apps/gaki-mobile` | 🟡 UNKNOWN | Go-live from mobile with camera + effects confirmed working end-to-end |
| 5 | ML backend integration | `apps/ml-backend`, `apps/web` | 🟡 UNKNOWN | At least one ML feature returning real inference from Modal in production |
| 6 | Signaling server hardening | `apps/api-signaling` | 🟡 UNKNOWN | Connection drops handled, rooms cleaned up, deployed with health checks |

---

## 🔁 AFTER EVERY COMPLETED TASK — UPDATE THE CLAUDE.md

This is **not optional**. After every task, for every CLAUDE.md of every file you touched:

```
1. Update the status of any feature you changed   (🔴 → 🟡 → 🟢)
2. If you discovered a non-obvious behavior       → add it to 🧠 Business Logic
3. If you found a new fragile pattern             → add it to 🚫 What NOT to Touch
4. If you fixed a 🔴 Known Broken item           → move it to 🟢 Working Features
5. If you introduced a new feature or file        → add it to 📁 Directory Map
6. Append a changelog line at the bottom:
```

```
> [YYYY-MM-DD] Fixed X in file Y. Status: 🔴 → 🟢. Agent: Antigravity.
```

If the CLAUDE.md was not updated, **the task is not done.**

---

## 🚨 WHEN YOU ARE STUCK — RECOVERY PROTOCOL

Run these steps in order. Stop at the first one that unblocks you.

```
STEP 1 → Re-read 🧠 Business Logic in the relevant CLAUDE.md.
          The answer is probably already documented.

STEP 2 → Search the codebase for the exact error message or function name.
          Look for other call sites — the pattern is likely used elsewhere.

STEP 3 → Check 🔴 Known Broken.
          You may be hitting a documented bug, not one you introduced.

STEP 4 → Read the primary Zustand store for the feature area.
          Stores in src/stores/ are the source of truth. Start there.

STEP 5 → Check if the behavior differs between Electron and Web.
          Look for `window.__IS_ELECTRON__` guards — many bugs are env-specific.

STEP 6 → Check cross-app contracts.
          If the bug is in api-handoff or api-signaling, check what apps/web
          and packages/handoff-sdk expect from those services.

STEP 7 → If you are about to break a 🚫 rule, STOP.
          Document why the rule should change. Do not silently break it.
```

---

## ⚙️ MONOREPO RULES — NEVER BREAK THESE

### Package Management
- **Never** `npm install` inside an app. Use `pnpm add` from the monorepo root.
- **Never** duplicate a utility that exists in `@gaki/core` or `@gaki/ui`.
- **Always** check `packages/core/src/types/` before defining a new TypeScript type.
- New shared utilities belong in `packages/core`, not inside any app.

### State Management (`apps/web`, `apps/gaki-mobile`)
- Global state lives in Zustand stores (`src/stores/`). Do not create React Context for global state.
- For high-frequency updates (pointer, audio frame ticks), use `store.subscribe()` not React re-renders.
- Stores are the single source of truth. If UI and store disagree, fix the store, not the UI.

### Z-Index (`apps/web`)
- **Never** write a raw `z-index` number in CSS or Tailwind anywhere.
- All z-index values live in `apps/web/src/lib/zIndex.ts` as named constants.
- Adding a new visual layer = add a named constant first, then use it.

### Audio DSP (`apps/web` — `stream.service.ts`)
- Do not modify noise gate thresholds, attack/release times, or the -48/-40 dBFS rules.
- These were tuned to fix audio chopping and breathing artifacts in production.
- Audio routing changes can cause feedback loops that are invisible in dev.

### WebGL / OffscreenCanvas (`packages/engine`)
- Do not **copy** the OffscreenCanvas. It must be **transferred** via `transferControlToOffscreen()`.
- Do not re-instantiate `BroadcastBus` inside React component renders.
- `BroadcastBus` must live above the scene tree and survive scene switches.

### Electron OAuth (`apps/desktop`)
- The Google OAuth redirect must remain `http://localhost:3456`.
- Custom domains fail silently inside Electron wrappers. Do not change this.

### LiveKit / Handoff (`apps/api-handoff`, `packages/handoff-sdk`)
- Tokens are short-lived. Do not cache them client-side between sessions.
- The handoff coordinator assumes a single active room per device pair. Do not create parallel rooms.

### ML Backend (`apps/ml-backend`)
- Modal cold starts can take 10–30 seconds on T4 GPU containers. The client must handle this with a timeout and user feedback, not a silent spinner.
- The ML-Sharp subprocess is Apple Silicon only. Do not call it in the Modal cloud container path.

### Environment Variables (all apps)
- Never hardcode a key anywhere.
- Every new env var must be added to the app's `.env.example` with a comment explaining its purpose.
- Apps must validate required env vars at startup and throw a named error if missing.

---

## 📝 STATUS LEGEND
Use these consistently across every CLAUDE.md in the monorepo:

| Icon | Meaning |
|---|---|
| 🟢 **PRODUCTION** | Working in production, no known issues |
| 🟡 **UNSTABLE** | Works in dev or partially, known prod issues |
| 🟡 **UNKNOWN** | Cannot verify without running the app |
| 🟡 **IN PROGRESS** | Actively being built, not yet shippable |
| 🔴 **BROKEN** | Does not work, documented bug |
| 🔴 **DISABLED** | Intentionally off, needs work to re-enable |
| ⚫ **STUB** | File exists, logic not implemented |

---

## ✅ TASK COMPLETE TEMPLATE
End **every** response with this block. No exceptions.

```
## ✅ Task Complete

**Files modified:**
  - path/to/file.ts — what changed

**CLAUDE.md updated:** YES / NO
  - If NO: reason why

**Status changes:**
  - `FeatureName` in `apps/X` → was 🔴, now 🟡 (what changed and why)

**Remaining blockers:**
  - Anything still broken, at risk, or dependent on another task

**Next recommended task:**
  - What to do next, referencing the priority table above
```

---

## ☠️ HARD STOPS — NEVER DO THESE UNDER ANY CIRCUMSTANCES

1. Modifying audio DSP constants in `stream.service.ts` without explicit user instruction
2. Writing a raw `z-index` number anywhere outside `zIndex.ts`
3. Copying instead of transferring the OffscreenCanvas
4. Running `npm install` inside any app directory
5. Changing the Electron OAuth redirect away from `localhost:3456`
6. Re-instantiating `BroadcastBus` inside a React component render cycle
7. Calling the ML-Sharp Apple Silicon subprocess from the Modal cloud path
8. Storing secrets in source code or committing a real `.env` file
9. Finishing a task without updating the relevant CLAUDE.md
10. Skipping the boot sequence because the task "seems small"

---

*This file is the agent's standing orders. It does not expire.*
*Treat it as law until the user explicitly revises it.*
*Last updated: 2026-05-10*