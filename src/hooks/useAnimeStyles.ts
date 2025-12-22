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
    const [animeStylesList, setAnimeStylesList] = useState<AnimeStyle[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "anime_styles"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as AnimeStyle));

            // Convert Array to Record for O(1) access by ID
            const record: Record<string, AnimeStyle> = {};
            docs.forEach(style => {
                // Use either id or name as key, preserving legacy structure where keys were IDs
                record[style.id] = style;
            });

            setAnimeStyles(record);
            setAnimeStylesList(docs);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { animeStyles, animeStylesList, loading };
};
