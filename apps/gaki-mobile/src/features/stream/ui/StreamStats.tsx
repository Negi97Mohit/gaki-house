import { Eye } from "lucide-react";

interface Props {
  isLive: boolean;
  elapsed: number;
  viewers: number;
  showStats: boolean;
  formatTime: (s: number) => string;
}

export function StreamStats({ isLive, elapsed, viewers, showStats, formatTime }: Props) {
  return (
    <div className="absolute top-5 left-5 z-20 flex flex-col items-start gap-2 pointer-events-none">
      {/* LIVE badge + timer + viewers */}
      {isLive && (
        <div className="animate-fade-in-up flex items-center gap-2">
          <div className="rounded-full px-2.5 py-1 flex items-center gap-1.5 bg-[hsl(var(--live))]/85 backdrop-blur-md text-white text-[11px] font-extrabold tracking-[0.15em]">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse-live" />
            LIVE
          </div>
          <div className="rounded-full px-2.5 py-1 bg-black/40 backdrop-blur-md text-white text-[11px] font-semibold tabular-nums">
            {formatTime(elapsed)}
          </div>
          <div className="rounded-full px-2.5 py-1 flex items-center gap-1 bg-black/40 backdrop-blur-md text-white text-[11px] font-semibold tabular-nums">
            <Eye className="h-3 w-3" strokeWidth={2.4} />
            {viewers}
          </div>
        </div>
      )}

      {/* FPS / bitrate stats */}
      {showStats && (
        <div className="animate-fade-in-up bg-white/20 backdrop-blur-lg border border-white/40 rounded-2xl px-3 py-2 text-neutral-900 text-[11px] font-medium leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-emerald-500" />
            <span className="tabular-nums">60 FPS</span>
          </div>
          <div className="text-neutral-900/70 tabular-nums mt-0.5">6500 kbps</div>
        </div>
      )}
    </div>
  );
}
