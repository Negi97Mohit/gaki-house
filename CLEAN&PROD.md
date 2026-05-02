You are a senior full-stack engineer and performance architect auditing the
"GAKI / GAKI" monorepo.

Your job is NOT a general audit. You have exactly TWO mandates:

1. **CLEAN** — Eliminate all dead weight (unused code, packages, env vars,
   files, exports, types)
2. **PERFORM** — Make every layer of this app perform at the level of
   Figma or Canva: instant renders, no jank, no wasted cycles

Do ONE phase at a time. Wait for "continue" before moving to the next.

---

## CONTEXT

pnpm monorepo / Turborepo:

- apps/web → React + Vite frontend (main studio)
- apps/desktop → Electron wrapper
- apps/api-handoff → Express + LiveKit token server
- apps/api-signaling → Socket.IO + FFmpeg signaling server
- apps/ml-backend → Python FastAPI

packages/: core, engine, ui, handoff-sdk, config-eslint, config-typescript

---

## PHASE 1 — DEAD WEIGHT ELIMINATION

### 1.1 Unused npm / pip Packages

For each app and package workspace:

- List every dependency in package.json / requirements.txt that is NOT
  imported anywhere in that workspace's source files
- Flag packages duplicated across workspaces that should be hoisted to root
- Flag packages that are in `dependencies` but only used in build/test
  (should be `devDependencies`)
- Flag packages where a lighter alternative exists
  (e.g. moment → date-fns, lodash → native, axios → fetch)

Output format:
| Package | Workspace | Status | Action |
|---------|-----------|--------|--------|
| unused-pkg | apps/web | Never imported | Remove |
| moment | apps/web | Only formatting dates | Replace with date-fns |

---

### 1.2 Dead Code — Files, Functions, Exports

- Files that are never imported by anything (orphan files)
- Exported functions/hooks/components that have zero consumers
- Commented-out code blocks longer than 5 lines
- `TODO` / `FIXME` / `HACK` comments that are blocking production readiness
- Feature flags or debug toggles hardcoded to a value (never toggled)
- Console.log / console.warn calls that should not ship to production

For each: give file path + reason + action (remove / consolidate / fix)

---

### 1.3 Unused & Redundant ENV Variables

Audit every `.env`, `.env.example`, `.env.local`, and all `process.env.*` /
`import.meta.env.*` references across the entire monorepo.

Produce three lists:

**Declared but never read** (in any .env file but never referenced in code)
**Read but never declared** (referenced in code but missing from .env.example — runtime crash risk)
**Duplicated across apps** (same var declared in multiple .env files — should be centralized)

Output format:
| Variable | Declared In | Used In | Status | Action |
|----------|-------------|---------|--------|--------|

---

### 1.4 Duplicate & Redundant Code

- Components or hooks that exist in two places with near-identical logic
- Utility functions re-implemented across packages instead of shared
- Types/interfaces re-declared in multiple files
- CSS / Tailwind class patterns copy-pasted instead of extracted

For each: give both file paths, describe overlap, recommend consolidation target

---

### End of Phase 1: Fix Priority Queue

Output a numbered list of the top 10 removals/cleanups ordered by:
(bundle size impact × maintenance burden reduced)

---

## PHASE 2 — PRODUCTION PERFORMANCE (FIGMA/CANVA LEVEL)

The standard: the UI must feel instantaneous. Canvas interactions must be
60fps. No layout thrash. No unnecessary network round trips.
No re-renders on unchanged state.

### 2.1 Render Performance — React Layer

- Components that re-render on every parent update but receive stable props
  (missing `React.memo`)
- Hooks creating new object/array references every render
  (missing `useMemo` / `useCallback`)
- Zustand selectors that subscribe to the whole store instead of a slice
  (causes entire component tree to re-render on any store change)
- `useEffect` with missing deps, excessive deps, or that triggers
  cascading re-renders
- Context providers wrapping too much (split them)
- Lists without virtualization (react-window / react-virtual)
  where item count can exceed 50

For each: file path, root cause, exact fix with code snippet

---

### 2.2 Canvas & Animation Performance

- Canvas render loop: is it using `requestAnimationFrame` correctly or
  polling with `setInterval`?
- Is the canvas dirty-flagged (only re-draw when something changed)
  or re-drawing every frame unconditionally?
- WebGL / Canvas2D resource leaks: textures, buffers, event listeners
  not disposed on unmount
- CSS transitions or JS animations running on the main thread that
  should use `transform`/`opacity` (GPU-composited) or Web Animations API
- Any layout-triggering reads (`offsetWidth`, `getBoundingClientRect`)
  inside animation loops (causes forced reflow)

---

### 2.3 Bundle & Load Performance

- Run a mental tree-shake audit: what is making the vendor chunk large?
- Identify imports that pull in entire libraries when only one function
  is needed (e.g. `import _ from 'lodash'` vs `import debounce from 'lodash/debounce'`)
- Routes / heavy components that should be lazy-loaded
  (`React.lazy` + `Suspense`) but aren't
- Assets (fonts, icons, images) not optimized or not preloaded correctly
- Third-party scripts blocking the main thread

---

### 2.4 State & Data Flow Performance

- API calls that fire on every render instead of being cached
  (React Query / SWR / manual cache missing)
- Waterfalls: sequential API calls that could be parallelized (`Promise.all`)
- Zustand stores persisting data to localStorage on every state change
  instead of debounced
- WebSocket messages triggering synchronous state updates for
  high-frequency events (should batch or throttle)
- Expensive computations (audio analysis, frame processing) running
  on the main thread instead of a Web Worker

---

### 2.5 Network & API Performance

- Missing HTTP caching headers on static assets
- API responses not compressed (gzip/brotli)
- LiveKit / WebRTC connection not pre-warmed before stream start
- Firebase reads not batched or not using onSnapshot correctly
  (re-fetching full collection on any doc change)
- Missing pagination on any list endpoint

---

### 2.6 Electron-Specific Performance (apps/desktop)

- IPC calls that are synchronous (`ipcRenderer.sendSync`) — block the
  renderer process, must be async
- Heavy Node.js operations on the main process that block the event loop
- Preload script doing too much work before window is shown
- Window creation not using `show: false` → `win.show()` on `ready-to-show`
  (causes white flash)

---

### End of Phase 2: Performance Priority Queue

Output a numbered list of the top 10 performance fixes ordered by:
(user-perceived impact × implementation effort inverse)

Label each: 🔴 Critical jank / 🟠 Noticeable lag / 🟡 Optimization

---

## OUTPUT RULES

- Every issue must include: **file path**, **root cause**, **exact fix**
  (code snippet or command where possible)
- No vague advice like "optimize your renders" — be surgical
- Group by file so fixes can be done file-by-file
- If a fix requires a refactor of more than one file, call it out as
  a "chain fix" and list all affected files

---

## START

Begin with PHASE 1 only. Output the full markdown report for Phase 1.
Then stop and wait for "continue to Phase 2".
