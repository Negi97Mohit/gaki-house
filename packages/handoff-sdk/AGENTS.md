# `@gaki/handoff-sdk`

## Purpose
Cross-device streaming coordination SDK (`HandoffCoordinator`, `StreamManager`, `DeviceRegistry`, `handoffStore`) built on Firebase Firestore signaling and LiveKit.

## Commands
```bash
pnpm --filter @gaki/handoff-sdk type-check
pnpm --filter @gaki/handoff-sdk build
pnpm --filter @gaki/handoff-sdk test
```

## Boundaries
- Consumed by `apps/web` and `apps/gaki-mobile`.
- Communicates with `apps/api-handoff` (`/join`, `/start-broadcast`) using Firebase Auth JWTs.

## Gotchas
- `StreamManager.relinquishStream()` mutes local tracks immediately and waits 2500ms before calling `room.disconnect()` so LiveKit Egress picks up the incoming device's stream without dropping.
- `HandoffCoordinator.listenForSignals()` deletes the Firestore signal doc after `ACCEPTED` or `TAKEOVER` handling.

## "Never" Rules
- Never cache LiveKit tokens client-side across sessions.
- Never open parallel LiveKit rooms for the same device pair.

## Common Mistakes
- Calling `room.disconnect()` synchronously before the target device finishes claiming the stream.
