import React, { useState } from "react";
import { MobileReelsCard } from "../components/MobileReelsCard";
import { cn } from "@gaki/core/lib/utils";
import { TrendingUp, Calendar, Eye } from "lucide-react";

type SortType = "trending" | "recent" | "views";

const MOCK_CLIPS = [
    { id: "1", title: "INSANE 1v5 ACE CLUTCH 🔥", streamer: "Classybeef", category: "VALORANT", views: 124500, duration: "0:32", thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=640&h=1136&fit=crop", createdAt: "2h ago" },
    { id: "2", title: "funniest moment on stream 😂", streamer: "Amplified", category: "Just Chatting", views: 89200, duration: "0:45", thumbnail: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=640&h=1136&fit=crop", createdAt: "5h ago" },
    { id: "3", title: "Tokyo street food adventure", streamer: "Boneclinks", category: "IRL", views: 67800, duration: "1:12", thumbnail: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=640&h=1136&fit=crop", createdAt: "8h ago" },
    { id: "4", title: "speedrun world record??", streamer: "TheFreddyMC", category: "Minecraft", views: 45100, duration: "0:58", thumbnail: "https://images.unsplash.com/photo-1587573089734-09cb69c0f2b4?w=640&h=1136&fit=crop", createdAt: "12h ago" },
    { id: "5", title: "the craziest play this year", streamer: "CCT_CS2", category: "Counter-Strike 2", views: 234000, duration: "0:28", thumbnail: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=640&h=1136&fit=crop", createdAt: "1d ago" },
    { id: "6", title: "drawing request goes wrong 💀", streamer: "FrankDimes", category: "Art", views: 156000, duration: "0:39", thumbnail: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=640&h=1136&fit=crop", createdAt: "1d ago" },
    { id: "7", title: "late night deep talk", streamer: "Mando", category: "Just Chatting", views: 32000, duration: "2:15", thumbnail: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=640&h=1136&fit=crop", createdAt: "2d ago" },
    { id: "8", title: "rank up reaction 🎉", streamer: "DrChubzDPT", category: "VALORANT", views: 78000, duration: "0:22", thumbnail: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=640&h=1136&fit=crop", createdAt: "2d ago" },
];

export const MobileClipsPage: React.FC = () => {
    const [sort, setSort] = useState<SortType>("trending");

    return (
        <div className="mobile-clips-feed h-full relative overflow-hidden" role="region" aria-label="Clips feed">
            {/* Sort pills — floating at top */}
            <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-center gap-1.5 py-3 px-3 bg-gradient-to-b from-black/60 to-transparent pointer-events-none mobile-safe-top">
                <div className="flex gap-1.5 pointer-events-auto" role="tablist" aria-label="Sort clips">
                    {([
                        { key: "trending" as const, icon: TrendingUp, label: "Trending" },
                        { key: "recent" as const, icon: Calendar, label: "New" },
                        { key: "views" as const, icon: Eye, label: "Top" },
                    ]).map(({ key, icon: Icon, label }) => (
                        <button
                            key={key}
                            onClick={() => setSort(key)}
                            role="tab"
                            aria-selected={sort === key}
                            className={cn(
                                "flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-semibold transition-all active:scale-95 min-h-[40px]",
                                sort === key
                                    ? "bg-white text-black shadow-md"
                                    : "bg-white/10 backdrop-blur-md text-white/80 border border-white/10"
                            )}
                        >
                            <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Snap-scroll container */}
            <div className="h-full overflow-y-auto snap-y snap-mandatory no-scrollbar">
                {MOCK_CLIPS.map((clip) => (
                    <MobileReelsCard key={clip.id} clip={clip} />
                ))}
            </div>
        </div>
    );
};
