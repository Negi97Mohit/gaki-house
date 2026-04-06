import { useEffect, useRef, useState } from "react";
import { BroadcastBus } from "@/kernel/engine/BroadcastBus";

export function useStingerTransition(
  stingerConfig: { path: string; transitionPoint: number } | null,
  kernelRef: { current: BroadcastBus | null }
) {
  const [isReady, setIsReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const frameIdRef = useRef<number>(0);

  useEffect(() => {
    if (!stingerConfig?.path) return;

    let blobUrl: string | null = null;
    let isActive = true;

    const loadWebm = async () => {
      try {
        const buffer = await (window as any).electron.asset.readFile(stingerConfig.path);
        if (!isActive) return;

        const blob = new Blob([buffer], { type: "video/webm" });
        blobUrl = URL.createObjectURL(blob);

        const video = document.createElement("video");
        video.src = blobUrl;
        video.loop = false;
        video.muted = true;
        video.playsInline = true;
        
        video.style.position = 'fixed';
        video.style.top = '-9999px';
        video.style.left = '-9999px';
        video.style.width = '1px';
        video.style.height = '1px';
        video.style.opacity = '0';
        video.style.pointerEvents = 'none';
        video.style.zIndex = '-1';
        video.style.visibility = 'hidden';

        document.body.appendChild(video);
        videoRef.current = video;

        // Automatically send STINGER_STOP when ended
        video.onended = () => {
          if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
          kernelRef.current?.clearStinger();
        };

        setIsReady(true);
        console.log(`[useStingerTransition] Loaded stinger webm (${stingerConfig.path})`);
      } catch (err) {
        console.error("[useStingerTransition] Failed to load stinger:", err);
      }
    };

    loadWebm();

    return () => {
      isActive = false;
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
      if (videoRef.current) {
        videoRef.current.onended = null;
        videoRef.current.remove();
        videoRef.current = null;
      }
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      kernelRef.current?.clearStinger();
    };
  }, [stingerConfig]);

  // Attach a trigger method to the kernel for Index.tsx to call
  useEffect(() => {
    if (!kernelRef.current) return;
    
    kernelRef.current.triggerStingerPlayback = () => {
      if (!isReady || !videoRef.current) {
        console.warn("[useStingerTransition] Playback blocked - not ready.");
        return false;
      }
      
      const video = videoRef.current;
      video.currentTime = 0;
      
      const drawFrame = async () => {
        if (!video.paused && !video.ended && kernelRef.current) {
          try {
            const bitmap = await createImageBitmap(video);
            kernelRef.current.sendStingerFrame(bitmap);
          } catch (e) {
            // Ignore temporary empty frame errors
          }
        }
        if (!video.ended) {
          frameIdRef.current = requestAnimationFrame(drawFrame);
        }
      };

      video.play().then(() => {
        if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
        frameIdRef.current = requestAnimationFrame(drawFrame);
      }).catch(err => {
        console.warn("[useStingerTransition] Playback blocked by browser:", err);
      });
      
      return true;
    };
  }, [isReady, kernelRef.current]);
  
  return { isReady };
}
