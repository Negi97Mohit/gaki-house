import React from "react";
import { X, Play, ExternalLink, Users, Radio, CheckCircle, Share2, Heart, Volume2 } from "lucide-react";
import { type GakiStreamer, formatViewerCount, PLATFORM_META } from "../data/mockData";
import { getPlatformIcon } from "@/features/banners/ui/banner/PlatformIcons";
import { Link } from "react-router-dom";
import { cn } from "@gaki/core/lib/utils";
import { toast } from "sonner";

interface StreamDetailModalProps {
  streamer: GakiStreamer | null;
  isOpen: boolean;
  onClose: () => void;
}

export const StreamDetailModal: React.FC<StreamDetailModalProps> = ({
  streamer,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !streamer) return null;

  const handleShare = () => {
    const url = `${window.location.origin}/platform/stream/${streamer.username}`;
    navigator.clipboard.writeText(url);
    toast.success("Stream link copied to clipboard!");
  };

  const elapsedMs = Date.now() - new Date(streamer.startedAt).getTime();
  const hours = Math.floor(elapsedMs / 3600000);
  const mins = Math.floor((elapsedMs % 3600000) / 60000);
  const uptime = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  const liveDestinations = streamer.destinations.filter((d) => d.isLive);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl bg-zinc-950 text-white rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black z-10 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white/80 hover:text-white flex items-center justify-center transition-colors border border-white/10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Preview Header */}
        <div className="relative aspect-video w-full bg-zinc-900 overflow-hidden">
          {streamer.thumbnailUrl ? (
            <img
              src={streamer.thumbnailUrl}
              alt={streamer.streamTitle}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center">
              <Radio className="w-12 h-12 text-zinc-600" />
            </div>
          )}

          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 via-transparent to-transparent" />

          {/* Floating Hero Info */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-wider rounded">
                Live Now
              </span>
              <span className="px-2 py-0.5 bg-black/60 backdrop-blur-sm text-white/90 text-xs font-semibold rounded flex items-center gap-1">
                <Users className="w-3 h-3 text-red-400" />
                {formatViewerCount(streamer.viewerCount)} viewers
              </span>
              <span className="text-zinc-400 text-xs font-medium">
                {streamer.category}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight drop-shadow-md">
              {streamer.streamTitle}
            </h2>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <Link
                to={`/platform/stream/${streamer.username}`}
                onClick={onClose}
                className="px-6 py-2.5 bg-white text-black text-sm font-bold rounded-lg hover:bg-white/90 transition-all flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 duration-150"
              >
                <Play className="w-4 h-4 fill-current" />
                Watch on GAKI
              </Link>

              <button
                onClick={handleShare}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg border border-white/10 transition-colors flex items-center gap-1.5"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Streamer Profile Row */}
          <div className="flex items-start justify-between gap-4 pb-6 border-b border-white/10">
            <div className="flex items-center gap-3.5">
              {streamer.avatar ? (
                <img
                  src={streamer.avatar}
                  alt={streamer.displayName}
                  className="w-12 h-12 rounded-full border-2 border-primary object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-lg text-primary">
                  {streamer.displayName.charAt(0)}
                </div>
              )}
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-base text-white">
                    {streamer.displayName}
                  </h3>
                  {streamer.isVerified && (
                    <CheckCircle className="w-4 h-4 text-primary fill-primary/20" />
                  )}
                </div>
                <p className="text-xs text-zinc-400">@{streamer.username} · {streamer.followers.toLocaleString()} followers</p>
                {streamer.bio && (
                  <p className="text-xs text-zinc-300 mt-1 max-w-md line-clamp-2">{streamer.bio}</p>
                )}
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[11px] text-zinc-500 font-mono">Uptime</span>
              <p className="text-xs font-semibold text-zinc-300">{uptime}</p>
            </div>
          </div>

          {/* Concurrent Multicasting Matrix Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Concurrent Multicast Destinations
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  This creator is using GAKI to stream to multiple platforms at the exact same time:
                </p>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 font-medium">
                {liveDestinations.length} Active Targets
              </span>
            </div>

            {liveDestinations.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {liveDestinations.map((dest) => {
                  const meta = PLATFORM_META[dest.platform];
                  const Icon = getPlatformIcon(dest.platform);
                  return (
                    <div
                      key={dest.platform}
                      className="p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/15 transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${meta.color}25` }}
                        >
                          <Icon className="w-4 h-4" style={{ color: meta.color }} />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white">
                              {meta.label}
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          </div>
                          <span className="text-[10px] text-zinc-400">
                            {dest.externalViewers ? `${dest.externalViewers.toLocaleString()} external viewers` : "Live Broadcast"}
                          </span>
                        </div>
                      </div>

                      {dest.externalUrl ? (
                        <a
                          href={dest.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-semibold text-zinc-300 hover:text-white flex items-center gap-1 transition-colors"
                        >
                          Visit <ExternalLink className="w-3 h-3 text-zinc-400" />
                        </a>
                      ) : (
                        <span className="text-[10px] text-zinc-500 font-mono uppercase px-2 py-1 bg-white/[0.02] rounded">
                          Syncing
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                <p className="text-xs text-zinc-400">
                  Currently streaming directly on GAKI Platform.
                </p>
              </div>
            )}
          </div>

          {/* Tags */}
          {streamer.tags.length > 0 && (
            <div className="pt-2">
              <span className="text-xs text-zinc-500 font-semibold block mb-2">Category Tags</span>
              <div className="flex flex-wrap gap-1.5">
                {streamer.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-full bg-white/5 text-zinc-300 text-xs font-medium border border-white/5"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
