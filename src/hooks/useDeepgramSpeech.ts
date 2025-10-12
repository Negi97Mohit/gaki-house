// src/hooks/useDeepgramSpeech.ts
import { useState, useCallback, useRef } from 'react';
import { createClient, LiveClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import { useContinuousAudio } from './useContinuousAudio';
import { toast } from 'sonner';

const DEEPGRAM_API_KEY = import.meta.env.VITE_DEEPGRAM_API_KEY;

interface UseDeepgramSpeechProps {
  onPartialTranscript: (transcript: string) => void;
  onFinalTranscript: (transcript: string) => void;
}

export const useDeepgramSpeech = ({ onPartialTranscript, onFinalTranscript }: UseDeepgramSpeechProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const connectionRef = useRef<LiveClient | null>(null);

  // This is the core change: we use our existing audio hook to get mic data.
  const { startCapture, stopCapture } = useContinuousAudio({
    onAudioChunk: (chunk) => {
      // Send the audio chunk to Deepgram if the connection is ready
      if (connectionRef.current?.getReadyState() === 1) {
        connectionRef.current.send(chunk);
      }
    },
    onError: (error) => {
      toast.error(`Audio Capture Error: ${error.message}`);
    },
  });

  const startRecognition = useCallback(() => {
    if (!DEEPGRAM_API_KEY) {
      toast.error("Deepgram API Key is missing.");
      return;
    }

    if (isRecording) {
      console.log("Recognition already in progress.");
      return;
    }

    console.log('🎤 Starting Deepgram speech recognition...');
    const deepgram = createClient(DEEPGRAM_API_KEY);
    const connection = deepgram.listen.live({
      model: 'nova-2',
      interim_results: true,
      smart_format: true,
      puncutate: true,
    });
    connectionRef.current = connection;

    connection.on(LiveTranscriptionEvents.Open, () => {
      console.log('✅ Deepgram connection opened.');
      startCapture(); // Start capturing audio once the connection is open
      setIsRecording(true);
      toast.success('Voice recognition active');
    });

    connection.on(LiveTranscriptionEvents.Transcript, (data) => {
      const transcript = data.channel.alternatives[0].transcript;
      if (!transcript) return;

      if (data.is_final) {
        onFinalTranscript(transcript);
      } else {
        onPartialTranscript(transcript);
      }
    });

    connection.on(LiveTranscriptionEvents.Close, () => {
      console.log('🛑 Deepgram connection closed.');
      stopCapture();
      setIsRecording(false);
      connectionRef.current = null;
    });

    connection.on(LiveTranscriptionEvents.Error, (error) => {
      console.error('❌ Deepgram error:', error);
      toast.error("Deepgram connection error.");
    });

  }, [isRecording, startCapture, stopCapture, onFinalTranscript, onPartialTranscript]);

  const stopRecognition = useCallback(() => {
    console.log('Pausing Deepgram speech recognition...');
    if (connectionRef.current) {
      connectionRef.current.finish(); // This will trigger the 'Close' event
    }
    // The stopCapture and setIsRecording(false) are handled in the 'Close' event listener.
  }, []);

  return { isRecording, startRecognition, stopRecognition };
};