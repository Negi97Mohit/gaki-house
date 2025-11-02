// src/hooks/useContinuousAudio.ts
import { useCallback, useEffect, useRef, useState } from "react";

interface UseContinuousAudioOptions {
  onAudioChunk: (chunk: ArrayBuffer | Blob) => void;
  stream?: MediaStream | null;
  onError?: (err: Error) => void;
  mimeType?: string;
  timesliceMs?: number;
}

export function useContinuousAudio({
  onAudioChunk,
  stream,
  onError,
  mimeType = "audio/webm",
  timesliceMs = 250,
}: UseContinuousAudioOptions) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // FIX: Use refs to store the latest callbacks without causing re-renders.
  const onAudioChunkRef = useRef(onAudioChunk);
  const onErrorRef = useRef(onError);
  const streamRef = useRef(stream);

  useEffect(() => {
    onAudioChunkRef.current = onAudioChunk;
    onErrorRef.current = onError;
    streamRef.current = stream; // <-- ADD: Update the ref when stream prop changes
  }, [onAudioChunk, onError, stream]);

  const startCapture = useCallback(async () => {
    console.log("[useContinuousAudio] Attempting to start capture...");
    try {
      if (mediaRecorderRef.current) return;

      // FIX: Read from the ref, not the prop
      const audioStream =
        streamRef.current ||
        (await navigator.mediaDevices.getUserMedia({ audio: true }));
      if (audioStream.getAudioTracks().length === 0) {
        console.error(
          "[useContinuousAudio] No audio tracks found in the stream."
        );
        onErrorRef.current?.(
          new Error("The provided stream has no audio tracks.")
        );
        return;
      }

      const audioOnlyStream = new MediaStream(audioStream.getAudioTracks());
      const recorder = new MediaRecorder(audioOnlyStream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = async (e: BlobEvent) => {
        if (e.data && e.data.size > 0) {
          console.log(
            `[useContinuousAudio] Data available: ${e.data.size} bytes`
          );
          onAudioChunkRef.current(e.data);
        }
      };

      recorder.onerror = (ev: any) => {
        console.error("[useContinuousAudio] MediaRecorder error:", ev);
        onErrorRef.current?.(
          new Error(ev?.error?.message || "Unknown MediaRecorder error")
        );
      };

      recorder.start(timesliceMs);
      setIsCapturing(true);
      console.log("[useContinuousAudio] Capture started.");
    } catch (err: any) {
      console.error("[useContinuousAudio] Error starting capture:", err);
      onErrorRef.current?.(err);
    }
  }, [mimeType, timesliceMs]); // FIX: Remove callbacks from the dependency array.

  const stopCapture = useCallback(() => {
    console.log("[useContinuousAudio] Stopping capture...");
    try {
      const rec = mediaRecorderRef.current;
      if (!rec) return;
      if (rec.state !== "inactive") rec.stop();
      // Only stop tracks if we created them internally (not from a prop)
      if (!streamRef.current) {
        rec.stream.getTracks().forEach((t) => t.stop());
      }
      mediaRecorderRef.current = null;
    } catch (err: any) {
      console.error("[useContinuousAudio] Error stopping capture:", err);
      onErrorRef.current?.(err);
    } finally {
      setIsCapturing(false);
      console.log("[useContinuousAudio] Capture stopped.");
    }
  }, []);

  useEffect(
    () => () => {
      if (mediaRecorderRef.current) {
        try {
          // Only stop tracks if we created them internally
          if (!streamRef.current) {
            mediaRecorderRef.current.stream
              .getTracks()
              .forEach((t) => t.stop());
          }
        } catch {}
      }
    },
    []
  );

  return { isCapturing, startCapture, stopCapture };
}
