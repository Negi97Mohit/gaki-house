import { useEffect, useMemo, useRef, useState } from "react";
import { useFx } from "@/context/FxContext";
import { loadFonts } from "@/lib/fontLoader";
import InteractiveFilterRenderer from "@/features/filters/ui/InteractiveFilterRenderer";
import CinematicShotRenderer from "@/features/effects/ui/CinematicShotRenderer";
import { CanvasTextLayer } from "./layers/CanvasTextLayer";
import { CaptionLayer } from "./layers/CaptionLayer";
import { AnimationLayer } from "./layers/AnimationLayer";

const OverlayEngine = () => {
  const {
    activeOverlay,
    activeCanvasPreset,
    activeCaption,
    activeAnimation,
    activeInteractiveFilter,
    activeCinematicShots,
  } = useFx();
  const id = activeOverlay.id;
  const containerRef = useRef<HTMLDivElement>(null);

  // Preload all fonts referenced by the currently active layers
  useEffect(() => {
    const families: Array<string | undefined> = [];
    if (activeCanvasPreset?.textOverlays)
      families.push(...activeCanvasPreset.textOverlays.map((t) => t.style.fontFamily));
    if (activeCaption) families.push(activeCaption.style.fontFamily);
    if (activeAnimation) families.push(activeAnimation.baseStyle.fontFamily);
    loadFonts(families);
  }, [activeCanvasPreset, activeCaption, activeAnimation]);

  // Live timecode for the VHS overlay
  const [tc, setTc] = useState("00:00:00:00");
  useEffect(() => {
    if (id !== "vhs") return;
    const start = Date.now();
    const tick = () => {
      const ms = Date.now() - start;
      const hh = String(Math.floor(ms / 3600000) % 24).padStart(2, "0");
      const mm = String(Math.floor(ms / 60000) % 60).padStart(2, "0");
      const ss = String(Math.floor(ms / 1000) % 60).padStart(2, "0");
      const ff = String(Math.floor((ms % 1000) / 33.33)).padStart(2, "0");
      setTc(`${hh}:${mm}:${ss}:${ff}`);
    };
    const iv = window.setInterval(tick, 33);
    return () => window.clearInterval(iv);
  }, [id]);

  const animationKey = useMemo(
    () => activeAnimation?.id ?? "none",
    [activeAnimation]
  );

  const hasAnything =
    id !== "none" ||
    activeCanvasPreset ||
    activeCaption ||
    activeAnimation ||
    activeInteractiveFilter ||
    activeCinematicShots.length > 0;
  if (!hasAnything) return null;

  return (
    <div ref={containerRef} aria-hidden data-overlay className="absolute inset-0 z-[12] pointer-events-none">
      {/* === Interactive filter — own component layer (may capture taps) === */}
      {activeInteractiveFilter && (
        <InteractiveFilterRenderer
          key={activeInteractiveFilter.id}
          filter={activeInteractiveFilter}
        />
      )}

      {/* === Cinematic shot — overlay-stack renderer === */}
      {activeCinematicShots.map(shot => (
        <CinematicShotRenderer key={shot.id} preset={shot} />
      ))}

      {/* Decorative legacy overlays — never intercept pointer events. */}
      <div className="pointer-events-none absolute inset-0">
        {id === "vhs" && (
          <>
            <div className="absolute inset-0 opacity-40 mix-blend-overlay bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.06)_0px,rgba(255,255,255,0.06)_1px,transparent_1px,transparent_3px)]" />
            <div className="absolute inset-0 shadow-[inset_0_0_140px_40px_rgba(0,0,0,0.45)]" />
            <div
              className="absolute top-4 left-4 flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-white/90"
              style={{ textShadow: "0 1px 3px rgba(0,0,0,0.7)" }}
            >
              <span
                className="h-2 w-2 rounded-full bg-red-500"
                style={{ animation: "fx-rec-blink 1s steps(2,end) infinite" }}
              />
              REC
            </div>
            <div
              className="absolute bottom-4 right-4 font-mono text-[11px] tracking-[0.18em] text-white/90"
              style={{ textShadow: "0 1px 3px rgba(0,0,0,0.7)" }}
            >
              {tc}
            </div>
            <div
              className="absolute top-4 right-4 font-mono text-[10px] tracking-[0.18em] text-white/70"
              style={{ textShadow: "0 1px 3px rgba(0,0,0,0.7)" }}
            >
              SP · LP
            </div>
          </>
        )}

        {id === "cinematic" && (
          <>
            <div className="absolute inset-x-0 top-0 h-[15%] bg-black" />
            <div className="absolute inset-x-0 bottom-0 h-[15%] bg-black" />
          </>
        )}

        {id === "glitch" && (
          <div
            className="absolute inset-0 fx-glitch"
            style={{ animation: "fx-glitch-skew 2.4s steps(1,end) infinite" }}
          />
        )}

        {id === "neon" && (
          <div
            className="absolute inset-2 rounded-[28px]"
            style={{ animation: "fx-neon-pulse 2.4s ease-in-out infinite" }}
          />
        )}

        {/* === Animation preset (re-mounted on change so keyframes restart) === */}
        {activeAnimation && <AnimationLayer key={animationKey} preset={activeAnimation} />}
      </div>

      {/* === Draggable Canvas text overlays === */}
      {activeCanvasPreset?.textOverlays?.map((t) => (
        <CanvasTextLayer
          key={t.id}
          overlay={t}
          presetId={activeCanvasPreset.id}
          containerRef={containerRef}
        />
      ))}

      {/* === Draggable Caption === */}
      {activeCaption && <CaptionLayer caption={activeCaption} containerRef={containerRef} />}
    </div>
  );
};

export default OverlayEngine;
