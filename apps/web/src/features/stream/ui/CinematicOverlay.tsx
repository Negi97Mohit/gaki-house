import React from "react";
import { CinematicEffect } from "./pip/cinematicShotData";

interface CinematicOverlayProps {
  effect: CinematicEffect;
}

export const CinematicOverlay: React.FC<CinematicOverlayProps> = ({ effect }) => {
  if (effect === "none") return null;

  const Overlay = OVERLAY_MAP[effect];
  if (!Overlay) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-[1]" aria-hidden>
      <Overlay />
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
// CORE EFFECTS
// ══════════════════════════════════════════════════════════════

const LetterboxOverlay = () => (
  <>
    <div className="absolute top-0 left-0 right-0 h-[12%] bg-black" />
    <div className="absolute bottom-0 left-0 right-0 h-[12%] bg-black" />
  </>
);

const VignetteOverlay = () => (
  <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)" }} />
);

const FilmGrainOverlay = () => (
  <div className="absolute inset-0 opacity-30 mix-blend-overlay" style={{
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
    backgroundSize: "150px 150px",
    animation: "grain 0.3s steps(4) infinite",
  }} />
);

const AnamorphicFlareOverlay = () => (
  <div className="absolute inset-0" style={{
    background: "linear-gradient(90deg, transparent 0%, rgba(100,180,255,0.08) 20%, rgba(100,200,255,0.15) 45%, rgba(200,230,255,0.25) 50%, rgba(100,200,255,0.15) 55%, rgba(100,180,255,0.08) 80%, transparent 100%)",
    animation: "flare-drift 4s ease-in-out infinite alternate",
  }} />
);

const DutchAngleOverlay = () => (
  <div className="absolute inset-0" style={{ boxShadow: "inset 0 0 60px rgba(0,0,0,0.4)" }} />
);

const ShallowDOFOverlay = () => (
  <div className="absolute inset-0" style={{
    mask: "radial-gradient(ellipse 60% 50% at center, transparent 40%, black 100%)",
    WebkitMask: "radial-gradient(ellipse 60% 50% at center, transparent 40%, black 100%)",
  }}>
    <div className="absolute inset-0" style={{ backdropFilter: "blur(3px)" }} />
  </div>
);

const SplitDiopterOverlay = () => (
  <div className="absolute inset-0">
    <div className="absolute top-0 left-0 w-1/2 h-full" style={{
      backdropFilter: "blur(2px)",
      mask: "linear-gradient(to right, black 60%, transparent 100%)",
      WebkitMask: "linear-gradient(to right, black 60%, transparent 100%)",
    }} />
    <div className="absolute top-0 left-1/2 w-px h-full" style={{ background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.1), transparent)" }} />
  </div>
);

const TealOrangeOverlay = () => (
  <div className="absolute inset-0 mix-blend-color opacity-25" style={{ background: "linear-gradient(135deg, rgba(0,128,128,0.6) 0%, transparent 50%, rgba(255,140,0,0.6) 100%)" }} />
);

const BleachBypassOverlay = () => (
  <div className="absolute inset-0">
    <div className="absolute inset-0 mix-blend-luminosity bg-white/10" />
    <div className="absolute inset-0" style={{ backdropFilter: "contrast(1.3) saturate(0.4)" }} />
  </div>
);

const DollyZoomOverlay = () => (
  <div className="absolute inset-0" style={{
    animation: "dolly-zoom 4s ease-in-out infinite alternate",
    background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.15) 100%)",
  }} />
);

// ══════════════════════════════════════════════════════════════
// LETTERBOX VARIATIONS
// ══════════════════════════════════════════════════════════════

const CinemascopeOverlay = () => (
  <><div className="absolute top-0 left-0 right-0 h-[18%] bg-black" /><div className="absolute bottom-0 left-0 right-0 h-[18%] bg-black" /></>
);

const PillarboxOverlay = () => (
  <><div className="absolute top-0 left-0 bottom-0 w-[12%] bg-black" /><div className="absolute top-0 right-0 bottom-0 w-[12%] bg-black" /></>
);

const WindowboxOverlay = () => (
  <>
    <div className="absolute top-0 left-0 right-0 h-[10%] bg-black" />
    <div className="absolute bottom-0 left-0 right-0 h-[10%] bg-black" />
    <div className="absolute top-0 left-0 bottom-0 w-[8%] bg-black" />
    <div className="absolute top-0 right-0 bottom-0 w-[8%] bg-black" />
  </>
);

const SoftLetterboxOverlay = () => (
  <>
    <div className="absolute top-0 left-0 right-0 h-[15%]" style={{ background: "linear-gradient(to bottom, black 40%, transparent)" }} />
    <div className="absolute bottom-0 left-0 right-0 h-[15%]" style={{ background: "linear-gradient(to top, black 40%, transparent)" }} />
  </>
);

const ColorLetterboxOverlay = () => (
  <>
    <div className="absolute top-0 left-0 right-0 h-[12%]" style={{ background: "linear-gradient(135deg, #1a0a2e, #0a1a2e)" }} />
    <div className="absolute bottom-0 left-0 right-0 h-[12%]" style={{ background: "linear-gradient(135deg, #0a1a2e, #1a0a2e)" }} />
  </>
);

const AnimatedLetterboxOverlay = () => (
  <>
    <div className="absolute top-0 left-0 right-0 bg-black" style={{ height: "12%", animation: "letterbox-breathe 3s ease-in-out infinite" }} />
    <div className="absolute bottom-0 left-0 right-0 bg-black" style={{ height: "12%", animation: "letterbox-breathe 3s ease-in-out infinite" }} />
  </>
);

const GradientLetterboxOverlay = () => (
  <>
    <div className="absolute top-0 left-0 right-0 h-[14%]" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.95), rgba(40,10,10,0.6), transparent)" }} />
    <div className="absolute bottom-0 left-0 right-0 h-[14%]" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.95), rgba(40,10,10,0.6), transparent)" }} />
  </>
);

const NeonLetterboxOverlay = () => (
  <>
    <div className="absolute top-0 left-0 right-0 h-[11%] bg-black" />
    <div className="absolute bottom-0 left-0 right-0 h-[11%] bg-black" />
    <div className="absolute left-0 right-0" style={{ top: "11%", height: "2px", background: "linear-gradient(90deg, transparent, #00ff88, #00ffff, #00ff88, transparent)", boxShadow: "0 0 8px #00ff88, 0 0 20px #00ff8844" }} />
    <div className="absolute left-0 right-0" style={{ bottom: "11%", height: "2px", background: "linear-gradient(90deg, transparent, #00ff88, #00ffff, #00ff88, transparent)", boxShadow: "0 0 8px #00ff88, 0 0 20px #00ff8844" }} />
  </>
);

const VintageLetterboxOverlay = () => (
  <>
    <div className="absolute top-0 left-0 right-0 h-[13%]" style={{ background: "linear-gradient(to bottom, #1a1408, #0d0a04, transparent)" }} />
    <div className="absolute bottom-0 left-0 right-0 h-[13%]" style={{ background: "linear-gradient(to top, #1a1408, #0d0a04, transparent)" }} />
    <div className="absolute inset-0 opacity-15" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.3'/%3E%3C/svg%3E")`,
      backgroundSize: "100px 100px",
    }} />
  </>
);

const AsymmetricLetterboxOverlay = () => (
  <><div className="absolute top-0 left-0 right-0 h-[8%] bg-black" /><div className="absolute bottom-0 left-0 right-0 h-[18%] bg-black" /></>
);

// ══════════════════════════════════════════════════════════════
// OPTICAL & LENS STYLES
// ══════════════════════════════════════════════════════════════

const FisheyeOverlay = () => (
  <div className="absolute inset-0" style={{
    background: "radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0.9) 100%)",
  }} />
);

const UltraWideOverlay = () => (
  <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 120% 100% at center, transparent 70%, rgba(0,0,0,0.3) 100%)" }} />
);

const WideAngleOverlay = () => (
  <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 110% 100% at center, transparent 65%, rgba(0,0,0,0.2) 100%)" }} />
);

const StandardPerspectiveOverlay = () => (
  <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 80%, rgba(0,0,0,0.08) 100%)" }} />
);

const TelephotoOverlay = () => (
  <div className="absolute inset-0">
    <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 45% 45% at center, transparent 70%, rgba(0,0,0,0.5) 100%)" }} />
    <div className="absolute inset-0" style={{ backdropFilter: "blur(1px)", mask: "radial-gradient(ellipse 50% 50% at center, transparent 60%, black 100%)", WebkitMask: "radial-gradient(ellipse 50% 50% at center, transparent 60%, black 100%)" }} />
  </div>
);

const SuperTelephotoOverlay = () => (
  <div className="absolute inset-0">
    <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 30% 30% at center, transparent 60%, rgba(0,0,0,0.7) 100%)" }} />
    <div className="absolute inset-0" style={{ backdropFilter: "blur(3px)", mask: "radial-gradient(ellipse 35% 35% at center, transparent 50%, black 100%)", WebkitMask: "radial-gradient(ellipse 35% 35% at center, transparent 50%, black 100%)" }} />
  </div>
);

const MacroCloseupOverlay = () => (
  <div className="absolute inset-0">
    <div className="absolute inset-0" style={{ backdropFilter: "blur(4px)", mask: "radial-gradient(ellipse 40% 40% at center, transparent 30%, black 80%)", WebkitMask: "radial-gradient(ellipse 40% 40% at center, transparent 30%, black 80%)" }} />
    <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 40% 40% at center, transparent 25%, rgba(0,0,0,0.4) 100%)" }} />
  </div>
);

const TiltShiftOverlay = () => (
  <div className="absolute inset-0">
    <div className="absolute inset-0" style={{
      backdropFilter: "blur(4px) saturate(1.3)",
      mask: "linear-gradient(to bottom, black 0%, transparent 35%, transparent 65%, black 100%)",
      WebkitMask: "linear-gradient(to bottom, black 0%, transparent 35%, transparent 65%, black 100%)",
    }} />
  </div>
);

const SplitDiopterFocusOverlay = () => (
  <div className="absolute inset-0">
    <div className="absolute top-0 left-0 w-1/2 h-full" style={{ backdropFilter: "blur(2px)", mask: "linear-gradient(to right, black 50%, transparent 100%)", WebkitMask: "linear-gradient(to right, black 50%, transparent 100%)" }} />
  </div>
);

const AnamorphicCinemaOverlay = () => (
  <div className="absolute inset-0">
    <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, transparent 0%, rgba(80,160,255,0.06) 30%, rgba(180,220,255,0.12) 50%, rgba(80,160,255,0.06) 70%, transparent 100%)", animation: "flare-drift 5s ease-in-out infinite alternate" }} />
    <div className="absolute top-0 left-0 right-0 h-[8%] bg-black" />
    <div className="absolute bottom-0 left-0 right-0 h-[8%] bg-black" />
  </div>
);

const SoftFocusOverlay = () => (
  <div className="absolute inset-0" style={{ backdropFilter: "blur(1.5px) brightness(1.1)", background: "radial-gradient(ellipse at center, rgba(255,255,255,0.05) 0%, transparent 70%)" }} />
);

const VintageBloomOverlay = () => (
  <div className="absolute inset-0">
    <div className="absolute inset-0" style={{ backdropFilter: "blur(1px) brightness(1.15) saturate(0.8)", background: "radial-gradient(ellipse at center, rgba(255,200,120,0.1) 0%, transparent 70%)" }} />
  </div>
);

const PinholeOverlay = () => (
  <div className="absolute inset-0" style={{ background: "radial-gradient(circle at center, transparent 20%, rgba(0,0,0,0.6) 50%, black 85%)" }} />
);

const ProbeLensOverlay = () => (
  <div className="absolute inset-0" style={{ background: "radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.5) 70%, black 100%)" }} />
);

const InfraredCaptureOverlay = () => (
  <div className="absolute inset-0">
    <div className="absolute inset-0 mix-blend-color" style={{ background: "linear-gradient(135deg, rgba(255,50,100,0.4) 0%, rgba(200,0,80,0.3) 50%, rgba(255,100,150,0.4) 100%)" }} />
    <div className="absolute inset-0" style={{ backdropFilter: "saturate(0.3) hue-rotate(-30deg)" }} />
  </div>
);

const ThermalCameraOverlay = () => (
  <div className="absolute inset-0">
    <div className="absolute inset-0 mix-blend-color" style={{ background: "linear-gradient(180deg, rgba(255,0,0,0.3) 0%, rgba(255,165,0,0.3) 30%, rgba(255,255,0,0.2) 50%, rgba(0,255,0,0.2) 70%, rgba(0,0,255,0.3) 100%)" }} />
    <div className="absolute inset-0" style={{ backdropFilter: "contrast(1.3) saturate(1.5)" }} />
  </div>
);

const MicroscopeMacroOverlay = () => (
  <div className="absolute inset-0">
    <div className="absolute inset-0" style={{ background: "radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.7) 80%)" }} />
    <div className="absolute inset-0 border-4 rounded-full m-[15%]" style={{ borderColor: "rgba(100,200,200,0.2)" }} />
  </div>
);

const LensbabyBlurOverlay = () => (
  <div className="absolute inset-0" style={{
    backdropFilter: "blur(4px)",
    mask: "radial-gradient(ellipse 35% 35% at 40% 45%, transparent 50%, black 100%)",
    WebkitMask: "radial-gradient(ellipse 35% 35% at 40% 45%, transparent 50%, black 100%)",
  }} />
);

const SphericalLensOverlay = () => (
  <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.15) 100%)" }} />
);

const ZoomRampOverlay = () => (
  <div className="absolute inset-0" style={{
    background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.2) 100%)",
    animation: "dolly-zoom 2s ease-in-out infinite alternate",
  }} />
);

// ══════════════════════════════════════════════════════════════
// FRAMING & PERSPECTIVE
// ══════════════════════════════════════════════════════════════

const EyeLevelOverlay = () => (
  <div className="absolute inset-0" style={{ boxShadow: "inset 0 0 30px rgba(0,0,0,0.1)" }} />
);

const LowAngleHeroOverlay = () => (
  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, transparent 60%, rgba(0,0,0,0.3) 100%)" }} />
);

const HighAngleOverlay = () => (
  <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.3) 100%)" }} />
);

const BirdsEyeOverlay = () => (
  <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 80% at center, transparent 50%, rgba(0,0,0,0.4) 100%)", boxShadow: "inset 0 0 80px rgba(0,0,0,0.3)" }} />
);

const WormsEyeOverlay = () => (
  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.1) 0%, transparent 40%, rgba(100,150,200,0.08) 100%)" }} />
);

const DutchTiltOverlay = () => (
  <div className="absolute inset-0" style={{ boxShadow: "inset 0 0 80px rgba(0,0,0,0.5)" }} />
);

const ForcedPerspectiveOverlay = () => (
  <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.15) 100%)" }} />
);

const SymmetricalOverlay = () => (
  <>
    <div className="absolute top-0 bottom-0 left-1/2 w-px" style={{ background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.08), transparent)" }} />
    <div className="absolute left-0 right-0 top-1/2 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent)" }} />
  </>
);

const CenterWeightedOverlay = () => (
  <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, rgba(255,255,255,0.03) 0%, transparent 50%, rgba(0,0,0,0.15) 100%)" }} />
);

const RuleOfThirdsOverlay = () => (
  <>
    <div className="absolute top-[33.3%] left-0 right-0 h-px" style={{ background: "rgba(255,255,255,0.12)" }} />
    <div className="absolute top-[66.6%] left-0 right-0 h-px" style={{ background: "rgba(255,255,255,0.12)" }} />
    <div className="absolute left-[33.3%] top-0 bottom-0 w-px" style={{ background: "rgba(255,255,255,0.12)" }} />
    <div className="absolute left-[66.6%] top-0 bottom-0 w-px" style={{ background: "rgba(255,255,255,0.12)" }} />
  </>
);

const ExtremeCloseupOverlay = () => (
  <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 50% 50% at center, transparent 40%, rgba(0,0,0,0.5) 100%)" }} />
);

const MediumPortraitOverlay = () => (
  <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 80% at center, transparent 50%, rgba(0,0,0,0.2) 100%)" }} />
);

const WideEnvironmentalOverlay = () => (
  <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 120% 100% at center, transparent 60%, rgba(0,0,0,0.15) 100%)" }} />
);

const SilhouetteOverlay = () => (
  <div className="absolute inset-0">
    <div className="absolute inset-0" style={{ backdropFilter: "contrast(2) brightness(0.5)" }} />
    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(20,10,5,0.3) 0%, rgba(255,140,50,0.15) 100%)" }} />
  </div>
);

const FrameInFrameOverlay = () => (
  <div className="absolute inset-[12%] border-2" style={{ borderColor: "rgba(255,255,255,0.15)", boxShadow: "0 0 0 9999px rgba(0,0,0,0.3)" }} />
);

const NegativeSpaceOverlay = () => (
  <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 40% 50% at 35% 50%, transparent 50%, rgba(0,0,0,0.08) 100%)" }} />
);

const ShoulderPovOverlay = () => (
  <div className="absolute inset-0">
    <div className="absolute bottom-0 left-0 w-[25%] h-[40%]" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.5), transparent)", backdropFilter: "blur(3px)" }} />
  </div>
);

const FirstPersonPovOverlay = () => (
  <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.25) 100%)", boxShadow: "inset 0 0 40px rgba(0,0,0,0.2)" }} />
);

const OverTheShoulderOverlay = () => (
  <div className="absolute inset-0">
    <div className="absolute bottom-0 right-0 w-[30%] h-[50%]" style={{ background: "linear-gradient(to left, rgba(0,0,0,0.4), transparent)", backdropFilter: "blur(2px)" }} />
  </div>
);

const ProfileSideOverlay = () => (
  <>
    <div className="absolute top-0 left-0 bottom-0 w-[5%]" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.3), transparent)" }} />
    <div className="absolute top-0 right-0 bottom-0 w-[5%]" style={{ background: "linear-gradient(to left, rgba(0,0,0,0.3), transparent)" }} />
  </>
);

// ══════════════════════════════════════════════════════════════
// FOCUS & DEPTH
// ══════════════════════════════════════════════════════════════

const ShallowDepthPortraitOverlay = () => (
  <div className="absolute inset-0" style={{
    backdropFilter: "blur(4px)",
    mask: "radial-gradient(ellipse 40% 50% at center, transparent 40%, black 100%)",
    WebkitMask: "radial-gradient(ellipse 40% 50% at center, transparent 40%, black 100%)",
  }} />
);

const DeepFocusOverlay = () => (
  <div className="absolute inset-0" style={{ backdropFilter: "contrast(1.05) saturate(1.1)", background: "radial-gradient(ellipse at center, transparent 70%, rgba(0,0,0,0.08) 100%)" }} />
);

const RackFocusOverlay = () => (
  <div className="absolute inset-0" style={{
    backdropFilter: "blur(3px)",
    mask: "radial-gradient(ellipse 50% 50% at center, transparent 30%, black 80%)",
    WebkitMask: "radial-gradient(ellipse 50% 50% at center, transparent 30%, black 80%)",
    animation: "rack-focus 4s ease-in-out infinite alternate",
  }} />
);

const ForegroundBlurOverlay = () => (
  <div className="absolute inset-0" style={{
    backdropFilter: "blur(3px)",
    mask: "linear-gradient(to bottom, black 0%, transparent 40%, transparent 100%)",
    WebkitMask: "linear-gradient(to bottom, black 0%, transparent 40%, transparent 100%)",
  }} />
);

const BackgroundIsolationOverlay = () => (
  <div className="absolute inset-0" style={{
    backdropFilter: "blur(5px)",
    mask: "radial-gradient(ellipse 45% 55% at center, transparent 35%, black 90%)",
    WebkitMask: "radial-gradient(ellipse 45% 55% at center, transparent 35%, black 90%)",
  }} />
);

const SplitFocusPlaneOverlay = () => (
  <div className="absolute inset-0">
    <div className="absolute top-0 left-0 right-0 h-1/3" style={{ backdropFilter: "blur(2px)" }} />
    <div className="absolute bottom-0 left-0 right-0 h-1/3" style={{ backdropFilter: "blur(2px)" }} />
  </div>
);

const HyperfocalOverlay = () => (
  <div className="absolute inset-0" style={{ backdropFilter: "contrast(1.08) saturate(1.05)" }} />
);

const FocusBreathingOverlay = () => (
  <div className="absolute inset-0" style={{
    backdropFilter: "blur(1px)",
    mask: "radial-gradient(ellipse at center, transparent 50%, black 100%)",
    WebkitMask: "radial-gradient(ellipse at center, transparent 50%, black 100%)",
    animation: "focus-breathe 3s ease-in-out infinite",
  }} />
);

const BokehEmphasisOverlay = () => (
  <div className="absolute inset-0" style={{
    backdropFilter: "blur(5px) brightness(1.1)",
    mask: "radial-gradient(ellipse 35% 35% at center, transparent 50%, black 100%)",
    WebkitMask: "radial-gradient(ellipse 35% 35% at center, transparent 50%, black 100%)",
  }} />
);

const ForegroundObstructionOverlay = () => (
  <div className="absolute inset-0">
    <div className="absolute bottom-0 left-0 w-[40%] h-[30%]" style={{ backdropFilter: "blur(6px)", mask: "linear-gradient(to top right, black 40%, transparent 100%)", WebkitMask: "linear-gradient(to top right, black 40%, transparent 100%)" }} />
  </div>
);

const FocusPullRevealOverlay = () => (
  <div className="absolute inset-0" style={{
    backdropFilter: "blur(4px)",
    mask: "radial-gradient(ellipse at center, transparent 30%, black 80%)",
    WebkitMask: "radial-gradient(ellipse at center, transparent 30%, black 80%)",
    animation: "focus-pull 5s ease-in-out infinite alternate",
  }} />
);

const TiltedFocusOverlay = () => (
  <div className="absolute inset-0" style={{
    backdropFilter: "blur(3px)",
    mask: "linear-gradient(135deg, black 0%, transparent 30%, transparent 70%, black 100%)",
    WebkitMask: "linear-gradient(135deg, black 0%, transparent 30%, transparent 70%, black 100%)",
  }} />
);

const ManualFocusDriftOverlay = () => (
  <div className="absolute inset-0" style={{
    backdropFilter: "blur(1.5px)",
    animation: "manual-drift 6s ease-in-out infinite",
    opacity: 0.7,
  }} />
);

const FocusStackingOverlay = () => (
  <div className="absolute inset-0" style={{ backdropFilter: "contrast(1.1) saturate(1.15) sharpen(1)" }} />
);

const DreamlikeDefocusOverlay = () => (
  <div className="absolute inset-0" style={{
    backdropFilter: "blur(2px) brightness(1.1)",
    background: "radial-gradient(ellipse at center, rgba(200,170,220,0.08) 0%, transparent 70%)",
  }} />
);

// ══════════════════════════════════════════════════════════════
// MOTION & MOVEMENT
// ══════════════════════════════════════════════════════════════

const HandheldShakeOverlay = () => (
  <div className="absolute inset-0" style={{ boxShadow: "inset 0 0 20px rgba(0,0,0,0.1)" }} />
);

const LockedTripodOverlay = () => (
  <div className="absolute inset-0" style={{ boxShadow: "inset 0 0 1px rgba(0,0,0,0.1)" }} />
);

const SlowDollyOverlay = () => (
  <div className="absolute inset-0" style={{
    background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.1) 100%)",
    animation: "slow-dolly 8s ease-in-out infinite alternate",
  }} />
);

const TrackingFollowOverlay = () => (
  <div className="absolute inset-0" style={{
    background: "linear-gradient(90deg, rgba(0,0,0,0.15) 0%, transparent 15%, transparent 85%, rgba(0,0,0,0.15) 100%)",
    animation: "tracking-pan 6s ease-in-out infinite alternate",
  }} />
);

const SteadicamGlideOverlay = () => (
  <div className="absolute inset-0" style={{ animation: "steadicam-float 4s ease-in-out infinite", boxShadow: "inset 0 0 15px rgba(0,0,0,0.08)" }} />
);

const CraneJibOverlay = () => (
  <div className="absolute inset-0" style={{
    background: "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, transparent 30%, transparent 80%, rgba(0,0,0,0.1) 100%)",
    animation: "crane-sweep 6s ease-in-out infinite alternate",
  }} />
);

const OrbitCircularOverlay = () => (
  <div className="absolute inset-0" style={{
    background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.15) 100%)",
    animation: "orbit-rotate 8s linear infinite",
  }} />
);

const WhipPanOverlay = () => (
  <div className="absolute inset-0" style={{
    background: "linear-gradient(90deg, rgba(0,0,0,0.3), transparent 20%, transparent 80%, rgba(0,0,0,0.3))",
    animation: "whip-pan 0.8s ease-in-out infinite",
  }} />
);

const SnapZoomOverlay = () => (
  <div className="absolute inset-0" style={{
    background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.2) 100%)",
    animation: "snap-zoom 2s cubic-bezier(0.25,0.1,0.25,1) infinite",
  }} />
);

const SlowMotionOverlay = () => (
  <div className="absolute inset-0" style={{
    backdropFilter: "brightness(1.05) contrast(1.05)",
    background: "linear-gradient(to bottom, rgba(100,150,200,0.04) 0%, transparent 100%)",
  }} />
);

const HyperlapseOverlay = () => (
  <div className="absolute inset-0" style={{
    background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.2) 100%)",
    animation: "hyperlapse-strobe 0.5s steps(3) infinite",
  }} />
);

const TimelapseOverlay = () => (
  <div className="absolute inset-0" style={{
    backdropFilter: "brightness(1.1) saturate(1.2)",
    animation: "timelapse-shift 3s ease-in-out infinite",
  }} />
);

const RollingShutterOverlay = () => (
  <div className="absolute inset-0" style={{
    background: "repeating-linear-gradient(to bottom, transparent, transparent 48%, rgba(0,0,0,0.03) 50%, transparent 52%)",
    animation: "rolling-scan 0.5s linear infinite",
  }} />
);

const ParallaxSlideOverlay = () => (
  <div className="absolute inset-0" style={{
    background: "linear-gradient(90deg, rgba(0,0,0,0.1) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.1) 100%)",
    animation: "parallax-drift 5s ease-in-out infinite alternate",
  }} />
);

const DroneGlideOverlay = () => (
  <div className="absolute inset-0" style={{
    background: "linear-gradient(to bottom, rgba(120,180,230,0.06) 0%, transparent 30%, transparent 100%)",
    animation: "drone-hover 4s ease-in-out infinite",
  }} />
);

const ShoulderRigOverlay = () => (
  <div className="absolute inset-0" style={{ animation: "shoulder-bob 1.2s ease-in-out infinite", boxShadow: "inset 0 0 15px rgba(0,0,0,0.1)" }} />
);

const CrashZoomOverlay = () => (
  <div className="absolute inset-0" style={{
    background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.3) 100%)",
    animation: "crash-zoom 1.5s cubic-bezier(0.7,0,0.3,1) infinite",
  }} />
);

const LongTakeOverlay = () => (
  <div className="absolute inset-0" style={{ boxShadow: "inset 0 0 25px rgba(0,0,0,0.08)" }} />
);

const KineticChaseOverlay = () => (
  <div className="absolute inset-0" style={{
    animation: "kinetic-shake 0.2s linear infinite",
    background: "linear-gradient(90deg, rgba(0,0,0,0.2) 0%, transparent 10%, transparent 90%, rgba(0,0,0,0.2) 100%)",
  }} />
);

const SuspendedHoverOverlay = () => (
  <div className="absolute inset-0" style={{
    animation: "suspended-float 5s ease-in-out infinite",
    background: "radial-gradient(ellipse at center, rgba(100,150,220,0.04) 0%, transparent 60%)",
  }} />
);

// ══════════════════════════════════════════════════════════════
// EXPOSURE & TEMPORAL
// ══════════════════════════════════════════════════════════════

const LongExposureOverlay = () => (
  <div className="absolute inset-0" style={{
    backdropFilter: "blur(2px) brightness(1.1)",
    background: "linear-gradient(135deg, rgba(100,150,255,0.05) 0%, rgba(255,200,100,0.05) 100%)",
  }} />
);

const HighShutterOverlay = () => (
  <div className="absolute inset-0" style={{ backdropFilter: "contrast(1.15) saturate(1.1)" }} />
);

const MotionBlurSmearOverlay = () => (
  <div className="absolute inset-0" style={{
    backdropFilter: "blur(3px)",
    mask: "linear-gradient(90deg, black 0%, transparent 30%, transparent 70%, black 100%)",
    WebkitMask: "linear-gradient(90deg, black 0%, transparent 30%, transparent 70%, black 100%)",
  }} />
);

const LightPaintingOverlay = () => (
  <div className="absolute inset-0">
    <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 30% 40%, rgba(255,50,255,0.08) 0%, transparent 40%), radial-gradient(circle at 70% 60%, rgba(50,200,255,0.08) 0%, transparent 40%)", animation: "light-paint-drift 6s ease-in-out infinite alternate" }} />
    <div className="absolute inset-0" style={{ backdropFilter: "brightness(0.85)" }} />
  </div>
);

const LowLightGrainOverlay = () => (
  <div className="absolute inset-0">
    <div className="absolute inset-0" style={{ backdropFilter: "brightness(0.8) contrast(1.2)" }} />
    <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.6'/%3E%3C/svg%3E")`,
      backgroundSize: "120px 120px",
      animation: "grain 0.2s steps(6) infinite",
    }} />
  </div>
);

const HdrCaptureOverlay = () => (
  <div className="absolute inset-0" style={{ backdropFilter: "contrast(1.2) saturate(1.3) brightness(1.05)" }} />
);

const FlickerBlendOverlay = () => (
  <div className="absolute inset-0" style={{ animation: "flicker 0.15s steps(2) infinite", backdropFilter: "brightness(1.05)" }} />
);

const OverexposedGlowOverlay = () => (
  <div className="absolute inset-0" style={{
    backdropFilter: "brightness(1.4) contrast(0.9) blur(0.5px)",
    background: "radial-gradient(ellipse at center, rgba(255,255,240,0.15) 0%, transparent 70%)",
  }} />
);

const UnderexposedNoirOverlay = () => (
  <div className="absolute inset-0" style={{
    backdropFilter: "brightness(0.5) contrast(1.4) saturate(0.3)",
    background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)",
  }} />
);

const DoubleExposureOverlay = () => (
  <div className="absolute inset-0">
    <div className="absolute inset-0 mix-blend-screen opacity-30" style={{ backdropFilter: "invert(1) hue-rotate(180deg)" }} />
    <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, rgba(200,150,255,0.05) 0%, transparent 70%)" }} />
  </div>
);

// ══════════════════════════════════════════════════════════════
// STYLIZED / CINEMATIC LANGUAGE
// ══════════════════════════════════════════════════════════════

const NoirShadowOverlay = () => (
  <div className="absolute inset-0">
    <div className="absolute inset-0" style={{ backdropFilter: "contrast(1.5) saturate(0) brightness(0.8)" }} />
    <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, transparent 30%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0.7) 100%)" }} />
  </div>
);

const DocumentaryVeriteOverlay = () => (
  <div className="absolute inset-0">
    <div className="absolute inset-0" style={{ animation: "handheld-shake 0.18s linear infinite" }} />
    <div className="absolute inset-0 opacity-15 mix-blend-overlay" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
      backgroundSize: "100px 100px",
    }} />
  </div>
);

const SurveillanceOverlay = () => (
  <div className="absolute inset-0">
    <div className="absolute inset-0" style={{ backdropFilter: "saturate(0) contrast(1.2) brightness(1.1)" }} />
    <div className="absolute inset-0 opacity-15" style={{ background: "repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, rgba(0,255,0,0.05) 2px, rgba(0,255,0,0.05) 4px)" }} />
    <div className="absolute top-2 left-2 text-[10px] font-mono" style={{ color: "rgba(0,255,0,0.5)" }}>● REC</div>
    <div className="absolute bottom-2 right-2 text-[9px] font-mono" style={{ color: "rgba(0,255,0,0.4)" }}>CAM 01</div>
  </div>
);

const SecurityFisheyeOverlay = () => (
  <div className="absolute inset-0">
    <div className="absolute inset-0" style={{ background: "radial-gradient(circle at center, transparent 45%, rgba(0,0,0,0.6) 85%, black 100%)" }} />
    <div className="absolute inset-0" style={{ backdropFilter: "saturate(0) contrast(1.1)" }} />
    <div className="absolute top-2 right-2 text-[9px] font-mono" style={{ color: "rgba(255,0,0,0.5)" }}>● LIVE</div>
  </div>
);

const FoundFootageOverlay = () => (
  <div className="absolute inset-0">
    <div className="absolute inset-0" style={{ backdropFilter: "saturate(0.5) contrast(1.1) brightness(0.95)" }} />
    <div className="absolute inset-0 opacity-25 mix-blend-overlay" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.0' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
      backgroundSize: "80px 80px",
      animation: "grain 0.15s steps(8) infinite",
    }} />
    <div className="absolute inset-0 opacity-10" style={{ background: "repeating-linear-gradient(to bottom, transparent 0px, transparent 1px, rgba(255,255,255,0.05) 1px, rgba(255,255,255,0.05) 3px)" }} />
  </div>
);

const VintageFilmEmulationOverlay = () => (
  <div className="absolute inset-0">
    <div className="absolute inset-0" style={{ backdropFilter: "saturate(0.7) contrast(1.1) sepia(0.3)" }} />
    <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 50%, rgba(80,50,20,0.3) 100%)" }} />
    <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.3'/%3E%3C/svg%3E")`,
      backgroundSize: "150px 150px",
    }} />
  </div>
);

const ActionSportsPovOverlay = () => (
  <div className="absolute inset-0">
    <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 120% 100% at center, transparent 60%, rgba(0,0,0,0.3) 100%)" }} />
    <div className="absolute inset-0" style={{ animation: "handheld-shake 0.1s linear infinite", backdropFilter: "contrast(1.1) saturate(1.2)" }} />
  </div>
);

const MiniatureDioramaOverlay = () => (
  <div className="absolute inset-0">
    <div className="absolute inset-0" style={{
      backdropFilter: "blur(4px) saturate(1.4) contrast(1.1)",
      mask: "linear-gradient(to bottom, black 0%, transparent 30%, transparent 70%, black 100%)",
      WebkitMask: "linear-gradient(to bottom, black 0%, transparent 30%, transparent 70%, black 100%)",
    }} />
  </div>
);

const EpicWidescreenOverlay = () => (
  <>
    <div className="absolute top-0 left-0 right-0 h-[15%] bg-black" />
    <div className="absolute bottom-0 left-0 right-0 h-[15%] bg-black" />
    <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.2) 100%)" }} />
  </>
);

const SlowRevealOverlay = () => (
  <div className="absolute inset-0" style={{
    background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.2) 100%)",
    animation: "slow-dolly 10s ease-in-out infinite alternate",
  }} />
);

const SuspenseHoldOverlay = () => (
  <div className="absolute inset-0" style={{
    background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.4) 100%)",
    animation: "suspense-pulse 4s ease-in-out infinite",
  }} />
);

const HorrorCreepOverlay = () => (
  <div className="absolute inset-0">
    <div className="absolute inset-0" style={{
      background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.5) 100%)",
      animation: "horror-zoom 8s ease-in-out infinite",
    }} />
    <div className="absolute inset-0" style={{ backdropFilter: "saturate(0.5) contrast(1.2) brightness(0.9)" }} />
  </div>
);

const HeroRevealOverlay = () => (
  <div className="absolute inset-0" style={{
    background: "radial-gradient(ellipse at center bottom, transparent 40%, rgba(0,0,0,0.3) 100%)",
    animation: "hero-pullback 6s ease-in-out infinite alternate",
  }} />
);

const MontageInsertOverlay = () => (
  <div className="absolute inset-0">
    <div className="absolute inset-[8%]" style={{ boxShadow: "0 0 0 9999px rgba(0,0,0,0.2)", borderRadius: "4px" }} />
  </div>
);

const ExperimentalAbstractOverlay = () => (
  <div className="absolute inset-0">
    <div className="absolute inset-0 mix-blend-difference" style={{
      background: "conic-gradient(from 0deg at 50% 50%, rgba(200,50,255,0.1), rgba(50,200,255,0.1), rgba(255,200,50,0.1), rgba(200,50,255,0.1))",
      animation: "abstract-spin 12s linear infinite",
    }} />
    <div className="absolute inset-0" style={{ backdropFilter: "hue-rotate(10deg) contrast(1.1)" }} />
  </div>
);

// ══════════════════════════════════════════════════════════════
// EFFECT MAP
// ══════════════════════════════════════════════════════════════

const OVERLAY_MAP: Record<string, React.FC> = {
  // Core
  "dolly-zoom": DollyZoomOverlay,
  "letterbox": LetterboxOverlay,
  "film-grain": FilmGrainOverlay,
  "teal-orange": TealOrangeOverlay,
  "vignette": VignetteOverlay,
  "shallow-dof": ShallowDOFOverlay,
  "anamorphic-flare": AnamorphicFlareOverlay,
  "bleach-bypass": BleachBypassOverlay,
  "dutch-angle": DutchAngleOverlay,
  "split-diopter": SplitDiopterOverlay,
  // Letterbox
  "cinemascope": CinemascopeOverlay,
  "pillarbox": PillarboxOverlay,
  "windowbox": WindowboxOverlay,
  "soft-letterbox": SoftLetterboxOverlay,
  "color-letterbox": ColorLetterboxOverlay,
  "animated-letterbox": AnimatedLetterboxOverlay,
  "gradient-letterbox": GradientLetterboxOverlay,
  "neon-letterbox": NeonLetterboxOverlay,
  "vintage-letterbox": VintageLetterboxOverlay,
  "asymmetric-letterbox": AsymmetricLetterboxOverlay,
  // Optical
  "fisheye": FisheyeOverlay,
  "ultra-wide": UltraWideOverlay,
  "wide-angle": WideAngleOverlay,
  "standard-perspective": StandardPerspectiveOverlay,
  "telephoto": TelephotoOverlay,
  "super-telephoto": SuperTelephotoOverlay,
  "macro-closeup": MacroCloseupOverlay,
  "tilt-shift": TiltShiftOverlay,
  "split-diopter-focus": SplitDiopterFocusOverlay,
  "anamorphic-cinema": AnamorphicCinemaOverlay,
  "soft-focus": SoftFocusOverlay,
  "vintage-bloom": VintageBloomOverlay,
  "pinhole": PinholeOverlay,
  "probe-lens": ProbeLensOverlay,
  "infrared-capture": InfraredCaptureOverlay,
  "thermal-camera": ThermalCameraOverlay,
  "microscope-macro": MicroscopeMacroOverlay,
  "lensbaby-blur": LensbabyBlurOverlay,
  "spherical-lens": SphericalLensOverlay,
  "zoom-ramp": ZoomRampOverlay,
  // Framing
  "eye-level": EyeLevelOverlay,
  "low-angle-hero": LowAngleHeroOverlay,
  "high-angle": HighAngleOverlay,
  "birds-eye": BirdsEyeOverlay,
  "worms-eye": WormsEyeOverlay,
  "dutch-tilt": DutchTiltOverlay,
  "forced-perspective": ForcedPerspectiveOverlay,
  "symmetrical": SymmetricalOverlay,
  "center-weighted": CenterWeightedOverlay,
  "rule-of-thirds": RuleOfThirdsOverlay,
  "extreme-closeup": ExtremeCloseupOverlay,
  "medium-portrait": MediumPortraitOverlay,
  "wide-environmental": WideEnvironmentalOverlay,
  "silhouette": SilhouetteOverlay,
  "frame-in-frame": FrameInFrameOverlay,
  "negative-space": NegativeSpaceOverlay,
  "shoulder-pov": ShoulderPovOverlay,
  "first-person-pov": FirstPersonPovOverlay,
  "over-the-shoulder": OverTheShoulderOverlay,
  "profile-side": ProfileSideOverlay,
  // Focus
  "shallow-depth-portrait": ShallowDepthPortraitOverlay,
  "deep-focus": DeepFocusOverlay,
  "rack-focus": RackFocusOverlay,
  "foreground-blur": ForegroundBlurOverlay,
  "background-isolation": BackgroundIsolationOverlay,
  "split-focus-plane": SplitFocusPlaneOverlay,
  "hyperfocal": HyperfocalOverlay,
  "focus-breathing": FocusBreathingOverlay,
  "bokeh-emphasis": BokehEmphasisOverlay,
  "foreground-obstruction": ForegroundObstructionOverlay,
  "focus-pull-reveal": FocusPullRevealOverlay,
  "tilted-focus": TiltedFocusOverlay,
  "manual-focus-drift": ManualFocusDriftOverlay,
  "focus-stacking": FocusStackingOverlay,
  "dreamlike-defocus": DreamlikeDefocusOverlay,
  // Motion
  "handheld-shake": HandheldShakeOverlay,
  "locked-tripod": LockedTripodOverlay,
  "slow-dolly": SlowDollyOverlay,
  "tracking-follow": TrackingFollowOverlay,
  "steadicam-glide": SteadicamGlideOverlay,
  "crane-jib": CraneJibOverlay,
  "orbit-circular": OrbitCircularOverlay,
  "whip-pan": WhipPanOverlay,
  "snap-zoom": SnapZoomOverlay,
  "slow-motion": SlowMotionOverlay,
  "hyperlapse": HyperlapseOverlay,
  "timelapse": TimelapseOverlay,
  "rolling-shutter": RollingShutterOverlay,
  "parallax-slide": ParallaxSlideOverlay,
  "drone-glide": DroneGlideOverlay,
  "shoulder-rig": ShoulderRigOverlay,
  "crash-zoom": CrashZoomOverlay,
  "long-take": LongTakeOverlay,
  "kinetic-chase": KineticChaseOverlay,
  "suspended-hover": SuspendedHoverOverlay,
  // Exposure
  "long-exposure": LongExposureOverlay,
  "high-shutter": HighShutterOverlay,
  "motion-blur-smear": MotionBlurSmearOverlay,
  "light-painting": LightPaintingOverlay,
  "low-light-grain": LowLightGrainOverlay,
  "hdr-capture": HdrCaptureOverlay,
  "flicker-blend": FlickerBlendOverlay,
  "overexposed-glow": OverexposedGlowOverlay,
  "underexposed-noir": UnderexposedNoirOverlay,
  "double-exposure": DoubleExposureOverlay,
  // Stylized
  "noir-shadow": NoirShadowOverlay,
  "documentary-verite": DocumentaryVeriteOverlay,
  "surveillance": SurveillanceOverlay,
  "security-fisheye": SecurityFisheyeOverlay,
  "found-footage": FoundFootageOverlay,
  "vintage-film-emulation": VintageFilmEmulationOverlay,
  "action-sports-pov": ActionSportsPovOverlay,
  "miniature-diorama": MiniatureDioramaOverlay,
  "epic-widescreen": EpicWidescreenOverlay,
  "slow-reveal": SlowRevealOverlay,
  "suspense-hold": SuspenseHoldOverlay,
  "horror-creep": HorrorCreepOverlay,
  "hero-reveal": HeroRevealOverlay,
  "montage-insert": MontageInsertOverlay,
  "experimental-abstract": ExperimentalAbstractOverlay,
};
