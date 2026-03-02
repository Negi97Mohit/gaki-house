import React, { useState, useEffect } from "react";
import { Heart, Search, Radio } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/pages/platform/context/AuthContext";
import { useStreams } from "@/pages/platform/hooks/useStreams";
import { MobileStreamCard } from "../components/MobileStreamCard";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export const MobileFollowingPage: React.FC = () => {
    const { user } = useAuth();
    const { data: allStreams = [], isLoading: streamsLoading } = useStreams();
    const [followedChannelIds, setFollowedChannelIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFollows = async () => {
            if (!user) {
                setIsLoading(false);
                return;
            }

            try {
                const q = query(
                    collection(db, "follows"),
                    where("follower_id", "==", user.uid)
                );
                const snapshot = await getDocs(q);
                const ids = new Set<string>();
                snapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.following_id) ids.add(data.following_id);
                });
                setFollowedChannelIds(ids);
            } catch (error) {
                console.error("Error fetching follows:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFollows();
    }, [user]);

    // Derived states
    const isReady = !isLoading && !streamsLoading;
    const followedStreams = allStreams.filter(stream => followedChannelIds.has(stream.id));

    return (
        <div className="flex flex-col h-full bg-background animate-in fade-in duration-300" role="region" aria-label="Following">
            {/* Header */}
            <div className="px-4 pt-5 pb-3">
                <div className="flex items-center gap-2.5 mb-1.5">
                    <Heart className="w-5 h-5 text-primary fill-primary/20" aria-hidden="true" />
                    <h1 className="mobile-fluid-title">Following</h1>
                </div>
                <p className="text-sm text-muted-foreground">Catch up with channels you follow.</p>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-6 mt-1">
                {!isReady ? (
                    // Loading skeleton
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i}>
                                <div className="rounded-2xl aspect-video mobile-skeleton mb-3" />
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-full mobile-skeleton shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3.5 mobile-skeleton rounded w-3/4" />
                                        <div className="h-3 mobile-skeleton rounded w-1/2" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : !user ? (
                    // Not logged in
                    <div className="flex flex-col items-center justify-center text-center py-20 px-6">
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                            <Heart className="w-9 h-9 text-primary" aria-hidden="true" />
                        </div>
                        <h2 className="text-lg font-bold text-foreground mb-2">Sign in to see follows</h2>
                        <p className="text-sm text-muted-foreground mb-6 max-w-[260px]">Log in to track your favorite streamers and never miss when they go live.</p>
                    </div>
                ) : followedStreams.length === 0 ? (
                    // Logged in but no follows
                    <div className="flex flex-col items-center justify-center text-center py-20 px-6">
                        <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mb-5">
                            <Radio className="w-9 h-9 text-muted-foreground" aria-hidden="true" />
                        </div>
                        <h2 className="text-lg font-bold text-foreground mb-2">It's quiet here...</h2>
                        <p className="text-sm text-muted-foreground mb-6 max-w-[260px]">You aren't following anyone who is currently live.</p>
                        <Link
                            to="/m/browse"
                            className="px-6 py-3 bg-primary text-primary-foreground font-bold text-sm rounded-full active:scale-95 transition-transform min-h-[44px] flex items-center"
                        >
                            Discover Channels
                        </Link>
                    </div>
                ) : (
                    // Feed
                    <div className="space-y-5">
                        {followedStreams.map((stream) => (
                            <MobileStreamCard key={stream.id} channel={stream} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
