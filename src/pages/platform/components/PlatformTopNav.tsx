import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Bell, User, ArrowLeft } from "lucide-react";

export const PlatformTopNav: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header className="h-12 bg-[#0e0e10] border-b border-white/5 flex items-center px-4 gap-4 shrink-0 z-50">
      {/* Left: Logo + back to studio */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/")}
          className="text-zinc-500 hover:text-zinc-300 transition-colors"
          title="Back to Studio"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <Link to="/platform" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#53fc18] flex items-center justify-center">
            <span className="text-black font-black text-sm leading-none">S</span>
          </div>
          <span className="text-white font-bold text-base tracking-tight hidden sm:inline">
            StreamHub
          </span>
        </Link>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-[#1a1a1d] border border-white/10 rounded-full pl-10 pr-4 py-1.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#53fc18]/50 transition-colors"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <button className="p-2 rounded-md hover:bg-white/5 text-zinc-400 hover:text-white transition-colors">
          <Bell className="w-4.5 h-4.5" />
        </button>
        <Link
          to="/platform/profile/me"
          className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors"
        >
          <User className="w-4 h-4 text-zinc-400" />
        </Link>
        <Link
          to="/"
          className="ml-2 px-3 py-1.5 bg-[#53fc18] text-black text-xs font-bold rounded-md hover:bg-[#4ae615] transition-colors"
        >
          Go Live
        </Link>
      </div>
    </header>
  );
};
