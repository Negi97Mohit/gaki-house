import React, { useState, useRef, useCallback, useEffect } from "react";
import { X, Volume2, VolumeX, Maximize2, GripHorizontal } from "lucide-react";
import { usePip } from "../context/PipContext";
import { StreamPlayer } from "./StreamPlayer";
import { useNavigate } from "react-router-dom";
import { cn } from "@/shared/lib/utils";
import { zIndex } from "@/lib/zIndex";

const PIP_WIDTH = 400;
const PIP_HEIGHT = 225;
const EDGE_MARGIN = 16;

export const PipMiniPlayer: React.FC = () => {
  const { pip, closePip, togglePipMute } = usePip();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  // Position state (bottom-right by default)
  const [position, setPosition] = useState({ x: -1, y: -1 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [isClosing, setIsClosing] = useState(false);

  // Initialize position to bottom-right
  useEffect(() => {
    if (pip.isActive && position.x === -1) {
      setPosition({
        x: window.innerWidth - PIP_WIDTH - EDGE_MARGIN,
        y: window.innerHeight - PIP_HEIGHT - EDGE_MARGIN - 56, // account for mobile nav
      });
    }
  }, [pip.isActive]);

  // Reset position when PiP closes
  useEffect(() => {
    if (!pip.isActive) {
      setPosition({ x: -1, y: -1 });
      setIsClosing(false);
    }
  }, [pip.isActive]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    const touch = e.touches[0];
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      dragOffset.current = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (clientX: number, clientY: number) => {
      const x = Math.max(EDGE_MARGIN, Math.min(window.innerWidth - PIP_WIDTH - EDGE_MARGIN, clientX - dragOffset.current.x));
      const y = Math.max(EDGE_MARGIN, Math.min(window.innerHeight - PIP_HEIGHT - EDGE_MARGIN, clientY - dragOffset.current.y));
      setPosition({ x, y });
    };

    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onEnd = () => setIsDragging(false);

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onEnd);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, [isDragging]);

  const handleExpand = () => {
    if (pip.channel) {
      const username = pip.channel.username;
      closePip();
      navigate(`/platform/stream/${username}`);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(closePip, 200);
  };

  if (!pip.isActive || !pip.channel) return null;

  return (
    <div
      ref={containerRef}
      className={cn(
        "fixed rounded-xl overflow-hidden shadow-2xl border border-border/40 bg-black",
        "transition-shadow duration-300",
        isDragging ? "shadow-[0_20px_60px_-10px_rgba(0,0,0,0.6)] scale-[1.02]" : "hover:shadow-[0_15px_40px_-10px_rgba(0,0,0,0.4)]",
        isClosing && "animate-out fade-out-0 zoom-out-95 duration-200",
        !isClosing && "animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-300"
      )}
      style={{
        width: PIP_WIDTH,
        height: PIP_HEIGHT,
        left: position.x === -1 ? undefined : position.x,
        top: position.y === -1 ? undefined : position.y,
        right: position.x === -1 ? EDGE_MARGIN : undefined,
        bottom: position.y === -1 ? EDGE_MARGIN + 56 : undefined,
        zIndex: zIndex.dialog + 100,
        cursor: isDragging ? "grabbing" : "default",
        userSelect: "none",
      }}
    >
      {/* Video */}
      <div className="w-full h-full relative">
        <StreamPlayer
          channel={pip.channel}
          playing
          muted={pip.isMuted}
          volume={0.8}
          controls={false}
        />

        {/* Gradient overlay for controls */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/50 opacity-0 hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between pointer-events-none">
          {/* Top bar - drag handle + close */}
          <div className="flex items-center justify-between p-2.5 pointer-events-auto">
            <div
              className="flex items-center gap-1.5 cursor-grab active:cursor-grabbing px-2.5 py-1.5 rounded-lg bg-white/90 text-black shadow-md"
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
            >
              <GripHorizontal className="w-3.5 h-3.5 text-black/70" strokeWidth={2} />
              <span className="text-[10px] text-black/80 font-semibold select-none">
                {pip.channel.displayName}
              </span>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg bg-red-500 hover:bg-red-600 transition-colors shadow-md"
            >
              <X className="w-3.5 h-3.5 text-white" strokeWidth={2} />
            </button>
          </div>

          {/* Bottom bar - mute + expand */}
          <div className="flex items-center justify-between p-2.5 pointer-events-auto">
            <button
              onClick={togglePipMute}
              className="p-2 rounded-lg bg-white/90 hover:bg-white transition-colors shadow-md"
            >
              {pip.isMuted ? (
                <VolumeX className="w-4 h-4 text-black" strokeWidth={2} />
              ) : (
                <Volume2 className="w-4 h-4 text-black" strokeWidth={2} />
              )}
            </button>

            {/* Live badge */}
            {pip.channel.isLive && (
              <span className="px-2.5 py-1 bg-red-500 text-white text-[10px] font-bold rounded-md uppercase tracking-wide shadow-md">
                Live
              </span>
            )}

            <button
              onClick={handleExpand}
              className="p-2 rounded-lg bg-primary hover:bg-primary/90 transition-colors shadow-md"
            >
              <Maximize2 className="w-4 h-4 text-primary-foreground" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>

      {/* Progress-like accent bar at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary/80" />
    </div>
  );
};
