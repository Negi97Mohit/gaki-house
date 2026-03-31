import { create } from "zustand";

export interface StreamHealthMetrics {
  frames: number;
  currentFps: number;
  currentKbps: number;
  targetSize: number;
  timemark: string;
}

interface StreamHealthStore {
  metrics: StreamHealthMetrics | null;
  setMetrics: (metrics: StreamHealthMetrics | null) => void;
}

export const useStreamHealthStore = create<StreamHealthStore>((set) => ({
  metrics: null,
  setMetrics: (metrics) => set({ metrics }),
}));
