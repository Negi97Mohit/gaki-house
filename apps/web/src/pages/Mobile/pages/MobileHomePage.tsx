import React, { useState } from "react";
import { Link } from "react-router-dom";
import { MobileStoryBar } from "../components/MobileStoryBar";
import { MobileStreamCard } from "../components/MobileStreamCard";
import { MobileCategoryPill } from "../components/MobileCategoryPill";
import {
  useStreams,
  useFeaturedStream,
} from "@/pages/platform/hooks/useStreams";
import { formatViewerCount } from "@/pages/platform/data/mockData";
import { cn } from "@caption-cam/core/lib/utils";
import { TrendingUp, Zap, Radio } from "lucide-react";

type FeedTab = "foryou" | "following" | "trending";

export const MobileHomePage: React.FC = () => {
  const { data: streams = [], isLoading } = useStreams();
  const { data: featured } = useFeaturedStream();
  const [activeTab, setActiveTab] = useState<FeedTab>("foryou");

  const liveStreams = streams.filter((s) => s.isLive);

  return (
    <div className="min-h-full" role="region" aria-label="Home feed">
      {/* Story / Live bar */}
      <MobileStoryBar streams={streams} />

      {/* Feed tabs */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/10">
        <div
          className="flex items-center gap-1.5 px-4 py-2 overflow-x-auto no-scrollbar"
          role="tablist"
          aria-label="Feed filters"
        >
          {([
            { id: "foryou", label: "For You", icon: Zap },
            { id: "following", label: "Following", icon: null },
            { id: "trending", label: "Trending", icon: TrendingUp },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              aria-selected={activeTab === tab.id}
              className={cn(
                "px-4 py-2.5 rounded-full text-[12px] font-semibold transition-all active:scale-95 whitespace-nowrap min-h-[44px]",
                activeTab === tab.id
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:bg-muted/60",
              )}
            >
              <span className="flex items-center gap-1.5">
                {tab.icon && <tab.icon className="w-3.5 h-3.5" aria-hidden="true" />}
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Loading state with shimmer */}
      {isLoading && (
        <div className="space-y-5 p-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <div className="aspect-video rounded-2xl mobile-skeleton mb-3" />
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full mobile-skeleton shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 mobile-skeleton rounded w-3/4" />
                  <div className="h-3 mobile-skeleton rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && (
        <div className="px-4 pt-3 space-y-5">
          {/* Featured hero card */}
          {featured && activeTab === "foryou" && (
            <Link
              to={`/m/stream/${featured.username}`}
              className="block relative rounded-2xl overflow-hidden mobile-card shadow-lg shadow-black/10"
              aria-label={`Featured: ${featured.title} by ${featured.displayName}`}
            >
              <img
                src={featured.thumbnail}
                alt=""
                className="w-full aspect-[16/9] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" aria-hidden="true" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-center gap-2.5 mb-2">
                  <img
                    src={featured.avatar}
                    alt=""
                    className="w-9 h-9 rounded-full bg-muted border-2 border-white/20 object-cover"
                  />
                  <div>
                    <p className="text-white text-sm font-bold flex items-center gap-2">
                      {featured.displayName}
                      <span className="px-2 py-0.5 bg-destructive text-destructive-foreground text-[9px] font-bold uppercase rounded-md flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-white animate-pulse" aria-hidden="true" />
                        Live
                      </span>
                    </p>
                    <p className="text-white/60 text-[11px]">
                      {formatViewerCount(featured.viewers)} watching
                    </p>
                  </div>
                </div>
                <p className="text-white text-[14px] font-semibold line-clamp-1">
                  {featured.title}
                </p>
                <div className="flex gap-1.5 mt-2">
                  {featured.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-white/10 text-white/70 text-[10px] rounded-full font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          )}

          {/* Category chips row */}
          {activeTab === "foryou" && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1" role="tablist" aria-label="Categories">
              <MobileCategoryPill label="All" active />
              <MobileCategoryPill label="Gaming" />
              <MobileCategoryPill label="IRL" />
              <MobileCategoryPill label="Music" />
              <MobileCategoryPill label="Creative" />
              <MobileCategoryPill label="Esports" />
              <MobileCategoryPill label="Tech" />
            </div>
          )}

          {/* Stream cards */}
          <div className="space-y-5 pb-6">
            {liveStreams.map((stream) => (
              <MobileStreamCard key={stream.id} channel={stream} />
            ))}

            {liveStreams.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                  <Radio className="w-7 h-7 text-muted-foreground/40" aria-hidden="true" />
                </div>
                <p className="text-base font-bold text-foreground">
                  No streams right now
                </p>
                <p className="text-sm text-muted-foreground mt-1.5 max-w-[240px]">
                  Check back later for live content or be the first to go live!
                </p>
                <Link
                  to="/m/studio"
                  className="mt-4 px-6 py-3 bg-primary text-primary-foreground font-bold text-sm rounded-full active:scale-95 transition-transform min-h-[44px] flex items-center"
                >
                  Go Live
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
