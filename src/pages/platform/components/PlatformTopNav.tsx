import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Bell, X } from "lucide-react";
import { MOCK_CATEGORIES, formatViewerCount } from "../data/mockData";
import { useStreams } from "../hooks/useStreams";
import { UserMenu } from "./UserMenu";
import { useAuth } from "../context/AuthContext";
import { useGoLiveStore } from "@/stores/goLive.store";

export const PlatformTopNav: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { user, openAuthModal } = useAuth();
  const requestGoLive = useGoLiveStore((s) => s.requestGoLive);

  const trimmed = query.trim().toLowerCase();
  const { data: allStreams = [] } = useStreams();

  const matchedChannels = trimmed
    ? allStreams.filter(
      (c) =>
        c.displayName.toLowerCase().includes(trimmed) ||
        c.username.toLowerCase().includes(trimmed)
    ).slice(0, 5)
    : [];

  const matchedCategories = trimmed
    ? MOCK_CATEGORIES.filter((c) => c.name.toLowerCase().includes(trimmed)).slice(0, 3)
    : [];

  const showDropdown = isFocused && trimmed.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trimmed) {
      navigate(`/platform/search?q=${encodeURIComponent(query.trim())}`);
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  const handleSelect = (path: string) => {
    setQuery("");
    setIsFocused(false);
    navigate(path);
  };

  const handleGoLive = () => {
    if (!user) {
      openAuthModal("login");
      return;
    }
    requestGoLive();
    navigate("/");
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="h-14 bg-background/80 backdrop-blur-xl border-b border-border/10 flex items-center px-5 gap-5 shrink-0 z-50">
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <Link to="/platform" className="flex items-center gap-2.5 group">
          <img src="./icon.png" alt="GAKI" className="w-7 h-7 rounded-lg group-hover:scale-105 transition-transform duration-200" />
          <span className="text-foreground font-bold text-base tracking-tight hidden sm:inline">
            GAKI
          </span>
        </Link>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-md mx-auto relative" ref={dropdownRef}>
        <form onSubmit={handleSubmit}>
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 group-focus-within:text-primary/70 transition-colors duration-200" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              placeholder="Search channels, categories..."
              className="w-full bg-muted/40 border border-border/20 rounded-xl pl-10 pr-9 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/30 focus:bg-muted/60 focus:ring-1 focus:ring-primary/10 transition-all duration-200"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors duration-150"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </form>

        {/* Search Suggestions Dropdown */}
        {showDropdown && (matchedChannels.length > 0 || matchedCategories.length > 0) && (
          <div className="absolute top-full mt-2 left-0 right-0 bg-card/95 backdrop-blur-xl border border-border/20 rounded-xl shadow-2xl shadow-black/10 z-[100] overflow-hidden max-h-[400px] overflow-y-auto">
            {matchedChannels.length > 0 && (
              <div className="p-2">
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground/50 font-semibold px-2 py-1.5">
                  Channels
                </p>
                {matchedChannels.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => handleSelect(`/platform/stream/${ch.username}`)}
                    className="flex items-center gap-3 w-full px-2.5 py-2 rounded-lg hover:bg-accent/40 transition-colors text-left group"
                  >
                    <img src={ch.avatar} alt="" className="w-8 h-8 rounded-full bg-muted ring-1 ring-border/10" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{ch.displayName}</p>
                      <p className="text-xs text-muted-foreground/60 truncate">{ch.category}</p>
                    </div>
                    {ch.isLive && (
                      <span className="flex items-center gap-1.5 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                        <span className="text-[11px] text-muted-foreground/60 tabular-nums">{formatViewerCount(ch.viewers)}</span>
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {matchedCategories.length > 0 && (
              <div className="p-2 border-t border-border/10">
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground/50 font-semibold px-2 py-1.5">
                  Categories
                </p>
                {matchedCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleSelect(`/platform/browse/${cat.slug}`)}
                    className="flex items-center gap-3 w-full px-2.5 py-2 rounded-lg hover:bg-accent/40 transition-colors text-left group"
                  >
                    <img src={cat.thumbnail} alt="" className="w-8 h-10 rounded-md object-cover bg-muted ring-1 ring-border/10" />
                    <div>
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{cat.name}</p>
                      <p className="text-xs text-muted-foreground/60">{formatViewerCount(cat.viewers)} watching</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => handleSubmit({ preventDefault: () => { } } as React.FormEvent)}
              className="w-full px-4 py-2.5 text-sm text-primary/80 font-medium hover:bg-accent/30 hover:text-primary transition-all border-t border-border/10 text-left"
            >
              Search for "{query}"
            </button>
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        <button className="p-2 rounded-xl hover:bg-accent/40 text-muted-foreground/60 hover:text-foreground transition-all duration-200">
          <Bell className="w-[18px] h-[18px]" strokeWidth={1.8} />
        </button>
        <UserMenu />
        <button
          onClick={handleGoLive}
          className="ml-1 sm:ml-2 px-4 py-1.5 bg-destructive/90 hover:bg-destructive text-destructive-foreground text-xs font-semibold rounded-xl hover:shadow-lg hover:shadow-destructive/20 transition-all duration-200 flex items-center gap-2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-destructive-foreground animate-pulse" />
          Go Live
        </button>
      </div>
    </header>
  );
};
