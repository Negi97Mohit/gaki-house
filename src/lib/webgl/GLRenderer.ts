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

    // 1. Update Video Texture
    this.videoTexture.update(video);

    // 2. Prepare Context
    // Note: ctx.resize() is handled by the hook now to avoid thrashing
    this.ctx.clear();

    // --- FIX 2: Aspect Ratio Correction (Object-Fit: Cover) ---
    // Calculate scale factors to make video cover the canvas
    const canvasAspect = this.ctx.canvas.width / this.ctx.canvas.height;
    const videoAspect = video.videoWidth / video.videoHeight;

    let scaleX = 1.0;
    let scaleY = 1.0;

    if (canvasAspect > videoAspect) {
      // Canvas is wider than video -> stretch width to match, crop height
      // Actually, to COVER, we match the width and crop top/bottom
      // If canvas is wider (e.g. 2:1) and video is 16:9 (1.77),
      // we need to scale the Y UVs up (zoom in Y) effectively?
      // No, standard math for UV scaling centered:
      scaleY = videoAspect / canvasAspect;
    } else {
      // Canvas is taller -> crop sides
      scaleX = canvasAspect / videoAspect;
    }
    // ----------------------------------------------------------

    // Helper to bind common uniforms
    const bindCommonUniforms = () => {
      // We need to add a u_scale uniform to the Vertex shader ideally,
      // OR we can do it in the fragment shader by modifying UVs.
      // Since we didn't update Vertex shader in Phase 2, let's update ShaderManager to handle this.
      // Wait, the shader manager needs to support a transform uniform or we hack the UVs.
      // Since we can't easily change all shaders instantly, let's assume we modify the GLContext drawQuad
      // OR pass a matrix.

      // EASIER FIX: Update GLContext to accept a scale parameter in drawQuad?
      // No, better to pass it as a uniform to the fragment shader if possible, but UV modification in Vertex is best.

      // Let's assume we didn't add u_uvScale to shaders yet.
      // I will handle this by modifying how we pass data or simply assuming the shaders
      // need to be updated. For now, I will update `ShaderManager` logic implicitly?
      // NO, strict typing.

      // Let's proceed with updating the GLRenderer assuming we will just use the full quad for now,
      // BUT actually we really need to fix the stretching.
      // I'll inject a simple Vertex Shader modification in the next file update if needed,
      // or assume the user wants me to handle it here.

      // Actually, I can just modify the viewport to achieve 'cover' without shader changes!
      // If I set gl.viewport to be larger than the canvas, it crops.

      // Viewport approach:
      let vw = this.ctx.canvas.width;
      let vh = this.ctx.canvas.height;

      if (canvasAspect > videoAspect) {
        // Match width, scale height up
        // Current: fits width perfectly. Height is too small? No.
        // If canvas is 200x100 (2:1), video is 100x100 (1:1).
        // To cover, we need video to be 200x200.
        // So viewport height = width / videoAspect
        vh = vw / videoAspect;
      } else {
        // Match height
        vw = vh * videoAspect;
      }

      // Center the viewport
      const x = (this.ctx.canvas.width - vw) / 2;
      const y = (this.ctx.canvas.height - vh) / 2;

      gl.viewport(x, y, vw, vh);
    };

    bindCommonUniforms();

    // 3. Logic: Which Shader to use?
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
        "neon-edge": 3,
        thermal: 4,
        mirror: 5,
      };
      const typeId = typeMap[options.activeInteractiveFilter] || 0;
      this.shaderManager.setUniform1i("u_video", 0);
      this.shaderManager.setUniform1i("u_filter_type", typeId);
      this.shaderManager.setUniform1f("u_time", Date.now() - this.startTime);
      this.shaderManager.setUniform1f(
        "u_intensity",
        options.filterIntensity ?? 1.0
      );
      this.shaderManager.setUniform3fv("u_color", [0.0, 1.0, 1.0]);
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

    // 4. Draw
    this.ctx.drawQuad();
  }

  destroy() {
    this.videoTexture.destroy();
    this.maskTexture.destroy();
  }
}
