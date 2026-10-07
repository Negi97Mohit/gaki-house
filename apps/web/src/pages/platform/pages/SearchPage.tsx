import React, { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, Radio, Tv } from "lucide-react";
import { GakiStreamCard } from "../components/GakiStreamCard";
import { StreamDetailModal } from "../components/StreamDetailModal";
import { type GakiStreamer } from "../data/mockData";

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [searchInput, setSearchInput] = useState(query);
  const [streamers] = useState<GakiStreamer[]>([]);
  const [selectedStreamer, setSelectedStreamer] = useState<GakiStreamer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    }
  };

  const filteredStreamers = query.trim()
    ? streamers.filter(
        (s) =>
          s.displayName.toLowerCase().includes(query.toLowerCase()) ||
          s.username.toLowerCase().includes(query.toLowerCase()) ||
          s.streamTitle.toLowerCase().includes(query.toLowerCase()) ||
          s.category.toLowerCase().includes(query.toLowerCase()) ||
          s.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  return (
    <div className="min-h-screen bg-zinc-950 text-white pt-20 px-6 sm:px-12 md:px-16 pb-24 select-none">
      {/* Search Header */}
      <div className="mb-8 pb-6 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Search Results
          </h1>
          {query && (
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Showing results for <span className="text-white font-semibold">"{query}"</span>
            </p>
          )}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search creators, categories..."
            className="w-full bg-white/[0.05] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/25"
          />
        </form>
      </div>

      {filteredStreamers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredStreamers.map((streamer) => (
            <GakiStreamCard
              key={streamer.uid}
              streamer={streamer}
              onOpenDetails={(s) => {
                setSelectedStreamer(s);
                setIsModalOpen(true);
              }}
            />
          ))}
        </div>
      ) : (
        <div className="py-24 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
            <Search className="w-7 h-7 text-zinc-600" />
          </div>

          <h2 className="text-lg font-bold text-white">
            {query ? `No creators found for "${query}"` : "Enter a search query"}
          </h2>
          <p className="text-xs text-zinc-400 mt-1.5 max-w-sm leading-relaxed">
            Try searching for game titles, creator usernames, or categories like "Gaming" or "Music".
          </p>

          <Link
            to="/platform"
            className="mt-6 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-red-950"
          >
            <Tv className="w-4 h-4" />
            Back to Browse
          </Link>
        </div>
      )}

      <StreamDetailModal
        streamer={selectedStreamer}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
