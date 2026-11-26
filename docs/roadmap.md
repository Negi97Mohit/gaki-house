# GAKI Production Roadmap

1. **Seamless scene transitions** (`apps/web`, `packages/engine`) — Lift `BroadcastBus` above `CanvasView` so it survives scene switches without brief stream drops.
2. **Cross-device handoff lifecycle** (`apps/web`, `apps/api-handoff`, `packages/handoff-sdk`) — Stabilize full start -> transfer -> resume.
3. **Desktop Electron build** (`apps/desktop`) — Verify auto-update and native window capture end-to-end.
4. **Mobile streaming client** (`apps/gaki-mobile`) — Verify go-live with camera + effects end-to-end.
5. **ML backend integration** (`apps/ml-backend`, `apps/web`) — Verify production Modal inference.
6. **Signaling server hardening** (`apps/api-signaling`) — Connection drop handling, room cleanup, health checks.
