import { useEffect, useRef, useState } from "react";
import { useCamera } from "@/context/CameraContext";
import { useFx } from "@/context/FxContext";
import OverlayEngine from "@/features/canvas/ui/OverlayEngine";
import WebGLVideoCanvas from "@/features/filters/ui/WebGLVideoCanvas";
import { useVideoTransform } from "@/features/effects/hooks/useVideoTransform";
import { useGpuEffect } from "@/features/effects/hooks/useGpuEffect";
import { cn } from "@/lib/utils";

const SWIPE_THRESHOLD = 60;

/** Wrapper that feeds AnimeStyles from FxContext into WebGLVideoCanvas */
const WebGLVideoCanvasWithStyles = () => {
  const { animeStyles } = useFx();
  return <WebGLVideoCanvas animeStyles={animeStyles} />;
};

/**
 * Full-bleed live camera preview.
 *
 * The HTMLVideoElement is hidden (display:none) and only fed to a
 * THREE.VideoTexture via WebGLVideoCanvas. All video filtering — including
 * the basic CSS-style grades — happens on the GPU through a single fragment
 * shader. This eliminates the iOS-Safari lag caused by the previous
 * backdrop-filter + mix-blend-mode DOM pipeline.
 */
const VideoBackdrop = () => {
  const { videoRef, facing, active, denied, swapping } = useCamera();
  const { activeFilter, cycleFilter, activeCinematicShots, cinematicSettings } = useFx();

  const [flash, setFlash] = useState<string | null>(null);
  const flashTimer = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const swipedRef = useRef(false);
  const transformContainerRef = useRef<HTMLDivElement>(null);
  const gpuCanvasRef = useRef<HTMLCanvasElement>(null);

  const { applyHardwareConstraint } = useCamera();
  const [successfulHwShots, setSuccessfulHwShots] = useState<Set<string>>(new Set());

  useEffect(() => {
    const checkConstraints = async () => {
      const successSet = new Set<string>();
      for (const shot of activeCinematicShots) {
        if (shot.hardwareConstraint) {
          const success = await applyHardwareConstraint(
            shot.hardwareConstraint.capability, 
            shot.hardwareConstraint.value
          );
          if (success) {
            successSet.add(shot.id);
          }
        }
      }
      setSuccessfulHwShots(successSet);
    };
    checkConstraints();
  }, [activeCinematicShots, applyHardwareConstraint]);

  useVideoTransform({ 
    containerRef: transformContainerRef, 
    shots: activeCinematicShots,
    successfulHwShots,
    cinematicSettings
  });
  useGpuEffect({ videoRef, canvasRef: gpuCanvasRef, shots: activeCinematicShots });

  const showFlash = (name: string) => {
    setFlash(name);
    if (flashTimer.current) window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlash(null), 900);
  };

  useEffect(() => () => {
    if (flashTimer.current) window.clearTimeout(flashTimer.current);
  }, []);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartX.current = t.clientX;
    touchStartY.current = t.clientY;
    swipedRef.current = false;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current == null || touchStartY.current == null || swipedRef.current) return;
    const t = e.touches[0];
    const dx = t.clientX - touchStartX.current;
    const dy = t.clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_THRESHOLD) {
      const next = cycleFilter(dx < 0 ? 1 : -1);
      showFlash(next.name);
      swipedRef.current = true;
    }
  };

  const onTouchEnd = () => {
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // NOTE: activeFilter (the "Filters" category — vivid/noir/etc.) used to be
  // applied as CSS on the <video>. With the WebGL pipeline, those grades
  // would also belong as shader uniforms; for now we keep their visual on the
  // overlay engine. The preset id is read so the overlay engine can react.
  void activeFilter;

  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden bg-preview"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Hidden source video — fed to THREE.VideoTexture only. */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        style={{ display: "none" }}
      />

      {/* Mirror selfie camera on an independent wrapper to protect it from useVideoTransform's inline styles */}
      <div className={cn("absolute inset-0 origin-center", facing === "user" && "-scale-x-100")}>
        {/* WebGL canvas wrapped with CSS transform receiver for Cinematic Shots */}
        <div ref={transformContainerRef} className="absolute inset-0" style={{ willChange: "transform" }}>
          {!denied && <WebGLVideoCanvasWithStyles />}
          {/* Tier 2 GPU effect canvas */}
          {!denied && <canvas ref={gpuCanvasRef} className="absolute inset-0 w-full h-full" style={{ display: 'none' }} />}
        </div>
      </div>

      {/* Structural overlay engine (VHS, Cinematic, Glitch, Neon...) */}
      <OverlayEngine />

      {!active && (
        <>
          <div className="absolute -top-24 -left-20 h-[55%] w-[70%] rounded-full bg-[hsl(14_95%_60%/0.55)] blur-3xl" />
          <div className="absolute top-1/3 -right-24 h-[50%] w-[65%] rounded-full bg-[hsl(280_70%_55%/0.45)] blur-3xl" />
          <div className="absolute bottom-0 left-1/4 h-[45%] w-[60%] rounded-full bg-[hsl(200_80%_55%/0.35)] blur-3xl" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="font-display italic text-white/15 text-[8rem] select-none leading-none">
              {denied ? "offline" : "live"}
            </div>
          </div>
        </>
      )}

      {swapping && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity" />
      )}



      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_45%,_hsl(20_14%_8%/0.45)_100%)]" />

      {flash && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10">
          <div
            key={flash}
            className="font-display italic text-white text-6xl drop-shadow-[0_4px_20px_rgba(0,0,0,0.7)]"
            style={{ animation: "fx-flash 900ms var(--ease-out-soft) both" }}
          >
            {flash}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoBackdrop;
