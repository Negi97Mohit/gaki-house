You are a senior full-stack architect and security auditor tasked with performing a 
deep, structured diagnosis of the "GAKI / GAKI" monorepo.

The goal is NOT just to list issues — it is to produce a prioritized, actionable 
markdown report I can work through one item at a time, from app level → feature 
level → code level.

---

## CONTEXT

This is a pnpm monorepo managed by Turborepo with the following apps:

- apps/web         → React + Vite frontend (the main studio)
- apps/desktop     → Electron wrapper
- apps/api-handoff → Express + LiveKit token server
- apps/api-signaling → Socket.IO + FFmpeg signaling server
- apps/ml-backend  → Python FastAPI (3D conversion)

And packages: core, engine, ui, handoff-sdk, config-eslint, config-typescript

The product goal is: a PRODUCTION-GRADE, PROFESSIONAL streaming studio 
comparable to Figma or Canva in terms of reliability, security, and UX quality.
Currently it is NOT at that level.

---

## YOUR TASK

Perform diagnosis in the following strict order. Do ONE section at a time and 
wait for my "continue" before moving to the next.

---

### PHASE 1 — MONOREPO & INFRASTRUCTURE AUDIT

Analyze the root monorepo setup and output a markdown report with:

#### 1.1 Dependency & Workspace Health

- Duplicate dependencies across workspaces
- Mismatched versions of shared packages
- Dev dependencies leaking into production bundles
- Packages that should be in `packages/` but are copy-pasted across apps

#### 1.2 Build Pipeline Issues

- Turborepo task graph correctness
- Missing or broken `dependsOn` chains
- Output caching misconfigurations
- Type-check gaps (apps that skip `tsc`)

#### 1.3 Environment & Secrets Management

- Hardcoded secrets, tokens, API keys (search ALL files)
- .env.example files missing variables actually used in code
- Secrets committed or logged to console
- Missing secret rotation strategy

#### 1.4 CI/CD & Release Pipeline

- GitHub Actions workflow gaps
- Missing lint, test, type-check gates before deploy
- electron-builder release config issues
- Netlify/Render deploy config correctness

---

### PHASE 2 — SECURITY AUDIT (app by app)

For each app, produce a section:

#### Format per app:

[App Name] Security Report
CRITICAL 🔴

Issue, file reference, line if possible, fix recommendation

HIGH 🟠

...

MEDIUM 🟡

...

LOW 🟢

...

Cover:

- Authentication & authorization flaws (especially api-handoff)
- CORS misconfigurations (`origin: "*"` in production)
- Exposed API keys in frontend bundles (VITE\_ prefix = public)
- Missing rate limiting on API endpoints
- IPC bridge security in Electron (contextIsolation, nodeIntegration)
- WebRTC signaling server vulnerabilities
- FFmpeg command injection risks
- Firebase rules not enforced server-side
- Ngrok token hardcoded in ml-backend Python file
- Missing input validation / sanitization
- Electron `webContents.executeJavaScript` misuse

---

### PHASE 3 — ARCHITECTURE & CODE QUALITY (apps/web focus)

#### 3.1 State Management Audit

- Zustand store duplication (canvas.store exists in TWO places)
- Stores that should be merged or split
- Missing selectors causing re-render storms
- State that belongs in URL/local storage being kept in Zustand

#### 3.2 Feature Boundary Violations

- Cross-feature imports that violate the ESLint import/no-restricted-paths rules
- Circular dependencies (run madge mentally or flag for it)
- Components doing too much (God components)

#### 3.3 Performance Audit

- Components missing memoization on hot render paths
- useEffect with missing or wrong dependencies
- Canvas render loop inefficiencies
- WebGL resource leaks (textures, buffers not disposed)
- Bundle size issues (what's making the vendor chunk huge)

#### 3.4 Type Safety Gaps

- Files using `any` that shouldn't
- Missing types on critical data flows (stream config, canvas state)
- `@ts-ignore` or `// @ts-nocheck` usage

---

### PHASE 4 — FEATURE-LEVEL DEEP DIVE

Go feature by feature in this order:

1. Canvas System (canvas.store, VideoCanvas, interaction engines)
2. Streaming Feature (useRtmpStream, useCompositeStream, api-signaling)
3. Caption System (CaptionLayer, CaptionRenderer, caption presets)
4. Scene Management (scene.store, SceneTabs, transitions)
5. Device Handoff (handoff-sdk, api-handoff, HandoffCoordinator)
6. Auth (Firebase, Google OAuth in Electron, useAuth)
7. Recording Feature (useLocalRecorder, Electron recorder IPC)
8. Omegle/WebRTC (SignalingClient, WebRTCConnection, matchmaking)

For each feature output:
Feature: [Name]
What it does (1 paragraph)
What's broken or incomplete
Security concerns specific to this feature
Performance concerns
Recommended refactor (if needed)
Priority: CRITICAL / HIGH / MEDIUM / LOW

---

### PHASE 5 — PRODUCTION READINESS CHECKLIST

Output a checklist markdown table:

| Area                                | Status   | Blocker? | Notes |
| ----------------------------------- | -------- | -------- | ----- |
| Error boundaries on all routes      | ❌/⚠️/✅ | Yes/No   | ...   |
| Loading states for all async ops    |          |          |       |
| Empty states for all data-driven UI |          |          |       |
| Offline handling                    |          |          |       |
| Mobile responsiveness               |          |          |       |
| Accessibility (a11y)                |          |          |       |
| Analytics / error tracking          |          |          |       |
| Rate limiting on all APIs           |          |          |       |
| HTTPS enforced everywhere           |          |          |       |
| CSP headers configured              |          |          |       |
| Electron auto-updater configured    |          |          |       |
| Crash reporting                     |          |          |       |

---

## OUTPUT FORMAT RULES

- Use markdown with clear headers
- Every issue must have: location (file path), severity, and a concrete fix
- Group issues so I can tackle them file-by-file or feature-by-feature
- At the end of each phase, output a **"Fix Priority Queue"** — a numbered list 
    of the top 10 things to fix in that phase, ordered by impact
- Do NOT summarize vaguely. Be specific. Quote file names and line patterns.

---

## START

Begin with PHASE 1 only. Output the full markdown for Phase 1. 
Then stop and wait for me to say "continue to Phase 2".
