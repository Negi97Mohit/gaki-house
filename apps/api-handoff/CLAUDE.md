# Handoff API (`@gaki/api-handoff`)

## 🗺️ What This Is
A dedicated Node.js Express service responsible for securely brokering LiveKit tokens for the cross-device streaming feature (Handoff).

## 🔌 How It Connects to the Monorepo
- **Imports from:** `firebase-admin` (for verifying auth tokens), `livekit-server-sdk` (for generating ingress/egress room tokens).
- **Exposes:** REST API endpoints consumed by `@gaki/handoff-sdk` and `@gaki/web`.

## 📁 Directory Map
- `src/index.ts` — The main Express server and route definitions.

## ⚡ Key Business Logic
- **Token Vending:** Validates Firebase Auth tokens sent by clients and mints scoped LiveKit room tokens.
- **Zero-Downtime Transfer:** Orchestrates the transition of a stream's "Active Master" from one device to another without dropping the RTMP connection.
