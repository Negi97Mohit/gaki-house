import { create } from "zustand";

export interface DesktopSource {
  id: string;
  name: string;
  thumbnail: string;
  appIcon?: string | null;
}

interface StreamState {
  isRecording: boolean;
  isBroadcasting: boolean;
  isConnecting: boolean;
  streamStatus: string;
  countdown: number | null;

  // Smart capture mode and caching
  captureMode: "app-window" | "full-screen";
  isWindowFocused: boolean; // Electron only - tracks if main window is focused
  streamCacheKey: string | null; // Cache key to track stream persistence

  // NEW: Source Selection State for Screen Sharing
  activeSourceId: string | null; // Tracks the current stream source ID (e.g., specific window or screen)
  isPickerOpen: boolean; // Controls the visibility of the source picker UI
  availableSources: DesktopSource[]; // List of screens/windows available for sharing

  // Actions
  setRecording: (isRecording: boolean) => void;
  setBroadcasting: (isBroadcasting: boolean) => void;
  setConnecting: (isConnecting: boolean) => void;
  setStreamStatus: (status: string) => void;
  setCountdown: (countdown: number | null) => void;

  // Actions for smart capture
  setCaptureMode: (mode: "app-window" | "full-screen") => void;
  setWindowFocused: (focused: boolean) => void;
  setStreamCacheKey: (key: string | null) => void;

  // NEW: Actions for Source Selection
  setActiveSourceId: (id: string | null) => void;
  setPickerOpen: (isOpen: boolean) => void;
  setAvailableSources: (sources: DesktopSource[]) => void;
}

export const useStreamStore = create<StreamState>((set) => ({
  isRecording: false,
  isBroadcasting: false,
  isConnecting: false,
  streamStatus: "idle",
  countdown: null,

  // Default values for smart capture
  captureMode: "app-window",
  isWindowFocused: true,
  streamCacheKey: null,

  // NEW: Default values for Source Selection
  activeSourceId: null,
  isPickerOpen: false,
  availableSources: [],

  setRecording: (isRecording) => set({ isRecording }),
  setBroadcasting: (isBroadcasting) => set({ isBroadcasting }),
  setConnecting: (isConnecting) => set({ isConnecting }),
  setStreamStatus: (streamStatus) => set({ streamStatus }),
  setCountdown: (countdown) => set({ countdown }),

  // Actions for smart capture
  setCaptureMode: (captureMode) => set({ captureMode }),
  setWindowFocused: (isWindowFocused) => set({ isWindowFocused }),
  setStreamCacheKey: (streamCacheKey) => set({ streamCacheKey }),

  // NEW: Implementation for Source Selection
  setActiveSourceId: (activeSourceId) => set({ activeSourceId }),
  setPickerOpen: (isPickerOpen) => set({ isPickerOpen }),
  setAvailableSources: (availableSources) => set({ availableSources }),
}));
