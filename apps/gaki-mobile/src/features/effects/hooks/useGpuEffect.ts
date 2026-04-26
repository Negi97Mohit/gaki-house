import { useEffect, useRef, useState } from "react";
import type { CinematicPreset } from "@/data/cinematicShots";

// Single persistent worker instance
let workerInstance: Worker | null = null;
// Track whether the worker is busy to drop frames instead of queuing
let isWorkerBusy = false;

interface GpuEffectOptions {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  shots: CinematicPreset[];
}

export function useGpuEffect({ videoRef, canvasRef, shots }: GpuEffectOptions) {
  const [isSupported, setIsSupported] = useState(true);
  const rafRef = useRef(0);
  const initializedRef = useRef(false);
  const [thermalDegraded, setThermalDegraded] = useState(false);

  // Find the first Tier 2 shot. We only support 1 Tier 2 shader at a time for performance.
  const tier2Shot = shots.find(s => s.tier === 2 && s.shader);

  // Check battery level periodically
  useEffect(() => {
    if (!('getBattery' in navigator)) return;
    let checkInterval: number;
    (navigator as any).getBattery().then((battery: any) => {
      const checkBattery = () => {
        if (!battery.charging && battery.level < 0.20) {
          setThermalDegraded(true);
        }
      };
      checkBattery();
      battery.addEventListener('levelchange', checkBattery);
      battery.addEventListener('chargingchange', checkBattery);
      
      return () => {
        battery.removeEventListener('levelchange', checkBattery);
        battery.removeEventListener('chargingchange', checkBattery);
      };
    });
  }, []);

  useEffect(() => {
    if (typeof OffscreenCanvas === 'undefined') {
      setIsSupported(false);
      return;
    }

    if (!workerInstance) {
      workerInstance = new Worker(new URL('../workers/effectWorker.ts', import.meta.url), { type: 'module' });
      workerInstance.onmessage = (e) => {
        if (e.data.type === 'FRAME_DONE') {
          isWorkerBusy = false;
        }
      };
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isSupported || !canvasRef.current || !workerInstance) return;

    if (!initializedRef.current) {
      const offscreen = canvasRef.current.transferControlToOffscreen();
      workerInstance.postMessage({ type: 'INIT', payload: { canvas: offscreen } }, [offscreen]);
      initializedRef.current = true;
    }

    if (tier2Shot && !thermalDegraded) {
      workerInstance.postMessage({ type: 'SET_SHADER', payload: { shader: tier2Shot.shader } });
      canvasRef.current.style.display = 'block';

      let lastTime = performance.now();
      let droppedFrames = 0;
      let frameCount = 0;

      const tick = async (timestamp: number) => {
        const delta = timestamp - lastTime;
        lastTime = timestamp;

        // Thermal degradation check: if frames consistently take > 18ms (less than ~55fps)
        frameCount++;
        if (delta > 18) droppedFrames++;
        
        if (frameCount > 60) { // check every ~1 sec
          if (droppedFrames > 30) {
            console.warn("Thermal throttling detected, degrading Cinematic Shot to CSS Tier 3");
            setThermalDegraded(true);
            return; // Exit loop
          }
          frameCount = 0;
          droppedFrames = 0;
        }

        if (!videoRef.current || videoRef.current.readyState < 2) {
          rafRef.current = requestAnimationFrame(tick);
          return;
        }

        if (!isWorkerBusy) {
          try {
            isWorkerBusy = true;
            // Capture frame via createImageBitmap
            const bitmap = await createImageBitmap(videoRef.current);
            workerInstance?.postMessage({ type: 'RENDER_FRAME', payload: { bitmap } }, [bitmap]);
          } catch (e) {
            isWorkerBusy = false; // Could be a blank frame on iOS seek
          }
        }
        
        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
    } else {
      // Hide canvas when no Tier 2 effect
      canvasRef.current.style.display = 'none';
      cancelAnimationFrame(rafRef.current);
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [tier2Shot, isSupported, canvasRef, videoRef]);

  return { isSupported };
}
