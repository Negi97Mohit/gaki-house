import { useEffect } from "react";
import { useAnimeStyles } from "@/hooks/useAnimeStyles";
import { updateAnimeStyles } from "@/lib/animeStyles";

/**
 * Component that synchronizes the Firestore-fetched anime styles
 * with the global AnimeStyles singleton used by non-React renderers (GLRenderer).
 */
export const StyleSync = () => {
    const { animeStyles, loading } = useAnimeStyles();

    useEffect(() => {
        if (!loading && animeStyles && Object.keys(animeStyles).length > 0) {
            console.log("Synchronizing AnimeStyles...");
            updateAnimeStyles(animeStyles);
        }
    }, [animeStyles, loading]);

    return null;
};
