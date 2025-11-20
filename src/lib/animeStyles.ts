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
    // Check cache first
    if (this.hexCache.has(hex)) {
      return this.hexCache.get(hex)!;
    }

    // Handle both 3-digit and 6-digit hex
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

    // Cache the result
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
    // Enhanced skin detection with configurable strength
    const redDominance = r > g && r > b;
    const redGreenDiff = r - g > 15 * strength;
    const minRed = r > 40;
    const colorBalance = r > 100 && g > 50 && b > 30; // Avoid dark shadows
    const saturation = Math.max(r, g, b) - Math.min(r, g, b) > 20; // Some color variation

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

    for (let pass = 0; pass < passes; pass++) {
      const temp = new Uint8Array(output);

      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = y * width + x;

          // 3x3 box blur with center weight
          const sum =
            temp[idx] * 4 + // Center weight
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

        // Sobel operator for edge detection
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

  // Parse configuration with defaults
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

  // Pre-calculate colors
  const shadowRGB = ColorUtils.hexToRgb(shadowColor);
  const midRGB = ColorUtils.hexToRgb(midColor);
  const highlightRGB = ColorUtils.hexToRgb(highlightColor);
  const skinRGB = ColorUtils.hexToRgb(skinColor);

  // Pre-process luminance maps
  const rawLuma = ImageProcessor.createLuminanceMap(data, width, height);
  const smoothLuma = ImageProcessor.applyBoxBlur(rawLuma, width, height, 1);
  const edgeMap = ImageProcessor.calculateEdgeMagnitude(
    smoothLuma,
    width,
    height
  );

  // Main processing loop
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const pixelIndex = y * width + x;
      const dataIndex = pixelIndex * 4;

      const smoothVal = smoothLuma[pixelIndex];
      const rawVal = rawLuma[pixelIndex];
      const edgeMag = edgeMap[pixelIndex];

      // Calculate local contrast for detail detection
      const localContrast = smoothVal - rawVal;
      const isDetail = localContrast > detailSensitivity;

      let targetRGB: [number, number, number];

      // Decision pipeline
      if (edgeMag > edgeThreshold) {
        // Strong edges -> shadow color
        targetRGB = shadowRGB;
      } else if (isDetail && smoothVal < 230) {
        // Fine details in non-highlight areas -> shadow color
        targetRGB = shadowRGB;
      } else {
        // Color zone logic
        if (smoothVal < lowThreshold) {
          targetRGB = shadowRGB;
        } else if (smoothVal > highThreshold) {
          targetRGB = highlightRGB;
        } else {
          // Midtone with skin detection
          const r = data[dataIndex];
          const g = data[dataIndex + 1];
          const b = data[dataIndex + 2];

          const isSkin = ColorUtils.isSkinTone(r, g, b, skinDetectionStrength);
          targetRGB = isSkin ? skinRGB : midRGB;
        }
      }

      // Write output
      outputData[dataIndex] = targetRGB[0];
      outputData[dataIndex + 1] = targetRGB[1];
      outputData[dataIndex + 2] = targetRGB[2];
      outputData[dataIndex + 3] = 255; // Full opacity
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
  /**
   * Psycho-Pass Dominator Style
   */
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

  /**
   * Inspector Style - Pink/Red variant
   */
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
  /** 1. Manga / Noir (High Contrast B&W) */
  manga: {
    shadowColor: "#000000",
    midColor: "#808080",
    highlightColor: "#FFFFFF",
    skinColor: "#FFFFFF", // Skin matches highlight for clean manga look
    lowThreshold: 80,
    highThreshold: 200,
    detailSensitivity: 10, // Sensitive to lines
    edgeThreshold: 30, // Strong outlines
    skinDetectionStrength: 0.0, // Disable skin detection for pure B&W
  } as TriToneConfig,

  /** 2. Phantom (Red/Black - Persona Style) */
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

  /** 3. Matrix (Digital Green) */
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

  /** 4. Sepia (Vintage Memory) */
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

  /** 5. Ocean (Deep Blue/Cyan) */
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

  /** 6. Sunset (Vaporwave Purple/Gold) */
  sunset: {
    shadowColor: "#2d1b4e",
    midColor: "#d65db1",
    highlightColor: "#ffbe0b",
    skinColor: "#ffcc80", // Warm golden skin
    lowThreshold: 70,
    highThreshold: 210,
    detailSensitivity: 15,
    edgeThreshold: 50,
    skinDetectionStrength: 1.2,
  } as TriToneConfig,

  /** 7. Gothic (Dark Grey/Crimson) */
  gothic: {
    shadowColor: "#0f0f0f",
    midColor: "#8a0303",
    highlightColor: "#e0e0e0",
    skinColor: "#f0f0f0", // Pale skin
    lowThreshold: 60,
    highThreshold: 180,
    detailSensitivity: 10,
    edgeThreshold: 35,
    skinDetectionStrength: 0.8,
  } as TriToneConfig,

  /** 8. Mint (Soft Green) */
  mint: {
    shadowColor: "#1c3d35",
    midColor: "#4fffa3",
    highlightColor: "#e0fff4",
    skinColor: "#ffe0e6", // Pinkish skin contrast
    lowThreshold: 70,
    highThreshold: 200,
    detailSensitivity: 15,
    edgeThreshold: 45,
    skinDetectionStrength: 1.1,
  } as TriToneConfig,

  /** 9. Golden (Royal Yellow) */
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

  /** 10. Lavender (Dreamy Purple) */
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

  /**
   * Classic Anime Style
   */
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

  /**
   * Cyberpunk Style
   */
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
    lowThreshold: 65, // was 85
    highThreshold: 210, // was 195
    detailSensitivity: 8, // was 25
    edgeThreshold: 32, // was 70
    skinDetectionStrength: 2.0, // was 1.5
  } as TriToneConfig,

  romanFreco: {
    shadowColor: "#3d2817",
    midColor: "#c85a54",
    highlightColor: "#f4e4c1",
    skinColor: "#d4a574",
    lowThreshold: 65, // was 70
    highThreshold: 215, // was 200
    detailSensitivity: 10, // was 30
    edgeThreshold: 30, // was 45
    skinDetectionStrength: 2.2, // was 1.8
  } as TriToneConfig,

  spartanBronze: {
    shadowColor: "#1f1408",
    midColor: "#b87333",
    highlightColor: "#ffd7a8",
    skinColor: "#cd9575",
    lowThreshold: 65, // was 75
    highThreshold: 215, // was 205
    detailSensitivity: 8, // was 20
    edgeThreshold: 35, // was 60
    skinDetectionStrength: 2.0, // was 1.6
  } as TriToneConfig,

  egyptianPapyrus: {
    shadowColor: "#2b1f0a",
    midColor: "#d4a76a",
    highlightColor: "#faf4e8",
    skinColor: "#c19a6b",
    lowThreshold: 68, // was 80
    highThreshold: 218, // was 210
    detailSensitivity: 10, // was 35
    edgeThreshold: 28, // was 25
    skinDetectionStrength: 2.0, // was 1.4
  } as TriToneConfig,

  medievalIllumination: {
    shadowColor: "#1a0f26",
    midColor: "#8b4513",
    highlightColor: "#daa520",
    skinColor: "#f5deb3",
    lowThreshold: 65, // was 70
    highThreshold: 210, // was 195
    detailSensitivity: 12, // was 40
    edgeThreshold: 40, // was 80
    skinDetectionStrength: 2.2, // was 1.7
  } as TriToneConfig,

  renaissanceOil: {
    shadowColor: "#2d1810",
    midColor: "#8b6f47",
    highlightColor: "#f0e68c",
    skinColor: "#deb887",
    lowThreshold: 65, // was 75
    highThreshold: 215, // was 200
    detailSensitivity: 10, // was 35
    edgeThreshold: 38, // was 75
    skinDetectionStrength: 2.5, // was 2.0
  } as TriToneConfig,

  byzantineMosaic: {
    shadowColor: "#1f1410",
    midColor: "#b8860b",
    highlightColor: "#ffd700",
    skinColor: "#daa520",
    lowThreshold: 70, // was 85
    highThreshold: 215, // was 210
    detailSensitivity: 15, // was 45
    edgeThreshold: 25, // was 20
    skinDetectionStrength: 1.8, // was 1.3
  } as TriToneConfig,

  artDeco: {
    shadowColor: "#1a1a1a",
    midColor: "#c0c0c0",
    highlightColor: "#ffd700",
    skinColor: "#f5deb3",
    lowThreshold: 68, // was 80
    highThreshold: 215, // was 205
    detailSensitivity: 9, // was 28
    edgeThreshold: 35, // was 65
    skinDetectionStrength: 2.0, // was 1.5
  } as TriToneConfig,

  steampunkBrass: {
    shadowColor: "#1f1108",
    midColor: "#cd7f32",
    highlightColor: "#ffd9a0",
    skinColor: "#e0c4a8",
    lowThreshold: 65, // was 70
    highThreshold: 212, // was 200
    detailSensitivity: 9, // was 25
    edgeThreshold: 32, // was 55
    skinDetectionStrength: 2.0, // was 1.4
  } as TriToneConfig,

  thermalImaging: {
    shadowColor: "#000033",
    midColor: "#ff6600",
    highlightColor: "#ffff00",
    skinColor: "#ff9933",
    lowThreshold: 60,
    highThreshold: 210, // was 200
    detailSensitivity: 10, // was 20
    edgeThreshold: 30, // was 50
    skinDetectionStrength: 2.0, // was 1.5
  } as TriToneConfig,

  noirDetective: {
    shadowColor: "#000000",
    midColor: "#4a4a4a",
    highlightColor: "#ffffff",
    skinColor: "#d3d3d3",
    lowThreshold: 75, // was 90
    highThreshold: 220,
    detailSensitivity: 6, // was 8
    edgeThreshold: 30, // was 45
    skinDetectionStrength: 1.2, // was 0.6
  } as TriToneConfig,

  sovietPropaganda: {
    shadowColor: "#1a0000",
    midColor: "#cc0000",
    highlightColor: "#ffd700",
    skinColor: "#ffccaa",
    lowThreshold: 68, // was 75
    highThreshold: 215, // was 205
    detailSensitivity: 12, // was 35
    edgeThreshold: 28, // was 30
    skinDetectionStrength: 1.8, // was 1.2
  } as TriToneConfig,

  aztecSun: {
    shadowColor: "#1f0f00",
    midColor: "#ff8c00",
    highlightColor: "#ffd700",
    skinColor: "#d2691e",
    lowThreshold: 65, // was 70
    highThreshold: 210, // was 200
    detailSensitivity: 15, // was 40
    edgeThreshold: 30, // was 35
    skinDetectionStrength: 2.0, // was 1.5
  } as TriToneConfig,

  norseIce: {
    shadowColor: "#0a1f2e",
    midColor: "#5c8a9e",
    highlightColor: "#d5e9f2",
    skinColor: "#c7e0ed",
    lowThreshold: 62, // was 65
    highThreshold: 210, // was 195
    detailSensitivity: 8, // was 20
    edgeThreshold: 32, // was 55
    skinDetectionStrength: 1.8, // was 1.1
  } as TriToneConfig,

  jadeDynasty: {
    shadowColor: "#0d1f0d",
    midColor: "#00a36c",
    highlightColor: "#c9f0dd",
    skinColor: "#f5e8d0",
    lowThreshold: 65, // was 70
    highThreshold: 212, // was 200
    detailSensitivity: 9, // was 22
    edgeThreshold: 32, // was 50
    skinDetectionStrength: 2.2, // was 1.6
  } as TriToneConfig,

  edoPeriod: {
    shadowColor: "#1a1410",
    midColor: "#8b4513",
    highlightColor: "#f5deb3",
    skinColor: "#deb887",
    lowThreshold: 68, // was 80
    highThreshold: 215, // was 205
    detailSensitivity: 10, // was 30
    edgeThreshold: 32, // was 50
    skinDetectionStrength: 2.3, // was 1.8
  } as TriToneConfig,

  desertMirage: {
    shadowColor: "#3d2817",
    midColor: "#f4a460",
    highlightColor: "#fff8dc",
    skinColor: "#deb887",
    lowThreshold: 68, // was 75
    highThreshold: 218, // was 210
    detailSensitivity: 7, // was 15
    edgeThreshold: 30, // was 40
    skinDetectionStrength: 1.8, // was 1.3
  } as TriToneConfig,
} as const;

// Preset application functions (backward compatibility)
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

// Utility function to apply any preset style
export function applyStyle(
  style: keyof typeof AnimeStyles,
  ctx: CanvasRenderingContext2D,
  imageData: ImageData
): ProcessedImageData {
  return applyTriTone(ctx, imageData, AnimeStyles[style]);
}

// Performance monitoring utility
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
