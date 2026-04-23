import { type CinematicEffect } from "@/data/cinematicShots";
import { type CinematicPreset } from "@/data/types";

/**
 * Renders a cinematic shot effect as a stack of CSS layers over the video.
 *
 * Strategy: each effect is described by a small behavior `Spec` (filter,
 * vignette, bars, tint, shake…). One renderer reads the spec and stacks the
 * appropriate layers — keeps 100+ effects manageable without a giant
 * per-effect React component.
 */

interface Spec {
  /** CSS `backdrop-filter` applied to the live video underneath. */
  filter?: string;
  /** Inset shadow vignette color, e.g. "rgba(0,0,0,0.6)". */
  vignette?: string;
  /** Letterbox bars: { side, sizePct, color } */
  bars?: Array<{ side: "top" | "bottom" | "left" | "right"; sizePct: number; color?: string; gradient?: boolean; glow?: string }>;
  /** Full-screen tint blended into video. */
  tint?: { background: string; blend?: React.CSSProperties["mixBlendMode"]; opacity?: number };
  /** Inner border (frame-in-frame). */
  border?: { color: string; width: number; inset?: number; radius?: number };
  /** Crosshair / grid overlay. */
  guides?: "crosshair" | "thirds" | "scanlines";
  /** Animation class on the wrapper (subtle motion). */
  motion?: "shake" | "drift" | "bob" | "pulse" | "rotate-slow" | "tilt" | "zoom-pulse" | "flicker" | "scan";
  /** Tilt the whole frame (Dutch angle). */
  rotate?: number;
  /** Optional class label (rec/live tag). */
  label?: { text: string; color: string; position: "tl" | "tr" };
  /** Half-frame side blur (split diopter). */
  splitDiopter?: "left" | "right";
  /** Off-center sweet spot (lensbaby). */
  offCenterFocus?: { x: number; y: number };
}

const SPECS: Partial<Record<CinematicEffect, Spec>> = {
  // ── Core ──
  "dolly-zoom": { vignette: "rgba(0,0,0,0.55)", motion: "zoom-pulse" },
  "letterbox": { bars: [{ side: "top", sizePct: 12 }, { side: "bottom", sizePct: 12 }] },
  "film-grain": { filter: "contrast(108%) saturate(95%)", tint: { background: "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%220.5%22/></svg>')", blend: "overlay", opacity: 0.5 } },
  "teal-orange": { filter: "saturate(120%) contrast(108%)", tint: { background: "linear-gradient(135deg, rgba(255,140,0,0.35), rgba(0,180,200,0.35))", blend: "color", opacity: 0.8 } },
  "vignette": { vignette: "rgba(0,0,0,0.7)" },
  "shallow-dof": { vignette: "rgba(0,0,0,0.45)", filter: "saturate(110%)" },
  "anamorphic-flare": { tint: { background: "linear-gradient(180deg, transparent 45%, rgba(80,180,255,0.45) 50%, transparent 55%)", blend: "screen" }, motion: "drift" },
  "bleach-bypass": { filter: "saturate(35%) contrast(140%) brightness(105%)" },
  "dutch-angle": { rotate: -6, vignette: "rgba(0,0,0,0.4)" },
  "split-diopter": { splitDiopter: "left" },

  // ── Letterbox ──
  "cinemascope": { bars: [{ side: "top", sizePct: 18 }, { side: "bottom", sizePct: 18 }] },
  "pillarbox": { bars: [{ side: "left", sizePct: 12 }, { side: "right", sizePct: 12 }] },
  "windowbox": { bars: [{ side: "top", sizePct: 8 }, { side: "bottom", sizePct: 8 }, { side: "left", sizePct: 8 }, { side: "right", sizePct: 8 }] },
  "soft-letterbox": { bars: [{ side: "top", sizePct: 12, gradient: true }, { side: "bottom", sizePct: 12, gradient: true }] },
  "color-letterbox": { bars: [{ side: "top", sizePct: 12, color: "#1a0a2e" }, { side: "bottom", sizePct: 12, color: "#1a0a2e" }] },
  "animated-letterbox": { bars: [{ side: "top", sizePct: 12 }, { side: "bottom", sizePct: 12 }], motion: "pulse" },
  "gradient-letterbox": { bars: [{ side: "top", sizePct: 12, color: "#2e1a1a", gradient: true }, { side: "bottom", sizePct: 12, color: "#2e1a1a", gradient: true }] },
  "neon-letterbox": { bars: [{ side: "top", sizePct: 12, glow: "#00ff88" }, { side: "bottom", sizePct: 12, glow: "#00ff88" }] },
  "vintage-letterbox": { bars: [{ side: "top", sizePct: 12, color: "#3a2a14" }, { side: "bottom", sizePct: 12, color: "#3a2a14" }], filter: "sepia(40%)" },
  "asymmetric-letterbox": { bars: [{ side: "top", sizePct: 5 }, { side: "bottom", sizePct: 22 }] },

  // ── Optical & Lens ──
  "fisheye": { filter: "contrast(105%)", vignette: "rgba(0,0,0,0.65)" },
  "ultra-wide": { vignette: "rgba(0,0,0,0.55)" },
  "wide-angle": { vignette: "rgba(0,0,0,0.4)" },
  "standard-perspective": { vignette: "rgba(0,0,0,0.2)" },
  "telephoto": { vignette: "rgba(0,0,0,0.7)", filter: "saturate(110%)" },
  "super-telephoto": { vignette: "rgba(0,0,0,0.85)" },
  "macro-closeup": { vignette: "rgba(0,0,0,0.75)" },
  "tilt-shift": { bars: [{ side: "top", sizePct: 25, gradient: true }, { side: "bottom", sizePct: 25, gradient: true }], filter: "saturate(125%)" },
  "split-diopter-focus": { splitDiopter: "left" },
  "anamorphic-cinema": { bars: [{ side: "top", sizePct: 10 }, { side: "bottom", sizePct: 10 }], tint: { background: "linear-gradient(180deg, transparent 48%, rgba(80,200,255,0.4) 50%, transparent 52%)", blend: "screen" } },
  "soft-focus": { filter: "blur(0.6px) brightness(108%) saturate(115%)" },
  "vintage-bloom": { filter: "saturate(115%) brightness(108%)", tint: { background: "radial-gradient(circle, rgba(255,200,140,0.35), transparent 60%)", blend: "screen" } },
  "pinhole": { vignette: "rgba(0,0,0,0.9)" },
  "probe-lens": { vignette: "rgba(0,0,0,0.85)" },
  "infrared-capture": { tint: { background: "linear-gradient(135deg, rgba(255,50,100,0.4), rgba(255,180,200,0.3))", blend: "color", opacity: 0.85 } },
  "thermal-camera": { filter: "contrast(120%)", tint: { background: "linear-gradient(45deg, #1d4ed8, #ef4444 55%, #facc15)", blend: "color", opacity: 0.85 } },
  "microscope-macro": { border: { color: "#33aaaa", width: 6, inset: 8, radius: 9999 }, vignette: "rgba(0,0,0,0.6)" },
  "lensbaby-blur": { offCenterFocus: { x: 35, y: 40 } },
  "spherical-lens": { vignette: "rgba(0,0,0,0.3)" },
  "zoom-ramp": { vignette: "rgba(0,0,0,0.55)", motion: "zoom-pulse" },

  // ── Framing ──
  "eye-level": { vignette: "rgba(0,0,0,0.25)" },
  "low-angle-hero": { bars: [{ side: "top", sizePct: 25, gradient: true }] },
  "high-angle": { bars: [{ side: "bottom", sizePct: 25, gradient: true }] },
  "birds-eye": { vignette: "rgba(0,0,0,0.7)" },
  "worms-eye": { bars: [{ side: "bottom", sizePct: 30, gradient: true }], tint: { background: "linear-gradient(180deg, rgba(120,180,255,0.25), transparent 40%)", blend: "screen" } },
  "dutch-tilt": { rotate: -5, vignette: "rgba(0,0,0,0.4)" },
  "forced-perspective": { bars: [{ side: "top", sizePct: 15, gradient: true }, { side: "bottom", sizePct: 15, gradient: true }] },
  "symmetrical": { guides: "crosshair" },
  "center-weighted": { vignette: "rgba(0,0,0,0.6)" },
  "rule-of-thirds": { guides: "thirds" },
  "extreme-closeup": { vignette: "rgba(0,0,0,0.85)" },
  "medium-portrait": { vignette: "rgba(0,0,0,0.55)" },
  "wide-environmental": { vignette: "rgba(0,0,0,0.3)" },
  "silhouette": { filter: "contrast(180%) brightness(70%) saturate(140%)", tint: { background: "rgba(60,30,10,0.3)", blend: "multiply" } },
  "frame-in-frame": { border: { color: "#886644", width: 6, inset: 14 }, vignette: "rgba(0,0,0,0.55)" },
  "negative-space": { vignette: "rgba(0,0,0,0.3)" },
  "shoulder-pov": { vignette: "rgba(0,0,0,0.4)" },
  "first-person-pov": { vignette: "rgba(0,0,0,0.6)" },
  "over-the-shoulder": { vignette: "rgba(0,0,0,0.4)" },
  "profile-side": { bars: [{ side: "left", sizePct: 18, gradient: true }, { side: "right", sizePct: 18, gradient: true }] },

  // ── Focus & Depth ──
  "shallow-depth-portrait": { vignette: "rgba(0,0,0,0.55)" },
  "deep-focus": { filter: "saturate(115%) contrast(108%)" },
  "rack-focus": { vignette: "rgba(0,0,0,0.45)", motion: "pulse" },
  "foreground-blur": { bars: [{ side: "top", sizePct: 30, gradient: true }] },
  "background-isolation": { vignette: "rgba(0,0,0,0.7)" },
  "split-focus-plane": { bars: [{ side: "top", sizePct: 25, gradient: true }, { side: "bottom", sizePct: 25, gradient: true }] },
  "hyperfocal": { filter: "saturate(115%) contrast(108%)" },
  "focus-breathing": { vignette: "rgba(0,0,0,0.45)", motion: "pulse" },
  "bokeh-emphasis": { tint: { background: "radial-gradient(circle at 70% 30%, rgba(255,220,140,0.35), transparent 50%)", blend: "screen" } },
  "foreground-obstruction": { vignette: "rgba(0,0,0,0.4)" },
  "focus-pull-reveal": { vignette: "rgba(0,0,0,0.5)", motion: "pulse" },
  "tilted-focus": { rotate: -3, vignette: "rgba(0,0,0,0.4)" },
  "manual-focus-drift": { filter: "blur(0.4px)", motion: "pulse" },
  "focus-stacking": { filter: "contrast(115%) saturate(120%)" },
  "dreamlike-defocus": { filter: "blur(0.8px) brightness(110%)", tint: { background: "rgba(204,170,221,0.18)", blend: "screen" } },

  // ── Motion ──
  "handheld-shake": { motion: "shake" },
  "locked-tripod": { vignette: "rgba(0,0,0,0.2)" },
  "slow-dolly": { motion: "drift" },
  "tracking-follow": { motion: "drift" },
  "steadicam-glide": { motion: "bob" },
  "crane-jib": { motion: "drift" },
  "orbit-circular": { motion: "rotate-slow", vignette: "rgba(0,0,0,0.4)" },
  "whip-pan": { motion: "shake" },
  "snap-zoom": { motion: "zoom-pulse" },
  "slow-motion": { tint: { background: "rgba(60,120,200,0.18)", blend: "overlay" } },
  "hyperlapse": { motion: "shake", filter: "contrast(110%)" },
  "timelapse": { motion: "flicker" },
  "rolling-shutter": { motion: "scan" },
  "parallax-slide": { motion: "drift" },
  "drone-glide": { motion: "bob", tint: { background: "rgba(85,187,221,0.15)", blend: "overlay" } },
  "shoulder-rig": { motion: "bob" },
  "crash-zoom": { motion: "zoom-pulse" },
  "long-take": { vignette: "rgba(0,0,0,0.25)" },
  "kinetic-chase": { motion: "shake" },
  "suspended-hover": { motion: "bob", tint: { background: "rgba(136,170,221,0.12)", blend: "screen" } },

  // ── Exposure ──
  "long-exposure": { filter: "blur(0.6px)", tint: { background: "rgba(68,102,204,0.18)", blend: "overlay" } },
  "high-shutter": { filter: "contrast(115%) saturate(120%)" },
  "motion-blur-smear": { bars: [{ side: "left", sizePct: 15, gradient: true }, { side: "right", sizePct: 15, gradient: true }] },
  "light-painting": { tint: { background: "radial-gradient(circle at 30% 40%, rgba(255,80,255,0.35), transparent 30%), radial-gradient(circle at 70% 60%, rgba(80,255,255,0.35), transparent 30%)", blend: "screen" } },
  "low-light-grain": { filter: "brightness(70%) contrast(125%) saturate(80%)" },
  "hdr-capture": { filter: "contrast(125%) saturate(135%)" },
  "flicker-blend": { motion: "flicker" },
  "overexposed-glow": { filter: "brightness(140%) saturate(85%)", tint: { background: "rgba(255,238,221,0.3)", blend: "screen" } },
  "underexposed-noir": { filter: "brightness(55%) saturate(40%) contrast(140%)" },
  "double-exposure": { tint: { background: "rgba(170,119,187,0.3)", blend: "difference" } },

  // ── Stylized ──
  "noir-shadow": { filter: "grayscale(100%) contrast(140%)", tint: { background: "linear-gradient(135deg, transparent 40%, rgba(0,0,0,0.65))", blend: "multiply" } },
  "documentary-verite": { motion: "shake", filter: "contrast(108%) saturate(95%)" },
  "surveillance": { filter: "grayscale(100%) contrast(120%) brightness(90%)", guides: "scanlines", label: { text: "● REC", color: "#33aa33", position: "tr" } },
  "security-fisheye": { filter: "grayscale(100%) contrast(115%)", vignette: "rgba(0,0,0,0.7)", label: { text: "LIVE", color: "#44bb44", position: "tl" } },
  "found-footage": { filter: "saturate(75%) contrast(110%)", motion: "flicker" },
  "vintage-film-emulation": { filter: "sepia(40%) saturate(85%) contrast(108%)" },
  "action-sports-pov": { vignette: "rgba(0,0,0,0.55)", tint: { background: "linear-gradient(135deg, rgba(255,119,51,0.18), transparent)", blend: "overlay" } },
  "miniature-diorama": { bars: [{ side: "top", sizePct: 30, gradient: true }, { side: "bottom", sizePct: 30, gradient: true }], filter: "saturate(140%) contrast(115%)" },
  "epic-widescreen": { bars: [{ side: "top", sizePct: 16 }, { side: "bottom", sizePct: 16 }], tint: { background: "radial-gradient(ellipse, transparent 50%, rgba(51,68,170,0.4))", blend: "overlay" } },
  "slow-reveal": { vignette: "rgba(0,0,0,0.6)", motion: "pulse" },
  "suspense-hold": { vignette: "rgba(102,51,51,0.6)", motion: "pulse" },
  "horror-creep": { filter: "saturate(60%) brightness(70%) contrast(120%)", tint: { background: "rgba(68,17,17,0.25)", blend: "multiply" }, motion: "zoom-pulse" },
  "hero-reveal": { vignette: "rgba(0,0,0,0.55)", motion: "zoom-pulse" },
  "montage-insert": { border: { color: "rgba(255,255,255,0.4)", width: 2, inset: 12 } },
  "experimental-abstract": { tint: { background: "conic-gradient(from 0deg, rgba(204,68,255,0.3), rgba(68,204,255,0.3), rgba(204,255,68,0.3), rgba(204,68,255,0.3))", blend: "overlay" }, motion: "rotate-slow" },
};

/** Convert a motion key to a CSS animation string. */
const MOTION_ANIM: Record<NonNullable<Spec["motion"]>, string> = {
  shake: "fx-cs-shake 0.6s ease-in-out infinite",
  drift: "fx-cs-drift 8s ease-in-out infinite",
  bob: "fx-cs-bob 4s ease-in-out infinite",
  pulse: "fx-cs-pulse 3s ease-in-out infinite",
  "rotate-slow": "fx-cs-rotate 30s linear infinite",
  tilt: "fx-cs-tilt 6s ease-in-out infinite",
  "zoom-pulse": "fx-cs-zoom 2.4s ease-in-out infinite",
  flicker: "fx-cs-flicker 1.2s steps(2, end) infinite",
  scan: "fx-cs-scan 2s linear infinite",
};

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
