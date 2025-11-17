// src/hooks/useCanvasPresets.ts
import { useState, useCallback } from "react";
import { CanvasPreset } from "@/types/canvasPreset";
import { useLocalStorage } from "./useLocalStorage";
import { db } from "@/lib/firebase"; // --- ADDED: Import db
import { collection, addDoc, serverTimestamp } from "firebase/firestore"; // --- ADDED: Import firestore functions
import { toast } from "sonner"; // --- ADDED: Import toast

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

  // --- NEW FUNCTION: The "Write" logic ---
  const shareCanvasPreset = useCallback(
    async (preset: CanvasPreset, authorName: string = "Anonymous") => {
      const toastId = toast.loading("Sharing preset to the community...");

      try {
        // 1. We prepare the data, removing the local 'id'
        //    and adding our new fields.
        const { id, ...presetData } = preset;
        const presetToUpload = {
          ...presetData,
          authorName: authorName,
          downloadCount: 0,
          createdAt: serverTimestamp(), // Asks Firestore to add the current time
        };

        // 2. Add the document to the 'public_canvas_presets' collection
        const docRef = await addDoc(
          collection(db, "public_canvas_presets"),
          presetToUpload
        );

        toast.success("Preset shared successfully!", {
          id: toastId,
          description: `ID: ${docRef.id}`,
        });
      } catch (error) {
        console.error("Error sharing preset:", error);
        toast.error(`Error: ${(error as Error).message}`, { id: toastId });
      }
    },
    [] // No dependencies, this function is stable
  );
  // --- END OF NEW FUNCTION ---

  return {
    customPresets,
    saveCanvasPreset,
    deleteCanvasPreset,
    updateCanvasPreset,
    shareCanvasPreset, // --- ADDED: Expose the new function
  };
};
