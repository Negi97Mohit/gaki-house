# External Integrations

→ Back to [Index](../INDEX.md) | [Architecture](./README.md)

> Last Updated: 2026-04-03

---

## Google Gemini (AI Overlay Engine)

**Purpose:** Generates HTML/CSS/JS overlay code from natural language prompts.

| Detail | Value |
|---|---|
| Model | `gemini-2.0-flash-exp` |
| Entry point | `src/lib/ai.ts` → `processCommandWithAgent()` |
| API | REST (`https://generativelanguage.googleapis.com/...`) |
| Auth | API key via `VITE_GEMINI_API_KEY` |
| System prompt | `MASTER_PROMPT` (defines canvas constraints, style rules, capabilities) |
| Update prompt | `UPDATE_PROMPT` (modifies existing overlays) |

**Data flow:**  
`User prompt → MASTER_PROMPT + user text → Gemini API → HTML string → sandboxed iframe`

**Key functions:**
- `processCommandWithAgent(prompt)` — Generate new overlay
- `updateOverlay(existingHtml, prompt)` — Modify existing overlay
- `analyzeUpdateRequest(prompt)` — Determine if update or new
- `callGemini(prompt, systemPrompt)` — Raw API call

→ See [AI Engine](../webapp/features/ai-engine.md)

---

## Deepgram (Speech-to-Text)

**Purpose:** Real-time live transcription with word-level timestamps.

| Detail | Value |
|---|---|
| Model | Nova-2 |
| Entry point | `src/hooks/useDeepgramSpeech.ts` |
| SDK | `@deepgram/sdk` v4.11.2 |
| Auth | API key via `VITE_DEEPGRAM_API_KEY` |
| Protocol | WebSocket (persistent connection) |

**Data flow:**  
`Mic → useContinuousAudio (MediaRecorder chunks) → WebSocket → Deepgram → onPartialTranscript / onFinalTranscript`

**Events handled:**
- `LiveTranscriptionEvents.Open` — Connection established
- `LiveTranscriptionEvents.Transcript` — Transcription result
- `LiveTranscriptionEvents.Close` — Connection closed
- `LiveTranscriptionEvents.Error` — Error

→ See [Caption System](../webapp/features/caption-system.md)

---

## Firebase

**Purpose:** Authentication and community preset sharing.

| Detail | Value |
|---|---|
| SDK | `firebase` v12.6.0 |
| Init | `src/lib/firebase.ts` |
| Auth | Firebase Auth (Google provider) |
| Database | Firestore (community presets) |
| Project | `gaki-fb708` |

**Electron compatibility:** Standard Firebase popup auth doesn't work in Electron (unauthorized domain). The app uses a custom Google OAuth flow via `ipcMain.handle('auth:google-oauth')` that:
1. Fetches the Google client ID from Firebase's project config
2. Opens Google's OAuth page in a modal BrowserWindow
3. Intercepts the redirect to extract tokens
4. Uses tokens to create a Firebase credential

→ See [Auth](../webapp/features/auth.md) | [IPC Bridge](./ipc-bridge.md)

---

## Supabase

**Purpose:** Alternative backend (database, auth, storage).

| Detail | Value |
|---|---|
| SDK | `@supabase/supabase-js` v2.95.3 |
| Init | `src/integrations/supabase/` |
| Auth | `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` |

---

## Pexels API

**Purpose:** Stock photo and video search.

| Detail | Value |
|---|---|
| Entry point | `src/lib/assetApis.ts` → `searchImages()` |
| Auth | `VITE_PEXELS_API_KEY` (passed as `Authorization` header) |
| Pagination | Cursor-based (`page` param) |

---

## Pixabay API

**Purpose:** Free image search.

| Detail | Value |
|---|---|
| Entry point | `src/lib/assetApis.ts` → `searchImages()` |
| Auth | `VITE_PIXABAY_API_KEY` (passed as query param) |
| Pagination | Offset-based |

---

## GIPHY API

**Purpose:** GIF search.

| Detail | Value |
|---|---|
| Entry point | `src/lib/assetApis.ts` → `searchGifs()` |
| Auth | `VITE_GIPHY_API_KEY` (passed as query param) |
| Pagination | Offset-based |

---

## MediaPipe (Google)

**Purpose:** Computer vision tasks (face detection, segmentation).

### Face Detection (`@mediapipe/face_detection`)
Used in `useAutoFraming.ts` for AI-powered face tracking and auto-centering.

### Selfie Segmentation (`@mediapipe/selfie_segmentation`)
Used in `useCameraEffects.ts` for background blur and virtual backgrounds.

### Tasks Vision (`@mediapipe/tasks-vision`)
Advanced vision tasks for real-time processing.

---

## PeerJS (WebRTC)

**Purpose:** Peer-to-peer video connections for remote phone camera.

| Detail | Value |
|---|---|
| SDK | `peerjs` v1.5.5 |
| Entry point | `src/hooks/useRemotePeer.ts` |
| Use case | Phone scans QR code → connects to desktop → sends camera feed |

---

## Excalidraw

**Purpose:** Embedded drawing canvas for sketches and annotations.

| Detail | Value |
|---|---|
| Package | `@excalidraw/excalidraw` v0.18.0 |
| Integration | Mounted as React component in `ExcalidrawOverlay.tsx` |
| Data exchange | `initialElements` prop in, `onElementsChange` callback out |

---

## YouTube InnerTube API

**Purpose:** Search for live YouTube streams (for the platform browse feature).

| Detail | Value |
|---|---|
| Entry point | `vite.config.ts` (dev plugin) / `netlify/functions/youtube-live-proxy.ts` |
| No API key | Uses public InnerTube endpoint |
| Proxy | Required to bypass CORS |

---

## Kick API

**Purpose:** Fetch Kick.com stream data.

| Detail | Value |
|---|---|
| Proxy | `/api/kick` → `https://kick.com/api/v1` (Vite dev proxy) |
| Electron | Uses `kickFetch()` IPC handler with hidden BrowserWindow to bypass Cloudflare |

---

## DLive GraphQL API

**Purpose:** Fetch DLive stream data.

| Detail | Value |
|---|---|
| Proxy | `/api/dlive` → `https://graphigo.prd.dlive.tv` (Vite dev proxy) |

---

## FFmpeg (Electron-only)

**Purpose:** Video encoding for RTMP streaming and recording conversion.

| Detail | Value |
|---|---|
| Wrapper | `fluent-ffmpeg` v2.1.3 |
| Binary | `ffmpeg-static` v5.3.0 (bundled) |
| Streaming codec | `libx264` (re-encode) or `copy` (passthrough for H.264 input) |
| Recording conversion | WebM → MP4 with `copy` video, `aac` audio |

→ See [Streaming Pipeline](../electron/streaming.md)

---

## Socket.IO (Electron-only)

**Purpose:** Alternative real-time streaming engine communication.

| Detail | Value |
|---|---|
| Server | `socket.io` v4.8.3 (runs on port 3000 in main process) |
| Client | `socket.io-client` v4.8.3 (connects from renderer) |
| Events | `start-stream`, `binary-stream`, `stop-stream`, `ffmpeg-ready`, `stream-status` |

This is a **secondary** streaming path alongside the IPC-based approach. Both are available.

→ See [Streaming Pipeline](../electron/streaming.md)
