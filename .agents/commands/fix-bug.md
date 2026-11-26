# Fix a Bug

1. Locate the failing module:
   - Streaming / RTMP / audio DSP: `apps/web/src/features/stream/services/stream.service.ts` (do not alter DSP constants in `stream-audio-dsp.ts`).
   - Canvas / WebGL kernel: `packages/engine/src/kernel/engine/BroadcastBus.ts`.
   - Signaling / Omegle: `apps/api-signaling/signaling-server.js`.
   - Cross-device handoff: `packages/handoff-sdk/src/media/HandoffCoordinator.ts` & `StreamManager.ts`.
   - Netlify token/proxy endpoints: `apps/web/netlify/functions/` (`_security.ts`, `deepgram-token.ts`, `twitch-token.ts`, `kick-proxy.ts`, `gemini-proxy.ts`).
2. Write a failing Vitest test first in the workspace's `__tests__/` directory using mocks (no real network/ports).
3. Fix the root cause cleanly without adding `any` or raising `--max-warnings`.
4. Run `pnpm env-check && pnpm boundary-check && pnpm check`.
