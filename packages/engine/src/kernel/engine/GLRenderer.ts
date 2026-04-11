import { GLContext } from "./GLContext";
import { VideoTexture } from "./VideoTexture";
import { ShaderManager } from "./ShaderManager";
import { parseFilterString } from "./utils";
import { AnimeStyles } from "@/lib/animeStyles";
import { TimeWarpBuffer } from "./TimeWarp";

export interface RenderOptions {
  videoFilter?: string;
  activeInteractiveFilter?: string;
  filterIntensity?: number;
  filterColor?: string;
  processedCanvas?: TexImageSource | null; // Changed to TexImageSource
  // Auto-framing options
  facePosition?: { x: number; y: number; width: number; height: number } | null;
  isAutoFramingEnabled?: boolean;
  zoomSensitivity?: number;
  trackingSpeed?: number;
  isMasked?: boolean;
  filterTarget?: "both" | "background" | "person";
  cinematicEffect?: string;
}

const DEFAULT_MID_COLOR: [number, number, number] = [0.5, 0.5, 0.5];
const DEFAULT_HIGH_COLOR: [number, number, number] = [1.0, 1.0, 1.0];

const FILTER_TYPE_MAP: Record<string, number> = {
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

/** Speed multipliers for time-manipulation cinematic effects */
const TIME_WARP_SPEEDS: Record<string, number> = {
  "slow-motion": 0.5,
  "hyperlapse": 2.0,
  "timelapse": 4.0,
};

export class GLRenderer {
  ctx: GLContext;
  videoTexture: VideoTexture;
  maskTexture: VideoTexture;
  shaderManager: ShaderManager;
  startTime: number;

  private currentScale: number = 1.0;
  private currentOffset: [number, number] = [0.0, 0.0];
  private colorCache = new Map<string, [number, number, number]>();

  /** Ring buffer for time-manipulation effects */
  private timeWarp: TimeWarpBuffer | null = null;
  /** Track which effect was active last frame so we can reset on change */
  private lastTimeWarpEffect: string | null = null;

  // Constructor accepts HTMLCanvasElement OR OffscreenCanvas
  constructor(canvas: HTMLCanvasElement | OffscreenCanvas) {
    this.ctx = new GLContext(canvas);
    this.videoTexture = new VideoTexture(this.ctx.gl);
    this.maskTexture = new VideoTexture(this.ctx.gl);
    this.shaderManager = new ShaderManager(this.ctx);
    this.startTime = Date.now();
  }

  resize() {
    this.ctx.resize();
  }

  private hexToVec3(hex: string): [number, number, number] {
    if (!hex || !hex.startsWith("#")) return [1, 1, 1];
    if (this.colorCache.has(hex)) return this.colorCache.get(hex)!;

    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const result: [number, number, number] = [r, g, b];

    this.colorCache.set(hex, result);
    return result;
  }

  // Changed input to TexImageSource to support ImageBitmap from Worker
  render(source: TexImageSource, options: RenderOptions = {}) {
    const { gl } = this.ctx;

    // --- TimeWarp (slow-motion / hyperlapse) ---
    const timeSpeed = TIME_WARP_SPEEDS[options.cinematicEffect ?? ""] ?? 0;
    const isTimeWarpActive = timeSpeed > 0 && timeSpeed !== 1;

    if (isTimeWarpActive) {
      // Lazily create buffer
      if (!this.timeWarp) {
        this.timeWarp = new TimeWarpBuffer(gl as WebGL2RenderingContext, 120);
      }
      // Reset when switching between time-warp effects
      if (this.lastTimeWarpEffect !== options.cinematicEffect) {
        this.timeWarp.reset();
        this.lastTimeWarpEffect = options.cinematicEffect ?? null;
      }
      // Ensure buffer textures match canvas size
      this.timeWarp.ensureSize(this.ctx.canvas.width, this.ctx.canvas.height);
      // Push the live frame
      this.timeWarp.push(source);
      // Read back at modified speed
      const warpedTex = this.timeWarp.read(timeSpeed);
      if (warpedTex) {
        // Bind the warped texture to unit 0 (replaces live video)
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, warpedTex);
      } else {
        this.videoTexture.update(source);
      }
    } else {
      // Not a time-warp effect — reset buffer if we were using one
      if (this.lastTimeWarpEffect) {
        this.timeWarp?.reset();
        this.lastTimeWarpEffect = null;
      }
      this.videoTexture.update(source);
    }

    this.ctx.clear();

    const canvasWidth = this.ctx.canvas.width;
    const canvasHeight = this.ctx.canvas.height;

    // Handle ImageBitmap/Video dimensions safely
    const sourceWidth =
      "videoWidth" in source
        ? (source as HTMLVideoElement).videoWidth
        : (source as ImageBitmap).width || 1280;
    const sourceHeight =
      "videoHeight" in source
        ? (source as HTMLVideoElement).videoHeight
        : (source as ImageBitmap).height || 720;

    const canvasAspect = canvasWidth / canvasHeight;
    const videoAspect = sourceWidth / sourceHeight;

    let vw = canvasWidth;
    let vh = canvasHeight;

    if (canvasAspect > videoAspect) vh = vw / videoAspect;
    else vw = vh * videoAspect;

    const x = (canvasWidth - vw) / 2;
    const y = (canvasHeight - vh) / 2;
    gl.viewport(x, y, vw, vh);

    // --- Auto-Framing Logic ---
    let targetScale = 1.0;
    let targetOffset: [number, number] = [0.0, 0.0];

    if (options.isAutoFramingEnabled) {
      targetScale = options.zoomSensitivity ?? 1.2;

      if (options.facePosition) {
        const faceX = options.facePosition.x / 100;
        const faceY = options.facePosition.y / 100;
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
    }

    const speed = (options.trackingSpeed || 0.1) * 0.5;
    this.currentScale += (targetScale - this.currentScale) * speed;
    this.currentOffset[0] += (targetOffset[0] - this.currentOffset[0]) * speed;
    this.currentOffset[1] += (targetOffset[1] - this.currentOffset[1]) * speed;

    this.shaderManager.setUniform1f("u_scale", this.currentScale);
    this.shaderManager.setUniform2fv("u_offset", this.currentOffset);

    // --- Shader Logic ---
    if (options.isMasked && options.processedCanvas) {
      this.shaderManager.activate("masked");
      this.maskTexture.update(options.processedCanvas);

      this.shaderManager.setUniform1i("u_video", 0);
      this.shaderManager.setUniform1i("u_mask", 1);

      const mode =
        options.filterTarget === "background"
          ? 1
          : options.filterTarget === "person"
            ? 2
            : 0;
      this.shaderManager.setUniform1i("u_mode", mode);
      this.shaderManager.setUniform1f("u_scale", this.currentScale);
      this.shaderManager.setUniform2fv("u_offset", this.currentOffset);

      this.videoTexture.bind(0);
      this.maskTexture.bind(1);
    } else if (
      options.activeInteractiveFilter &&
      options.activeInteractiveFilter !== "none"
    ) {
      this.shaderManager.activate("effects");

      let typeId = 0;
      let uColor = this.hexToVec3(options.filterColor || "#ffffff");
      let uColorMid = DEFAULT_MID_COLOR;
      let uColorHigh = DEFAULT_HIGH_COLOR;

      if (options.activeInteractiveFilter in AnimeStyles) {
        typeId = 6;
        const style = AnimeStyles[options.activeInteractiveFilter];
        uColor = this.hexToVec3(style.shadowColor);
        uColorMid = this.hexToVec3(style.midColor);
        uColorHigh = this.hexToVec3(style.highlightColor);
      } else {
        typeId = FILTER_TYPE_MAP[options.activeInteractiveFilter] || 0;
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
    } else if (
      (options.cinematicEffect === "fisheye" ||
        options.cinematicEffect === "wide-angle" ||
        options.cinematicEffect === "ultra-wide" ||
        options.cinematicEffect === "security-fisheye")
    ) {
      this.shaderManager.activate("cinematic");

      let strength = 0.0;
      let cylindricalRatio = 1.0;

      if (options.cinematicEffect === "fisheye") strength = 0.4;
      else if (options.cinematicEffect === "security-fisheye") strength = 0.8;
      else if (options.cinematicEffect === "wide-angle") strength = 0.15;
      else if (options.cinematicEffect === "ultra-wide") strength = 0.25;

      this.shaderManager.setUniform1i("u_video", 0);
      this.shaderManager.setUniform1f("u_strength", strength);
      this.shaderManager.setUniform1f("u_cylindrical_ratio", cylindricalRatio);
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
      this.shaderManager.setUniform1f("u_scale", this.currentScale);
      this.shaderManager.setUniform2fv("u_offset", this.currentOffset);

      this.videoTexture.bind(0);
    }

    this.ctx.drawQuad();
  }

  destroy() {
    this.videoTexture.destroy();
    this.maskTexture.destroy();
    this.timeWarp?.destroy();
    this.colorCache.clear();
  }
}
