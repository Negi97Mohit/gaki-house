import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { MOCK_CATEGORIES, MOCK_CHANNELS, PLATFORM_META, PlatformType } from "../data/mockData";
import { getPlatformIcon } from "@/features/banners/ui/banner/PlatformIcons";
import { CategoryCard } from "../components/CategoryCard";
import { StreamCard } from "../components/StreamCard";
import { cn } from "@/shared/lib/utils";

const ALL_TAGS = [
  "All", "IRL", "Shooter", "FPS", "MOBA", "Action", "Sandbox", "Adventure",
  "Battle Royale", "Tactical", "Creative", "Food", "Casual",
  "Fitness", "Talk Show", "Educational", "Sports", "Entertainment",
  "Relaxation", "Tech",
];

const PLATFORM_FILTERS: { key: "all" | PlatformType; label: string }[] = [
  { key: "all", label: "All Platforms" },
  { key: "youtube", label: "YouTube" },
  { key: "twitch", label: "Twitch" },
  { key: "kick", label: "Kick" },
  { key: "rumble", label: "Rumble" },
  { key: "facebook", label: "Facebook" },
  { key: "x", label: "X" },
];

export const BrowsePage: React.FC = () => {
  const { category } = useParams();
  const [selectedTag, setSelectedTag] = useState("All");
  const [selectedPlatform, setSelectedPlatform] = useState<"all" | PlatformType>("all");

  // If category slug is present, show streams for that category
  if (category) {
    const cat = MOCK_CATEGORIES.find((c) => c.slug === category);
    let streams = MOCK_CHANNELS.filter((c) => c.categorySlug === category);

    // Apply platform filter
    if (selectedPlatform !== "all") {
      streams = streams.filter((s) => s.platform === selectedPlatform);
    }

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

        {/* Platform filters */}
        <div className="flex gap-1.5 mb-3 overflow-x-auto pb-2 scrollbar-thin">
          {PLATFORM_FILTERS.map((pf) => {
            const meta = pf.key !== "all" ? PLATFORM_META[pf.key] : null;
            const PIcon = pf.key !== "all" ? getPlatformIcon(pf.key) : null;
            return (
              <button
                key={pf.key}
                onClick={() => setSelectedPlatform(pf.key)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors shrink-0 flex items-center gap-1",
                  selectedPlatform === pf.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {PIcon && meta && (
                  <PIcon
                    className="w-3 h-3"
                    style={{ color: selectedPlatform === pf.key ? 'currentColor' : meta.color }}
                  />
                )}
                {pf.label}
              </button>
            );
          })}
        </div>

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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {filteredStreams.map((ch) => (
            <StreamCard key={ch.id} channel={ch} />
          ))}
        </div>
        {filteredStreams.length === 0 && (
          <p className="text-muted-foreground text-sm text-center py-12">No streams found for this filter.</p>
        )}
      </div>
    );
  }

  // Default browse view with category tag filters + platform filter
  let filteredCategories =
    selectedTag === "All"
      ? MOCK_CATEGORIES
      : MOCK_CATEGORIES.filter((c) => c.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase()));

  return (
    <div className="p-6 pb-12">
      <h1 className="text-2xl font-bold text-foreground mb-1">Browse</h1>
      <p className="text-muted-foreground text-sm mb-5">Explore top categories and live channels</p>

      {/* Platform filter */}
      <div className="flex gap-1.5 mb-3 overflow-x-auto pb-2 scrollbar-thin">
        {PLATFORM_FILTERS.map((pf) => {
          const meta = pf.key !== "all" ? PLATFORM_META[pf.key] : null;
          const PIcon = pf.key !== "all" ? getPlatformIcon(pf.key) : null;
          return (
            <button
              key={pf.key}
              onClick={() => setSelectedPlatform(pf.key)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors shrink-0 flex items-center gap-1",
                selectedPlatform === pf.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {PIcon && meta && (
                <PIcon
                  className="w-3 h-3"
                  style={{ color: selectedPlatform === pf.key ? 'currentColor' : meta.color }}
                />
              )}
              {pf.label}
            </button>
          );
        })}
      </div>

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

      {/* Live channels by selected platform */}
      <section className="mt-10">
        <h2 className="text-lg font-bold text-foreground mb-4">
          {selectedPlatform === "all" ? "All Live Channels" : `${PLATFORM_META[selectedPlatform].label} — Live Now`}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {MOCK_CHANNELS
            .filter((c) => c.isLive && (selectedPlatform === "all" || c.platform === selectedPlatform))
            .map((ch) => (
              <StreamCard key={ch.id} channel={ch} />
            ))}
        </div>
      </section>
    </div>
  );
};
