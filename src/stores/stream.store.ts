import { create } from "zustand";

export interface StreamDestination {
  id: string;
  platform: string; // 'youtube', 'twitch', 'custom', etc.
  url: string;
  key: string;
  enabled: boolean;
  status: "idle" | "starting" | "connected" | "live" | "error";
  error?: string;
}

export type RecordingStatus =
  | "idle"
  | "recording"
  | "stopping"
  | "saved"
  | "error";

interface StreamState {
  // Broadcast State
  isBroadcasting: boolean;
  isConnecting: boolean;
  streamStatus: string; // User facing text like "Live", "Connecting..."
  countdown: number | null;
  destinations: StreamDestination[];

  // Recording State
  isRecording: boolean;
  recordingStatus: RecordingStatus;
  recordingDuration: number;

  // Actions
  setBroadcasting: (isBroadcasting: boolean) => void;
  setConnecting: (isConnecting: boolean) => void;
  setStreamStatus: (status: string) => void;
  setCountdown: (countdown: number | null) => void;

  // Recording Actions
  setRecording: (isRecording: boolean) => void;
  setRecordingStatus: (status: RecordingStatus) => void;
  setRecordingDuration: (duration: number) => void;

  // Destination Actions
  addDestination: (destination: StreamDestination) => void;
  removeDestination: (id: string) => void;
  updateDestination: (id: string, updates: Partial<StreamDestination>) => void;
  setDestinationStatus: (
    id: string,
    status: StreamDestination["status"],
    error?: string
  ) => void;
}

export const useStreamStore = create<StreamState>((set) => ({
  // Initial State
  isBroadcasting: false,
  isConnecting: false,
  streamStatus: "idle",
  countdown: null,
  destinations: [],

  // Recording Defaults
  isRecording: false,
  recordingStatus: "idle",
  recordingDuration: 0,

  // Actions
  setBroadcasting: (isBroadcasting) => {
    console.log("[StreamStore] setBroadcasting:", isBroadcasting);
    set({ isBroadcasting });
  },
  setConnecting: (isConnecting) => {
    console.log("[StreamStore] setConnecting:", isConnecting);
    set({ isConnecting });
  },
  setStreamStatus: (streamStatus) => {
    console.log("[StreamStore] setStreamStatus:", streamStatus);
    set({ streamStatus });
  },
  setCountdown: (countdown) => set({ countdown }),

  setRecording: (isRecording) => set({ isRecording }),
  setRecordingStatus: (recordingStatus) => set({ recordingStatus }),
  setRecordingDuration: (recordingDuration) => set({ recordingDuration }),

  addDestination: (destination) => {
    console.log("[StreamStore] Adding destination:", destination);
    set((state) => {
      const newDestinations = [...state.destinations, destination];
      return { destinations: newDestinations };
    });
  },
  removeDestination: (id) =>
    set((state) => ({
      destinations: state.destinations.filter((d) => d.id !== id),
    })),
  updateDestination: (id, updates) => {
    console.log("[StreamStore] Updating destination", id, "with:", updates);
    set((state) => {
      const newDestinations = state.destinations.map((d) =>
        d.id === id ? { ...d, ...updates } : d
      );
      return { destinations: newDestinations };
    });
  },
  setDestinationStatus: (id, status, error) => {
    console.log(
      `[StreamStore] setDestinationStatus [${id}]: ${status}`,
      error ? `Error: ${error}` : ""
    );
    set((state) => ({
      destinations: state.destinations.map((d) =>
        d.id === id ? { ...d, status, error } : d
      ),
    }));
  },
}));
