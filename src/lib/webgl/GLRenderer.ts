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
  backgroundImage?: HTMLImageElement | null;
  // Auto-framing options
  facePosition?: { x: number; y: number; width: number; height: number } | null;
  isAutoFramingEnabled?: boolean;
  zoomSensitivity?: number; // 0.0 to 1.0
  trackingSpeed?: number; // 0.0 to 1.0
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
  bgTexture: VideoTexture;
  shaderManager: ShaderManager;
  startTime: number;

  // Auto-framing state
  private currentScale: number = 1.0;
  private currentOffset: [number, number] = [0.0, 0.0];

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = new GLContext(canvas);
    this.videoTexture = new VideoTexture(this.ctx.gl);
    this.maskTexture = new VideoTexture(this.ctx.gl);
    this.bgTexture = new VideoTexture(this.ctx.gl);
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
      // Face position is in 0-100 range
      const faceX = options.facePosition.x / 100;
      const faceY = options.facePosition.y / 100;

      // Calculate target scale (zoom)
      // Use the slider value directly (1.0 to 10.0)
      // Default to 1.2x if not set, to provide some framing capability
      targetScale = options.zoomSensitivity ?? 1.2;

      // Calculate target offset to center the face
      // We want the face (faceX, faceY) to be at the center (0.5, 0.5)
      // The offset is added to UVs.
      // UV_new = (UV_old - 0.5)/scale + 0.5 + offset
      // If we want UV_new = 0.5 (center of screen) to map to UV_old = faceX (center of face)
      // 0.5 = (faceX - 0.5)/scale + 0.5 + offset
      // 0 = (faceX - 0.5)/scale + offset
      // offset = -(faceX - 0.5)/scale
      // Wait, let's verify.
      // If scale=1, offset = -(faceX - 0.5) = 0.5 - faceX.
      // If faceX=0.8 (right), offset = -0.3.
      // UV_new = UV_old + (-0.3).
      // If UV_old = 0.8 (face), UV_new = 0.5 (center). Correct.

      // However, we need to clamp the offset so we don't show black bars (out of bounds).
      // The visible UV range is [0.5 - 0.5/scale, 0.5 + 0.5/scale].
      // The center of the visible window in UV space is 0.5 - offset*scale? No.
      // Let's stick to the shader logic: v_uv = (a_uv - 0.5) / scale + 0.5 + u_offset;
      // We want the center of the screen (a_uv=0.5) to map to the face (v_uv=faceX).
      // faceX = (0.5 - 0.5)/scale + 0.5 + u_offset => faceX = 0.5 + u_offset => u_offset = faceX - 0.5.

      // Wait, my previous derivation was: v_uv = (a_uv - 0.5) / scale + 0.5 + u_offset
      // Here v_uv is the texture coordinate sampled.
      // If we want to sample the face at the center of the screen:
      // At screen center (a_uv = 0.5), we want v_uv to be faceX.
      // faceX = (0.5 - 0.5)/scale + 0.5 + u_offset
      // faceX = 0.5 + u_offset
      // u_offset = faceX - 0.5

      // Let's test: faceX = 0.8 (right). u_offset = 0.3.
      // At screen center (0.5), v_uv = 0.5 + 0.3 = 0.8. Correct.

      targetOffset = [faceX - 0.5, faceY - 0.5];

      // Clamp offset to keep texture within bounds [0, 1]
      // Visible range size in UV space is 1/scale.
      // We need center (0.5 + offset) to be within [0.5/scale, 1 - 0.5/scale]
      // 0.5 + offset >= 0.5/scale  => offset >= 0.5/scale - 0.5
      // 0.5 + offset <= 1 - 0.5/scale => offset <= 0.5 - 0.5/scale

      const maxOffset = 0.5 - 0.5 / targetScale;
      targetOffset[0] = Math.max(-maxOffset, Math.min(maxOffset, targetOffset[0]));
      targetOffset[1] = Math.max(-maxOffset, Math.min(maxOffset, targetOffset[1]));
    }

    // Smooth interpolation
    const speed = (options.trackingSpeed || 0.1) * 0.5; // Adjust speed factor
    // Use a simple lerp
    this.currentScale += (targetScale - this.currentScale) * speed;
    this.currentOffset[0] += (targetOffset[0] - this.currentOffset[0]) * speed;
    this.currentOffset[1] += (targetOffset[1] - this.currentOffset[1]) * speed;

    // Pass uniforms
    this.shaderManager.setUniform1f("u_scale", this.currentScale);
    this.shaderManager.setUniform2fv("u_offset", this.currentOffset);


    if (
      options.backgroundEffect &&
      options.backgroundEffect !== "none" &&
      options.processedCanvas
    ) {
      this.shaderManager.activate("composite");
      this.maskTexture.update(options.processedCanvas);

      // Handle Image Background
      if (options.backgroundEffect === "image" && options.backgroundImage) {
        this.bgTexture.update(options.backgroundImage);
        this.shaderManager.setUniform1i("u_bg_image", 2); // Bind to unit 2
        this.bgTexture.bind(2);
      }

      this.shaderManager.setUniform1i("u_video", 0);
      this.shaderManager.setUniform1i("u_mask", 1);
      this.shaderManager.setUniform1i(
        "u_bg_type",
        options.backgroundEffect === "blur" ? 1 : 2
      );
      // Ensure uniforms are set for composite shader too
      this.shaderManager.setUniform1f("u_scale", this.currentScale);
      this.shaderManager.setUniform2fv("u_offset", this.currentOffset);

      this.videoTexture.bind(0);
      this.maskTexture.bind(1);
    } else if (
      options.activeInteractiveFilter &&
      options.activeInteractiveFilter !== "none"
    ) {
      // ... (Rest of existing filter logic) ...
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
        else if (
          options.activeInteractiveFilter === "infrared" ||
          options.activeInteractiveFilter === "infrared-fx"
        )
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

      // Ensure uniforms are set for effects shader too
      this.shaderManager.setUniform1f("u_scale", this.currentScale);
      this.shaderManager.setUniform2fv("u_offset", this.currentOffset);

      this.videoTexture.bind(0);
    } else {
      this.shaderManager.activate("basic");
      const filters = parseFilterString(options.videoFilter || "");
      this.shaderManager.setUniform1i("u_video", 0);
      this.shaderManager.setUniform1f("u_brightness", filters.brightness);
      this.shaderManager.setUniform1f("u_contrast", filters.contrast);
      this.shaderManager.setUniform1f("u_saturation", filters.saturation);

      // Ensure uniforms are set for basic shader too
      this.shaderManager.setUniform1f("u_scale", this.currentScale);
      this.shaderManager.setUniform2fv("u_offset", this.currentOffset);

      this.videoTexture.bind(0);
    }

    this.ctx.drawQuad();
  }

  destroy() {
    this.videoTexture.destroy();
    this.maskTexture.destroy();
    this.bgTexture.destroy(); // CLEANUP
  }
}
