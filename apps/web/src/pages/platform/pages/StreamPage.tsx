import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Users,
  Radio,
  ExternalLink,
  Share2,
  Heart,
  ArrowLeft,
  Volume2,
  VolumeX,
  Maximize2,
  Shield,
  CheckCircle,
  Play,
} from "lucide-react";
import { DestinationBadges } from "../components/DestinationBadges";
import { PLATFORM_META, type GakiStreamer, formatViewerCount } from "../data/mockData";
import { getPlatformIcon } from "@/features/banners/ui/banner/PlatformIcons";
import { toast } from "sonner";
import { cn } from "@gaki/core/lib/utils";

// Real data hook placeholder
const useGakiStreamer = (username?: string): { data: GakiStreamer | null; isLoading: boolean } => {
  return { data: null, isLoading: false };
};

export const StreamPage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { data: streamer, isLoading } = useGakiStreamer(username);

  const [isFollowing, setIsFollowing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Stream link copied to clipboard!");
  };

  const handleToggleFollow = () => {
    setIsFollowing(!isFollowing);
    toast.success(isFollowing ? `Unfollowed @${username}` : `Following @${username}`);
  };

  // If no streamer found / streamer offline
  if (!streamer) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center px-6 pt-16 pb-24 text-center select-none">
        <div className="w-16 h-16 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center mb-6">
          <Radio className="w-8 h-8 text-zinc-600" />
        </div>

        <span className="px-2.5 py-1 rounded-full bg-white/5 text-zinc-400 text-xs font-mono font-medium mb-3">
          Channel Offline
        </span>

        <h1 className="text-3xl font-black text-white tracking-tight">
          @{username} is not streaming right now
        </h1>

        <p className="text-sm text-zinc-400 mt-2 max-w-md leading-relaxed">
          When @{username} goes live using GAKI Studio, their stream and concurrent multi-platform broadcast links will appear right here.
        </p>

        <div className="flex items-center gap-3 mt-8">
          <Link
            to="/platform"
            className="px-6 py-2.5 bg-white text-black text-xs font-bold rounded-lg hover:bg-white/90 transition-all flex items-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Platform
          </Link>

          <button
            onClick={handleShare}
            className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-lg border border-white/10 transition-colors flex items-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share Channel
          </button>
        </div>
      </div>
    );
  }

  const liveDestinations = streamer.destinations.filter((d) => d.isLive);

  return (
    <div className="min-h-screen bg-zinc-950 text-white pt-16 pb-24 select-none">
      {/* Top Navigation Back Row */}
      <div className="px-6 sm:px-12 md:px-16 py-4 flex items-center justify-between border-b border-white/[0.04]">
        <button
          onClick={() => navigate("/platform")}
          className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Browse</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-wider rounded flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Live Broadcast
          </span>
          <span className="text-xs text-zinc-400 font-medium">
            {formatViewerCount(streamer.viewerCount)} viewers
          </span>
        </div>
      </div>

      {/* Main Theater View Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
        {/* Video Canvas Container (Cinema aspect ratio) */}
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl shadow-black group">
          {streamer.thumbnailUrl ? (
            <img
              src={streamer.thumbnailUrl}
              alt={streamer.streamTitle}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
              <Play className="w-16 h-16 text-zinc-700" />
            </div>
          )}

          {/* Player Overlays & Controls Bar */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-6 pointer-events-none">
            <div className="flex items-center justify-between pointer-events-auto">
              <span className="px-2.5 py-1 rounded bg-black/60 backdrop-blur-md text-xs font-semibold text-white">
                GAKI WebRTC Stream Player
              </span>
            </div>

            <div className="flex items-center justify-between pointer-events-auto">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-colors"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <span className="text-xs text-zinc-300 font-mono">1080p · 60fps</span>
              </div>

              <button
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-colors"
                title="Fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Stream & Creator Details Bar */}
        <div className="mt-6 flex flex-col lg:flex-row items-start justify-between gap-6 pb-8 border-b border-white/10">
          <div className="flex items-start gap-4">
            {streamer.avatar ? (
              <img
                src={streamer.avatar}
                alt={streamer.displayName}
                className="w-14 h-14 rounded-full border-2 border-primary object-cover shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xl text-primary shrink-0">
                {streamer.displayName.charAt(0)}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  {streamer.streamTitle}
                </h1>
              </div>

              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-sm font-bold text-white hover:underline cursor-pointer">
                  {streamer.displayName}
                </span>
                {streamer.isVerified && (
                  <CheckCircle className="w-4 h-4 text-primary fill-primary/20" />
                )}
                <span className="text-xs text-zinc-500">@{streamer.username}</span>
                <span className="text-zinc-600">·</span>
                <span className="text-xs text-primary font-medium">{streamer.category}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 shrink-0 self-end lg:self-auto">
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
              className="p-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-colors"
              title="Share Stream"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Concurrent Multicasting Platform Section */}
        <div className="mt-8 p-6 rounded-2xl bg-zinc-900/60 border border-white/[0.08]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Multicast Matrix
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                This creator is concurrently streaming live to the following platforms using GAKI:
              </p>
            </div>

            <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-zinc-300 font-mono">
              {liveDestinations.length} Active Feeds
            </span>
          </div>

          {liveDestinations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {liveDestinations.map((dest) => {
                const meta = PLATFORM_META[dest.platform];
                const Icon = getPlatformIcon(dest.platform);
                return (
                  <div
                    key={dest.platform}
                    className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/20 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${meta.color}25` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: meta.color }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white">
                            {meta.label}
                          </span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        </div>
                        <span className="text-[10px] text-zinc-400">
                          {dest.externalViewers ? `${dest.externalViewers.toLocaleString()} watching here` : "Broadcasting Live"}
                        </span>
                      </div>
                    </div>

                    {dest.externalUrl && (
                      <a
                        href={dest.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center gap-1 transition-colors"
                      >
                        Open <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-zinc-500">
              Broadcasting exclusively on GAKI Platform.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};