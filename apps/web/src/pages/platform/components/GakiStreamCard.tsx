import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Users, Play, Info } from "lucide-react";
import { type GakiStreamer, formatViewerCount } from "../data/mockData";
import { DestinationBadges } from "./DestinationBadges";
import { cn } from "@gaki/core/lib/utils";

interface GakiStreamCardProps {
  streamer: GakiStreamer;
  onOpenDetails?: (streamer: GakiStreamer) => void;
}

export const GakiStreamCard: React.FC<GakiStreamCardProps> = ({
  streamer,
  onOpenDetails,
}) => {
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const elapsedMs = Date.now() - new Date(streamer.startedAt).getTime();
  const hours = Math.floor(elapsedMs / 3600000);
  const mins = Math.floor((elapsedMs % 3600000) / 60000);
  const uptime = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return (
    <div
      className="group relative shrink-0 snap-start"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card container — Netflix hover expand */}
      <div
        className={cn(
          "relative w-[220px] sm:w-[270px] transition-all duration-300 ease-out rounded-lg overflow-hidden bg-zinc-900 border border-white/5",
          isHovered && "scale-105 sm:scale-110 z-30 shadow-2xl shadow-black border-white/20"
        )}
      >
        <Link to={`/platform/stream/${streamer.username}`} className="block">
          {/* Thumbnail */}
          <div className="relative aspect-video bg-zinc-950">
            {!imgError && streamer.thumbnailUrl ? (
              <img
                src={streamer.thumbnailUrl}
                alt={streamer.streamTitle}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                <Play className="w-8 h-8 text-zinc-600" />
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

            {/* LIVE badge */}
            <div className="absolute top-2 left-2 flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 bg-red-600 text-white text-[9px] font-black uppercase tracking-wider rounded shadow">
                Live
              </span>
              <span className="px-1.5 py-0.5 bg-black/60 backdrop-blur-sm text-white/90 text-[10px] font-medium rounded flex items-center gap-1">
                <Users className="w-2.5 h-2.5 text-red-400" />
                {formatViewerCount(streamer.viewerCount)}
              </span>
            </div>

            {/* Bottom info overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-2.5">
              <p className="text-white text-xs font-bold truncate leading-tight drop-shadow-lg">
                {streamer.streamTitle}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                {streamer.avatar ? (
                  <img
                    src={streamer.avatar}
                    alt={streamer.displayName}
                    className="w-4 h-4 rounded-full border border-white/20"
                  />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-zinc-700 flex items-center justify-center text-[8px] font-bold text-white">
                    {streamer.displayName.charAt(0)}
                  </div>
                )}
                <span className="text-white/80 text-[11px] font-medium truncate">
                  {streamer.displayName}
                </span>
                {streamer.isVerified && (
                  <svg className="w-3 h-3 text-primary shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        </Link>

        {/* Expanded info — shown on hover with action icons */}
        <div
          className={cn(
            "bg-zinc-900 border-t border-white/[0.06] transition-all duration-300 overflow-hidden",
            isHovered ? "max-h-48 opacity-100 p-2.5" : "max-h-0 opacity-0 p-0"
          )}
        >
          {/* Quick action buttons (Netflix play, info) */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <Link
              to={`/platform/stream/${streamer.username}`}
              className="w-7 h-7 rounded-full bg-white hover:bg-white/90 text-black flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow"
              title="Watch Stream"
            >
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            </Link>

            {onOpenDetails && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onOpenDetails(streamer);
                }}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/10 transition-colors"
                title="View Multicast Destinations"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-[10px] text-zinc-400 mb-1.5">
            <span className="text-zinc-300 font-medium">{streamer.category}</span>
            <span className="text-zinc-600">·</span>
            <span>{uptime} live</span>
          </div>

          {/* Destination badges */}
          {streamer.destinations.length > 0 && (
            <DestinationBadges destinations={streamer.destinations} size="sm" className="mt-1" />
          )}

          {/* Tags */}
          {streamer.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {streamer.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-1.5 py-0.5 bg-white/[0.05] text-zinc-400 text-[9px] rounded-full font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
