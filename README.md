# 🎥 Caption Cam Studio

> A production-grade, browser and desktop live streaming studio with OBS-like scene collections, AI features, and seamless device handoff.

Caption Cam Studio is a modern, web-first approach to live streaming. By decoupling the rendering engine from the UI and leveraging WebGL, it achieves desktop-class scene composition directly in the browser, while offering an Electron shell for native OS capabilities like local RTMP ingest and hardware encoding.

---

## 🏗️ System Architecture

This project is structured as a **pnpm monorepo** managed by Turborepo, separating concerns into distinct applications and shareable packages.

- 🌐 **Web Studio (`apps/web`)**: The core React/Vite application. Handles the multi-layered video canvas, OBS JSON parsing, and scene transitions.
- 🖥️ **Desktop Client (`apps/desktop`)**: The Electron wrapper. Exposes deep OS integrations, local file recording, and a local RTMP server.
- 🧠 **ML Backend (`apps/ml-backend`)**: Python-based AI microservices for features like background removal and auto-framing.
- 🔄 **Handoff Infrastructure**: Comprised of `apps/api-handoff`, `apps/api-signaling`, and `packages/handoff-sdk`. Enables seamless transfer of active broadcasts across devices.
- ⚙️ **Engine (`packages/engine`)**: The core WebGL rendering loop and audio mixing, isolated for performance.

---

## ✨ Key Features

- **OBS Scene Integration:** Import standard OBS Studio `.json` scene collections directly into the web canvas.
- **Seamless Device Handoff:** Start streaming on your phone or web browser and seamlessly transfer the active broadcast to your desktop client without dropping the stream key connection.
- **Multi-Layered Canvas:** Complex Zustand-managed state supporting draggable elements, PIP controls, and custom WebGL stingers.
- **Modular Authentication:** Integrated Google/Gmail sign-in flows.

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/) (v8+)

### Installation

1. Install dependencies across all workspaces:

```bash
pnpm install
```

2. Start the development environment (Web Studio + Signaling API):

```bash
pnpm turbo run dev --filter=web --filter=api-signaling
```

3. Build the Desktop (Electron) client:

```bash
pnpm turbo run build --filter=desktop
```

---

## 📚 Documentation Directory

To keep documentation maintainable and close to the code, detailed guides are split across the workspace.

**System Level:**

- [System Architecture & State](docs/ARCHITECTURE.md)
- [Cross-Device Handoff Flow](docs/HANDOFF_FLOW.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

**App & Package Level:**

- [Web Studio (Frontend)](apps/web/README.md)
- [Desktop Client (Electron)](apps/desktop/README.md)
- [Handoff SDK](packages/handoff-sdk/README.md)
- [Rendering Engine](packages/engine/README.md)
- [ML Backend](apps/ml-backend/README.md)

---

_Built with ❤️ using React, Zustand, Vite, and Electron._
