
import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CaptionTemplate } from "@gaki/core/types/caption";

export const usePresetTemplates = () => {
    const [presetTemplates, setPresetTemplates] = useState<CaptionTemplate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "preset_templates"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CaptionTemplate));
            setPresetTemplates(docs);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { presetTemplates, loading };
};
