import { useState, useEffect } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface FilterPreset {
    id: string;
    name: string;
    style: string;
}

export const useFilters = () => {
    const [filters, setFilters] = useState<FilterPreset[]>([]);
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
