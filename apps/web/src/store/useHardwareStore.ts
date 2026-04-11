import { create } from "zustand";

interface HardwareStore {
  activeCameraStream: MediaStream | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
}

export const useHardwareStore = create<HardwareStore>((set, get) => ({
  activeCameraStream: null,

  startCamera: async () => {
    // Prevent starting if it's already running
    if (get().activeCameraStream) return;

    try {
      // Request standard HD 16:9 video from the user's default webcam
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1920, height: 1080, aspectRatio: 16 / 9 },
        audio: false, // We'll handle audio separately later
      });

      set({ activeCameraStream: stream });
    } catch (error) {
      console.error("Failed to access hardware camera:", error);
      alert("Could not access your camera. Please check permissions.");
    }
  },

  stopCamera: () => {
    const { activeCameraStream } = get();
    if (activeCameraStream) {
      activeCameraStream.getTracks().forEach((track) => track.stop());
      set({ activeCameraStream: null });
    }
  },
}));
