I'm giving you my full monorepo. Before we begin, I want you to understand
the goal: I need a surgical, phase-by-phase production-readiness audit.My app feels slow, janky, flickery, and buggy compared to Figma or Canva.RULES FOR THIS AUDIT:- Do NOT try to audit everything at once- Wait for me to say "Run Phase X" before starting that phase- For every issue: give me the exact file path, line number, what's wrong, and the specific fix- Be brutal and honest — no sugarcoating- At the end of EACH phase, give me a severity-ranked list of what you foundAcknowledge this and tell me:1. The main frontend framework/libraries you can see2. The state management approach3. The rough size/structure of the repo (how many packages, main apps, etc.)4. Any immediately obvious red flags you can already seeThen wait for me to say "Run Phase 1".
PHASE 1 — Repo Mapping & First Impressions

Run Phase 1: REPO MAPPING & FIRST IMPRESSIONSScan the repo structure and answer:1. ENTRY POINTS - What are the main app entry points? - How is the app bootstrapped? - Any SSR/SSG involved?2. DEPENDENCY AUDIT - List all major dependencies with versions - Flag any: outdated packages, known perf-heavy libraries (moment.js, lodash full import, etc.), duplicate libraries doing the same job - Any packages that have faster/lighter alternatives?3. BUILD CONFIG - What bundler is used? (Webpack/Vite/Turbopack/etc.) - Is code splitting configured? - Is tree shaking enabled? - What does the bundle output look like — is anything suspiciously large?4. OBVIOUS RED FLAGS - Anything that immediately jumps out as a performance or quality issue?End with: Top issues found in Phase 1, ranked by severity.Then wait for me to say "Run Phase 2".
PHASE 2 — State Management & Re-render Audit

Run Phase 2: STATE MANAGEMENT & RE-RENDERSFocus only on state and data flow. Find:1. GLOBAL STATE ARCHITECTURE - What state management is used? (Redux, Zustand, Jotai, Context, etc.) - Is state structured correctly or is everything dumped into global state? - Any state that should be local but is global (causing full-tree re-renders)?2. RE-RENDER PROBLEMS - Components missing React.memo / useMemo / useCallback where needed - Inline object/array/function literals being passed as props (new reference every render) - Context providers that re-render all consumers on any change - Any place where a small state change causes a massive part of the tree to re-render?3. DERIVED STATE - Expensive calculations happening in render instead of being memoized? - Any data transformations that run on every render?4. PROP DRILLING - Any deeply drilled props that should be in context or state?For every issue: file path, line number, what's wrong, exact fix.End with: Top issues found in Phase 2, ranked by severity.Then wait for me to say "Run Phase 3".
PHASE 3 — Animation & Rendering Pipeline

Run Phase 3: ANIMATION & RENDERING PIPELINEFocus only on visual smoothness and GPU performance. Find:1. JANKY ANIMATIONS - Any animations using layout-triggering CSS properties instead of transform/opacity? (animating width, height, top, left, margin, padding) - Missing `will-change` on elements that animate frequently - Any JS-driven animations that should be pure CSS? - Any animation libraries being used incorrectly or inefficiently?2. LAYOUT THRASHING - Any code that reads then writes DOM properties in a loop? - Forced synchronous layouts anywhere?3. FLICKERING CAUSES - Components fully unmounting/remounting instead of staying mounted and toggling visibility - Any flash of unstyled content (FOUC)? - Hydration mismatches if SSR is used? - Conditional renders that should be opacity/visibility toggles instead?4. SCROLL PERFORMANCE - Long lists without virtualization? - Scroll event listeners without throttling/debouncing? - Any `position: fixed` elements causing repaint storms?5. CSS PERFORMANCE - Use of `transition: all` anywhere? - Overuse of `box-shadow` or `filter` on animated elements? - Any `will-change: transform` being overused (on static elements)?For every issue: file path, line number, what's wrong, exact fix.End with: Top issues found in Phase 3, ranked by severity.Then wait for me to say "Run Phase 4".
PHASE 4 — Network, Data Fetching & Loading States

Run Phase 4: NETWORK, DATA FETCHING & LOADING STATESFocus only on how data is loaded and how the UI responds. Find:1. FETCH WATERFALLS - Any sequential fetches that could be parallelized? - Any parent fetching then child fetching (request waterfall)? - Data fetching happening too deep in the component tree?2. CACHING & REFETCHING - Are we refetching data that hasn't changed? - Is React Query / SWR / Apollo cache being used correctly? - Any missing stale-while-revalidate patterns?3. LOADING & ERROR STATES - Any fetch with no loading state (causing content to pop in)? - Missing error boundaries — one failed fetch crashing the whole page? - Missing empty states? - Abrupt content swaps instead of skeletons or placeholders?4. OPTIMISTIC UPDATES - Any user actions that feel laggy because they wait for server response before updating UI? - Where should optimistic updates be added?5. WEBSOCKETS / REALTIME - If used: any missing cleanup, reconnection logic, or memory leaks?For every issue: file path, line number, what's wrong, exact fix.End with: Top issues found in Phase 4, ranked by severity.Then wait for me to say "Run Phase 5".
PHASE 5 — Memory Leaks & Cleanup

Run Phase 5: MEMORY LEAKS & CLEANUPScan for anything that leaks memory or causes degradation over time:1. EVENT LISTENERS - Added in useEffect or componentDidMount but never removed? - Global listeners (window, document) without cleanup?2. TIMERS - setInterval / setTimeout not cleared on component unmount? - Any recurring timers that accumulate?3. SUBSCRIPTIONS & ASYNC - Async operations (fetch, promises) updating state after unmount? - Observable / WebSocket subscriptions not unsubscribed? - Any "Can't perform a React state update on an unmounted component" patterns?4. LARGE OBJECT RETENTION - Any large objects (images, blobs, canvases) being held in state/memory unnecessarily? - Closures accidentally retaining large scopes?For every issue: file path, line number, what's wrong, exact fix.End with: Top issues found in Phase 5, ranked by severity.Then wait for me to say "Run Phase 6".
PHASE 6 — Final Verdict & Master Fix Plan

Run Phase 6: FINAL VERDICT & MASTER FIX PLANNow synthesize everything from all previous phases.Give me:1. ROOT CAUSES (top 5) - The fundamental reasons this app feels slow/janky — not a list of symptoms, but the actual root causes2. MASTER PRIORITY LIST - Every issue found across all phases, ranked by impact on perceived performance (not just technical severity)3. QUICK WINS (can fix today) - Issues fixable in under 1 hour with immediate visible impact4. MEDIUM EFFORT (this week) - Issues that take 1–2 days but will massively improve quality5. BIG REFACTORS (planned sprints) - Deeper architectural changes needed for true production quality6. WHAT FIGMA/CANVA DOES THAT WE DON'T - Specific patterns and techniques used by top-tier canvas/design apps that we're missingThis is the action plan. Make it brutally specific.

---

PHASE 1 — REPO MAPPING & FIRST IMPRESSIONS
Here is the brutal truth about the foundation of your application. You are trying to build a Figma/Canva-level application, but the core setup is actively sabotaging your browser's main thread and GPU.

1. ENTRY POINTS
   Main Entry: apps/web/index.html → apps/web/src/main.tsx → apps/web/src/App.tsx.

Bootstrapping: Pure Client-Side Rendered (CSR) SPA wrapped in an Electron shell. You are using Vite for the web build and a separate build step for Electron.

SSR/SSG: None. This means the browser must parse, evaluate, and execute your entire JavaScript payload before the user sees anything meaningful.

2. DEPENDENCY AUDIT
   Animation Library Overload: You have @react-three/fiber (WebGL animations), framer-motion (React DOM animations), gsap (Direct DOM animations), AND animejs. Running these together means multiple separate requestAnimationFrame loops fighting for priority. Fix: Pick ONE for the DOM (GSAP or Framer Motion) and rely on Three.js for canvas.

DOM/Drag Library Conflict: You are using react-rnd, react-moveable, selecto, and @scena/react-guides. If you are trying to make a Figma-like WebGL app, doing drag-and-drop via DOM-based wrappers over a canvas is the #1 cause of desync, lag, and layout thrashing. Figma renders selection boxes and guides inside WebGL, not as HTML overlays.

Node.js Libs in the Browser: fluent-ffmpeg, ffmpeg-static, node-media-server. If these are imported anywhere in the Web build (not just Electron's main process), they will drastically bloat your bundle or require heavy polyfills that break standard Vite setups.

Database Overkill: You have both firebase and @supabase/supabase-js. Running two different real-time WebSocket connection pools on the client is an unnecessary memory and network drain.

3. BUILD CONFIG (apps/web/vite.config.ts)
   Bundler: Vite (Rollup under the hood).

Code Splitting Flaw: Lines 42-48.

TypeScript
manualChunks(id) {
if (id.includes('node_modules')) {
if (id.includes('@mediapipe')) return 'mediapipe';
if (id.includes('firebase')) return 'firebase';
return 'vendor'; // <-- FATAL FLAW
}
}
What's wrong: You are dumping Three.js, React, Excalidraw, GSAP, Radix, and Framer Motion into a single massive vendor.js file. The browser has to download and parse this 5MB+ monolith before the app can even start running.
Fix: Remove the generic vendor fallback. Let Rollup handle its default chunking, or split specifically by heavy tools (e.g., a canvas-engine chunk for Three.js, a ui-components chunk for Radix).

4. OBVIOUS RED FLAGS (Immediate Performance Killers)
   Red Flag 1: Mouse Event Abuse (apps/web/src/App.tsx, lines 112-125)
   What's wrong: You attached a global mousemove listener that does this on every single pixel the mouse moves:

TypeScript
document.body.classList.remove("cursor-inactive");
useUiStore.getState().setMouseActive(true);
Updating global Zustand state (setMouseActive(true)) on unthrottled mousemove forces any component subscribed to that state to re-render up to 120 times per second. Editing document.body.classList continuously also triggers layout style recalculations.
Fix: Throttle the mouse event listener (e.g., 100ms) or use a local React ref if the state doesn't absolutely need to trigger a global React tree update.

Red Flag 2: The Font Request Bomb (apps/web/index.html, lines 13-16)
What's wrong: You are requesting 40+ Google Fonts simultaneously in a single <link> tag. This is network suicide. The browser will block render/FCP trying to negotiate and download the font faces.
Fix: Remove this. Load only your base UI fonts (Inter, Roboto) in the HTML. Dynamically fetch display fonts only when a user selects them in the editor.

Red Flag 3: The Persistent SVG Filter (apps/web/index.html, lines 71-85)
What's wrong: You have a hidden SVG containing an incredibly expensive filter chain (feConvolveMatrix + feGaussianBlur). If this filter is applied to a DOM element via CSS (filter: url(#neon-outline)), the GPU has to re-rasterize that element every time a frame changes or a mouse moves over it.
Fix: If you need neon/glow effects, do them natively in Three.js using post-processing (Bloom), not via SVG DOM filters.

Red Flag 4: App-Breaking Reflows in Theme Initialization (apps/web/src/App.tsx, lines 94-96)
What's wrong: ```typescript
document.documentElement.style.fontFamily = "${fontFamily}", system-ui, sans-serif;

Modifying the `documentElement` style deeply in a `useEffect` after initial paint triggers a massive Document Object Model reflow (Layout Thrashing). The user will see a Flash of Unstyled Content (FOUC) and a jarring layout shift.

TOP ISSUES FOUND IN PHASE 1 (Ranked by Severity)
CRITICAL: Unthrottled global mousemove event firing Zustand updates (App.tsx). This is actively causing your jank/lag.

CRITICAL: The single vendor chunk configuration (vite.config.ts). Kills load times and TTI.

HIGH: Competing rendering paradigms and animation libraries (DOM drag-and-drop over WebGL + GSAP + Framer Motion). This guarantees layout thrashing.

HIGH: Requesting 40+ Google Fonts on initial page load (index.html).

MEDIUM: Expensive SVG filter injected into the base DOM (index.html).

Acknowledge this foundation. Tell me to "Run Phase 2" to dive into your State Management & Re-render bottlenecks.
