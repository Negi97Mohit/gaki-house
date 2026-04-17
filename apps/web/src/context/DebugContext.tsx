import React from "react";
import { create } from "zustand";
import { AIDecision } from "@caption-cam/core/types/caption";

type DebugInfo = {
  rawTranscript: string;
  aiResponse: AIDecision | null;
  error: string | null;
};

type DebugStore = {
  debugInfo: DebugInfo;
  setDebugInfo: React.Dispatch<React.SetStateAction<DebugInfo>>;
};
const useDebugStore = create<DebugStore>((set) => ({
  debugInfo: {
    rawTranscript: "",
    aiResponse: null,
    error: null,
  },
  setDebugInfo: (info) =>
    set((state) => ({
      debugInfo: typeof info === "function" ? info(state.debugInfo) : info,
    })),
}));

export const DebugProvider = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);

export const useDebug = () => useDebugStore();
