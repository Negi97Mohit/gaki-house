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
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const liveStreams = streams.filter(s => s.isLive && s.streamUrl).slice(0, 12);

  // Auto-rotate carousel
  const startAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      if (hoveredIndex === null) {
        setActiveIndex(prev => (prev + 1) % Math.max(liveStreams.length, 1));
      }
    }, 8000);
  }, [liveStreams.length, hoveredIndex]);

  useEffect(() => {
    startAutoPlay();
    return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); };
  }, [startAutoPlay]);

  const navigate = (dir: -1 | 1) => {
    setActiveIndex(prev => {
      const next = prev + dir;
      if (next < 0) return liveStreams.length - 1;
      if (next >= liveStreams.length) return 0;
      return next;
    });
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
        {/* Live stream player */}
        <div className="absolute inset-0">
          <StreamPlayer
            channel={featured}
            playing={true}
            muted={isMuted}
            volume={0.5}
          />
        </div>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-transparent pointer-events-none" />

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

        {/* Volume toggle */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Stream info overlay */}
        <Link
          to={`/platform/stream/${featured.username}`}
          className="absolute bottom-0 left-0 right-0 p-6 z-10"
        >
          <div className="flex items-end gap-4">
            <img
              src={featured.avatar}
              alt={featured.displayName}
              className="w-14 h-14 rounded-full border-2 border-primary/50 bg-muted shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h2 className="text-white text-xl font-bold truncate drop-shadow-lg">
                {featured.title}
              </h2>
              <p className="text-white/80 text-sm font-medium mt-0.5">
                {featured.displayName}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-white/60 text-xs">{featured.category}</span>
                <span className="text-white/30">•</span>
                {featured.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="px-2 py-0.5 bg-white/10 backdrop-blur-sm text-white/70 text-[10px] rounded-full">
                    {tag}
                  </span>
                ))}
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

      {/* Thumbnail strip below */}
      <div className="relative px-4 -mt-8 z-20">
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide pb-2"
        >
          {liveStreams.map((stream, i) => {
            const isActive = i === activeIndex;
            const meta = stream.platform ? PLATFORM_META[stream.platform] : null;
            return (
              <button
                key={stream.id}
                onClick={() => setActiveIndex(i)}
                onMouseEnter={() => {
                  setHoveredIndex(i);
                  setActiveIndex(i);
                }}
                onMouseLeave={() => setHoveredIndex(null)}
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

      {/* Progress indicators */}
      <div className="flex justify-center gap-1.5 mt-2 pb-2">
        {liveStreams.slice(0, 8).map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={cn(
              "h-1 rounded-full transition-all duration-300",
              i === activeIndex ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"
            )}
          />
        ))}
      </div>
    </div>
  );
};
