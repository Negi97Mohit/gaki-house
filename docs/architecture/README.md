# Architecture

→ Back to [Index](../INDEX.md)

> Last Updated: 2026-04-03

---

## High-Level Architecture

GAKI Studio is a **monorepo** containing a React SPA (web app) that also runs inside an Electron shell (desktop app). The architecture follows a layered approach:

```
┌─────────────────────────────────────────────────────┐
│                    Electron Shell                     │
│  ┌───────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ main.ts   │  │ preload  │  │ Socket.IO Server │  │
│  │ (Node.js) │  │ (bridge) │  │ (RTMP relay)     │  │
│  └─────┬─────┘  └────┬─────┘  └────────┬─────────┘  │
│        │IPC           │contextBridge    │ws://3000    │
├────────┼──────────────┼─────────────────┼────────────┤
│        ▼              ▼                 ▼             │
│  ┌────────────────────────────────────────────────┐  │
│  │              React SPA (Renderer)               │  │
│  │  ┌──────────────────────────────────────────┐  │  │
│  │  │              App.tsx (Root)                │  │  │
│  │  │  Providers: Query, Log, Debug, Auth, Theme│  │  │
│  │  │  Router: BrowserRouter | HashRouter       │  │  │
│  │  └──────────────┬───────────────────────────┘  │  │
│  │                 │                               │  │
│  │  ┌──────────────┼──────────────────────────┐   │  │
│  │  │   Routes     │                          │   │  │
│  │  │  /          → Index (Studio)             │   │  │
│  │  │  /platform/* → Platform (Streaming)      │   │  │
│  │  │  /m/*       → Mobile (Responsive)        │   │  │
│  │  │  /remote-cam → RemoteCamera              │   │  │
│  │  └──────────────────────────────────────────┘   │  │
│  │                                                  │  │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐  │  │
│  │  │  Zustand   │ │  Features  │ │   Kernel   │  │  │
│  │  │  Stores    │ │  Modules   │ │  (WebGL)   │  │  │
│  │  └────────────┘ └────────────┘ └────────────┘  │  │
│  └────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## Data Flow

### Studio Recording Flow
```
User Interaction
    │
    ▼
Index.tsx (page orchestrator)
    │ updates scene state
    ▼
useSceneStore (Zustand) ◄──── useLayerControls (hook)
    │
    ├──► VideoCanvas (renders current scene)
    │       │
    │       ├──► CameraRenderer (WebGL effects pipeline)
    │       │       └──► GLRenderer → ShaderManager → GPU
    │       │
    │       ├──► Draggable* Components (overlay elements)
    │       │       └──► react-rnd (drag/resize)
    │       │
    │       ├──► CaptionRenderer (live captions)
    │       │       └──► dynamicCaptionStyles (word animations)
    │       │
    │       └──► HtmlOverlayRenderer (AI iframes)
    │
    └──► useStreamStore → Electron IPC → FFmpeg → RTMP Server
```

### AI Overlay Generation Flow
```
User types/speaks command
    │
    ▼
AICommandPopover / useDeepgramSpeech
    │
    ▼
lib/ai.ts → processCommandWithAgent()
    │
    ├── Builds MASTER_PROMPT (context + rules)
    ├── Sends to Gemini API (fetch)
    │
    ▼
Gemini returns HTML/CSS/JS string
    │
    ▼
Index.tsx → addOverlay to scene state
    │
    ▼
VideoCanvas → DraggableOverlay → HtmlOverlayRenderer
    │
    ▼
Sandboxed <iframe> renders the overlay
```

### Live Caption Flow
```
Microphone → getUserMedia()
    │
    ▼
useContinuousAudio (MediaRecorder chunks)
    │
    ▼
useDeepgramSpeech (WebSocket → Deepgram Nova-2)
    │
    ├── onPartialTranscript → interimTranscript state
    └── onFinalTranscript → fullTranscript state
           │
           ▼
    CaptionRenderer
           │
           ▼
    DYNAMIC_STYLES[styleName] (animation component)
    e.g., KaraokeComponent, PopUpComponent
```

### Streaming Flow (Electron)
```
Canvas → captureStream()
    │
    ▼
MediaRecorder (WebM chunks)
    │
    ▼
window.electron.stream.sendData(chunk)  ← preload bridge
    │
    ▼
ipcMain 'stream:data' handler
    │
    ▼
ffmpegCommand.ffmpegProc.stdin.write(chunk)
    │
    ▼
FFmpeg encodes → RTMP flv output
    │
    ▼
YouTube/Twitch/Kick RTMP server
```

## Layer Architecture

```
┌─────────────────────────────────────────┐
│  Pages (route-level orchestrators)       │
│  Index.tsx, PlatformLayout, MobileLayout │
├─────────────────────────────────────────┤
│  Features (domain modules)               │
│  ai-assistant, canvas, caption, stream,  │
│  vault, animation, auth, omegle, theme   │
├─────────────────────────────────────────┤
│  Stores (global state via Zustand)       │
│  scene, stream, media, canvas, ui        │
├─────────────────────────────────────────┤
│  Hooks (reusable logic)                  │
│  useAutoFraming, useSnapGuides,          │
│  useKeyboardShortcuts, etc.              │
├─────────────────────────────────────────┤
│  Kernel (low-level engine)               │
│  GLRenderer, ShaderManager, VideoTexture │
├─────────────────────────────────────────┤
│  Shared (infrastructure)                 │
│  shadcn/ui components, utilities         │
├─────────────────────────────────────────┤
│  Lib (configuration & API clients)       │
│  ai.ts, assetApis.ts, effects.ts         │
├─────────────────────────────────────────┤
│  Types (data model definitions)          │
│  caption.ts, editor.ts, videoCanvas.ts   │
└─────────────────────────────────────────┘
```

→ See [State Management](./state-management.md) for store details  
→ See [IPC Bridge](./ipc-bridge.md) for Electron communication  
→ See [Electron–Webapp Bridge](./electron-webapp-bridge.md) for how the two runtimes connect  
→ See [Routing](./routing.md) for route structure  
→ See [Integrations](./integrations.md) for external services
