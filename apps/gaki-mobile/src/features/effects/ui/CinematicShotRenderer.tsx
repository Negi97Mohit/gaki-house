import { type CinematicPreset } from "@/data/types";
import { SPECS, MOTION_ANIM, type Spec } from "../config/cinematicSpecs";

interface Props {
  preset: CinematicPreset;
}

const CinematicShotRenderer = ({ preset }: Props) => {
  // Fall back to a tinted vignette using the preset color so unmapped IDs still feel intentional.
  const spec: Spec = SPECS[preset.id] ?? {
    vignette: "rgba(0,0,0,0.4)",
    tint: { background: preset.color, blend: "overlay", opacity: 0.18 },
  };

  const wrapperStyle: React.CSSProperties = {
    transform: spec.rotate ? `rotate(${spec.rotate}deg)` : undefined,
    animation: spec.motion ? MOTION_ANIM[spec.motion] : undefined,
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={wrapperStyle}>
      {/* backdrop-filter on the live video underneath */}
      {spec.filter && (
        <div
          className="absolute inset-0"
          style={{ backdropFilter: spec.filter, WebkitBackdropFilter: spec.filter }}
        />
      )}

      {/* tint blended into the video */}
      {spec.tint && (
        <div
          className="absolute inset-0"
          style={{
            background: spec.tint.background,
            mixBlendMode: spec.tint.blend ?? "overlay",
            opacity: spec.tint.opacity ?? 1,
          }}
        />
      )}

      {/* split diopter — half-frame blur */}
      {spec.splitDiopter && (
        <div
          className="absolute inset-y-0"
          style={{
            [spec.splitDiopter]: 0,
            width: "50%",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
          } as React.CSSProperties}
        />
      )}

      {/* off-center sweet spot focus */}
      {spec.offCenterFocus && (
        <div
          className="absolute inset-0"
          style={{
            backdropFilter: "blur(5px)",
            WebkitBackdropFilter: "blur(5px)",
            WebkitMaskImage: `radial-gradient(circle at ${spec.offCenterFocus.x}% ${spec.offCenterFocus.y}%, transparent 18%, black 55%)`,
            maskImage: `radial-gradient(circle at ${spec.offCenterFocus.x}% ${spec.offCenterFocus.y}%, transparent 18%, black 55%)`,
          }}
        />
      )}

      {/* vignette */}
      {spec.vignette && (
        <div
          className="absolute inset-0"
          style={{ boxShadow: `inset 0 0 180px 60px ${spec.vignette}` }}
        />
      )}

      {/* letterbox / pillarbox bars */}
      {spec.bars?.map((b, i) => {
        const isHorizontal = b.side === "top" || b.side === "bottom";
        const baseStyle: React.CSSProperties = {
          [b.side]: 0,
          [isHorizontal ? "left" : "top"]: 0,
          [isHorizontal ? "right" : "bottom"]: 0,
          [isHorizontal ? "height" : "width"]: `${b.sizePct}%`,
        } as React.CSSProperties;
        const fill = b.gradient
          ? `linear-gradient(${b.side === "top" ? "180deg" : b.side === "bottom" ? "0deg" : b.side === "left" ? "90deg" : "270deg"}, ${b.color ?? "rgba(0,0,0,0.95)"}, transparent)`
          : b.color ?? "#000";
        return (
          <div
            key={i}
            className="absolute"
            style={{
              ...baseStyle,
              background: fill,
              boxShadow: b.glow ? `0 0 16px ${b.glow}, inset 0 0 8px ${b.glow}` : undefined,
            }}
          />
        );
      })}

      {/* inner border / frame */}
      {spec.border && (
        <div
          className="absolute"
          style={{
            inset: spec.border.inset ?? 8,
            border: `${spec.border.width}px solid ${spec.border.color}`,
            borderRadius: spec.border.radius ?? 12,
          }}
        />
      )}

      {/* guides */}
      {spec.guides === "crosshair" && (
        <>
          <div className="absolute inset-y-0 left-1/2 w-px bg-white/40" />
          <div className="absolute inset-x-0 top-1/2 h-px bg-white/40" />
        </>
      )}
      {spec.guides === "thirds" && (
        <>
          <div className="absolute inset-y-0 left-1/3 w-px bg-white/30" />
          <div className="absolute inset-y-0 left-2/3 w-px bg-white/30" />
          <div className="absolute inset-x-0 top-1/3 h-px bg-white/30" />
          <div className="absolute inset-x-0 top-2/3 h-px bg-white/30" />
        </>
      )}
      {spec.guides === "scanlines" && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(0,0,0,0.35) 0 1px, transparent 1px 3px)",
            mixBlendMode: "multiply",
          }}
        />
      )}

      {/* corner label */}
      {spec.label && (
        <div
          className={`absolute font-mono text-[11px] tracking-[0.2em] ${
            spec.label.position === "tl" ? "top-3 left-3" : "top-3 right-3"
          }`}
          style={{
            color: spec.label.color,
            textShadow: `0 0 6px ${spec.label.color}`,
            animation: "fx-rec-blink 1.2s steps(2,end) infinite",
          }}
        >
          {spec.label.text}
        </div>
      )}
    </div>
  );
};

export default CinematicShotRenderer;
