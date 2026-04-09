import React, { useEffect, useState, useCallback } from "react";
import { X } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface TelemetryData {
  fps: number;
  memoryMb: number;
  isFailed: boolean;
}

export const BroadcastStatsPanel: React.FC = () => {
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    fps: 0,
    memoryMb: 0,
    isFailed: false,
  });
  const [isHidden, setIsHidden] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleTelemetry = (e: any) => {
      setTelemetry((e as CustomEvent<TelemetryData>).detail);
    };
    const handleFailure = () => {
      setTelemetry((prev) => ({ ...prev, isFailed: true }));
    };
    window.addEventListener("broadcast-telemetry", handleTelemetry);
    window.addEventListener("broadcast-engine-failure", handleFailure);
    return () => {
      window.removeEventListener("broadcast-telemetry", handleTelemetry);
      window.removeEventListener("broadcast-engine-failure", handleFailure);
    };
  }, []);

  // Corner hover zone detection
  useEffect(() => {
    if (!isHidden) return;
    const handleMouseMove = (e: MouseEvent) => {
      const threshold = 80;
      const inCorner =
        window.innerWidth - e.clientX <= threshold &&
        window.innerHeight - e.clientY <= threshold;
      setIsHovered(inCorner);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isHidden]);

  const getFpsColor = () => {
    if (telemetry.isFailed || telemetry.fps < 20) return "text-red-400";
    if (telemetry.fps < 45) return "text-yellow-400";
    return "text-emerald-400";
  };

  const getDotColor = () => {
    if (telemetry.isFailed || telemetry.fps < 20) return "bg-red-400 animate-pulse";
    if (telemetry.fps < 45) return "bg-yellow-400";
    return "bg-emerald-400";
  };

  const visible = !isHidden || isHovered;

  return (
    <div
      className={cn(
        "fixed bottom-3 right-3 z-50 select-none transition-all duration-300 ease-out",
        visible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-2 scale-95 pointer-events-none"
      )}
      onMouseEnter={() => isHidden && setIsHovered(true)}
      onMouseLeave={() => isHidden && setIsHovered(false)}
    >
      <div
        className={cn(
          "flex items-center gap-3 px-3 py-1.5 rounded-lg",
          "bg-background/30 backdrop-blur-md",
          "border border-border/10",
          "text-[10px] tracking-wide font-mono"
        )}
      >
        {/* Status dot */}
        <div className={cn("w-1.5 h-1.5 rounded-full", getDotColor())} />

        {/* FPS */}
        <span className={cn("tabular-nums", getFpsColor())}>
          {telemetry.isFailed ? "FAIL" : `${telemetry.fps}`}
        </span>

        {/* Separator */}
        <span className="text-muted-foreground/30">·</span>

        {/* Memory */}
        <span className="text-muted-foreground/60 tabular-nums">
          {telemetry.memoryMb.toFixed(0)}M
        </span>

        {/* Failure message */}
        {telemetry.isFailed && (
          <>
            <span className="text-muted-foreground/30">·</span>
            <span className="text-red-400/80 text-[9px] uppercase tracking-widest">
              restart kernel
            </span>
          </>
        )}

        {/* Hide button */}
        <button
          onClick={() => {
            setIsHidden((prev) => !prev);
            setIsHovered(false);
          }}
          className="ml-1 p-0.5 rounded text-muted-foreground/40 hover:text-foreground/60 transition-colors"
          aria-label={isHidden ? "Pin stats panel" : "Hide stats panel"}
        >
          <X className="w-2.5 h-2.5" />
        </button>
      </div>
    </div>
  );
};
