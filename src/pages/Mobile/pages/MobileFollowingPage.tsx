import React, { useState, useEffect } from "react";
import { Heart, Search } from "lucide-react";
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
        <div className="flex flex-col h-full bg-background animate-in fade-in duration-300">
            {/* Header section mimicking browse/home style */}
            <div className="px-4 pt-4 pb-2">
                <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-5 h-5 text-primary fill-primary/20" />
                    <h1 className="text-xl font-bold text-foreground tracking-tight">Following</h1>
                </div>
                <p className="text-sm text-muted-foreground">Catch up with channels you follow.</p>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-20 mt-2">
                {!isReady ? (
                    // Loading skeleton
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="rounded-xl bg-muted/30 aspect-video animate-pulse" />
                        ))}
                    </div>
                ) : !user ? (
                    // Not logged in
                    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <Heart className="w-8 h-8 text-primary" />
                        </div>
                        <h2 className="text-lg font-bold text-foreground mb-2">Sign in to see follows</h2>
                        <p className="text-sm text-muted-foreground mb-6">Log in to track your favorite streamers and never miss when they go live.</p>
                    </div>
                ) : followedStreams.length === 0 ? (
                    // Logged in but no follows
                    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
                        <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                            <Search className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h2 className="text-lg font-bold text-foreground mb-2">It's quiet here...</h2>
                        <p className="text-sm text-muted-foreground mb-6">You aren't following anyone who is currently live.</p>
                        <Link
                            to="/m/browse"
                            className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/90 transition-colors active:scale-95"
                        >
                            Discover Channels
                        </Link>
                    </div>
                ) : (
                    // Feed
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {followedStreams.map((stream) => (
                            <MobileStreamCard key={stream.id} channel={stream} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
