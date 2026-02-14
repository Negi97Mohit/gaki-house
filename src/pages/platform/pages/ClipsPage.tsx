import React, { useState } from "react";
import { Play, Eye, Clock, TrendingUp, Calendar } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { formatViewerCount } from "../data/mockData";

type TabType = "clips" | "vods";
type SortType = "trending" | "recent" | "views";

const MOCK_CLIPS = [
  { id: "1", title: "INSANE 1v5 ACE CLUTCH 🔥", streamer: "Classybeef", category: "VALORANT", views: 124500, duration: "0:32", thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=640&h=360&fit=crop", createdAt: "2h ago" },
  { id: "2", title: "funniest moment on stream 😂", streamer: "Amplified", category: "Just Chatting", views: 89200, duration: "0:45", thumbnail: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=640&h=360&fit=crop", createdAt: "5h ago" },
  { id: "3", title: "Tokyo street food adventure", streamer: "Boneclinks", category: "IRL", views: 67800, duration: "1:12", thumbnail: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=640&h=360&fit=crop", createdAt: "8h ago" },
  { id: "4", title: "speedrun world record??", streamer: "TheFreddyMC", category: "Minecraft", views: 45100, duration: "0:58", thumbnail: "https://images.unsplash.com/photo-1587573089734-09cb69c0f2b4?w=640&h=360&fit=crop", createdAt: "12h ago" },
  { id: "5", title: "the craziest play this year", streamer: "CCT_CS2", category: "Counter-Strike 2", views: 234000, duration: "0:28", thumbnail: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=640&h=360&fit=crop", createdAt: "1d ago" },
  { id: "6", title: "drawing request goes wrong 💀", streamer: "FrankDimes", category: "Art", views: 156000, duration: "0:39", thumbnail: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=640&h=360&fit=crop", createdAt: "1d ago" },
  { id: "7", title: "late night deep talk", streamer: "Mando", category: "Just Chatting", views: 32000, duration: "2:15", thumbnail: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=640&h=360&fit=crop", createdAt: "2d ago" },
  { id: "8", title: "rank up reaction 🎉", streamer: "DrChubzDPT", category: "VALORANT", views: 78000, duration: "0:22", thumbnail: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=640&h=360&fit=crop", createdAt: "2d ago" },
];

const MOCK_VODS = [
  { id: "v1", title: "12 Hour Marathon Stream - Day 365 Special", streamer: "TheFreddyMC", category: "Minecraft", views: 12400, duration: "12:34:21", thumbnail: "https://images.unsplash.com/photo-1587573089734-09cb69c0f2b4?w=640&h=360&fit=crop", createdAt: "Yesterday" },
  { id: "v2", title: "Tournament Finals - CCT Season 2", streamer: "CCT_CS2", category: "Counter-Strike 2", views: 89000, duration: "6:12:45", thumbnail: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=640&h=360&fit=crop", createdAt: "2 days ago" },
  { id: "v3", title: "Ranked to Immortal Grind - Day 42", streamer: "DrChubzDPT", category: "VALORANT", views: 5600, duration: "8:45:12", thumbnail: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=640&h=360&fit=crop", createdAt: "2 days ago" },
  { id: "v4", title: "IRL Tokyo Day 5 - Akihabara", streamer: "Boneclinks", category: "IRL", views: 23400, duration: "4:23:08", thumbnail: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=640&h=360&fit=crop", createdAt: "3 days ago" },
  { id: "v5", title: "Art Requests Marathon", streamer: "FrankDimes", category: "Art", views: 45200, duration: "5:17:33", thumbnail: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=640&h=360&fit=crop", createdAt: "4 days ago" },
  { id: "v6", title: "Italian Cooking Night 🍝", streamer: "JohnnyWhatsGoingOn", category: "Cooking", views: 8900, duration: "3:02:15", thumbnail: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=640&h=360&fit=crop", createdAt: "5 days ago" },
];

export const ClipsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("clips");
  const [sort, setSort] = useState<SortType>("trending");

  const items = activeTab === "clips" ? MOCK_CLIPS : MOCK_VODS;

  return (
    <div className="p-6 pb-12">
      <h1 className="text-2xl font-bold text-foreground mb-1">Clips & VODs</h1>
      <p className="text-muted-foreground text-sm mb-6">Top moments and past broadcasts</p>

      {/* Tabs + Sort */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex gap-1 bg-muted/50 rounded-lg p-0.5">
          {(["clips", "vods"] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-1.5 text-sm font-medium rounded-md transition-colors capitalize",
                activeTab === tab
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab === "vods" ? "VODs" : "Clips"}
            </button>
          ))}
        </div>

        <div className="flex gap-1.5">
          {([
            { key: "trending", icon: TrendingUp, label: "Trending" },
            { key: "recent", icon: Calendar, label: "Recent" },
            { key: "views", icon: Eye, label: "Most Viewed" },
          ] as const).map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setSort(key)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                sort === key
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {items.map((item) => (
          <div key={item.id} className="group cursor-pointer">
            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted mb-2">
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              {/* Play overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <Play className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
              </div>
              {/* Duration */}
              <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 text-white text-[11px] font-medium rounded">
                <Clock className="w-3 h-3 inline mr-0.5 -mt-0.5" />
                {item.duration}
              </span>
              {/* Views */}
              <span className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-black/80 text-white text-[11px] font-medium rounded">
                <Eye className="w-3 h-3 inline mr-0.5 -mt-0.5" />
                {formatViewerCount(item.views)}
              </span>
            </div>
            <p className="text-sm text-foreground font-semibold truncate leading-tight">{item.title}</p>
            <p className="text-[13px] text-muted-foreground truncate mt-0.5">{item.streamer}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[12px] text-primary">{item.category}</span>
              <span className="text-[11px] text-muted-foreground">· {item.createdAt}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
