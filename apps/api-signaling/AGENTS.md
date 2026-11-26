# Signaling API (`@gaki/api-signaling`)

## Purpose
Plain-JS Socket.io WebRTC signaling broker powering Omegle Mode matchmaking, room management, and SDP/ICE/chat relay.

## Commands
```bash
pnpm --filter @gaki/api-signaling test
pnpm --filter @gaki/api-signaling start:signaling
```

## Boundaries
- Consumed by `apps/web/src/features/omegle`.
- Deployed via Render (`render.yaml`).
- Plain JavaScript (`"type": "module"`), no TypeScript build step.

## Gotchas
- `signaling-server.js` starts `httpServer.listen(PORT)` on module load; tests mock `http` and `socket.io` so no real ports are opened.
- Rooms and matchmaking queue are stored in-memory (`activeRooms`, `userRooms`, `matchmakingQueue`).

## "Never" Rules
- Never leave disconnected sockets in `matchmakingQueue` or `activeRooms` without notifying the partner and cleaning up `userRooms`.

## Common Mistakes
- Importing TypeScript syntax into `signaling-server.js` or `index.js`.
- Breaking the `request-match` / `match-found` / `webrtc-offer` / `webrtc-answer` / `ice-candidate` / `partner-disconnected` event contract expected by `apps/web`.
