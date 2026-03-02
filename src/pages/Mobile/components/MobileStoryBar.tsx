import React from "react";
import { Link } from "react-router-dom";
import { StreamChannel } from "@/pages/platform/data/mockData";

interface MobileStoryBarProps {
  streams: StreamChannel[];
}

export const MobileStoryBar: React.FC<MobileStoryBarProps> = ({ streams }) => {
  const liveStreams = streams.filter((s) => s.isLive).slice(0, 15);

  if (liveStreams.length === 0) return null;

  return (
    <div className="px-3 py-3" role="region" aria-label="Live streams">
      <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar snap-x snap-mandatory -webkit-overflow-scrolling-touch">
        {liveStreams.map((stream) => (
          <Link
            key={stream.id}
            to={`/m/stream/${stream.username}`}
            className="flex flex-col items-center gap-1.5 shrink-0 snap-start active:scale-95 transition-transform min-w-[64px]"
            aria-label={`Watch ${stream.displayName} live`}
          >
            {/* Gradient ring — larger for touch */}
            <div className="w-16 h-16 rounded-full p-[2.5px] bg-gradient-to-br from-fuchsia-500 via-rose-500 to-amber-400 shadow-md shadow-rose-500/20">
              <div className="w-full h-full rounded-full p-[2px] bg-background">
                <img
                  src={stream.avatar}
                  alt=""
                  className="w-full h-full rounded-full object-cover bg-muted"
                  loading="lazy"
                />
              </div>
            </div>
            {/* Name */}
            <span className="text-[10px] text-muted-foreground font-medium w-16 text-center truncate leading-tight">
              {stream.displayName}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};
