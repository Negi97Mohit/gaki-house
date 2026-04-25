import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import MockChat from "@/features/stream/ui/MockChat";
import { useCamera } from "@/context/CameraContext";
import { StreamStats } from "@/features/stream/ui/StreamStats";
import { QuickActions } from "./controls/QuickActions";
import { GoLiveButton } from "./controls/GoLiveButton";
import { CountdownOverlay } from "@/features/stream/ui/CountdownOverlay";
import { StreamSummary } from "@/features/stream/ui/StreamSummary";

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

  return (
    <div className="relative h-full w-full pointer-events-none">
      {/* Top-left information area */}
      <StreamStats 
        isLive={isLive}
        elapsed={elapsed}
        viewers={viewers}
        showStats={showStats}
        formatTime={formatTime}
      />

      <MockChat />

      {/* Quick action rail — vertical, right side */}
      <QuickActions 
        muted={muted}
        showStats={showStats}
        onOpenAssets={onOpenAssets}
        handleMute={handleMute}
        handleFlip={handleFlip}
        setShowStats={setShowStats}
      />

      {/* Bottom Go Live / End Stream */}
      <GoLiveButton 
        phase={phase}
        isLive={isLive}
        endStream={endStream}
        startCountdown={startCountdown}
      />

      {/* Countdown overlay */}
      {phase === "countdown" && <CountdownOverlay count={count} />}

      {/* Stream Ended summary */}
      {phase === "summary" && (
        <StreamSummary 
          elapsed={elapsed}
          peakViewers={peakViewersRef.current}
          formatTime={formatTime}
          dismissSummary={dismissSummary}
        />
      )}
    </div>
  );
};

export default StudioScreen;
