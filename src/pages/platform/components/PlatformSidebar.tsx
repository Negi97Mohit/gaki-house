import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Compass, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { MOCK_CHANNELS, formatViewerCount } from "../data/mockData";
import { cn } from "@/shared/lib/utils";

const NAV_ITEMS = [
  { label: "Home", icon: Home, path: "/platform" },
  { label: "Browse", icon: Compass, path: "/platform/browse" },
  { label: "Following", icon: Heart, path: "/platform/following" },
];

export const PlatformSidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const recommendedChannels = MOCK_CHANNELS.filter((c) => c.isLive).slice(0, 8);

  return (
    <aside
      className={cn(
        "h-full bg-[#0e0e10] border-r border-white/5 flex flex-col transition-all duration-200 shrink-0",
        collapsed ? "w-[52px]" : "w-[220px]"
      )}
    >
      {/* Nav Links */}
      <nav className="flex flex-col gap-0.5 p-2">
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                active
                  ? "bg-[#53fc18]/10 text-[#53fc18]"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Recommended */}
      {!collapsed && (
        <div className="mt-2 px-3">
          <p className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold mb-2">
            Recommended
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto scrollbar-thin px-1">
        {recommendedChannels.map((ch) => (
          <Link
            key={ch.id}
            to={`/platform/stream/${ch.username}`}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-white/5 transition-colors group"
          >
            <div className="relative shrink-0">
              <img
                src={ch.avatar}
                alt={ch.displayName}
                className="w-7 h-7 rounded-full bg-zinc-800"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-[#0e0e10]" />
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-200 truncate leading-tight font-medium">
                    {ch.displayName}
                  </p>
                  <p className="text-[11px] text-zinc-500 truncate leading-tight">
                    {ch.category}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span className="text-[11px] text-zinc-400">
                    {formatViewerCount(ch.viewers)}
                  </span>
                </div>
              </>
            )}
          </Link>
        ))}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="p-2 m-2 rounded-md hover:bg-white/5 text-zinc-500 hover:text-zinc-300 transition-colors self-end"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
};
