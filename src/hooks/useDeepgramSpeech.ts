// src/hooks/useDeepgramSpeech.ts
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
  const isCleaningUp = useRef(false);

  // FIX: Use refs for the callbacks.
  const onPartialTranscriptRef = useRef(onPartialTranscript);
  const onFinalTranscriptRef = useRef(onFinalTranscript);

  useEffect(() => {
    onPartialTranscriptRef.current = onPartialTranscript;
    onFinalTranscriptRef.current = onFinalTranscript;
  }, [onPartialTranscript, onFinalTranscript]);

  const { startCapture, stopCapture } = useContinuousAudio({
    stream,
    onAudioChunk: (chunk) => {
      if (connectionRef.current?.getReadyState() === 1) {
        console.log("[useDeepgramSpeech] Sending audio chunk to Deepgram.");
        connectionRef.current.send(chunk);
      }
    },
    onError: (error) => {
      console.error("[useDeepgramSpeech] Audio capture error:", error);
      toast.error(`Audio Capture Error: ${error.message}`);
    },
  });

  const startRecognition = useCallback(() => {
    isCleaningUp.current = false;
    if (connectionRef.current) return;
    if (!DEEPGRAM_API_KEY) {
      toast.error("Deepgram API Key is missing.");
      return;
    }
    console.log(
      "%c[useDeepgramSpeech] 🎤 Starting Deepgram connection...",
      "color: #00aaff"
    );
    const deepgram = createClient(DEEPGRAM_API_KEY);
    const connection = deepgram.listen.live({
      model: "nova-2",
      interim_results: true,
      smart_format: true,
      punctuate: true, // Corrected typo from 'puncutate'
    });
    connectionRef.current = connection;

    connection.on(LiveTranscriptionEvents.Open, () => {
      console.log(
        "%c[useDeepgramSpeech] ✅ Deepgram connection OPENED.",
        "color: #00cc00"
      );
      startCapture();
      setIsRecording(true);
      toast.success("Voice recognition active");
    });

    connection.on(LiveTranscriptionEvents.Transcript, (data) => {
      if (isCleaningUp.current) return;
      const transcript = data.channel.alternatives[0].transcript;
      if (!transcript) return;

      if (data.is_final) {
        console.log(
          `%c[useDeepgramSpeech] Final Transcript: "${transcript}"`,
          "color: #00cc00"
        );
        onFinalTranscriptRef.current(transcript);
      } else {
        console.log(`[useDeepgramSpeech] Partial Transcript: "${transcript}"`);
        onPartialTranscriptRef.current(transcript);
      }
    });

    connection.on(LiveTranscriptionEvents.Close, () => {
      console.log(
        "%c[useDeepgramSpeech] 🛑 Deepgram connection CLOSED.",
        "color: #ff0000"
      );
      stopCapture();
      setIsRecording(false);
      connectionRef.current = null;
    });

    connection.on(LiveTranscriptionEvents.Error, (error) => {
      console.error(
        "%c[useDeepgramSpeech] ❌ Deepgram ERROR:",
        "color: #ff0000",
        error
      );
      toast.error("Deepgram connection error.");
    });
  }, [startCapture, stopCapture]); // FIX: Remove changing dependencies.

  const stopRecognition = useCallback(() => {
    console.log(
      "%c[useDeepgramSpeech] 🎤 Pausing Deepgram connection...",
      "color: #ffaa00"
    );
    isCleaningUp.current = true;
    if (connectionRef.current) {
      connectionRef.current.finish();
      connectionRef.current = null;
    }
    stopCapture();
    setIsRecording(false);
  }, [stopCapture]);

  return { isRecording, startRecognition, stopRecognition };
};
