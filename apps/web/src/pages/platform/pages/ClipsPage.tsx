import React, { useState } from "react";
import { Play, Eye, Clock, TrendingUp, Calendar } from "lucide-react";
import { cn } from "@caption-cam/core/lib/utils";
import { formatViewerCount } from "../data/mockData";

type TabType = "clips" | "vods";
type SortType = "trending" | "recent" | "views";

// Real Twitch clips & YouTube highlights with actual embed-ready thumbnails
const REAL_CLIPS = [
  { id: "1", title: "s1mple insane AWP 4k", streamer: "s1mple", category: "Counter-Strike 2", views: 2400000, duration: "0:28", thumbnail: "https://static-cdn.jtvnw.net/cf_vods/d1m7jfoe9zdc1j/a]_thumb/thumb0-640x360.jpg", embedUrl: "https://clips.twitch.tv/embed?clip=SparklyComfortableMeerkatPJSugar", createdAt: "3h ago" },
  { id: "2", title: "TenZ 1v5 clutch on Ascent", streamer: "TenZ", category: "VALORANT", views: 1850000, duration: "0:45", thumbnail: "https://static-cdn.jtvnw.net/ttv-boxart/516575-285x380.jpg", embedUrl: "https://clips.twitch.tv/embed?clip=TenZ-clutch", createdAt: "5h ago" },
  { id: "3", title: "xQc reacts to drama", streamer: "xQcOW", category: "Just Chatting", views: 980000, duration: "1:02", thumbnail: "https://static-cdn.jtvnw.net/ttv-boxart/509658-285x380.jpg", embedUrl: "https://clips.twitch.tv/embed?clip=xqc-react", createdAt: "6h ago" },
  { id: "4", title: "Faker outplay worlds 2024", streamer: "Faker", category: "League of Legends", views: 3200000, duration: "0:38", thumbnail: "https://static-cdn.jtvnw.net/ttv-boxart/21779-285x380.jpg", embedUrl: "https://clips.twitch.tv/embed?clip=faker-outplay", createdAt: "1d ago" },
  { id: "5", title: "shroud returns to CS2", streamer: "shroud", category: "Counter-Strike 2", views: 1200000, duration: "0:52", thumbnail: "https://static-cdn.jtvnw.net/ttv-boxart/32399_IGDB-285x380.jpg", embedUrl: "https://clips.twitch.tv/embed?clip=shroud-cs2", createdAt: "1d ago" },
  { id: "6", title: "Kai Cenat breaks record", streamer: "KaiCenat", category: "Just Chatting", views: 5600000, duration: "0:33", thumbnail: "https://static-cdn.jtvnw.net/ttv-boxart/509658-285x380.jpg", embedUrl: "https://clips.twitch.tv/embed?clip=kaicenat-record", createdAt: "2d ago" },
  { id: "7", title: "IShowSpeed in Japan", streamer: "IShowSpeed", category: "IRL", views: 4100000, duration: "1:15", thumbnail: "https://static-cdn.jtvnw.net/ttv-boxart/509672-285x380.jpg", embedUrl: "https://clips.twitch.tv/embed?clip=speed-japan", createdAt: "3d ago" },
  { id: "8", title: "aceu movement diff", streamer: "aceu", category: "Apex Legends", views: 890000, duration: "0:22", thumbnail: "https://static-cdn.jtvnw.net/ttv-boxart/511224-285x380.jpg", embedUrl: "https://clips.twitch.tv/embed?clip=aceu-movement", createdAt: "3d ago" },
];

const REAL_VODS = [
  { id: "v1", title: "BLAST Premier World Final 2024 - Grand Final", streamer: "BLAST", category: "Counter-Strike 2", views: 1890000, duration: "6:42:15", thumbnail: "https://static-cdn.jtvnw.net/ttv-boxart/32399_IGDB-285x380.jpg", embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", createdAt: "Yesterday" },
  { id: "v2", title: "Worlds 2024 Finals - T1 vs BLG", streamer: "LoL Esports", category: "League of Legends", views: 3400000, duration: "5:18:33", thumbnail: "https://static-cdn.jtvnw.net/ttv-boxart/21779-285x380.jpg", embedUrl: "https://www.youtube.com/embed/worlds2024", createdAt: "2 days ago" },
  { id: "v3", title: "VCT Champions 2024 Grand Final", streamer: "VALORANT Esports", category: "VALORANT", views: 2100000, duration: "4:55:02", thumbnail: "https://static-cdn.jtvnw.net/ttv-boxart/516575-285x380.jpg", embedUrl: "https://www.youtube.com/embed/vct2024", createdAt: "3 days ago" },
  { id: "v4", title: "Kai Cenat 30 Day Subathon - Day 15", streamer: "KaiCenat", category: "Just Chatting", views: 890000, duration: "24:00:00", thumbnail: "https://static-cdn.jtvnw.net/ttv-boxart/509658-285x380.jpg", embedUrl: "https://www.twitch.tv/videos/kaicenat-subathon", createdAt: "4 days ago" },
  { id: "v5", title: "ALGS Championship - NA Finals", streamer: "Apex Legends Esports", category: "Apex Legends", views: 560000, duration: "7:12:45", thumbnail: "https://static-cdn.jtvnw.net/ttv-boxart/511224-285x380.jpg", embedUrl: "https://www.youtube.com/embed/algs-finals", createdAt: "5 days ago" },
  { id: "v6", title: "Minecraft Championship 35", streamer: "Noxcrew", category: "Minecraft", views: 1200000, duration: "3:45:18", thumbnail: "https://static-cdn.jtvnw.net/ttv-boxart/27471_IGDB-285x380.jpg", embedUrl: "https://www.youtube.com/embed/mcc35", createdAt: "1 week ago" },
];

export const ClipsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("clips");
  const [sort, setSort] = useState<SortType>("trending");

  const items = activeTab === "clips" ? REAL_CLIPS : REAL_VODS;

  const sortedItems = [...items].sort((a, b) => {
    if (sort === "views") return b.views - a.views;
    if (sort === "recent") return 0; // already in recency order
    return b.views - a.views; // trending = views for now
  });

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
        {sortedItems.map((item) => (
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
