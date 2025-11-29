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
  backgroundEffect?: "none" | "blur" | "image";
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

      let typeId = 0;
      // Default color (White)
      let uColor = hexToVec3(options.filterColor || "#ffffff");
      let uColorMid = [0.5, 0.5, 0.5];
      let uColorHigh = [1.0, 1.0, 1.0];

      // Anime Styles -> Type 6
      if (options.activeInteractiveFilter in AnimeStyles) {
        typeId = 6;
        const style = AnimeStyles[options.activeInteractiveFilter];
        uColor = hexToVec3(style.shadowColor);
        uColorMid = hexToVec3(style.midColor);
        uColorHigh = hexToVec3(style.highlightColor);
      } else {
        // Expanded Mapping Table
        const typeMap: Record<string, number> = {
          // 1: Pixelate
          pixel: 1,
          retro: 1,

          // 2: Hologram (Tech/Blue)
          hologram: 2,
          "hologram-fx": 2,
          holographicGlitch: 2,
          cyberneticAugment: 2,

          // 3: Neon Edge
          "neon-edge": 3,
          neon: 3,
          cyberpunk: 3,
          neonHorror: 3,
          bioluminescent: 3,

          // 4: Thermal
          thermal: 4,
          thermalImaging: 4,
          predator: 4,
          volcanicMagma: 4,
          radioactiveDecay: 4,

          // 5: Mirror (Simple)
          mirror: 5,
          spectralHaunting: 5,

          // 7: Sketch
          sketch: 7,
          noir: 7,
          noirDetective: 7,

          // 8: Comic
          comic: 8,
          comicBold: 8,
          manga: 8,

          // 9: Oil Paint
          "oil-paint": 9,
          oilPaint: 9,
          watercolor: 9,

          // 10: ASCII
          ascii: 10,
          matrix: 10,

          // 11: VHS
          vhs: 11,
          glitchPurple: 11,

          // 12: Prism
          prism: 12,

          // 13: Kaleidoscope
          kaleidoscope: 13,
          crystalline: 13,

          // 14: X-Ray
          xray: 14,
          xrayVision: 14,
          infrared: 14,
          "infrared-fx": 14,
        };

        typeId = typeMap[options.activeInteractiveFilter] || 0;

        // Specific overrides for filters that need color overrides but aren't Anime styles
        if (options.activeInteractiveFilter === "matrix") {
          uColor = [0.0, 1.0, 0.0]; // Force Matrix Green
        } else if (
          options.activeInteractiveFilter === "infrared" ||
          options.activeInteractiveFilter === "infrared-fx"
        ) {
          uColor = [1.0, 0.0, 0.0]; // Force Infrared Red
        } else if (options.activeInteractiveFilter === "sketch") {
          uColor = [0.1, 0.1, 0.1]; // Force Black Ink for default Sketch
        }
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

      this.videoTexture.bind(0);
    } else {
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
