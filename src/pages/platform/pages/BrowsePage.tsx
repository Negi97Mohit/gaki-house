import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { MOCK_CATEGORIES, MOCK_CHANNELS } from "../data/mockData";
import { CategoryCard } from "../components/CategoryCard";
import { StreamCard } from "../components/StreamCard";
import { cn } from "@/shared/lib/utils";

const ALL_TAGS = ["All", "IRL", "Shooter", "FPS", "MOBA", "Action", "Sandbox", "Adventure", "Battle Royale", "Tactical", "Creative", "Food", "Casual"];

export const BrowsePage: React.FC = () => {
  const { category } = useParams();
  const [selectedTag, setSelectedTag] = useState("All");

  // If category slug is present, show streams for that category
  if (category) {
    const cat = MOCK_CATEGORIES.find((c) => c.slug === category);
    const streams = MOCK_CHANNELS.filter((c) => c.categorySlug === category);
    const filteredStreams =
      selectedTag === "All"
        ? streams
        : streams.filter((s) => s.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase()));
    const streamTags = ["All", ...new Set(streams.flatMap((s) => s.tags))];

    return (
      <div className="p-6 pb-12">
        <h1 className="text-2xl font-bold text-foreground mb-1">{cat?.name || category}</h1>
        <p className="text-muted-foreground text-sm mb-5">
          {streams.length} channels streaming
        </p>

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

  // Default browse view with category tag filters
  const filteredCategories =
    selectedTag === "All"
      ? MOCK_CATEGORIES
      : MOCK_CATEGORIES.filter((c) => c.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase()));

  return (
    <div className="p-6 pb-12">
      <h1 className="text-2xl font-bold text-foreground mb-1">Browse</h1>
      <p className="text-muted-foreground text-sm mb-5">Explore top categories and live channels</p>

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
    </div>
  );
};
