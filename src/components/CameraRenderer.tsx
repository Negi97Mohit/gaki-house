// src/components/CameraRenderer.tsx

import React, { useEffect, useRef, useState } from 'react';
import { SelfieSegmentation } from '@mediapipe/selfie_segmentation';
import { FaceDetection } from '@mediapipe/face_detection';

// --- HELPER FUNCTIONS (Unchanged) ---
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
    s /= 100; l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; } else if (h < 120) { r = x; g = c; }
    else if (h < 180) { g = c; b = x; } else if (h < 240) { g = x; b = c; }
    else if (h < 300) { r = x; b = c; } else { r = c; b = x; }
    return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

function detectEdges(ctx: CanvasRenderingContext2D, imageData: ImageData, intensity: number, color: string): ImageData {
    const data = imageData.data;
    const w = imageData.width;
    const h = imageData.height;
    const output = ctx.createImageData(w, h);
    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
    const colors: { [key: string]: [number, number, number] } = {
        cyan: [0, 255, 255], magenta: [255, 0, 255], green: [0, 255, 0],
        blue: [0, 100, 255], red: [255, 0, 0], yellow: [255, 255, 0]
    };

    for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
            let gx = 0, gy = 0;
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
                let rgb = color === 'rainbow' ? hslToRgb((x / w + y / h) * 360, 100, 50) : (colors[color] || colors['cyan']);
                output.data[outIdx] = rgb[0];
                output.data[outIdx + 1] = rgb[1];
                output.data[outIdx + 2] = rgb[2];
                output.data[outIdx + 3] = Math.min(magnitude * 1.5, 255); // Boost alpha
            }
        }
    }
    return output;
}

// --- PROPS INTERFACE (Unchanged) ---
interface CameraRendererProps {
    stream: MediaStream | null;
    backgroundEffect: 'none' | 'blur' | 'image';
    backgroundImageUrl?: string | null;
    isAutoFramingEnabled: boolean;
    zoomSensitivity: number;
    trackingSpeed: number;
    className?: string;
    style?: React.CSSProperties;
    isNeonEdgeEnabled: boolean;
    neonIntensity: number;
    neonColor: string;
}

// ... (drawImageCover function remains unchanged) ...

export const CameraRenderer: React.FC<CameraRendererProps> = ({
  stream, backgroundEffect, backgroundImageUrl, isAutoFramingEnabled,
  zoomSensitivity, trackingSpeed, className, style,
  isNeonEdgeEnabled, neonIntensity, neonColor
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  
  // --- NEW: A ref for a temporary canvas to solve the pixel reading issue ---
  const tempCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // --- Main Render Loop ---
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    // Assign the stream to the hidden video element
    if (stream) {
      video.srcObject = stream;
      video.play().catch(console.error);
    }

const renderFrame = () => {
      if (!video.srcObject || video.paused || video.ended || video.videoWidth === 0) {
        animationFrameRef.current = requestAnimationFrame(renderFrame);
        return;
      }
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }

      // --- START OF FIX ---
      // Clear the canvas before drawing each new frame
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Calculate aspect ratios to replicate CSS 'object-cover'
      const canvasRatio = canvas.width / canvas.height;
      const videoRatio = video.videoWidth / video.videoHeight;
      
      let finalWidth, finalHeight, offsetX, offsetY;

      if (videoRatio > canvasRatio) {
        // Video is wider than canvas, so height determines the scale
        finalHeight = canvas.height;
        finalWidth = finalHeight * videoRatio;
        offsetX = (canvas.width - finalWidth) / 2; // Center horizontally
        offsetY = 0;
      } else {
        // Video is taller than or same aspect as canvas, so width determines the scale
        finalWidth = canvas.width;
        finalHeight = finalWidth / videoRatio;
        offsetX = 0;
        offsetY = (canvas.height - finalHeight) / 2; // Center vertically
      }

      // 1. Draw the raw video to the main canvas with the correct aspect ratio.
      ctx.drawImage(video, offsetX, offsetY, finalWidth, finalHeight);
      // --- END OF FIX ---

      // 2. Apply the Neon Filter IF it's enabled (This part remains the same)
      if (isNeonEdgeEnabled) {
        if (!tempCanvasRef.current || tempCanvasRef.current.width !== canvas.width) {
            tempCanvasRef.current = document.createElement('canvas');
            tempCanvasRef.current.width = canvas.width;
            tempCanvasRef.current.height = canvas.height;
        }
        const tempCanvas = tempCanvasRef.current;
        const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
        if (!tempCtx) return;

        // Draw the correctly-sized video to the TEMP canvas for processing
        tempCtx.drawImage(video, offsetX, offsetY, finalWidth, finalHeight);
        
        const frame = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const edges = detectEdges(tempCtx, frame, neonIntensity, neonColor);
        
        ctx.globalCompositeOperation = 'lighter';
        ctx.putImageData(edges, 0, 0);
        ctx.globalCompositeOperation = 'source-over';
      }
      
      animationFrameRef.current = requestAnimationFrame(renderFrame);
    };
    
    renderFrame();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [stream, isNeonEdgeEnabled, neonIntensity, neonColor]); // Effect dependencies

  return (
    <div className={className} style={style}>
      <video ref={videoRef} autoPlay muted playsInline className="hidden" />
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};