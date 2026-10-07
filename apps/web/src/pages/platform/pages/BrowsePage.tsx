import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Gamepad2, MessageSquare, Trophy, Palette, Music, Cpu, Mic, Radio, Search, Play, ArrowLeft } from "lucide-react";
import { GakiStreamCard } from "../components/GakiStreamCard";
import { StreamDetailModal } from "../components/StreamDetailModal";
import { type GakiStreamer } from "../data/mockData";
import { useAuth } from "../context/AuthContext";
import { useGoLiveStore } from "@/stores/goLive.store";
import { cn } from "@gaki/core/lib/utils";

// Real data hook placeholder
const useGakiStreamers = (): { data: GakiStreamer[]; isLoading: boolean } => {
  return { data: [], isLoading: false };
};

const BROWSE_CATEGORIES = [
  {
    slug: "gaming",
    name: "Gaming",
    icon: Gamepad2,
    gradient: "from-purple-900/60 to-zinc-950",
    accent: "text-purple-400",
    description: "Esports, battle royales, speedruns, and casual play",
  },
  {
    slug: "just-chatting",
    name: "Just Chatting",
    icon: MessageSquare,
    gradient: "from-blue-900/60 to-zinc-950",
    accent: "text-blue-400",
    description: "Talk shows, reaction streams, Q&As, and IRL streams",
  },
  {
    slug: "esports",
    name: "Esports & Tournaments",
    icon: Trophy,
    gradient: "from-amber-900/60 to-zinc-950",
    accent: "text-amber-400",
    description: "Live competitive tournaments and professional leagues",
  },
  {
    slug: "creative",
    name: "Creative & Coding",
    icon: Palette,
    gradient: "from-pink-900/60 to-zinc-950",
    accent: "text-pink-400",
    description: "Software engineering, game dev, 3D modeling, and design",
  },
  {
    slug: "music",
    name: "Music & Performing Arts",
    icon: Music,
    gradient: "from-emerald-900/60 to-zinc-950",
    accent: "text-emerald-400",
    description: "Live DJ sets, instrumentals, jam sessions, and performances",
  },
  {
    slug: "tech",
    name: "Tech & Science",
    icon: Cpu,
    gradient: "from-cyan-900/60 to-zinc-950",
    accent: "text-cyan-400",
    description: "Hardware teardowns, AI benchmarks, and gadgets",
  },
  {
    slug: "podcasts",
    name: "Podcasts & Talks",
    icon: Mic,
    gradient: "from-rose-900/60 to-zinc-950",
    accent: "text-rose-400",
    description: "Long-form interviews, debates, and audio discussions",
  },
];

export const BrowsePage: React.FC = () => {
  const { category: activeCategorySlug } = useParams<{ category?: string }>();
  const { data: streamers, isLoading } = useGakiStreamers();
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();
  const requestGoLive = useGoLiveStore((s) => s.requestGoLive);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStreamer, setSelectedStreamer] = useState<GakiStreamer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleGoLive = () => {
    if (!user) {
      openAuthModal("login");
      return;
    }
    requestGoLive();
    navigate("/");
  };

  const currentCategory = activeCategorySlug
    ? BROWSE_CATEGORIES.find((c) => c.slug === activeCategorySlug)
    : null;

  const filteredCategories = searchQuery
    ? BROWSE_CATEGORIES.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : BROWSE_CATEGORIES;

  // Streamers matching active category
  const categoryStreamers = streamers.filter((s) => {
    if (!activeCategorySlug) return true;
    return (
      s.category.toLowerCase().includes(activeCategorySlug.toLowerCase()) ||
      s.tags.some((t) => t.toLowerCase().includes(activeCategorySlug.toLowerCase()))
    );
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-foreground pt-20 px-6 sm:px-12 md:px-16 pb-24 select-none">
      {/* Category Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/[0.06]">
        <div>
          {activeCategorySlug ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/platform/browse")}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                aria-label="Back to all categories"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {currentCategory ? currentCategory.name : activeCategorySlug}
                </h1>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Live broadcasts in this category
                </p>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Browse Categories
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Explore channels and discover concurrent multi-platform streams
              </p>
            </div>
          )}
        </div>

        {/* Search bar inside Browse */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories..."
            className="w-full bg-white/[0.05] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/25"
          />
        </div>
      </div>

      {/* If viewing a specific category */}
      {activeCategorySlug ? (
        <div>
          {categoryStreamers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categoryStreamers.map((streamer) => (
                <GakiStreamCard
                  key={streamer.uid}
                  streamer={streamer}
                  onOpenDetails={(s) => {
                    setSelectedStreamer(s);
                    setIsModalOpen(true);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                <Radio className="w-6 h-6 text-zinc-500" />
              </div>
              <h2 className="text-lg font-bold text-white">No active streams in this category</h2>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                Be the first creator to go live here and broadcast to Twitch, YouTube, and Kick simultaneously.
              </p>
              <button
                onClick={handleGoLive}
                className="mt-6 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-2"
              >
                <Radio className="w-3.5 h-3.5" />
                Go Live Now
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Categories Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.slug}
                to={`/platform/browse/${cat.slug}`}
                className="group relative aspect-[16/10] rounded-2xl overflow-hidden border border-white/[0.06] hover:border-white/25 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-black"
              >
                {/* Background Gradient */}
                <div className={cn("absolute inset-0 bg-gradient-to-br", cat.gradient)} />
                <div className="absolute inset-0 bg-zinc-950/40 group-hover:bg-zinc-950/20 transition-colors" />

                {/* Content */}
                <div className="absolute inset-0 p-5 flex flex-col justify-between z-10">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className={cn("w-5 h-5", cat.accent)} />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 bg-black/40 px-2 py-0.5 rounded">
                      Explore
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-white tracking-tight group-hover:text-primary transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Stream Detail Modal */}
      <StreamDetailModal
        streamer={selectedStreamer}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
