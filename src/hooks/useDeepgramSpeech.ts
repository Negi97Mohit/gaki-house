// src/hooks/useDeepgramSpeech.ts
import { useState, useCallback, useRef, useEffect } from 'react';
import { createClient, LiveClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import { useContinuousAudio } from './useContinuousAudio';
import { toast } from 'sonner';

const DEEPGRAM_API_KEY = import.meta.env.VITE_DEEPGRAM_API_KEY;

interface UseDeepgramSpeechProps {
  onPartialTranscript: (transcript: string) => void;
  onFinalTranscript: (transcript: string) => void;
  stream?: MediaStream | null;
}

export const useDeepgramSpeech = ({ onPartialTranscript, onFinalTranscript, stream }: UseDeepgramSpeechProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const connectionRef = useRef<LiveClient | null>(null);

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
        connectionRef.current.send(chunk);
      }
    },
    onError: (error) => {
      toast.error(`Audio Capture Error: ${error.message}`);
    },
  });

  const startRecognition = useCallback(() => {
    if (connectionRef.current) return;
    if (!DEEPGRAM_API_KEY) {
      toast.error("Deepgram API Key is missing.");
      return;
    }
    console.log('🎤 Starting Deepgram speech recognition...');
    const deepgram = createClient(DEEPGRAM_API_KEY);
    const connection = deepgram.listen.live({
      model: 'nova-2',
      interim_results: true,
      smart_format: true,
      punctuate: true, // Corrected typo from 'puncutate'
    });
    connectionRef.current = connection;

    connection.on(LiveTranscriptionEvents.Open, () => {
      console.log('✅ Deepgram connection opened.');
      startCapture();
      setIsRecording(true);
      toast.success('Voice recognition active');
    });

    connection.on(LiveTranscriptionEvents.Transcript, (data) => {
      const transcript = data.channel.alternatives[0].transcript;
      if (!transcript) return;

      if (data.is_final) {
        onFinalTranscriptRef.current(transcript);
      } else {
        onPartialTranscriptRef.current(transcript);
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

  }, [startCapture, stopCapture]); // FIX: Remove changing dependencies.

  const stopRecognition = useCallback(() => {
    console.log('Pausing Deepgram speech recognition...');
    if (connectionRef.current) {
      connectionRef.current.finish();
      connectionRef.current = null;
    }
    stopCapture();
    setIsRecording(false);
  }, [stopCapture]);

  return { isRecording, startRecognition, stopRecognition };
};