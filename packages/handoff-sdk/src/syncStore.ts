import { create } from "zustand";
import { HandoffDevice } from "./types/handoff";

interface HandoffState {
  activeDevice: string;
  connectionState: string;
  isRelinquishing: boolean;
  availableDevices: HandoffDevice[];

  setActiveDevice: (id: string) => void;
  setConnectionState: (state: string) => void;
  setRelinquishing: (val: boolean) => void;
  setAvailableDevices: (devices: HandoffDevice[]) => void;
}

export const handoffStore = create<HandoffState>((set) => ({
  activeDevice: "",
  connectionState: "disconnected",
  isRelinquishing: false,
  availableDevices: [],

  setActiveDevice: (id) => set({ activeDevice: id }),
  setConnectionState: (state) => set({ connectionState: state }),
  setRelinquishing: (val) => set({ isRelinquishing: val }),
  setAvailableDevices: (devices) => set({ availableDevices: devices }),
}));
