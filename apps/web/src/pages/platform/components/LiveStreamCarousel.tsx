import React, { useState, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Users, Volume2, VolumeX } from "lucide-react";
import { StreamChannel, formatViewerCount, PLATFORM_META } from "../data/mockData";
import { getPlatformIcon } from "@/features/banners/ui/banner/PlatformIcons";
import { StreamPlayer, isEmbeddablePlatform } from "./StreamPlayer";
import { cn } from "@gaki/core/lib/utils";
import type { PlatformLayout } from "@/features/theme";

interface LiveStreamCarouselProps {
  streams: StreamChannel[];
  isLoading?: boolean;
  layout?: PlatformLayout;
}

export const LiveStreamCarousel: React.FC<LiveStreamCarouselProps> = ({ streams, isLoading, layout = "theater" }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [failedImages, setFailedImages] = useState(new Set<string>());
  const navigate = useNavigate();

  const liveStreams = streams.filter(stream => stream.isLive);
  const featured = liveStreams[activeIndex];

  const handleImageError = useCallback((id: string) => {
    setFailedImages(prev => new Set(prev).add(id));
  }, []);

  const handleThumbnailClick = useCallback((index: number) => {
    setActiveIndex(index);
    setIsMuted(true); // Mute when switching streams
  }, []);

  // Reset active index if streams change or become empty
  useEffect(() => {
    if (liveStreams.length === 0) {
      setActiveIndex(0);
    } else if (activeIndex >= liveStreams.length) {
      setActiveIndex(liveStreams.length - 1);
    }
  }, [liveStreams.length, activeIndex]);

  // Auto-rotate carousel every 8 seconds
  useEffect(() => {
    if (liveStreams.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % liveStreams.length);
      setIsMuted(true); // Mute on auto-switch for autoplay compliance
    }, 8000);
    return () => clearInterval(interval);
  }, [liveStreams.length]);

  if (!featured) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted rounded-lg text-muted-foreground">
        No live streams available.
      </div>
    );
  }

  const platformMeta = featured.platform ? PLATFORM_META[featured.platform] : null;
  const PIcon = featured.platform ? getPlatformIcon(featured.platform) : null;

  // -- Render Helpers --
  const renderFeaturedPlayer = (className?: string) => (
    <div className={cn("relative bg-black overflow-hidden group", className)}>
      <div className="absolute inset-0 pointer-events-none">
        {featured.streamUrl && isEmbeddablePlatform(featured.platform) ? (
          <StreamPlayer channel={featured} playing muted={isMuted} volume={0.5} />
        ) : (
          featured.thumbnail && !failedImages.has(featured.id) ? (
            <img
              src={featured.thumbnail}
              alt={featured.title}
              className="w-full h-full object-cover"
              onError={() => handleImageError(featured.id)}
            />
          ) : null
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />
    </div>
  );

  const renderStreamInfo = (className?: string, hideAvatar?: boolean) => (
    <div className={cn("flex items-end gap-4", className)}>
      {!hideAvatar && featured.avatar && !failedImages.has(`avatar-${featured.id}`) && (
        <img
          src={featured.avatar}
          alt={featured.displayName}
          className="w-14 h-14 rounded-full border-2 border-white/20 bg-muted shrink-0"
          onError={() => handleImageError(`avatar-${featured.id}`)}
        />
      )}
      <div className="flex-1 min-w-0">
        <h2 className="text-white text-2xl font-bold truncate drop-shadow-lg">
          {featured.title}
        </h2>
        <p className="text-white/80 text-base font-medium mt-0.5">
          {featured.displayName}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className="px-2.5 py-1 bg-black/60 backdrop-blur-sm text-white text-sm font-medium rounded-md flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            {formatViewerCount(featured.viewers)}
          </span>
          {platformMeta && PIcon && (
            <span
              className="px-2 py-1 text-sm font-bold rounded-md flex items-center gap-1"
              style={{ backgroundColor: platformMeta.color, color: platformMeta.textColor }}
            >
              <PIcon className="w-3.5 h-3.5" style={{ color: platformMeta.textColor }} />
              {platformMeta.label}
            </span>
          )}
          {featured.streamUrl && isEmbeddablePlatform(featured.platform) && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsMuted(!isMuted); }}
              className="p-1.5 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors ml-1"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderThumbnailStrip = (className?: string) => (
    <div className={cn("flex gap-2 overflow-x-auto pb-3 pt-1 px-1 carousel-scrollbar-modern", className)}>
      {liveStreams.map((stream, i) => {
        const isActive = i === activeIndex;
        const meta = stream.platform ? PLATFORM_META[stream.platform] : null;
        return (
          <Link
            key={stream.id}
            to={`/platform/stream/${stream.username}`}
            onClick={(e) => {
              e.preventDefault();
              handleThumbnailClick(i);
            }}
            onDoubleClick={() => navigate(`/platform/stream/${stream.username}`)}
            className={cn(
              "relative shrink-0 w-[180px] aspect-video rounded-lg overflow-hidden transition-all duration-300",
              isActive
                ? "ring-2 ring-primary scale-105 shadow-lg"
                : "opacity-50 hover:opacity-80 hover:scale-[1.02]"
            )}
          >
            <img
              src={stream.thumbnail}
              alt={stream.title}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={() => handleImageError(stream.id)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-1 left-1.5 right-1.5">
              <p className="text-white text-[11px] font-semibold truncate">
                {stream.displayName}
              </p>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                <span className="text-white/70 text-[10px]">
                  {formatViewerCount(stream.viewers)}
                </span>
              </div>
            </div>
            {meta && (
              <div
                className="absolute top-1 right-1 w-3 h-3 rounded-full border border-white/30"
                style={{ backgroundColor: meta.color }}
              />
            )}
          </Link>
        );
      })}
    </div>
  );

  // -- Layout Renderers --
  if (layout === "theater" || layout === "default") {
    return (
      <div className="relative w-full">
        <div className="relative w-full aspect-video max-h-[480px] group overflow-hidden">
          {renderFeaturedPlayer("w-full h-full")}
          <Link
            to={`/platform/stream/${featured.username}`}
            className="absolute bottom-20 left-0 right-0 px-6 z-10"
          >
            {renderStreamInfo()}
          </Link>
        </div>
        <div className="relative px-4 -mt-8 z-20">
          {renderThumbnailStrip()}
        </div>
      </div>
    );
  }

  if (layout === "cinematic") {
    return (
      <div className="relative w-full aspect-[21/9] sm:aspect-[3/1] max-h-[600px] mb-8 rounded-2xl overflow-hidden shadow-2xl group">
        {renderFeaturedPlayer("w-full h-full")}
        <Link
          to={`/platform/stream/${featured.username}`}
          className="absolute inset-0 flex flex-col justify-center items-center text-center p-8 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-black/40 backdrop-blur-sm"
        >
          {renderStreamInfo("flex-col items-center")}
        </Link>
        {/* Minimal dot navigation for cinematic */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
          {liveStreams.map((_, i) => (
            <button
              key={i}
              className={cn("w-2 h-2 rounded-full transition-all", i === activeIndex ? "bg-primary w-6" : "bg-white/50")}
              onClick={() => handleThumbnailClick(i)}
            />
          ))}
        </div>
      </div>
    );
  }

  if (layout === "magazine") {
    return (
      <div className="w-full flex flex-col lg:flex-row gap-4 mb-8 h-[500px]">
        <Link
          to={`/platform/stream/${featured.username}`}
          className="relative flex-1 rounded-2xl overflow-hidden shadow-xl"
        >
          {renderFeaturedPlayer("w-full h-full")}
          <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
            {renderStreamInfo()}
          </div>
        </Link>
        <div className="w-full lg:w-80 flex flex-col gap-3 overflow-y-auto carousel-scrollbar-modern snap-y">
          {liveStreams.map((stream, i) => {
            const isActive = i === activeIndex;
            return (
              <button
                key={stream.id}
                onClick={() => handleThumbnailClick(i)}
                onDoubleClick={() => navigate(`/platform/stream/${stream.username}`)}
                className={cn(
                  "flex items-start gap-3 p-2 rounded-xl transition-all text-left snap-start shrink-0",
                  isActive ? "bg-primary/10 border-primary" : "hover:bg-muted border-transparent"
                )}
              >
                <img
                  src={stream.thumbnail}
                  alt={stream.title}
                  className="w-24 aspect-video rounded-lg object-cover"
                  onError={() => handleImageError(stream.id)}
                />
                <div className="flex-1 min-w-0 py-0.5">
                  <p className={cn("text-xs font-bold line-clamp-2 leading-tight", isActive ? "text-primary" : "text-foreground")}>
                    {stream.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1 truncate">{stream.displayName}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (layout === "mosaic") {
    // A Pinterest-like block representing a large hero image surrounded by two smaller ones
    const sideStreams = liveStreams.slice(1, 3);
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <Link
          to={`/platform/stream/${featured.username}`}
          className="lg:col-span-2 relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl group"
        >
          {renderFeaturedPlayer("w-full h-full")}
          <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
            {renderStreamInfo()}
          </div>
        </Link>
        <div className="flex flex-col gap-4">
          {sideStreams.map((stream) => (
            <Link
              key={stream.id}
              to={`/platform/stream/${stream.username}`}
              className="relative flex-1 rounded-2xl overflow-hidden group shadow-md"
            >
              <img src={stream.thumbnail} className="absolute inset-0 w-full h-full object-cover" alt={stream.title}/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4 w-full">
                <p className="text-white font-bold truncate">{stream.title}</p>
                <p className="text-white/70 text-xs">{stream.displayName}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  if (layout === "feed") {
    return (
      <div className="w-full mb-8 bg-card border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 flex items-center gap-3">
          {featured.avatar && (
            <img src={featured.avatar} className="w-10 h-10 rounded-full" alt={featured.displayName} />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground text-sm truncate">{featured.displayName}</h3>
            <p className="text-xs text-muted-foreground truncate">{featured.category}</p>
          </div>
          {platformMeta && PIcon && (
            <PIcon className="w-5 h-5" style={{ color: platformMeta.color }} />
          )}
        </div>
        <div className="w-full aspect-square sm:aspect-[4/3] relative">
           {renderFeaturedPlayer("w-full h-full")}
        </div>
        <div className="p-4">
          <h2 className="text-lg font-bold text-foreground mb-1 line-clamp-2">{featured.title}</h2>
          <div className="flex items-center gap-4 mt-3">
            <span className="text-sm font-medium flex items-center gap-1.5 text-muted-foreground">
              <Users className="w-4 h-4 text-primary" /> {formatViewerCount(featured.viewers)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Cozy / Compact layouts (Separate Video & Thumbnails block)
  return (
    <div className="w-full mb-8">
      <Link
        to={`/platform/stream/${featured.username}`}
        className="w-full aspect-video rounded-xl overflow-hidden block mb-4 relative"
      >
        {renderFeaturedPlayer("w-full h-full")}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
           {renderStreamInfo("", true)}
        </div>
      </Link>
      <div className="px-1">
        {renderThumbnailStrip("pb-2")}
      </div>
    </div>
  );
};
