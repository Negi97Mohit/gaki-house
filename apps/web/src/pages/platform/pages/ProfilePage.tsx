import React from "react";
import { useParams, Link } from "react-router-dom";
import { Settings, Calendar, Users } from "lucide-react";
import { formatViewerCount } from "../data/mockData";
import { useStreams } from "../hooks/useStreams";
import { StreamCard } from "../components/StreamCard";
import { useAuth } from "../context/AuthContext";

export const ProfilePage: React.FC = () => {
  const { username } = useParams();
  const { user, profile: authProfile } = useAuth();

  const isSelf = username === "me" || (user && authProfile?.username === username);
  const { data: allStreams = [] } = useStreams();
  const channel = !isSelf ? allStreams.find((c) => c.username === username) : null;

  const profile = isSelf && authProfile
    ? {
      displayName: authProfile.display_name || "Your Profile",
      username: authProfile.username || "me",
      avatar: authProfile.avatar_url || "https://api.dicebear.com/9.x/adventurer/svg?seed=me",
      bio: authProfile.bio || "Welcome to your channel! Start streaming to build your community.",
      followers: 0,
      isLive: false,
    }
    : channel || {
      displayName: "Your Profile",
      username: "me",
      avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=me",
      bio: "Welcome to your channel! Start streaming to build your community.",
      followers: 0,
      isLive: false,
    };

  const pastStreams = allStreams.slice(0, 4);

  return (
    <div className="pb-12">
      {/* Banner */}
      <div className="h-48 bg-gradient-to-r from-primary/20 via-background to-primary/10 relative">
        <div className="absolute -bottom-10 left-6 flex items-end gap-4">
          <img
            src={profile.avatar}
            alt={profile.displayName}
            className="w-20 h-20 rounded-full bg-muted border-4 border-background"
          />
        </div>
      </div>

      {/* Info */}
      <div className="px-6 pt-14">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{profile.displayName}</h1>
            <p className="text-muted-foreground text-sm">@{profile.username}</p>
          </div>
          {isSelf && (
            <Link
              to="/platform/settings"
              className="px-4 py-2 bg-muted text-foreground text-sm font-medium rounded-md hover:bg-muted/80 transition-colors flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Edit Profile
            </Link>
          )}
        </div>
        {profile.bio && (
          <p className="text-muted-foreground text-sm mt-3 max-w-xl">{profile.bio}</p>
        )}
        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
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
        <h2 className="text-lg font-bold text-foreground mb-4">Recent Streams</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {pastStreams.map((ch) => (
            <StreamCard key={ch.id} channel={ch} />
          ))}
        </div>
      </div>
    </div>
  );
};
