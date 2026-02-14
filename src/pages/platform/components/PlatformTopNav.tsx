import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Bell, ArrowLeft, X } from "lucide-react";
import { MOCK_CHANNELS, MOCK_CATEGORIES, formatViewerCount } from "../data/mockData";
import { UserMenu } from "./UserMenu";

export const PlatformTopNav: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const trimmed = query.trim().toLowerCase();

  const matchedChannels = trimmed
    ? MOCK_CHANNELS.filter(
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

  // Close dropdown on outside click
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
    <header className="h-12 bg-background border-b border-border/30 flex items-center px-4 gap-4 shrink-0 z-50">
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/")}
          className="text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
          title="Back to Studio"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <Link to="/platform" className="flex items-center gap-2">
          <img src="./icon.png" alt="GAKI" className="w-7 h-7 rounded-lg" />
          <span className="text-foreground font-bold text-base tracking-tight hidden sm:inline">
            GAKI
          </span>
        </Link>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-md mx-auto relative" ref={dropdownRef}>
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              placeholder="Search channels, categories..."
              className="w-full bg-muted border border-border/40 rounded-full pl-10 pr-9 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </form>

        {/* Search Suggestions Dropdown */}
        {showDropdown && (matchedChannels.length > 0 || matchedCategories.length > 0) && (
          <div className="absolute top-full mt-1.5 left-0 right-0 bg-card border border-border/40 rounded-lg shadow-lg z-[100] overflow-hidden max-h-[400px] overflow-y-auto">
            {matchedChannels.length > 0 && (
              <div className="p-2">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-2 py-1">
                  Channels
                </p>
                {matchedChannels.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => handleSelect(`/platform/stream/${ch.username}`)}
                    className="flex items-center gap-3 w-full px-2 py-2 rounded-md hover:bg-muted transition-colors text-left"
                  >
                    <img src={ch.avatar} alt="" className="w-7 h-7 rounded-full bg-muted" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{ch.displayName}</p>
                      <p className="text-xs text-muted-foreground truncate">{ch.category}</p>
                    </div>
                    {ch.isLive && (
                      <span className="flex items-center gap-1 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                        <span className="text-[11px] text-muted-foreground">{formatViewerCount(ch.viewers)}</span>
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {matchedCategories.length > 0 && (
              <div className="p-2 border-t border-border/20">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-2 py-1">
                  Categories
                </p>
                {matchedCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleSelect(`/platform/browse/${cat.slug}`)}
                    className="flex items-center gap-3 w-full px-2 py-2 rounded-md hover:bg-muted transition-colors text-left"
                  >
                    <img src={cat.thumbnail} alt="" className="w-7 h-9 rounded object-cover bg-muted" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{cat.name}</p>
                      <p className="text-xs text-muted-foreground">{formatViewerCount(cat.viewers)} watching</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Search all link */}
            <button
              onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
              className="w-full px-4 py-2.5 text-sm text-primary font-medium hover:bg-muted transition-colors border-t border-border/20 text-left"
            >
              Search for "{query}"
            </button>
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="w-4.5 h-4.5" />
        </button>
        <UserMenu />
        <Link
          to="/"
          className="ml-1 sm:ml-2 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-md hover:opacity-90 transition-opacity hidden sm:block"
        >
          Go Live
        </Link>
      </div>
    </header>
  );
};
