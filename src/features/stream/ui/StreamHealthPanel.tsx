import React from "react";
import { useStreamHealthStore } from "@/stores/streamHealth.store";
import { useStreamStore } from "@/stores/stream.store";
import { useSceneCollectionStore } from "@/stores/sceneCollection.store";
import { Activity, Radio, WifiLow, WifiHigh } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export const StreamHealthPanel: React.FC = () => {
  const isBroadcasting = useStreamStore((s) => s.isBroadcasting);
  const metrics = useStreamHealthStore((s) => s.metrics);
  const outputConfig = useSceneCollectionStore((s) => s.outputConfig);

  // If we're not broadcasting, wait until we have metrics anyway just in case it's connecting
  if (!isBroadcasting || !metrics) {
    return null;
  }

  // Parse metrics
  const targetFps = outputConfig.fps;
  const currentFps = metrics.currentFps;
  const targetKbps = outputConfig.videoBitrate + outputConfig.audioBitrate;
  const currentKbps = metrics.currentKbps;

  // Determine System Status
  let fpsStatus: "stable" | "warning" | "critical" = "stable";
  if (currentFps < targetFps * 0.7) fpsStatus = "critical";
  else if (currentFps < targetFps * 0.9) fpsStatus = "warning";

  let bitrateStatus: "stable" | "warning" | "critical" = "stable";
  if (currentKbps < targetKbps * 0.5) bitrateStatus = "critical";
  else if (currentKbps < targetKbps * 0.8) bitrateStatus = "warning";

  // Format Timemark (e.g., '00:05:22.00' -> '05:22' or '01:05:22')
  let displayTime = "00:00";
  if (metrics.timemark) {
    const parts = metrics.timemark.split(":");
    if (parts.length === 3) {
      const hours = parseInt(parts[0], 10);
      const minutes = parts[1];
      const seconds = parts[2].split(".")[0];
      displayTime = hours > 0 ? `${hours}:${minutes}:${seconds}` : `${minutes}:${seconds}`;
    }
  }

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-background/80 backdrop-blur-md border border-border/50 rounded-full shadow-lg tabular-nums animate-in fade-in slide-in-from-top-4 pointer-events-auto">
      {/* Live Badge */}
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 font-semibold tracking-wide text-[10px] uppercase border border-red-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        LIVE {displayTime}
      </div>

      <div className="w-px h-4 bg-border/50" />

      {/* Bitrate */}
      <div className="flex items-center gap-1.5 text-xs">
        {bitrateStatus === "stable" ? (
          <WifiHigh className="w-3.5 h-3.5 text-green-500" />
        ) : (
          <WifiLow
            className={cn(
              "w-3.5 h-3.5",
              bitrateStatus === "warning" ? "text-amber-500" : "text-red-500 animate-pulse"
            )}
          />
        )}
        <span
          className={cn(
            "font-medium",
            bitrateStatus === "warning" && "text-amber-500",
            bitrateStatus === "critical" && "text-red-500"
          )}
        >
          {Math.round(currentKbps)} <span className="text-muted-foreground font-normal">kbps</span>
        </span>
      </div>

      {/* FPS */}
      <div className="flex items-center gap-1.5 text-xs">
        <Activity
          className={cn(
            "w-3.5 h-3.5",
            fpsStatus === "stable" && "text-green-500",
            fpsStatus === "warning" && "text-amber-500",
            fpsStatus === "critical" && "text-red-500 animate-pulse"
          )}
        />
        <span
          className={cn(
            "font-medium",
            fpsStatus === "warning" && "text-amber-500",
            fpsStatus === "critical" && "text-red-500"
          )}
        >
          {Math.round(currentFps)} <span className="text-muted-foreground font-normal">fps</span>
        </span>
      </div>
    </div>
  );
};
