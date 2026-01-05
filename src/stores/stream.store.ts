import { create } from 'zustand';

interface StreamState {
    isRecording: boolean;
    isBroadcasting: boolean;
    isConnecting: boolean;
    streamStatus: string;
    countdown: number | null;

    // Actions
    setRecording: (isRecording: boolean) => void;
    setBroadcasting: (isBroadcasting: boolean) => void;
    setConnecting: (isConnecting: boolean) => void;
    setStreamStatus: (status: string) => void;
    setCountdown: (countdown: number | null) => void;
}

export const useStreamStore = create<StreamState>((set) => ({
    isRecording: false,
    isBroadcasting: false,
    isConnecting: false,
    streamStatus: 'idle',
    countdown: null,

    setRecording: (isRecording) => set({ isRecording }),
    setBroadcasting: (isBroadcasting) => set({ isBroadcasting }),
    setConnecting: (isConnecting) => set({ isConnecting }),
    setStreamStatus: (streamStatus) => set({ streamStatus }),
    setCountdown: (countdown) => set({ countdown }),
}));
