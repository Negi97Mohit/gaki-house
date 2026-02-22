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
    <div className="px-3 py-2.5">
      <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory">
        {liveStreams.map((stream) => (
          <Link
            key={stream.id}
            to={`/m/stream/${stream.username}`}
            className="flex flex-col items-center gap-1 shrink-0 snap-start active:scale-95 transition-transform"
          >
            {/* Gradient ring */}
            <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-fuchsia-500 via-rose-500 to-amber-400 shadow-sm shadow-rose-500/25">
              <div className="w-full h-full rounded-full p-[2px] bg-background">
                <img
                  src={stream.avatar}
                  alt={stream.displayName}
                  className="w-full h-full rounded-full object-cover bg-muted"
                  loading="lazy"
                />
              </div>
            </div>
            {/* Name */}
            <span className="text-[10px] text-muted-foreground font-medium w-14 text-center truncate leading-tight">
              {stream.displayName}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};
