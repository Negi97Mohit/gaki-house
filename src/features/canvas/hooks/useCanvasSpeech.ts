import { useState, useRef, useEffect, useCallback } from "react";
import { useDeepgramSpeech } from "@/features/ai-assistant/hooks/useDeepgramSpeech";

export const useCanvasSpeech = ({
    isAudioOn,
    selectedAudioDevice,
    captionsEnabled,
}: {
    isAudioOn: boolean;
    selectedAudioDevice?: string;
    captionsEnabled: boolean;
}) => {
    const [audioStreamForSpeech, setAudioStreamForSpeech] =
        useState<MediaStream | null>(null);
    const [fullTranscript, setFullTranscript] = useState("");
    const [interimTranscript, setInterimTranscript] = useState("");
    const transcriptTimerRef = useRef<NodeJS.Timeout>();

    const handleFinalTranscript = useCallback((text: string) => {
        clearTimeout(transcriptTimerRef.current);
        setFullTranscript(text);
        setInterimTranscript("");
        transcriptTimerRef.current = setTimeout(() => setFullTranscript(""), 4000);
    }, []);

    const { startRecognition, stopRecognition } = useDeepgramSpeech({
        onFinalTranscript: handleFinalTranscript,
        onPartialTranscript: (text) => setInterimTranscript(text),
        stream: audioStreamForSpeech,
    });

    useEffect(() => {
        if (
            audioStreamForSpeech &&
            captionsEnabled &&
            audioStreamForSpeech.active
        ) {
            startRecognition();
        } else {
            stopRecognition();
        }
        return () => {
            stopRecognition();
            setFullTranscript("");
            setInterimTranscript("");
        };
    }, [
        audioStreamForSpeech,
        captionsEnabled,
        startRecognition,
        stopRecognition,
    ]);

    useEffect(() => {
        return () => {
            if (audioStreamForSpeech) {
                audioStreamForSpeech.getTracks().forEach((track) => track.stop());
            }
        };
    }, [audioStreamForSpeech]);

    useEffect(() => {
        let isCancelled = false;

        const createAudioStream = async () => {
            if (!isAudioOn) {
                setAudioStreamForSpeech(null);
                return;
            }

            try {
                const constraints = {
                    audio: selectedAudioDevice
                        ? { deviceId: { exact: selectedAudioDevice } }
                        : true,
                };

                const stream = await navigator.mediaDevices.getUserMedia(constraints);

                if (isCancelled) {
                    stream.getTracks().forEach((t) => t.stop());
                    return;
                }

                setAudioStreamForSpeech(stream);
            } catch (error) {
                console.error("[VideoCanvas] Failed to get audio stream:", error);
                setAudioStreamForSpeech(null);
            }
        };

        createAudioStream();

        return () => {
            isCancelled = true;
        };
    }, [isAudioOn, selectedAudioDevice]);

    useEffect(() => {
        if (!audioStreamForSpeech) return;

        const audioTracks = audioStreamForSpeech.getAudioTracks();
        if (audioTracks.length === 0) {
            console.warn(
                "[VideoCanvas] ⚠️ Audio stream exists but has NO audio tracks."
            );
            return;
        }

        const track = audioTracks[0];
        const handleEnded = () => {
            console.error("[VideoCanvas] ❌ Audio track ended unexpectedly.");
        };

        track.addEventListener("ended", handleEnded);
        return () => {
            track.removeEventListener("ended", handleEnded);
        };
    }, [audioStreamForSpeech]);

    return {
        fullTranscript,
        interimTranscript,
    };
};
