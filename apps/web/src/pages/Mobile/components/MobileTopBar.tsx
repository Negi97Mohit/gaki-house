import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Bell, X, Heart } from "lucide-react";
import { useAuth } from "@/pages/platform/context/AuthContext";
import { cn } from "@gaki/core/lib/utils";

export const MobileTopBar: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, openAuthModal } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/m/search?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery("");
    }
  };

  const avatarUrl =
    profile?.avatar_url ||
    "https://api.dicebear.com/9.x/adventurer/svg?seed=me";

  return (
    <>
      <header
        className="mobile-top-bar mobile-safe-top sticky top-0 z-50 flex items-center justify-between px-4 h-14 mobile-glass border-b border-border/10"
        role="banner"
        aria-label="Top navigation"
      >
        {/* Logo */}
        <Link to="/m" className="flex items-center gap-2.5" aria-label="GAKI Home">
          <img
            src="./icon.png"
            alt="GAKI"
            className="w-7 h-7 rounded-lg shadow-sm"
          />
          <span className="text-foreground font-black text-base tracking-tight">
            GAKI
          </span>
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => navigate("/m/following")}
            className="mobile-icon-btn"
            aria-label="Following"
          >
            <Heart className="w-[18px] h-[18px]" />
          </button>
          <button
            onClick={() => setSearchOpen(true)}
            className="mobile-icon-btn"
            aria-label="Search"
          >
            <Search className="w-[18px] h-[18px]" />
          </button>
          <button
            className="mobile-icon-btn relative"
            aria-label="Notifications"
          >
            <Bell className="w-[18px] h-[18px]" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-destructive rounded-full" aria-hidden="true" />
          </button>
          <button
            onClick={() =>
              user ? navigate("/m/profile/me") : openAuthModal("login")
            }
            className="mobile-icon-btn"
            aria-label={user ? "Your profile" : "Sign in"}
          >
            <img
              src={avatarUrl}
              alt=""
              className="w-8 h-8 rounded-full bg-muted border-2 border-border/20 object-cover"
            />
          </button>
        </div>
      </header>

      {/* Full-screen search overlay */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[200] bg-background/98 backdrop-blur-2xl flex flex-col animate-in fade-in slide-in-from-top-2 duration-200"
          role="dialog"
          aria-label="Search"
          aria-modal="true"
        >
          <div className="mobile-safe-top flex items-center gap-2.5 px-4 py-3 border-b border-border/10">
            <button
              onClick={() => {
                setSearchOpen(false);
                setQuery("");
              }}
              className="mobile-icon-btn"
              aria-label="Close search"
            >
              <X className="w-5 h-5" />
            </button>
            <form onSubmit={handleSubmit} className="flex-1">
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search streams, categories..."
                className="w-full bg-muted/60 rounded-full px-5 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[44px]"
                aria-label="Search input"
              />
            </form>
          </div>
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm px-6 text-center">
            {query.trim()
              ? `Press enter to search "${query}"`
              : "Start typing to search..."}
          </div>
        </div>
      )}
    </>
  );
};
