import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Radio, Sparkles, TrendingUp } from "lucide-react";
import { MOCK_CATEGORIES, formatViewerCount, PLATFORM_META, PlatformType, PLATFORM_CATEGORY_LABELS } from "../data/mockData";
import { getPlatformIcon } from "@/features/banners/ui/banner/PlatformIcons";
import { StreamCardHover } from "../components/StreamCardHover";
import { isEmbeddablePlatform } from "../components/StreamPlayer";
import { CategoryCard } from "../components/CategoryCard";
import { SkeletonStreamCard, SkeletonCategoryCard } from "../components/SkeletonStreamCard";
import { LiveStreamCarousel } from "../components/LiveStreamCarousel";
import { useStreams } from "../hooks/useStreams";
import { useAuth } from "../context/AuthContext";
import { useGoLiveStore } from "@/stores/goLive.store";
import { useThemeStore, type PlatformLayout } from "@/features/theme";
import { cn } from "@caption-cam/core/lib/utils";

const getStreamGridClasses = (layout: PlatformLayout) => {
  switch (layout) {
    case "compact":
      return "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2";
    case "cozy":
      return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6";
    case "theater":
      return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4";
    case "magazine":
      return "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-4 auto-rows-[220px]";
    case "cinematic":
      return "flex flex-col gap-6 max-w-5xl mx-auto";
    case "mosaic":
      return "columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-3";
    case "feed":
      return "flex flex-col items-center gap-6 max-w-3xl mx-auto";
    // Streaming-inspired
    case "netflix":
      return "flex gap-3 overflow-x-auto scrollbar-none pb-2 snap-x snap-mandatory";
    case "youtube":
      return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4";
    case "hbo":
      return "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3";
    case "appletv":
      return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8";
    case "disneyplus":
      return "flex gap-4 overflow-x-auto scrollbar-none pb-2 snap-x";
    case "spotify":
      return "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4";
    default:
      return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5";
  }
};

const getCategoryGridClasses = (layout: PlatformLayout) => {
  switch (layout) {
    case "compact":
      return "grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-9 xl:grid-cols-10 gap-3";
    case "cozy":
      return "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5";
    case "feed":
      return "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-2xl mx-auto";
    case "cinematic":
      return "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4";
    case "mosaic":
      return "columns-3 sm:columns-4 md:columns-5 lg:columns-6 xl:columns-8 gap-3";
    case "netflix":
    case "disneyplus":
      return "flex gap-3 overflow-x-auto scrollbar-none pb-2";
    case "hbo":
    case "appletv":
      return "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3";
    case "youtube":
    case "spotify":
      return "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-4";
    default:
      return "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-4";
  }
};

const getStreamCount = (layout: PlatformLayout) => {
  switch (layout) {
    case "compact": return 12;
    case "cozy": return 8;
    case "theater": return 10;
    case "feed": return 6;
    case "cinematic": return 5;
    case "mosaic": return 15;
    case "magazine": return 11;
    case "netflix": return 15;
    case "youtube": return 12;
    case "hbo": return 10;
    case "appletv": return 8;
    case "disneyplus": return 12;
    case "spotify": return 18;
    default: return 10;
  }
};

// All platforms ordered by category
const PLATFORM_SECTIONS: { id: string; label: string; color: string }[] = [
  { id: "twitch", label: "Twitch Live", color: "#9146FF" },
  { id: "youtube", label: "YouTube Live", color: "#FF0000" },
  { id: "kick", label: "Kick Live", color: "#53FC18" },
  { id: "tiktok", label: "TikTok Live", color: "#000000" },
  { id: "facebook", label: "Facebook Live", color: "#1877F2" },
  { id: "rumble", label: "Rumble Live", color: "#85C742" },
  { id: "dlive", label: "DLive", color: "#FFD300" },
  { id: "trovo", label: "Trovo Live", color: "#19D65C" },
];

const StreamGrid: React.FC<{
  streams: any[];
  layout: PlatformLayout;
  gridClasses: string;
  count: number;
  isLoading: boolean;
}> = ({ streams, layout, gridClasses, count, isLoading }) => {
  if (isLoading) {
    return (
      <div className={gridClasses}>
        {Array.from({ length: count }).map((_, i) => <SkeletonStreamCard key={i} />)}
      </div>
    );
  }

  const items = streams.slice(0, count);

  return (
    <div className={gridClasses}>
      {items.map((ch, i) => (
        <StreamCardHover
          key={ch.id}
          channel={ch}
          layout={layout}
          featured={layout === "magazine" && i === 0}
        />
      ))}
    </div>
  );
};

export const HomePage: React.FC = () => {
  const { data: streams = [], isLoading } = useStreams();
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();
  const requestGoLive = useGoLiveStore((s) => s.requestGoLive);
  const platformLayout = useThemeStore((s) => s.platformLayout);
  const streamGridClasses = getStreamGridClasses(platformLayout);
  const categoryGridClasses = getCategoryGridClasses(platformLayout);
  const streamCount = getStreamCount(platformLayout);

  const handleGoLive = () => {
    if (!user) {
      openAuthModal("login");
      return;
    }
    requestGoLive();
    navigate("/");
  };

  // Group live channels by platform
  const channelsByPlatform: Record<string, typeof streams> = {};
  streams.filter((c) => c.isLive && c.platform).forEach((ch) => {
    const p = ch.platform!;
    if (!channelsByPlatform[p]) channelsByPlatform[p] = [];
    channelsByPlatform[p].push(ch);
  });

  const liveStreams = streams.filter(s => s.isLive && isEmbeddablePlatform(s.platform));

  return (
    <div className={cn(
      "pb-12",
      platformLayout === "theater" && "max-w-[1600px] mx-auto",
      platformLayout === "feed" && "max-w-3xl mx-auto",
      platformLayout === "cinematic" && "max-w-[1800px] mx-auto",
      platformLayout === "netflix" && "max-w-[1800px] mx-auto",
      platformLayout === "hbo" && "max-w-[1800px] mx-auto",
      platformLayout === "appletv" && "max-w-[1400px] mx-auto",
    )}>
      {/* Hero: Live Stream Carousel */}
      <LiveStreamCarousel streams={streams} isLoading={isLoading} layout={platformLayout} />

      {/* Go Live CTA Banner */}
      <section className={cn("px-6 mt-6", platformLayout === "feed" && "px-0")}>
        <button
          onClick={handleGoLive}
          className="w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5 border border-primary/20 hover:border-primary/40 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Radio className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-foreground">Start Streaming</p>
              <p className="text-xs text-muted-foreground">Go live on multiple platforms at once</p>
            </div>
          </div>
          <div className="px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-lg group-hover:opacity-90 transition-opacity">
            Go Live
          </div>
        </button>
      </section>

      {/* Trending Now */}
      <section className={cn("px-6 mt-8", platformLayout === "feed" && "px-0")}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Trending Live
          </h2>
          <Link
            to="/platform/browse"
            className="text-primary text-sm font-medium flex items-center gap-0.5 hover:underline"
          >
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <StreamGrid
          streams={liveStreams}
          layout={platformLayout}
          gridClasses={streamGridClasses}
          count={streamCount}
          isLoading={isLoading}
        />
      </section>

      {/* Top Categories — Horizontal Scroll */}
      <section className={cn("px-6 mt-10", platformLayout === "feed" && "px-0")}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Top Categories
          </h2>
          <Link
            to="/platform/browse"
            className="text-primary text-sm font-medium flex items-center gap-0.5 hover:underline"
          >
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <CategoryHorizontalScroll isLoading={isLoading} streamCount={streamCount} />
      </section>

      {/* Platform-Specific Live Sections */}
      {PLATFORM_SECTIONS.map((platform) => {
        const channels = channelsByPlatform[platform.id] || [];
        if (channels.length === 0) return null;

        const PIcon = getPlatformIcon(platform.id);

        return (
          <section className={cn("px-6 mt-10", platformLayout === "feed" && "px-0")} key={platform.id}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span
                  className="inline-flex items-center justify-center w-7 h-7 rounded-lg"
                  style={{ backgroundColor: `${platform.color}15`, color: platform.color }}
                >
                  <PIcon className="w-4.5 h-4.5" style={{ color: platform.color }} />
                </span>
                {platform.label}
                <span className="text-xs font-normal text-muted-foreground ml-1">
                  {channels.length} live
                </span>
              </h3>
            </div>
            <StreamGrid
              streams={channels}
              layout={platformLayout}
              gridClasses={streamGridClasses}
              count={streamCount}
              isLoading={false}
            />
          </section>
        );
      })}
    </div>
  );
};

// ── Horizontal scrollable category row ──
const CategoryHorizontalScroll: React.FC<{ isLoading: boolean; streamCount: number }> = ({ isLoading, streamCount }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 300, behavior: "smooth" });
  };

  return (
    <div className="relative group/scroll">
      {canScrollLeft && (
        <button
          onClick={() => scroll(-1)}
          className="absolute left-0 top-0 bottom-0 z-10 w-10 flex items-center justify-center bg-gradient-to-r from-background via-background/80 to-transparent opacity-0 group-hover/scroll:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
      )}
      <div
        ref={scrollRef}
        onScroll={updateScroll}
        className="flex gap-4 overflow-x-auto scrollbar-none scroll-smooth pb-1"
      >
        {isLoading
          ? Array.from({ length: streamCount }).map((_, i) => (
              <div key={i} className="shrink-0 w-[140px] sm:w-[160px]">
                <SkeletonCategoryCard />
              </div>
            ))
          : MOCK_CATEGORIES.slice(0, 16).map((cat) => (
              <div key={cat.id} className="shrink-0 w-[140px] sm:w-[160px]">
                <CategoryCard category={cat} />
              </div>
            ))}
      </div>
      {canScrollRight && (
        <button
          onClick={() => scroll(1)}
          className="absolute right-0 top-0 bottom-0 z-10 w-10 flex items-center justify-center bg-gradient-to-l from-background via-background/80 to-transparent opacity-0 group-hover/scroll:opacity-100 transition-opacity"
        >
          <ChevronRight className="w-5 h-5 text-foreground" />
        </button>
      )}
    </div>
  );
};
