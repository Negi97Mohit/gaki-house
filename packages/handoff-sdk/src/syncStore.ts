import { createStore } from "zustand/vanilla";
import { ConnectionState } from "livekit-client";

export interface HandoffState {
  activeDeviceId: string | null;
  isRelinquishing: boolean;
  connectionState: ConnectionState | "disconnected";
  setActiveDevice: (id: string) => void;
  setRelinquishing: (status: boolean) => void;
  setConnectionState: (state: ConnectionState) => void;
}

export const handoffStore = createStore<HandoffState>((set) => ({
  activeDeviceId: null,
  isRelinquishing: false,
  connectionState: "disconnected",
  setActiveDevice: (id) => set({ activeDeviceId: id }),
  setRelinquishing: (status) => set({ isRelinquishing: status }),
  setConnectionState: (state) => set({ connectionState: state }),
}));
