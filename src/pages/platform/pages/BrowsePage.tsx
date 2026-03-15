import React, { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { MOCK_CATEGORIES, PLATFORM_META, PlatformType, PLATFORM_CATEGORY_LABELS } from "../data/mockData";
import { useStreams } from "../hooks/useStreams";
import { getPlatformIcon } from "@/features/banners/ui/banner/PlatformIcons";
import { CategoryCard } from "../components/CategoryCard";
import { StreamCardHover } from "../components/StreamCardHover";
import { cn } from "@/shared/lib/utils";
import { useThemeStore, type PlatformLayout } from "@/features/theme";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";

const getBrowseStreamGrid = (layout: PlatformLayout) => {
  switch (layout) {
    case "compact":
      return "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3";
    case "cozy":
      return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6";
    case "theater":
      return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4";
    case "magazine":
      return "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 auto-rows-[220px]";
    case "cinematic":
      return "flex flex-col gap-6 max-w-5xl mx-auto";
    case "mosaic":
      return "columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-3";
    case "feed":
      return "flex flex-col items-center gap-6 max-w-3xl mx-auto";
    default:
      return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5";
  }
};

const ALL_TAGS = [
  "All", "IRL", "Shooter", "FPS", "MOBA", "Action", "Sandbox", "Adventure",
  "Battle Royale", "Tactical", "Creative", "Food", "Casual",
  "Fitness", "Talk Show", "Educational", "Sports", "Entertainment",
  "Relaxation", "Tech",
];

const ALL_PLATFORMS: PlatformType[] = [
  "youtube", "twitch", "facebook", "tiktok", "instagram", "x", "linkedin",
  "kick", "rumble", "dlive", "trovo", "bilibili", "nimotv",
  "vimeo", "vk", "mixcloud", "brightcove", "jwplayer", "kaltura", "ibm", "wowza", "mux", "aws",
  "owncast", "peertube", "nginx", "wowzaserver", "antmedia", "red5", "mediasoup",
];

const PLATFORM_FILTER_GROUPS = [
  { key: "all" as const, label: "All" },
  { key: "major" as const, label: "Popular" },
  { key: "gaming" as const, label: "Gaming" },
  { key: "professional" as const, label: "Pro" },
  { key: "selfhosted" as const, label: "Self-Hosted" },
];

const PLATFORMS_BY_GROUP: Record<string, PlatformType[]> = {
  major: ["youtube", "twitch", "facebook", "tiktok", "instagram", "x", "linkedin"],
  gaming: ["kick", "rumble", "dlive", "trovo", "bilibili", "nimotv"],
  professional: ["vimeo", "vk", "mixcloud", "brightcove", "jwplayer", "kaltura", "ibm", "wowza", "mux", "aws"],
  selfhosted: ["owncast", "peertube", "nginx", "wowzaserver", "antmedia", "red5", "mediasoup"],
};

type FilterSelection = "all" | "major" | "gaming" | "professional" | "selfhosted" | PlatformType;

// ── Horizontal scroll container with arrows ──
const HorizontalScroll: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
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
    <div className={cn("relative group/scroll", className)}>
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
        {children}
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

// ── Minimal filter pill row ──
const FilterPills: React.FC<{
  items: string[];
  selected: string;
  onSelect: (v: string) => void;
}> = ({ items, selected, onSelect }) => (
  <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
    {items.map((item) => (
      <button
        key={item}
        onClick={() => onSelect(item)}
        className={cn(
          "px-4 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-all shrink-0",
          selected === item
            ? "bg-primary text-primary-foreground shadow-sm"
            : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        {item}
      </button>
    ))}
  </div>
);

export const BrowsePage: React.FC = () => {
  const { category } = useParams();
  const [selectedTag, setSelectedTag] = useState("All");
  const [selectedFilter, setSelectedFilter] = useState<FilterSelection>("all");
  const [showPlatforms, setShowPlatforms] = useState(false);
  const { data: MOCK_CHANNELS = [] } = useStreams();
  const platformLayout = useThemeStore((s) => s.platformLayout);
  const streamGrid = getBrowseStreamGrid(platformLayout);

  const getFilteredPlatforms = (): PlatformType[] | null => {
    if (selectedFilter === "all") return null;
    if (PLATFORMS_BY_GROUP[selectedFilter]) return PLATFORMS_BY_GROUP[selectedFilter];
    return [selectedFilter as PlatformType];
  };

  const filterByPlatform = (channels: typeof MOCK_CHANNELS) => {
    const platforms = getFilteredPlatforms();
    if (!platforms) return channels;
    return channels.filter((c) => c.platform && platforms.includes(c.platform));
  };

  // ── Category detail view ──
  if (category) {
    const cat = MOCK_CATEGORIES.find((c) => c.slug === category);
    let streams = MOCK_CHANNELS.filter((c) => c.categorySlug === category);
    streams = filterByPlatform(streams);
    const filteredStreams =
      selectedTag === "All"
        ? streams
        : streams.filter((s) => s.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase()));
    const streamTags = ["All", ...new Set(MOCK_CHANNELS.filter((c) => c.categorySlug === category).flatMap((s) => s.tags))];

    return (
      <div className="p-6 lg:p-8 pb-16 max-w-[1800px] mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">{cat?.name || category}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {filteredStreams.length} channels streaming
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3">
            <FilterPills items={PLATFORM_FILTER_GROUPS.map(g => g.label)} selected={PLATFORM_FILTER_GROUPS.find(g => g.key === selectedFilter)?.label || "All"} onSelect={(label) => {
              const group = PLATFORM_FILTER_GROUPS.find(g => g.label === label);
              if (group) { setSelectedFilter(group.key); setShowPlatforms(false); }
            }} />
            <button
              onClick={() => setShowPlatforms(!showPlatforms)}
              className={cn(
                "p-2 rounded-lg transition-colors shrink-0",
                showPlatforms ? "bg-primary/10 text-primary" : "bg-muted/60 text-muted-foreground hover:text-foreground"
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>

          {showPlatforms && <PlatformChips selectedFilter={selectedFilter} onSelect={setSelectedFilter} />}

          <FilterPills items={streamTags} selected={selectedTag} onSelect={setSelectedTag} />
        </div>

        <div className={streamGrid}>
          {filteredStreams.map((ch, i) => (
            <StreamCardHover key={ch.id} channel={ch} layout={platformLayout} featured={platformLayout === "magazine" && i === 0} />
          ))}
        </div>
        {filteredStreams.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <p className="text-sm">No streams found</p>
          </div>
        )}
      </div>
    );
  }

  // ── Default browse view ──
  const filteredCategories =
    selectedTag === "All"
      ? MOCK_CATEGORIES
      : MOCK_CATEGORIES.filter((c) => c.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase()));

  const liveChannels = filterByPlatform(MOCK_CHANNELS.filter((c) => c.isLive));

  return (
    <div className="p-6 lg:p-8 pb-16 max-w-[1800px] mx-auto space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Browse</h1>
        <p className="text-muted-foreground text-sm mt-1">Discover live channels and categories</p>
      </div>

      {/* Platform filters — horizontal scroll */}
      <div className="space-y-3">
        <HorizontalScroll>
          <button
            onClick={() => setSelectedFilter("all")}
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-all shrink-0",
              selectedFilter === "all"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            All
          </button>
          {ALL_PLATFORMS.map((p) => {
            const meta = PLATFORM_META[p];
            const PIcon = getPlatformIcon(p);
            const isActive = selectedFilter === p;
            return (
              <button
                key={p}
                onClick={() => setSelectedFilter(p)}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 border",
                  isActive
                    ? "text-white border-transparent shadow-sm"
                    : "bg-muted/60 text-muted-foreground hover:text-foreground border-transparent hover:bg-muted"
                )}
                style={isActive ? { backgroundColor: meta.color, color: meta.textColor } : undefined}
              >
                <PIcon className="w-3.5 h-3.5" style={{ color: isActive ? meta.textColor : meta.color }} />
                {meta.label}
              </button>
            );
          })}
        </HorizontalScroll>

        <FilterPills items={ALL_TAGS} selected={selectedTag} onSelect={setSelectedTag} />
      </div>

      {/* Top Categories — Horizontal Scroll */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Top Categories</h2>
          <span className="text-xs text-muted-foreground">{filteredCategories.length} categories</span>
        </div>
        <HorizontalScroll>
          {filteredCategories.map((cat) => (
            <div key={cat.id} className="shrink-0 w-[140px] sm:w-[160px]">
              <CategoryCard category={cat} />
            </div>
          ))}
          {filteredCategories.length === 0 && (
            <p className="text-muted-foreground text-sm py-8 w-full text-center">No categories found</p>
          )}
        </HorizontalScroll>
      </section>

      {/* Live Channels */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            {selectedFilter === "all"
              ? "Live Now"
              : PLATFORM_META[selectedFilter as PlatformType]
                ? `${PLATFORM_META[selectedFilter as PlatformType].label} — Live`
                : `${PLATFORM_CATEGORY_LABELS[selectedFilter] || selectedFilter} — Live`}
          </h2>
          <span className="text-xs text-muted-foreground">{liveChannels.length} streams</span>
        </div>
        <div className={streamGrid}>
          {liveChannels.map((ch, i) => (
            <StreamCardHover key={ch.id} channel={ch} layout={platformLayout} featured={platformLayout === "magazine" && i === 0} />
          ))}
        </div>
        {liveChannels.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <p className="text-sm">No live channels</p>
          </div>
        )}
      </section>
    </div>
  );
};

// ── Platform chips panel ──
const PlatformChips: React.FC<{ selectedFilter: FilterSelection; onSelect: (f: FilterSelection) => void }> = ({ selectedFilter, onSelect }) => (
  <div className="flex flex-wrap gap-1.5 p-3 bg-muted/30 rounded-xl border border-border/40">
    {ALL_PLATFORMS.map((p) => {
      const meta = PLATFORM_META[p];
      const PIcon = getPlatformIcon(p);
      const isActive = selectedFilter === p;
      return (
        <button
          key={p}
          onClick={() => onSelect(p)}
          className={cn(
            "px-2.5 py-1 text-[11px] font-medium rounded-full whitespace-nowrap transition-all shrink-0 flex items-center gap-1 border",
            isActive
              ? "text-white border-transparent shadow-sm"
              : "bg-background text-muted-foreground hover:text-foreground border-border/40 hover:border-border"
          )}
          style={isActive ? { backgroundColor: meta.color, color: meta.textColor } : undefined}
        >
          <PIcon className="w-3 h-3" style={{ color: isActive ? meta.textColor : meta.color }} />
          {meta.label}
        </button>
      );
    })}
  </div>
);
