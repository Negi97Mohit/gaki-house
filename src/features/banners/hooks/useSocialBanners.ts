
import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BannerDesign } from "@/types/banner"; // Assuming type exists or needs adaptation

export const useSocialBanners = () => {
    const [socialBanners, setSocialBanners] = useState<BannerDesign[]>([]);
    const [animatedBanners, setAnimatedBanners] = useState<BannerDesign[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch Social Banners
        const qSocial = query(collection(db, "social_banners"), orderBy("createdAt", "desc"));
        const unsubscribeSocial = onSnapshot(qSocial, (snapshot) => {
            const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as BannerDesign));
            setSocialBanners(docs);
        });

        // Fetch Animated Banners
        const qAnimated = query(collection(db, "animated_banners"), orderBy("createdAt", "desc"));
        const unsubscribeAnimated = onSnapshot(qAnimated, (snapshot) => {
            const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as BannerDesign));
            setAnimatedBanners(docs);
        });

        setLoading(false); // Optimistic loading state, or manage individually

        return () => {
            unsubscribeSocial();
            unsubscribeAnimated();
        };
    }, []);

    return { socialBanners, animatedBanners, loading };
};
