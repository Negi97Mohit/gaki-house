# Plan a Feature or Refactor

1. Read root `AGENTS.md` and the target workspace's `AGENTS.md` (`apps/web/AGENTS.md`, `packages/engine/AGENTS.md`, etc.).
2. Check architectural rules in `docs/architecture.md` and `docs/decisions/` (`no-barrel-exports.md`, `audio-dsp-no-touch.md`).
3. Verify package boundaries before designing cross-package imports (`.dependency-cruiser.cjs` and each package's `package.json` `exports` map).
4. Keep files small (<300 lines) and split helpers/types into sibling modules.
5. Identify which tests to add or update (`apps/web/src/__tests__/`, `packages/core/src/__tests__/`, `packages/engine/src/__tests__/`, `packages/handoff-sdk/src/__tests__/`, `apps/api-signaling/__tests__/`).
