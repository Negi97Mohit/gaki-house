// src/hooks/useRecordingSession.ts
import { useState, useRef, useCallback } from "react";
import { RecordingSession, ComponentTrack, Keyframe } from "@/types/editor";
import {
  CaptionStyle,
  GeneratedOverlay,
  FileOverlayState,
  BrowserOverlayState,
  LayoutMode,
  CameraShape,
} from "@/types/caption";

import { generateId } from "@/shared/lib/id";

interface RecordingState {
  isRecording: boolean;
  startTime: number | null;
  mediaRecorder: MediaRecorder | null;
  recordedChunks: Blob[];
}

export const useRecordingSession = () => {
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    startTime: null,
    mediaRecorder: null,
    recordedChunks: [],
  });

  // Tracks for recording all state changes
  const captionTrackRef = useRef<Keyframe<CaptionStyle>[]>([]);
  const layoutTrackRef = useRef<
    Keyframe<{
      mode: LayoutMode;
      cameraShape: CameraShape;
      splitRatio: number;
      pipPosition: { x: number; y: number };
      pipSize: { width: number; height: number };
      // --- ADDED ---
      pipBorder?: { color: string; width: number };
      pipShadow?: { blur: number; color: string };
      // --- END ADDED ---
    }>[]
  >([]);
  const htmlOverlayTracksRef = useRef<
    Map<string, Keyframe<GeneratedOverlay>[]>
  >(new Map());
  const fileOverlayTracksRef = useRef<
    Map<string, Keyframe<FileOverlayState>[]>
  >(new Map());
  const browserOverlayTracksRef = useRef<
    Map<string, Keyframe<BrowserOverlayState>[]>
  >(new Map());

  const startRecording = useCallback(async (canvas: HTMLCanvasElement) => {
    try {
      const stream = canvas.captureStream(30);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9",
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.start();

      setRecordingState({
        isRecording: true,
        startTime: Date.now(),
        mediaRecorder,
        recordedChunks: chunks,
      });

      // Clear all tracks
      captionTrackRef.current = [];
      layoutTrackRef.current = [];
      htmlOverlayTracksRef.current.clear();
      fileOverlayTracksRef.current.clear();
      browserOverlayTracksRef.current.clear();
    } catch (error) {
      console.error("Failed to start recording:", error);
      throw error;
    }
  }, []);

  const stopRecording = useCallback(
    async (
      videoWidth: number,
      videoHeight: number,
      currentSettings: {
        dynamicStyle: string;
        videoFilter: string;
        backgroundEffect: "none" | "blur" | "image";
        backgroundImageUrl: string | null;
      }
    ): Promise<RecordingSession> => {
      return new Promise((resolve, reject) => {
        const { mediaRecorder, recordedChunks, startTime } = recordingState;

        if (!mediaRecorder || !startTime) {
          reject(new Error("No active recording"));
          return;
        }

        mediaRecorder.onstop = () => {
          mediaRecorder.stream.getTracks().forEach((track) => track.stop());
          const blob = new Blob(recordedChunks, { type: "video/webm" });
          const videoUrl = URL.createObjectURL(blob);
          const duration = Date.now() - startTime;

          // Convert track maps to arrays
          const htmlOverlayTrack: ComponentTrack<GeneratedOverlay>[] = [];
          htmlOverlayTracksRef.current.forEach((keyframes, id) => {
            htmlOverlayTrack.push({
              id,
              type: "html",
              keyframes,
            });
          });

          const fileOverlayTrack: ComponentTrack<FileOverlayState>[] = [];
          fileOverlayTracksRef.current.forEach((keyframes, id) => {
            fileOverlayTrack.push({
              id,
              type: "file",
              keyframes,
            });
          });

          const browserOverlayTrack: ComponentTrack<BrowserOverlayState>[] = [];
          browserOverlayTracksRef.current.forEach((keyframes, id) => {
            browserOverlayTrack.push({
              id,
              type: "browser",
              keyframes,
            });
          });

          const session: RecordingSession = {
            id: generateId("session"),
            name: `Recording ${new Date().toLocaleString()}`,
            videoMetadata: {
              duration,
              width: videoWidth,
              height: videoHeight,
              videoUrl,
            },
            htmlOverlayTrack,
            fileOverlayTrack,
            browserOverlayTrack,
            captionStyleTrack: {
              id: "live-caption",
              type: "caption",
              keyframes: captionTrackRef.current,
            },
            layoutTrack: {
              id: "global-layout",
              type: "layout",
              keyframes: layoutTrackRef.current,
            },
            settings: currentSettings,
          };

          setRecordingState({
            isRecording: false,
            startTime: null,
            mediaRecorder: null,
            recordedChunks: [],
          });

          resolve(session);
        };

        mediaRecorder.stop();
      });
    },
    [recordingState]
  );

  // Record caption style changes
  const recordCaptionStyle = useCallback(
    (style: CaptionStyle) => {
      if (!recordingState.isRecording || !recordingState.startTime) return;

      const timestamp = Date.now() - recordingState.startTime;
      captionTrackRef.current.push({ timestamp, state: style });
    },
    [recordingState]
  );

  // Record layout changes
  const recordLayoutChange = useCallback(
    (layout: {
      mode: LayoutMode;
      cameraShape: CameraShape;
      splitRatio: number;
      pipPosition: { x: number; y: number };
      pipSize: { width: number; height: number };
      // --- ADDED ---
      pipBorder?: { color: string; width: number };
      pipShadow?: { blur: number; color: string };
      // --- END ADDED ---
    }) => {
      if (!recordingState.isRecording || !recordingState.startTime) return;

      const timestamp = Date.now() - recordingState.startTime;
      layoutTrackRef.current.push({ timestamp, state: layout });
    },
    [recordingState]
  );

  // Record HTML overlay changes
  const recordHtmlOverlay = useCallback(
    (overlay: GeneratedOverlay) => {
      if (!recordingState.isRecording || !recordingState.startTime) return;

      const timestamp = Date.now() - recordingState.startTime;
      const track = htmlOverlayTracksRef.current.get(overlay.id) || [];
      track.push({ timestamp, state: overlay });
      htmlOverlayTracksRef.current.set(overlay.id, track);
    },
    [recordingState]
  );

  // Record file overlay changes
  const recordFileOverlay = useCallback(
    (overlay: FileOverlayState) => {
      if (!recordingState.isRecording || !recordingState.startTime) return;

      const timestamp = Date.now() - recordingState.startTime;
      const track = fileOverlayTracksRef.current.get(overlay.id) || [];
      track.push({ timestamp, state: overlay });
      fileOverlayTracksRef.current.set(overlay.id, track);
    },
    [recordingState]
  );

  // Record browser overlay changes
  const recordBrowserOverlay = useCallback(
    (overlay: BrowserOverlayState) => {
      if (!recordingState.isRecording || !recordingState.startTime) return;

      const timestamp = Date.now() - recordingState.startTime;
      const track = browserOverlayTracksRef.current.get(overlay.id) || [];
      track.push({ timestamp, state: overlay });
      browserOverlayTracksRef.current.set(overlay.id, track);
    },
    [recordingState]
  );

  return {
    isRecording: recordingState.isRecording,
    startRecording,
    stopRecording,
    recordCaptionStyle,
    recordLayoutChange,
    recordHtmlOverlay,
    recordFileOverlay,
    recordBrowserOverlay,
  };
};
