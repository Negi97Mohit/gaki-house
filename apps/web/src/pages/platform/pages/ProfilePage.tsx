import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Users, Radio, ExternalLink, Share2, Heart, Play, CheckCircle } from "lucide-react";
import { PLATFORM_META, type GakiStreamer } from "../data/mockData";
import { toast } from "sonner";
import { cn } from "@gaki/core/lib/utils";

export const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [isFollowing, setIsFollowing] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Profile link copied!");
  };

  const handleToggleFollow = () => {
    setIsFollowing(!isFollowing);
    toast.success(isFollowing ? `Unfollowed @${username}` : `Following @${username}`);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white pt-16 pb-24 select-none">
      {/* Profile Header Billboard */}
      <div className="relative h-64 sm:h-80 w-full bg-gradient-to-r from-red-950/40 via-zinc-900 to-zinc-950 overflow-hidden border-b border-white/[0.06]">
        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/4 w-80 h-80 bg-red-600/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="absolute bottom-6 left-6 sm:left-12 md:left-16 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex items-end gap-5">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-zinc-800 border-4 border-zinc-950 shadow-2xl flex items-center justify-center font-black text-3xl text-primary shrink-0 overflow-hidden">
              {username?.charAt(0).toUpperCase()}
            </div>

            <div className="mb-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  {username}
                </h1>
                <CheckCircle className="w-5 h-5 text-primary fill-primary/20" />
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 font-mono">@{username}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleFollow}
              className={cn(
                "px-5 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                isFollowing
                  ? "bg-white/10 hover:bg-white/20 text-white border border-white/10"
                  : "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-950"
              )}
            >
              <Heart className={cn("w-3.5 h-3.5", isFollowing && "fill-current text-red-500")} />
              {isFollowing ? "Following" : "Follow"}
            </button>

            <button
              onClick={handleShare}
              className="p-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-colors"
              title="Share profile"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Profile Body */}
      <div className="max-w-6xl mx-auto px-6 sm:px-12 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Creator Bio & Multicast Profile */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-white/[0.06]">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-3">About Creator</h2>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Broadcasting high-performance streams across multiple destinations using the GAKI Studio engine.
              </p>

              <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-2 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Status</span>
                  <span className="text-zinc-500 font-mono">Offline</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Engine</span>
                  <span className="text-primary font-mono">GAKI WebRTC Canvas</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Broadcasts & Multicasting Showcase */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-8 rounded-2xl bg-zinc-900/40 border border-white/[0.06] text-center py-16">
              <Radio className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No active broadcast</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                When @{username} starts streaming on GAKI, their live canvas and multi-platform links will stream here.
              </p>

              <Link
                to="/platform"
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-colors border border-white/10"
              >
                Browse Live Channels
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
