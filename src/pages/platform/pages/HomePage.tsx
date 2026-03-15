import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Radio, Sparkles, TrendingUp } from "lucide-react";
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
import { cn } from "@/shared/lib/utils";

const getStreamGridClasses = (layout: PlatformLayout) => {
  switch (layout) {
    case "compact":
      return "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3";
    case "cozy":
      return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6";
    case "theater":
      return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4";
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
    case "theater":
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

export const HomePage: React.FC = () => {
  const { data: streams = [], isLoading } = useStreams();
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();
  const requestGoLive = useGoLiveStore((s) => s.requestGoLive);

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
    <div className="pb-12">
      {/* Hero: Live Stream Carousel */}
      <LiveStreamCarousel streams={streams} isLoading={isLoading} />

      {/* Go Live CTA Banner */}
      <section className="px-6 mt-6">
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
      <section className="px-6 mt-8">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {isLoading
            ? Array.from({ length: 10 }).map((_, i) => <SkeletonStreamCard key={i} />)
            : liveStreams.slice(0, 10).map((ch) => (
              <StreamCardHover key={ch.id} channel={ch} />
            ))}
        </div>
      </section>

      {/* Top Categories */}
      <section className="px-6 mt-10">
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
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-4">
          {isLoading
            ? Array.from({ length: 10 }).map((_, i) => <SkeletonCategoryCard key={i} />)
            : MOCK_CATEGORIES.slice(0, 16).map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
        </div>
      </section>

      {/* Platform-Specific Live Sections */}
      {PLATFORM_SECTIONS.map((platform) => {
        const channels = channelsByPlatform[platform.id] || [];
        if (channels.length === 0) return null;

        const PIcon = getPlatformIcon(platform.id);

        return (
          <section className="px-6 mt-10" key={platform.id}>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {channels.slice(0, 10).map((ch) => (
                <StreamCardHover key={ch.id} channel={ch} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};
