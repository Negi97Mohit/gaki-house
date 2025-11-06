// src/components/CameraRenderer.tsx

import React, { useEffect, useRef } from "react";
import { useCameraEffects } from "@/hooks/useCameraEffects";

// --- HELPER FUNCTIONS (No changes) ---
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;
  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

function detectEdges(
  ctx: CanvasRenderingContext2D,
  imageData: ImageData,
  intensity: number,
  color: string
): ImageData {
  const data = imageData.data;
  const w = imageData.width;
  const h = imageData.height;
  const output = ctx.createImageData(w, h);
  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
  const colors: { [key: string]: [number, number, number] } = {
    cyan: [0, 255, 255],
    magenta: [255, 0, 255],
    green: [0, 255, 0],
    blue: [0, 100, 255],
    red: [255, 0, 0],
    yellow: [255, 255, 0],
  };
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      let gx = 0,
        gy = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * w + (x + kx)) * 4;
          const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
          const kernelIdx = (ky + 1) * 3 + (kx + 1);
          gx += gray * sobelX[kernelIdx];
          gy += gray * sobelY[kernelIdx];
        }
      }
      const magnitude = Math.sqrt(gx * gx + gy * gy) * intensity;
      const outIdx = (y * w + x) * 4;
      if (magnitude > 20) {
        let rgb =
          color === "rainbow"
            ? hslToRgb((x / w + y / h) * 360, 100, 50)
            : colors[color] || colors["cyan"];
        output.data[outIdx] = rgb[0];
        output.data[outIdx + 1] = rgb[1];
        output.data[outIdx + 2] = rgb[2];
        output.data[outIdx + 3] = Math.min(magnitude * 1.5, 255);
      }
    }
  }
  return output;
}

// --- PROPS INTERFACE ---
interface CameraRendererProps {
  stream: MediaStream | null;
  backgroundEffect: "none" | "blur" | "image";
  backgroundImageUrl?: string | null;
  isAutoFramingEnabled: boolean;
  zoomSensitivity: number;
  trackingSpeed: number;
  className?: string;
  style?: React.CSSProperties;
  isNeonEdgeEnabled: boolean;
  neonIntensity: number;
  neonColor: string;
  videoFilter: string;
  cameraBackground?: "none" | "blur" | "image";
  customBackgroundUrl?: string | null;
  isFaceTrackingEnabled?: boolean;
  cameraAspectRatio?: string;
}

export const CameraRenderer: React.FC<CameraRendererProps> = ({
  stream,
  isNeonEdgeEnabled,
  neonIntensity,
  neonColor,
  videoFilter,
  className,
  style,
  cameraBackground = "none",
  customBackgroundUrl,
  isFaceTrackingEnabled = false,
  cameraAspectRatio = "16:9",
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const tempCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize useCameraEffects hook
  const { processedCanvas, facePosition, isReady } = useCameraEffects({
    videoElement: videoRef.current,
    isBackgroundRemovalEnabled: cameraBackground !== "none",
    backgroundType: cameraBackground,
    backgroundImageUrl: customBackgroundUrl || undefined,
    isFaceTrackingEnabled,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resizeObserver = new ResizeObserver(() => {
      if (canvas) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }
    });
    resizeObserver.observe(canvas);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    if (stream) {
      video.srcObject = stream;
      video.play().catch(console.error);
    }

    const renderFrame = () => {
      if (
        !video.srcObject ||
        video.paused ||
        video.ended ||
        video.videoWidth === 0
      ) {
        animationFrameRef.current = requestAnimationFrame(renderFrame);
        return;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (
        canvas.width !== canvas.clientWidth ||
        canvas.height !== canvas.clientHeight
      ) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Use processed canvas if background removal is active
      const sourceElement = processedCanvas || video;

      // Calculate aspect ratio to maintain video proportions
      const videoAspect = video.videoWidth / video.videoHeight;
      const canvasAspect = canvas.width / canvas.height;

      let drawWidth = canvas.width;
      let drawHeight = canvas.height;
      let drawX = 0;
      let drawY = 0;

      // Apply face tracking offset if enabled
      if (isFaceTrackingEnabled && facePosition) {
        const offsetX = (50 - facePosition.x) * 0.1;
        const offsetY = (50 - facePosition.y) * 0.1;
        drawX += offsetX * canvas.width;
        drawY += offsetY * canvas.height;
      }

      // Cover the canvas while maintaining aspect ratio (like object-fit: cover)
      if (canvasAspect > videoAspect) {
        // Canvas is wider than video
        drawHeight = canvas.width / videoAspect;
        drawY += (canvas.height - drawHeight) / 2;
      } else {
        // Canvas is taller than video
        drawWidth = canvas.height * videoAspect;
        drawX += (canvas.width - drawWidth) / 2;
      }

      ctx.filter = videoFilter;
      ctx.drawImage(sourceElement, drawX, drawY, drawWidth, drawHeight);
      ctx.filter = "none";

      if (isNeonEdgeEnabled) {
        if (
          !tempCanvasRef.current ||
          tempCanvasRef.current.width !== drawWidth ||
          tempCanvasRef.current.height !== drawHeight
        ) {
          tempCanvasRef.current = document.createElement("canvas");
          tempCanvasRef.current.width = Math.round(drawWidth);
          tempCanvasRef.current.height = Math.round(drawHeight);
        }
        const tempCanvas = tempCanvasRef.current;
        const tempCtx = tempCanvas.getContext("2d", {
          willReadFrequently: true,
        });
        if (!tempCtx) return;
        tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
        const frame = tempCtx.getImageData(
          0,
          0,
          tempCanvas.width,
          tempCanvas.height
        );
        const edges = detectEdges(tempCtx, frame, neonIntensity, neonColor);
        ctx.globalCompositeOperation = "lighter";
        ctx.putImageData(edges, Math.round(drawX), Math.round(drawY));
        ctx.globalCompositeOperation = "source-over";
      }

      animationFrameRef.current = requestAnimationFrame(renderFrame);
    };

    renderFrame();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [stream, isNeonEdgeEnabled, neonIntensity, neonColor, videoFilter, processedCanvas, facePosition, isFaceTrackingEnabled]);

  return (
    <div className={className} style={style}>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="hidden object-cover w-full h-full"
      />
      <canvas ref={canvasRef} className="w-full h-full aspect-auto" />
    </div>
  );
};
