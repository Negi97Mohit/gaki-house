# Handoff API (`@gaki/api-handoff`)

## Purpose
Node.js Express service that validates Firebase Auth tokens and mints scoped LiveKit room tokens for cross-device handoff sessions.

## Commands
```bash
pnpm --filter @gaki/api-handoff type-check
pnpm --filter @gaki/api-handoff build
pnpm --filter @gaki/api-handoff start
```

## Boundaries
- Consumed by `@gaki/handoff-sdk` and `@gaki/web`.
- Uses `firebase-admin` and `livekit-server-sdk`.

## Gotchas
- LiveKit tokens are short-lived and scoped per session; clients must not cache them across sessions.
- Handoff assumes a single active room per device pair.

## "Never" Rules
- Never hardcode Firebase service account credentials or LiveKit API secrets.
- Never mint tokens without verifying the caller's Firebase Auth JWT.

## Common Mistakes
- Creating parallel LiveKit rooms for the same device pair during handoff.
