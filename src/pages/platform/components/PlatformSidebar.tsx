import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Compass, Heart, ChevronLeft, ChevronRight, Settings, Film } from "lucide-react";
import { MOCK_CHANNELS, formatViewerCount } from "../data/mockData";
import { cn } from "@/shared/lib/utils";

const NAV_ITEMS = [
  { label: "Home", icon: Home, path: "/platform" },
  { label: "Browse", icon: Compass, path: "/platform/browse" },
  { label: "Following", icon: Heart, path: "/platform/following" },
  { label: "Clips", icon: Film, path: "/platform/clips" },
  { label: "Settings", icon: Settings, path: "/platform/settings" },
];

export const PlatformSidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const recommendedChannels = MOCK_CHANNELS.filter((c) => c.isLive).slice(0, 8);

  return (
    <aside
      className={cn(
        "h-full bg-background border-r border-border/30 flex-col transition-all duration-200 shrink-0 hidden md:flex",
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
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            Recommended
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto scrollbar-thin px-1 pb-4">
        {/* YouTube Section */}
        {MOCK_CHANNELS.filter(c => c.isLive && c.platform === 'youtube').length > 0 && (
          <div className="mb-4">
            {!collapsed && (
              <p className="px-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1 mt-2">
                YouTube
              </p>
            )}
            {MOCK_CHANNELS.filter(c => c.isLive && c.platform === 'youtube').map((ch) => (
              <ChannelLink key={`yt-${ch.id}`} ch={ch} collapsed={collapsed} />
            ))}
          </div>
        )}

        {/* Twitch Section */}
        {MOCK_CHANNELS.filter(c => c.isLive && c.platform === 'twitch').length > 0 && (
          <div className="mb-4">
            {!collapsed && (
              <p className="px-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1 mt-2">
                Twitch
              </p>
            )}
            {MOCK_CHANNELS.filter(c => c.isLive && c.platform === 'twitch').map((ch) => (
              <ChannelLink key={`tw-${ch.id}`} ch={ch} collapsed={collapsed} />
            ))}
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="p-2 m-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors self-end"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
};

const ChannelLink = ({ ch, collapsed }: { ch: typeof MOCK_CHANNELS[0], collapsed: boolean }) => (
  <Link
    to={`/platform/stream/${ch.username}`}
    title={collapsed ? ch.displayName : undefined}
    className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-muted transition-colors group"
  >
    <div className="relative shrink-0">
      <img
        src={ch.avatar}
        alt={ch.displayName}
        className="w-7 h-7 rounded-full bg-muted"
      />
      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-destructive border-2 border-background" />
    </div>
    {!collapsed && (
      <>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground truncate leading-tight font-medium">
            {ch.displayName}
          </p>
          <p className="text-[11px] text-muted-foreground truncate leading-tight">
            {ch.category}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
          <span className="text-[11px] text-muted-foreground">
            {formatViewerCount(ch.viewers)}
          </span>
        </div>
      </>
    )}
  </Link>
);
