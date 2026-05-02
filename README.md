<div align="center">
  <img src="apps/web/public/logo_256x256.png" alt="GAKI - House of Video Creation Logo" width="180"/>
  <h1>🎥 GAKI - House of Video Creation</h1>
  <p><strong>A production-grade, browser and desktop live streaming studio with OBS-like scene collections, AI features, and seamless device handoff.</strong></p>

  [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
  [![Electron](https://img.shields.io/badge/Electron-Desktop-47848f?logo=electron&logoColor=white)](apps/desktop)
  [![React](https://img.shields.io/badge/React-Web-61dafb?logo=react&logoColor=white)](apps/web)
</div>

<br/>

GAKI - House of Video Creation represents a modern, web-first paradigm for live streaming. By decoupling the rendering engine from the UI and leveraging WebGL, it delivers desktop-class scene composition directly in the browser. Coupled with an Electron shell, it provides deep OS integrations like local RTMP ingest and hardware encoding for a professional broadcast experience.

## ✨ Highlights

*   **🎬 OBS Scene Integration**: Natively import standard OBS Studio `.json` scene collections straight into the web canvas.
*   **📱 Seamless Device Handoff**: Initiate streaming on a mobile device or browser, and flawlessly transfer the live broadcast to your desktop client without interrupting the stream key connection.
*   **🎨 Multi-Layered Canvas**: Advanced Zustand-managed state handling draggable elements, PIP controls, and custom WebGL stingers.
*   **🔐 Seamless Authentication**: Deeply integrated Google/Gmail sign-in flows.

## 🏗️ System Architecture

Built as a **pnpm monorepo** and orchestrated by Turborepo, the system separates concerns into high-performance applications and modular packages:

| Component | Description |
| :--- | :--- |
| 🌐 **[Web Studio](apps/web)** | The core React/Vite application. Orchestrates the multi-layered video canvas, OBS JSON parsing, and smooth scene transitions. |
| 🖥️ **[Desktop Client](apps/desktop)** | The Electron wrapper. Unlocks native OS capabilities, local file recording, and hosts a local RTMP server. |
| 🧠 **[ML Backend](apps/ml-backend)** | Python-based AI microservices powering intelligent features like background removal and auto-framing. |
| 🔄 **[Handoff Infrastructure](docs/HANDOFF_FLOW.md)** | `api-handoff`, `api-signaling`, and `handoff-sdk`. The backbone for zero-downtime broadcast transfers across devices. |
| ⚙️ **[Engine](packages/engine)** | The WebGL rendering loop and audio mixing powerhouse, isolated for maximum performance. |

## 🚀 Quick Start

### Prerequisites
Make sure you have installed:
*   [Node.js](https://nodejs.org/) (v18 or higher)
*   [pnpm](https://pnpm.io/) (v8 or higher)

### 🛠️ Setup & Run

1. **Install Dependencies** across all workspaces:
   ```bash
   pnpm install
   ```

2. **Start the Development Environment** (Web Studio + Signaling API):
   ```bash
   pnpm turbo run dev --filter=web --filter=api-signaling
   ```

3. **Build the Desktop Client** (Electron):
   ```bash
   pnpm turbo run build --filter=desktop
   ```

## 📚 Documentation Directory

Explore the detailed guides for deeper insights into the architecture and modules:

**System Level Guides**
*   [System Architecture & State](docs/ARCHITECTURE.md)
*   [Cross-Device Handoff Flow](docs/HANDOFF_FLOW.md)
*   [Deployment Guide](docs/DEPLOYMENT.md)

**App & Package Level Specs**
*   [Web Studio (Frontend)](apps/web/README.md)
*   [Desktop Client (Electron)](apps/desktop/README.md)
*   [Handoff SDK](packages/handoff-sdk/README.md)
*   [Rendering Engine](packages/engine/README.md)
*   [ML Backend](apps/ml-backend/README.md)

---
<div align="center">
  <i>Built with ❤️ using React, Zustand, Vite, and Electron.</i>
</div>
