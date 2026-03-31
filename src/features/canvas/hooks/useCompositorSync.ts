/**
 * useCompositorSync — Synchronization hook between the legacy scene system
 * and the new WebGL compositor.
 *
 * This hook is the primary integration point. It:
 *   1. Watches the legacy scene state (from useSceneManager)
 *   2. Converts it to CompositorScene format via legacySceneAdapter
 *   3. Pushes updates to the sceneCollection.store
 *   4. The sceneCollection.store is consumed by useCompositeStream → CompositorBridge
 *
 * The result: existing UI code continues to work unchanged, while the
 * new compositor receives properly formatted scene data.
 *
 * Usage (in useEditorOrchestrator):
 *   useCompositorSync({
 *     scenes: sceneManager.scenes,
 *     activeSceneId: sceneManager.activeSceneId,
 *     isTransitioning: sceneManager.isTransitioning,
 *   });
 *
 * → See src/features/canvas/model/legacySceneAdapter.ts for conversion logic
 * → See src/stores/sceneCollection.store.ts for the compositor store
 * → See docs/electron/compositor.md for architecture overview
 */

import { useEffect, useRef } from 'react';
import type { SceneState, SceneTransition as LegacyTransition } from '@/types/caption';
import { useSceneCollectionStore } from '@/stores/sceneCollection.store';
import {
  legacySceneToCompositorScene,
} from '@/features/canvas/model/legacySceneAdapter';
import type { CompositorScene, SceneTransition } from '@/types/compositor';
import { DEFAULT_TRANSITION } from '@/types/compositor';

export interface UseCompositorSyncOptions {
  /** All legacy scenes from useSceneManager */
  scenes: SceneState[];
  /** Currently active scene ID */
  activeSceneId: string;
  /** Whether a transition is currently playing */
  isTransitioning: boolean;
  /** The active transition data (for the compositor to render) */
  activeTransition?: LegacyTransition | null;
  /** Previous scene (source of transition) */
  previousScene?: SceneState | null;
  /** Whether compositor sync is enabled */
  enabled?: boolean;
}

/**
 * Synchronizes legacy scene state with the new compositor store.
 * Call this once at the orchestrator level.
 */
export function useCompositorSync(options: UseCompositorSyncOptions): void {
  const {
    scenes,
    activeSceneId,
    isTransitioning,
    activeTransition,
    previousScene,
    enabled = true,
  } = options;

  // Ref to track previous state and avoid redundant updates
  const lastSerializedRef = useRef<string>('');

  const {
    collection,
    setCollection,
    setActiveScene,
    setIsTransitioning,
  } = useSceneCollectionStore();

  // ── Sync scenes to compositor store ──

  useEffect(() => {
    if (!enabled || scenes.length === 0) return;

    // Convert all legacy scenes to compositor format
    const compositorScenes: CompositorScene[] = scenes.map(
      legacySceneToCompositorScene
    );

    // Create a simple hash to detect changes
    const serialKey = JSON.stringify({
      sceneIds: scenes.map((s) => s.id),
      activeId: activeSceneId,
      // Include a subset of state to detect meaningful changes
      overlayCount: scenes.reduce(
        (acc, s) =>
          acc +
          s.activeOverlays.length +
          s.textOverlays.length +
          s.fileOverlays.length +
          s.browserOverlays.length,
        0
      ),
      sceneNames: scenes.map((s) => s.name),
    });

    if (serialKey === lastSerializedRef.current) return;
    lastSerializedRef.current = serialKey;

    // Update the collection
    setCollection({
      ...collection,
      scenes: compositorScenes,
      activeSceneId,
      updatedAt: new Date().toISOString(),
    });
  }, [scenes, activeSceneId, enabled]);

  // ── Sync active scene changes (lightweight) ──

  useEffect(() => {
    if (!enabled) return;

    // When the active scene ID changes, update the collection
    if (collection.activeSceneId !== activeSceneId) {
      setActiveScene(activeSceneId);
    }
  }, [activeSceneId, enabled]);

  // ── Sync active scene content changes ──

  useEffect(() => {
    if (!enabled) return;

    const activeScene = scenes.find((s) => s.id === activeSceneId);
    if (!activeScene) return;

    // Re-convert just the active scene for real-time updates
    const compositorScene = legacySceneToCompositorScene(activeScene);

    // Lightweight update — only update the active scene in the collection
    setCollection({
      ...collection,
      scenes: collection.scenes.map((s) =>
        s.id === activeSceneId ? compositorScene : s
      ),
      activeSceneId,
      updatedAt: new Date().toISOString(),
    });
  }, [
    // Watch the specific properties that change frequently
    scenes.find((s) => s.id === activeSceneId)?.activeOverlays,
    scenes.find((s) => s.id === activeSceneId)?.textOverlays,
    scenes.find((s) => s.id === activeSceneId)?.fileOverlays,
    scenes.find((s) => s.id === activeSceneId)?.browserOverlays,
    scenes.find((s) => s.id === activeSceneId)?.isVideoOn,
    scenes.find((s) => s.id === activeSceneId)?.screenShareMode,
    scenes.find((s) => s.id === activeSceneId)?.layoutMode,
    scenes.find((s) => s.id === activeSceneId)?.pipPosition,
    scenes.find((s) => s.id === activeSceneId)?.pipSize,
    scenes.find((s) => s.id === activeSceneId)?.videoFilter,
    scenes.find((s) => s.id === activeSceneId)?.blankCanvasColor,
    scenes.find((s) => s.id === activeSceneId)?.canvasLayout,
    enabled,
  ]);

  // ── Sync transition state ──

  useEffect(() => {
    if (!enabled) return;
    setIsTransitioning(isTransitioning);
  }, [isTransitioning, enabled]);
}
