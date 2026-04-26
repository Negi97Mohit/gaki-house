import { useEffect, useRef, useCallback } from "react";
import type { CinematicPreset } from "@/data/cinematicShots";

interface VideoTransformOptions {
  containerRef: React.RefObject<HTMLDivElement>;
  shots: CinematicPreset[];
  successfulHwShots?: Set<string>;
  cinematicSettings?: { loop?: boolean; speedMultiplier?: number };
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function useVideoTransform({ containerRef, shots, successfulHwShots, cinematicSettings }: VideoTransformOptions) {
  const rafRef = useRef<number>(0);
  const settingsRef = useRef(cinematicSettings);

  useEffect(() => {
    settingsRef.current = cinematicSettings;
  }, [cinematicSettings]);
  // Store start times per shot ID so combinations don't reset each other
  const startTimesRef = useRef<Record<string, number>>({});
  const lastFrameTimeRef = useRef<number>(0);

  const animate = useCallback((timestamp: number) => {
    if (!containerRef.current) return;

    // Frame-skipping protection (target <10ms delta for 60fps, skip if we're queuing up)
    // Actually, we want to run at browser rAF rate, but if we missed a frame (e.g. 16ms+), we just update with the larger delta.
    // If the frame took less than 10ms (100fps+ display?), we still update.
    // We can just track time elapsed.

    let anyActive = false;
    const matrix = new DOMMatrix();

    shots.forEach(shot => {
      // If hardware constraint succeeded, we don't apply the CSS transform fallback
      if (successfulHwShots?.has(shot.id)) return;
      if (!shot.transform) return;

      anyActive = true;

      if (!startTimesRef.current[shot.id]) {
        startTimesRef.current[shot.id] = timestamp;
      }
      const elapsed = timestamp - startTimesRef.current[shot.id];
      const { keyframes, duration } = shot.transform;
      
      const speed = settingsRef.current?.speedMultiplier ?? 1.0;
      const actualDuration = duration / speed;
      const loop = settingsRef.current?.loop ?? shot.transform.loop;
      
      const progress = loop
        ? (elapsed % actualDuration) / actualDuration
        : Math.min(elapsed / actualDuration, 1);

      const frameIndex = progress * (keyframes.length - 1);
      const floorIndex = Math.floor(frameIndex);
      const ceilIndex = Math.min(Math.ceil(frameIndex), keyframes.length - 1);
      
      const fromFrame = keyframes[floorIndex];
      const toFrame = keyframes[ceilIndex];
      const t = ceilIndex === floorIndex ? 0 : frameIndex % 1;

      const x = lerp(fromFrame.x ?? 0, toFrame.x ?? 0, t);
      const y = lerp(fromFrame.y ?? 0, toFrame.y ?? 0, t);
      const scale = lerp(fromFrame.scale ?? 1, toFrame.scale ?? 1, t);
      const rotate = lerp(fromFrame.rotate ?? 0, toFrame.rotate ?? 0, t);

      matrix.translateSelf(x, y);
      matrix.rotateSelf(rotate);
      matrix.scaleSelf(scale);
    });

    if (anyActive) {
      containerRef.current.style.transform = matrix.toString();
      rafRef.current = requestAnimationFrame(animate);
    }
  }, [shots, containerRef]);

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);

    if (!containerRef.current) return;

    if (!shots.length) {
      containerRef.current.style.transform = "";
      containerRef.current.style.width = "100%";
      containerRef.current.style.height = "100%";
      containerRef.current.style.marginLeft = "0";
      containerRef.current.style.marginTop = "0";
      startTimesRef.current = {};
      return;
    }

    // Clean up start times for removed shots
    const currentIds = new Set(shots.map(s => s.id));
    Object.keys(startTimesRef.current).forEach(id => {
      if (!currentIds.has(id)) delete startTimesRef.current[id];
    });

    // Apply cumulative cropFactor
    const maxCropFactor = shots.reduce((max, shot) => Math.max(max, shot.cropFactor ?? 1), 1);
    if (maxCropFactor > 1) {
      containerRef.current.style.width = `${maxCropFactor * 100}%`;
      containerRef.current.style.height = `${maxCropFactor * 100}%`;
      containerRef.current.style.marginLeft = `-${((maxCropFactor - 1) / 2) * 100}%`;
      containerRef.current.style.marginTop = `-${((maxCropFactor - 1) / 2) * 100}%`;
    } else {
      containerRef.current.style.width = "100%";
      containerRef.current.style.height = "100%";
      containerRef.current.style.marginLeft = "0";
      containerRef.current.style.marginTop = "0";
    }

    const hasTransforms = shots.some(s => s.transform);
    if (hasTransforms) {
      rafRef.current = requestAnimationFrame(animate);
    } else {
      containerRef.current.style.transform = "";
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [shots, animate, containerRef]);
}
