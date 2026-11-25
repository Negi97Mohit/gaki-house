# Review PR Against AGENTS.md

Check the diff for:
1. **Boundaries**: Any `packages/*` importing from `apps/*` or `@/...`? Run `pnpm boundary-check`.
2. **Audio DSP**: Any unapproved edits to `-48/-40 dBFS` gate thresholds, attack/release times, or `monitorGain` routing in `stream.service.ts` / `stream-audio-dsp.ts`?
3. **OffscreenCanvas / BroadcastBus**: Any `OffscreenCanvas` copied instead of transferred, or `BroadcastBus` instantiated inside React render?
4. **Z-index**: Any raw `z-index` numbers outside `apps/web/src/lib/zIndex.ts`?
5. **Secrets**: Any `VITE_*` client variable holding a secret, or `.env` changes not reflected in `.env.example`? Run `pnpm env-check`.
6. **Checks**: Confirm `pnpm check` passes.
