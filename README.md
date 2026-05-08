<div align="center">
  <br/>
  <img src="apps/web/public/logo.svg" width="72" height="72" alt="GAKI Logo" />
  <br/><br/>
  <h1>GAKI</h1>
  <p>House of Video Creation</p>
  <br/>

  ![License](https://img.shields.io/badge/license-MIT-4FD1C5?style=flat-square&labelColor=0f0f0f)
  ![Electron](https://img.shields.io/badge/electron-desktop-4FD1C5?style=flat-square&labelColor=0f0f0f&logo=electron&logoColor=4FD1C5)
  ![React](https://img.shields.io/badge/react-vite-4FD1C5?style=flat-square&labelColor=0f0f0f&logo=react&logoColor=4FD1C5)
  ![pnpm](https://img.shields.io/badge/pnpm-monorepo-4FD1C5?style=flat-square&labelColor=0f0f0f&logo=pnpm&logoColor=4FD1C5)
  ![WebGL](https://img.shields.io/badge/webgl-engine-4FD1C5?style=flat-square&labelColor=0f0f0f)

  <br/><br/>

  <p>A production-grade browser and desktop live streaming studio —<br/>OBS scene collections, AI features, and seamless cross-device broadcast handoff.</p>

  <br/>
</div>

---

## Features

| | |
|:---|:---|
| **OBS Scene Integration** | Import standard OBS Studio `.json` scene collections natively. No conversion required. |
| **Cross-Device Handoff** | Transfer a live broadcast from mobile or browser to desktop without dropping the stream key. |
| **Multi-Layered Canvas** | Zustand-managed state with draggable elements, PiP controls, and WebGL stinger transitions. |
| **Seamless Auth** | Integrated Google sign-in across web, desktop, and the handoff infrastructure. |

---

## Architecture

Built as a **pnpm monorepo** orchestrated by Turborepo.

| Package | Path | Description |
|:---|:---|:---|
| Web Studio | `apps/web` | Core React/Vite application. Multi-layered canvas, OBS JSON parsing, and scene transitions. |
| Desktop Client | `apps/desktop` | Electron wrapper. Native OS capabilities, local recording, and a local RTMP server. |
| ML Backend | `apps/ml-backend` | Python AI microservices — background removal, auto-framing, and more. |
| Handoff Infra | `api-handoff` / `api-signaling` / `handoff-sdk` | Zero-downtime broadcast transfers across devices and network boundaries. |
| Rendering Engine | `packages/engine` | WebGL rendering loop and audio mixing, isolated for maximum performance. |

---

## Quick Start

> **Prerequisites** — [Node.js](https://nodejs.org) `v18+` and [pnpm](https://pnpm.io) `v8+`

**1 — Install dependencies**

```bash
pnpm install
```

**2 — Start the dev environment**

```bash
# Web Studio + Signaling API
pnpm turbo run dev --filter=web --filter=api-signaling
```

**3 — Build the desktop client**

```bash
pnpm turbo run build --filter=desktop
```

---

## Documentation

**System level**

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
  <br/>
  <img src="apps/web/public/logo.svg" width="22" height="22" alt="" />
  <br/><br/>
  <sub>Built with React · Zustand · Vite · Electron · WebGL · Turborepo</sub>
  <br/><br/>
</div>