import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AnimationPreset, AnimationCategory } from "@/types/animation";
import { toast } from "sonner";
import { generateId } from "@/lib/id";

export const ANIMATION_CATEGORIES: AnimationCategory[] = [
  "All",
  "Reveal",
  "Morph",
  "Glitch",
  "Data",
  "Kinetic",
  "Social",
  "UI",
];

export const useAnimationLibrary = () => {
  const [animationLibrary, setAnimationLibrary] = useState<AnimationPreset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "animation_library"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as AnimationPreset));
      setAnimationLibrary(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const savePreset = async (preset: AnimationPreset) => {
    try {
      const id = preset.id || generateId("anim");
      const docRef = doc(db, "animation_library", id);
      // Ensure strictly serializable data
      const { ...data } = preset;
      const payload = {
        ...data,
        id,
        updatedAt: serverTimestamp(),
        // If new, add createdAt
        ...(preset.id ? {} : { createdAt: serverTimestamp() })
      };
      await setDoc(docRef, payload, { merge: true });
      toast.success("Animation saved to library");
    } catch (error) {
      console.error("Error saving animation:", error);
      toast.error("Failed to save animation");
    }
  };

  const deletePreset = async (id: string) => {
    try {
      await deleteDoc(doc(db, "animation_library", id));
      toast.success("Animation deleted");
    } catch (error) {
      toast.error("Failed to delete animation");
    }
  };

  const prepareForEditing = (preset: AnimationPreset): AnimationPreset => {
    // Return a copy, maybe remove ID if duplicating? 
    // The original hook likely managed this.
    // If duplicating, we should generate new ID elsewhere, but here:
    return { ...preset };
  };

  return {
    animationLibrary, // New prop
    allPresets: animationLibrary, // Legacy prop alias
    loading,
    savePreset,
    deletePreset,
    prepareForEditing,
    categories: ANIMATION_CATEGORIES
  };
};
