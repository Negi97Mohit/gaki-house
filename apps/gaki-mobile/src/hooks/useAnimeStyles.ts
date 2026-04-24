// Hook to load AnimeStyles (tri-tone configs) from Firestore.
// Mirrors the web app's useAnimeStyles hook exactly.
import { useState, useEffect } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface AnimeStyle {
  id: string;
  name: string;
  shadowColor: string;
  midColor: string;
  highlightColor: string;
  skinColor: string;
  lowThreshold: number;
  highThreshold: number;
  detailSensitivity: number;
  edgeThreshold: number;
  skinDetectionStrength: number;
}

export const useAnimeStyles = () => {
  const [animeStyles, setAnimeStyles] = useState<Record<string, AnimeStyle>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "anime_styles"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const record: Record<string, AnimeStyle> = {};
      snapshot.docs.forEach((doc) => {
        const style = { id: doc.id, ...doc.data() } as AnimeStyle;
        record[style.id] = style;
      });
      setAnimeStyles(record);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { animeStyles, loading };
};
