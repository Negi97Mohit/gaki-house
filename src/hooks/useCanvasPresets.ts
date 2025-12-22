// src/hooks/useCanvasPresets.ts
import { useState, useCallback, useEffect } from "react";
import { CanvasPreset } from "@/types/canvasPreset";
import { useLocalStorage } from "./useLocalStorage";
import { db } from "@/lib/firebase"; // --- ADDED: Import db
import {
  collection,
  addDoc,
  serverTimestamp,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot
} from "firebase/firestore"; // --- ADDED: Import firestore functions
import { toast } from "sonner"; // --- ADDED: Import toast
import { generateId } from "@/lib/id";

export const useCanvasPresets = () => {
  const [customPresets, setCustomPresets] = useLocalStorage<CanvasPreset[]>(
    "custom-canvas-presets",
    []
  );

  // System presets (canvas_presets + dynamic_presets)
  const [systemPresets, setSystemPresets] = useState<CanvasPreset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch Canvas Presets
    const qCanvas = query(collection(db, "canvas_presets"), orderBy("createdAt", "desc"));
    const unsubCanvas = onSnapshot(qCanvas, (snapshot) => {
      const canvasDocs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CanvasPreset));

      // 2. Fetch Dynamic Presets (nested to ensure we combine them)
      // Ideally we would do this in parallel but for simplicity in this hook:
      // Actually onSnapshot is async listener, we can have two states and combine them.
      setSystemPresets((prev) => {
        // We need to merge carefully. Let's separate them.
        return prev;
      });
    });

    // Actually, let's just use one effect to manage subscription to both if they are just "system presets"
    // But since onSnapshot is real-time, it's better to accept we might have two lists.
    // Let's create two separate queries.
  }, []);

  // Simplified approach: Two separate state variables for the two collections
  const [staticSystemPresets, setStaticSystemPresets] = useState<CanvasPreset[]>([]);
  const [dynamicSystemPresets, setDynamicSystemPresets] = useState<CanvasPreset[]>([]);

  useEffect(() => {
    const q1 = query(collection(db, "canvas_presets"), orderBy("createdAt", "desc"));
    const u1 = onSnapshot(q1, (snap) => {
      setStaticSystemPresets(snap.docs.map(d => ({ id: d.id, ...d.data() } as CanvasPreset)));
    });

    const q2 = query(collection(db, "dynamic_presets"), orderBy("createdAt", "desc"));
    const u2 = onSnapshot(q2, (snap) => {
      setDynamicSystemPresets(snap.docs.map(d => ({ id: d.id, ...d.data() } as CanvasPreset)));
    });

    setLoading(false);
    return () => { u1(); u2(); };
  }, []);

  // Combine them
  const allSystemPresets = [...dynamicSystemPresets, ...staticSystemPresets];


  const saveCanvasPreset = useCallback(
    (preset: Omit<CanvasPreset, "id">) => {
      const newPreset: CanvasPreset = {
        ...preset,
        id: generateId("custom-preset"),
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
    async (localPreset: CanvasPreset, authorName: string = "Anonymous") => {
      const toastId = toast.loading("Sharing preset to the community...");
      // --- 3. ADD DUPLICATE CHECK ---
      if (localPreset.publicId) {
        toast.error("This preset has already been shared.", { id: toastId });
        return null; // Stop here
      }
      // --- END DUPLICATE CHECK ---

      try {
        // 4. We prepare the data, removing local 'id' and 'publicId'
        //    and adding our new fields.
        const { id, publicId, ...presetData } = localPreset;
        const presetToUpload = {
          ...presetData,
          localId: id,
          authorName: authorName,
          downloadCount: 0,
          createdAt: serverTimestamp(), // Asks Firestore to add the current time
        };

        // 2. Add the document to the 'public_canvas_presets' collection
        const docRef = await addDoc(
          collection(db, "public_canvas_presets"),
          presetToUpload
        );
        updateCanvasPreset(localPreset.id, { publicId: docRef.id });
        toast.success("Preset shared successfully!", {
          id: toastId,
          description: `ID: ${docRef.id}`,
        });
      } catch (error) {
        console.error("Error sharing preset:", error);
        toast.error(`Error: ${(error as Error).message}`, { id: toastId });
        return null;
      }
    },
    [updateCanvasPreset] // No dependencies, this function is stable
  );
  // --- END OF NEW FUNCTION ---
  // --- 8. ADD NEW UNSHARE FUNCTION ---
  const unshareCanvasPreset = useCallback(
    async (localPreset: CanvasPreset) => {
      if (!localPreset.publicId) {
        toast.error("This preset has not been shared.");
        return;
      }

      const toastId = toast.loading("Removing preset from community...");
      try {
        // 1. Create a reference to the document in Firestore
        const docRef = doc(db, "public_canvas_presets", localPreset.publicId);

        // 2. Delete the document
        await deleteDoc(docRef);

        // 3. Remove the publicId link from the local preset
        updateCanvasPreset(localPreset.id, { publicId: undefined });

        toast.success("Preset unshared successfully.", { id: toastId });
      } catch (error) {
        console.error("Error unsharing preset:", error);
        toast.error(`Error: ${(error as Error).message}`, { id: toastId });
      }
    },
    [updateCanvasPreset]
  );
  // --- END OF UNSHARE FUNCTION ---

  return {
    customPresets,
    saveCanvasPreset,
    deleteCanvasPreset,
    updateCanvasPreset,
    shareCanvasPreset, // --- ADDED: Expose the new function
    unshareCanvasPreset,
    systemPresets: allSystemPresets,
    loading
  };
};
