# Check Monorepo Health

Run the full verification suite from the monorepo root:

```bash
pnpm env-check
pnpm boundary-check
pnpm check
```

If any check fails:
1. Fix boundary violations in `.dependency-cruiser.cjs` output by using declared package `exports` maps (never bypass rules).
2. Fix type errors without adding `any` or `@ts-ignore`.
3. Do not raise `@gaki/web` `--max-warnings` — fix any new lint warnings you introduced.
