// src/hooks/useContinuousAudio.ts
import { useCallback, useEffect, useRef, useState } from "react";

interface UseContinuousAudioOptions {
  onAudioChunk: (chunk: ArrayBuffer | Blob) => void;
  stream?: MediaStream | null;
  onError?: (err: Error) => void;
  mimeType?: string;
  timesliceMs?: number;
}

// Helper to find the best supported MIME type for this browser
const getSupportedMimeType = (preferredType?: string) => {
  if (preferredType && MediaRecorder.isTypeSupported(preferredType)) {
    return preferredType;
  }
  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4", // Safari often prefers this
    "audio/ogg",
    "audio/wav",
    "", // Fallback to browser default
  ];
  for (const type of types) {
    if (!type || MediaRecorder.isTypeSupported(type)) return type;
  }
  return "";
};

export function useContinuousAudio({
  onAudioChunk,
  stream,
  onError,
  mimeType,
  timesliceMs = 250,
}: UseContinuousAudioOptions) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // Keep refs up to date to avoid effect re-triggers
  const onAudioChunkRef = useRef(onAudioChunk);
  const onErrorRef = useRef(onError);
  const streamRef = useRef(stream);

  useEffect(() => {
    onAudioChunkRef.current = onAudioChunk;
    onErrorRef.current = onError;
    streamRef.current = stream;
  }, [onAudioChunk, onError, stream]);

  const startCapture = useCallback(async () => {
    // 1. Get the current stream (either from prop or ref)
    const currentStream = streamRef.current;

    if (!currentStream) {
      console.warn(
        "[useContinuousAudio] No stream provided. Capture cannot start."
      );
      return;
    }

    if (!currentStream.active) {
      console.error("[useContinuousAudio] Stream is inactive (tracks ended).");
      onErrorRef.current?.(new Error("Audio stream is inactive"));
      return;
    }

    // 2. Prevent duplicate recorders
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      console.log(
        "[useContinuousAudio] Recorder already active. Skipping start."
      );
      return;
    }

    try {
      // 3. Validate Audio Tracks
      const audioTracks = currentStream.getAudioTracks();
      if (audioTracks.length === 0) {
        throw new Error("Stream has no audio tracks.");
      }

      // Check if tracks are enabled
      if (!audioTracks[0].enabled) {
        console.warn("[useContinuousAudio] Audio track is disabled (muted).");
      }

      console.log(
        `[useContinuousAudio] Starting recorder with ${audioTracks.length} track(s).`
      );

      // 4. Initialize Recorder with best MIME type
      const finalMimeType = getSupportedMimeType(mimeType);
      const options: MediaRecorderOptions = finalMimeType
        ? { mimeType: finalMimeType }
        : {};

      const recorder = new MediaRecorder(currentStream, options);
      mediaRecorderRef.current = recorder;

      // 5. Attach Listeners BEFORE starting
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          onAudioChunkRef.current(e.data);
        }
      };

      recorder.onerror = (ev: any) => {
        console.error("[useContinuousAudio] Recorder error:", ev);
        // Handle "InvalidStateError" which can happen if stream dies mid-recording
        onErrorRef.current?.(
          new Error(ev.error?.message || "MediaRecorder error")
        );
        setIsCapturing(false);
      };

      // 6. Start Recording
      recorder.start(timesliceMs);
      setIsCapturing(true);
      console.log(
        `[useContinuousAudio] Capture started (${finalMimeType || "default"}).`
      );
    } catch (err: any) {
      console.error("[useContinuousAudio] Failed to start capture:", err);
      onErrorRef.current?.(err);
      setIsCapturing(false);
      mediaRecorderRef.current = null;
    }
  }, [mimeType, timesliceMs]); // Removed `stream` dependency to prevent auto-restart loops

  const stopCapture = useCallback(() => {
    if (!mediaRecorderRef.current) return;

    console.log("[useContinuousAudio] Stopping capture...");
    try {
      if (mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    } catch (err) {
      console.warn("[useContinuousAudio] Error while stopping:", err);
    } finally {
      mediaRecorderRef.current = null;
      setIsCapturing(false);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  return { isCapturing, startCapture, stopCapture };
}
