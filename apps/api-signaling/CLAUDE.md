# Signaling API (`@gaki/api-signaling`)

## 🗺️ What This Is
A lightweight WebRTC signaling server that facilitates peer-to-peer connections. Primarily powers the "Omegle Mode" random stranger matching feature.

## 🔌 How It Connects to the Monorepo
- **Consumed by:** `apps/web/src/features/omegle`
- **External Dependencies:** Built on Socket.io. Deployed via Render (`render.yaml`).

## 📁 Directory Map
- `signaling-server.js` — The core WebRTC connection broker and matchmaking logic.
- `index.js` — Server entry point.

## ⚡ Key Business Logic
- **Matchmaking:** Manages waiting pools and assigns WebRTC SDP offers/answers between two disconnected peers.
