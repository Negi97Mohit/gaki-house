import { useState, useEffect, useCallback } from "react";
import { AnimationPreset } from "@/types/animation";
import { ANIMATION_LIBRARY } from "@/lib/animationLibrary";
import { useLocalStorage } from "./useLocalStorage";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid"; // Ensure uuid is installed or use a simple generator

export const useAnimationLibrary = () => {
  // Load user presets from local storage
  const [userPresets, setUserPresets] = useLocalStorage<AnimationPreset[]>(
    "gaki-user-animations",
    []
  );

  // Combined list for display
  const [allPresets, setAllPresets] = useState<AnimationPreset[]>([]);

  // Sync static + user presets
  useEffect(() => {
    setAllPresets([...ANIMATION_LIBRARY, ...userPresets]);
  }, [userPresets]);

  // --- ACTIONS ---

  const savePreset = useCallback(
    (preset: AnimationPreset) => {
      setUserPresets((prev) => {
        const exists = prev.find((p) => p.id === preset.id);
        if (exists) {
          // Update existing
          return prev.map((p) => (p.id === preset.id ? preset : p));
        } else {
          // Create new
          return [
            ...prev,
            { ...preset, id: uuidv4(), isCustom: true, category: "User" },
          ];
        }
      });
      toast.success("Animation saved to library!");
    },
    [setUserPresets]
  );

  const deletePreset = useCallback(
    (id: string) => {
      setUserPresets((prev) => prev.filter((p) => p.id !== id));
      toast.success("Animation deleted.");
    },
    [setUserPresets]
  );

  // "Forking" Logic:
  // When a user edits a standard preset, we don't overwrite it.
  // We check if they changed visuals vs just logic.
  const prepareForEditing = useCallback(
    (preset: AnimationPreset): AnimationPreset => {
      // Return a deep copy to ensure we don't mutate the library reference
      return JSON.parse(JSON.stringify(preset));
    },
    []
  );

  return {
    allPresets,
    userPresets,
    savePreset,
    deletePreset,
    prepareForEditing,
  };
};
