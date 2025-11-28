// src/lib/animeStyles.ts
import { ColorUtils, ImageProcessor } from "./utils/imageProcessing";
import animeStylesData from "@/data/animeStyles.json";

// ===== TYPES AND INTERFACES =====
export interface TriToneConfig {
  shadowColor: string;
  midColor: string;
  highlightColor: string;
  skinColor: string;
  lowThreshold: number;
  highThreshold: number;
  detailSensitivity?: number;
  edgeThreshold?: number;
  skinDetectionStrength?: number;
}

export interface ProcessedImageData {
  imageData: ImageData;
  processingTime: number;
}

// ===== PRESET STYLES =====
export const AnimeStyles: Record<string, TriToneConfig> =
  animeStylesData as unknown as Record<string, TriToneConfig>;

// ===== MAIN PROCESSING FUNCTION =====
export function applyTriTone(
  ctx: CanvasRenderingContext2D,
  imageData: ImageData,
  config: TriToneConfig
): ProcessedImageData {
  const startTime = performance.now();
  const { width, height, data } = imageData;
  const output = ctx.createImageData(width, height);
  const outputData = output.data;

  const {
    shadowColor,
    midColor,
    highlightColor,
    skinColor,
    lowThreshold,
    highThreshold,
    detailSensitivity = 15,
    edgeThreshold = 50,
    skinDetectionStrength = 1.0,
  } = config;

  const shadowRGB = ColorUtils.hexToRgb(shadowColor);
  const midRGB = ColorUtils.hexToRgb(midColor);
  const highlightRGB = ColorUtils.hexToRgb(highlightColor);
  const skinRGB = ColorUtils.hexToRgb(skinColor);

  const rawLuma = ImageProcessor.createLuminanceMap(data, width, height);
  const smoothLuma = ImageProcessor.applyBoxBlur(rawLuma, width, height, 2);
  const edgeMap = ImageProcessor.calculateEdgeMagnitude(
    smoothLuma,
    width,
    height
  );

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const pixelIndex = y * width + x;
      const dataIndex = pixelIndex * 4;

      const smoothVal = smoothLuma[pixelIndex];
      const rawVal = rawLuma[pixelIndex];
      const edgeMag = edgeMap[pixelIndex];

      // 1. Detect Skin FIRST
      const r = data[dataIndex];
      const g = data[dataIndex + 1];
      const b = data[dataIndex + 2];
      const isSkin = ColorUtils.isSkinTone(r, g, b, skinDetectionStrength);

      const adaptiveEdgeThreshold = isSkin
        ? edgeThreshold * 2.0
        : edgeThreshold;
      const adaptiveDetailSens = isSkin
        ? detailSensitivity * 3.0
        : detailSensitivity;

      const localContrast = Math.abs(smoothVal - rawVal);
      const isDetail = localContrast > adaptiveDetailSens;

      let targetRGB: [number, number, number];

      if (edgeMag > adaptiveEdgeThreshold) {
        targetRGB = shadowRGB;
      } else if (isDetail && smoothVal < 230) {
        targetRGB = shadowRGB;
      } else {
        if (smoothVal < lowThreshold) {
          targetRGB = shadowRGB;
        } else if (smoothVal > highThreshold) {
          targetRGB = highlightRGB;
        } else {
          targetRGB = isSkin ? skinRGB : midRGB;
        }
      }

      outputData[dataIndex] = targetRGB[0];
      outputData[dataIndex + 1] = targetRGB[1];
      outputData[dataIndex + 2] = targetRGB[2];
      outputData[dataIndex + 3] = 255;
    }
  }

  const processingTime = performance.now() - startTime;

  return {
    imageData: output,
    processingTime,
  };
}

export function applyDominatorStyle(
  ctx: CanvasRenderingContext2D,
  imageData: ImageData
): ProcessedImageData {
  return applyTriTone(ctx, imageData, AnimeStyles.dominator);
}

export function applyInspectorStyle(
  ctx: CanvasRenderingContext2D,
  imageData: ImageData
): ProcessedImageData {
  return applyTriTone(ctx, imageData, AnimeStyles.inspector);
}

export function applyStyle(
  style: string,
  ctx: CanvasRenderingContext2D,
  imageData: ImageData
): ProcessedImageData {
  return applyTriTone(ctx, imageData, AnimeStyles[style]);
}

export class PerformanceMonitor {
  private static measurements: Map<string, number[]> = new Map();

  static record(operation: string, duration: number) {
    if (!this.measurements.has(operation)) {
      this.measurements.set(operation, []);
    }
    this.measurements.get(operation)!.push(duration);
  }

  static getStats(operation: string) {
    const measurements = this.measurements.get(operation);
    if (!measurements || measurements.length === 0) return null;

    const sorted = [...measurements].sort();
    const avg = measurements.reduce((a, b) => a + b, 0) / measurements.length;

    return {
      count: measurements.length,
      average: avg,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p95: sorted[Math.floor(measurements.length * 0.95)],
    };
  }

  static clear() {
    this.measurements.clear();
  }
}
