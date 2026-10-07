import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Play, Users, Radio, Info, Volume2, VolumeX, Sparkles, Tv, ArrowRight } from "lucide-react";
import { type GakiStreamer, formatViewerCount, PLATFORM_META } from "../data/mockData";
import { DestinationBadges } from "./DestinationBadges";
import { useAuth } from "../context/AuthContext";
import { useGoLiveStore } from "@/stores/goLive.store";
import { cn } from "@gaki/core/lib/utils";

interface GakiHeroProps {
  streamer?: GakiStreamer | null;
  onOpenDetails?: (streamer: GakiStreamer) => void;
}

export const GakiHero: React.FC<GakiHeroProps> = ({ streamer, onOpenDetails }) => {
  const { user, openAuthModal } = useAuth();
  const navigate = useNavigate();
  const requestGoLive = useGoLiveStore((s) => s.requestGoLive);
  const [isMuted, setIsMuted] = useState(true);

  const handleGoLive = () => {
    if (!user) {
      openAuthModal("login");
      return;
    }
    requestGoLive();
    navigate("/");
  };

  // Empty state — Netflix Studio Spotlight Billboard
  if (!streamer) {
    return (
      <div className="relative w-full h-[65vh] sm:h-[75vh] max-h-[700px] overflow-hidden bg-black select-none">
        {/* Cinematic Backdrop with atmospheric lighting */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-black/80 z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
          
          {/* Ambient Studio Glows */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-primary/15 rounded-full blur-[160px] pointer-events-none" />

          {/* Background Grid Accent */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.2) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* Billboard Hero Content (Left-aligned Netflix signature layout) */}
        <div className="relative z-20 h-full flex flex-col justify-end px-6 sm:px-12 md:px-16 pb-16 sm:pb-20 max-w-4xl">
          {/* Netflix Signature Brand Pill */}
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-600 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-red-950">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              GAKI BROADCAST
            </span>
            <span className="text-zinc-400 text-xs font-semibold tracking-wide">
              MULTI-PLATFORM LIVE ENGINE
            </span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.08] drop-shadow-2xl">
            Stream Once. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Broadcast Everywhere.
            </span>
          </h1>

          {/* Synopsis */}
          <p className="text-sm sm:text-base text-zinc-300/90 mt-4 max-w-xl leading-relaxed drop-shadow">
            Experience the next era of creator discovery. Watch creators stream live on GAKI while simultaneously reaching audiences across YouTube, Twitch, Kick, and 40+ platforms in real-time.
          </p>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-7">
            <button
              onClick={handleGoLive}
              className="px-7 py-3 bg-white hover:bg-white/90 text-black text-sm font-black rounded-lg transition-all flex items-center gap-2.5 shadow-xl hover:scale-105 active:scale-95 duration-150"
            >
              <Radio className="w-4 h-4 text-red-600 fill-red-600" />
              Start Broadcasting
            </button>

            <Link
              to="/platform/browse"
              className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-sm font-bold rounded-lg border border-white/15 transition-all flex items-center gap-2 hover:scale-105 active:scale-95 duration-150"
            >
              <Tv className="w-4 h-4 text-zinc-300" />
              Explore Categories
            </Link>
          </div>
        </div>

        {/* Bottom edge vignette fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent z-10 pointer-events-none" />
      </div>
    );
  }

  // Active Featured Streamer Billboard
  return (
    <div className="relative w-full h-[65vh] sm:h-[75vh] max-h-[700px] overflow-hidden bg-black select-none group">
      {/* Background Banner with cinematic Ken-Burns zoom */}
      <div className="absolute inset-0">
        <img
          src={streamer.thumbnailUrl || streamer.avatar}
          alt={streamer.streamTitle}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
        />

        {/* Multi-angle gradients for Netflix readable text */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent z-10" />
        <div className="absolute inset-0 bg-black/25 z-10" />
      </div>

      {/* Billboard Content */}
      <div className="relative z-20 h-full flex flex-col justify-end px-6 sm:px-12 md:px-16 pb-16 sm:pb-20 max-w-3xl">
        {/* Top Badges */}
        <div className="flex items-center gap-2.5 mb-3">
          <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded flex items-center gap-1.5 shadow-lg">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            Live Now
          </span>
          <span className="px-2 py-0.5 bg-black/60 backdrop-blur-md text-white/90 text-xs font-semibold rounded flex items-center gap-1 border border-white/10">
            <Users className="w-3 h-3 text-red-400" />
            {formatViewerCount(streamer.viewerCount)} Watching
          </span>
          <span className="text-zinc-400 text-xs font-medium">
            {streamer.category}
          </span>
        </div>

        {/* Stream Title */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white leading-[1.1] tracking-tight drop-shadow-2xl line-clamp-2">
          {streamer.streamTitle}
        </h1>

        {/* Streamer details */}
        <div className="flex items-center gap-3 mt-3.5">
          {streamer.avatar ? (
            <img
              src={streamer.avatar}
              alt={streamer.displayName}
              className="w-9 h-9 rounded-full border-2 border-primary object-cover"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-white text-sm">
              {streamer.displayName.charAt(0)}
            </div>
          )}
          <div>
            <p className="text-white font-bold text-sm flex items-center gap-1.5">
              {streamer.displayName}
              {streamer.isVerified && (
                <svg className="w-3.5 h-3.5 text-primary" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
              )}
            </p>
            <p className="text-zinc-400 text-xs">@{streamer.username}</p>
          </div>
        </div>

        {/* Concurrent Destinations Pill Row */}
        {streamer.destinations.length > 0 && (
          <div className="mt-3.5">
            <DestinationBadges destinations={streamer.destinations} size="md" />
          </div>
        )}

        {/* Primary Action Buttons (Netflix Watch + More Info) */}
        <div className="flex items-center gap-3.5 mt-6">
          <Link
            to={`/platform/stream/${streamer.username}`}
            className="px-7 py-3 bg-white hover:bg-white/90 text-black text-sm font-black rounded-lg transition-all flex items-center gap-2 shadow-2xl hover:scale-105 active:scale-95 duration-150"
          >
            <Play className="w-4 h-4 fill-current ml-0.5" />
            Watch Live
          </Link>

          {onOpenDetails && (
            <button
              onClick={() => onOpenDetails(streamer)}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-sm font-bold rounded-lg border border-white/15 transition-all flex items-center gap-2 hover:scale-105 active:scale-95 duration-150"
            >
              <Info className="w-4 h-4" />
              More Info
            </button>
          )}
        </div>
      </div>

      {/* Right side Audio Mute & Rating Pill (Classic Netflix Bottom-Right Controls) */}
      <div className="absolute right-6 sm:right-12 bottom-20 z-20 flex items-center gap-3">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="w-10 h-10 rounded-full border border-white/30 bg-black/40 backdrop-blur-md hover:bg-black/60 text-white flex items-center justify-center transition-colors"
          title={isMuted ? "Unmute preview" : "Mute preview"}
          aria-label={isMuted ? "Unmute preview" : "Mute preview"}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        <div className="px-3 py-1 bg-black/50 backdrop-blur-md border-l-2 border-red-600 text-white/90 text-xs font-mono font-semibold">
          1080p60 · Ultra HD
        </div>
      </div>

      {/* Bottom edge vignette fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent z-10 pointer-events-none" />
    </div>
  );
};
