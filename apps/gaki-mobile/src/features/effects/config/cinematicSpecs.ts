import type { CinematicEffect } from "@/data/cinematicShots";

export interface OverlaySpec {
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
  /** Optional class label (rec/live tag). */
  label?: { text: string; color: string; position: "tl" | "tr" };
}

// These are ONLY the static overlay graphics. 
// Transforms, camera movements, and distortions are handled by Tier 1/2/3 pipelines.
export const OVERLAY_SPECS: Partial<Record<CinematicEffect, OverlaySpec>> = {
  "dolly-zoom": { vignette: "rgba(0,0,0,0.55)" },
  "push-in": { vignette: "rgba(0,0,0,0.3)" },
  "pull-out": { vignette: "rgba(0,0,0,0.4)" }, 
  "arc-shot": { vignette: "rgba(0,0,0,0.3)" },
  "oner": { vignette: "rgba(0,0,0,0.2)" },
  
  "establishing-shot": { vignette: "rgba(0,0,0,0.15)" },
  "extreme-closeup": { vignette: "rgba(0,0,0,0.85)" },
  "cowboy-shot": { vignette: "rgba(0,0,0,0.3)" },
  "two-shot": { vignette: "rgba(0,0,0,0.2)" },
  "over-the-shoulder": { vignette: "rgba(0,0,0,0.4)" },
  "pov-shot": { vignette: "rgba(0,0,0,0.6)" },
  
  "birds-eye-view": { vignette: "rgba(0,0,0,0.7)" },
  "worms-eye-view": { bars: [{ side: "bottom", sizePct: 25, gradient: true }] },
  "dutch-angle": { vignette: "rgba(0,0,0,0.4)" },
  
  "symmetrical": { guides: "crosshair" },
  "rule-of-thirds": { guides: "thirds" },
  "frame-in-frame": { border: { color: "#886644", width: 6, inset: 14 }, vignette: "rgba(0,0,0,0.55)" },
  
  "shallow-dof": { vignette: "rgba(0,0,0,0.45)", filter: "saturate(110%)" },
  "anamorphic-flare": { tint: { background: "linear-gradient(180deg, transparent 45%, rgba(80,180,255,0.45) 50%, transparent 55%)", blend: "screen" } },
  "fisheye": { filter: "contrast(105%)", vignette: "rgba(0,0,0,0.65)" },
  "ultra-wide": { vignette: "rgba(0,0,0,0.55)" },
  "telephoto": { vignette: "rgba(0,0,0,0.7)", filter: "saturate(110%)" },
  "tilt-shift": { bars: [{ side: "top", sizePct: 25, gradient: true }, { side: "bottom", sizePct: 25, gradient: true }], filter: "saturate(125%)" },
  
  "rack-focus": { vignette: "rgba(0,0,0,0.45)" },
  "bokeh-emphasis": { tint: { background: "radial-gradient(circle at 70% 30%, rgba(255,220,140,0.35), transparent 50%)", blend: "screen" } },
  
  "slow-motion": { tint: { background: "rgba(60,120,200,0.18)", blend: "overlay" } },
  
  "film-grain": { filter: "contrast(108%) saturate(95%)", tint: { background: "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%220.5%22/></svg>')", blend: "overlay", opacity: 0.5 } },
  "vignette": { vignette: "rgba(0,0,0,0.7)" },
  "letterbox": { bars: [{ side: "top", sizePct: 12 }, { side: "bottom", sizePct: 12 }] },
  "cinemascope": { bars: [{ side: "top", sizePct: 18 }, { side: "bottom", sizePct: 18 }] },
  
  "combo-dutch-handheld": { vignette: "rgba(0,0,0,0.4)" },
  "combo-ots-rack": { vignette: "rgba(0,0,0,0.4)" },
  "combo-pov-handheld": { vignette: "rgba(0,0,0,0.6)" },
  "combo-arc-push": { vignette: "rgba(0,0,0,0.3)" },
  "combo-slow-tracking": { tint: { background: "rgba(60,120,200,0.18)", blend: "overlay" } },
  "combo-tilt-timelapse": { bars: [{ side: "top", sizePct: 25, gradient: true }, { side: "bottom", sizePct: 25, gradient: true }], filter: "saturate(125%)" },
  "combo-follow-slowmo": { tint: { background: "rgba(60,120,200,0.18)", blend: "overlay" } },
  "combo-dolly-zoom-slowmo": { vignette: "rgba(0,0,0,0.55)", tint: { background: "rgba(60,120,200,0.18)", blend: "overlay" } },
  "combo-birds-eye-pull": { vignette: "rgba(0,0,0,0.7)" },
};
