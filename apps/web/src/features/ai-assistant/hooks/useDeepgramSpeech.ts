// src/hooks/useDeepgramSpeech.ts
import { useState, useCallback, useRef, useEffect } from "react";
import {
  createClient,
  LiveClient,
  LiveTranscriptionEvents,
} from "@deepgram/sdk";
import { useContinuousAudio } from "./useContinuousAudio";
import { toast } from "sonner";

// DEEPGRAM_API_KEY is server-only. The client fetches a short-lived temporary key
// from /.netlify/functions/deepgram-token (30-second TTL, speech:write scope only).
const DEEPGRAM_TOKEN_ENDPOINT = "/.netlify/functions/deepgram-token";

async function fetchDeepgramKey(): Promise<string | null> {
  try {
    const res = await fetch(DEEPGRAM_TOKEN_ENDPOINT);
    if (!res.ok) {
      console.warn("[useDeepgramSpeech] Token endpoint returned", res.status);
      return null;
    }
    const data = (await res.json()) as { key?: string };
    return data.key ?? null;
  } catch (err) {
    console.warn("[useDeepgramSpeech] Failed to fetch token:", err);
    return null;
  }
}

interface UseDeepgramSpeechProps {
  onPartialTranscript: (transcript: string) => void;
  onFinalTranscript: (transcript: string) => void;
  stream?: MediaStream | null;
}

export const useDeepgramSpeech = ({
  onPartialTranscript,
  onFinalTranscript,
  stream,
}: UseDeepgramSpeechProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const connectionRef = useRef<LiveClient | null>(null);
  const connectionIdRef = useRef<number>(0);

  const onPartialTranscriptRef = useRef(onPartialTranscript);
  const onFinalTranscriptRef = useRef(onFinalTranscript);

  // Sync refs
  useEffect(() => {
    onPartialTranscriptRef.current = onPartialTranscript;
    onFinalTranscriptRef.current = onFinalTranscript;
  }, [onPartialTranscript, onFinalTranscript]);

  const { startCapture, stopCapture } = useContinuousAudio({
    stream,
    // Explicitly request webm/opus which is highly efficient for speech
    mimeType: "audio/webm;codecs=opus",
    onAudioChunk: (chunk) => {
      const conn = connectionRef.current;
      // Guard: Only send if connection exists AND is in OPEN state (1)
      if (conn && conn.getReadyState() === 1) {
        try {
          conn.send(chunk);
        } catch (error) {
          console.warn("[Deepgram] Send error:", error);
        }
      }
    },
    onError: (error) => {
      console.error("[useDeepgramSpeech] Capture error:", error);
      if (error.name === "NotSupportedError") {
        toast.error("Audio format not supported.");
      }
    },
  });

  // Keep capture functions accessible in callbacks/effects
  const captureRefs = useRef({ startCapture, stopCapture });
  useEffect(() => {
    captureRefs.current = { startCapture, stopCapture };
  }, [startCapture, stopCapture]);

  const startRecognition = useCallback(async () => {
    if (connectionRef.current) {
      return;
    }

    const apiKey = await fetchDeepgramKey();
    if (!apiKey) {
      console.warn("[useDeepgramSpeech] Could not obtain Deepgram key");
      return;
    }

    try {
      const currentId = Date.now();
      connectionIdRef.current = currentId;

      const deepgram = createClient(apiKey);

      const connection = deepgram.listen.live({
        model: "nova-2",
        interim_results: true,
        smart_format: true,
        punctuate: true,
        // We don't specify encoding here; we let Deepgram detect the container from the stream
      });

      connectionRef.current = connection;

      // Event: OPEN
      connection.on(LiveTranscriptionEvents.Open, () => {
        // Race condition check: Ensure this is still the active session
        if (connectionIdRef.current === currentId) {
          captureRefs.current.startCapture();
          setIsRecording(true);
          toast.success("Captions started");
        }
      });

      // Event: TRANSCRIPT
      connection.on(LiveTranscriptionEvents.Transcript, (data) => {
        if (connectionIdRef.current !== currentId) return;

        const transcript = data.channel.alternatives[0]?.transcript;
        if (transcript) {
          if (data.is_final) {
            onFinalTranscriptRef.current(transcript);
          } else {
            onPartialTranscriptRef.current(transcript);
          }
        }
      });

      // Event: CLOSE
      connection.on(LiveTranscriptionEvents.Close, () => {
        if (connectionIdRef.current === currentId) {
          captureRefs.current.stopCapture();
          setIsRecording(false);
          connectionRef.current = null;
        }
      });

      // Event: ERROR
      connection.on(LiveTranscriptionEvents.Error, (err) => {
        if (connectionIdRef.current === currentId) {
          console.error("[useDeepgramSpeech] Error:", err);
        }
      });
    } catch (err) {
      console.error("[useDeepgramSpeech] Init failed:", err);
      toast.error("Failed to start speech recognition");
    }
  }, []);

  const stopRecognition = useCallback(() => {

    // Invalidate current session ID immediately
    connectionIdRef.current = 0;

    // Close connection
    if (connectionRef.current) {
      try {
        connectionRef.current.finish();
      } catch (e) {
        // Ignore errors during closing
      }
      connectionRef.current = null;
    }

    // Stop audio
    captureRefs.current.stopCapture();
    setIsRecording(false);
  }, []);

  // Final Cleanup
  useEffect(() => {
    return () => {
      connectionIdRef.current = 0;
      if (connectionRef.current) {
        try {
          connectionRef.current.finish();
        } catch {}
        connectionRef.current = null;
      }
    };
  }, []);

  return { isRecording, startRecognition, stopRecognition };
};
