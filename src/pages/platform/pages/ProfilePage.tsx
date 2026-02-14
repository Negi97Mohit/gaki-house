import React from "react";
import { useParams } from "react-router-dom";
import { Settings, Link as LinkIcon, Calendar, Users } from "lucide-react";
import { MOCK_CHANNELS, formatViewerCount } from "../data/mockData";
import { StreamCard } from "../components/StreamCard";

export const ProfilePage: React.FC = () => {
  const { username } = useParams();
  const channel = username === "me" ? null : MOCK_CHANNELS.find((c) => c.username === username);

  // "Me" profile fallback
  const profile = channel || {
    displayName: "Your Profile",
    username: "me",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=me",
    bio: "Welcome to your channel! Start streaming to build your community.",
    followers: 0,
    isLive: false,
  };

  const pastStreams = MOCK_CHANNELS.slice(0, 4);

  return (
    <div className="pb-12">
      {/* Banner */}
      <div className="h-48 bg-gradient-to-r from-[#53fc18]/20 via-[#0e0e10] to-[#53fc18]/10 relative">
        <div className="absolute -bottom-10 left-6 flex items-end gap-4">
          <img
            src={profile.avatar}
            alt={profile.displayName}
            className="w-20 h-20 rounded-full bg-zinc-800 border-4 border-[#0e0e10]"
          />
        </div>
      </div>

      {/* Info */}
      <div className="px-6 pt-14">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{profile.displayName}</h1>
            <p className="text-zinc-500 text-sm">@{profile.username}</p>
          </div>
          {username === "me" && (
            <button className="px-4 py-2 bg-zinc-800 text-white text-sm font-medium rounded-md hover:bg-zinc-700 transition-colors flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>
        {profile.bio && (
          <p className="text-zinc-400 text-sm mt-3 max-w-xl">{profile.bio}</p>
        )}
        <div className="flex items-center gap-4 mt-3 text-sm text-zinc-500">
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {formatViewerCount(profile.followers || 0)} followers
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            Joined 2024
          </span>
        </div>
      </div>

      {/* Past Streams / VODs */}
      <div className="px-6 mt-8">
        <h2 className="text-lg font-bold text-white mb-4">Recent Streams</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {pastStreams.map((ch) => (
            <StreamCard key={ch.id} channel={ch} />
          ))}
        </div>
      </div>
    </div>
  );
};
