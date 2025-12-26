import { useState, useRef, useEffect, useCallback } from "react";
import { SnapLinesRef } from "@/features/canvas/ui/SnapLines";
import { useDeepgramSpeech } from "@/features/ai-assistant/hooks/useDeepgramSpeech";

interface UseVideoCanvasStateProps {
    isFullscreen: boolean;
    isAudioOn: boolean;
    selectedAudioDevice?: string;
    captionsEnabled: boolean;
}

export const useVideoCanvasState = ({
    isFullscreen,
    isAudioOn,
    selectedAudioDevice,
    captionsEnabled,
}: UseVideoCanvasStateProps) => {
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<HTMLDivElement>(null);
    const snapLinesRef = useRef<SnapLinesRef>(null);

    const [viewport, setViewport] = useState({ scale: 1, x: 0, y: 0 });
    const [isCanvasHovered, setIsCanvasHovered] = useState(false);
    const [isSpacePressed, setIsSpacePressed] = useState(false);
    const [sceneSize, setSceneSize] = useState({ width: 0, height: 0 });
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const [isDraggingDynamicSplitter, setIsDraggingDynamicSplitter] =
        useState(false);
    const [dynamicSplitRatio, setDynamicSplitRatio] = useState(0.5);
    const [dynamicPipPosition, setDynamicPipPosition] = useState({
        x: 75,
        y: 75,
    });
    const [dynamicPipSize, setDynamicPipSize] = useState({
        width: 30,
        height: 30,
    });

    const [audioStreamForSpeech, setAudioStreamForSpeech] =
        useState<MediaStream | null>(null);

    const [fullTranscript, setFullTranscript] = useState("");
    const [interimTranscript, setInterimTranscript] = useState("");
    const transcriptTimerRef = useRef<NodeJS.Timeout>();

    // --- Speech ---
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

    // Effect to manage Start/Stop based on state
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

    // Cleanup effect
    useEffect(() => {
        return () => {
            if (audioStreamForSpeech) {
                audioStreamForSpeech.getTracks().forEach((track) => track.stop());
            }
        };
    }, [audioStreamForSpeech]);

    // Stream Creation Effect
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

    // Stream Verification Effect
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
        // console.log(
        //   `[VideoCanvas] 🎤 Audio Track Status: ${track.label} | Enabled: ${track.enabled} | ReadyState: ${track.readyState}`
        // );

        const handleEnded = () => {
            console.error("[VideoCanvas] ❌ Audio track ended unexpectedly.");
        };

        track.addEventListener("ended", handleEnded);
        return () => {
            track.removeEventListener("ended", handleEnded);
        };
    }, [audioStreamForSpeech]);

    // Resize Observer
    useEffect(() => {
        const container = canvasContainerRef.current;
        const scene = sceneRef.current;
        if (!container || !scene) return;

        const updateContainer = () =>
            setContainerSize({
                width: container.clientWidth,
                height: container.clientHeight,
            });
        const updateScene = () =>
            setSceneSize({ width: scene.clientWidth, height: scene.clientHeight });

        const roContainer = new ResizeObserver(updateContainer);
        const roScene = new ResizeObserver(updateScene);

        roContainer.observe(container);
        roScene.observe(scene);
        updateContainer();
        updateScene();

        return () => {
            roContainer.disconnect();
            roScene.disconnect();
        };
    }, [isFullscreen]);

    return {
        canvasContainerRef,
        sceneRef,
        snapLinesRef,
        viewport,
        setViewport,
        isCanvasHovered,
        setIsCanvasHovered,
        isSpacePressed,
        setIsSpacePressed,
        sceneSize,
        containerSize,
        isDraggingDynamicSplitter,
        setIsDraggingDynamicSplitter,
        dynamicSplitRatio,
        setDynamicSplitRatio,
        dynamicPipPosition,
        setDynamicPipPosition,
        dynamicPipSize,
        setDynamicPipSize,
        fullTranscript,
        interimTranscript,
    };
};
