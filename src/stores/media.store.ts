import { create } from 'zustand';

interface MediaState {
    isAudioOn: boolean;
    isVideoOn: boolean;
    audioDevices: MediaDeviceInfo[];
    videoDevices: MediaDeviceInfo[];
    selectedAudioDevice: string | undefined;
    selectedVideoDevice: string | undefined;
    screenShareMode: "off" | "screen" | "canvas";

    // Actions
    setAudioOn: (isAudioOn: boolean) => void;
    setVideoOn: (isVideoOn: boolean) => void;
    setAudioDevices: (devices: MediaDeviceInfo[]) => void;
    setVideoDevices: (devices: MediaDeviceInfo[]) => void;
    setSelectedAudioDevice: (id: string) => void;
    setSelectedVideoDevice: (id: string) => void;
    setScreenShareMode: (mode: "off" | "screen" | "canvas") => void;
}

export const useMediaStore = create<MediaState>((set) => ({
    isAudioOn: true,
    isVideoOn: true,
    audioDevices: [],
    videoDevices: [],
    selectedAudioDevice: undefined,
    selectedVideoDevice: undefined,
    screenShareMode: 'off',

    setAudioOn: (isAudioOn) => set({ isAudioOn }),
    setVideoOn: (isVideoOn) => set({ isVideoOn }),
    setAudioDevices: (audioDevices) => set({ audioDevices }),
    setVideoDevices: (videoDevices) => set({ videoDevices }),
    setSelectedAudioDevice: (selectedAudioDevice) => set({ selectedAudioDevice }),
    setSelectedVideoDevice: (selectedVideoDevice) => set({ selectedVideoDevice }),
    setScreenShareMode: (screenShareMode) => set({ screenShareMode }),
}));
