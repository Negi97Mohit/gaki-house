import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, X, ArrowLeft, TrendingUp } from "lucide-react";
import { MOCK_CATEGORIES, formatViewerCount } from "@/pages/platform/data/mockData";
import { useStreams } from "@/pages/platform/hooks/useStreams";
import { MobileStreamCard } from "../components/MobileStreamCard";
import { cn } from "@caption-cam/core/lib/utils";

const TRENDING_SEARCHES = ["Valorant", "Just Chatting", "Minecraft", "Music", "IRL", "Art"];

export const MobileSearchPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const initialQuery = searchParams.get("q") || "";
    const [query, setQuery] = useState(initialQuery);
    const inputRef = useRef<HTMLInputElement>(null);
    const { data: allStreams = [] } = useStreams();

    const trimmed = query.trim().toLowerCase();

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const matchedChannels = trimmed
        ? allStreams.filter(
            (c) =>
                c.displayName.toLowerCase().includes(trimmed) ||
                c.username.toLowerCase().includes(trimmed) ||
                c.title.toLowerCase().includes(trimmed) ||
                c.category.toLowerCase().includes(trimmed)
        )
        : [];

    const matchedCategories = trimmed
        ? MOCK_CATEGORIES.filter(
            (c) =>
                c.name.toLowerCase().includes(trimmed) ||
                c.tags.some((t) => t.toLowerCase().includes(trimmed))
        )
        : [];

    const hasResults = matchedChannels.length > 0 || matchedCategories.length > 0;

    return (
        <div className="min-h-full" role="search" aria-label="Search page">
            {/* Search header */}
            <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-xl border-b border-border/10 px-3 py-2.5 flex items-center gap-2">
                <button
                    onClick={() => navigate(-1)}
                    className="mobile-icon-btn"
                    aria-label="Go back"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search streams, categories..."
                        className="w-full bg-muted/50 rounded-2xl pl-11 pr-10 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[44px]"
                        aria-label="Search input"
                    />
                    {query && (
                        <button
                            onClick={() => setQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground p-1"
                            aria-label="Clear search"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* No query — show trending */}
            {!trimmed && (
                <div className="px-4 pt-5">
                    <h2 className="flex items-center gap-2 text-sm font-bold text-foreground mb-4">
                        <TrendingUp className="w-4 h-4 text-primary" aria-hidden="true" />
                        Trending Searches
                    </h2>
                    <div className="flex flex-wrap gap-2.5">
                        {TRENDING_SEARCHES.map((s) => (
                            <button
                                key={s}
                                onClick={() => setQuery(s)}
                                className="px-4 py-2.5 bg-muted/50 text-muted-foreground text-[12px] font-medium rounded-full active:scale-95 transition-transform hover:bg-muted min-h-[40px]"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* No results */}
            {trimmed && !hasResults && (
                <div className="flex flex-col items-center justify-center py-24 text-center px-6">
                    <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                        <Search className="w-7 h-7 text-muted-foreground/30" aria-hidden="true" />
                    </div>
                    <p className="text-base font-bold text-foreground">No results found</p>
                    <p className="text-sm text-muted-foreground mt-1.5">Try different keywords</p>
                </div>
            )}

            {/* Categories results */}
            {matchedCategories.length > 0 && (
                <div className="px-4 pt-5">
                    <h2 className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-3">Categories</h2>
                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                        {matchedCategories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => navigate(`/m/browse/${cat.slug}`)}
                                className="shrink-0 w-28 active:scale-95 transition-transform"
                                aria-label={`${cat.name} — ${formatViewerCount(cat.viewers)} watching`}
                            >
                                <div className="aspect-[3/4] rounded-xl overflow-hidden bg-muted mb-1.5">
                                    <img src={cat.thumbnail} alt="" className="w-full h-full object-cover" loading="lazy" />
                                </div>
                                <p className="text-[12px] font-semibold text-foreground truncate">{cat.name}</p>
                                <p className="text-[10px] text-muted-foreground">{formatViewerCount(cat.viewers)} watching</p>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Channels results */}
            {matchedChannels.length > 0 && (
                <div className="px-4 pt-5 pb-6">
                    <h2 className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-3">Live Channels</h2>
                    <div className="space-y-3">
                        {matchedChannels.map((ch) => (
                            <MobileStreamCard key={ch.id} channel={ch} variant="compact" />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
