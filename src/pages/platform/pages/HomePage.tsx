import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { MOCK_CHANNELS, MOCK_CATEGORIES, FEATURED_STREAM, formatViewerCount } from "../data/mockData";
import { StreamCard } from "../components/StreamCard";
import { CategoryCard } from "../components/CategoryCard";

export const HomePage: React.FC = () => {
  const featured = FEATURED_STREAM;

  return (
    <div className="pb-12">
      {/* Hero / Featured Stream */}
      <Link
        to={`/platform/stream/${featured.username}`}
        className="block relative w-full aspect-[21/9] max-h-[400px] overflow-hidden group"
      >
        <img
          src={featured.thumbnail}
          alt={featured.title}
          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e10] via-[#0e0e10]/40 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 md:p-8 max-w-2xl">
          <div className="flex items-center gap-3 mb-3">
            <img src={featured.avatar} alt="" className="w-10 h-10 rounded-full bg-zinc-800" />
            <div>
              <p className="text-white font-bold text-lg leading-tight flex items-center gap-2">
                {featured.displayName}
                <span className="px-1.5 py-0.5 bg-red-600 text-[10px] font-bold uppercase rounded">
                  Live
                </span>
              </p>
              <p className="text-zinc-400 text-sm">
                {formatViewerCount(featured.viewers)} watching
              </p>
            </div>
          </div>
          <p className="text-white text-base font-medium mb-2">{featured.title}</p>
          <p className="text-zinc-400 text-sm">{featured.category}</p>
          <div className="flex gap-1.5 mt-2">
            {featured.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 bg-white/10 text-zinc-300 text-xs rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Link>

      {/* Top Categories */}
      <section className="px-6 mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Top Live Categories</h2>
          <Link
            to="/platform/browse"
            className="text-[#53fc18] text-sm font-medium flex items-center gap-0.5 hover:underline"
          >
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-4">
          {MOCK_CATEGORIES.slice(0, 8).map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      {/* Live Channels - Just Chatting */}
      <section className="px-6 mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Just Chatting</h2>
          <Link
            to="/platform/browse/just-chatting"
            className="text-[#53fc18] text-sm font-medium flex items-center gap-0.5 hover:underline"
          >
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {MOCK_CHANNELS.filter((c) => c.categorySlug === "just-chatting")
            .slice(0, 5)
            .map((ch) => (
              <StreamCard key={ch.id} channel={ch} />
            ))}
        </div>
      </section>

      {/* Live Channels - Recommended */}
      <section className="px-6 mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Recommended Live Channels</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {MOCK_CHANNELS.slice(0, 10).map((ch) => (
            <StreamCard key={ch.id} channel={ch} />
          ))}
        </div>
      </section>
    </div>
  );
};
