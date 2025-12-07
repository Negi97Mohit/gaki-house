// src/lib/effects.ts
// This file contains all logic for interactive canvas filters.

// --- HELPER FUNCTIONS ---
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

// --- FILTER IMPLEMENTATIONS ---

export function detectEdges(
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
export function applyHologramEffect(
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
      const rIdx =
        (y * w + Math.min(w - 1, Math.max(0, x + shift + glitchIntensity))) * 4;
      const gIdx = idx;
      const bIdx =
        (y * w + Math.min(w - 1, Math.max(0, x - shift - glitchIntensity))) * 4;

      output.data[idx] = data[rIdx] * scanLine;
      output.data[idx + 1] = data[gIdx + 1] * scanLine;
      output.data[idx + 2] = data[bIdx + 2] * scanLine;
      output.data[idx + 3] = data[idx + 3] * 0.8; // Semi-transparent
    }
  }

  return output;
}

// 2. Pixelated - Retro pixel art effect
export function applyPixelEffect(
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
      let r = 0,
        g = 0,
        b = 0,
        count = 0;

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
export function applyComicEffect(
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
      const dist = Math.sqrt(
        (dotX - dotSize / 2) ** 2 + (dotY - dotSize / 2) ** 2
      );
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
export function applyASCIIEffect(
  ctx: CanvasRenderingContext2D,
  imageData: ImageData,
  canvas: HTMLCanvasElement
): void {
  const data = imageData.data;
  const w = imageData.width;
  const h = imageData.height;
  const chars = ["@", "#", "$", "%", "?", "*", "+", ";", ":", ",", ".", " "];
  const charSize = 8;

  // Clear canvas
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#00FF00";
  ctx.font = `${charSize}px monospace`;

  for (let y = 0; y < h; y += charSize) {
    for (let x = 0; x < w; x += charSize) {
      // Get average brightness
      let brightness = 0,
        count = 0;

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
export function applyThermalEffect(
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

// 6. Mirror - Flip video horizontally with kaleidoscope effect
export function applyMirrorEffect(
  ctx: CanvasRenderingContext2D,
  imageData: ImageData,
  intensity: number = 1.0
): ImageData {
  const data = imageData.data;
  const w = imageData.width;
  const h = imageData.height;
  const output = ctx.createImageData(w, h);
  const halfW = Math.floor(w / 2);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const sourceX = x < halfW ? x : w - 1 - x;
      const srcIdx = (y * w + sourceX) * 4;
      const dstIdx = (y * w + x) * 4;

      output.data[dstIdx] = data[srcIdx];
      output.data[dstIdx + 1] = data[srcIdx + 1];
      output.data[dstIdx + 2] = data[srcIdx + 2];
      output.data[dstIdx + 3] = data[srcIdx + 3];
    }
  }

  return output;
}

// 7. Kaleidoscope - 4-way mirror symmetry
export function applyKaleidoscopeEffect(
  ctx: CanvasRenderingContext2D,
  imageData: ImageData,
  intensity: number = 1.0
): ImageData {
  const data = imageData.data;
  const w = imageData.width;
  const h = imageData.height;
  const output = ctx.createImageData(w, h);
  const halfW = Math.floor(w / 2);
  const halfH = Math.floor(h / 2);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sourceX = x < halfW ? x : w - 1 - x;
      let sourceY = y < halfH ? y : h - 1 - y;

      const srcIdx = (sourceY * w + sourceX) * 4;
      const dstIdx = (y * w + x) * 4;

      output.data[dstIdx] = data[srcIdx];
      output.data[dstIdx + 1] = data[srcIdx + 1];
      output.data[dstIdx + 2] = data[srcIdx + 2];
      output.data[dstIdx + 3] = data[srcIdx + 3];
    }
  }

  return output;
}

// 8. Oil Paint - Artistic oil painting effect
export function applyOilPaintEffect(
  ctx: CanvasRenderingContext2D,
  imageData: ImageData,
  intensity: number = 1.0
): ImageData {
  const data = imageData.data;
  const w = imageData.width;
  const h = imageData.height;
  const output = ctx.createImageData(w, h);
  const radius = Math.max(1, Math.floor(3 * intensity));

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const intensityLevels = 20;
      const intensityCount = new Array(intensityLevels).fill(0);
      const avgR = new Array(intensityLevels).fill(0);
      const avgG = new Array(intensityLevels).fill(0);
      const avgB = new Array(intensityLevels).fill(0);

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = Math.min(w - 1, Math.max(0, x + dx));
          const ny = Math.min(h - 1, Math.max(0, y + dy));
          const idx = (ny * w + nx) * 4;

          const curIntensity = Math.floor(
            ((data[idx] + data[idx + 1] + data[idx + 2]) / 3 / 255) *
              (intensityLevels - 1)
          );

          intensityCount[curIntensity]++;
          avgR[curIntensity] += data[idx];
          avgG[curIntensity] += data[idx + 1];
          avgB[curIntensity] += data[idx + 2];
        }
      }

      let maxIndex = 0;
      for (let i = 0; i < intensityLevels; i++) {
        if (intensityCount[i] > intensityCount[maxIndex]) maxIndex = i;
      }

      const idx = (y * w + x) * 4;
      output.data[idx] = avgR[maxIndex] / intensityCount[maxIndex];
      output.data[idx + 1] = avgG[maxIndex] / intensityCount[maxIndex];
      output.data[idx + 2] = avgB[maxIndex] / intensityCount[maxIndex];
      output.data[idx + 3] = data[idx + 3];
    }
  }

  return output;
}

// 9. Sketch - Pencil sketch effect
export function applySketchEffect(
  ctx: CanvasRenderingContext2D,
  imageData: ImageData,
  intensity: number = 1.0
): ImageData {
  const data = imageData.data;
  const w = imageData.width;
  const h = imageData.height;
  const output = ctx.createImageData(w, h);

  // Invert colors and detect edges
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      let gx = 0,
        gy = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * w + (x + kx)) * 4;
          const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
          const kernelIdx = (ky + 1) * 3 + (kx + 1);
          gx += gray * [-1, 0, 1, -2, 0, 2, -1, 0, 1][kernelIdx];
          gy += gray * [-1, -2, -1, 0, 0, 0, 1, 2, 1][kernelIdx];
        }
      }

      const magnitude = Math.sqrt(gx * gx + gy * gy) * intensity;
      const outIdx = (y * w + x) * 4;
      const val = 255 - Math.min(255, magnitude);

      output.data[outIdx] = val;
      output.data[outIdx + 1] = val;
      output.data[outIdx + 2] = val;
      output.data[outIdx + 3] = data[outIdx + 3];
    }
  }

  return output;
}

// 10. Prism - Rainbow chromatic aberration
export function applyPrismEffect(
  ctx: CanvasRenderingContext2D,
  imageData: ImageData,
  intensity: number = 1.0,
  color: string = "#ff00ff"
): ImageData {
  const data = imageData.data;
  const w = imageData.width;
  const h = imageData.height;
  const output = ctx.createImageData(w, h);
  const offset = Math.floor(5 * intensity);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;

      // Red channel - shift right
      const rIdx = (y * w + Math.min(w - 1, x + offset)) * 4;
      output.data[idx] = data[rIdx];

      // Green channel - no shift
      output.data[idx + 1] = data[idx + 1];

      // Blue channel - shift left
      const bIdx = (y * w + Math.max(0, x - offset)) * 4;
      output.data[idx + 2] = data[bIdx + 2];

      output.data[idx + 3] = data[idx + 3];
    }
  }

  return output;
}

// 11. VHS - Retro VHS tape glitch
export function applyVHSEffect(
  ctx: CanvasRenderingContext2D,
  imageData: ImageData,
  intensity: number = 1.0
): ImageData {
  const data = imageData.data;
  const w = imageData.width;
  const h = imageData.height;
  const output = ctx.createImageData(w, h);

  for (let y = 0; y < h; y++) {
    // Random line offset for glitch effect
    const offset =
      Math.random() < 0.1 * intensity
        ? Math.floor((Math.random() - 0.5) * 20 * intensity)
        : 0;

    for (let x = 0; x < w; x++) {
      const sourceX = Math.max(0, Math.min(w - 1, x + offset));
      const srcIdx = (y * w + sourceX) * 4;
      const dstIdx = (y * w + x) * 4;

      // Add color bleeding and reduce saturation
      output.data[dstIdx] = data[srcIdx] * 0.9 + 20;
      output.data[dstIdx + 1] = data[srcIdx + 1] * 0.8 + 10;
      output.data[dstIdx + 2] = data[srcIdx + 2] * 0.9 + 15;
      output.data[dstIdx + 3] = data[srcIdx + 3];
    }
  }

  return output;
}

// 12. Infrared - Night vision/heat signature
export function applyInfraredEffect(
  ctx: CanvasRenderingContext2D,
  imageData: ImageData,
  color: string = "#00ff00"
): ImageData {
  const data = imageData.data;
  const w = imageData.width;
  const h = imageData.height;
  const output = ctx.createImageData(w, h);
  const rgb = hexToRgb(color);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3 / 255;

      output.data[idx] = rgb[0] * brightness;
      output.data[idx + 1] = rgb[1] * brightness;
      output.data[idx + 2] = rgb[2] * brightness;
      output.data[idx + 3] = data[idx + 3];
    }
  }

  return output;
}

// 13. X-Ray - Medical X-ray visualization
export function applyXRayEffect(
  ctx: CanvasRenderingContext2D,
  imageData: ImageData,
  intensity: number = 1.0
): ImageData {
  const data = imageData.data;
  const w = imageData.width;
  const h = imageData.height;
  const output = ctx.createImageData(w, h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;

      // Invert and boost contrast
      const r = 255 - data[idx];
      const g = 255 - data[idx + 1];
      const b = 255 - data[idx + 2];
      const avg = (r + g + b) / 3;

      // Apply blue tint
      output.data[idx] = avg * 0.7;
      output.data[idx + 1] = avg * 0.9;
      output.data[idx + 2] = avg * intensity;
      output.data[idx + 3] = data[idx + 3];
    }
  }

  return output;
}

// 14. Cyberpunk - Neon grid with scan lines
export function applyCyberpunkEffect(
  ctx: CanvasRenderingContext2D,
  imageData: ImageData,
  intensity: number = 1.0,
  color: string = "#ff00ff"
): ImageData {
  const data = imageData.data;
  const w = imageData.width;
  const h = imageData.height;
  const output = ctx.createImageData(w, h);
  const rgb = hexToRgb(color);

  for (let y = 0; y < h; y++) {
    // Scan line effect
    const scanLine = y % 3 === 0 ? 0.8 : 1.0;

    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;

      // Boost colors and add neon tint
      const r = Math.min(255, data[idx] * 1.2 + rgb[0] * 0.1 * intensity);
      const g = Math.min(255, data[idx + 1] * 1.1 + rgb[1] * 0.1 * intensity);
      const b = Math.min(255, data[idx + 2] * 1.3 + rgb[2] * 0.2 * intensity);

      output.data[idx] = r * scanLine;
      output.data[idx + 1] = g * scanLine;
      output.data[idx + 2] = b * scanLine;
      output.data[idx + 3] = data[idx + 3];
    }
  }

  return output;
}
