import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { TextDesign } from "@/types/textDesign"; // Check if this type exists, might need inference or any

// If TextDesign type isn't exported, we might need to define it or import from somewhere
// Based on typical structure
export interface TextDesign {
    id: string;
    name: string;
    category: string;
    thumbnail: string;
    style: any;
    layers?: any[];
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
