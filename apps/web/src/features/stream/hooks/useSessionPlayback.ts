// src/hooks/useSessionPlayback.ts

import { RecordingSession, ComponentTrack, Keyframe } from "@gaki/core/types/editor";
import {
  CaptionStyle,
  GeneratedOverlay,
  LayoutMode,
  CameraShape,
  FileOverlayState,
  BrowserOverlayState,
} from "@gaki/core/types/caption";
import { useMemo } from "react";

// Helper to find the correct state from keyframes for a given timestamp
function findStateAtTime<T>(
  track: ComponentTrack<T> | undefined,
  timeMs: number
): T | undefined {
  if (!track || track.keyframes.length === 0) return undefined;

  // Find the last keyframe that occurred at or before the current time
  // Keyframes are assumed to be sorted by timestamp
  let foundKeyframe: Keyframe<T> | undefined;

  for (let i = 0; i < track.keyframes.length; i++) {
    const keyframe = track.keyframes[i];
    if (keyframe.timestamp <= timeMs) {
      foundKeyframe = keyframe;
    } else {
      // Since they are sorted, we can stop once we pass the time
      break;
    }
  }

  return foundKeyframe ? foundKeyframe.state : track.keyframes[0]?.state;
}

// --- MAIN PLAYBACK HOOK ---

interface PlaybackState {
  currentTimeMs: number;
  isPlaying: boolean;
  captionStyle: CaptionStyle | null;
  layout:
    | {
        mode: LayoutMode;
        cameraShape: CameraShape;
        splitRatio: number;
        pipPosition: { x: number; y: number };
        pipSize: { width: number; height: number };
      }
    | null;
  activeHtmlOverlays: GeneratedOverlay[];
  activeFileOverlays: FileOverlayState[];
  activeBrowserOverlays: BrowserOverlayState[];
}

export type { PlaybackState };

export const useSessionPlayback = (
  session: RecordingSession,
  currentTimeMs: number
): PlaybackState => {
  const playbackState = useMemo(() => {
    // 1. CAPTION STYLE
    const captionStyle = findStateAtTime<CaptionStyle>(
      session.captionStyleTrack,
      currentTimeMs
    ) ?? null;

    // 2. LAYOUT STATE
    const layout = findStateAtTime<PlaybackState["layout"]>(
      session.layoutTrack,
      currentTimeMs
    ) ?? null;

    // 3. HTML OVERLAYS
    // An overlay is active if its track exists AND it was present in the found keyframe state.
    const activeHtmlOverlays: GeneratedOverlay[] = session.htmlOverlayTrack
      .map((track) => {
        const state = findStateAtTime<GeneratedOverlay>(track, currentTimeMs);
        // We return the full state if a keyframe was found, otherwise filter it out.
        return state;
      })
      .filter((state): state is GeneratedOverlay => !!state);

    const activeFileOverlays: FileOverlayState[] = session.fileOverlayTrack
      .map((track) => {
        const state = findStateAtTime<FileOverlayState>(track, currentTimeMs);
        return state;
      })
      .filter((state): state is FileOverlayState => !!state);

    // 5. BROWSER OVERLAYS
    const activeBrowserOverlays: BrowserOverlayState[] =
      session.browserOverlayTrack
        .map((track) => {
          const state = findStateAtTime<BrowserOverlayState>(
            track,
            currentTimeMs
          );
          return state;
        })
        .filter((state): state is BrowserOverlayState => !!state);

    return {
      currentTimeMs,
      isPlaying: false,
      captionStyle,
      layout,
      activeHtmlOverlays,
      activeFileOverlays,
      activeBrowserOverlays,
    };
  }, [session, currentTimeMs]);

  return playbackState;
};
