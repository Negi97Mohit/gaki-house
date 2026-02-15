import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { MOCK_CATEGORIES, formatViewerCount, PLATFORM_META, PlatformType, PLATFORM_CATEGORY_LABELS } from "../data/mockData";
import { getPlatformIcon } from "@/features/banners/ui/banner/PlatformIcons";
import { StreamCard } from "../components/StreamCard";
import { CategoryCard } from "../components/CategoryCard";
import { SkeletonStreamCard, SkeletonCategoryCard } from "../components/SkeletonStreamCard";
import { useStreams, useFeaturedStream } from "../hooks/useStreams";

// All platforms ordered by category
const PLATFORM_GROUPS: { key: string; label: string; platforms: PlatformType[] }[] = [
  { key: "major", label: "Popular", platforms: ["youtube", "twitch", "facebook", "tiktok", "instagram", "x", "linkedin"] },
  { key: "gaming", label: "Gaming", platforms: ["kick", "rumble", "dlive", "trovo", "bilibili", "nimotv"] },
  { key: "professional", label: "Professional", platforms: ["vimeo", "vk", "mixcloud", "brightcove", "jwplayer", "kaltura", "ibm", "wowza", "mux", "aws"] },
  { key: "selfhosted", label: "Self-Hosted", platforms: ["owncast", "peertube", "nginx", "wowzaserver", "antmedia", "red5", "mediasoup"] },
];

export const HomePage: React.FC = () => {
  const { data: streams = [], isLoading } = useStreams();
  const { data: featured } = useFeaturedStream();
  const loading = isLoading;

  // Group live channels by platform
  const channelsByPlatform: Record<string, typeof streams> = {};
  streams.filter((c) => c.isLive && c.platform).forEach((ch) => {
    const p = ch.platform!;
    if (!channelsByPlatform[p]) channelsByPlatform[p] = [];
    channelsByPlatform[p].push(ch);
  });

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

      {/* Top Categories */}
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

      {/* Live Across Platforms — grouped by category */}
      {PLATFORM_GROUPS.map((group) => {
        const groupHasPlatforms = group.platforms.some((p) => channelsByPlatform[p]?.length);
        if (!groupHasPlatforms) return null;

        return (
          <div key={group.key} className="mt-10">
            {/* Group header */}
            <div className="px-6 mb-2">
              <h2 className="text-base font-bold text-muted-foreground/80 uppercase tracking-wider">
                {group.label} Platforms
              </h2>
            </div>

            {group.platforms.map((platform) => {
              const channels = channelsByPlatform[platform];
              if (!channels || channels.length === 0) return null;
              const meta = PLATFORM_META[platform];
              const PIcon = getPlatformIcon(platform);
              return (
                <section className="px-6 mt-6" key={platform}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                      <span
                        className="inline-flex items-center justify-center w-7 h-7 rounded-md"
                        style={{ backgroundColor: `${meta.color}15`, color: meta.color }}
                      >
                        <PIcon className="w-4.5 h-4.5" style={{ color: meta.color }} />
                      </span>
                      {meta.label}
                      <span className="text-xs font-normal text-muted-foreground ml-1">
                        {channels.length} live
                      </span>
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                    {loading
                      ? Array.from({ length: 2 }).map((_, i) => <SkeletonStreamCard key={i} />)
                      : channels.slice(0, 5).map((ch) => <StreamCard key={ch.id} channel={ch} />)}
                  </div>
                </section>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
