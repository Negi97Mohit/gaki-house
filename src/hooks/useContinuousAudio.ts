import { useCallback, useEffect, useRef, useState } from "react";

interface UseContinuousAudioOptions {
  onAudioChunk: (chunk: ArrayBuffer | Blob) => void;
  stream?: MediaStream | null;
  onError?: (err: Error) => void;
  mimeType?: string;
  timesliceMs?: number;
}

const getSupportedMimeType = (preferredType?: string) => {
  if (preferredType && MediaRecorder.isTypeSupported(preferredType)) {
    return preferredType;
  }
  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg",
    "audio/wav",
    "",
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

  const onAudioChunkRef = useRef(onAudioChunk);
  const onErrorRef = useRef(onError);
  const streamRef = useRef(stream);

  useEffect(() => {
    onAudioChunkRef.current = onAudioChunk;
    onErrorRef.current = onError;
    streamRef.current = stream;
  }, [onAudioChunk, onError, stream]);

  const startCapture = useCallback(async () => {
    console.log("[useContinuousAudio] startCapture called.");

    // FIX 1: Strict stream check. Do not auto-create stream if one is expected from props.
    // We rely on streamRef.current (updated via useEffect) or the current closure 'stream'
    const currentStream = stream || streamRef.current;

    if (!currentStream) {
      console.warn(
        "[useContinuousAudio] No stream provided yet. Waiting for parent to provide stream."
      );
      return;
    }

    if (!currentStream.active) {
      console.error("[useContinuousAudio] Provided stream is inactive.");
      onErrorRef.current?.(new Error("Stream is inactive"));
      return;
    }

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      console.log("[useContinuousAudio] Recorder already running.");
      return;
    }

    try {
      // FIX 2: Validate tracks before starting
      const audioTracks = currentStream.getAudioTracks();
      if (audioTracks.length === 0) {
        throw new Error("Stream has no audio tracks.");
      }

      console.log(
        `[useContinuousAudio] Starting recorder with ${audioTracks.length} tracks.`
      );

      const finalMimeType = getSupportedMimeType(mimeType);
      const recorder = new MediaRecorder(currentStream, {
        mimeType: finalMimeType || undefined,
      });

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          onAudioChunkRef.current(e.data);
        }
      };

      recorder.onerror = (ev: any) => {
        console.error("[useContinuousAudio] MediaRecorder error:", ev);
        onErrorRef.current?.(new Error(ev.error?.message || "Recorder error"));
      };

      recorder.start(timesliceMs);
      setIsCapturing(true);
      console.log("[useContinuousAudio] Capture started successfully.");
    } catch (err: any) {
      console.error("[useContinuousAudio] Failed to start capture:", err);
      onErrorRef.current?.(err);
      setIsCapturing(false);
    }
  }, [mimeType, timesliceMs, stream]); // Added stream dependency explicitly

  const stopCapture = useCallback(() => {
    console.log("[useContinuousAudio] stopCapture called.");
    try {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
      // Note: We do NOT stop the stream tracks here because we didn't create them.
      // The parent (VideoCanvas) owns the stream.
      mediaRecorderRef.current = null;
    } catch (err) {
      console.error("[useContinuousAudio] Error stopping:", err);
    } finally {
      setIsCapturing(false);
    }
  }, []);

  // Cleanup
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
