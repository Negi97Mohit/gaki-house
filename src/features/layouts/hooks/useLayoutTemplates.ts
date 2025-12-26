import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CanvasLayoutTemplate } from "@/types/layout";

export const useLayoutTemplates = () => {
    const [layoutTemplates, setLayoutTemplates] = useState<CanvasLayoutTemplate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Layouts might not have a createdAt, so maybe just fetch all
        // If we added migratedAt we could sort by that, but default order is fine for now
        const q = query(collection(db, "layout_templates"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CanvasLayoutTemplate));
            setLayoutTemplates(docs);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const templateRecord = layoutTemplates.reduce((acc, t) => {
        acc[t.id] = t;
        return acc;
    }, {} as Record<string, CanvasLayoutTemplate>);

    return { layoutTemplates, templateRecord, loading };
};
