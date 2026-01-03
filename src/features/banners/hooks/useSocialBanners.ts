
import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SocialBannerDesign } from "@/types/socialBanner";
import { AnimatedBannerDesign } from "@/types/animatedBanner";

export const useSocialBanners = () => {
    const [socialBanners, setSocialBanners] = useState<SocialBannerDesign[]>([]);
    const [animatedBanners, setAnimatedBanners] = useState<AnimatedBannerDesign[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch Social Banners
        const qSocial = query(collection(db, "social_banners"), orderBy("createdAt", "desc"));
        const unsubscribeSocial = onSnapshot(qSocial, (snapshot) => {
            const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as SocialBannerDesign));
            setSocialBanners(docs);
        });

        // Fetch Animated Banners
        const qAnimated = query(collection(db, "animated_banners"), orderBy("createdAt", "desc"));
        const unsubscribeAnimated = onSnapshot(qAnimated, (snapshot) => {
            const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as AnimatedBannerDesign));
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
