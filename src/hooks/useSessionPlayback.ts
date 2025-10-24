// src/hooks/useSessionPlayback.ts

import { RecordingSession, ComponentTrack, Keyframe } from "@/types/editor";
import {
  CaptionStyle,
  GeneratedOverlay,
  LayoutMode,
  CameraShape,
  FileOverlayState,
  BrowserOverlayState,
} from "@/types/caption";
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
  captionStyle: CaptionStyle | undefined;
  layoutState:
    | {
        mode: LayoutMode;
        cameraShape: CameraShape;
        splitRatio: number;
        pipPosition: { x: number; y: number };
        pipSize: { width: number; height: number };
      }
    | undefined;
  activeHtmlOverlays: GeneratedOverlay[];
  activeFileOverlays: FileOverlayState[];
  activeBrowserOverlays: BrowserOverlayState[];
}

export const useSessionPlayback = (
  session: RecordingSession,
  currentTimeMs: number
): PlaybackState => {
  const playbackState = useMemo(() => {
    // 1. CAPTION STYLE
    const captionStyle = findStateAtTime<CaptionStyle>(
      session.captionStyleTrack,
      currentTimeMs
    );

    // 2. LAYOUT STATE
    const layoutState = findStateAtTime<PlaybackState["layoutState"]>(
      session.layoutTrack,
      currentTimeMs
    );

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
      captionStyle,
      layoutState,
      activeHtmlOverlays,
      activeFileOverlays,
      activeBrowserOverlays,
    };
  }, [session, currentTimeMs]);

  return playbackState;
};
