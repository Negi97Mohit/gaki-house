
import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CaptionTemplate } from "@/types/caption";
import mobileCaptionPresets from "../../data/mobile_firestore_export/caption_presets.json";

interface UseCaptionPresetsOptions {
    mobileOnly?: boolean;
}

export const useCaptionPresets = ({ mobileOnly = false }: UseCaptionPresetsOptions = {}) => {
    const [captionPresets, setCaptionPresets] = useState<CaptionTemplate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "caption_presets"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CaptionTemplate & { isMobile?: boolean }));
            const filteredDocs = mobileOnly ? docs.filter((preset) => (preset as any).isMobile === true) : docs;

            if (mobileOnly && filteredDocs.length === 0) {
                setCaptionPresets((mobileCaptionPresets as (CaptionTemplate & { isMobile?: boolean })[]).filter((preset) => preset.isMobile));
            } else {
                setCaptionPresets(filteredDocs);
            }
            setLoading(false);
        }, () => {
            if (mobileOnly) {
                setCaptionPresets((mobileCaptionPresets as (CaptionTemplate & { isMobile?: boolean })[]).filter((preset) => preset.isMobile));
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [mobileOnly]);

    return { captionPresets, loading };
};
