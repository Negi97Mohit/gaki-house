import React, { useState } from "react";
import { Link } from "react-router-dom";
import { StreamChannel, formatViewerCount, PLATFORM_META } from "../data/mockData";
import { getPlatformIcon } from "@/features/banners/ui/banner/PlatformIcons";
import { StreamPlayer, isEmbeddablePlatform } from "./StreamPlayer";
import { cn } from "@/shared/lib/utils";
import type { PlatformLayout } from "@/features/theme";

interface StreamCardHoverProps {
  channel: StreamChannel;
  layout?: PlatformLayout;
  featured?: boolean;
}

export const StreamCardHover: React.FC<StreamCardHoverProps> = ({ channel, layout = "default", featured = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const platformInfo = channel.platform ? PLATFORM_META[channel.platform] : null;
  const PlatformIcon = channel.platform ? getPlatformIcon(channel.platform) : null;

  if (imgError && !channel.streamUrl) return null;

  const isFeed = layout === "feed";
  const isCinematic = layout === "cinematic";
  const isMosaic = layout === "mosaic";
  const isMagazineFeatured = layout === "magazine" && featured;
  const isCompact = layout === "compact";
  const isNetflix = layout === "netflix";
  const isHbo = layout === "hbo";
  const isAppleTv = layout === "appletv";
  const isDisneyPlus = layout === "disneyplus";
  const isSpotify = layout === "spotify";
  const isYoutube = layout === "youtube";

  // Mosaic: randomize aspect ratio for staggered effect
  const mosaicAspect = isMosaic
    ? ["aspect-video", "aspect-[4/3]", "aspect-[3/4]", "aspect-square", "aspect-[9/16]"][
        Math.abs(channel.id.charCodeAt(0) + channel.id.charCodeAt(1)) % 5
      ]
    : null;

  const thumbnailAspect = isCinematic
    ? "aspect-[21/9] sm:aspect-[3/1]"
    : isFeed
    ? "aspect-video"
    : isMagazineFeatured
    ? "h-full"
    : isNetflix || isDisneyPlus
    ? "aspect-[2/3]"
    : isHbo
    ? "aspect-[3/4]"
    : isAppleTv
    ? "aspect-[4/3]"
    : isSpotify
    ? "aspect-square"
    : isYoutube
    ? "aspect-video"
    : isCompact
    ? "aspect-video"
    : mosaicAspect || "aspect-video";

  return (
    <Link
      to={`/platform/stream/${channel.username}`}
      className={cn(
        "group block",
        (isFeed || isCinematic) && "w-full",
        isMosaic && "break-inside-avoid mb-3",
        isMagazineFeatured && "col-span-2 row-span-2 h-full",
        (isNetflix || isDisneyPlus) && "shrink-0 w-[140px] sm:w-[180px] snap-start",
        isSpotify && "block",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail / Live Preview */}
      <div className={cn(
        "relative rounded-xl overflow-hidden bg-muted mb-2",
        thumbnailAspect,
        isMagazineFeatured && "rounded-2xl",
        isDisneyPlus && "rounded-2xl",
        isSpotify && "rounded-lg",
        (isNetflix || isHbo) && "rounded-md",
      )}>
        {isHovered && channel.streamUrl && isEmbeddablePlatform(channel.platform) && channel.platform !== "twitch" ? (
          <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
            <StreamPlayer
              channel={channel}
              playing={true}
              muted={true}
              volume={0}
              controls={false}
              className="w-full h-full"
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

        {/* Viewer count */}
        <span className={cn(
          "absolute bottom-1.5 left-1.5 px-1.5 py-px bg-black/70 backdrop-blur-sm text-white text-xs font-medium rounded z-10",
          isMagazineFeatured && "text-sm px-2 py-0.5"
        )}>
          {formatViewerCount(channel.viewers)} viewers
        </span>

        {/* Platform badge */}
        {platformInfo && PlatformIcon && (
          <span
            className={cn(
              "absolute top-1.5 right-1.5 px-1 py-px text-[10px] font-bold rounded flex items-center gap-0.5 z-10",
              isMagazineFeatured && "text-xs px-1.5 py-0.5"
            )}
            style={{ backgroundColor: platformInfo.color, color: platformInfo.textColor }}
          >
            <PlatformIcon className={cn("w-2.5 h-2.5", isMagazineFeatured && "w-3 h-3")} style={{ color: platformInfo.textColor }} />
            {platformInfo.label}
          </span>
        )}

        {/* LIVE badge for feed/cinematic/magazine featured */}
        {(isFeed || isCinematic || isMagazineFeatured) && channel.isLive && (
          <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-destructive text-destructive-foreground text-[10px] font-bold uppercase rounded tracking-wide z-10">
            LIVE
          </span>
        )}

        {/* Hover play indicator */}
        {!isHovered && channel.streamUrl && isEmbeddablePlatform(channel.platform) && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            <div className={cn(
              "rounded-full bg-primary/90 flex items-center justify-center",
              isMagazineFeatured ? "w-12 h-12" : "w-7 h-7"
            )}>
              <svg className={cn("text-primary-foreground ml-0.5", isMagazineFeatured ? "w-5 h-5" : "w-3 h-3")} viewBox="0 0 24 24" fill="currentColor">
                <polygon points="6 3 20 12 6 21 6 3" />
              </svg>
            </div>
          </div>
        )}

        {/* Gradient overlay for magazine featured / streaming layouts */}
        {(isMagazineFeatured || isNetflix || isHbo || isAppleTv || isDisneyPlus) && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-[5]" />
        )}

        {/* Overlay info for streaming-style layouts */}
        {(isMagazineFeatured || isNetflix || isHbo || isDisneyPlus) && (
          <div className="absolute bottom-0 left-0 right-0 p-2.5 z-10">
            <p className={cn(
              "text-white font-bold truncate drop-shadow-lg",
              isMagazineFeatured ? "text-lg" : "text-xs"
            )}>{channel.title}</p>
            <p className="text-white/70 text-[10px] mt-0.5 truncate">{channel.displayName}</p>
          </div>
        )}
      </div>

      {/* Info - hidden for overlay layouts */}
      {!isMagazineFeatured && !isNetflix && !isHbo && !isDisneyPlus && (
        <div className={cn("flex gap-2.5", isFeed && "px-1")}>
          {!avatarError && channel.avatar ? (
            <img
              src={channel.avatar}
              alt={channel.displayName}
              className={cn(
                "rounded-full bg-muted shrink-0 mt-0.5",
                isFeed ? "w-10 h-10" : isCompact ? "w-7 h-7" : "w-9 h-9"
              )}
              onError={() => setAvatarError(true)}
            />
          ) : (
            <div className={cn(
              "rounded-full bg-muted shrink-0 mt-0.5 flex items-center justify-center text-xs font-bold text-muted-foreground",
              isFeed ? "w-10 h-10" : isCompact ? "w-7 h-7" : "w-9 h-9"
            )}>
              {channel.displayName.charAt(0)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className={cn(
              "text-foreground font-semibold truncate leading-tight",
              isFeed ? "text-base" : isCompact ? "text-xs" : "text-base"
            )}>
              {channel.title}
            </p>
            <p className={cn(
              "text-muted-foreground truncate mt-0.5",
              isCompact ? "text-[11px]" : "text-sm"
            )}>
              {channel.displayName}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {platformInfo && PlatformIcon && (
                <span
                  className="inline-flex items-center gap-0.5 px-1 py-0 text-xs font-semibold rounded"
                  style={{ backgroundColor: `${platformInfo.color}20`, color: platformInfo.color }}
                >
                  <PlatformIcon className="w-2.5 h-2.5" style={{ color: platformInfo.color }} />
                  {!isCompact && platformInfo.label}
                </span>
              )}
              <span className={cn("text-muted-foreground/70 truncate", isCompact ? "text-[11px]" : "text-[13px]")}>
                {channel.category}
              </span>
            </div>
            {!isCompact && channel.tags.length > 0 && (
              <div className="flex gap-1 mt-1.5 flex-wrap">
                {channel.tags.slice(0, isFeed ? 5 : 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-1.5 py-0.5 bg-muted text-muted-foreground text-[11px] rounded-full font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Link>
  );
};
