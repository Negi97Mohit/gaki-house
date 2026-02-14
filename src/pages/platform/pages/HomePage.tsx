import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { MOCK_CHANNELS, MOCK_CATEGORIES, FEATURED_STREAM, formatViewerCount } from "../data/mockData";
import { StreamCard } from "../components/StreamCard";
import { CategoryCard } from "../components/CategoryCard";
import { SkeletonStreamCard, SkeletonCategoryCard } from "../components/SkeletonStreamCard";

export const HomePage: React.FC = () => {
  const featured = FEATURED_STREAM;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="pb-12">
      {/* Hero / Featured Stream */}
      {loading ? (
        <div className="w-full aspect-[21/9] max-h-[400px] bg-muted animate-pulse" />
      ) : (
        <Link
          to={`/platform/stream/${featured.username}`}
          className="block relative w-full aspect-[21/9] max-h-[400px] overflow-hidden group"
        >
          <img
            src={featured.thumbnail}
            alt={featured.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 md:p-8 max-w-2xl">
            <div className="flex items-center gap-3 mb-3">
              <img src={featured.avatar} alt="" className="w-10 h-10 rounded-full bg-muted" />
              <div>
                <p className="text-foreground font-bold text-lg leading-tight flex items-center gap-2">
                  {featured.displayName}
                  <span className="px-1.5 py-0.5 bg-destructive text-destructive-foreground text-[10px] font-bold uppercase rounded">
                    Live
                  </span>
                </p>
                <p className="text-muted-foreground text-sm">
                  {formatViewerCount(featured.viewers)} watching
                </p>
              </div>
            </div>
            <p className="text-foreground text-base font-medium mb-2">{featured.title}</p>
            <p className="text-muted-foreground text-sm">{featured.category}</p>
            <div className="flex gap-1.5 mt-2">
              {featured.tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </Link>
      )}

      {/* Top Categories */}
      <section className="px-6 mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Top Live Categories</h2>
          <Link
            to="/platform/browse"
            className="text-primary text-sm font-medium flex items-center gap-0.5 hover:underline"
          >
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCategoryCard key={i} />)
            : MOCK_CATEGORIES.slice(0, 8).map((cat) => (
                <CategoryCard key={cat.id} category={cat} />
              ))}
        </div>
      </section>

      {/* Live Channels - Just Chatting */}
      <section className="px-6 mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Just Chatting</h2>
          <Link
            to="/platform/browse/just-chatting"
            className="text-primary text-sm font-medium flex items-center gap-0.5 hover:underline"
          >
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonStreamCard key={i} />)
            : MOCK_CHANNELS.filter((c) => c.categorySlug === "just-chatting")
                .slice(0, 5)
                .map((ch) => <StreamCard key={ch.id} channel={ch} />)}
        </div>
      </section>

      {/* Live Channels - Recommended */}
      <section className="px-6 mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Recommended Live Channels</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {loading
            ? Array.from({ length: 10 }).map((_, i) => <SkeletonStreamCard key={i} />)
            : MOCK_CHANNELS.slice(0, 10).map((ch) => <StreamCard key={ch.id} channel={ch} />)}
        </div>
      </section>
    </div>
  );
};
