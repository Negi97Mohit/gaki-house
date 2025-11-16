// src/hooks/useCanvasPresets.ts
import { useState, useCallback } from "react";
import { CanvasPreset } from "@/types/canvasPreset";
import { useLocalStorage } from "./useLocalStorage";

export const useCanvasPresets = () => {
  const [customPresets, setCustomPresets] = useLocalStorage<CanvasPreset[]>(
    "custom-canvas-presets",
    []
  );

  const saveCanvasPreset = useCallback(
    (preset: Omit<CanvasPreset, "id">) => {
      const newPreset: CanvasPreset = {
        ...preset,
        id: `custom-preset-${Date.now()}`,
      };
      setCustomPresets((prev) => [newPreset, ...prev]);
      return newPreset;
    },
    [setCustomPresets]
  );

  const deleteCanvasPreset = useCallback(
    (id: string) => {
      setCustomPresets((prev) => prev.filter((p) => p.id !== id));
    },
    [setCustomPresets]
  );

  const updateCanvasPreset = useCallback(
    (id: string, updates: Partial<CanvasPreset>) => {
      setCustomPresets((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );
    },
    [setCustomPresets]
  );

  return {
    customPresets,
    saveCanvasPreset,
    deleteCanvasPreset,
    updateCanvasPreset,
  };
};
