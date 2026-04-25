import { useEffect, useRef, useState } from "react";
import { type InteractiveFilter } from "@/data/types";

/**
 * HUD-only renderer for "interactive" filters.
 *
 * The actual visual filter is now produced by the WebGL pipeline
 * (`WebGLVideoCanvas`) and runs as a GPU fragment shader. This component is
 * strictly a DOM layer for:
 *   - tap ripples (the only sub-layer that captures pointer events)
 *   - lightweight per-filter HUD chrome (corner brackets + label)
 *
 * No `backdrop-filter`. No `mix-blend-mode`. The previous CSS pipeline was
 * killing iOS Safari performance.
 */

interface Props {
  filter: InteractiveFilter;
  onTap?: (x: number, y: number) => void;
}

interface HudSpec { color: string; label: string }

const HUDS: Record<string, HudSpec> = {
  thermal: { color: "#ff8800", label: "THERMAL · 36.7°C" },
  thermalImaging: { color: "#ff8800", label: "THERMAL · 36.7°C" },
  "infrared-fx": { color: "#ff66aa", label: "IR · NIGHT" },
  infrared: { color: "#ff66aa", label: "IR · NIGHT" },
  xray: { color: "#9fd8ff", label: "X-RAY · 80kV" },
  xrayVision: { color: "#9fd8ff", label: "X-RAY · 80kV" },
  dominator: { color: "#ff3355", label: "DOMINATOR · LOCK" },
  inspector: { color: "#aa66ff", label: "INSPECTOR · ID" },
  "neon-edge": { color: "#00ffff", label: "EDGE · DETECT" },
  matrix: { color: "#00ff66", label: "MATRIX · ONLINE" },
  hologram: { color: "#5de5ff", label: "HOLO · STREAM" },
  "hologram-fx": { color: "#5de5ff", label: "HOLO · STREAM" },
  cyberpunk: { color: "#00ddff", label: "CYBER · 2099" },
  ascii: { color: "#00ff66", label: "ASCII · 80×60" },
};

const HudCorners = ({ color, label }: HudSpec) => (
  <div className="absolute inset-3 pointer-events-none" style={{ color }}>
    {[
      "top-0 left-0 border-t-2 border-l-2",
      "top-0 right-0 border-t-2 border-r-2",
      "bottom-0 left-0 border-b-2 border-l-2",
      "bottom-0 right-0 border-b-2 border-r-2",
    ].map((cls, i) => (
      <div key={i} className={`absolute h-5 w-5 ${cls}`} style={{ borderColor: color }} />
    ))}
    <div
      className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] font-mono tracking-[0.3em]"
      style={{ color, textShadow: `0 0 6px ${color}` }}
    >
      {label}
    </div>
  </div>
);

interface Ripple { id: number; x: number; y: number }

const InteractiveFilterRenderer = ({ filter, onTap }: Props) => {
  const hud = HUDS[filter.id];
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    if (ripples.length === 0) return;
    const t = window.setTimeout(() => setRipples((r) => r.slice(1)), 700);
    return () => window.clearTimeout(t);
  }, [ripples]);

  const handlePointer = (e: React.PointerEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setRipples((r) => [...r, { id: idRef.current++, x, y }]);
    onTap?.(x, y);
  };

  return (
    <div className="absolute inset-0 z-[6] pointer-events-none">
      {hud && <HudCorners {...hud} />}

      {/* Tap-ripple layer — the only sub-layer that captures pointer events. */}
      <div
        className="absolute inset-0"
        style={{ pointerEvents: "auto", background: "transparent" }}
        onPointerUp={handlePointer}
      >
        {ripples.map((r) => (
          <span
            key={r.id}
            className="absolute rounded-full border-2 border-white/80 pointer-events-none"
            style={{
              left: `${r.x}%`,
              top: `${r.y}%`,
              width: 12,
              height: 12,
              transform: "translate(-50%, -50%)",
              animation: "fx-ripple 700ms ease-out both",
              boxShadow: "0 0 18px rgba(255,255,255,0.7)",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default InteractiveFilterRenderer;
