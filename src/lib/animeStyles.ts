// src/lib/animeStyles.ts

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

// ===== COLOR UTILITIES =====
class ColorUtils {
  private static hexCache = new Map<string, [number, number, number]>();

  static hexToRgb(hex: string): [number, number, number] {
    if (this.hexCache.has(hex)) {
      return this.hexCache.get(hex)!;
    }

    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const fullHex = hex.replace(
      shorthandRegex,
      (_, r, g, b) => r + r + g + g + b + b
    );

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
    const rgb = result
      ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16),
        ]
      : [0, 0, 0];

    this.hexCache.set(hex, rgb as [number, number, number]);
    return rgb as [number, number, number];
  }

  static calculateLuminance(r: number, g: number, b: number): number {
    return 0.299 * r + 0.587 * g + 0.114 * b;
  }

  static isSkinTone(
    r: number,
    g: number,
    b: number,
    strength: number = 1.0
  ): boolean {
    // Enhanced skin detection
    // increased green requirement slightly to avoid picking up reddish walls/clothes as skin
    const redDominance = r > g && r > b;
    const redGreenDiff = r - g > 15 * strength;
    const minRed = r > 40;

    // Stricter balance to prevent dark noise being seen as skin
    const colorBalance = r > 60 && g > 40 && b > 20;
    const saturation = Math.max(r, g, b) - Math.min(r, g, b) > 15;

    return redDominance && redGreenDiff && minRed && colorBalance && saturation;
  }
}

// ===== IMAGE PROCESSING UTILITIES =====
class ImageProcessor {
  static createLuminanceMap(
    data: Uint8ClampedArray,
    width: number,
    height: number
  ): Uint8Array {
    const luminance = new Uint8Array(width * height);
    for (let i = 0; i < width * height; i++) {
      const r = data[i * 4];
      const g = data[i * 4 + 1];
      const b = data[i * 4 + 2];
      luminance[i] = ColorUtils.calculateLuminance(r, g, b);
    }
    return luminance;
  }

  static applyBoxBlur(
    input: Uint8Array,
    width: number,
    height: number,
    passes: number = 1
  ): Uint8Array {
    let output = new Uint8Array(input);
    // Increased blur weight slightly to flatten skin areas better
    for (let pass = 0; pass < passes; pass++) {
      const temp = new Uint8Array(output);
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = y * width + x;
          const sum =
            temp[idx] * 4 +
            temp[idx - 1] +
            temp[idx + 1] +
            temp[idx - width] +
            temp[idx + width] +
            temp[idx - width - 1] +
            temp[idx - width + 1] +
            temp[idx + width - 1] +
            temp[idx + width + 1];
          output[idx] = Math.round(sum / 12);
        }
      }
    }
    return output;
  }

  static calculateEdgeMagnitude(
    luminance: Uint8Array,
    width: number,
    height: number
  ): Uint8Array {
    const edgeMap = new Uint8Array(width * height);
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        const gx =
          -1 * luminance[idx - width - 1] +
          1 * luminance[idx - width + 1] +
          -2 * luminance[idx - 1] +
          2 * luminance[idx + 1] +
          -1 * luminance[idx + width - 1] +
          1 * luminance[idx + width + 1];
        const gy =
          -1 * luminance[idx - width - 1] +
          -2 * luminance[idx - width] +
          -1 * luminance[idx - width + 1] +
          1 * luminance[idx + width - 1] +
          2 * luminance[idx + width] +
          1 * luminance[idx + width + 1];
        edgeMap[idx] = Math.min(255, Math.abs(gx) + Math.abs(gy));
      }
    }
    return edgeMap;
  }
}

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
  // Increased blur pass to 2 to reduce noise before edge detection
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

      // 2. Adaptive Thresholding
      // If it is skin, we want to suppress "marks" (details) and weak edges.
      // We multiply the thresholds if skin is detected.

      // Skin needs edges to be 2x stronger to register as a line
      const adaptiveEdgeThreshold = isSkin
        ? edgeThreshold * 2.0
        : edgeThreshold;

      // Skin needs details to be 3x stronger (pores/acne ignored, deep wrinkles kept)
      const adaptiveDetailSens = isSkin
        ? detailSensitivity * 3.0
        : detailSensitivity;

      const localContrast = Math.abs(smoothVal - rawVal);
      const isDetail = localContrast > adaptiveDetailSens;

      let targetRGB: [number, number, number];

      // 3. Decision Pipeline
      if (edgeMag > adaptiveEdgeThreshold) {
        // Strong structural edges -> Shadow
        targetRGB = shadowRGB;
      } else if (isDetail && smoothVal < 230) {
        // Textured details
        // Because we increased adaptiveDetailSens for skin,
        // this block will essentially be skipped for the face area
        // unless the mark is very dark/deep.
        targetRGB = shadowRGB;
      } else {
        // Zoning
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

// ===== PRESET STYLES =====
export const AnimeStyles = {
  dominator: {
    shadowColor: "#000000",
    midColor: "#00ced1",
    highlightColor: "#e0ffff",
    skinColor: "#b0e0e6",
    lowThreshold: 70,
    highThreshold: 210,
    detailSensitivity: 12,
    edgeThreshold: 50,
    skinDetectionStrength: 1.0,
  } as TriToneConfig,

  inspector: {
    shadowColor: "#1a0505",
    midColor: "#ff1493",
    highlightColor: "#fff0f5",
    skinColor: "#ffc0cb",
    lowThreshold: 70,
    highThreshold: 210,
    detailSensitivity: 12,
    edgeThreshold: 45,
    skinDetectionStrength: 1.2,
  } as TriToneConfig,

  manga: {
    shadowColor: "#000000",
    midColor: "#808080",
    highlightColor: "#FFFFFF",
    skinColor: "#FFFFFF",
    lowThreshold: 80,
    highThreshold: 200,
    detailSensitivity: 10,
    edgeThreshold: 30,
    skinDetectionStrength: 0.0,
  } as TriToneConfig,

  phantom: {
    shadowColor: "#1a0000",
    midColor: "#ff0000",
    highlightColor: "#ffffff",
    skinColor: "#ffcccc",
    lowThreshold: 60,
    highThreshold: 210,
    detailSensitivity: 15,
    edgeThreshold: 40,
    skinDetectionStrength: 1.0,
  } as TriToneConfig,

  matrix: {
    shadowColor: "#001a00",
    midColor: "#00ff00",
    highlightColor: "#ccffcc",
    skinColor: "#88ff88",
    lowThreshold: 50,
    highThreshold: 180,
    detailSensitivity: 12,
    edgeThreshold: 45,
    skinDetectionStrength: 0.5,
  } as TriToneConfig,

  sepia: {
    shadowColor: "#2e2115",
    midColor: "#a68a6d",
    highlightColor: "#f0e6d2",
    skinColor: "#dcbfa6",
    lowThreshold: 70,
    highThreshold: 190,
    detailSensitivity: 15,
    edgeThreshold: 50,
    skinDetectionStrength: 1.0,
  } as TriToneConfig,

  ocean: {
    shadowColor: "#000033",
    midColor: "#0066cc",
    highlightColor: "#99ccff",
    skinColor: "#b3d9ff",
    lowThreshold: 60,
    highThreshold: 200,
    detailSensitivity: 12,
    edgeThreshold: 40,
    skinDetectionStrength: 1.0,
  } as TriToneConfig,

  sunset: {
    shadowColor: "#2d1b4e",
    midColor: "#d65db1",
    highlightColor: "#ffbe0b",
    skinColor: "#ffcc80",
    lowThreshold: 70,
    highThreshold: 210,
    detailSensitivity: 15,
    edgeThreshold: 50,
    skinDetectionStrength: 1.2,
  } as TriToneConfig,

  gothic: {
    shadowColor: "#0f0f0f",
    midColor: "#8a0303",
    highlightColor: "#e0e0e0",
    skinColor: "#f0f0f0",
    lowThreshold: 60,
    highThreshold: 180,
    detailSensitivity: 10,
    edgeThreshold: 35,
    skinDetectionStrength: 0.8,
  } as TriToneConfig,

  mint: {
    shadowColor: "#1c3d35",
    midColor: "#4fffa3",
    highlightColor: "#e0fff4",
    skinColor: "#ffe0e6",
    lowThreshold: 70,
    highThreshold: 200,
    detailSensitivity: 15,
    edgeThreshold: 45,
    skinDetectionStrength: 1.1,
  } as TriToneConfig,

  golden: {
    shadowColor: "#2a2200",
    midColor: "#ffd700",
    highlightColor: "#fffbcc",
    skinColor: "#ffebd7",
    lowThreshold: 70,
    highThreshold: 210,
    detailSensitivity: 12,
    edgeThreshold: 50,
    skinDetectionStrength: 1.0,
  } as TriToneConfig,

  lavender: {
    shadowColor: "#1a0b2e",
    midColor: "#9d4edd",
    highlightColor: "#e0b0ff",
    skinColor: "#f3e5f5",
    lowThreshold: 70,
    highThreshold: 200,
    detailSensitivity: 12,
    edgeThreshold: 45,
    skinDetectionStrength: 1.0,
  } as TriToneConfig,

  classic: {
    shadowColor: "#2c1b47",
    midColor: "#e84a5f",
    highlightColor: "#ffdbc5",
    skinColor: "#ffb6b6",
    lowThreshold: 80,
    highThreshold: 200,
    detailSensitivity: 10,
    edgeThreshold: 40,
    skinDetectionStrength: 0.8,
  } as TriToneConfig,

  cyberpunk: {
    shadowColor: "#0a0a2a",
    midColor: "#00fff0",
    highlightColor: "#ff00ff",
    skinColor: "#ff6b6b",
    lowThreshold: 60,
    highThreshold: 220,
    detailSensitivity: 15,
    edgeThreshold: 55,
    skinDetectionStrength: 1.1,
  } as TriToneConfig,

  ghibliSoft: {
    shadowColor: "#3b4a3f",
    midColor: "#9fc9a3",
    highlightColor: "#f6f2d4",
    skinColor: "#ffd7b5",
    lowThreshold: 75,
    highThreshold: 205,
    detailSensitivity: 8,
    edgeThreshold: 35,
    skinDetectionStrength: 1.2,
  } as TriToneConfig,

  ghibliWarm: {
    shadowColor: "#5c2d1f",
    midColor: "#e39e6d",
    highlightColor: "#ffe7c4",
    skinColor: "#ffd3b6",
    lowThreshold: 80,
    highThreshold: 210,
    detailSensitivity: 10,
    edgeThreshold: 40,
    skinDetectionStrength: 1.1,
  } as TriToneConfig,

  arcane: {
    shadowColor: "#1e1a24",
    midColor: "#654d7a",
    highlightColor: "#d7c6ff",
    skinColor: "#e8c1b5",
    lowThreshold: 65,
    highThreshold: 200,
    detailSensitivity: 20,
    edgeThreshold: 60,
    skinDetectionStrength: 1.0,
  } as TriToneConfig,

  watercolor: {
    shadowColor: "#4a6572",
    midColor: "#aed6dc",
    highlightColor: "#f6f5f5",
    skinColor: "#ffe9d6",
    lowThreshold: 70,
    highThreshold: 190,
    detailSensitivity: 8,
    edgeThreshold: 30,
    skinDetectionStrength: 1.0,
  } as TriToneConfig,

  oilPaint: {
    shadowColor: "#2d1f1f",
    midColor: "#b37a5e",
    highlightColor: "#f3dfc1",
    skinColor: "#ffcfb6",
    lowThreshold: 75,
    highThreshold: 200,
    detailSensitivity: 22,
    edgeThreshold: 65,
    skinDetectionStrength: 1.4,
  } as TriToneConfig,

  samuraiInk: {
    shadowColor: "#000000",
    midColor: "#5b5b5b",
    highlightColor: "#ffffff",
    skinColor: "#f2f2f2",
    lowThreshold: 85,
    highThreshold: 210,
    detailSensitivity: 5,
    edgeThreshold: 25,
    skinDetectionStrength: 0.0,
  } as TriToneConfig,

  ukiyoe: {
    shadowColor: "#0d1b2a",
    midColor: "#1e6091",
    highlightColor: "#eff7ff",
    skinColor: "#ffdbb3",
    lowThreshold: 75,
    highThreshold: 190,
    detailSensitivity: 12,
    edgeThreshold: 40,
    skinDetectionStrength: 1.2,
  } as TriToneConfig,

  comicBold: {
    shadowColor: "#000000",
    midColor: "#2d2d2d",
    highlightColor: "#ffffff",
    skinColor: "#ffe2cc",
    lowThreshold: 90,
    highThreshold: 210,
    detailSensitivity: 25,
    edgeThreshold: 20,
    skinDetectionStrength: 1.0,
  } as TriToneConfig,

  pixarSoft: {
    shadowColor: "#2e4057",
    midColor: "#7db9e8",
    highlightColor: "#e4f1fe",
    skinColor: "#ffd7c0",
    lowThreshold: 60,
    highThreshold: 210,
    detailSensitivity: 14,
    edgeThreshold: 50,
    skinDetectionStrength: 1.25,
  } as TriToneConfig,

  neonHorror: {
    shadowColor: "#0f0010",
    midColor: "#ff005c",
    highlightColor: "#fffae3",
    skinColor: "#ffd2d2",
    lowThreshold: 55,
    highThreshold: 190,
    detailSensitivity: 18,
    edgeThreshold: 55,
    skinDetectionStrength: 0.9,
  } as TriToneConfig,

  infrared: {
    shadowColor: "#2b0000",
    midColor: "#ff4500",
    highlightColor: "#ffe6d5",
    skinColor: "#ffc6b5",
    lowThreshold: 60,
    highThreshold: 205,
    detailSensitivity: 15,
    edgeThreshold: 45,
    skinDetectionStrength: 0.8,
  } as TriToneConfig,

  frostBlue: {
    shadowColor: "#001f3f",
    midColor: "#4da6ff",
    highlightColor: "#e6f7ff",
    skinColor: "#ffecec",
    lowThreshold: 70,
    highThreshold: 210,
    detailSensitivity: 12,
    edgeThreshold: 35,
    skinDetectionStrength: 1.1,
  } as TriToneConfig,

  emerald: {
    shadowColor: "#002b26",
    midColor: "#00a884",
    highlightColor: "#c8fff0",
    skinColor: "#ffe4d0",
    lowThreshold: 65,
    highThreshold: 195,
    detailSensitivity: 14,
    edgeThreshold: 40,
    skinDetectionStrength: 1.0,
  } as TriToneConfig,

  demonSlayer: {
    shadowColor: "#1a0b0b",
    midColor: "#50b37a",
    highlightColor: "#f6f6f2",
    skinColor: "#ffd5c3",
    lowThreshold: 75,
    highThreshold: 205,
    detailSensitivity: 18,
    edgeThreshold: 45,
    skinDetectionStrength: 1.5,
  } as TriToneConfig,

  bleach: {
    shadowColor: "#0a0a0a",
    midColor: "#cccccc",
    highlightColor: "#ffffff",
    skinColor: "#ffe7d5",
    lowThreshold: 85,
    highThreshold: 210,
    detailSensitivity: 5,
    edgeThreshold: 30,
    skinDetectionStrength: 0.5,
  } as TriToneConfig,

  mechaBlue: {
    shadowColor: "#000019",
    midColor: "#0033cc",
    highlightColor: "#d5e5ff",
    skinColor: "#ffd6cc",
    lowThreshold: 70,
    highThreshold: 210,
    detailSensitivity: 15,
    edgeThreshold: 55,
    skinDetectionStrength: 1.0,
  } as TriToneConfig,

  toxicGreen: {
    shadowColor: "#003300",
    midColor: "#39ff14",
    highlightColor: "#e2ffdc",
    skinColor: "#ffd8cc",
    lowThreshold: 55,
    highThreshold: 185,
    detailSensitivity: 20,
    edgeThreshold: 45,
    skinDetectionStrength: 0.8,
  } as TriToneConfig,

  roseGold: {
    shadowColor: "#4b2e2e",
    midColor: "#e9a6a6",
    highlightColor: "#ffe8e8",
    skinColor: "#ffd3c2",
    lowThreshold: 75,
    highThreshold: 210,
    detailSensitivity: 12,
    edgeThreshold: 40,
    skinDetectionStrength: 1.2,
  } as TriToneConfig,

  dreamscape: {
    shadowColor: "#2d1f47",
    midColor: "#9b5de5",
    highlightColor: "#f8edff",
    skinColor: "#ffd6e7",
    lowThreshold: 70,
    highThreshold: 205,
    detailSensitivity: 10,
    edgeThreshold: 35,
    skinDetectionStrength: 1.0,
  } as TriToneConfig,

  hologram: {
    shadowColor: "#1f003f",
    midColor: "#5de5ff",
    highlightColor: "#e6fcff",
    skinColor: "#ffd6e0",
    lowThreshold: 65,
    highThreshold: 200,
    detailSensitivity: 14,
    edgeThreshold: 45,
    skinDetectionStrength: 1.1,
  } as TriToneConfig,

  bloodMoon: {
    shadowColor: "#1a0000",
    midColor: "#a30000",
    highlightColor: "#ffcccc",
    skinColor: "#ffdddd",
    lowThreshold: 70,
    highThreshold: 205,
    detailSensitivity: 15,
    edgeThreshold: 50,
    skinDetectionStrength: 0.8,
  } as TriToneConfig,

  noirBlue: {
    shadowColor: "#000014",
    midColor: "#4d4d7a",
    highlightColor: "#dfe4ff",
    skinColor: "#ffe2cc",
    lowThreshold: 80,
    highThreshold: 210,
    detailSensitivity: 10,
    edgeThreshold: 40,
    skinDetectionStrength: 1.0,
  } as TriToneConfig,

  pastelCute: {
    shadowColor: "#6b4f7f",
    midColor: "#ffb3d9",
    highlightColor: "#fff0f8",
    skinColor: "#ffd6e1",
    lowThreshold: 80,
    highThreshold: 205,
    detailSensitivity: 10,
    edgeThreshold: 35,
    skinDetectionStrength: 1.3,
  } as TriToneConfig,

  glitchPurple: {
    shadowColor: "#1a0020",
    midColor: "#aa00ff",
    highlightColor: "#f2d6ff",
    skinColor: "#ffcce6",
    lowThreshold: 60,
    highThreshold: 195,
    detailSensitivity: 20,
    edgeThreshold: 55,
    skinDetectionStrength: 0.9,
  } as TriToneConfig,

  fireDragon: {
    shadowColor: "#260000",
    midColor: "#ff4500",
    highlightColor: "#ffd1a1",
    skinColor: "#ffccb8",
    lowThreshold: 75,
    highThreshold: 210,
    detailSensitivity: 18,
    edgeThreshold: 50,
    skinDetectionStrength: 1.1,
  } as TriToneConfig,

  victorianDaguerreotype: {
    shadowColor: "#1a1410",
    midColor: "#8b7355",
    highlightColor: "#f5e6d3",
    skinColor: "#e8d4c0",
    lowThreshold: 65,
    highThreshold: 210,
    detailSensitivity: 8,
    edgeThreshold: 32,
    skinDetectionStrength: 2.0,
  } as TriToneConfig,

  romanFreco: {
    shadowColor: "#3d2817",
    midColor: "#c85a54",
    highlightColor: "#f4e4c1",
    skinColor: "#d4a574",
    lowThreshold: 65,
    highThreshold: 215,
    detailSensitivity: 10,
    edgeThreshold: 30,
    skinDetectionStrength: 2.2,
  } as TriToneConfig,

  spartanBronze: {
    shadowColor: "#1f1408",
    midColor: "#b87333",
    highlightColor: "#ffd7a8",
    skinColor: "#cd9575",
    lowThreshold: 65,
    highThreshold: 215,
    detailSensitivity: 8,
    edgeThreshold: 35,
    skinDetectionStrength: 2.0,
  } as TriToneConfig,

  egyptianPapyrus: {
    shadowColor: "#2b1f0a",
    midColor: "#d4a76a",
    highlightColor: "#faf4e8",
    skinColor: "#c19a6b",
    lowThreshold: 68,
    highThreshold: 218,
    detailSensitivity: 10,
    edgeThreshold: 28,
    skinDetectionStrength: 2.0,
  } as TriToneConfig,

  medievalIllumination: {
    shadowColor: "#1a0f26",
    midColor: "#8b4513",
    highlightColor: "#daa520",
    skinColor: "#f5deb3",
    lowThreshold: 65,
    highThreshold: 210,
    detailSensitivity: 12,
    edgeThreshold: 40,
    skinDetectionStrength: 2.2,
  } as TriToneConfig,

  renaissanceOil: {
    shadowColor: "#2d1810",
    midColor: "#8b6f47",
    highlightColor: "#f0e68c",
    skinColor: "#deb887",
    lowThreshold: 65,
    highThreshold: 215,
    detailSensitivity: 10,
    edgeThreshold: 38,
    skinDetectionStrength: 2.5,
  } as TriToneConfig,

  byzantineMosaic: {
    shadowColor: "#1f1410",
    midColor: "#b8860b",
    highlightColor: "#ffd700",
    skinColor: "#daa520",
    lowThreshold: 70,
    highThreshold: 215,
    detailSensitivity: 15,
    edgeThreshold: 25,
    skinDetectionStrength: 1.8,
  } as TriToneConfig,

  artDeco: {
    shadowColor: "#1a1a1a",
    midColor: "#c0c0c0",
    highlightColor: "#ffd700",
    skinColor: "#f5deb3",
    lowThreshold: 68,
    highThreshold: 215,
    detailSensitivity: 9,
    edgeThreshold: 35,
    skinDetectionStrength: 2.0,
  } as TriToneConfig,

  steampunkBrass: {
    shadowColor: "#1f1108",
    midColor: "#cd7f32",
    highlightColor: "#ffd9a0",
    skinColor: "#e0c4a8",
    lowThreshold: 65,
    highThreshold: 212,
    detailSensitivity: 9,
    edgeThreshold: 32,
    skinDetectionStrength: 2.0,
  } as TriToneConfig,

  noirDetective: {
    shadowColor: "#000000",
    midColor: "#4a4a4a",
    highlightColor: "#ffffff",
    skinColor: "#d3d3d3",
    lowThreshold: 75,
    highThreshold: 220,
    detailSensitivity: 6,
    edgeThreshold: 30,
    skinDetectionStrength: 1.2,
  } as TriToneConfig,

  sovietPropaganda: {
    shadowColor: "#1a0000",
    midColor: "#cc0000",
    highlightColor: "#ffd700",
    skinColor: "#ffccaa",
    lowThreshold: 68,
    highThreshold: 215,
    detailSensitivity: 12,
    edgeThreshold: 28,
    skinDetectionStrength: 1.8,
  } as TriToneConfig,

  aztecSun: {
    shadowColor: "#1f0f00",
    midColor: "#ff8c00",
    highlightColor: "#ffd700",
    skinColor: "#d2691e",
    lowThreshold: 65,
    highThreshold: 210,
    detailSensitivity: 15,
    edgeThreshold: 30,
    skinDetectionStrength: 2.0,
  } as TriToneConfig,

  norseIce: {
    shadowColor: "#0a1f2e",
    midColor: "#5c8a9e",
    highlightColor: "#d5e9f2",
    skinColor: "#c7e0ed",
    lowThreshold: 62,
    highThreshold: 210,
    detailSensitivity: 8,
    edgeThreshold: 32,
    skinDetectionStrength: 1.8,
  } as TriToneConfig,

  jadeDynasty: {
    shadowColor: "#0d1f0d",
    midColor: "#00a36c",
    highlightColor: "#c9f0dd",
    skinColor: "#f5e8d0",
    lowThreshold: 65,
    highThreshold: 212,
    detailSensitivity: 9,
    edgeThreshold: 32,
    skinDetectionStrength: 2.2,
  } as TriToneConfig,

  edoPeriod: {
    shadowColor: "#1a1410",
    midColor: "#8b4513",
    highlightColor: "#f5deb3",
    skinColor: "#deb887",
    lowThreshold: 68,
    highThreshold: 215,
    detailSensitivity: 10,
    edgeThreshold: 32,
    skinDetectionStrength: 2.3,
  } as TriToneConfig,

  desertMirage: {
    shadowColor: "#3d2817",
    midColor: "#f4a460",
    highlightColor: "#fff8dc",
    skinColor: "#deb887",
    lowThreshold: 68,
    highThreshold: 218,
    detailSensitivity: 7,
    edgeThreshold: 30,
    skinDetectionStrength: 1.8,
  } as TriToneConfig,

  volcanicMagma: {
    shadowColor: "#1a0000",
    midColor: "#ff4500",
    highlightColor: "#ffcc00",
    skinColor: "#ff6600",
    lowThreshold: 50,
    highThreshold: 180,
    detailSensitivity: 15,
    edgeThreshold: 40,
    skinDetectionStrength: 0.8,
  } as TriToneConfig,

  xenomorphic: {
    shadowColor: "#000f00",
    midColor: "#00ff00",
    highlightColor: "#ccffcc",
    skinColor: "#55ff55",
    lowThreshold: 40,
    highThreshold: 180,
    detailSensitivity: 20,
    edgeThreshold: 60,
    skinDetectionStrength: 0.5,
  } as TriToneConfig,

  cosmicVoid: {
    shadowColor: "#000000",
    midColor: "#4b0082",
    highlightColor: "#e6e6fa",
    skinColor: "#9370db",
    lowThreshold: 30,
    highThreshold: 200,
    detailSensitivity: 10,
    edgeThreshold: 30,
    skinDetectionStrength: 1.2,
  } as TriToneConfig,

  abyssalDepth: {
    shadowColor: "#00001a",
    midColor: "#006994",
    highlightColor: "#00ffff",
    skinColor: "#008b8b",
    lowThreshold: 50,
    highThreshold: 190,
    detailSensitivity: 12,
    edgeThreshold: 40,
    skinDetectionStrength: 1.0,
  } as TriToneConfig,

  radioactiveDecay: {
    shadowColor: "#0f1a00",
    midColor: "#7fff00",
    highlightColor: "#ffff00",
    skinColor: "#adff2f",
    lowThreshold: 60,
    highThreshold: 200,
    detailSensitivity: 15,
    edgeThreshold: 50,
    skinDetectionStrength: 0.7,
  } as TriToneConfig,

  cavePainting: {
    shadowColor: "#2b1810",
    midColor: "#a0522d",
    highlightColor: "#deb887",
    skinColor: "#cd853f",
    lowThreshold: 70,
    highThreshold: 200,
    detailSensitivity: 25,
    edgeThreshold: 35,
    skinDetectionStrength: 1.5,
  } as TriToneConfig,

  dystopianGrey: {
    shadowColor: "#1a1a1a",
    midColor: "#696969",
    highlightColor: "#d3d3d3",
    skinColor: "#a9a9a9",
    lowThreshold: 60,
    highThreshold: 190,
    detailSensitivity: 10,
    edgeThreshold: 40,
    skinDetectionStrength: 0.0,
  } as TriToneConfig,

  thermalImaging: {
    shadowColor: "#00008b",
    midColor: "#ff0000",
    highlightColor: "#ffff00",
    skinColor: "#ff8c00",
    lowThreshold: 50,
    highThreshold: 180,
    detailSensitivity: 8,
    edgeThreshold: 30,
    skinDetectionStrength: 1.0,
  } as TriToneConfig,

  xrayVision: {
    shadowColor: "#000000",
    midColor: "#4682b4",
    highlightColor: "#ffffff",
    skinColor: "#87ceeb",
    lowThreshold: 40,
    highThreshold: 210,
    detailSensitivity: 18,
    edgeThreshold: 50,
    skinDetectionStrength: 0.5,
  } as TriToneConfig,

  bioluminescent: {
    shadowColor: "#001010",
    midColor: "#00ffaa",
    highlightColor: "#ccffee",
    skinColor: "#00cc99",
    lowThreshold: 55,
    highThreshold: 200,
    detailSensitivity: 20,
    edgeThreshold: 60,
    skinDetectionStrength: 1.1,
  } as TriToneConfig,

  holographicGlitch: {
    shadowColor: "#1a0033",
    midColor: "#00ffff",
    highlightColor: "#ff00ff",
    skinColor: "#e0ffff",
    lowThreshold: 60,
    highThreshold: 210,
    detailSensitivity: 15,
    edgeThreshold: 45,
    skinDetectionStrength: 0.8,
  } as TriToneConfig,

  spectralHaunting: {
    shadowColor: "#0f0f1a",
    midColor: "#778899",
    highlightColor: "#f8f8ff",
    skinColor: "#b0c4de",
    lowThreshold: 50,
    highThreshold: 190,
    detailSensitivity: 10,
    edgeThreshold: 20,
    skinDetectionStrength: 0.5,
  } as TriToneConfig,

  cyberneticAugment: {
    shadowColor: "#000022",
    midColor: "#1e90ff",
    highlightColor: "#00bfff",
    skinColor: "#87cefa",
    lowThreshold: 65,
    highThreshold: 205,
    detailSensitivity: 14,
    edgeThreshold: 50,
    skinDetectionStrength: 1.2,
  } as TriToneConfig,

  crystalline: {
    shadowColor: "#101030",
    midColor: "#a020f0",
    highlightColor: "#00ffff",
    skinColor: "#e6e6fa",
    lowThreshold: 50,
    highThreshold: 200,
    detailSensitivity: 22,
    edgeThreshold: 65,
    skinDetectionStrength: 0.9,
  } as TriToneConfig,
} as const;

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
  style: keyof typeof AnimeStyles,
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
