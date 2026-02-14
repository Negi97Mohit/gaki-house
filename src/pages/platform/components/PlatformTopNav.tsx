import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Bell, User, ArrowLeft } from "lucide-react";

export const PlatformTopNav: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header className="h-12 bg-background border-b border-border/30 flex items-center px-4 gap-4 shrink-0 z-50">
      {/* Left: Logo + back to studio */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/")}
          className="text-muted-foreground hover:text-foreground transition-colors"
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
      <div className="flex-1 max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-muted border border-border/40 rounded-full pl-10 pr-4 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <button className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="w-4.5 h-4.5" />
        </button>
        <Link
          to="/platform/profile/me"
          className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-accent/20 transition-colors"
        >
          <User className="w-4 h-4 text-muted-foreground" />
        </Link>
        <Link
          to="/"
          className="ml-2 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-md hover:opacity-90 transition-opacity"
        >
          Go Live
        </Link>
      </div>
    </header>
  );
};
