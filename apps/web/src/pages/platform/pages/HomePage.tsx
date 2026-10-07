import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Radio, Zap, Globe, Tv, Layers, ArrowUpRight, Flame, ShieldCheck } from "lucide-react";
import { GakiHero } from "../components/GakiHero";
import { GakiStreamCard } from "../components/GakiStreamCard";
import { GakiTopTenCard } from "../components/GakiTopTenCard";
import { StreamRow } from "../components/StreamRow";
import { StreamDetailModal } from "../components/StreamDetailModal";
import { PLATFORM_META, type GakiStreamer, type PlatformType } from "../data/mockData";
import { getPlatformIcon } from "@/features/banners/ui/banner/PlatformIcons";
import { useAuth } from "../context/AuthContext";
import { useGoLiveStore } from "@/stores/goLive.store";
import { cn } from "@gaki/core/lib/utils";

// Real-data hook placeholder (ready for Supabase gaki_streams queries)
const useGakiStreamers = (): { data: GakiStreamer[]; isLoading: boolean } => {
  return { data: [], isLoading: false };
};

// Genre category tags
const GENRES = [
  "All",
  "Gaming",
  "Just Chatting",
  "Esports",
  "Creative & Dev",
  "Music & Live Audio",
  "Tech & AI",
  "Podcasts",
];

// Supported Multicast Destinations
const SHOWCASE_PLATFORMS: PlatformType[] = [
  "youtube",
  "twitch",
  "kick",
  "tiktok",
  "facebook",
  "instagram",
  "x",
  "linkedin",
  "rumble",
  "trovo",
  "dlive",
  "vimeo",
];

export const HomePage: React.FC = () => {
  const { data: streamers, isLoading } = useGakiStreamers();
  const { user, openAuthModal } = useAuth();
  const navigate = useNavigate();
  const requestGoLive = useGoLiveStore((s) => s.requestGoLive);

  const [activeGenre, setActiveGenre] = useState("All");
  const [selectedStreamer, setSelectedStreamer] = useState<GakiStreamer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenDetails = (streamer: GakiStreamer) => {
    setSelectedStreamer(streamer);
    setIsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setIsModalOpen(false);
  };

  const handleGoLive = () => {
    if (!user) {
      openAuthModal("login");
      return;
    }
    requestGoLive();
    navigate("/");
  };

  const liveStreamers = streamers.filter((s) => s.isLive);
  const featured =
    liveStreamers.length > 0
      ? liveStreamers.reduce((max, s) => (s.viewerCount > max.viewerCount ? s : max), liveStreamers[0])
      : null;

  // Filter streamers by category if genre is selected
  const filteredLive =
    activeGenre === "All"
      ? liveStreamers
      : liveStreamers.filter((s) =>
          s.category.toLowerCase().includes(activeGenre.toLowerCase()) ||
          s.tags.some((t) => t.toLowerCase().includes(activeGenre.toLowerCase()))
        );

  // Group streamers multicasting to 2 or more external platforms
  const multiPlatform = filteredLive.filter(
    (s) => s.destinations.filter((d) => d.isLive).length >= 2
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-foreground pb-24 select-none">
      {/* 1. Cinematic Billboard Hero */}
      <GakiHero streamer={featured} onOpenDetails={handleOpenDetails} />

      {/* 2. Genre / Categories Filter Pills (Sticky Netflix-style Sub-header) */}
      <div className="sticky top-16 z-30 bg-zinc-950/80 backdrop-blur-md border-b border-white/[0.04] px-6 sm:px-12 md:px-16 py-3 flex items-center gap-2 overflow-x-auto scrollbar-none">
        {GENRES.map((genre) => (
          <button
            key={genre}
            onClick={() => setActiveGenre(genre)}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200",
              activeGenre === genre
                ? "bg-white text-black shadow-md scale-105"
                : "bg-white/[0.06] text-zinc-400 hover:text-white hover:bg-white/[0.12] border border-white/5"
            )}
          >
            {genre}
          </button>
        ))}
      </div>

      <div className="space-y-10 mt-6">
        {/* 3. Top 10 Live on GAKI Today (Iconic Netflix Giant Numbers) */}
        {filteredLive.length > 0 && (
          <div id="live">
            <StreamRow
              title="Top 10 Live on GAKI Today"
              subtitle="The most-watched creators broadcasting right now"
            >
              {filteredLive.slice(0, 10).map((s, index) => (
                <GakiTopTenCard
                  key={s.uid}
                  streamer={s}
                  rank={index + 1}
                  onOpenDetails={handleOpenDetails}
                />
              ))}
            </StreamRow>
          </div>
        )}

        {/* 4. Multicasting Across Platforms Row */}
        {multiPlatform.length > 0 && (
          <div id="multicast">
            <StreamRow
              title="Concurrent Multicast Streamers"
              subtitle="Broadcasting to YouTube, Twitch, Kick & more simultaneously via GAKI"
            >
              {multiPlatform.map((s) => (
                <GakiStreamCard
                  key={s.uid}
                  streamer={s}
                  onOpenDetails={handleOpenDetails}
                />
              ))}
            </StreamRow>
          </div>
        )}

        {/* 5. All Live Streams Row (if live streamers exist) */}
        {filteredLive.length > 0 && (
          <StreamRow
            title="Trending Live Broadcasts"
            subtitle="Explore all active live streams across categories"
          >
            {filteredLive.map((s) => (
              <GakiStreamCard
                key={s.uid}
                streamer={s}
                onOpenDetails={handleOpenDetails}
              />
            ))}
          </StreamRow>
        )}

        {/* 6. Supported Multicast Destinations (Netflix Poster Grid Row) */}
        <div id="matrix">
          <StreamRow
            title="Supported Multicast Destinations"
            subtitle="Connect your RTMP keys to broadcast to all these platforms simultaneously"
          >
            {SHOWCASE_PLATFORMS.map((platformId) => {
              const meta = PLATFORM_META[platformId];
              const Icon = getPlatformIcon(platformId);
              return (
                <div
                  key={platformId}
                  className="shrink-0 snap-start w-[150px] sm:w-[180px] group/card cursor-pointer"
                  onClick={handleGoLive}
                >
                  <div
                    className="relative aspect-[3/4] rounded-xl overflow-hidden border border-white/[0.06] hover:border-white/20 transition-all duration-300 group-hover/card:scale-105 group-hover/card:shadow-xl group-hover/card:shadow-black"
                    style={{ backgroundColor: `${meta.color}0D` }}
                  >
                    {/* Atmospheric Glow */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"
                      style={{
                        background: `radial-gradient(circle at center, ${meta.color}25 0%, transparent 70%)`,
                      }}
                    />

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-between p-4">
                      <span className="self-end px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-400 bg-black/40">
                        RTMP Ready
                      </span>

                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover/card:scale-110"
                        style={{ backgroundColor: `${meta.color}20` }}
                      >
                        <Icon className="w-7 h-7" style={{ color: meta.color }} />
                      </div>

                      <div className="text-center w-full">
                        <span className="text-sm font-bold block text-white">
                          {meta.label}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-medium flex items-center justify-center gap-1 mt-0.5 group-hover/card:text-primary transition-colors">
                          Go Live <ArrowUpRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </StreamRow>
        </div>

        {/* 7. How Multicasting Works (Netflix Production Showcase Section) */}
        <section className="px-6 sm:px-12 md:px-16 pt-6">
          <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-br from-zinc-900/90 via-zinc-900/50 to-zinc-950 border border-white/[0.08] relative overflow-hidden">
            {/* Background subtle badge */}
            <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-2xl relative z-10">
              <span className="px-3 py-1 rounded-full bg-red-600/10 text-red-500 border border-red-500/20 text-xs font-black uppercase tracking-widest">
                GAKI Architecture
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-3">
                How Concurrent Multicasting Works
              </h2>
              <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                Traditional multistreaming destroys your local bandwidth by encoding separate video feeds. GAKI encodes a single ultra-optimized WebRTC/Canvas master pipeline and fans out to all destinations simultaneously with zero dropped frames.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 relative z-10">
              {[
                {
                  step: "01",
                  title: "Compose in Studio",
                  desc: "Add your webcams, screens, anime shaders, and audio DSP directly inside GAKI Web Studio.",
                },
                {
                  step: "02",
                  title: "Select Destinations",
                  desc: "Enable YouTube, Twitch, Kick, or 40+ other RTMP targets with a single toggle switch.",
                },
                {
                  step: "03",
                  title: "Single-Click Go Live",
                  desc: "Go live everywhere at once. Your GAKI channel page automatically shows all live destination badges.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="p-5 rounded-xl bg-black/40 border border-white/[0.06] hover:border-white/15 transition-colors"
                >
                  <span className="text-2xl font-black text-red-600 font-mono">
                    {item.step}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-2">{item.title}</h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero local bitrate multiplier · Hardware accelerated WebGL pipeline</span>
              </div>

              <button
                onClick={handleGoLive}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-black rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-red-950"
              >
                <Radio className="w-3.5 h-3.5" />
                Launch Studio & Go Live
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* 8. Netflix Stream Detail Modal (Shows all concurrent platforms & stats) */}
      <StreamDetailModal
        streamer={selectedStreamer}
        isOpen={isModalOpen}
        onClose={handleCloseDetails}
      />
    </div>
  );
};
