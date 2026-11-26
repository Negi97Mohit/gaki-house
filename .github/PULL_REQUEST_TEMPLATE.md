## Summary
<!-- What does this PR change and why? -->

## Verification
- [ ] `pnpm boundary-check` passes (0 violations)
- [ ] `pnpm check` passes (`type-check`, `lint`, `test`)
- [ ] `pnpm env-check` passes (`.env.example` up to date, no `VITE_*` secrets)
- [ ] Verified in browser / Electron if UI or streaming pipeline changed

## AGENTS.md Checklist
- [ ] No new `index.ts` barrel files in `packages/*`
- [ ] No raw `z-index` numbers outside `apps/web/src/lib/zIndex.ts`
- [ ] No unapproved changes to audio DSP constants (`stream.service.ts` / `stream-audio-dsp.ts`)
- [ ] `@gaki/web` ESLint warnings did not exceed `--max-warnings`
- [ ] Workspace `AGENTS.md` updated if architecture, commands, or gotchas changed
