// src/lib/webgl/GLRenderer.ts
import { GLContext } from "./GLContext";
import { VideoTexture } from "./VideoTexture";
import { ShaderManager } from "./ShaderManager";
import { parseFilterString } from "./utils";
// 1. IMPORT ANIME STYLES DATA
import { AnimeStyles } from "@/lib/animeStyles";

export interface RenderOptions {
  videoFilter?: string;
  activeInteractiveFilter?: string;
  filterIntensity?: number;
  filterColor?: string;
  processedCanvas?: HTMLCanvasElement | null;
  backgroundEffect?: "none" | "blur" | "image";
}

// Helper to convert Hex to Vec3
function hexToVec3(hex: string): [number, number, number] {
  if (!hex || !hex.startsWith("#")) return [0, 0, 0];
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

    // Aspect Ratio Fix
    const canvasAspect = this.ctx.canvas.width / this.ctx.canvas.height;
    const videoAspect = video.videoWidth / video.videoHeight;
    let vw = this.ctx.canvas.width;
    let vh = this.ctx.canvas.height;
    if (canvasAspect > videoAspect) vh = vw / videoAspect;
    else vw = vh * videoAspect;
    const x = (this.ctx.canvas.width - vw) / 2;
    const y = (this.ctx.canvas.height - vh) / 2;
    gl.viewport(x, y, vw, vh);

    if (
      options.backgroundEffect &&
      options.backgroundEffect !== "none" &&
      options.processedCanvas
    ) {
      // Composite Shader Logic
      this.shaderManager.activate("composite");
      this.maskTexture.update(options.processedCanvas);
      this.shaderManager.setUniform1i("u_video", 0);
      this.shaderManager.setUniform1i("u_mask", 1);
      this.shaderManager.setUniform1i(
        "u_bg_type",
        options.backgroundEffect === "blur" ? 1 : 2
      );
      this.videoTexture.bind(0);
      this.maskTexture.bind(1);
    } else if (
      options.activeInteractiveFilter &&
      options.activeInteractiveFilter !== "none"
    ) {
      this.shaderManager.activate("effects");

      // 1. Basic Mappings
      let typeId = 0;
      let uColor = hexToVec3(options.filterColor || "#00ffff");
      let uColorMid = [0.5, 0.5, 0.5];
      let uColorHigh = [1.0, 1.0, 1.0];

      // Check if it's an Anime Style first
      if (options.activeInteractiveFilter in AnimeStyles) {
        typeId = 6; // Use Tri-Tone Shader
        const style = AnimeStyles[options.activeInteractiveFilter];
        uColor = hexToVec3(style.shadowColor);
        uColorMid = hexToVec3(style.midColor);
        uColorHigh = hexToVec3(style.highlightColor);
      } else {
        // Standard WebGL Filters
        const typeMap: Record<string, number> = {
          pixel: 1,
          hologram: 2,
          "hologram-fx": 2,
          holographicGlitch: 2,
          "neon-edge": 3,
          neon: 3,
          cyberpunk: 3,
          neonHorror: 3,
          cyberneticAugment: 3,
          bioluminescent: 3,
          thermal: 4,
          thermalImaging: 4,
          infrared: 4,
          "infrared-fx": 4,
          predator: 4,
          radioactiveDecay: 4,
          volcanicMagma: 4,
          xray: 4,
          xrayVision: 4,
          mirror: 5,
          kaleidoscope: 5,
          prism: 5,
          crystalline: 5,
          spectralHaunting: 5,
          vhs: 2,
          glitchPurple: 2,
          matrix: 2,
          retro: 1,
          sketch: 3,
          comic: 3,
          noir: 3,
          noirDetective: 3,
        };
        typeId = typeMap[options.activeInteractiveFilter] || 0;
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

      // Set the colors
      this.shaderManager.setUniform3fv("u_color", uColor);
      this.shaderManager.setUniform3fv("u_color_mid", uColorMid);
      this.shaderManager.setUniform3fv("u_color_high", uColorHigh);

      this.videoTexture.bind(0);
    } else {
      // Basic Shader Logic
      this.shaderManager.activate("basic");
      const filters = parseFilterString(options.videoFilter || "");
      this.shaderManager.setUniform1i("u_video", 0);
      this.shaderManager.setUniform1f("u_brightness", filters.brightness);
      this.shaderManager.setUniform1f("u_contrast", filters.contrast);
      this.shaderManager.setUniform1f("u_saturation", filters.saturation);
      this.videoTexture.bind(0);
    }

    this.ctx.drawQuad();
  }

  destroy() {
    this.videoTexture.destroy();
    this.maskTexture.destroy();
  }
}
