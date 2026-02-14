import React from "react";
import { Link } from "react-router-dom";
import { MOCK_CHANNELS } from "../data/mockData";
import { StreamCard } from "../components/StreamCard";

export const FollowingPage: React.FC = () => {
  // Mock: show first 6 channels as "followed"
  const followedChannels = MOCK_CHANNELS.slice(0, 6);

  return (
    <div className="p-6 pb-12">
      <h1 className="text-2xl font-bold text-white mb-1">Following</h1>
      <p className="text-zinc-400 text-sm mb-6">Channels you follow that are currently live</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {followedChannels.map((ch) => (
          <StreamCard key={ch.id} channel={ch} />
        ))}
      </div>
    </div>
  );
};
