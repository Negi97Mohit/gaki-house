<div align="center">
  <img src="apps/web/public/logo.svg" width="64" height="64" alt="GAKI" />
  <br/><br/>
  <strong>GAKI</strong>
  <br/>
  House of Video Creation
  <br/><br/>
  <img src="https://img.shields.io/badge/license-MIT-black?style=flat-square" alt="MIT License" />
  <img src="https://img.shields.io/badge/electron-desktop-black?style=flat-square&logo=electron&logoColor=white" alt="Electron" />
  <img src="https://img.shields.io/badge/react-vite-black?style=flat-square&logo=react&logoColor=white" alt="React + Vite" />
  <img src="https://img.shields.io/badge/pnpm-monorepo-black?style=flat-square&logo=pnpm&logoColor=white" alt="pnpm monorepo" />
</div>

<br/>

A production-grade browser and desktop live streaming studio — OBS scene collections, AI-powered features, and seamless cross-device broadcast handoff.

---

## Features

**OBS Scene Integration** — Import standard OBS Studio `.json` scene collections natively into the web canvas. No conversion required.

**Cross-Device Handoff** — Start streaming on mobile or browser, then transfer the live broadcast to your desktop without interrupting the stream key connection.

**Multi-Layered Canvas** — Zustand-managed state with draggable elements, picture-in-picture controls, and custom WebGL stinger transitions.

**Seamless Auth** — Integrated Google sign-in across web, desktop, and the handoff infrastructure — one session everywhere.

---

## Architecture

Built as a **pnpm monorepo** orchestrated by Turborepo.

| Package | Path | Description |
| :--- | :--- | :--- |
| Web Studio | `apps/web` | Core React/Vite application. Orchestrates the multi-layered canvas, OBS JSON parsing, and scene transitions. |
| Desktop Client | `apps/desktop` | Electron wrapper. Native OS capabilities, local file recording, and a local RTMP server. |
| ML Backend | `apps/ml-backend` | Python AI microservices — background removal, auto-framing, and other intelligent features. |
| Handoff Infra | `api-handoff` · `api-signaling` · `handoff-sdk` | Backbone for zero-downtime broadcast transfers across devices. |
| Rendering Engine | `packages/engine` | WebGL rendering loop and audio mixing, isolated for maximum performance. |

---

## Quick Start

**Prerequisites:** [Node.js](https://nodejs.org) v18+ and [pnpm](https://pnpm.io) v8+

**1. Install dependencies**

```bash
pnpm install
```

**2. Start the dev environment** — Web Studio + Signaling API

```bash
pnpm turbo run dev --filter=web --filter=api-signaling
```

**3. Build the desktop client**

```bash
pnpm turbo run build --filter=desktop
```

---

## Documentation

**System**
- [Architecture & State](docs/ARCHITECTURE.md)
- [Cross-Device Handoff Flow](docs/HANDOFF_FLOW.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

**Apps & Packages**
- [Web Studio](apps/web/README.md)
- [Desktop Client](apps/desktop/README.md)
- [Handoff SDK](packages/handoff-sdk/README.md)
- [Rendering Engine](packages/engine/README.md)
- [ML Backend](apps/ml-backend/README.md)

---

<div align="center">
  <img src="apps/web/public/logo.svg" width="20" height="20" alt="" />
  &nbsp;
  <sub>React · Zustand · Vite · Electron · WebGL · Turborepo</sub>
</div>