import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Radio, ArrowLeft, Tv } from "lucide-react";
import { GakiStreamCard } from "../components/GakiStreamCard";
import { StreamDetailModal } from "../components/StreamDetailModal";
import { type GakiStreamer } from "../data/mockData";
import { useAuth } from "../context/AuthContext";

export const FollowingPage: React.FC = () => {
  const { user, openAuthModal } = useAuth();
  const [followedStreamers] = useState<GakiStreamer[]>([]);
  const [selectedStreamer, setSelectedStreamer] = useState<GakiStreamer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 text-white pt-20 px-6 sm:px-12 md:px-16 pb-24 select-none">
      <div className="mb-8 pb-6 border-b border-white/[0.06]">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          My List · Followed Creators
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Stay updated when your favorite multi-platform creators go live
        </p>
      </div>

      {followedStreamers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {followedStreamers.map((streamer) => (
            <GakiStreamCard
              key={streamer.uid}
              streamer={streamer}
              onOpenDetails={(s) => {
                setSelectedStreamer(s);
                setIsModalOpen(true);
              }}
            />
          ))}
        </div>
      ) : (
        <div className="py-24 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
            <Heart className="w-7 h-7 text-zinc-600" />
          </div>

          <h2 className="text-lg font-bold text-white">Your list is currently empty</h2>
          <p className="text-xs text-zinc-400 mt-1.5 max-w-sm leading-relaxed">
            Follow creators broadcasting on GAKI to track their live streams and concurrent multi-platform broadcasts.
          </p>

          <Link
            to="/platform"
            className="mt-6 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-red-950"
          >
            <Tv className="w-4 h-4" />
            Discover Streamers
          </Link>
        </div>
      )}

      <StreamDetailModal
        streamer={selectedStreamer}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
