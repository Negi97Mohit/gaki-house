// src/lib/filterRenderer.ts
import {
  detectEdges,
  applyHologramEffect,
  applyPixelEffect,
  applyComicEffect,
  applyASCIIEffect,
  applyThermalEffect,
  applyMirrorEffect,
  applyKaleidoscopeEffect,
  applyOilPaintEffect,
  applySketchEffect,
  applyPrismEffect,
  applyVHSEffect,
  applyInfraredEffect,
  applyXRayEffect,
  applyCyberpunkEffect,
} from "@/lib/effects";
import { applyStyle, AnimeStyles } from "@/lib/animeStyles";

export interface FilterRenderOptions {
  ctx: CanvasRenderingContext2D;
  tempCanvas: HTMLCanvasElement;
  video: HTMLVideoElement;
  finalDrawX: number;
  finalDrawY: number;
  finalWidth: number;
  finalHeight: number;
  activeInteractiveFilter: string;
  currentTime: number;
  filterIntensity?: number;
  filterColor?: string;
  filterTarget?: "both" | "background" | "person";
  neonIntensity?: number;
  neonColor?: string;
  isNeonEdgeEnabled?: boolean;
  processedCanvas?: HTMLCanvasElement | null;
}

export function renderInteractiveFilters({
  ctx,
  tempCanvas,
  video,
  finalDrawX,
  finalDrawY,
  finalWidth,
  finalHeight,
  activeInteractiveFilter,
  currentTime,
  filterIntensity = 1.0,
  filterColor = "#00ffff",
  filterTarget = "both",
  neonIntensity = 20,
  neonColor = "#00ffff",
  isNeonEdgeEnabled = false,
  processedCanvas,
}: FilterRenderOptions) {
  // 1. Prepare Temp Context
  const tempCtx = tempCanvas.getContext("2d", { willReadFrequently: true });
  if (!tempCtx) return;

  // Resize temp canvas if needed
  if (
    tempCanvas.width !== Math.round(finalWidth) ||
    tempCanvas.height !== Math.round(finalHeight)
  ) {
    tempCanvas.width = Math.round(finalWidth);
    tempCanvas.height = Math.round(finalHeight);
  }

  // Draw current video frame to temp canvas
  tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
  const frame = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
  let processed: ImageData | null = null;

  // 2. Apply Filters
  if (activeInteractiveFilter in AnimeStyles) {
    // Anime Styles
    processed = applyStyle(
      activeInteractiveFilter as keyof typeof AnimeStyles,
      tempCtx,
      frame
    ).imageData;
  } else {
    // Standard Filters
    switch (activeInteractiveFilter) {
      case "neon-edge":
        const edges = detectEdges(
          tempCtx,
          frame,
          neonIntensity,
          neonColor || "#00ffff"
        );
        ctx.globalCompositeOperation = "lighter";
        ctx.putImageData(edges, Math.round(finalDrawX), Math.round(finalDrawY));
        ctx.globalCompositeOperation = "source-over";
        return; // Skip masking for this overlay type
      case "hologram":
      case "hologram-fx":
        processed = applyHologramEffect(tempCtx, frame, currentTime);
        break;
      case "pixel":
        processed = applyPixelEffect(tempCtx, frame, 8);
        break;
      case "comic":
        processed = applyComicEffect(tempCtx, frame);
        break;
      case "ascii":
        ctx.save();
        ctx.translate(Math.round(finalDrawX), Math.round(finalDrawY));
        applyASCIIEffect(ctx, frame, tempCanvas);
        ctx.restore();
        return; // Skip masking
      case "thermal":
        processed = applyThermalEffect(tempCtx, frame);
        break;
      case "mirror":
        processed = applyMirrorEffect(tempCtx, frame, filterIntensity);
        break;
      case "kaleidoscope":
        processed = applyKaleidoscopeEffect(tempCtx, frame, filterIntensity);
        break;
      case "oil-paint":
        processed = applyOilPaintEffect(tempCtx, frame, filterIntensity);
        break;
      case "sketch":
        processed = applySketchEffect(tempCtx, frame, filterIntensity);
        break;
      case "prism":
        processed = applyPrismEffect(
          tempCtx,
          frame,
          filterIntensity,
          filterColor
        );
        break;
      case "vhs":
        processed = applyVHSEffect(tempCtx, frame, filterIntensity);
        break;
      case "infrared":
      case "infrared-fx":
        processed = applyInfraredEffect(tempCtx, frame, filterColor);
        break;
      case "xray":
        processed = applyXRayEffect(tempCtx, frame, filterIntensity);
        break;
      case "cyberpunk":
        processed = applyCyberpunkEffect(
          tempCtx,
          frame,
          filterIntensity,
          filterColor
        );
        break;
    }
  }

  // 3. Legacy Neon Edge Support (if no interactive filter is active)
  if (activeInteractiveFilter === "none" && isNeonEdgeEnabled) {
    const edges = detectEdges(
      tempCtx,
      frame,
      neonIntensity,
      neonColor || "#00ffff"
    );
    ctx.globalCompositeOperation = "lighter";
    ctx.putImageData(edges, Math.round(finalDrawX), Math.round(finalDrawY));
    ctx.globalCompositeOperation = "source-over";
    return;
  }

  // 4. Apply Processed Data with Optional Masking
  if (processed) {
    if (filterTarget !== "both" && processedCanvas) {
      // Get segmentation mask
      const processCtx = processedCanvas.getContext("2d", {
        willReadFrequently: true,
      });
      if (processCtx) {
        // We need to fetch the mask at the same resolution as the temp canvas
        // Note: This assumes processedCanvas has the full frame. We might need to draw it to temp if sizes differ.
        const maskData = processCtx.getImageData(
          0,
          0,
          tempCanvas.width,
          tempCanvas.height
        ).data;
        const output = ctx.createImageData(frame.width, frame.height);
        const frameData = frame.data;
        const processedData = processed.data;

        for (let i = 0; i < frameData.length; i += 4) {
          const isPerson = maskData[i + 3] > 128;
          const useProcessed = filterTarget === "person" ? isPerson : !isPerson;

          if (useProcessed) {
            output.data[i] = processedData[i];
            output.data[i + 1] = processedData[i + 1];
            output.data[i + 2] = processedData[i + 2];
            output.data[i + 3] = processedData[i + 3];
          } else {
            output.data[i] = frameData[i];
            output.data[i + 1] = frameData[i + 1];
            output.data[i + 2] = frameData[i + 2];
            output.data[i + 3] = frameData[i + 3];
          }
        }
        ctx.putImageData(
          output,
          Math.round(finalDrawX),
          Math.round(finalDrawY)
        );
      } else {
        // Fallback if mask unavailable
        ctx.putImageData(
          processed,
          Math.round(finalDrawX),
          Math.round(finalDrawY)
        );
      }
    } else {
      // Apply to whole frame
      ctx.putImageData(
        processed,
        Math.round(finalDrawX),
        Math.round(finalDrawY)
      );
    }
  }
}
