// src/types/editor.ts
import {
  CaptionStyle,
  GeneratedOverlay,
  LayoutMode,
  CameraShape,
  FileOverlayState,
  BrowserOverlayState,
} from "./caption";

// --- CORE EDITING TYPES ---

// Represents one instance of an overlay/caption state change
export interface Keyframe<T> {
  timestamp: number; // Time in milliseconds since recording started
  state: T; // The full state of the component at this time
}

// Stores the continuous or keyframe-based state for a single component
export interface ComponentTrack<T> {
  id: string; // Unique ID of the component (e.g., overlay ID, "live-caption")
  type: "html" | "caption" | "file" | "browser" | "layout";
  keyframes: Keyframe<T>[]; // Array of state changes over time
}

// The complete data package stored when recording stops
export interface RecordingSession {
  id: string;
  name: string;
  // Metadata about the video itself (size, duration, URL if saved remotely)
  videoMetadata: {
    duration: number; // Total length of the recording (ms)
    width: number;
    height: number;
    // For simplicity, we'll store the local object URL of the recorded video blob
    videoUrl: string;
  };

  // --- TRACKS ---
  // Tracks for user-generated, draggable overlays
  htmlOverlayTrack: ComponentTrack<GeneratedOverlay>[];
  // Tracks for file-based overlays
  fileOverlayTrack: ComponentTrack<FileOverlayState>[];
  // Tracks for browser overlays
  browserOverlayTrack: ComponentTrack<BrowserOverlayState>[];

  // Tracks for live/global controls
  captionStyleTrack: ComponentTrack<CaptionStyle>;
  layoutTrack: ComponentTrack<{
    mode: LayoutMode;
    cameraShape: CameraShape;
    splitRatio: number;
    pipPosition: { x: number; y: number };
    pipSize: { width: number; height: number };
  }>;

  // Global settings (don't change during recording, but need to be saved)
  settings: {
    dynamicStyle: string;
    videoFilter: string;
    backgroundEffect: "none" | "blur" | "image";
    backgroundImageUrl: string | null;
  };
}

// --- INITIAL STATE & HELPERS (for the editor) ---

export const EMPTY_SESSION: RecordingSession = {
  id: "",
  name: "New Session",
  videoMetadata: { duration: 0, width: 0, height: 0, videoUrl: "" },
  htmlOverlayTrack: [],
  fileOverlayTrack: [],
  browserOverlayTrack: [],
  captionStyleTrack: { id: "live-caption", type: "caption", keyframes: [] },
  layoutTrack: { id: "global-layout", type: "layout", keyframes: [] },
  settings: {
    dynamicStyle: "none",
    videoFilter: "none",
    backgroundEffect: "none",
    backgroundImageUrl: null,
  },
};
