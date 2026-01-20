import { create } from 'zustand';
import { ChatMessage, MatchStatus, OmegleConnection } from '@/types/omegle';

interface OmegleState {
    // Connection state
    isOmegleMode: boolean;
    selectedDesign: string;
    connection: OmegleConnection;

    // Chat state
    messages: ChatMessage[];

    // UI state
    isCameraEnabled: boolean;
    isMicEnabled: boolean;
    isSearching: boolean;
    error: string | null;

    // Video transform state
    videoTransforms: {
        stranger: {
            flipH: boolean;
            flipV: boolean;
            zoom: number;
            locked: boolean;
            aspectRatio: string;
        };
        local: {
            flipH: boolean;
            flipV: boolean;
            zoom: number;
            locked: boolean;
            aspectRatio: string;
        };
    };

    // Actions
    enterOmegleMode: () => void;
    exitOmegleMode: () => void;
    setSelectedDesign: (designId: string) => void;
    setMatchStatus: (status: MatchStatus) => void;
    setConnection: (connection: Partial<OmegleConnection>) => void;
    setRemoteStream: (stream: MediaStream | null) => void;
    setLocalStream: (stream: MediaStream | null) => void;
    addMessage: (message: ChatMessage) => void;
    clearMessages: () => void;
    toggleCamera: () => void;
    toggleMic: () => void;
    setError: (error: string | null) => void;
    resetConnection: () => void;

    // Video transform actions
    toggleFlipH: (target: 'stranger' | 'local') => void;
    toggleFlipV: (target: 'stranger' | 'local') => void;
    setZoom: (target: 'stranger' | 'local', zoom: number) => void;
    toggleLock: (target: 'stranger' | 'local') => void;
    setAspectRatio: (target: 'stranger' | 'local', ratio: string) => void;
}

const initialConnection: OmegleConnection = {
    roomId: null,
    partnerId: null,
    isInitiator: false,
    matchStatus: 'idle',
    remoteStream: null,
    localStream: null,
};

export const useOmegleStore = create<OmegleState>((set, get) => ({
    // Initial state
    isOmegleMode: false,
    selectedDesign: 'omegle-split-view',
    connection: initialConnection,
    messages: [],
    isCameraEnabled: true,
    isMicEnabled: true,
    isSearching: false,
    error: null,

    videoTransforms: {
        stranger: {
            flipH: false,
            flipV: false,
            zoom: 1,
            locked: false,
            aspectRatio: 'free',
        },
        local: {
            flipH: false,
            flipV: false,
            zoom: 1,
            locked: false,
            aspectRatio: 'free',
        },
    },

    // Actions
    enterOmegleMode: () => {
        console.log('[OmegleStore] Entering Omegle mode');
        set({
            isOmegleMode: true,
            messages: [],
            error: null,
            connection: initialConnection,
        });
    },

    exitOmegleMode: () => {
        console.log('[OmegleStore] Exiting Omegle mode');

        // Clean up streams
        const { connection } = get();
        connection.localStream?.getTracks().forEach(track => track.stop());

        set({
            isOmegleMode: false,
            messages: [],
            error: null,
            connection: initialConnection,
            isSearching: false,
        });
    },

    setSelectedDesign: (designId: string) => {
        console.log('[OmegleStore] Setting design:', designId);
        set({ selectedDesign: designId });
    },

    setMatchStatus: (status: MatchStatus) => {
        console.log('[OmegleStore] Match status:', status);
        set(state => ({
            connection: { ...state.connection, matchStatus: status },
            isSearching: status === 'searching',
        }));
    },

    setConnection: (connectionUpdate: Partial<OmegleConnection>) => {
        set(state => ({
            connection: { ...state.connection, ...connectionUpdate },
        }));
    },

    setRemoteStream: (stream: MediaStream | null) => {
        set(state => ({
            connection: { ...state.connection, remoteStream: stream },
        }));
    },

    setLocalStream: (stream: MediaStream | null) => {
        set(state => ({
            connection: { ...state.connection, localStream: stream },
        }));
    },

    addMessage: (message: ChatMessage) => {
        set(state => ({
            messages: [...state.messages, message],
        }));
    },

    clearMessages: () => {
        set({ messages: [] });
    },

    toggleCamera: () => {
        const { isCameraEnabled, connection } = get();
        const newState = !isCameraEnabled;

        connection.localStream?.getVideoTracks().forEach(track => {
            track.enabled = newState;
        });

        set({ isCameraEnabled: newState });
    },

    toggleMic: () => {
        const { isMicEnabled, connection } = get();
        const newState = !isMicEnabled;

        connection.localStream?.getAudioTracks().forEach(track => {
            track.enabled = newState;
        });

        set({ isMicEnabled: newState });
    },

    setError: (error: string | null) => {
        set({ error });
    },

    resetConnection: () => {
        console.log('[OmegleStore] Resetting connection');
        const { connection } = get();

        // Clean up existing stream
        connection.remoteStream?.getTracks().forEach(track => track.stop());

        set({
            connection: { ...initialConnection, localStream: connection.localStream },
            messages: [],
            error: null,
        });
    },

    // Video transform actions
    toggleFlipH: (target) => {
        set(state => ({
            videoTransforms: {
                ...state.videoTransforms,
                [target]: {
                    ...state.videoTransforms[target],
                    flipH: !state.videoTransforms[target].flipH,
                },
            },
        }));
    },

    toggleFlipV: (target) => {
        set(state => ({
            videoTransforms: {
                ...state.videoTransforms,
                [target]: {
                    ...state.videoTransforms[target],
                    flipV: !state.videoTransforms[target].flipV,
                },
            },
        }));
    },

    setZoom: (target, zoom) => {
        set(state => ({
            videoTransforms: {
                ...state.videoTransforms,
                [target]: {
                    ...state.videoTransforms[target],
                    zoom: Math.max(0.5, Math.min(3, zoom)), // Clamp between 0.5x and 3x
                },
            },
        }));
    },

    toggleLock: (target) => {
        set(state => ({
            videoTransforms: {
                ...state.videoTransforms,
                [target]: {
                    ...state.videoTransforms[target],
                    locked: !state.videoTransforms[target].locked,
                },
            },
        }));
    },

    setAspectRatio: (target, ratio) => {
        set(state => ({
            videoTransforms: {
                ...state.videoTransforms,
                [target]: {
                    ...state.videoTransforms[target],
                    aspectRatio: ratio,
                },
            },
        }));
    },
}));
