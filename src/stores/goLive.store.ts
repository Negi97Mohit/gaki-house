import { create } from "zustand";

interface GoLiveState {
  shouldOpenStreamConfig: boolean;
  requestGoLive: () => void;
  clearGoLive: () => void;
}

export const useGoLiveStore = create<GoLiveState>((set) => ({
  shouldOpenStreamConfig: false,
  requestGoLive: () => set({ shouldOpenStreamConfig: true }),
  clearGoLive: () => set({ shouldOpenStreamConfig: false }),
}));
