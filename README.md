# GAKI Studio

**GAKI — House of Video Creation** is an AI-powered, multi-scene streaming and recording studio built with React, TypeScript, and Electron.

---

## What It Does

- 🎬 **Multi-Scene Production** — Create and switch between scenes like OBS Studio
- 🤖 **AI Overlay Engine** — Generate HTML/CSS/JS overlays from natural language (Gemini)
- 🗣️ **Live Captions** — Real-time speech-to-text with 15+ animation styles (Deepgram)
- 🎨 **WYSIWYG Canvas** — Figma-like drag-and-resize workspace with snap guides
- 🔴 **RTMP Streaming** — Multi-destination streaming via FFmpeg (Electron)
- ⏺️ **Recording** — File recording (MP4) and keyframe session recording
- 📺 **Streaming Platform** — Twitch-like browse, search, and watch experience
- 🎭 **WebGL Effects** — Neon Edge, Hologram, VHS, and 50+ CSS filters
- 📱 **Remote Camera** — Use your phone as a camera via WebRTC

## Quick Start

```bash
npm install
npm run dev          # Web app on http://localhost:5173
npm run electron:dev # Desktop app (Electron)
```

## 📖 Documentation

**All documentation lives in the [`docs/`](./docs/INDEX.md) directory.**

Start with the **[Documentation Index](./docs/INDEX.md)** for a guided tour of the codebase.

| Section | Description |
|---|---|
| [Overview](./docs/overview/README.md) | What GAKI Studio is, capabilities, tech stack |
| [Architecture](./docs/architecture/README.md) | High-level architecture, data flow, state management |
| [Electron App](./docs/electron/README.md) | Desktop shell, streaming, recording, IPC |
| [Web App](./docs/webapp/README.md) | React SPA, features, components, hooks |
| [Development Guide](./docs/overview/dev-guide.md) | Setup, build, run, deploy |
| [Gaps & TODOs](./docs/overview/gaps-and-todos.md) | Known issues, missing features |

## Tech Stack

React 18 • TypeScript • Vite • Electron • Zustand • Tailwind CSS • shadcn/ui  
Google Gemini • Deepgram • MediaPipe • WebGL 2.0 • FFmpeg • PeerJS • Firebase

## License

MIT
