import { useState, useEffect } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface FilterPreset {
    id: string;
    name: string;
    style: string;
}

const DEFAULT_FILTERS: FilterPreset[] = [
    { id: "none", name: "None", style: "none" },
    { id: "sepia", name: "Sepia", style: "sepia(1)" },
    { id: "grayscale", name: "B&W", style: "grayscale(1)" },
    { id: "contrast", name: "Contrast", style: "contrast(1.5)" },
    { id: "brightness", name: "Bright", style: "brightness(1.5)" },
    { id: "blur", name: "Blur", style: "blur(5px)" },
    { id: "invert", name: "Invert", style: "invert(1)" },
    { id: "saturate", name: "Saturate", style: "saturate(2)" },
    { id: "hue-rotate", name: "Hue", style: "hue-rotate(90deg)" },
];

export const useFilters = () => {
    const [filters, setFilters] = useState<FilterPreset[]>(DEFAULT_FILTERS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "filters"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as FilterPreset));
            // Sort might be needed if order matters, assuming default order for now or add 'order' field later
            setFilters(docs);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { filters, loading };
};
