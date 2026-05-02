# System Architecture

GAKI - House of Video Creation is structured as a monorepo containing a web-based studio, an Electron desktop wrapper, signaling APIs, and custom rendering engines.

## High-Level Topology

1. **Web Studio (`apps/web`)**: The core visual interface. Built with React, Vite, and Zustand. It handles the multi-layered video canvas, OBS JSON scene parsing, and WebGL filter rendering.
2. **Desktop Client (`apps/desktop`)**: An Electron wrapper around the Web Studio. It exposes deep OS integrations, a local RTMP server for ingest, and filesystem access for saving local recordings.
3. **Engine (`packages/engine`)**: Core rendering loop, WebGL shaders, and audio mixing. Separated from the UI for performance.
4. **Handoff Infrastructure (`apps/api-handoff`, `apps/api-signaling`, `packages/handoff-sdk`)**: A system allowing users to transfer an active live stream seamlessly between the web browser and the desktop client (or between devices).
5. **ML Backend (`apps/ml-backend`)**: Python-based AI microservices (deployed via Modal/Colab) for advanced video features like background removal or AI auto-framing.

## State Management

Global state is managed via specialized Zustand slices (e.g., `useSceneStore`, `useCanvasState`). The `packages/core` library provides shared hooks and utilities to keep the UI in sync with the underlying `engine`.
