import { useState, useCallback, useRef, useEffect } from "react";
import {
  createClient,
  LiveClient,
  LiveTranscriptionEvents,
} from "@deepgram/sdk";
import { useContinuousAudio } from "./useContinuousAudio";
import { toast } from "sonner";

const DEEPGRAM_API_KEY = import.meta.env.VITE_DEEPGRAM_API_KEY;

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
  const connectionIdRef = useRef<number>(0); // Track connection ID to prevent race conditions

  const onPartialTranscriptRef = useRef(onPartialTranscript);
  const onFinalTranscriptRef = useRef(onFinalTranscript);

  useEffect(() => {
    onPartialTranscriptRef.current = onPartialTranscript;
    onFinalTranscriptRef.current = onFinalTranscript;
  }, [onPartialTranscript, onFinalTranscript]);

  const { startCapture, stopCapture } = useContinuousAudio({
    stream,
    onAudioChunk: (chunk) => {
      // Only send if connected and ready
      if (connectionRef.current?.getReadyState() === 1) {
        connectionRef.current.send(chunk);
      }
    },
    onError: (error) => {
      console.error("[useDeepgramSpeech] Audio capture error:", error);
      if (error.name === "NotSupportedError") {
        toast.error("Microphone format not supported.");
      }
    },
  });

  // Keep refs to capture functions to use them in callbacks without dependency cycles
  const captureRefs = useRef({ startCapture, stopCapture });
  useEffect(() => {
    captureRefs.current = { startCapture, stopCapture };
  }, [startCapture, stopCapture]);

  const startRecognition = useCallback(() => {
    // Prevent duplicate connections
    if (connectionRef.current) {
      console.log("[useDeepgramSpeech] Already connected, skipping start.");
      return;
    }

    if (!DEEPGRAM_API_KEY) {
      toast.error("Deepgram API Key is missing.");
      return;
    }

    console.log("[useDeepgramSpeech] Starting Deepgram connection...");

    try {
      const currentConnectionId = Date.now();
      connectionIdRef.current = currentConnectionId;

      const deepgram = createClient(DEEPGRAM_API_KEY);
      const connection = deepgram.listen.live({
        model: "nova-2",
        interim_results: true,
        smart_format: true,
        punctuate: true,
      });
      connectionRef.current = connection;

      connection.on(LiveTranscriptionEvents.Open, () => {
        // RACE CONDITION FIX: Only act if this is still the active connection
        if (connectionIdRef.current === currentConnectionId) {
          console.log("[useDeepgramSpeech] Connection OPENED.");
          captureRefs.current.startCapture();
          setIsRecording(true);
          toast.success("Listening...");
        }
      });

      connection.on(LiveTranscriptionEvents.Transcript, (data) => {
        if (connectionIdRef.current !== currentConnectionId) return;

        const transcript = data.channel.alternatives[0]?.transcript;
        if (!transcript) return;

        if (data.is_final) {
          onFinalTranscriptRef.current(transcript);
        } else {
          onPartialTranscriptRef.current(transcript);
        }
      });

      connection.on(LiveTranscriptionEvents.Close, () => {
        // RACE CONDITION FIX: Only stop capture if the CLOSING connection is the ACTIVE one
        if (connectionIdRef.current === currentConnectionId) {
          console.log(
            "[useDeepgramSpeech] Active connection CLOSED. Stopping capture."
          );
          captureRefs.current.stopCapture();
          setIsRecording(false);
          connectionRef.current = null;
        } else {
          console.log("[useDeepgramSpeech] Old connection CLOSED. Ignoring.");
        }
      });

      connection.on(LiveTranscriptionEvents.Error, (error) => {
        if (connectionIdRef.current === currentConnectionId) {
          console.error("[useDeepgramSpeech] Deepgram Error:", error);
        }
      });
    } catch (err) {
      console.error("[useDeepgramSpeech] Failed to create client:", err);
      toast.error("Failed to start voice recognition");
    }
  }, []);

  const stopRecognition = useCallback(() => {
    console.log("[useDeepgramSpeech] Stopping recognition...");

    // Invalidate current connection ID so pending events (like Close) don't stop the *next* connection
    connectionIdRef.current = 0;

    if (connectionRef.current) {
      try {
        connectionRef.current.finish();
      } catch (e) {
        console.warn("Error finishing connection:", e);
      }
      connectionRef.current = null;
    }

    captureRefs.current.stopCapture();
    setIsRecording(false);
  }, []);

  // Clean up on unmount
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
