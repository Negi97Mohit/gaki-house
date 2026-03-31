/**
 * useCompositeStream — React hook that manages the CompositorBridge lifecycle.
 *
 * This is the main integration point between the React UI and the WebGL compositor.
 * It:
 *   1. Initializes the CompositorBridge on mount
 *   2. Subscribes to the sceneCollection store and pushes scene updates
 *   3. Manages source frame registration (camera, screen, images)
 *   4. Provides the output MediaStream for streaming/recording
 *   5. Handles preview frame display
 *
 * Usage in a component:
 *   const { previewRef, outputStream, fps, isReady } = useCompositeStream();
 *   // previewRef → attach to a <canvas> element for preview display
 *   // outputStream → pass to the streaming pipeline (FFmpeg via IPC)
 *
 * → See docs/electron/compositor.md for overall architecture
 * → See src/kernel/compositor/CompositorBridge.ts for bridge details
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import { CompositorBridge } from '@/kernel/compositor/CompositorBridge';
import { useSceneCollectionStore } from '@/stores/sceneCollection.store';
import { AudioMixerEngine } from '@/kernel/audio/AudioMixerEngine';
import { DEFAULT_AUDIO, CompositorSource } from '@/types/compositor';

export interface UseCompositeStreamOptions {
  /** Whether the compositor should be active (default: true) */
  enabled?: boolean;
  /** Target FPS (default: 30) */
  fps?: number;
}

export interface UseCompositeStreamReturn {
  /** Ref to attach to a <canvas> element for preview display */
  previewRef: React.RefObject<HTMLCanvasElement>;
  /** The output MediaStream (null until ready) */
  outputStream: MediaStream | null;
  /** Current compositor FPS */
  fps: number;
  /** Whether the compositor is initialized and running */
  isReady: boolean;
  /** The compositor bridge instance (for advanced usage) */
  bridge: CompositorBridge | null;
  /** The audio mixer engine instance */
  audioMixer: AudioMixerEngine | null;
  /** Register a video element as a source */
  registerVideoSource: (sourceId: string, videoElement: HTMLVideoElement) => void;
  /** Register a canvas as a source */
  registerCanvasSource: (sourceId: string, canvas: HTMLCanvasElement) => void;
  /** Register a static image as a source */
  registerImageSource: (sourceId: string, url: string) => void;
  /** Unregister a source */
  unregisterSource: (sourceId: string) => void;
}

export function useCompositeStream(
  options: UseCompositeStreamOptions = {}
): UseCompositeStreamReturn {
  const { enabled = true, fps: targetFps = 30 } = options;

  const previewRef = useRef<HTMLCanvasElement>(null!);
  const bridgeRef = useRef<CompositorBridge | null>(null);
  const mixerRef = useRef<AudioMixerEngine | null>(null);
  const [outputStream, setOutputStream] = useState<MediaStream | null>(null);
  const [fps, setFps] = useState(0);
  const [isReady, setIsReady] = useState(false);

  // Scene collection store
  const collection = useSceneCollectionStore((s) => s.collection);
  const outputConfig = useSceneCollectionStore((s) => s.outputConfig);
  const getActiveScene = useSceneCollectionStore((s) => s.getActiveScene);

  // Initialize compositor
  useEffect(() => {
    if (!enabled) return;

    const bridge = new CompositorBridge({
      width: collection.canvasResolution.width,
      height: collection.canvasResolution.height,
      fps: targetFps,
      onFps: setFps,
      onError: (msg) => console.error('[useCompositeStream]', msg),
      onReady: () => setIsReady(true),
    });

    bridgeRef.current = bridge;

    const mixer = new AudioMixerEngine({
      sampleRate: outputConfig?.audioSampleRate ?? 48000,
      masterVolume: collection.audioMixer.masterVolume,
    });
    mixerRef.current = mixer;

    bridge.initialize().then(() => {
      // Attach preview canvas
      if (previewRef.current) {
        bridge.setPreviewCanvas(previewRef.current);
      }

      // Start rendering
      bridge.start();

      // Get output stream
      try {
        const videoStream = bridge.getOutputStream(targetFps);
        const audioTrack = mixer.getMixedAudioTrack();
        
        if (audioTrack) {
          const combined = new MediaStream([videoStream.getVideoTracks()[0], audioTrack]);
          setOutputStream(combined);
        } else {
          setOutputStream(videoStream);
        }
      } catch (e) {
        console.error('[useCompositeStream] Failed to get output stream:', e);
      }

      // Push initial scene
      const activeScene = getActiveScene();
      if (activeScene) {
        bridge.updateScene(activeScene);
      }
    }).catch((e) => {
      console.error('[useCompositeStream] Init failed:', e);
    });

    return () => {
      bridge.destroy();
      mixer.destroy();
      bridgeRef.current = null;
      mixerRef.current = null;
      setIsReady(false);
      setOutputStream(null);
    };
  }, [enabled]); // Only re-init when enabled changes

  // Push scene updates to compositor and mixer whenever the active scene changes
  useEffect(() => {
    const bridge = bridgeRef.current;
    const mixer = mixerRef.current;
    if (!bridge || !mixer || !isReady) return;

    const activeScene = getActiveScene();
    if (activeScene) {
      // Sync video
      bridge.updateScene(activeScene);
      
      // Sync audio
      mixer.setMasterVolume(collection.audioMixer.masterVolume);
      mixer.setMasterMuted(collection.audioMixer.masterMuted);
      
      const syncSourceAudio = (src: CompositorSource) => {
        mixer.updateSourceConfig(src.id, src.audio);
        src.children.forEach(syncSourceAudio);
      };
      activeScene.sources.forEach(syncSourceAudio);
    }
  }, [collection, isReady]);

  const registerVideoSource = useCallback(
    (sourceId: string, videoElement: HTMLVideoElement) => {
      bridgeRef.current?.registerVideoSource(sourceId, videoElement);
      
      // We must resume audio context after a user interaction (like starting a stream)
      mixerRef.current?.resume().catch(() => {});

      // Find initial audio config
      let audioConfig = DEFAULT_AUDIO;
      const state = useSceneCollectionStore.getState();
      const findAudio = (src: CompositorSource) => {
        if (src.id === sourceId) audioConfig = src.audio;
        src.children.forEach(findAudio);
      };
      state.collection.scenes.forEach(s => s.sources.forEach(findAudio));
      
      mixerRef.current?.registerSource(sourceId, videoElement, audioConfig);
    },
    []
  );

  const registerCanvasSource = useCallback(
    (sourceId: string, canvas: HTMLCanvasElement) => {
      bridgeRef.current?.registerCanvasSource(sourceId, canvas);
    },
    []
  );

  const registerImageSource = useCallback(
    (sourceId: string, url: string) => {
      bridgeRef.current?.registerImageSource(sourceId, url);
    },
    []
  );

  const unregisterSource = useCallback(
    (sourceId: string) => {
      bridgeRef.current?.unregisterSource(sourceId);
      mixerRef.current?.unregisterSource(sourceId);
    },
    []
  );

  return {
    previewRef,
    outputStream,
    fps,
    isReady,
    bridge: bridgeRef.current,
    audioMixer: mixerRef.current,
    registerVideoSource,
    registerCanvasSource,
    registerImageSource,
    unregisterSource,
  };
}
