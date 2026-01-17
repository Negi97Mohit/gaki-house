import { create } from "zustand";

interface StreamState {
    // Map sourceId -> MediaStream
    streams: Map<string, MediaStream>;

    // Actions
    addStream: (sourceId: string, stream: MediaStream) => void;
    removeStream: (sourceId: string) => void;
    getStream: (sourceId: string) => MediaStream | undefined;
    stopAllStreams: () => void;
}

export const useStreamManagerStore = create<StreamState>((set, get) => ({
    streams: new Map(),

    addStream: (sourceId, stream) => {
        const { streams } = get();
        // specific cleanup if replacing?
        const existing = streams.get(sourceId);
        if (existing) {
            existing.getTracks().forEach(t => t.stop());
        }

        const newMap = new Map(streams);
        newMap.set(sourceId, stream);

        // Auto-cleanup listener
        stream.getVideoTracks()[0].onended = () => {
            get().removeStream(sourceId);
        };

        set({ streams: newMap });
    },

    removeStream: (sourceId) => {
        const { streams } = get();
        const stream = streams.get(sourceId);
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            const newMap = new Map(streams);
            newMap.delete(sourceId);
            set({ streams: newMap });
        }
    },

    getStream: (sourceId) => {
        return get().streams.get(sourceId);
    },

    stopAllStreams: () => {
        const { streams } = get();
        streams.forEach((stream) => {
            stream.getTracks().forEach((track) => track.stop());
        });
        set({ streams: new Map() });
    },
}));
