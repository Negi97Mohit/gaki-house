// src/hooks/useLayoutPresets.ts
import { useState, useCallback } from "react";
import { LayoutPreset } from "@/types/layoutPreset";
import { useLocalStorage } from "@/shared/hooks/useLocalStorage";
import { generateId } from "@/shared/lib/id";

export const useLayoutPresets = () => {
  const [presets, setPresets] = useLocalStorage<LayoutPreset[]>(
    "layout-presets",
    []
  );

  const savePreset = useCallback(
    (preset: Omit<LayoutPreset, "id" | "createdAt">) => {
      const newPreset: LayoutPreset = {
        ...preset,
        id: generateId("preset"),
        createdAt: Date.now(),
      };
      setPresets((prev) => [newPreset, ...prev]);
      return newPreset;
    },
    [setPresets]
  );

  const deletePreset = useCallback(
    (id: string) => {
      setPresets((prev) => prev.filter((p) => p.id !== id));
    },
    [setPresets]
  );

  const updatePreset = useCallback(
    (id: string, updates: Partial<LayoutPreset>) => {
      setPresets((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );
    },
    [setPresets]
  );

  return {
    presets,
    savePreset,
    deletePreset,
    updatePreset,
  };
};
