import React, { useState } from "react";
import { Link } from "react-router-dom";
import { StreamChannel, formatViewerCount, PLATFORM_META, PlatformType } from "../data/mockData";
import { getPlatformIcon } from "@/features/banners/ui/banner/PlatformIcons";

interface StreamCardProps {
  channel: StreamChannel;
}

export const StreamCard: React.FC<StreamCardProps> = ({ channel }) => {
  const [imgError, setImgError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const platformInfo = channel.platform ? PLATFORM_META[channel.platform] : null;
  const PlatformIcon = channel.platform ? getPlatformIcon(channel.platform) : null;

  return (
    <Link
      to={`/platform/stream/${channel.username}`}
      className="group block"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video rounded-xl overflow-hidden bg-muted mb-2.5">
        {!imgError && channel.thumbnail ? (
          <img
            src={channel.thumbnail}
            alt={channel.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-xs text-muted-foreground/50">No preview</span>
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {channel.isLive && (
          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-destructive/90 backdrop-blur-sm text-destructive-foreground text-[10px] font-semibold uppercase rounded-md tracking-wider">
            Live
          </span>
        )}
        <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 bg-black/60 backdrop-blur-sm text-white text-[11px] font-medium rounded-md">
          {formatViewerCount(channel.viewers)} viewers
        </span>
        {platformInfo && PlatformIcon && (
          <span
            className="absolute top-2.5 right-2.5 px-1.5 py-0.5 text-[10px] font-semibold rounded-md flex items-center gap-1 backdrop-blur-sm"
            style={{ backgroundColor: `${platformInfo.color}dd`, color: platformInfo.textColor }}
          >
            <PlatformIcon className="w-3 h-3" style={{ color: platformInfo.textColor }} />
            {platformInfo.label}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex gap-2.5">
        {!avatarError && channel.avatar ? (
          <img
            src={channel.avatar}
            alt={channel.displayName}
            className="w-9 h-9 rounded-full bg-muted shrink-0 mt-0.5 ring-1 ring-border/10"
            onError={() => setAvatarError(true)}
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-muted/60 shrink-0 mt-0.5 flex items-center justify-center text-xs font-semibold text-muted-foreground/70 ring-1 ring-border/10">
            {channel.displayName.charAt(0)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm text-foreground font-semibold truncate leading-tight group-hover:text-primary transition-colors duration-200">
            {channel.title}
          </p>
          <p className="text-[13px] text-muted-foreground/70 truncate mt-0.5">
            {channel.displayName}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            {platformInfo && PlatformIcon && (
              <span
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold rounded-md"
                style={{ backgroundColor: `${platformInfo.color}15`, color: platformInfo.color }}
              >
                <PlatformIcon className="w-2.5 h-2.5" style={{ color: platformInfo.color }} />
                {platformInfo.label}
              </span>
            )}
            <span className="text-[12px] text-muted-foreground/50 truncate">
              {channel.category}
            </span>
          </div>
          {channel.tags.length > 0 && (
            <div className="flex gap-1 mt-1.5 flex-wrap">
              {channel.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-muted/50 text-muted-foreground/70 text-[10px] rounded-md font-medium hover:bg-accent/40 transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};
