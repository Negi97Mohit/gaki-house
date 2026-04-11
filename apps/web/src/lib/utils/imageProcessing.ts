// src/lib/utils/imageProcessing.ts

// ===== COLOR UTILITIES =====
export class ColorUtils {
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
    const redDominance = r > g && r > b;
    const redGreenDiff = r - g > 15 * strength;
    const minRed = r > 40;
    const colorBalance = r > 60 && g > 40 && b > 20;
    const saturation = Math.max(r, g, b) - Math.min(r, g, b) > 15;

    return redDominance && redGreenDiff && minRed && colorBalance && saturation;
  }
}

// ===== IMAGE PROCESSING UTILITIES =====
export class ImageProcessor {
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
    const output = new Uint8Array(input);
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
