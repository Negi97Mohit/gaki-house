// src/lib/webgl/GLRenderer.ts
import { GLContext } from "./GLContext";
import { VideoTexture } from "./VideoTexture";
import { ShaderManager } from "./ShaderManager";
import { parseFilterString } from "./utils";
import { AnimeStyles } from "@/lib/animeStyles";

export interface RenderOptions {
  videoFilter?: string;
  activeInteractiveFilter?: string;
  filterIntensity?: number;
  filterColor?: string;
  processedCanvas?: HTMLCanvasElement | null;
  // Auto-framing options
  facePosition?: { x: number; y: number; width: number; height: number } | null;
  isAutoFramingEnabled?: boolean;
  zoomSensitivity?: number; // 0.0 to 1.0
  trackingSpeed?: number; // 0.0 to 1.0
  isMasked?: boolean;
}

function hexToVec3(hex: string): [number, number, number] {
  if (!hex || !hex.startsWith("#")) return [1, 1, 1];
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
}

export class GLRenderer {
  ctx: GLContext;
  videoTexture: VideoTexture;
  maskTexture: VideoTexture;
  shaderManager: ShaderManager;
  startTime: number;

  private currentScale: number = 1.0;
  private currentOffset: [number, number] = [0.0, 0.0];

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = new GLContext(canvas);
    this.videoTexture = new VideoTexture(this.ctx.gl);
    this.maskTexture = new VideoTexture(this.ctx.gl);
    this.shaderManager = new ShaderManager(this.ctx);
    this.startTime = Date.now();
  }

  resize() {
    this.ctx.resize();
  }

  render(video: HTMLVideoElement, options: RenderOptions = {}) {
    const { gl } = this.ctx;
    this.videoTexture.update(video);
    this.ctx.clear();

    const canvasAspect = this.ctx.canvas.width / this.ctx.canvas.height;
    const videoAspect = video.videoWidth / video.videoHeight;
    let vw = this.ctx.canvas.width;
    let vh = this.ctx.canvas.height;
    if (canvasAspect > videoAspect) vh = vw / videoAspect;
    else vw = vh * videoAspect;
    const x = (this.ctx.canvas.width - vw) / 2;
    const y = (this.ctx.canvas.height - vh) / 2;
    gl.viewport(x, y, vw, vh);

    // --- Auto-Framing Logic ---
    let targetScale = 1.0;
    let targetOffset: [number, number] = [0.0, 0.0];

    if (options.isAutoFramingEnabled && options.facePosition) {
      const faceX = options.facePosition.x / 100;
      const faceY = options.facePosition.y / 100;
      targetScale = options.zoomSensitivity ?? 1.2;
      targetOffset = [faceX - 0.5, faceY - 0.5];

      const maxOffset = 0.5 - 0.5 / targetScale;
      targetOffset[0] = Math.max(
        -maxOffset,
        Math.min(maxOffset, targetOffset[0])
      );
      targetOffset[1] = Math.max(
        -maxOffset,
        Math.min(maxOffset, targetOffset[1])
      );
    }

    const speed = (options.trackingSpeed || 0.1) * 0.5;
    this.currentScale += (targetScale - this.currentScale) * speed;
    this.currentOffset[0] += (targetOffset[0] - this.currentOffset[0]) * speed;
    this.currentOffset[1] += (targetOffset[1] - this.currentOffset[1]) * speed;

    this.shaderManager.setUniform1f("u_scale", this.currentScale);
    this.shaderManager.setUniform2fv("u_offset", this.currentOffset);

    // --- Shader Logic ---
    if (options.isMasked && options.processedCanvas) {
      // 1. Masked Rendering
      this.shaderManager.activate("masked");
      this.maskTexture.update(options.processedCanvas);

      this.shaderManager.setUniform1i("u_video", 0);
      this.shaderManager.setUniform1i("u_mask", 1);
      this.shaderManager.setUniform1f("u_scale", this.currentScale);
      this.shaderManager.setUniform2fv("u_offset", this.currentOffset);

      this.videoTexture.bind(0);
      this.maskTexture.bind(1);
    } else if (
      options.activeInteractiveFilter &&
      options.activeInteractiveFilter !== "none"
    ) {
      // 2. Interactive Effects
      this.shaderManager.activate("effects");

      let typeId = 0;
      let uColor = hexToVec3(options.filterColor || "#ffffff");
      let uColorMid = [0.5, 0.5, 0.5];
      let uColorHigh = [1.0, 1.0, 1.0];

      if (options.activeInteractiveFilter in AnimeStyles) {
        typeId = 6;
        const style = AnimeStyles[options.activeInteractiveFilter];
        uColor = hexToVec3(style.shadowColor);
        uColorMid = hexToVec3(style.midColor);
        uColorHigh = hexToVec3(style.highlightColor);
      } else {
        // ... (Filter mapping)
        const typeMap: Record<string, number> = {
          pixel: 1,
          retro: 1,
          hologram: 2,
          "hologram-fx": 2,
          holographicGlitch: 2,
          cyberneticAugment: 2,
          "neon-edge": 3,
          neon: 3,
          cyberpunk: 3,
          neonHorror: 3,
          bioluminescent: 3,
          thermal: 4,
          thermalImaging: 4,
          predator: 4,
          volcanicMagma: 4,
          radioactiveDecay: 4,
          mirror: 5,
          spectralHaunting: 5,
          sketch: 7,
          noir: 7,
          noirDetective: 7,
          comic: 8,
          comicBold: 8,
          manga: 8,
          "oil-paint": 9,
          oilPaint: 9,
          watercolor: 9,
          ascii: 10,
          matrix: 10,
          vhs: 11,
          glitchPurple: 11,
          prism: 12,
          kaleidoscope: 13,
          crystalline: 13,
          xray: 14,
          xrayVision: 14,
          infrared: 14,
          "infrared-fx": 14,
        };
        typeId = typeMap[options.activeInteractiveFilter] || 0;

        if (options.activeInteractiveFilter === "matrix")
          uColor = [0.0, 1.0, 0.0];
        else if (options.activeInteractiveFilter.includes("infrared"))
          uColor = [1.0, 0.0, 0.0];
        else if (options.activeInteractiveFilter === "sketch")
          uColor = [0.1, 0.1, 0.1];
      }

      this.shaderManager.setUniform1i("u_video", 0);
      this.shaderManager.setUniform1i("u_filter_type", typeId);
      this.shaderManager.setUniform1f(
        "u_time",
        (Date.now() - this.startTime) / 1000.0
      );
      this.shaderManager.setUniform1f(
        "u_intensity",
        options.filterIntensity ?? 1.0
      );
      this.shaderManager.setUniform3fv("u_color", uColor);
      this.shaderManager.setUniform3fv("u_color_mid", uColorMid);
      this.shaderManager.setUniform3fv("u_color_high", uColorHigh);
      this.shaderManager.setUniform1f("u_scale", this.currentScale);
      this.shaderManager.setUniform2fv("u_offset", this.currentOffset);

      this.videoTexture.bind(0);
    } else {
      // 3. Basic Rendering
      this.shaderManager.activate("basic");
      const filters = parseFilterString(options.videoFilter || "");
      this.shaderManager.setUniform1i("u_video", 0);
      this.shaderManager.setUniform1f("u_brightness", filters.brightness);
      this.shaderManager.setUniform1f("u_contrast", filters.contrast);
      this.shaderManager.setUniform1f("u_saturation", filters.saturation);
      this.shaderManager.setUniform1f("u_scale", this.currentScale);
      this.shaderManager.setUniform2fv("u_offset", this.currentOffset);

      this.videoTexture.bind(0);
    }

    this.ctx.drawQuad();
  }

  destroy() {
    this.videoTexture.destroy();
    this.maskTexture.destroy();
  }
}
