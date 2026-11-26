# ADR: Audio DSP Constants Frozen (`stream.service.ts`)

## Context
`apps/web/src/features/stream/services/stream.service.ts` contains tuned noise gate thresholds, attack/release times, and `-48`/`-40` dBFS rules.

## Decision
Do **not** modify these DSP constants or audio routing without explicit user instruction.

## Why
They were tuned to eliminate audio chopping and breathing artifacts in production. Audio routing changes can also introduce feedback loops that are invisible in local development.
