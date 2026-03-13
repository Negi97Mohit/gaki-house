import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Compass, Heart, ChevronLeft, ChevronRight, Settings, Film, BarChart3 } from "lucide-react";
import { formatViewerCount, PLATFORM_META, PlatformType, PLATFORM_CATEGORY_LABELS } from "../data/mockData";
import { useStreams } from "../hooks/useStreams";
import { getPlatformIcon } from "@/features/banners/ui/banner/PlatformIcons";
import { cn } from "@/shared/lib/utils";

const NAV_ITEMS = [
  { label: "Home", icon: Home, path: "/platform" },
  { label: "Browse", icon: Compass, path: "/platform/browse" },
  { label: "Following", icon: Heart, path: "/platform/following" },
  { label: "Dashboard", icon: BarChart3, path: "/platform/dashboard" },
  { label: "Clips", icon: Film, path: "/platform/clips" },
  { label: "Settings", icon: Settings, path: "/platform/settings" },
];

// All platform IDs grouped by category
const PLATFORM_GROUPS: { key: string; platforms: PlatformType[] }[] = [
  { key: "major", platforms: ["youtube", "twitch", "facebook", "tiktok", "instagram", "x", "linkedin"] },
  { key: "gaming", platforms: ["kick", "rumble", "dlive", "trovo", "bilibili", "nimotv"] },
  { key: "professional", platforms: ["vimeo", "vk", "mixcloud", "brightcove", "jwplayer", "kaltura", "ibm", "wowza", "mux", "aws"] },
  { key: "selfhosted", platforms: ["owncast", "peertube", "nginx", "wowzaserver", "antmedia", "red5", "mediasoup"] },
];

export const PlatformSidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { data: MOCK_CHANNELS = [] } = useStreams();

  // Group live channels by platform
  const liveChannels = MOCK_CHANNELS.filter((c) => c.isLive && c.platform);
  const channelsByPlatform = liveChannels.reduce<Record<string, typeof MOCK_CHANNELS>>((acc, ch) => {
    const p = ch.platform!;
    if (!acc[p]) acc[p] = [];
    acc[p].push(ch);
    return acc;
  }, {});

  return (
    <aside
      className={cn(
        "h-full bg-background border-r border-border/30 flex-col transition-all duration-200 shrink-0 hidden md:flex",
        collapsed ? "w-[52px]" : "w-[230px]"
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

      {/* Channel list by platform group */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-1 pb-4">
        {PLATFORM_GROUPS.map((group) => {
          // Only show group if it has live channels on at least one platform
          const groupHasChannels = group.platforms.some((p) => channelsByPlatform[p]?.length);
          if (!groupHasChannels) return null;

          return (
            <div key={group.key} className="mb-2">
              {!collapsed && (
                <div className="px-2 text-[9px] uppercase tracking-widest text-muted-foreground/60 font-bold mt-3 mb-1">
                  {PLATFORM_CATEGORY_LABELS[group.key]}
                </div>
              )}

              {group.platforms.map((platform) => {
                const channels = channelsByPlatform[platform];
                if (!channels || channels.length === 0) return null;
                const meta = PLATFORM_META[platform];
                const PIcon = getPlatformIcon(platform);
                return (
                  <div key={platform} className="mb-1.5">
                    {!collapsed && (
                      <div className="px-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5 mt-1.5 flex items-center gap-1.5">
                        <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-sm leading-none" style={{ color: meta.color }}>
                          <PIcon className="w-3.5 h-3.5" style={{ color: meta.color }} />
                        </span>
                        {meta.label}
                      </div>
                    )}
                    {collapsed && (
                      <div className="flex justify-center my-1" title={meta.label}>
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded" style={{ color: meta.color }}>
                          <PIcon className="w-4 h-4" style={{ color: meta.color }} />
                        </span>
                      </div>
                    )}
                    {channels.slice(0, 3).map((ch) => (
                      <ChannelLink key={`${platform}-${ch.id}`} ch={ch} collapsed={collapsed} />
                    ))}
                  </div>
                );
              })}
            </div>
          );
        })}
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

const ChannelLink = ({ ch, collapsed }: { ch: any, collapsed: boolean }) => (
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
