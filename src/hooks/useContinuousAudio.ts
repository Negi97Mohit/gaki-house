// src/hooks/useContinuousAudio.ts
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseContinuousAudioOptions {
  onAudioChunk: (chunk: ArrayBuffer | Blob) => void;
  stream?: MediaStream | null;
  onError?: (err: Error) => void;
  mimeType?: string;
  timesliceMs?: number;
}

export function useContinuousAudio({ onAudioChunk, stream, onError, mimeType = 'audio/webm', timesliceMs = 250 }: UseContinuousAudioOptions) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  
  // FIX: Use refs to store the latest callbacks without causing re-renders.
  const onAudioChunkRef = useRef(onAudioChunk);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onAudioChunkRef.current = onAudioChunk;
    onErrorRef.current = onError;
  }, [onAudioChunk, onError]);

  const startCapture = useCallback(async () => {
    try {
      if (mediaRecorderRef.current) return;
      
      const audioStream = stream || (await navigator.mediaDevices.getUserMedia({ audio: true }));
      if (audioStream.getAudioTracks().length === 0) {
        onErrorRef.current?.(new Error("The provided stream has no audio tracks."));
        return;
      }

      const audioOnlyStream = new MediaStream(audioStream.getAudioTracks());
      const recorder = new MediaRecorder(audioOnlyStream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = async (e: BlobEvent) => {
        if (e.data && e.data.size > 0) {
          onAudioChunkRef.current(e.data);
        }
      };

      recorder.onerror = (ev: any) => {
        onErrorRef.current?.(new Error(ev?.error?.message || 'Unknown MediaRecorder error'));
      };

      recorder.start(timesliceMs);
      setIsCapturing(true);
    } catch (err: any) {
      onErrorRef.current?.(err);
    }
  }, [stream, mimeType, timesliceMs]); // FIX: Remove callbacks from the dependency array.

  const stopCapture = useCallback(() => {
    try {
      const rec = mediaRecorderRef.current;
      if (!rec) return;
      if (rec.state !== 'inactive') rec.stop();
      rec.stream.getTracks().forEach(t => t.stop());
      mediaRecorderRef.current = null;
    } catch (err: any) {
      onErrorRef.current?.(err);
    } finally {
      setIsCapturing(false);
    }
  }, []);

  useEffect(() => () => {
    if (mediaRecorderRef.current) {
      try {
        mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      } catch {}
    }
  }, []);

  return { isCapturing, startCapture, stopCapture };
}