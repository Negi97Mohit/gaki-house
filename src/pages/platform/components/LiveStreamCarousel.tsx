import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Users, Volume2, VolumeX } from "lucide-react";
import { StreamChannel, formatViewerCount, PLATFORM_META } from "../data/mockData";
import { getPlatformIcon } from "@/features/banners/ui/banner/PlatformIcons";
import { StreamPlayer, isEmbeddablePlatform } from "./StreamPlayer";
import { cn } from "@/shared/lib/utils";

interface LiveStreamCarouselProps {
  streams: StreamChannel[];
  isLoading?: boolean;
}

export const LiveStreamCarousel: React.FC<LiveStreamCarouselProps> = ({ streams, isLoading }) => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [userSelected, setUserSelected] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const liveStreams = streams
    .filter(s => s.isLive && s.thumbnail && !failedImages.has(s.id) && isEmbeddablePlatform(s.platform))
    .slice(0, 12);

  const startAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      if (!userSelected) {
        setActiveIndex(prev => (prev + 1) % Math.max(liveStreams.length, 1));
      }
    }, 6000);
  }, [liveStreams.length, userSelected]);

  useEffect(() => {
    startAutoPlay();
    return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); };
  }, [startAutoPlay]);

  useEffect(() => {
    if (!userSelected) return;
    const timer = setTimeout(() => setUserSelected(false), 30000);
    return () => clearTimeout(timer);
  }, [userSelected]);

  const handleThumbnailClick = (i: number) => {
    setUserSelected(true);
    setActiveIndex(i);
  };

  const handleImageError = (id: string) => {
    setFailedImages(prev => new Set(prev).add(id));
  };

  if (isLoading) {
    return <div className="w-full aspect-video max-h-[480px] bg-muted animate-pulse" />;
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

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />

        {/* Top badges */}
        <div className="absolute top-4 left-4 flex items-center gap-2 z-10 pointer-events-none">
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
        {featured.streamUrl && isEmbeddablePlatform(featured.platform) && (
          <button
            onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
            className="absolute top-4 right-4 z-20 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        )}

        {/* Stream info - pushed well above the thumbnail strip */}
        <Link
          to={`/platform/stream/${featured.username}`}
          className="absolute bottom-20 left-0 right-0 px-6 z-10"
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
              {featured.category && (
                <span className="text-white/60 text-xs mt-1 inline-block">{featured.category}</span>
              )}
            </div>
          </div>
        </Link>
      </div>

      {/* Thumbnail strip */}
      <div className="relative px-4 -mt-8 z-20">
        <div className="flex gap-2 overflow-x-auto pb-3 pt-1 px-1 carousel-scrollbar-modern">
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
                  "relative shrink-0 w-[130px] aspect-video rounded-lg overflow-hidden transition-all duration-300",
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
      </div>
    </div>
  );
};
