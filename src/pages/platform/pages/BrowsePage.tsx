import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { MOCK_CATEGORIES, PLATFORM_META, PlatformType, PLATFORM_CATEGORY_LABELS } from "../data/mockData";
import { useStreams } from "../hooks/useStreams";
import { getPlatformIcon } from "@/features/banners/ui/banner/PlatformIcons";
import { CategoryCard } from "../components/CategoryCard";
import { StreamCardHover } from "../components/StreamCardHover";
import { cn } from "@/shared/lib/utils";
import { useThemeStore, type PlatformLayout } from "@/features/theme";

const getBrowseStreamGrid = (layout: PlatformLayout) => {
  switch (layout) {
    case "compact":
      return "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2";
    case "cozy":
      return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6";
    case "theater":
      return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4";
    case "magazine":
      return "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 auto-rows-auto";
    case "cinematic":
      return "grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6";
    case "mosaic":
      return "columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-3";
    case "feed":
      return "flex flex-col items-center gap-6 max-w-2xl mx-auto";
    default:
      return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5";
  }
};

const getBrowseCategoryGrid = (layout: PlatformLayout) => {
  switch (layout) {
    case "compact":
      return "grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-9 xl:grid-cols-10 gap-3";
    case "cozy":
      return "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5";
    case "feed":
      return "grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl mx-auto";
    case "cinematic":
      return "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4";
    default:
      return "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-5";
  }
};

const ALL_TAGS = [
  "All", "IRL", "Shooter", "FPS", "MOBA", "Action", "Sandbox", "Adventure",
  "Battle Royale", "Tactical", "Creative", "Food", "Casual",
  "Fitness", "Talk Show", "Educational", "Sports", "Entertainment",
  "Relaxation", "Tech",
];

// All platforms available
const ALL_PLATFORMS: PlatformType[] = [
  // Major
  "youtube", "twitch", "facebook", "tiktok", "instagram", "x", "linkedin",
  // Gaming
  "kick", "rumble", "dlive", "trovo", "bilibili", "nimotv",
  // Professional
  "vimeo", "vk", "mixcloud", "brightcove", "jwplayer", "kaltura", "ibm", "wowza", "mux", "aws",
  // Self-Hosted
  "owncast", "peertube", "nginx", "wowzaserver", "antmedia", "red5", "mediasoup",
];

// Group keys for the filter tabs
const PLATFORM_FILTER_GROUPS = [
  { key: "all" as const, label: "All Platforms" },
  { key: "major" as const, label: "Popular" },
  { key: "gaming" as const, label: "Gaming" },
  { key: "professional" as const, label: "Professional" },
  { key: "selfhosted" as const, label: "Self-Hosted" },
];

const PLATFORMS_BY_GROUP: Record<string, PlatformType[]> = {
  major: ["youtube", "twitch", "facebook", "tiktok", "instagram", "x", "linkedin"],
  gaming: ["kick", "rumble", "dlive", "trovo", "bilibili", "nimotv"],
  professional: ["vimeo", "vk", "mixcloud", "brightcove", "jwplayer", "kaltura", "ibm", "wowza", "mux", "aws"],
  selfhosted: ["owncast", "peertube", "nginx", "wowzaserver", "antmedia", "red5", "mediasoup"],
};

type FilterSelection = "all" | "major" | "gaming" | "professional" | "selfhosted" | PlatformType;

export const BrowsePage: React.FC = () => {
  const { category } = useParams();
  const [selectedTag, setSelectedTag] = useState("All");
  const [selectedFilter, setSelectedFilter] = useState<FilterSelection>("all");
  const [showAllPlatforms, setShowAllPlatforms] = useState(false);
  const { data: MOCK_CHANNELS = [] } = useStreams();
  const platformLayout = useThemeStore((s) => s.platformLayout);
  const streamGrid = getBrowseStreamGrid(platformLayout);
  const categoryGrid = getBrowseCategoryGrid(platformLayout);

  // Determine which platforms match the filter
  const getFilteredPlatforms = (): PlatformType[] | null => {
    if (selectedFilter === "all") return null; // no filtering
    if (PLATFORMS_BY_GROUP[selectedFilter]) return PLATFORMS_BY_GROUP[selectedFilter];
    return [selectedFilter as PlatformType]; // individual platform
  };

  // Filter channels by platform selection
  const filterByPlatform = (channels: typeof MOCK_CHANNELS) => {
    const platforms = getFilteredPlatforms();
    if (!platforms) return channels;
    return channels.filter((c) => c.platform && platforms.includes(c.platform));
  };

  // If category slug is present, show streams for that category
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
      <div className="p-6 pb-12">
        <h1 className="text-2xl font-bold text-foreground mb-1">{cat?.name || category}</h1>
        <p className="text-muted-foreground text-sm mb-5">
          {filteredStreams.length} channels streaming
        </p>

        {/* Platform group filters */}
        <PlatformFilterRow selectedFilter={selectedFilter} onSelect={setSelectedFilter} showAll={showAllPlatforms} onToggle={setShowAllPlatforms} />

        {/* Tag filters */}
        <div className="flex gap-1.5 mb-6 overflow-x-auto pb-2 scrollbar-thin">
          {streamTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors shrink-0",
                selectedTag === tag
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className={streamGrid}>
          {filteredStreams.map((ch, i) => (
            <StreamCardHover key={ch.id} channel={ch} layout={platformLayout} featured={platformLayout === "magazine" && i === 0} />
          ))}
        </div>
        {filteredStreams.length === 0 && (
          <p className="text-muted-foreground text-sm text-center py-12">No streams found for this filter.</p>
        )}
      </div>
    );
  }

  // Default browse view with category tag filters + platform filter
  const filteredCategories =
    selectedTag === "All"
      ? MOCK_CATEGORIES
      : MOCK_CATEGORIES.filter((c) => c.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase()));

  return (
    <div className="p-6 pb-12">
      <h1 className="text-2xl font-bold text-foreground mb-1">Browse</h1>
      <p className="text-muted-foreground text-sm mb-5">Explore top categories and live channels across all platforms</p>

      {/* Platform group filters + individual platform chips */}
      <PlatformFilterRow selectedFilter={selectedFilter} onSelect={setSelectedFilter} showAll={showAllPlatforms} onToggle={setShowAllPlatforms} />

      {/* Tag filters */}
      <div className="flex gap-1.5 mb-6 overflow-x-auto pb-2 scrollbar-thin">
        {ALL_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors shrink-0",
              selectedTag === tag
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-5">
        {filteredCategories.map((cat) => (
          <CategoryCard key={cat.id} category={cat} />
        ))}
      </div>
      {filteredCategories.length === 0 && (
        <p className="text-muted-foreground text-sm text-center py-12">No categories found for this filter.</p>
      )}

      {/* Live channels by selected platform filter */}
      <section className="mt-10">
        <h2 className="text-lg font-bold text-foreground mb-4">
          {selectedFilter === "all"
            ? "All Live Channels"
            : PLATFORM_META[selectedFilter as PlatformType]
              ? `${PLATFORM_META[selectedFilter as PlatformType].label} — Live Now`
              : `${PLATFORM_CATEGORY_LABELS[selectedFilter] || selectedFilter} — Live Now`}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {filterByPlatform(MOCK_CHANNELS.filter((c) => c.isLive)).map((ch) => (
            <StreamCard key={ch.id} channel={ch} />
          ))}
        </div>
      </section>
    </div>
  );
};

// ── Platform filter row component ──
interface PlatformFilterRowProps {
  selectedFilter: FilterSelection;
  onSelect: (f: FilterSelection) => void;
  showAll: boolean;
  onToggle: (v: boolean) => void;
}

const PlatformFilterRow: React.FC<PlatformFilterRowProps> = ({ selectedFilter, onSelect, showAll, onToggle }) => {
  return (
    <div className="mb-3">
      {/* Group tabs (All / Popular / Gaming / Professional / Self-Hosted) */}
      <div className="flex gap-1.5 mb-2 overflow-x-auto pb-1 scrollbar-thin">
        {PLATFORM_FILTER_GROUPS.map((g) => (
          <button
            key={g.key}
            onClick={() => { onSelect(g.key); onToggle(false); }}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-colors shrink-0",
              selectedFilter === g.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {g.label}
          </button>
        ))}
        <button
          onClick={() => onToggle(!showAll)}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors shrink-0 border",
            showAll
              ? "border-primary text-primary bg-primary/10"
              : "border-border text-muted-foreground hover:text-foreground"
          )}
        >
          {showAll ? "Hide Platforms ▲" : "All Platforms ▼"}
        </button>
      </div>

      {/* Individual platform chips (shown when expanded) */}
      {showAll && (
        <div className="flex flex-wrap gap-1.5 mb-2 p-3 bg-muted/40 rounded-lg border border-border/50">
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
                    : "bg-background text-muted-foreground hover:text-foreground border-border/60 hover:border-border"
                )}
                style={isActive ? { backgroundColor: meta.color, color: meta.textColor } : undefined}
              >
                <PIcon
                  className="w-3 h-3"
                  style={{ color: isActive ? meta.textColor : meta.color }}
                />
                {meta.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
