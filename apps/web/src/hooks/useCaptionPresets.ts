
import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CaptionTemplate } from "@caption-cam/core/types/caption";

export const useCaptionPresets = () => {
    const [captionPresets, setCaptionPresets] = useState<CaptionTemplate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "caption_presets"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CaptionTemplate));
            setCaptionPresets(docs);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { captionPresets, loading };
};
