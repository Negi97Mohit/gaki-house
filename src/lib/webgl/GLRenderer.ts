// src/lib/webgl/GLRenderer.ts
import { GLContext } from "./GLContext";
import { VideoTexture } from "./VideoTexture";
import { ShaderManager } from "./ShaderManager";
import { parseFilterString } from "./utils";

export interface RenderOptions {
  videoFilter?: string;
  activeInteractiveFilter?: string;
  filterIntensity?: number;
  filterColor?: string;
  processedCanvas?: HTMLCanvasElement | null;
  backgroundEffect?: "none" | "blur" | "image";
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

    const canvasAspect = this.ctx.canvas.width / this.ctx.canvas.height;
    const videoAspect = video.videoWidth / video.videoHeight;
    let vw = this.ctx.canvas.width;
    let vh = this.ctx.canvas.height;

    if (canvasAspect > videoAspect) {
      vh = vw / videoAspect;
    } else {
      vw = vh * videoAspect;
    }
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
        thermal: 4,
        thermalImaging: 4,
        infrared: 4,
        "infrared-fx": 4,
        predator: 4,
        mirror: 5,
        kaleidoscope: 5,
        prism: 5,
        crystalline: 5,
        vhs: 2,
        glitchPurple: 2,
        matrix: 2,
        retro: 1,
        sketch: 3,
        comic: 3,
        manga: 3,
        noir: 3,
        noirDetective: 3,
        xray: 4,
        xrayVision: 4,
        bioluminescent: 3,
        radioactiveDecay: 4,
        cosmicVoid: 2,
        spectralHaunting: 5,
        volcanicMagma: 4,
      };

      const typeId = typeMap[options.activeInteractiveFilter] || 0;

      // DEBUG: Log unknown filters
      if (typeId === 0) {
        console.warn(
          `[GLRenderer] Filter '${options.activeInteractiveFilter}' mapped to 0 (None)`
        );
      } else {
        // Optional: Log successful application (can be noisy)
        // console.log(`[GLRenderer] Applied filter: ${options.activeInteractiveFilter} -> ID: ${typeId}`);
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

      const hex = options.filterColor || "#00ffff";
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      this.shaderManager.setUniform3fv("u_color", [r, g, b]);

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
