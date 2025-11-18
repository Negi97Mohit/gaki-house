// src/components/CameraRenderer.tsx
import { createPortal } from "react-dom";
import React, { useEffect, useRef, useState } from "react";
import { useCameraEffects } from "@/hooks/useCameraEffects";
import { PipControlsToolbar } from "./PipControlsToolbar";
import { VideoOff } from "lucide-react";
import { cn } from "@/lib/utils";

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

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : [0, 255, 255]; // fallback to cyan
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
        let rgb: [number, number, number];
        if (color === "rainbow") {
          rgb = hslToRgb((x / w + y / h) * 360, 100, 50);
        } else if (color.startsWith("#")) {
          // Support hex colors
          rgb = hexToRgb(color);
        } else {
          // Support preset color names
          rgb = colors[color] || colors["cyan"];
        }
        output.data[outIdx] = rgb[0];
        output.data[outIdx + 1] = rgb[1];
        output.data[outIdx + 2] = rgb[2];
        output.data[outIdx + 3] = Math.min(magnitude * 1.5, 255);
      }
    }
  }
  return output;
}

// 1. Hologram Glitch - RGB split with scan lines and digital glitches
function applyHologramEffect(
  ctx: CanvasRenderingContext2D,
  imageData: ImageData,
  time: number
): ImageData {
  const data = imageData.data;
  const w = imageData.width;
  const h = imageData.height;
  const output = ctx.createImageData(w, h);
  
  // RGB channel shift amount (animated)
  const shift = Math.sin(time * 0.003) * 5;
  const glitchIntensity = Math.random() > 0.95 ? Math.random() * 10 : 0;
  
  for (let y = 0; y < h; y++) {
    // Scan line effect
    const scanLine = Math.sin(y * 0.5 + time * 0.01) * 0.3 + 0.7;
    
    // Random glitch lines
    const isGlitchLine = Math.random() > 0.98;
    const lineOffset = isGlitchLine ? Math.random() * 20 - 10 : 0;
    
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      
      // RGB split effect
      const rIdx = (y * w + Math.min(w - 1, Math.max(0, x + shift + glitchIntensity))) * 4;
      const gIdx = idx;
      const bIdx = (y * w + Math.min(w - 1, Math.max(0, x - shift - glitchIntensity))) * 4;
      
      output.data[idx] = data[rIdx] * scanLine;
      output.data[idx + 1] = data[gIdx + 1] * scanLine;
      output.data[idx + 2] = data[bIdx + 2] * scanLine;
      output.data[idx + 3] = data[idx + 3] * 0.8; // Semi-transparent
    }
  }
  
  return output;
}

// 2. Pixelated - Retro pixel art effect
function applyPixelEffect(
  ctx: CanvasRenderingContext2D,
  imageData: ImageData,
  pixelSize: number = 8
): ImageData {
  const data = imageData.data;
  const w = imageData.width;
  const h = imageData.height;
  const output = ctx.createImageData(w, h);
  
  for (let y = 0; y < h; y += pixelSize) {
    for (let x = 0; x < w; x += pixelSize) {
      // Get average color of pixel block
      let r = 0, g = 0, b = 0, count = 0;
      
      for (let py = 0; py < pixelSize && y + py < h; py++) {
        for (let px = 0; px < pixelSize && x + px < w; px++) {
          const idx = ((y + py) * w + (x + px)) * 4;
          r += data[idx];
          g += data[idx + 1];
          b += data[idx + 2];
          count++;
        }
      }
      
      r = Math.floor(r / count / 64) * 64; // Posterize
      g = Math.floor(g / count / 64) * 64;
      b = Math.floor(b / count / 64) * 64;
      
      // Fill the block
      for (let py = 0; py < pixelSize && y + py < h; py++) {
        for (let px = 0; px < pixelSize && x + px < w; px++) {
          const idx = ((y + py) * w + (x + px)) * 4;
          output.data[idx] = r;
          output.data[idx + 1] = g;
          output.data[idx + 2] = b;
          output.data[idx + 3] = data[idx + 3];
        }
      }
    }
  }
  
  return output;
}

// 3. Comic Book - Halftone dots and posterization
function applyComicEffect(
  ctx: CanvasRenderingContext2D,
  imageData: ImageData
): ImageData {
  const data = imageData.data;
  const w = imageData.width;
  const h = imageData.height;
  const output = ctx.createImageData(w, h);
  
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      
      // Posterize colors
      const r = Math.floor(data[idx] / 85) * 85;
      const g = Math.floor(data[idx + 1] / 85) * 85;
      const b = Math.floor(data[idx + 2] / 85) * 85;
      
      // Halftone dot pattern
      const dotSize = 4;
      const dotX = x % dotSize;
      const dotY = y % dotSize;
      const dist = Math.sqrt((dotX - dotSize/2) ** 2 + (dotY - dotSize/2) ** 2);
      const threshold = (gray / 255) * (dotSize / 2);
      
      const isDot = dist < threshold;
      
      output.data[idx] = isDot ? r : 255;
      output.data[idx + 1] = isDot ? g : 255;
      output.data[idx + 2] = isDot ? b : 255;
      output.data[idx + 3] = data[idx + 3];
    }
  }
  
  return output;
}

// 4. ASCII Art - Convert to ASCII characters
function applyASCIIEffect(
  ctx: CanvasRenderingContext2D,
  imageData: ImageData,
  canvas: HTMLCanvasElement
): void {
  const data = imageData.data;
  const w = imageData.width;
  const h = imageData.height;
  const chars = ['@', '#', '$', '%', '?', '*', '+', ';', ':', ',', '.', ' '];
  const charSize = 8;
  
  // Clear canvas
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#00FF00';
  ctx.font = `${charSize}px monospace`;
  
  for (let y = 0; y < h; y += charSize) {
    for (let x = 0; x < w; x += charSize) {
      // Get average brightness
      let brightness = 0, count = 0;
      
      for (let py = 0; py < charSize && y + py < h; py++) {
        for (let px = 0; px < charSize && x + px < w; px++) {
          const idx = ((y + py) * w + (x + px)) * 4;
          brightness += (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
          count++;
        }
      }
      
      brightness = brightness / count / 255;
      const charIdx = Math.floor(brightness * (chars.length - 1));
      ctx.fillText(chars[charIdx], x, y + charSize);
    }
  }
}

// 5. Thermal Vision - Heat map based on brightness
function applyThermalEffect(
  ctx: CanvasRenderingContext2D,
  imageData: ImageData
): ImageData {
  const data = imageData.data;
  const w = imageData.width;
  const h = imageData.height;
  const output = ctx.createImageData(w, h);
  
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3 / 255;
      
      // Thermal color mapping
      let r, g, b;
      if (brightness < 0.25) {
        // Cold - Blue to Cyan
        r = 0;
        g = brightness * 4 * 100;
        b = 150 + brightness * 4 * 105;
      } else if (brightness < 0.5) {
        // Cool - Cyan to Green
        const t = (brightness - 0.25) * 4;
        r = 0;
        g = 100 + t * 155;
        b = 255 - t * 255;
      } else if (brightness < 0.75) {
        // Warm - Green to Yellow
        const t = (brightness - 0.5) * 4;
        r = t * 255;
        g = 255;
        b = 0;
      } else {
        // Hot - Yellow to White
        const t = (brightness - 0.75) * 4;
        r = 255;
        g = 255;
        b = t * 255;
      }
      
      output.data[idx] = r;
      output.data[idx + 1] = g;
      output.data[idx + 2] = b;
      output.data[idx + 3] = data[idx + 3];
    }
  }
  
  return output;
}

// --- PROPS INTERFACE (Fully updated) ---
interface CameraRendererProps {
  stream: MediaStream | null;
  className?: string;
  style?: React.CSSProperties;
  videoFilter: string;
  isNeonEdgeEnabled: boolean;
  neonIntensity: number;
  neonColor: string;
  cameraBackground?: "none" | "blur" | "image";
  customBackgroundUrl?: string | null;
  isFaceTrackingEnabled?: boolean; // This prop is now overridden by isAutoFramingEnabled
  cameraAspectRatio?: string;

  // --- All Toolbar Props ---
  pipBorder?: { color: string; width: number };
  onPipBorderChange: (border: { color: string; width: number }) => void;
  pipShadow?: { blur: number; color: string };
  onPipShadowChange: (shadow: { blur: number; color: string }) => void;
  isAutoFramingEnabled: boolean;
  onAutoFramingChange: (enabled: boolean) => void;
  isBeautifyEnabled: boolean;
  onBeautifyToggle: (enabled: boolean) => void;
  isLowLightEnabled: boolean;
  onLowLightToggle: (enabled: boolean) => void;
  onVideoFilterChange: (filter: string) => void;
  onNeonEdgeToggle: (enabled: boolean) => void;
  onNeonIntensityChange: (value: number) => void;
  onNeonEdgeColorChange: (color: string) => void;
  zoomSensitivity: number;
  onZoomSensitivityChange: (value: number) => void;
  trackingSpeed: number;
  onTrackingSpeedChange: (value: number) => void;
  // New interactive filters
  activeInteractiveFilter?: 'none' | 'neon-edge' | 'hologram' | 'pixel' | 'comic' | 'ascii' | 'thermal';
  onInteractiveFilterChange?: (filter: 'none' | 'neon-edge' | 'hologram' | 'pixel' | 'comic' | 'ascii' | 'thermal') => void;
  onCameraBackgroundChange: (bgId: "none" | "blur" | "image") => void;
  onCustomBackgroundUpload: (file: File) => void;
  onCameraAspectRatioChange: (ratio: string) => void;
  customAspectRatio: string;
  onCustomAspectRatioChange: (ratio: string) => void;
  onFaceTrackingToggle: (enabled: boolean) => void; // Kept for the UI

  // --- Original Background Props ---
  backgroundEffect: "none" | "blur" | "image";
  backgroundImageUrl?: string | null;
  portalContainer?: HTMLElement | null;
}

export const CameraRenderer: React.FC<CameraRendererProps> = ({
  stream,
  className,
  style,
  videoFilter,
  isNeonEdgeEnabled,
  neonIntensity,
  neonColor,
  cameraBackground = "none",
  customBackgroundUrl,
  isFaceTrackingEnabled = false, // We still accept this prop
  cameraAspectRatio = "16:9",
  pipBorder,
  onPipBorderChange,
  pipShadow,
  onPipShadowChange,
  isAutoFramingEnabled, // This is the main prop for the new logic
  onAutoFramingChange,
  isBeautifyEnabled,
  onBeautifyToggle,
  isLowLightEnabled,
  onLowLightToggle,
  onVideoFilterChange,
  onNeonEdgeToggle,
  onNeonIntensityChange,
  onNeonEdgeColorChange,
  zoomSensitivity, // Prop for zoom level
  onZoomSensitivityChange,
  trackingSpeed, // Prop for pan speed
  onTrackingSpeedChange,
  onCameraBackgroundChange,
  onCustomBackgroundUpload,
  onCameraAspectRatioChange,
  customAspectRatio,
  onCustomAspectRatioChange,
  onFaceTrackingToggle,
  backgroundEffect,
  backgroundImageUrl,
  portalContainer,
  activeInteractiveFilter = 'none',
  onInteractiveFilterChange,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const tempCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });

  // --- Refs for smoothed auto-frame state ---
  const currentScale = useRef(1);
  const currentXOffset = useRef(0);
  const currentYOffset = useRef(0);

  // Initialize useCameraEffects hook
  const { processedCanvas, facePosition, isReady } = useCameraEffects({
    videoElement: videoRef.current,
    isBackgroundRemovalEnabled: cameraBackground !== "none",
    backgroundType: cameraBackground,
    backgroundImageUrl: customBackgroundUrl || undefined,
    isFaceTrackingEnabled: isFaceTrackingEnabled || isAutoFramingEnabled,
  });

  const handleMouseEnter = () => {
    if (containerRef.current) {
      setToolbarPosition({
        x: containerRef.current.offsetWidth / 2,
        y: 0,
      });
    }
    setIsHovered(true);
  };
  const handleMouseLeave = () => setIsHovered(false);

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
  }, [canvasRef.current]);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    if (stream) {
      if (video.srcObject !== stream) {
        video.srcObject = stream;
        video.play().catch(console.error);
      }
    } else {
      if (video.srcObject) {
        video.srcObject = null;
      }
    }

    const renderFrame = () => {
      if (
        !video.srcObject ||
        video.paused ||
        video.ended ||
        video.videoWidth === 0
      ) {
        // Reset zoom/pan when video stops
        currentScale.current = 1;
        currentXOffset.current = 0;
        currentYOffset.current = 0;
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

      const sourceElement = processedCanvas || video;
      const sourceWidth = video.videoWidth;
      const sourceHeight = video.videoHeight;
      const sourceAspect = sourceWidth / sourceHeight;
      const canvasAspect = canvas.width / canvas.height;

      // --- START: NEW ROBUST PAN/ZOOM LOGIC ---

      // 1. Calculate base 'cover' scale
      const baseScale =
        canvasAspect > sourceAspect
          ? canvas.width / sourceWidth // Canvas is wider, fit to width
          : canvas.height / sourceHeight; // Canvas is taller, fit to height

      // 2. Determine target auto-frame scale & pan
      let targetScale = 1.0; // This is the *additional* zoom
      let targetXOffset = 0.0; // -0.5 to 0.5 (percentage of video width)
      let targetYOffset = 0.0; // -0.5 to 0.5 (percentage of video height)

      if (isAutoFramingEnabled && facePosition) {
        // Calculate target scale
        const faceWidthPx = (facePosition.width / 100) * sourceWidth;
        const faceHeightPx = (facePosition.height / 100) * sourceHeight;
        const faceSizePx = Math.max(faceWidthPx, faceHeightPx);

        const faceScreenPercentage = 0.1 + (zoomSensitivity / 10) * 0.2; // 15% to 50%

        // Calculate how much we need to scale the face to reach target size
        const targetFaceSizePx =
          Math.min(canvas.width, canvas.height) * faceScreenPercentage;

        targetScale = Math.min(5, Math.max(1, targetFaceSizePx / faceSizePx));
        // Calculate target pan (face center % (0-100) -> pan % (-0.5 to 0.5))

        targetXOffset = (50 - facePosition.x) / 100;
        targetYOffset = (50 - facePosition.y) / 100;
      } else if (isFaceTrackingEnabled && facePosition) {
        // Fallback to simple face tracking (pan only)
        targetScale = 1.0;
        targetXOffset = (50 - facePosition.x) / 100;
        targetYOffset = (50 - facePosition.y) / 100;
      }

      // 3. Apply Smoothing (Lerp)
      const zoomSpeed = 0.05; // Slower, smoother zoom
      currentScale.current += (targetScale - currentScale.current) * zoomSpeed;

      // Use the user's trackingSpeed prop (0.01 to 0.5)
      currentXOffset.current +=
        (targetXOffset - currentXOffset.current) * trackingSpeed;
      currentYOffset.current +=
        (targetYOffset - currentYOffset.current) * trackingSpeed;

      // 4. Calculate Final Draw Parameters
      const finalScale = baseScale * currentScale.current;
      const finalWidth = sourceWidth * finalScale;
      const finalHeight = sourceHeight * finalScale;

      // Base position (centered)
      let finalDrawX = (canvas.width - finalWidth) / 2;
      let finalDrawY = (canvas.height - finalHeight) / 2;

      // Calculate pan in pixels
      const panAmountX = currentXOffset.current * finalWidth;
      const panAmountY = currentYOffset.current * finalHeight;

      // Calculate *maximum* allowed pan (the "padding")
      const maxPanX = Math.max(0, (finalWidth - canvas.width) / 2);
      const maxPanY = Math.max(0, (finalHeight - canvas.height) / 2);

      // Clamp the pan amount to stay within the padding
      const clampedPanX = Math.max(-maxPanX, Math.min(maxPanX, panAmountX));
      const clampedPanY = Math.max(-maxPanY, Math.min(maxPanY, panAmountY));

      // Apply the clamped pan
      finalDrawX += clampedPanX;
      finalDrawY += clampedPanY;

      // 5. Draw the image
      ctx.filter = videoFilter;
      ctx.drawImage(
        sourceElement,
        finalDrawX,
        finalDrawY,
        finalWidth,
        finalHeight
      );
      ctx.filter = "none";
      // --- END: NEW ROBUST PAN/ZOOM LOGIC ---

      // Apply interactive filters
      const currentTime = Date.now();
      
      if (activeInteractiveFilter !== 'none') {
        if (
          !tempCanvasRef.current ||
          tempCanvasRef.current.width !== Math.round(finalWidth) ||
          tempCanvasRef.current.height !== Math.round(finalHeight)
        ) {
          tempCanvasRef.current = document.createElement("canvas");
          tempCanvasRef.current.width = Math.round(finalWidth);
          tempCanvasRef.current.height = Math.round(finalHeight);
        }
        const tempCanvas = tempCanvasRef.current;
        const tempCtx = tempCanvas.getContext("2d", {
          willReadFrequently: true,
        });
        if (!tempCtx) return;

        // Draw the source video for processing
        tempCtx.drawImage(
          video,
          0,
          0,
          tempCanvas.width,
          tempCanvas.height
        );
        
        // Apply the selected interactive filter
        switch (activeInteractiveFilter) {
          case 'neon-edge': {
            const frame = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            const edges = detectEdges(tempCtx, frame, neonIntensity, neonColor);
            ctx.globalCompositeOperation = "lighter";
            ctx.putImageData(edges, Math.round(finalDrawX), Math.round(finalDrawY));
            ctx.globalCompositeOperation = "source-over";
            break;
          }
          case 'hologram': {
            const frame = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            const processed = applyHologramEffect(tempCtx, frame, currentTime);
            ctx.globalCompositeOperation = "lighter";
            ctx.putImageData(processed, Math.round(finalDrawX), Math.round(finalDrawY));
            ctx.globalCompositeOperation = "source-over";
            break;
          }
          case 'pixel': {
            const frame = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            const processed = applyPixelEffect(tempCtx, frame, 8);
            ctx.putImageData(processed, Math.round(finalDrawX), Math.round(finalDrawY));
            break;
          }
          case 'comic': {
            const frame = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            const processed = applyComicEffect(tempCtx, frame);
            ctx.putImageData(processed, Math.round(finalDrawX), Math.round(finalDrawY));
            break;
          }
          case 'ascii': {
            // ASCII needs canvas reference
            ctx.save();
            ctx.translate(Math.round(finalDrawX), Math.round(finalDrawY));
            const frame = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            applyASCIIEffect(ctx, frame, tempCanvas);
            ctx.restore();
            break;
          }
          case 'thermal': {
            const frame = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            const processed = applyThermalEffect(tempCtx, frame);
            ctx.putImageData(processed, Math.round(finalDrawX), Math.round(finalDrawY));
            break;
          }
        }
      }

      // Legacy neon edge support (when using old toggle)
      if (isNeonEdgeEnabled && activeInteractiveFilter === 'none') {
        if (
          !tempCanvasRef.current ||
          tempCanvasRef.current.width !== Math.round(finalWidth) ||
          tempCanvasRef.current.height !== Math.round(finalHeight)
        ) {
          tempCanvasRef.current = document.createElement("canvas");
          tempCanvasRef.current.width = Math.round(finalWidth);
          tempCanvasRef.current.height = Math.round(finalHeight);
        }
        const tempCanvas = tempCanvasRef.current;
        const tempCtx = tempCanvas.getContext("2d", {
          willReadFrequently: true,
        });
        if (!tempCtx) return;

        tempCtx.drawImage(
          video,
          0,
          0,
          tempCanvas.width,
          tempCanvas.height
        );
        const frame = tempCtx.getImageData(
          0,
          0,
          tempCanvas.width,
          tempCanvas.height
        );
        const edges = detectEdges(tempCtx, frame, neonIntensity, neonColor);
        ctx.globalCompositeOperation = "lighter";
        ctx.putImageData(edges, Math.round(finalDrawX), Math.round(finalDrawY));
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
  }, [
    stream,
    videoRef.current,
    canvasRef.current,
    isNeonEdgeEnabled,
    neonIntensity,
    neonColor,
    videoFilter,
    processedCanvas,
    facePosition,
    isFaceTrackingEnabled,
    isAutoFramingEnabled,
    zoomSensitivity,
    trackingSpeed,
    activeInteractiveFilter,
  ]);

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full h-full", className)} // Added w-full h-full
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="hidden object-cover w-full h-full"
      />
      {!stream && (
        <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/30 text-muted-foreground/50 pointer-events-none">
          <img
            src="/icon.png"
            alt="Camera Off"
            className="w-1/2 h-1/2 object-contain"
            style={{
              maxWidth: "50px",
              maxHeight: "50px",
            }}
          />
        </div>
      )}
      <canvas ref={canvasRef} className="w-full h-full" />

      {isHovered && portalContainer instanceof HTMLElement
        ? createPortal(
            <PipControlsToolbar
              position={toolbarPosition}
              containerRef={containerRef}
              pipBorder={pipBorder}
              onPipBorderChange={onPipBorderChange}
              pipShadow={pipShadow}
              onPipShadowChange={onPipShadowChange}
              isAutoFramingEnabled={isAutoFramingEnabled}
              onAutoFramingChange={onAutoFramingChange}
              isBeautifyEnabled={isBeautifyEnabled}
              onBeautifyToggle={onBeautifyToggle}
              isLowLightEnabled={isLowLightEnabled}
              onLowLightToggle={onLowLightToggle}
              videoFilter={videoFilter}
              onVideoFilterChange={onVideoFilterChange}
              isNeonEdgeEnabled={isNeonEdgeEnabled}
              onNeonEdgeToggle={onNeonEdgeToggle}
              neonIntensity={neonIntensity}
              onNeonIntensityChange={onNeonIntensityChange}
              neonEdgeColor={neonColor}
              onNeonEdgeColorChange={onNeonEdgeColorChange}
              zoomSensitivity={zoomSensitivity}
              onZoomSensitivityChange={onZoomSensitivityChange}
              trackingSpeed={trackingSpeed}
              onTrackingSpeedChange={onTrackingSpeedChange}
              cameraBackground={cameraBackground}
              onCameraBackgroundChange={onCameraBackgroundChange}
              onCustomBackgroundUpload={onCustomBackgroundUpload}
              cameraAspectRatio={cameraAspectRatio}
              onCameraAspectRatioChange={onCameraAspectRatioChange}
              customAspectRatio={customAspectRatio}
              onCustomAspectRatioChange={onCustomAspectRatioChange}
              isFaceTrackingEnabled={isFaceTrackingEnabled}
              onFaceTrackingToggle={onFaceTrackingToggle}
              activeInteractiveFilter={activeInteractiveFilter}
              onInteractiveFilterChange={onInteractiveFilterChange}
            />,
            portalContainer
          )
        : isHovered && (
            <PipControlsToolbar
              position={toolbarPosition}
              containerRef={containerRef}
              pipBorder={pipBorder}
              onPipBorderChange={onPipBorderChange}
              pipShadow={pipShadow}
              onPipShadowChange={onPipShadowChange}
              isAutoFramingEnabled={isAutoFramingEnabled}
              onAutoFramingChange={onAutoFramingChange}
              isBeautifyEnabled={isBeautifyEnabled}
              onBeautifyToggle={onBeautifyToggle}
              isLowLightEnabled={isLowLightEnabled}
              onLowLightToggle={onLowLightToggle}
              videoFilter={videoFilter}
              onVideoFilterChange={onVideoFilterChange}
              isNeonEdgeEnabled={isNeonEdgeEnabled}
              onNeonEdgeToggle={onNeonEdgeToggle}
              neonIntensity={neonIntensity}
              onNeonIntensityChange={onNeonIntensityChange}
              neonEdgeColor={neonColor}
              onNeonEdgeColorChange={onNeonEdgeColorChange}
              zoomSensitivity={zoomSensitivity}
              onZoomSensitivityChange={onZoomSensitivityChange}
              trackingSpeed={trackingSpeed}
              onTrackingSpeedChange={onTrackingSpeedChange}
              cameraBackground={cameraBackground}
              onCameraBackgroundChange={onCameraBackgroundChange}
              onCustomBackgroundUpload={onCustomBackgroundUpload}
              cameraAspectRatio={cameraAspectRatio}
              onCameraAspectRatioChange={onCameraAspectRatioChange}
              customAspectRatio={customAspectRatio}
              onCustomAspectRatioChange={onCustomAspectRatioChange}
              isFaceTrackingEnabled={isFaceTrackingEnabled}
              onFaceTrackingToggle={onFaceTrackingToggle}
              activeInteractiveFilter={activeInteractiveFilter}
              onInteractiveFilterChange={onInteractiveFilterChange}
            />
          )}
    </div>
  );
};
