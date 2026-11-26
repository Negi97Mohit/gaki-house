# ADR: Centralized Z-Index Constants (`zIndex.ts`)

## Context
The studio UI layers WebGL canvases, draggable overlays, Radix portals, modals, and toolbars.

## Decision
Never write raw `z-index` numbers in CSS or Tailwind. Define and import named constants from `apps/web/src/lib/zIndex.ts`.

## Why
Ad-hoc z-index values cause Radix portal stacking collisions and hidden/unclickable overlays.
