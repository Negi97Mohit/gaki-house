// src/hooks/usePublicPresets.ts
import { useState, useEffect } from "react";
import { CanvasPreset } from "@/types/canvasPreset";
import { db } from "@/lib/firebase"; // Import our database connection
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { toast } from "sonner";

export const usePublicPresets = () => {
  const [publicPresets, setPublicPresets] = useState<CanvasPreset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPublicPresets = async () => {
      setIsLoading(true);
      try {
        // Create a query to get all documents from the "public_canvas_presets" collection
        // We order them by "createdAt" to show the newest ones first
        const presetsCollection = collection(db, "public_canvas_presets");
        const q = query(presetsCollection, orderBy("createdAt", "desc"));

        const querySnapshot = await getDocs(q);

        const presets: CanvasPreset[] = [];
        querySnapshot.forEach((doc) => {
          // We combine the document ID and its data to re-create the CanvasPreset object
          presets.push({
            id: doc.id,
            ...doc.data(),
          } as CanvasPreset);
        });

        setPublicPresets(presets);
      } catch (error) {
        console.error("Error fetching public presets:", error);
        toast.error("Failed to load community presets.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublicPresets();
  }, []); // This effect runs once when the component mounts

  return { publicPresets, isLoading };
};
