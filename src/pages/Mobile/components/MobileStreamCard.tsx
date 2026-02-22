import React from "react";
import { Link } from "react-router-dom";
import {
  StreamChannel,
  formatViewerCount,
  PLATFORM_META,
} from "@/pages/platform/data/mockData";
import { getPlatformIcon } from "@/features/banners/ui/banner/PlatformIcons";
import { Users } from "lucide-react";

interface MobileStreamCardProps {
  channel: StreamChannel;
  variant?: "default" | "compact";
}

export const MobileStreamCard: React.FC<MobileStreamCardProps> = ({
  channel,
  variant = "default",
}) => {
  const platformInfo = channel.platform
    ? PLATFORM_META[channel.platform]
    : null;
  const PlatformIcon = channel.platform
    ? getPlatformIcon(channel.platform)
    : null;

  if (variant === "compact") {
    return (
      <Link
        to={`/m/stream/${channel.username}`}
        className="flex gap-3 p-2 rounded-2xl border border-border/30 bg-card/40 hover:bg-muted/20 active:bg-muted/40 transition-colors active:scale-[0.99]"
      >
        {/* Compact thumbnail */}
        <div className="relative w-36 aspect-video rounded-xl overflow-hidden bg-muted shrink-0">
          <img
            src={channel.thumbnail}
            alt={channel.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {channel.isLive && (
            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-destructive text-destructive-foreground text-[9px] font-bold uppercase rounded">
              Live
            </span>
          )}
          <span className="absolute bottom-1.5 right-1.5 px-1 py-0.5 bg-black/70 text-white text-[9px] font-medium rounded flex items-center gap-0.5">
            <Users className="w-2.5 h-2.5" />
            {formatViewerCount(channel.viewers)}
          </span>
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0 py-0.5">
          <p className="text-[13px] text-foreground font-semibold line-clamp-2 leading-tight">
            {channel.title}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1 truncate">
            {channel.displayName}
          </p>
          <p className="text-[11px] text-muted-foreground/70 truncate">
            {channel.category}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/m/stream/${channel.username}`}
      className="block active:scale-[0.99] transition-transform"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted border border-border/20 shadow-sm shadow-black/10">
        <img
          src={channel.thumbnail}
          alt={channel.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Badges overlay */}
        {channel.isLive && (
          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-destructive text-destructive-foreground text-[10px] font-bold uppercase rounded-md tracking-wide">
            Live
          </span>
        )}
        <span className="absolute bottom-2.5 left-2.5 px-1.5 py-0.5 bg-black/70 text-white text-[11px] font-medium rounded-md flex items-center gap-1">
          <Users className="w-3 h-3" />
          {formatViewerCount(channel.viewers)}
        </span>
        {platformInfo && PlatformIcon && (
          <span
            className="absolute top-2.5 right-2.5 px-1.5 py-0.5 text-[9px] font-bold rounded-md flex items-center gap-0.5"
            style={{
              backgroundColor: platformInfo.color,
              color: platformInfo.textColor,
            }}
          >
            <PlatformIcon
              className="w-2.5 h-2.5"
              style={{ color: platformInfo.textColor }}
            />
            {platformInfo.label}
          </span>
        )}
      </div>

      {/* Info row */}
      <div className="flex gap-2.5 mt-2.5 px-0.5">
        <img
          src={channel.avatar}
          alt={channel.displayName}
          className="w-9 h-9 rounded-full bg-muted shrink-0 object-cover"
          loading="lazy"
        />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] text-foreground font-semibold line-clamp-2 leading-tight">
            {channel.title}
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            <p className="text-[12px] text-muted-foreground truncate">
              {channel.displayName}
            </p>
            <span className="text-[10px] text-muted-foreground/60">
              · {channel.category}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};
