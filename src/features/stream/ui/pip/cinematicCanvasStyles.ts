// Returns CSS styles to apply directly to the canvas container
// for effects that need to transform the actual video (not just overlay)

import { CinematicEffect } from "./cinematicShotData";

export interface CinematicCanvasStyle {
  container?: React.CSSProperties;
  canvas?: React.CSSProperties;
  /** ID of inline SVG filter to render */
  svgFilterId?: string;
}

export function getCinematicCanvasStyles(effect: CinematicEffect): CinematicCanvasStyle {
  switch (effect) {
    case "fisheye":
      return {
        container: { borderRadius: "50%", overflow: "hidden" },
        canvas: {
          transform: "scale(1.25)",
          filter: "url(#svgf-barrel)",
        },
      };
    case "security-fisheye":
      return {
        container: { borderRadius: "50%", overflow: "hidden" },
        canvas: {
          transform: "scale(1.25)",
          filter: "url(#svgf-barrel) saturate(0) contrast(1.1)",
        },
      };
    case "ultra-wide":
      return {
        canvas: { transform: "scaleX(1.08) scaleY(0.96)" },
      };
    case "wide-angle":
      return {
        canvas: { transform: "scaleX(1.04) scaleY(0.98)" },
      };
    case "dutch-angle":
      return {
        container: { overflow: "hidden" },
        canvas: { transform: "rotate(-5deg) scale(1.15)" },
      };
    case "dutch-tilt":
      return {
        container: { overflow: "hidden" },
        canvas: { transform: "rotate(-8deg) scale(1.2)" },
      };
    case "handheld-shake":
      return {
        canvas: { animation: "cinematic-handheld 0.15s linear infinite" },
      };
    case "shoulder-rig":
      return {
        canvas: { animation: "cinematic-shoulder-bob 1.2s ease-in-out infinite" },
      };
    case "kinetic-chase":
      return {
        canvas: { animation: "cinematic-kinetic 0.2s linear infinite" },
      };
    case "steadicam-glide":
      return {
        canvas: { animation: "cinematic-steadicam 4s ease-in-out infinite" },
      };
    case "tilt-shift":
    case "miniature-diorama":
      return {
        canvas: { transform: "scaleY(0.95)", filter: "saturate(1.4) contrast(1.1)" },
      };
    case "macro-closeup":
      return {
        canvas: { transform: "scale(1.4)" },
      };
    case "telephoto":
      return {
        canvas: { transform: "scale(1.3)" },
      };
    case "super-telephoto":
      return {
        canvas: { transform: "scale(1.6)" },
      };
    case "extreme-closeup":
      return {
        canvas: { transform: "scale(1.5)" },
      };
    case "snap-zoom":
      return {
        canvas: { animation: "cinematic-snap-zoom 2s cubic-bezier(0.25,0.1,0.25,1) infinite" },
      };
    case "crash-zoom":
      return {
        canvas: { animation: "cinematic-crash-zoom 1.5s cubic-bezier(0.7,0,0.3,1) infinite" },
      };
    case "slow-dolly":
      return {
        canvas: { animation: "cinematic-slow-dolly 8s ease-in-out infinite alternate" },
      };
    case "action-sports-pov":
      return {
        canvas: { transform: "scaleX(1.06)", animation: "cinematic-handheld 0.1s linear infinite" },
      };
    case "spherical-lens":
      return {
        container: { borderRadius: "50%", overflow: "hidden" },
        canvas: { transform: "scale(1.1)" },
      };
    case "pinhole":
      return {
        container: { borderRadius: "50%", overflow: "hidden" },
        canvas: { transform: "scale(1.3)" },
      };
    case "probe-lens":
      return {
        container: { borderRadius: "50%", overflow: "hidden" },
        canvas: { transform: "scale(1.15)" },
      };
    default:
      return {};
  }
}
