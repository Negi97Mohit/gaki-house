import { create } from "zustand";

interface MediaState {
  isAudioOn: boolean;
  isVideoOn: boolean;
  audioDevices: MediaDeviceInfo[];
  videoDevices: MediaDeviceInfo[];
  selectedAudioDevice: string | undefined;
  selectedVideoDevice: string | undefined;
  selectedScreenSourceId: string | undefined;
  screenShareMode: "off" | "screen" | "canvas";

  // Actions
  setAudioOn: (isAudioOn: boolean) => void;
  setVideoOn: (isVideoOn: boolean) => void;
  setAudioDevices: (devices: MediaDeviceInfo[]) => void;
  setVideoDevices: (devices: MediaDeviceInfo[]) => void;
  setSelectedAudioDevice: (id: string) => void;
  setSelectedVideoDevice: (id: string) => void;
  setSelectedScreenSourceId: (id: string) => void;
  setScreenShareMode: (mode: "off" | "screen" | "canvas") => void;
}

export const useMediaStore = create<MediaState>((set) => ({
  // CHANGE 1: Set default camera and mic state to false
  isAudioOn: false,
  isVideoOn: false,
  audioDevices: [],
  videoDevices: [],
  selectedAudioDevice: undefined,
  selectedVideoDevice: undefined,
  selectedScreenSourceId: undefined, // Default to undefined (will trigger selector if needed)
  screenShareMode: "off",

  setAudioOn: (isAudioOn) => set({ isAudioOn }),
  setVideoOn: (isVideoOn) => set({ isVideoOn }),
  setAudioDevices: (audioDevices) => set({ audioDevices }),
  setVideoDevices: (videoDevices) => set({ videoDevices }),
  setSelectedAudioDevice: (selectedAudioDevice) => set({ selectedAudioDevice }),
  setSelectedVideoDevice: (selectedVideoDevice) => set({ selectedVideoDevice }),
  setSelectedScreenSourceId: (selectedScreenSourceId) => set({ selectedScreenSourceId }),
  setScreenShareMode: (screenShareMode) => set({ screenShareMode }),
}));
