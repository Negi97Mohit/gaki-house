import React, { useState } from "react";
import { Link } from "react-router-dom";
import { MobileStoryBar } from "../components/MobileStoryBar";
import { MobileStreamCard } from "../components/MobileStreamCard";
import { MobileCategoryPill } from "../components/MobileCategoryPill";
import { useStreams, useFeaturedStream } from "@/pages/platform/hooks/useStreams";
import { formatViewerCount, PLATFORM_META } from "@/pages/platform/data/mockData";
import { getPlatformIcon } from "@/features/banners/ui/banner/PlatformIcons";
import { cn } from "@/shared/lib/utils";
import { ChevronRight, TrendingUp, Zap } from "lucide-react";

type FeedTab = "foryou" | "following" | "trending";

export const MobileHomePage: React.FC = () => {
    const { data: streams = [], isLoading } = useStreams();
    const { data: featured } = useFeaturedStream();
    const [activeTab, setActiveTab] = useState<FeedTab>("foryou");

    const liveStreams = streams.filter((s) => s.isLive);

    return (
        <div className="min-h-full">
            {/* Story / Live bar */}
            <MobileStoryBar streams={streams} />

            {/* Feed tabs */}
            <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-lg border-b border-border/10">
                <div className="flex items-center gap-1 px-4 py-1.5">
                    {(
                        [
                            { id: "foryou", label: "For You", icon: Zap },
                            { id: "following", label: "Following", icon: null },
                            { id: "trending", label: "Trending", icon: TrendingUp },
                        ] as const
                    ).map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all active:scale-95",
                                activeTab === tab.id
                                    ? "bg-foreground text-background"
                                    : "text-muted-foreground hover:bg-muted/60"
                            )}
                        >
                            <span className="flex items-center gap-1">
                                {tab.icon && <tab.icon className="w-3 h-3" />}
                                {tab.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Loading state */}
            {isLoading && (
                <div className="space-y-4 p-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="aspect-video rounded-xl bg-muted mb-2" />
                            <div className="flex gap-2.5">
                                <div className="w-9 h-9 rounded-full bg-muted shrink-0" />
                                <div className="flex-1 space-y-1.5">
                                    <div className="h-3 bg-muted rounded w-3/4" />
                                    <div className="h-2.5 bg-muted rounded w-1/2" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!isLoading && (
                <div className="px-3 pt-2 space-y-5">
                    {/* Featured hero card */}
                    {featured && activeTab === "foryou" && (
                        <Link
                            to={`/m/stream/${featured.username}`}
                            className="block relative rounded-2xl overflow-hidden active:scale-[0.98] transition-transform"
                        >
                            <img
                                src={featured.thumbnail}
                                alt={featured.title}
                                className="w-full aspect-[16/9] object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <img src={featured.avatar} alt="" className="w-8 h-8 rounded-full bg-muted border border-white/20" />
                                    <div>
                                        <p className="text-white text-sm font-bold flex items-center gap-1.5">
                                            {featured.displayName}
                                            <span className="px-1.5 py-0.5 bg-destructive text-destructive-foreground text-[8px] font-bold uppercase rounded">
                                                Live
                                            </span>
                                        </p>
                                        <p className="text-white/60 text-[11px]">{formatViewerCount(featured.viewers)} watching</p>
                                    </div>
                                </div>
                                <p className="text-white text-[13px] font-semibold line-clamp-1">{featured.title}</p>
                                <div className="flex gap-1.5 mt-1.5">
                                    {featured.tags.slice(0, 3).map((tag) => (
                                        <span key={tag} className="px-2 py-0.5 bg-white/10 text-white/70 text-[9px] rounded-full font-medium">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </Link>
                    )}

                    {/* Category chips row */}
                    {activeTab === "foryou" && (
                        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
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
                    <div className="space-y-4 pb-4">
                        {liveStreams.map((stream) => (
                            <MobileStreamCard key={stream.id} channel={stream} />
                        ))}

                        {liveStreams.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <Zap className="w-10 h-10 text-muted-foreground/40 mb-3" />
                                <p className="text-sm font-semibold text-foreground">No streams right now</p>
                                <p className="text-xs text-muted-foreground mt-1">Check back later for live content</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
