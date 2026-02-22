import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Bell, X, Heart } from "lucide-react";
import { useAuth } from "@/pages/platform/context/AuthContext";

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
      <header className="mobile-top-bar safe-area-top sticky top-0 z-50 flex items-center justify-between px-3.5 h-12 bg-background/70 border-b border-border/20">
        {/* Logo */}
        <Link to="/m" className="flex items-center gap-2">
          <img
            src="./icon.png"
            alt="GAKI"
            className="w-6 h-6 rounded-md shadow-sm"
          />
          <span className="text-foreground font-black text-base tracking-tight">
            GAKI
          </span>
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate("/m/following")}
            className="mobile-icon-btn"
          >
            <Heart className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSearchOpen(true)}
            className="mobile-icon-btn"
          >
            <Search className="w-4 h-4" />
          </button>
          <button className="mobile-icon-btn relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
          </button>
          <button
            onClick={() =>
              user ? navigate("/m/profile/me") : openAuthModal("login")
            }
            className="ml-1 active:scale-95 transition-transform"
          >
            <img
              src={avatarUrl}
              alt="You"
              className="w-7 h-7 rounded-full bg-muted border border-border/40 object-cover"
            />
          </button>
        </div>
      </header>

      {/* Full-screen search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-xl flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="safe-area-top flex items-center gap-2 px-3 py-2 border-b border-border/20">
            <button
              onClick={() => {
                setSearchOpen(false);
                setQuery("");
              }}
              className="mobile-icon-btn"
            >
              <X className="w-4 h-4" />
            </button>
            <form onSubmit={handleSubmit} className="flex-1">
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search streams, categories..."
                className="w-full bg-muted/60 rounded-full px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </form>
          </div>
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            {query.trim()
              ? `Press enter to search "${query}"`
              : "Start typing to search..."}
          </div>
        </div>
      )}
    </>
  );
};
