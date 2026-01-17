import { useEffect, useState } from "react";
import { useStreamManagerStore } from "@/stores/stream-manager.store";

export const useScreenStream = (sourceId?: string) => {
    const [error, setError] = useState<Error | null>(null);
    const { getStream, addStream, removeStream } = useStreamManagerStore();

    // Local state to force re-render when stream is added/ready
    const [stream, setStream] = useState<MediaStream | null>(
        sourceId ? getStream(sourceId) || null : null
    );

    useEffect(() => {
        if (!sourceId) {
            setStream(null);
            return;
        }

        const existingStream = getStream(sourceId);
        if (existingStream) {
            setStream(existingStream);
            return;
        }

        let mounted = true;

        const startStream = async () => {
            console.log(`[useScreenStream] Starting stream for ${sourceId}`);
            try {
                const constraints = {
                    audio: false,
                    video: {
                        mandatory: {
                            chromeMediaSource: "desktop",
                            chromeMediaSourceId: sourceId,
                        },
                    } as any, // Cast to any to avoid TS issues with 'mandatory'
                };

                const newStream = await navigator.mediaDevices.getUserMedia(
                    constraints as MediaStreamConstraints
                );
                console.log(`[useScreenStream] Got stream for ${sourceId}:`, newStream.id);

                if (mounted) {
                    addStream(sourceId, newStream);
                    setStream(newStream);

                    newStream.getVideoTracks()[0].onended = () => {
                        console.log(`[useScreenStream] Stream ended for ${sourceId}`);
                        // Handle stream ended (e.g. user clicked "Stop sharing" on system UI)
                        removeStream(sourceId);
                        if (mounted) setStream(null);
                    };
                } else {
                    console.log(`[useScreenStream] Unmounted before stream ready for ${sourceId}`);
                    // If unmounted during load, close it immediately
                    newStream.getTracks().forEach(t => t.stop());
                }
            } catch (err) {
                console.error(`[useScreenStream] Error for ${sourceId}:`, err);
                if (mounted) setError(err as Error);
            }
        };

        startStream();

        return () => {
            mounted = false;
            // Optional: Stop stream when component unmounts?
            // For grid sections, yes, likely.
            // But if we move sections, we might want to keep it?
            // For now, let's play safe and NOT stop it automatically on unmount 
            // UNLESS we want to strictly bind stream to section presence.
            // If we don't stop it, who stops it?
            // The store has `stopAllStreams`.
            // Let's rely on the store or manual user action for now, OR stop it 
            // if we are sure no other component uses it?
            // Ref counting would be ideal.
            // For simplicity: DO NOT stop on unmount, allowing re-use. 
            // User can stop sharing via system UI or we provide a button.
        };
    }, [sourceId, getStream, addStream, removeStream]);

    // Subscribe to store updates in case another component adds/removes this stream?
    // relying on useEffect is decent for creation.
    // But if the stream is removed forcefully by store, we should know.
    // We can use a selector.

    const storeStream = useStreamManagerStore(state => sourceId ? state.streams.get(sourceId) : undefined);

    // Return the store stream (source of truth) or local stream (while syncing)
    return storeStream || stream;
};
