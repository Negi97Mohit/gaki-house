import React from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { MOCK_CHANNELS, MOCK_CATEGORIES } from "../data/mockData";
import { StreamCard } from "../components/StreamCard";
import { CategoryCard } from "../components/CategoryCard";

export const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")?.toLowerCase() || "";

  const matchedChannels = query
    ? MOCK_CHANNELS.filter(
        (c) =>
          c.displayName.toLowerCase().includes(query) ||
          c.username.toLowerCase().includes(query) ||
          c.title.toLowerCase().includes(query) ||
          c.category.toLowerCase().includes(query)
      )
    : [];

  const matchedCategories = query
    ? MOCK_CATEGORIES.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.tags.some((t) => t.toLowerCase().includes(query))
      )
    : [];

  const hasResults = matchedChannels.length > 0 || matchedCategories.length > 0;

  return (
    <div className="p-6 pb-12">
      <div className="flex items-center gap-3 mb-6">
        <Search className="w-5 h-5 text-muted-foreground" />
        <h1 className="text-2xl font-bold text-foreground">
          {query ? `Results for "${searchParams.get("q")}"` : "Search"}
        </h1>
      </div>

      {!query && (
        <p className="text-muted-foreground text-sm">
          Type something in the search bar to find channels and categories.
        </p>
      )}

      {query && !hasResults && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="w-12 h-12 text-muted-foreground/40 mb-4" />
          <p className="text-lg font-semibold text-foreground mb-1">No results found</p>
          <p className="text-sm text-muted-foreground">
            Try searching for a different channel, category, or tag.
          </p>
        </div>
      )}

      {matchedCategories.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Categories
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-5">
            {matchedCategories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </section>
      )}

      {matchedChannels.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Live Channels
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {matchedChannels.map((ch) => (
              <StreamCard key={ch.id} channel={ch} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
