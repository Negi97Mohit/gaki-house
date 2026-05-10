# GAKI Mobile (`@gaki/gaki-mobile`)

## 🗺️ What This Is
The mobile-optimized React/Vite PWA client for GAKI. Acts as a companion app, allowing users to remotely control their desktop studio or operate as a remote camera source.

## 🔌 How It Connects to the Monorepo
- **Imports from:** `@gaki/ui` (Shared Tailwind components), `@gaki/handoff-sdk`.
- **Integrates with:** `apps/api-handoff` for session linkage.

## 📁 Directory Map
- `src/` — Standard Vite React structure (components, hooks, pages).

## ⚡ Key Business Logic
- **Mobile Camera Source:** Streams device camera data via LiveKit back to the main desktop compositing engine.
- **Remote Control:** Acts as a remote trigger / stream deck for the main studio canvas.
