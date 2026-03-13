import React, { useState } from "react";
import { Link } from "react-router-dom";
import { StreamChannel, formatViewerCount, PLATFORM_META } from "../data/mockData";
import { getPlatformIcon } from "@/features/banners/ui/banner/PlatformIcons";
import { StreamPlayer } from "./StreamPlayer";
import { cn } from "@/shared/lib/utils";

interface StreamCardHoverProps {
  channel: StreamChannel;
}

export const StreamCardHover: React.FC<StreamCardHoverProps> = ({ channel }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const platformInfo = channel.platform ? PLATFORM_META[channel.platform] : null;
  const PlatformIcon = channel.platform ? getPlatformIcon(channel.platform) : null;

  // Don't render card if thumbnail failed
  if (imgError && !channel.streamUrl) return null;

  return (
    <Link
      to={`/platform/stream/${channel.username}`}
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail / Live Preview */}
      <div className="relative aspect-video rounded-xl overflow-hidden bg-muted mb-2">
        {isHovered && channel.streamUrl ? (
          <div className="absolute inset-0">
            <StreamPlayer
              channel={channel}
              playing={true}
              muted={true}
              volume={0}
            />
          </div>
        ) : (
          !imgError && channel.thumbnail ? (
            <img
              src={channel.thumbnail}
              alt={channel.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-xs text-muted-foreground">No preview</span>
            </div>
          )
        )}

        {/* Live badge */}
        {channel.isLive && (
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-destructive text-destructive-foreground text-[10px] font-bold uppercase rounded-md flex items-center gap-1 z-10">
            <span className="w-1.5 h-1.5 rounded-full bg-destructive-foreground animate-pulse" />
            LIVE
          </span>
        )}

        {/* Viewer count */}
        <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/70 backdrop-blur-sm text-white text-[11px] font-medium rounded-md z-10">
          {formatViewerCount(channel.viewers)} viewers
        </span>

        {/* Platform badge */}
        {platformInfo && PlatformIcon && (
          <span
            className="absolute top-2 right-2 px-1.5 py-0.5 text-[10px] font-bold rounded-md flex items-center gap-1 z-10"
            style={{ backgroundColor: platformInfo.color, color: platformInfo.textColor }}
          >
            <PlatformIcon className="w-3 h-3" style={{ color: platformInfo.textColor }} />
            {platformInfo.label}
          </span>
        )}

        {/* Hover play indicator */}
        {!isHovered && channel.streamUrl && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            <div className="w-10 h-10 rounded-full bg-primary/90 flex items-center justify-center">
              <svg className="w-4 h-4 text-primary-foreground ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="6 3 20 12 6 21 6 3" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex gap-2.5">
        {!avatarError && channel.avatar ? (
          <img
            src={channel.avatar}
            alt={channel.displayName}
            className="w-9 h-9 rounded-full bg-muted shrink-0 mt-0.5"
            onError={() => setAvatarError(true)}
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-muted shrink-0 mt-0.5 flex items-center justify-center text-xs font-bold text-muted-foreground">
            {channel.displayName.charAt(0)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm text-foreground font-semibold truncate leading-tight">
            {channel.title}
          </p>
          <p className="text-[13px] text-muted-foreground truncate mt-0.5">
            {channel.displayName}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            {platformInfo && PlatformIcon && (
              <span
                className="inline-flex items-center gap-0.5 px-1 py-0 text-[10px] font-semibold rounded"
                style={{ backgroundColor: `${platformInfo.color}20`, color: platformInfo.color }}
              >
                <PlatformIcon className="w-2.5 h-2.5" style={{ color: platformInfo.color }} />
                {platformInfo.label}
              </span>
            )}
            <span className="text-[12px] text-muted-foreground/70 truncate">
              {channel.category}
            </span>
          </div>
          {channel.tags.length > 0 && (
            <div className="flex gap-1 mt-1.5 flex-wrap">
              {channel.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-1.5 py-0.5 bg-muted text-muted-foreground text-[10px] rounded-full font-medium"
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
