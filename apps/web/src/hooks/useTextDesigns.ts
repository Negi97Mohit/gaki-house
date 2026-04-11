import { useState, useEffect } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { TextDesignPreset } from "@caption-cam/core/types/textDesign";

// Extended TextDesign with optional legacy style support
export interface TextDesign extends Omit<TextDesignPreset, 'layers'> {
    layers?: TextDesignPreset['layers'];
    style?: any; // Legacy style support
}

export const useTextDesigns = () => {
    const [textDesigns, setTextDesigns] = useState<TextDesign[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "text_designs"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as TextDesign));
            setTextDesigns(docs);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { textDesigns, loading };
};
