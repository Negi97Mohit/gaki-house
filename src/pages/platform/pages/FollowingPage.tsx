import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { MOCK_CHANNELS } from "../data/mockData";
import { StreamCard } from "../components/StreamCard";
import { Heart } from "lucide-react";

export const FollowingPage: React.FC = () => {
  const { user, openAuthModal } = useAuth();
  const [followedIds, setFollowedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchFollows = async () => {
      try {
        const q = query(
          collection(db, "follows"),
          where("follower_id", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        const ids = querySnapshot.docs.map(doc => doc.data().following_id);
        setFollowedIds(ids);
      } catch (error) {
        console.error("Error fetching follows:", error);
      }
    };

    fetchFollows();
  }, [user]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
        <Heart className="w-12 h-12 text-muted-foreground" />
        <h2 className="text-xl font-bold text-foreground">Follow your favorites</h2>
        <p className="text-muted-foreground text-sm text-center max-w-sm">
          Sign in to follow channels and see when they go live.
        </p>
        <button
          onClick={() => openAuthModal("login")}
          className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-md hover:opacity-90 transition-opacity"
        >
          Sign In
        </button>
      </div>
    );
  }

  // For now show mock channels as followed (real follow data will link to real profiles later)
  const followedChannels = MOCK_CHANNELS.slice(0, 6);

  return (
    <div className="p-6 pb-12">
      <h1 className="text-2xl font-bold text-foreground mb-1">Following</h1>
      <p className="text-muted-foreground text-sm mb-6">Channels you follow that are currently live</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {followedChannels.map((ch) => (
          <StreamCard key={ch.id} channel={ch} />
        ))}
      </div>
    </div>
  );
};
