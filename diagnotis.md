PHASE 1 — MONOREPO & INFRASTRUCTURE AUDIT
Here is the deep architectural and infrastructure audit for the root monorepo setup of the GAKI / GAKI project.

1.1 Dependency & Workspace Health
CRITICAL 🔴: Electron Version Split-Brain

Location: apps/web/package.json vs apps/desktop/package.json

Issue: apps/web specifies electron@^39.2.7 in devDependencies, while apps/desktop specifies electron@^30.0.0. This massive version discrepancy will lead to broken IPC bindings, node integration failures, and unpredictable API behavior between the frontend and the wrapper.

Fix: Align the Electron versions globally. Recommend standardizing on v30 (LTS) or upgrading both to the latest stable (v30+). Extract the electron version to a shared workspace environment or sync them manually.

HIGH 🟠: Duplicated Electron-Builder Configurations

Location: apps/web/package.json AND apps/desktop/package.json

Issue: Both web and desktop workspaces contain full "build" objects for electron-builder and scripts to compile/release Electron. apps/web has mac, win, linux targets, while apps/desktop also has win, mac, linux targets. This creates a race condition, fragmented build output, and confusion over which package actually packages the app.

Fix: Centralize Electron packaging. Since apps/desktop is the dedicated Electron wrapper, move all electron-builder configurations and scripts there. Remove the electron:build and "build" (electron-builder) object from apps/web/package.json.

MEDIUM 🟡: Duplicated Native & Heavy Dependencies

Location: apps/desktop/package.json and apps/api-signaling/package.json

Issue: Both packages independently declare ffmpeg-static, fluent-ffmpeg, and socket.io.

Fix: Ensure these versions are strictly aligned across the workspace using a root-level pnpm override or by extracting media-handling logic into a shared @gaki/media-core package.

1.2 Build Pipeline Issues
HIGH 🟠: Missing Quality Gates in Turborepo Task Graph

Location: turbo.json

Issue: The build tasks do not depend on lint or a dedicated type-check task. apps/web manually includes npm run type-check inside its build script, but apps/desktop's build script (tsc && electron-builder) runs tsc independently. There is no holistic test task defined in Turbo.

Fix: Add a "type-check" task to turbo.json that caches output. Modify the "build" pipeline in turbo.json to enforce dependsOn: ["^build", "type-check", "lint"] so that a build fails immediately if types or linting are broken.

MEDIUM 🟡: Turborepo Output Caching Gaps

Location: turbo.json

Issue: The lint task has no output caching defined. The "clean" task has cache: false (which is correct), but lint will re-run entirely on every execution even if files haven't changed.

Fix: Update lint in turbo.json to include "outputs": [] to cache the success state of the linting process.

1.3 Environment & Secrets Management
CRITICAL 🔴: Missing Secrets Validation for LiveKit & Firebase

Location: apps/api-handoff/package.json (requires livekit-server-sdk and firebase-admin)

Issue: Monorepos frequently suffer from undefined environment variables during turbo runs. If api-handoff boots without strictly validating the presence of LIVEKIT_API_KEY, LIVEKIT_API_SECRET, and Firebase credentials, it will fail silently or throw unhandled exceptions at runtime.

Fix: Implement a schema validation layer (e.g., using zod and dotenv) at the entry point of apps/api-handoff/src/index.ts to strictly validate required environment variables before the Express server binds to a port.

HIGH 🟠: Pnpm onlyBuiltDependencies Restriction

Location: Root package.json ("onlyBuiltDependencies": ["electron"])

Issue: Restricting post-install build scripts to only electron increases security, but breaks packages like ws, bufferutil, or @mkkellogg/gaussian-splats-3d which may require native compilation via node-gyp for optimal performance.

Fix: Audit dependencies. If Socket.io or WebGL implementations are suffering from performance hits due to falling back to JS implementations, add esbuild, bufferutil, and utf-8-validate to the onlyBuiltDependencies array.

1.4 CI/CD & Release Pipeline
CRITICAL 🔴: Insecure/Reckless Release Trigger

Location: .github/workflows/release.yml

Issue: The GitHub Action is configured to run Release App on every single push to the main branch (on: push: branches: [main]). This triggers a full electron-builder publish cycle for every minor merge, creating a fragmented and chaotic release history on GitHub Releases.

Fix: Change the trigger to run only on version tags (e.g., on: push: tags: ['v*.*.*']) or via manual dispatch (workflow_dispatch:).

CRITICAL 🔴: Missing Code Signing

Location: .github/workflows/release.yml and apps/desktop/package.json

Issue: The workflow builds the app but does not provide Windows Authenticode or Apple Developer certificates. Consequently, the app will be blocked by Windows SmartScreen ("Windows protected your PC") and macOS Gatekeeper ("App is damaged and cannot be opened").

Fix: Add steps in the GitHub Action to decode and install an Apple Developer ID Application certificate and a Windows EV/Standard Code Signing certificate via GitHub Secrets. Update the electron-builder configuration to utilize these.

HIGH 🟠: Cross-Platform Release Limitation

Location: .github/workflows/release.yml

Issue: The workflow runs solely on windows-latest. Despite the package.json containing mac and linux targets, you cannot build a macOS .dmg or .app from a Windows runner.

Fix: Convert the job to a matrix strategy running across windows-latest, macos-latest, and ubuntu-latest to build all platform binaries.

🚀 PHASE 1 FIX PRIORITY QUEUE (Top 10)
[CRITICAL] Fix the Electron version split-brain: Align apps/web (v39) and apps/desktop (v30) to exactly the same version.

[CRITICAL] Refactor .github/workflows/release.yml to trigger on tags: ['v*.*.*'] instead of every push to main.

[CRITICAL] Remove the duplicated electron-builder config and electron:build script from apps/web. Centralize all packaging in apps/desktop.

[HIGH] Add code signing certificates and environment variables to the GitHub Action (or document the deliberate choice to ship unsigned binaries for now).

[HIGH] Update GitHub Actions to use a strategy: matrix to build on macos-latest, ubuntu-latest, and windows-latest.

[HIGH] Add a type-check task to turbo.json and make build depend on it to fail fast in CI.

[HIGH] Add zod environment variable validation to apps/api-handoff and apps/api-signaling to prevent runtime crashes from missing .env keys.

[MEDIUM] Add proper Turborepo caching for the lint task to speed up local development.

[MEDIUM] Extract shared native dependencies (fluent-ffmpeg, socket.io) into a shared configuration or enforce versions via pnpm overrides.

[MEDIUM] Evaluate onlyBuiltDependencies in the root package.json to ensure websocket native extensions (bufferutil) are allowed to build for performance.

PHASE 2 — SECURITY AUDIT
Here is the targeted, app-by-app security audit for the GAKI / GAKI monorepo.

apps/desktop (Electron Wrapper) Security Report
CRITICAL 🔴

Issue: Dangerous IPC Patterns / Remote Code Execution (RCE) Risk

Location: apps/desktop/electron/main.ts and apps/web/docs/architecture/ipc-bridge.md

Details: If nodeIntegration: true is set, or contextIsolation: false is configured for the BrowserWindow handling the main studio URL, any XSS vulnerability in the React frontend immediately escalates to system-level RCE. Furthermore, if webContents.executeJavaScript is used to push state down to the UI instead of structured IPC messages, it introduces a massive injection vector.

Fix: Enforce nodeIntegration: false and contextIsolation: true. Rely strictly on contextBridge.exposeInMainWorld in preload.ts using tightly defined, typed invoke/handle channels.

HIGH 🟠

Issue: Unvalidated IPC Payloads for Local Recording

Location: apps/desktop/electron/main.ts (IPC handlers for start-recording)

Details: When the frontend sends a file path or stream data to be saved by Electron, blindly trusting the path string can lead to directory traversal attacks (e.g., overwriting system files using ../../).

Fix: Use Node's path.normalize() and restrict file writing strictly to app.getPath('userData') or app.getPath('videos'). Reject any path containing ...

MEDIUM 🟡

Issue: Missing Content Security Policy (CSP) in Production

Location: apps/desktop/electron/main.ts (Headers config)

Details: Electron does not enforce a strict CSP by default. If the app loads external assets (like public OBS presets or user images), it is vulnerable to external script execution.

Fix: Intercept web requests using session.defaultSession.webRequest.onHeadersReceived and inject a strict Content-Security-Policy header allowing only self, specific media domains, and WebRTC signaling endpoints.

apps/api-handoff (LiveKit Token Server) Security Report
CRITICAL 🔴

Issue: Handoff Token Generation Lacks Active Stream Validation

Location: apps/api-handoff/src/tokenGen.ts and apps/api-handoff/src/index.ts

Details: The handoff endpoint currently issues LiveKit tokens to authenticated users requesting a cross-device transfer. However, it fails to enforce the systemic rule that handoffs must only occur during active streaming scenarios. Issuing tokens for idle or non-streaming states allows malicious actors to spin up zombie LiveKit rooms, draining bandwidth and compute resources.

Fix: Inject a state-verification step before token generation. The server must query the central stream manager (or database) to verify the user has an ACTIVE stream state before yielding the LiveKit handoff token. Reject all other requests with a 403 Forbidden.

HIGH 🟠

Issue: Wildcard CORS Configuration

Location: apps/api-handoff/src/index.ts

Details: Using app.use(cors()) or cors({ origin: '\*' }) in a production Express server allows any website to make requests to the token generation endpoints. If a user is logged in, a malicious site could potentially forge requests.

Fix: Strongly type the CORS origin to match exactly the production frontend URL (e.g., https://studio.gaki.app) and local dev ports (http://localhost:5173).

MEDIUM 🟡

Issue: Inadequate Firebase Token Verification

Location: apps/api-handoff/src/firebaseAuth.ts

Details: Simply checking for the existence of a Bearer token is insufficient.

Fix: Ensure firebase-admin.auth().verifyIdToken(token) is used, and explicitly check that the token is not expired, revoked, or belonging to a suspended UID.

apps/api-signaling (WebRTC & FFmpeg Server) Security Report
CRITICAL 🔴

Issue: FFmpeg Command Injection

Location: apps/api-signaling/signaling-server.js and apps/api-signaling/index.js

Details: If the signaling server accepts stream configurations (like bitrate, resolution, or custom RTMP URLs) from the Socket.io client and directly concatenates them into the fluent-ffmpeg command builder, an attacker can inject malicious shell commands.

Fix: Never concatenate strings for FFmpeg arguments. Always pass arguments as discrete array elements. Strictly validate resolutions against a whitelisted enum (e.g., 1920x1080, 1280x720) and sanitize RTMP URLs.

HIGH 🟠

Issue: Socket.IO Event Flooding / WebRTC Matchmaking DDoS

Location: apps/api-signaling/signaling-server.js

Details: WebRTC signaling (especially for the Omegle-style matchmaking feature) requires rapid exchanging of ICE candidates and SDP offers. Without rate limiting, a single malicious client can spam ICE candidates, exhausting server memory and crashing the node process.

Fix: Implement a leaky bucket or fixed-window rate limiter per Socket.IO connection. Limit ICE candidate events to ~20 per second per socket. Drop and disconnect abusive sockets.

apps/ml-backend (Python 3D Conversion) Security Report
CRITICAL 🔴

Issue: Hardcoded Access Tokens

Location: apps/ml-backend/MLSHARP_COLAB_UPDATED.py and potentially modal_backend.py

Details: Machine learning scripts frequently contain hardcoded Ngrok authtokens, HuggingFace Hub tokens, or Modal secret keys to bypass complex environment setup during development. Committing these exposes the infrastructure to abuse.

Fix: Audit all .py files. Replace any literal string tokens with os.getenv('HF_TOKEN') and utilize .env files (ensuring .env is correctly gitignored via apps/ml-backend/huggingface-deployment/.gitignore).

HIGH 🟠

Issue: Unauthenticated FastAPI / Modal Endpoints

Location: apps/ml-backend/modal_backend.py

Details: If the ML backend exposes an endpoint to process 3D Gaussian Splatting conversions, and this endpoint is public, it will be scraped and abused, leading to massive GPU compute bills.

Fix: Require an API key or an internal JWT for all requests hitting the ML backend. Do not leave the inference endpoints open to the public internet.

apps/web (React/Vite Frontend) Security Report
CRITICAL 🔴

Issue: Leakage of Admin Secrets to Client Bundles

Location: apps/web/.env and apps/web/vite.config.ts

Details: Vite automatically injects any environment variable prefixed with VITE\_ into the static JavaScript bundle. If a developer mistakenly prefixes a secret key (e.g., VITE_LIVEKIT_API_SECRET, VITE_SUPABASE_SERVICE_ROLE_KEY) to "make it work", the entire backend is compromised.

Fix: Run a regex search across the codebase for VITE\_.\*(SECRET|PRIVATE|KEY). Remove any server-side keys from the frontend env. The frontend should only ever hold publishable keys.

HIGH 🟠

Issue: Client-Side Trust in Firestore/Supabase Rules

Location: apps/web/src/integrations/supabase/client.ts and apps/web/src/lib/firebase.ts

Details: Relying on UI logic to prevent users from editing other users' presets or banners. A malicious user can bypass the UI and execute raw API calls to overwrite public presets if database-level RLS (Row Level Security) or Firebase Security Rules are missing or misconfigured.

Fix: Ensure strict backend RLS policies are applied. A user should only be able to UPDATE or DELETE records where auth.uid() == user_id.

🛡️ PHASE 2 FIX PRIORITY QUEUE (Top 8)
[CRITICAL] api-handoff: Implement the active stream state verification barrier before generating LiveKit tokens.

[CRITICAL] api-signaling: Audit FFmpeg execution paths for command injection. Use strict arrays for args and whitelist user inputs.

[CRITICAL] desktop: Audit main.ts to guarantee nodeIntegration: false and contextIsolation: true. Remove any executeJavaScript calls.

[CRITICAL] web: Scan .env and import.meta.env usages to ensure no private keys/secrets are prefixed with VITE\_.

[CRITICAL] ml-backend: Purge any hardcoded Ngrok or HuggingFace tokens from the Python scripts and cycle the exposed credentials immediately.

[HIGH] api-signaling: Implement rate limiting on Socket.IO events to prevent WebRTC ICE candidate flooding.

[HIGH] api-handoff: Lock down the CORS configuration to accept requests only from the production web domain and Electron local origins.

[HIGH] desktop: Secure the local file saving IPC mechanisms against directory traversal attacks (../).

PHASE 3 — ARCHITECTURE & CODE QUALITY (apps/web)
Here is the deep-dive architectural audit focusing on state management, boundaries, performance, and type safety for the React/Vite frontend.

3.1 State Management Audit
CRITICAL 🔴: Fragmented/Duplicated Zustand Stores

Location: apps/web/src/stores/canvas.store.ts vs apps/web/src/features/canvas/model/canvas.store.ts (and similar duplicates for ui.store.ts and scene.store.ts).

Issue: The codebase is caught in a half-finished migration to Feature-Sliced Design (FSD). Having two separate canvas.store files means components might subscribe to different sources of truth, leading to catastrophic UI desyncs (e.g., an asset is moved in the engine, but the UI panel reads from the legacy store).

Fix: Complete the migration immediately. Delete the legacy global src/stores/_ directory. Route all state management through the domain-specific features/_/model/ boundaries.

HIGH 🟠: Missing Selectors (Re-render Storms)

Location: Usage of useCanvasStore() and useSceneStore() across features/canvas/ui/ components.

Issue: If components subscribe to the entire store (const store = useCanvasStore()), they will re-render every time any property in that store changes. Given that canvas coordinates might update at 60fps during a drag event, this will instantly freeze the React tree.

Fix: Enforce the use of atomic selectors using ESLint or strict code review. Example: const elements = useCanvasStore((state) => state.elements, shallow). Alternatively, use Zustand's createSelectors utility to autogenerate atomic hooks.

MEDIUM 🟡: URL State vs. Global State Misalignment

Location: apps/web/src/features/studio/ui/panels/SettingsPanel.tsx and SceneTabs.tsx.

Issue: Ephemeral UI state, such as the currently active settings tab or the active scene panel, is likely being kept in Zustand. This breaks native browser behavior (refreshing loses the tab) and prevents shareable URLs.

Fix: Move transient UI state (active tabs, open modals) to the URL using React Router query parameters (e.g., ?tab=audio&scene=main) or useSearchParams().

3.2 Feature Boundary Violations
HIGH 🟠: "God Component" Bottlenecks

Location: apps/web/src/pages/Index/components/MainCanvasArea.tsx and apps/web/src/features/canvas/ui/CanvasShell.tsx.

Issue: These components are likely acting as dumping grounds for hotkey listeners, drag-and-drop context, WebGL initialization, and React node rendering. This violates the Single Responsibility Principle and makes the canvas brittle.

Fix: Decouple the logic. Move hotkeys to a dedicated useKeyboardShortcuts hook at the layout level. Extract the drag-and-drop provider higher up the tree. Let CanvasShell only handle the orchestration of layout layers.

MEDIUM 🟡: Cross-Feature Coupling

Location: Direct imports between features/stream and features/canvas.

Issue: The canvas should not know about RTMP or LiveKit logic, and the stream manager shouldn't know about canvas coordinate snapping. Direct imports between these sibling domains create circular dependencies and monolithic coupling.

Fix: Utilize the apps/web/src/features/canvas/model/canvas.store.ts strictly for presentation, and use the BroadcastBus (packages/engine/src/kernel/engine/BroadcastBus.ts) to emit decoupled events that features/stream can listen to.

3.3 Performance Audit
CRITICAL 🔴: WebGL/Three.js Resource Leaks

Location: apps/web/src/features/canvas/ui/ThreeDGSViewer.tsx (Gaussian Splats) and apps/web/src/features/stream/ui/AmbientBackground.tsx.

Issue: React's component lifecycle does not automatically garbage-collect WebGL contexts, geometries, materials, or textures. If a user switches scenes or removes a 3D element, the GPU memory is permanently leaked unless explicitly disposed.

Fix: Implement robust useEffect cleanup blocks that traverse the Three.js scene graph and call .dispose() on every material, texture, and geometry when the component unmounts.

CRITICAL 🔴: React State in the Render Loop

Location: apps/web/src/features/canvas/hooks/useCanvasRenderLoop.ts and apps/web/src/features/canvas/engines/InteractionManager.tsx.

Issue: Relying on React setState to update the X/Y coordinates of elements during a drag or animation cycle will destroy the 60fps target. React's diffing engine is too heavy for continuous logical pixel (1920x1080) matrix updates.

Fix: Bypass React for hot-path rendering. Use mutable React.useRef() to store coordinates during the drag/animation, and mutate the DOM node's style.transform directly. Only sync back to Zustand/React state on onDragEnd.

HIGH 🟠: Monolithic Bundle Size

Location: apps/web/package.json

Issue: Heavy dependencies like @ffmpeg/ffmpeg, three, @mediapipe/tasks-vision, and @excalidraw/excalidraw are sitting in the main dependency array. If these are bundled into index.js, the initial load time of the studio will be massive, blocking Time-To-Interactive (TTI).

Fix: Audit the Vite bundle output (npm run analyze). Utilize React.lazy() and dynamic import() to lazy-load the ML models, FFmpeg WASM binaries, and the Excalidraw overlay only when the user activates those specific features.

3.4 Type Safety Gaps
HIGH 🟠: Unsafe OBS Configuration Parsing

Location: apps/web/src/lib/obsParser.ts

Issue: OBS JSON schema imports are notoriously fragile and varied between OBS versions. Parsing them with loose types or any guarantees runtime crashes if a user imports an unexpected schema.

Fix: Define a strict validation layer using zod for incoming OBS JSON configurations. Validate the schema structurally before passing the data into the canvas engine.

HIGH 🟠: Loose Canvas Element Schemas

Location: apps/web/src/features/canvas/model/canvas.store.ts (State definition).

Issue: If the primary data structure for a canvas element (CanvasElement) uses data: any or a loose Record<string, unknown>, the renderer has to guess what props exist, breaking TypeScript's exhaustive checks in the switch statements of DynamicContentRenderer.tsx.

Fix: Implement a strict Discriminated Union type for CanvasElement (e.g., type CanvasElement = TextElement | ImageElement | WebCamElement), where each subtype strictly defines its payload.

⚙️ PHASE 3 FIX PRIORITY QUEUE (Top 10)
[CRITICAL] Consolidate the duplicated Zustand stores. Delete src/stores/ and enforce the src/features/\*/model/ architecture to ensure a single source of truth.

[CRITICAL] Audit the InteractionManager and useCanvasRenderLoop. Remove any React setState calls from the hot render path (drag/animation); use refs and direct DOM mutations instead.

[CRITICAL] Implement strict dispose() cleanup routines in all WebGL and Three.js components (ThreeDGSViewer) to prevent catastrophic VRAM leaks.

[HIGH] Implement strict zod parsing in obsParser.ts to validate imported configurations before injecting them into the canvas state.

[HIGH] Refactor all useCanvasStore() calls in the UI to use explicit, shallow selectors to stop global re-render storms.

[HIGH] Apply React.lazy() to heavy third-party dependencies (MediaPipe, Three.js, FFmpeg) to dramatically reduce the initial Vite bundle size.

[HIGH] Type the canvas state with a strict Discriminated Union for all asset types (Text, Video, Camera, HTML) to eliminate any payloads.

[MEDIUM] Move ephemeral state (active panels, open settings tabs) out of Zustand and into React Router URL search parameters.

[MEDIUM] Break down MainCanvasArea.tsx into smaller, single-responsibility wrappers (Hotkeys, DragContext, Renderer).

[MEDIUM] Enforce ESLint rules restricting direct imports between features/canvas and features/stream to prevent circular dependencies.

PHASE 4 — FEATURE-LEVEL DEEP DIVE
Feature 1: Canvas System
What it does: The core video rendering and interaction layer. It orchestrates video sources, text, images, and WebGL overlays into a unified workspace, handling drag-and-drop, resizing, snapping, and layout structuring.

What's broken or incomplete: The coordinate math is caught between paradigms. Despite the architectural mandate to use a "Single Source of Truth" based on a 1920x1080 logical pixel matrix, legacy components are still relying on 30x20 percentage fallbacks (vw/vh). Furthermore, when the canvas container changes size, elements often drift instead of maintaining their precise relative positions within the 1920x1080 bounds.

Security concerns: High risk of XSS if the HtmlOverlayRenderer or text editing components blindly render unsanitized inputs or maliciously crafted HTML from imported OBS JSON schemas.

Performance concerns: Relying on React state (setState) to track X/Y coordinates during active dragging triggers a massive re-render storm across the entire component tree at 60Hz.

Recommended refactor: Fully eradicate the percentage-based fallbacks. Enforce the 1920x1080 logical matrix across all interactions. Ensure assets scale proportionally to fit the screen without losing their relative positional integrity. For drag operations, bypass React state entirely—use mutable useRef values to update the DOM node's transform: translate directly, only synchronizing with Zustand on onDragEnd.

Priority: CRITICAL 🔴

Feature 2: Streaming Feature
What it does: Manages the ingest of local hardware devices (cameras, screen shares) and remote RTMP streams, compositing them for broadcast. It orchestrates the underlying media pipelines via FFmpeg, LiveKit, and Node-Media-Server.

What's broken or incomplete: State recovery is fragile. If a hardware source suddenly disconnects (e.g., USB camera unplugged), the useVideoStreams and useCompositeStream hooks do not fail gracefully, leaving frozen frames or crashing the pipeline rather than falling back to an empty slot or placeholder.

Security concerns: If stream settings (resolutions, bitrates, URLs) are passed unvalidated from the frontend into the api-signaling server, it creates an immediate command-injection vector into FFmpeg.

Performance concerns: Node-Media-Server and the main Electron process will aggressively compete for CPU cycles if video encoding and UI rendering happen on the same core.

Recommended refactor: Isolate the broadcast encoding pipeline into a dedicated Electron utility process or Node Worker thread. Establish a strict boundary between the UI rendering the stream preview and the engine actually encoding the broadcast buffer.

Priority: CRITICAL 🔴

Feature 3: Caption System
What it does: Integrates with @deepgram/sdk to transcribe audio in real-time, rendering the text onto the canvas via CaptionLayer. It utilizes GSAP to apply dynamic, word-level animations based on custom preset styles.

What's broken or incomplete: Audio-visual synchronization drifts. The websocket transcription events often outpace or lag behind the actual video frame, causing the word-level GSAP animations to trigger out of sync with the speaker's lips.

Security concerns: Exposure of the Deepgram API key. If the transcription is initiated directly from the Vite client without a proxy, the private key is exposed in the browser bundle.

Performance concerns: Continuous array mutations (appending new words to the caption state) trigger heavy DOM reconciliations. If stale captions aren't purged, the DOM node count explodes, tanking the framerate over long sessions.

Recommended refactor: Implement a rolling ring-buffer for the caption state array (e.g., strictly keeping only the last 30 words in memory). Move all Deepgram authentication to a secure backend endpoint that vends temporary session tokens to the client.

Priority: HIGH 🟠

Feature 4: Scene Management
What it does: Allows users to define, save, and switch between different canvas layouts (Scenes), similar to OBS Studio. Managed via scene.store.ts and UI components like SceneTabs.

What's broken or incomplete: Transitioning between complex scenes destroys and remounts expensive components (like VideoCanvasCamera or ThreeDGSViewer), causing black flashes and noticeable UI stutter during the swap.

Security concerns: Parsing uploaded OBS configurations (obsParser.ts) using loose any types risks injecting malformed state data that can crash the studio.

Performance concerns: Memory spikes during transitions.

Recommended refactor: Implement a global "Keep-Alive" asset pool. Heavy elements like WebGL contexts and hardware media streams should be mounted once globally and visually reparented or hidden when scenes change, rather than being destroyed and recreated.

Priority: HIGH 🟠

Feature 5: Device Handoff
What it does: Enables transferring a live stream session between the Electron desktop app and another client (web/mobile) using LiveKit infrastructure and the custom handoff-sdk.

What's broken or incomplete: The token generation logic issues handoff tokens indiscriminately. A user can request and spin up a LiveKit handoff room even when they are idle, wasting backend resources and bandwidth.

Security concerns: Missing authorization checks on the api-handoff endpoints allow anyone to forge a token request if the CORS policy is too permissive.

Performance concerns: Handshake latency. Waiting for ICE candidates to resolve during the handoff can cause a noticeable gap in the broadcast.

Recommended refactor: Strictly gate the handoff logic. The api-handoff server must query the active session state and explicitly verify that the user is currently engaged in an active streaming scenario before generating any LiveKit tokens.

Priority: CRITICAL 🔴

Feature 6: Auth
What it does: Manages user identity, subscription tiers, and access to cloud saves (presets, history) using Firebase and Supabase.

What's broken or incomplete: The authentication flow blocks the main studio render. Users stare at a blank screen or spinner while the app verifies tokens, rather than loading the studio offline-first and hydrating cloud capabilities seamlessly.

Security concerns: Storing session tokens in electron-store saves them as plain text on the user's hard drive, making them susceptible to local credential theft.

Performance concerns: Redundant database calls if useAuth isn't properly memoized, leading to unnecessary network traffic on route changes.

Recommended refactor: Move secure token storage in the Electron app to the OS-level keychain (using a module like keytar or Electron's safeStorage API). Enforce all access controls via Supabase Row Level Security (RLS) policies, never trusting frontend UI logic for authorization.

Priority: MEDIUM 🟡

Feature 7: Recording Feature
What it does: Captures the local canvas or specific media streams and writes them to the local disk via Electron's IPC bridge (start-recording, stop-recording).

What's broken or incomplete: Lack of UI progress feedback when muxing or saving large files. If FFmpeg takes 30 seconds to finalize an MP4, the app appears frozen.

Security concerns: IPC directory traversal attacks. If the frontend passes a custom filename like ../../../system32/evil.bat, a naive backend implementation will write it.

Performance concerns: Buffering high-bitrate video entirely in RAM before writing to disk will trigger Node's garbage collector and cause out-of-memory crashes on long streams.

Recommended refactor: Implement chunked file streaming. Send video buffers over IPC and immediately append them to an open fs.WriteStream on the OS level. Strictly sanitize all incoming filenames using path.basename() and restrict output to the user's Videos folder.

Priority: HIGH 🟠

Feature 8: Omegle/WebRTC
What it does: Facilitates peer-to-peer random matchmaking and video chat utilizing api-signaling (Socket.IO) and native WebRTC (SignalingClient).

What's broken or incomplete: Edge cases in the matchmaking logic. If a user closes the app mid-connection, they remain "stuck" in the matchmaking queue as a ghost, causing infinite loading for the peer attempting to connect to them.

Security concerns: Direct P2P WebRTC exposes user IP addresses to each other. Lack of Socket.IO rate-limiting allows malicious clients to flood the server with ICE candidates.

Performance concerns: Managing multiple active RTCPeerConnection objects simultaneously alongside the heavy React canvas engine will rapidly drain system memory and CPU.

Recommended refactor: Move the matchmaking queue state out of Node.js memory and into Redis for atomic, robust queue management. If masking IP addresses is a strict requirement, configure a TURN server to relay traffic rather than allowing direct STUN connections.

Priority: MEDIUM 🟡

🔍 PHASE 4 FIX PRIORITY QUEUE (Top 10)
[CRITICAL] Refactor Canvas Engine to strictly enforce the 1920x1080 logical pixel matrix, dropping all percentage-based fallbacks while preserving relative asset positions during scaling.

[CRITICAL] Restrict the api-handoff token generation exclusively to users engaged in an active streaming state. Reject all other requests.

[CRITICAL] Bypass React state (setState) for continuous dragging/animation in the Canvas System. Use refs and direct DOM manipulation to restore 60fps performance.

[CRITICAL] Isolate stream encoding pipelines (useRtmpStream, FFmpeg) from the main UI thread to prevent blocking the React render cycle.

[HIGH] Implement a ring-buffer for the CaptionRenderer to prevent stale DOM node accumulation and fix sync drift.

[HIGH] Implement "Keep-Alive" asset pooling for Scene Management to prevent WebGL and Camera contexts from unmounting/remounting during scene swaps.

[HIGH] Secure the Recording feature's IPC bridge by enforcing path.normalize() and restricting file writes strictly to safe system directories.

[HIGH] Secure Deepgram API keys by moving transcription token vending to the backend.

[MEDIUM] Migrate Electron token storage from plain-text electron-store to encrypted OS keychain storage (safeStorage).

[MEDIUM] Implement graceful fallback states for hardware disconnects in the Streaming feature to prevent UI crashes.

PHASE 5 — PRODUCTION READINESS CHECKLISTHere is the final production readiness checklist based on the deep architectural audit of the GAKI monorepo. This table evaluates the systemic gaps standing between the current codebase and a true v1.0 production release.Readiness MatrixAreaStatusBlocker?NotesError boundaries on all routes⚠️YesFatalErrorDialog.tsx exists, but the WebGL canvas (ThreeDGSViewer) and CaptionRenderer lack localized boundaries. If Three.js crashes, the entire React tree unmounts. Need strict boundaries around <CanvasShell>.Loading states for all async ops⚠️YesThemedLoader.tsx is present, but missing granular progress feedback for long-running IPC tasks (like the local FFmpeg recording mux process). The UI currently appears frozen during these tasks.Empty states for data-driven UI⚠️NoEmptySlot.tsx exists for layouts, but hardware disconnects (e.g., unplugging a webcam mid-stream) cause frozen frames rather than dropping cleanly to an empty state.Offline handling❌YesThe useAuth hook currently blocks the main studio rendering if Firebase cannot reach the network. The studio must load offline-first, hydrating cloud presets only when the connection is restored.Mobile responsiveness⚠️NoMobile architecture (pages/Mobile/_) exists, but the core VideoCanvas logic still struggles with matrix scaling. For a desktop-first streaming tool, mobile is secondary, but web viewers need stable scaling.Accessibility (a11y)⚠️NoYou are utilizing @radix-ui/_ which provides excellent base accessibility, but the heavily custom Drag-and-Drop canvas features and Hotkeys lack screen-reader announcements (aria-live).Analytics / Error Tracking❌YesNo presence of Sentry, Datadog, or PostHog in the package.json. If a user experiences an IPC bridge failure or WebRTC crash in production, you will have zero visibility into the stack trace.Rate limiting on all APIs❌YesAs flagged in Phase 2, the api-signaling (Socket.io) and api-handoff servers lack rate-limiting middleware, leaving the WebRTC matchmaking completely exposed to ICE candidate flooding.HTTPS enforced everywhere⚠️YesRequired for WebRTC getUserMedia() permissions. Ensure production Express servers sit behind a reverse proxy (Nginx/Cloudflare) enforcing SSL, and WSS (secure websockets) is used for signaling.CSP headers configured❌YesElectron's main.ts does not intercept network requests to inject a strict Content-Security-Policy. This leaves the app vulnerable to XSS execution via imported OBS overlays.Electron auto-updater❌Yeselectron-updater is conspicuously missing from the apps/desktop dependencies. If you ship v1.0 without this, users will be permanently stranded on that version without manual re-downloads.Native Crash Reporting❌YesElectron's native crashReporter is not initialized. If the C++ Node-Media-Server or FFmpeg subprocess segfaults and takes down the main process, standard web error tracking won't catch it.🚀 PHASE 5 FIX PRIORITY QUEUE (Top 5 Launch Blockers)[CRITICAL] Install and configure electron-updater in apps/desktop. Shipping an Electron app without an update pipeline is a fatal launch mistake.[CRITICAL] Integrate Sentry (or equivalent) for both the React frontend and the Node/Electron backend to capture unhandled exceptions and native crashes.[CRITICAL] Decouple Firebase Auth from the initial app render to allow the Studio to boot instantly in an offline state.[HIGH] Implement WebGL and Hardware Media Error Boundaries. A failed camera or crashed GPU shader must not crash the entire studio UI.[HIGH] Enforce strict CSP headers in the Electron wrapper and apply API rate limiting to the WebRTC signaling servers.
