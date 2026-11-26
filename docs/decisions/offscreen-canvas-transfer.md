# ADR: OffscreenCanvas Must Be Transferred, Not Copied

## Context
`packages/engine/src/kernel/workers/canvas.worker.ts` renders the studio canvas in a Web Worker.

## Decision
Always transfer control of the canvas via `transferControlToOffscreen()`, never copy it.

## Why
Copying breaks the worker-owned rendering context. Additionally, `captureStream()` does not work directly on `OffscreenCanvas` (Chromium bug 754408), so the main-thread pipeline uses `drawImage()` from the worker output onto a hidden main-thread 1920×1080 canvas before calling `captureStream()`.
