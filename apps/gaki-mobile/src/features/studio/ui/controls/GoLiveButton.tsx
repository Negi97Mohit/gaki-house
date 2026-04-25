import { Radio } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  phase: "idle" | "countdown" | "live" | "summary";
  isLive: boolean;
  endStream: () => void;
  startCountdown: () => void;
}

export function GoLiveButton({ phase, isLive, endStream, startCountdown }: Props) {
  return (
    <div className="absolute bottom-32 inset-x-0 z-[100] flex justify-center animate-fade-in-up pointer-events-none">
      <button
        onPointerDown={(e) => { console.log("[🔥 GO LIVE] pointerDown"); e.stopPropagation(); }}
        onPointerUp={(e) => e.stopPropagation()}
        onTouchStart={(e) => { console.log("[🔥 GO LIVE] touchStart"); e.stopPropagation(); }}
        onTouchEnd={(e) => {
          console.log("[🔥 GO LIVE] touchEnd");
          e.stopPropagation();
          e.preventDefault();
          if (phase === "countdown") return;
          isLive ? endStream() : startCountdown();
        }}
        onClick={(e) => {
          console.log("[🔥 GO LIVE] click");
          e.stopPropagation();
          if (phase === "countdown") return;
          isLive ? endStream() : startCountdown();
        }}
        disabled={phase === "countdown"}
        aria-label={isLive ? "End stream" : "Go live"}
        className={cn(
          "pointer-events-auto cursor-pointer relative h-16 w-16 rounded-full flex items-center justify-center transition-all duration-500 active:scale-95 shadow-float border disabled:opacity-80",
          isLive
            ? "bg-[hsl(var(--live))] border-white/60"
            : "bg-white/20 backdrop-blur-lg border-white/40"
        )}
      >
        {isLive && (
          <div className="absolute inset-0 rounded-full bg-[hsl(var(--live))]/60 animate-pulse-live" />
        )}
        <div className="relative">
          {isLive ? (
            <div className="h-5 w-5 rounded-[5px] bg-white" />
          ) : (
            <Radio className="h-6 w-6 text-neutral-900" strokeWidth={2.4} />
          )}
        </div>
        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-[0.18em] uppercase whitespace-nowrap text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
          {phase === "countdown" ? "Starting…" : isLive ? "End Stream" : "Go Live"}
        </span>
      </button>
    </div>
  );
}
