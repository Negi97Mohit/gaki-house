import {
  CaptionStyle,
  FileOverlayState,
  BrowserOverlayState,
  GeneratedOverlay,
  LayoutMode,
  CameraShape,
} from "@/types/caption";

export interface Keyframe<T> {
  timestamp: number;
  state: T;
}

export interface ComponentTrack<T> {
  id: string;
  keyframes: Keyframe<T>[];
}

export interface LayoutState {
  mode: LayoutMode;
  cameraShape: CameraShape;
  splitRatio: number;
  pipPosition: { x: number; y: number };
  pipSize: { width: number; height: number };
}

export interface VideoMetadata {
  videoUrl: string;
  duration: number;
  width: number;
  height: number;
}

export interface RecordingSession {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
  videoMetadata: VideoMetadata;
  captionStyleTrack: ComponentTrack<CaptionStyle>;
  layoutTrack: ComponentTrack<LayoutState>;
  htmlOverlayTrack: ComponentTrack<GeneratedOverlay>[];
  fileOverlayTrack: ComponentTrack<FileOverlayState>[];
  browserOverlayTrack: ComponentTrack<BrowserOverlayState>[];
  videoUrl?: string;
  thumbnailUrl?: string;
}

export interface SessionPlaybackState {
  currentTimeMs: number;
  isPlaying: boolean;
  captionStyle: CaptionStyle | null;
  layout: LayoutState | null;
  activeHtmlOverlays: GeneratedOverlay[];
  activeFileOverlays: FileOverlayState[];
  activeBrowserOverlays: BrowserOverlayState[];
}

export interface SceneState {
  id: string;
  name: string;
  selectedVideoDevice?: string;
  selectedAudioDevice?: string;
  captionStyle?: CaptionStyle;
  layoutMode?: LayoutMode;
  cameraShape?: CameraShape;
}

export interface EditorState {
  currentSession: RecordingSession | null;
  currentTimeMs: number;
  isPlaying: boolean;
  playbackSpeed: number;
}

export const EMPTY_SESSION: RecordingSession = {
  id: "",
  name: "",
  startTime: 0,
  endTime: 0,
  duration: 0,
  videoMetadata: {
    videoUrl: "",
    duration: 0,
    width: 1920,
    height: 1080,
  },
  captionStyleTrack: { id: "", keyframes: [] },
  layoutTrack: { id: "", keyframes: [] },
  htmlOverlayTrack: [],
  fileOverlayTrack: [],
  browserOverlayTrack: [],
};
