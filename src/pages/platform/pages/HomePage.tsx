import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { MOCK_CHANNELS, MOCK_CATEGORIES, FEATURED_STREAM, formatViewerCount, PLATFORM_META, PlatformType } from "../data/mockData";
import { getPlatformIcon } from "@/features/banners/ui/banner/PlatformIcons";
import { StreamCard } from "../components/StreamCard";
import { CategoryCard } from "../components/CategoryCard";
import { SkeletonStreamCard, SkeletonCategoryCard } from "../components/SkeletonStreamCard";

export const HomePage: React.FC = () => {
  const featured = FEATURED_STREAM;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Group live channels by platform
  const platformOrder: PlatformType[] = ["youtube", "twitch", "kick", "rumble", "facebook", "x"];
  const channelsByPlatform = platformOrder
    .map((p) => ({
      platform: p,
      meta: PLATFORM_META[p],
      channels: MOCK_CHANNELS.filter((c) => c.isLive && c.platform === p),
    }))
    .filter((g) => g.channels.length > 0);

  const featuredPlatformInfo = featured.platform ? PLATFORM_META[featured.platform] : null;
  const FeaturedPlatformIcon = featured.platform ? getPlatformIcon(featured.platform) : null;

  return (
    <div className="pb-12">
      {/* Hero / Featured Stream */}
      {loading ? (
        <div className="w-full aspect-[21/9] max-h-[400px] bg-muted animate-pulse" />
      ) : (
        <Link
          to={`/platform/stream/${featured.username}`}
          className="block relative w-full aspect-[21/9] max-h-[400px] overflow-hidden group"
        >
          <img
            src={featured.thumbnail}
            alt={featured.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 md:p-8 max-w-2xl">
            <div className="flex items-center gap-3 mb-3">
              <img src={featured.avatar} alt="" className="w-10 h-10 rounded-full bg-muted" />
              <div>
                <p className="text-foreground font-bold text-lg leading-tight flex items-center gap-2">
                  {featured.displayName}
                  <span className="px-1.5 py-0.5 bg-destructive text-destructive-foreground text-[10px] font-bold uppercase rounded">
                    Live
                  </span>
                  {featuredPlatformInfo && FeaturedPlatformIcon && (
                    <span
                      className="px-1.5 py-0.5 text-[10px] font-bold rounded flex items-center gap-1"
                      style={{ backgroundColor: featuredPlatformInfo.color, color: featuredPlatformInfo.textColor }}
                    >
                      <FeaturedPlatformIcon className="w-3 h-3" style={{ color: featuredPlatformInfo.textColor }} />
                      {featuredPlatformInfo.label}
                    </span>
                  )}
                </p>
                <p className="text-muted-foreground text-sm">
                  {formatViewerCount(featured.viewers)} watching
                </p>
              </div>
            </div>
            <p className="text-foreground text-base font-medium mb-2">{featured.title}</p>
            <p className="text-muted-foreground text-sm">{featured.category}</p>
            <div className="flex gap-1.5 mt-2">
              {featured.tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </Link>
      )}

      {/* Top Categories — show all */}
      <section className="px-6 mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Top Live Categories</h2>
          <Link
            to="/platform/browse"
            className="text-primary text-sm font-medium flex items-center gap-0.5 hover:underline"
          >
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-4">
          {loading
            ? Array.from({ length: 10 }).map((_, i) => <SkeletonCategoryCard key={i} />)
            : MOCK_CATEGORIES.slice(0, 16).map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
        </div>
      </section>

      {/* Live Across Platforms — one section per platform */}
      {channelsByPlatform.map(({ platform, meta, channels }) => {
        const PIcon = getPlatformIcon(platform);
        return (
          <section className="px-6 mt-10" key={platform}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span
                  className="inline-flex items-center justify-center w-6 h-6 rounded"
                  style={{ color: meta.color }}
                >
                  <PIcon className="w-5 h-5" style={{ color: meta.color }} />
                </span>
                {meta.label}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <SkeletonStreamCard key={i} />)
                : channels.slice(0, 5).map((ch) => <StreamCard key={ch.id} channel={ch} />)}
            </div>
          </section>
        );
      })}

      {/* All Live Channels — Recommended */}
      <section className="px-6 mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Recommended Live Channels</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {loading
            ? Array.from({ length: 10 }).map((_, i) => <SkeletonStreamCard key={i} />)
            : MOCK_CHANNELS.slice(0, 12).map((ch) => <StreamCard key={ch.id} channel={ch} />)}
        </div>
      </section>
    </div>
  );
};
