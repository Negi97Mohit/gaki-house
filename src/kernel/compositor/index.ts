/**
 * Compositor — Barrel export for the WebGL compositor module.
 *
 * This module provides a professional-grade, GPU-accelerated video compositor
 * that replaces the legacy DOM-based captureStream() approach.
 *
 * Architecture overview:
 *   CompositorBridge (main thread) ──► CompositorWorker (Web Worker)
 *                                        │
 *                                        ├── SourceRenderer (WebGL textured quads)
 *                                        ├── TransitionRenderer (GPU transitions)
 *                                        └── FilterPipeline (per-source effects)
 *
 * → See docs/electron/compositor.md for the full architecture
 * → See src/types/compositor.ts for core type definitions
 * → See src/stores/sceneCollection.store.ts for scene state management
 */

export { CompositorBridge } from './CompositorBridge';
export type { CompositorBridgeOptions } from './CompositorBridge';
export { SourceRenderer } from './SourceRenderer';
export { TransitionRenderer } from './TransitionRenderer';
export { FilterPipeline } from './FilterPipeline';
export { serializeScene } from './SceneGraph';
export type {
  CompositorCommand,
  CompositorEvent,
  SerializedScene,
  SerializedSource,
  SerializedTransform,
  SerializedFilter,
  SerializedTransition,
  SerializedOutputConfig,
  SerializedGridLayout,
  SerializedGridCell,
  SourceGPUState,
  FBOState,
  ShaderProgramInfo,
} from './types';
