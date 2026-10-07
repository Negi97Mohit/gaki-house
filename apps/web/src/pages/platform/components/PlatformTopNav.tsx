import React, { useState, useRef, useEffect } from "react";
import AppLogo from "@gaki/ui/AppLogo";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Bell, X, ArrowLeft } from "lucide-react";
import { useStreams } from "../hooks/useStreams";
import { UserMenu } from "./UserMenu";
import { useAuth } from "../context/AuthContext";
import { useGoLiveStore } from "@/stores/goLive.store";
import { cn } from "@gaki/core/lib/utils";

interface PlatformTopNavProps {
  isScrolled?: boolean;
}

export const PlatformTopNav: React.FC<PlatformTopNavProps> = ({ isScrolled = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

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
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsFocused(false);
        if (!query) {
          setIsSearchOpen(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [query]);

  // Navigation options: Home, Browse, and Following (only when user is logged in)
  const navLinks = [
    { label: "Home", path: "/platform" },
    { label: "Browse", path: "/platform/browse" },
    ...(user ? [{ label: "Following", path: "/platform/following" }] : []),
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 h-16 z-40 px-6 sm:px-12 md:px-16 flex items-center justify-between transition-all duration-300 select-none",
        isScrolled
          ? "bg-zinc-950/95 backdrop-blur-md border-b border-white/[0.06] shadow-xl shadow-black/40"
          : "bg-gradient-to-b from-black/90 via-black/40 to-transparent"
      )}
    >
      {/* Left: Brand Logo & Navigation Links */}
      <div className="flex items-center gap-8">
        {/* Brand Logo - Gaki */}
        <Link to="/platform" className="flex items-center gap-2.5 group">
          <AppLogo size={28} className="rounded-lg group-hover:scale-105 transition-transform" />
          <span className="text-white font-bold text-base tracking-tight font-sans">
            Gaki
          </span>
        </Link>

        {/* Clean chic navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.label}
                to={link.path}
                className={cn(
                  "transition-colors duration-200 tracking-wide",
                  isActive ? "text-white font-semibold" : "text-zinc-400 hover:text-zinc-200"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right: Search, Notifications (if signed in), Back to Studio, Sign In / Profile, Go Live */}
      <div className="flex items-center gap-3 sm:gap-3.5">
        {/* Expandable Search */}
        <div ref={searchContainerRef} className="relative flex items-center">
          <form
            onSubmit={handleSubmit}
            className={cn(
              "flex items-center transition-all duration-300 ease-out border rounded-full overflow-hidden",
              isSearchOpen
                ? "w-48 sm:w-60 bg-black/80 border-white/20 px-3 py-1.5"
                : "w-8 h-8 bg-transparent border-transparent justify-center"
            )}
          >
            <button
              type="button"
              onClick={() => {
                setIsSearchOpen(true);
                setTimeout(() => inputRef.current?.focus(), 50);
              }}
              className="text-zinc-400 hover:text-white transition-colors"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {isSearchOpen && (
              <>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  placeholder="Search creators..."
                  className="w-full bg-transparent border-none text-xs text-white placeholder:text-zinc-500 focus:outline-none ml-2"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </>
            )}
          </form>

          {/* Search suggestions dropdown */}
          {showDropdown && matchedChannels.length > 0 && (
            <div className="absolute top-full mt-2 right-0 w-64 bg-zinc-950/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-2 z-50">
              <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 px-2 py-1">
                Creators
              </p>
              {matchedChannels.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => handleSelect(`/platform/stream/${ch.username}`)}
                  className="flex items-center gap-2.5 w-full p-2 rounded-lg hover:bg-white/10 text-left transition-colors"
                >
                  <img src={ch.avatar} alt="" className="w-7 h-7 rounded-full bg-zinc-800" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white truncate">{ch.displayName}</p>
                    <p className="text-[10px] text-zinc-400 truncate">{ch.category}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications (only shown if user is signed in) */}
        {user && (
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
          </button>
        )}

        {/* Back to Studio Main Page (placed right before / next to Sign In on the left) */}
        <Link
          to="/"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 transition-all duration-200 group shrink-0"
          title="Back to Studio"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5 text-zinc-400 group-hover:text-white" />
          <span className="hidden sm:inline tracking-wide font-sans">Studio</span>
        </Link>

        {/* User Profile or Chic Sign In Button */}
        {user ? (
          <UserMenu />
        ) : (
          <button
            onClick={() => openAuthModal("login")}
            className="px-4 py-1.5 text-[11px] font-medium tracking-[0.08em] uppercase text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/25 rounded-full transition-all duration-200"
          >
            Sign In
          </button>
        )}

        {/* Chic Vogue Modern Go Live CTA with #53cac7 border and non-white background */}
        <button
          onClick={handleGoLive}
          className="px-4 py-1.5 rounded-full bg-transparent hover:bg-[#53cac7]/10 text-white hover:text-[#53cac7] text-[11px] font-semibold tracking-[0.06em] uppercase transition-all duration-200 flex items-center gap-2 active:scale-95 border border-[#53cac7] shadow-[0_0_12px_rgba(83,202,199,0.15)] hover:shadow-[0_0_18px_rgba(83,202,199,0.3)]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#53cac7] animate-pulse" />
          <span>Go Live</span>
        </button>
      </div>
    </header>
  );
};
