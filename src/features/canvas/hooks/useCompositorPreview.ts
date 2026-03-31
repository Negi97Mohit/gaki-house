/**
 * useCompositorPreview — React hook for displaying compositor preview frames.
 *
 * Manages a preview canvas that receives frames from the compositor worker
 * and displays them in the UI. The preview runs at a lower FPS than the
 * output to minimize main-thread overhead.
 *
 * Usage:
 *   const { previewRef, fps, isReady } = useCompositorPreview();
 *   return <canvas ref={previewRef} className="preview" />;
 *
 * → See src/kernel/compositor/CompositorBridge.ts
 * → See docs/electron/compositor.md
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import { useSceneCollectionStore } from '@/stores/sceneCollection.store';
import { useCompositeStream } from '@/features/stream/hooks/useCompositeStream';

export interface UseCompositorPreviewReturn {
  /** Ref for the preview <canvas> element */
  previewRef: React.RefObject<HTMLCanvasElement>;
  /** Current compositor FPS */
  fps: number;
  /** Whether the compositor is ready */
  isReady: boolean;
  /** Output MediaStream for streaming/recording */
  outputStream: MediaStream | null;
  /** Register a video element as a frame source */
  registerVideoSource: (sourceId: string, video: HTMLVideoElement) => void;
  /** Register a canvas element as a frame source */
  registerCanvasSource: (sourceId: string, canvas: HTMLCanvasElement) => void;
  /** Unregister a source */
  unregisterSource: (sourceId: string) => void;
  /** Active scene name */
  activeSceneName: string;
}

export function useCompositorPreview(): UseCompositorPreviewReturn {
  const {
    previewRef,
    outputStream,
    fps,
    isReady,
    registerVideoSource,
    registerCanvasSource,
    unregisterSource,
  } = useCompositeStream({ enabled: true });

  const activeSceneName = useSceneCollectionStore((s) => {
    const scene = s.collection.scenes.find(
      (sc) => sc.id === s.collection.activeSceneId
    );
    return scene?.name ?? 'Scene 1';
  });

  return {
    previewRef,
    fps,
    isReady,
    outputStream,
    registerVideoSource,
    registerCanvasSource,
    unregisterSource,
    activeSceneName,
  };
}
