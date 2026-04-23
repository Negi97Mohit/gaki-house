import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, RefreshCcw, BarChart3, Radio, Eye, X, Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import MockChat from "@/components/MockChat";
import { useCamera } from "@/context/CameraContext";

type Phase = "idle" | "countdown" | "live" | "summary";

interface StudioScreenProps {
  onOpenAssets?: () => void;
}

const formatTime = (s: number) => {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
};

const StudioScreen = ({ onOpenAssets }: StudioScreenProps = {}) => {
  const [phase, setPhase] = useState<Phase>("idle");
  const [muted, setMuted] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [count, setCount] = useState(3);
  const [elapsed, setElapsed] = useState(0);
  const [viewers, setViewers] = useState(0);
  const peakViewersRef = useRef(0);

  const isLive = phase === "live";

  useEffect(() => {
    const handleGlobalTouch = (e: TouchEvent | MouseEvent) => {
      const target = e.target as HTMLElement;
      const zIndex = window.getComputedStyle(target).zIndex;
      console.log(`[🔍 GLOBAL TAP] Event: ${e.type}`);
      console.log(`[🔍 GLOBAL TAP] Element:`, target.tagName);
      console.log(`[🔍 GLOBAL TAP] Classes:`, target.className);
      console.log(`[🔍 GLOBAL TAP] Z-Index:`, zIndex);
    };
    
    window.addEventListener('touchstart', handleGlobalTouch);
    window.addEventListener('click', handleGlobalTouch);
    return () => {
      window.removeEventListener('touchstart', handleGlobalTouch);
      window.removeEventListener('click', handleGlobalTouch);
    };
  }, []);

  // Countdown 3..2..1
  useEffect(() => {
    if (phase !== "countdown") return;
    setCount(3);
    let n = 3;
    const id = setInterval(() => {
      n -= 1;
      if (n <= 0) {
        clearInterval(id);
        setElapsed(0);
        setViewers(12);
        peakViewersRef.current = 12;
        setPhase("live");
      } else {
        setCount(n);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  // Live timer + simulated viewer growth
  useEffect(() => {
    if (phase !== "live") return;
    const tick = setInterval(() => setElapsed((s) => s + 1), 1000);
    const grow = setInterval(() => {
      setViewers((v) => {
        const next = Math.max(1, v + Math.floor(Math.random() * 9) - 2);
        if (next > peakViewersRef.current) peakViewersRef.current = next;
        return next;
      });
    }, 1500);
    return () => {
      clearInterval(tick);
      clearInterval(grow);
    };
  }, [phase]);

  const startCountdown = () => setPhase("countdown");
  const endStream = () => setPhase("summary");
  const dismissSummary = () => {
    setPhase("idle");
    setElapsed(0);
    setViewers(0);
  };

  const { flip, swapping } = useCamera();

  const handleMute = () => {
    setMuted((m) => {
      const next = !m;
      toast(next ? "Microphone muted" : "Microphone unmuted", {
        description: next ? "Viewers can't hear you." : "You're audible again.",
      });
      return next;
    });
  };

  const handleFlip = () => {
    if (swapping) return;
    flip();
    toast("Flipping camera…");
  };

  const quickActions = [
    {
      id: "asset",
      icon: Plus,
      label: "Add asset",
      tone: "default" as const,
      onClick: () => onOpenAssets?.(),
    },
    {
      id: "mic",
      icon: muted ? MicOff : Mic,
      label: muted ? "Unmute" : "Mute mic",
      active: muted,
      tone: muted ? ("danger" as const) : ("default" as const),
      onClick: handleMute,
    },
    { id: "flip", icon: RefreshCcw, label: "Flip camera", tone: "default" as const, onClick: handleFlip },
    {
      id: "stats",
      icon: BarChart3,
      label: "Toggle stats",
      active: showStats,
      tone: "default" as const,
      onClick: () => setShowStats((s) => !s),
    },
  ];

  return (
    <div className="relative h-full w-full pointer-events-none">
      {/* Top-left information area */}
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

      <MockChat />

      {/* Bottom Go Live / End Stream */}
      {/* Quick action rail — vertical, right side */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-[100] flex flex-col w-fit h-fit gap-2.5 animate-fade-in-up pointer-events-auto">
        {quickActions.map((a) => {
          const Icon = a.icon;
          const isActive = "active" in a ? a.active : false;
          const danger = a.tone === "danger";
          return (
            <button
              key={a.id}
              onPointerDown={(e) => { console.log(`[🔥 QUICK ACTION] pointerDown (${a.id})`); e.stopPropagation(); }}
              onPointerUp={(e) => e.stopPropagation()}
              onTouchStart={(e) => { console.log(`[🔥 QUICK ACTION] touchStart (${a.id})`); e.stopPropagation(); }}
              onTouchEnd={(e) => {
                console.log(`[🔥 QUICK ACTION] touchEnd (${a.id})`);
                e.stopPropagation();
                e.preventDefault();
                a.onClick();
              }}
              onClick={(e) => {
                console.log(`[🔥 QUICK ACTION] click (${a.id})`);
                e.stopPropagation();
                a.onClick();
              }}
              aria-label={a.label}
              className={cn(
                "cursor-pointer h-11 w-11 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90 border backdrop-blur-md shadow-soft",
                danger
                  ? "bg-red-500/60 border-red-400/70 text-white"
                  : isActive
                  ? "bg-white/85 border-white/60 text-neutral-900"
                  : "bg-white/40 border-white/50 text-neutral-900"
              )}
            >
              <Icon className="h-[17px] w-[17px]" strokeWidth={2.2} />
            </button>
          );
        })}
      </div>

      {/* Bottom Go Live / End Stream — always rendered so it doesn't vanish during countdown */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-[100] flex w-fit h-fit animate-fade-in-up pointer-events-auto">
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
            "cursor-pointer relative h-16 w-16 rounded-full flex items-center justify-center transition-all duration-500 active:scale-95 shadow-float border disabled:opacity-80",
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
          <span className="absolute -bottom-6 text-[10px] font-bold tracking-[0.18em] uppercase whitespace-nowrap text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
            {phase === "countdown" ? "Starting…" : isLive ? "End Stream" : "Go Live"}
          </span>
        </button>
      </div>

      {/* Countdown overlay */}
      {phase === "countdown" && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div
            key={count}
            className="font-display text-white text-[12rem] leading-none drop-shadow-[0_8px_30px_rgba(0,0,0,0.6)]"
            style={{ animation: "fade-in-up 0.4s var(--ease-out-soft) both" }}
          >
            {count}
          </div>
        </div>
      )}

      {/* Stream Ended summary */}
      {phase === "summary" && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-md p-6 pointer-events-auto">
          <div
            className="w-full max-w-sm bg-white/90 backdrop-blur-2xl rounded-[2rem] border border-white/60 shadow-elevated p-6 text-center"
            style={{ animation: "fade-in-up 0.4s var(--ease-out-soft) both" }}
          >
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-900/60 mb-1">
              Stream Ended
            </div>
            <h2 className="font-display text-3xl text-neutral-900 mb-5">Nice stream 👏</h2>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="rounded-2xl bg-neutral-900/5 border border-neutral-900/10 p-4">
                <div className="text-[10px] font-semibold tracking-wider uppercase text-neutral-900/50">Duration</div>
                <div className="font-display text-2xl text-neutral-900 tabular-nums mt-1">{formatTime(elapsed)}</div>
              </div>
              <div className="rounded-2xl bg-neutral-900/5 border border-neutral-900/10 p-4">
                <div className="text-[10px] font-semibold tracking-wider uppercase text-neutral-900/50">Peak viewers</div>
                <div className="font-display text-2xl text-neutral-900 tabular-nums mt-1">{peakViewersRef.current}</div>
              </div>
            </div>

            <button
              onClick={dismissSummary}
              className="w-full h-12 rounded-2xl bg-neutral-900 text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.99] transition-transform"
            >
              <X className="h-4 w-4" />
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudioScreen;
