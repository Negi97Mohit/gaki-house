import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Users, Play, Info } from "lucide-react";
import { type GakiStreamer, formatViewerCount } from "../data/mockData";
import { DestinationBadges } from "./DestinationBadges";
import { cn } from "@gaki/core/lib/utils";

interface GakiTopTenCardProps {
  streamer: GakiStreamer;
  rank: number;
  onOpenDetails?: (streamer: GakiStreamer) => void;
}

export const GakiTopTenCard: React.FC<GakiTopTenCardProps> = ({
  streamer,
  rank,
  onOpenDetails,
}) => {
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group/top relative shrink-0 snap-start flex items-center select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Giant Rank Number (Netflix Top 10 Iconic Typography) */}
      <div className="relative -mr-6 sm:-mr-8 z-0 pointer-events-none select-none">
        <span
          className="text-[100px] sm:text-[130px] font-black leading-none tracking-tighter"
          style={{
            WebkitTextStroke: "4px rgba(255, 255, 255, 0.4)",
            color: "rgba(0, 0, 0, 0.8)",
            textShadow: "0 0 20px rgba(0, 0, 0, 0.9)",
          }}
        >
          {rank}
        </span>
      </div>

      {/* Card Body */}
      <div
        className={cn(
          "relative w-[180px] sm:w-[220px] rounded-lg overflow-hidden transition-all duration-300 ease-out z-10 bg-zinc-900 border border-white/5",
          isHovered && "scale-105 sm:scale-110 z-20 shadow-2xl shadow-black border-primary/40"
        )}
      >
        <Link to={`/platform/stream/${streamer.username}`} className="block relative aspect-[3/4] bg-zinc-950 overflow-hidden">
          {!imgError && (streamer.thumbnailUrl || streamer.avatar) ? (
            <img
              src={streamer.thumbnailUrl || streamer.avatar}
              alt={streamer.streamTitle}
              className="w-full h-full object-cover group-hover/top:scale-105 transition-transform duration-500"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
              <Play className="w-8 h-8 text-zinc-600" />
            </div>
          )}

          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

          {/* Top Badges */}
          <div className="absolute top-2 left-2 flex items-center gap-1">
            <span className="px-1.5 py-0.5 bg-red-600 text-white text-[9px] font-black uppercase rounded tracking-wider shadow">
              Live
            </span>
          </div>

          {/* Bottom Info */}
          <div className="absolute bottom-0 left-0 right-0 p-2.5">
            <div className="flex items-center gap-1 text-[10px] text-zinc-300 font-medium mb-1">
              <Users className="w-3 h-3 text-red-400" />
              <span>{formatViewerCount(streamer.viewerCount)}</span>
            </div>

            <p className="text-white text-xs font-bold truncate drop-shadow">
              {streamer.streamTitle}
            </p>

            <p className="text-zinc-400 text-[11px] truncate mt-0.5">
              {streamer.displayName}
            </p>

            {/* Destination Badges */}
            {streamer.destinations.length > 0 && (
              <div className="mt-1.5">
                <DestinationBadges destinations={streamer.destinations} size="sm" />
              </div>
            )}
          </div>
        </Link>

        {/* Quick info button on hover */}
        {onOpenDetails && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpenDetails(streamer);
            }}
            className={cn(
              "absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-opacity border border-white/10",
              isHovered ? "opacity-100" : "opacity-0"
            )}
            title="More details & concurrent links"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
