import React from "react";
import { PLATFORM_META, type PlatformType, type StreamDestination } from "../data/mockData";
import { getPlatformIcon } from "@/features/banners/ui/banner/PlatformIcons";
import { cn } from "@gaki/core/lib/utils";

interface DestinationBadgesProps {
  destinations: StreamDestination[];
  size?: "sm" | "md";
  className?: string;
}

export const DestinationBadges: React.FC<DestinationBadgesProps> = ({
  destinations,
  size = "sm",
  className,
}) => {
  const liveDestinations = destinations.filter((d) => d.isLive);

  if (liveDestinations.length === 0) return null;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <span
        className={cn(
          "text-muted-foreground/60 font-medium shrink-0",
          size === "sm" ? "text-[10px]" : "text-xs"
        )}
      >
        Also on
      </span>
      <div className="flex items-center gap-0.5">
        {liveDestinations.map((dest) => {
          const meta = PLATFORM_META[dest.platform];
          const Icon = getPlatformIcon(dest.platform);
          return (
            <div
              key={dest.platform}
              className={cn(
                "flex items-center gap-0.5 rounded-full border border-white/[0.06]",
                size === "sm" ? "px-1.5 py-0.5" : "px-2 py-1"
              )}
              style={{ backgroundColor: `${meta.color}18` }}
              title={`${meta.label}${dest.externalViewers ? ` · ${dest.externalViewers.toLocaleString()} viewers` : ""}`}
            >
              <Icon
                className={cn(size === "sm" ? "w-2.5 h-2.5" : "w-3.5 h-3.5")}
                style={{ color: meta.color }}
              />
              {size === "md" && (
                <span
                  className="text-[10px] font-semibold"
                  style={{ color: meta.color }}
                >
                  {meta.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
