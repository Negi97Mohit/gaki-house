# ADR: `BroadcastBus` Must Live Above the Scene Tree

## Context
`BroadcastBus` (`packages/engine`) manages the active compositing and broadcast output pipeline.

## Decision
Never instantiate or re-instantiate `BroadcastBus` inside a React component render cycle. It must live above the scene tree and survive scene switches.

## Why
Re-instantiating `BroadcastBus` on scene switch drops the live stream (currently tracked as Priority #1 broken target in `AGENTS.md`).
