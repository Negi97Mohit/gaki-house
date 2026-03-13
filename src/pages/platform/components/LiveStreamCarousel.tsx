import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Users, Volume2, VolumeX } from "lucide-react";
import { StreamChannel, formatViewerCount, PLATFORM_META } from "../data/mockData";
import { getPlatformIcon } from "@/features/banners/ui/banner/PlatformIcons";
import { StreamPlayer } from "./StreamPlayer";
import { cn } from "@/shared/lib/utils";

interface LiveStreamCarouselProps {
  streams: StreamChannel[];
  isLoading?: boolean;
}

export const LiveStreamCarousel: React.FC<LiveStreamCarouselProps> = ({ streams, isLoading }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [userSelected, setUserSelected] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const liveStreams = streams
    .filter(s => s.isLive && s.streamUrl && s.thumbnail)
    .slice(0, 12);

  // Auto-rotate carousel (only thumbnails, no video)
  const startAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      if (hoveredIndex === null && !userSelected) {
        setActiveIndex(prev => (prev + 1) % Math.max(liveStreams.length, 1));
      }
    }, 6000);
  }, [liveStreams.length, hoveredIndex, userSelected]);

  useEffect(() => {
    startAutoPlay();
    return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); };
  }, [startAutoPlay]);

  // Reset userSelected after 30s of no interaction
  useEffect(() => {
    if (!userSelected) return;
    const timer = setTimeout(() => setUserSelected(false), 30000);
    return () => clearTimeout(timer);
  }, [userSelected]);

  const navigate = (dir: -1 | 1) => {
    setUserSelected(true);
    setActiveIndex(prev => {
      const next = prev + dir;
      if (next < 0) return liveStreams.length - 1;
      if (next >= liveStreams.length) return 0;
      return next;
    });
  };

  const handleThumbnailClick = (i: number) => {
    setUserSelected(true);
    setActiveIndex(i);
  };

  const handleImageError = (id: string) => {
    setFailedImages(prev => new Set(prev).add(id));
  };

  if (isLoading) {
    return (
      <div className="w-full aspect-video max-h-[480px] bg-muted animate-pulse rounded-none" />
    );
  }

  if (liveStreams.length === 0) return null;

  const featured = liveStreams[activeIndex];
  if (!featured) return null;

  const platformMeta = featured.platform ? PLATFORM_META[featured.platform] : null;
  const PIcon = featured.platform ? getPlatformIcon(featured.platform) : null;

  return (
    <div className="relative w-full">
      {/* Main featured stream */}
      <div className="relative w-full aspect-video max-h-[480px] bg-black overflow-hidden group">
        {/* Show stream player only when user clicked, otherwise show thumbnail */}
        <div className="absolute inset-0">
          {userSelected ? (
            <StreamPlayer
              channel={featured}
              playing={true}
              muted={isMuted}
              volume={0.5}
            />
          ) : (
            <img
              src={featured.thumbnail}
              alt={featured.title}
              className="w-full h-full object-cover"
              onError={() => handleImageError(featured.id)}
            />
          )}
        </div>

        {/* Gradient overlays - stronger at bottom to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent pointer-events-none" />

        {/* Top badges */}
        <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
          <span className="px-2.5 py-1 bg-destructive text-destructive-foreground text-xs font-bold uppercase rounded-md flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-destructive-foreground animate-pulse" />
            LIVE
          </span>
          <span className="px-2.5 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded-md flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            {formatViewerCount(featured.viewers)}
          </span>
          {platformMeta && PIcon && (
            <span
              className="px-2 py-1 text-xs font-bold rounded-md flex items-center gap-1"
              style={{ backgroundColor: platformMeta.color, color: platformMeta.textColor }}
            >
              <PIcon className="w-3.5 h-3.5" style={{ color: platformMeta.textColor }} />
              {platformMeta.label}
            </span>
          )}
        </div>

        {/* Volume toggle - only show when playing video */}
        {userSelected && (
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="absolute top-4 right-4 z-10 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        )}

        {/* Stream info overlay - positioned above thumbnail strip */}
        <Link
          to={`/platform/stream/${featured.username}`}
          className="absolute bottom-16 left-0 right-0 px-6 z-10"
        >
          <div className="flex items-end gap-4">
            {featured.avatar && !failedImages.has(`avatar-${featured.id}`) && (
              <img
                src={featured.avatar}
                alt={featured.displayName}
                className="w-14 h-14 rounded-full border-2 border-white/20 bg-muted shrink-0"
                onError={() => handleImageError(`avatar-${featured.id}`)}
              />
            )}
            <div className="flex-1 min-w-0">
              <h2 className="text-white text-xl font-bold truncate drop-shadow-lg">
                {featured.title}
              </h2>
              <p className="text-white/80 text-sm font-medium mt-0.5">
                {featured.displayName}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                {featured.category && (
                  <span className="text-white/60 text-xs">{featured.category}</span>
                )}
                {featured.tags.length > 0 && (
                  <>
                    <span className="text-white/30">•</span>
                    {featured.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-white/10 backdrop-blur-sm text-white/70 text-[10px] rounded-full">
                        {tag}
                      </span>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </Link>

        {/* Nav arrows */}
        <button
          onClick={() => navigate(-1)}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/40 backdrop-blur-sm rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => navigate(1)}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/40 backdrop-blur-sm rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Thumbnail strip - modern clean scrollbar */}
      <div className="relative px-4 -mt-6 z-20">
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto pb-3 carousel-scrollbar"
        >
          {liveStreams.map((stream, i) => {
            if (failedImages.has(stream.id)) return null;
            const isActive = i === activeIndex;
            const meta = stream.platform ? PLATFORM_META[stream.platform] : null;
            return (
              <button
                key={stream.id}
                onClick={() => handleThumbnailClick(i)}
                className={cn(
                  "relative shrink-0 w-[140px] aspect-video rounded-lg overflow-hidden border-2 transition-all duration-300",
                  isActive
                    ? "border-primary ring-1 ring-primary/30 scale-105"
                    : "border-transparent opacity-60 hover:opacity-90"
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
                  <p className="text-white text-[9px] font-semibold truncate">
                    {stream.displayName}
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                    <span className="text-white/70 text-[8px]">
                      {formatViewerCount(stream.viewers)}
                    </span>
                  </div>
                </div>
                {/* Platform dot */}
                {meta && (
                  <div
                    className="absolute top-1 right-1 w-3 h-3 rounded-full border border-white/30"
                    style={{ backgroundColor: meta.color }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
