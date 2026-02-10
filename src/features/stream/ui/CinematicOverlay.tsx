import React from "react";
import { CinematicEffect } from "./pip/PipCinematicMenu";

interface CinematicOverlayProps {
  effect: CinematicEffect;
}

/**
 * CSS-based cinematic overlays rendered on top of the camera canvas.
 * Each effect uses pure CSS for maximum performance.
 */
export const CinematicOverlay: React.FC<CinematicOverlayProps> = ({ effect }) => {
  if (effect === "none") return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-[1]" aria-hidden>
      {effect === "letterbox" && <LetterboxOverlay />}
      {effect === "vignette" && <VignetteOverlay />}
      {effect === "film-grain" && <FilmGrainOverlay />}
      {effect === "anamorphic-flare" && <AnamorphicFlareOverlay />}
      {effect === "dutch-angle" && <DutchAngleOverlay />}
      {effect === "shallow-dof" && <ShallowDOFOverlay />}
      {effect === "split-diopter" && <SplitDiopterOverlay />}
      {effect === "teal-orange" && <TealOrangeOverlay />}
      {effect === "bleach-bypass" && <BleachBypassOverlay />}
      {effect === "dolly-zoom" && <DollyZoomOverlay />}
    </div>
  );
};

const LetterboxOverlay = () => (
  <>
    <div className="absolute top-0 left-0 right-0 h-[12%] bg-black" />
    <div className="absolute bottom-0 left-0 right-0 h-[12%] bg-black" />
  </>
);

const VignetteOverlay = () => (
  <div
    className="absolute inset-0"
    style={{
      background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)",
    }}
  />
);

const FilmGrainOverlay = () => (
  <div
    className="absolute inset-0 opacity-30 mix-blend-overlay"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
      backgroundSize: "150px 150px",
      animation: "grain 0.3s steps(4) infinite",
    }}
  />
);

const AnamorphicFlareOverlay = () => (
  <div
    className="absolute inset-0"
    style={{
      background: `
        linear-gradient(90deg, transparent 0%, rgba(100,180,255,0.08) 20%, rgba(100,200,255,0.15) 45%, rgba(200,230,255,0.25) 50%, rgba(100,200,255,0.15) 55%, rgba(100,180,255,0.08) 80%, transparent 100%)
      `,
      animation: "flare-drift 4s ease-in-out infinite alternate",
    }}
  />
);

const DutchAngleOverlay = () => (
  <div
    className="absolute inset-[-10%] z-[1]"
    style={{
      transform: "rotate(-5deg) scale(1.15)",
      boxShadow: "inset 0 0 60px rgba(0,0,0,0.4)",
    }}
  />
);

const ShallowDOFOverlay = () => (
  <div
    className="absolute inset-0"
    style={{
      background: `
        linear-gradient(to bottom, 
          rgba(0,0,0,0) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 50%, rgba(0,0,0,0) 70%, rgba(0,0,0,0) 100%
        )
      `,
      backdropFilter: "blur(0px)",
      mask: "radial-gradient(ellipse 60% 50% at center, transparent 40%, black 100%)",
      WebkitMask: "radial-gradient(ellipse 60% 50% at center, transparent 40%, black 100%)",
    }}
  >
    <div
      className="absolute inset-0"
      style={{
        backdropFilter: "blur(3px)",
      }}
    />
  </div>
);

const SplitDiopterOverlay = () => (
  <div className="absolute inset-0">
    <div
      className="absolute top-0 left-0 w-1/2 h-full"
      style={{
        backdropFilter: "blur(2px)",
        mask: "linear-gradient(to right, black 60%, transparent 100%)",
        WebkitMask: "linear-gradient(to right, black 60%, transparent 100%)",
      }}
    />
    <div
      className="absolute top-0 left-1/2 w-px h-full"
      style={{
        background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.1), transparent)",
      }}
    />
  </div>
);

const TealOrangeOverlay = () => (
  <div
    className="absolute inset-0 mix-blend-color opacity-25"
    style={{
      background: "linear-gradient(135deg, rgba(0,128,128,0.6) 0%, transparent 50%, rgba(255,140,0,0.6) 100%)",
    }}
  />
);

const BleachBypassOverlay = () => (
  <div className="absolute inset-0">
    <div className="absolute inset-0 mix-blend-luminosity bg-white/10" />
    <div
      className="absolute inset-0"
      style={{
        backdropFilter: "contrast(1.3) saturate(0.4)",
      }}
    />
  </div>
);

const DollyZoomOverlay = () => (
  <div
    className="absolute inset-0"
    style={{
      animation: "dolly-zoom 4s ease-in-out infinite alternate",
      background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.15) 100%)",
    }}
  />
);
