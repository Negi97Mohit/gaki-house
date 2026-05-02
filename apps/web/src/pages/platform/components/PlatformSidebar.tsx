import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Compass,
  Heart,
  ChevronLeft,
  ChevronRight,
  Settings,
  Film,
  LayoutDashboard,
  Radio,
  ChevronDown,
  ArrowLeft,
} from "lucide-react";
import { formatViewerCount, PLATFORM_META, PlatformType, PLATFORM_CATEGORY_LABELS } from "../data/mockData";
import { useStreams } from "../hooks/useStreams";
import { getPlatformIcon } from "@/features/banners/ui/banner/PlatformIcons";
import { cn } from "@gaki/core/lib/utils";
import { useAuth } from "../context/AuthContext";

const PUBLIC_NAV_ITEMS = [
  { label: "Home", icon: Home, path: "/platform" },
  { label: "Browse", icon: Compass, path: "/platform/browse" },
  { label: "Settings", icon: Settings, path: "/platform/settings" },
];

const AUTH_NAV_ITEMS = [
  { label: "Following", icon: Heart, path: "/platform/following" },
  { label: "Dashboard", icon: LayoutDashboard, path: "/platform/dashboard" },
  { label: "Clips", icon: Film, path: "/platform/clips" },
];

const PLATFORM_GROUPS: { key: string; platforms: PlatformType[] }[] = [
  { key: "major", platforms: ["youtube", "twitch", "facebook", "tiktok", "instagram", "x", "linkedin"] },
  { key: "gaming", platforms: ["kick", "rumble", "dlive", "trovo", "bilibili", "nimotv"] },
  { key: "professional", platforms: ["vimeo", "vk", "mixcloud", "brightcove", "jwplayer", "kaltura", "ibm", "wowza", "mux", "aws"] },
  { key: "selfhosted", platforms: ["owncast", "peertube", "nginx", "wowzaserver", "antmedia", "red5", "mediasoup"] },
];

export const PlatformSidebar: React.FC<{ forceCollapsed?: boolean }> = ({ forceCollapsed }) => {
  const [collapsed, setCollapsed] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({ major: true });
  
  const isCollapsed = forceCollapsed || (collapsed && !isHovered);

  const location = useLocation();
  const navigate = useNavigate();
  const { data: MOCK_CHANNELS = [] } = useStreams();
  const { user } = useAuth();

  const NAV_ITEMS = [...PUBLIC_NAV_ITEMS, ...(user ? AUTH_NAV_ITEMS : [])].sort((a, b) => {
    const order = ["/platform", "/platform/browse", "/platform/following", "/platform/dashboard", "/platform/clips", "/platform/settings"];
    return order.indexOf(a.path) - order.indexOf(b.path);
  });

  const liveChannels = MOCK_CHANNELS.filter((c) => c.isLive && c.platform);
  const channelsByPlatform = liveChannels.reduce<Record<string, typeof MOCK_CHANNELS>>((acc, ch) => {
    const p = ch.platform!;
    if (!acc[p]) acc[p] = [];
    acc[p].push(ch);
    return acc;
  }, {});

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleBack = () => {
    if (location.pathname === "/platform" || location.pathname === "/platform/") {
      navigate("/");
    } else {
      navigate(-1);
    }
  };

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "h-full bg-background/80 backdrop-blur-sm border-r border-border/20 flex-col transition-all duration-300 ease-out shrink-0 hidden md:flex",
        isCollapsed ? "w-[56px]" : "w-[240px]"
      )}
    >
      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 p-2.5 pt-3">
        <button
          onClick={handleBack}
          title={isCollapsed ? "Go Back" : undefined}
          className="group flex items-center justify-start px-3 py-2 mb-2 rounded-lg text-sm font-medium transition-all duration-300 text-muted-foreground hover:bg-accent/50 hover:text-foreground"
        >
          <div className="flex items-center justify-center w-[18px]">
            <ArrowLeft className="w-[18px] h-[18px] shrink-0 transition-colors text-muted-foreground group-hover:text-foreground" strokeWidth={1.8} />
          </div>
          <div
            className={cn(
              "flex items-center overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap",
              isCollapsed ? "w-0 opacity-0 ml-0" : "w-[60px] opacity-100 ml-3"
            )}
          >
            Go Back
          </div>
        </button>
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                "group flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                active
                  ? "bg-primary/10 text-primary shadow-sm shadow-primary/5"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <div className="flex items-center justify-center w-[18px]">
                <item.icon className={cn(
                  "w-[18px] h-[18px] shrink-0 transition-colors",
                  active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )} strokeWidth={active ? 2.2 : 1.8} />
              </div>
              <div
                className={cn(
                  "flex items-center overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap",
                  isCollapsed ? "w-0 opacity-0 ml-0" : "w-[100px] opacity-100 ml-3"
                )}
              >
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-3 h-px bg-border/30" />

      {/* Live Channels Header */}
      {!isCollapsed && (
        <div className="flex items-center gap-2 px-4 pt-3 pb-1">
          <Radio className="w-3.5 h-3.5 text-destructive animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
            Live Channels
          </span>
        </div>
      )}
      {isCollapsed && (
        <div className="flex justify-center pt-3 pb-1">
          <Radio className="w-4 h-4 text-destructive animate-pulse" />
        </div>
      )}

      {/* Channel Groups */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-1.5 pb-4 space-y-1">
        {PLATFORM_GROUPS.map((group) => {
          const groupHasChannels = group.platforms.some((p) => channelsByPlatform[p]?.length);
          if (!groupHasChannels) return null;

          const isExpanded = expandedGroups[group.key] ?? false;

          // Collect all channels for this group
          const groupChannels = group.platforms.flatMap((p) => {
            const channels = channelsByPlatform[p];
            if (!channels) return [];
            return channels.map((ch) => ({ ...ch, _platform: p }));
          });

          return (
            <div key={group.key}>
              {/* Group Header - clickable to expand/collapse */}
              <div
                className={cn(
                  "transition-all duration-300 ease-in-out relative flex items-center",
                  isCollapsed ? "h-6 justify-center" : "h-10 px-3"
                )}
              >
                {!isCollapsed ? (
                  <button
                    onClick={() => toggleGroup(group.key)}
                    className="w-full h-full flex items-center justify-between rounded-md hover:bg-accent/30 transition-colors group absolute inset-0 px-3"
                  >
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 group-hover:text-muted-foreground transition-colors overflow-hidden whitespace-nowrap">
                      {PLATFORM_CATEGORY_LABELS[group.key]}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[11px] text-muted-foreground/40 tabular-nums">
                        {groupChannels.length}
                      </span>
                      <ChevronDown className={cn(
                        "w-3 h-3 text-muted-foreground/40 transition-transform duration-200",
                        isExpanded && "rotate-180"
                      )} />
                    </div>
                  </button>
                ) : (
                  <div className="w-5 h-px bg-border/40 rounded-full shrink-0" />
                )}
              </div>

              {/* Channels */}
              {isExpanded && (
                <div className={cn("space-y-px", !isCollapsed && "mt-0.5")}>
                  {groupChannels.slice(0, 5).map((ch) => {
                    const meta = PLATFORM_META[ch._platform as PlatformType];
                    const PIcon = getPlatformIcon(ch._platform as PlatformType);
                    return (
                      <ChannelLink
                        key={`${ch._platform}-${ch.id}`}
                        ch={ch}
                        collapsed={isCollapsed}
                        platformIcon={PIcon}
                        platformColor={meta?.color}
                      />
                    );
                  })}
                  {groupChannels.length > 5 && (
                    <Link
                      to="/platform/browse"
                      className="flex items-center justify-center py-1 overflow-hidden"
                    >
                      <span className={cn(
                        "text-xs text-muted-foreground/50 hover:text-primary transition-all duration-300 ease-in-out whitespace-nowrap",
                        isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                      )}>
                        Show more
                      </span>
                    </Link>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Collapse toggle */}
      <div className="p-2 border-t border-border/20">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-1.5 rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-accent/50 transition-all duration-200",
          )}
          title={collapsed ? "Pin sidebar open" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : collapsed ? (
            <>
              <ChevronRight className="w-4 h-4" />
              <span className="text-xs font-medium">Pin Open</span>
            </>
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-xs font-medium">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

const ChannelLink = ({
  ch,
  collapsed,
  platformIcon: PIcon,
  platformColor,
}: {
  ch: any;
  collapsed: boolean;
  platformIcon: React.ComponentType<any>;
  platformColor?: string;
}) => (
  <Link
    to={`/platform/stream/${ch.username}`}
    title={collapsed ? ch.displayName : undefined}
    className="flex items-center px-2.5 py-1.5 rounded-lg hover:bg-accent/40 transition-all duration-300 group"
  >
    <div className="relative shrink-0 flex items-center justify-center w-[28px] h-[28px]">
      <img
        src={ch.avatar}
        alt={ch.displayName}
        className="w-7 h-7 rounded-full bg-muted ring-1 ring-border/20 object-cover"
      />
      <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-destructive ring-2 ring-background" />
    </div>

    <div
      className={cn(
        "flex flex-1 items-center overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap",
        collapsed ? "w-0 opacity-0 ml-0" : "w-[120px] opacity-100 ml-2.5"
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm text-foreground truncate leading-tight font-medium group-hover:text-foreground">
            {ch.displayName}
          </p>
          <PIcon
            className="w-3 h-3 shrink-0 opacity-50"
            style={{ color: platformColor }}
          />
        </div>
        <p className="text-xs text-muted-foreground/60 truncate leading-tight mt-0.5">
          {ch.category}
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity ml-2">
        <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
        <span className="text-xs text-muted-foreground font-medium tabular-nums">
          {formatViewerCount(ch.viewers)}
        </span>
      </div>
    </div>
  </Link>
);
