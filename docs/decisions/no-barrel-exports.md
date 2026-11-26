# ADR: Use `package.json` `exports` Maps Instead of Barrel `index.ts` Files

## Context
Across the monorepo there are ~771 deep cross-package imports (e.g., `@gaki/ui/button`, `@gaki/core/types/...`).

## Decision
Enforce package boundaries via `package.json` `exports` maps and `tsconfig.json` (plus boundary lint rules in Phase 3) rather than creating barrel `index.ts` files.

## Why
Creating barrel files for 771 deep imports would re-export everything, defeat tree-shaking, and fail to enforce clean module boundaries. Explicit `exports` maps keep existing import paths working while blocking unexported internal imports.
