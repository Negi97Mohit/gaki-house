import React from "react";
import { Link } from "react-router-dom";
import { StreamChannel, formatViewerCount } from "../data/mockData";

interface StreamCardProps {
  channel: StreamChannel;
}

export const StreamCard: React.FC<StreamCardProps> = ({ channel }) => {
  return (
    <Link
      to={`/platform/stream/${channel.username}`}
      className="group block"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-900 mb-2">
        <img
          src={channel.thumbnail}
          alt={channel.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {/* Live badge */}
        {channel.isLive && (
          <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-red-600 text-white text-[10px] font-bold uppercase rounded tracking-wide">
            Live
          </span>
        )}
        {/* Viewer count */}
        <span className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-black/70 text-white text-[11px] font-medium rounded">
          {formatViewerCount(channel.viewers)} viewers
        </span>
      </div>

      {/* Info */}
      <div className="flex gap-2.5">
        <img
          src={channel.avatar}
          alt={channel.displayName}
          className="w-8 h-8 rounded-full bg-zinc-800 shrink-0 mt-0.5"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm text-white font-semibold truncate leading-tight">
            {channel.title}
          </p>
          <p className="text-[13px] text-zinc-400 truncate mt-0.5">
            {channel.displayName}
          </p>
          <p className="text-[12px] text-zinc-500 truncate">
            {channel.category}
          </p>
          {/* Tags */}
          <div className="flex gap-1 mt-1.5 flex-wrap">
            {channel.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 bg-zinc-800 text-zinc-400 text-[10px] rounded font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
};
