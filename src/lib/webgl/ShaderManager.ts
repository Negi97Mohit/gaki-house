// src/lib/webgl/ShaderManager.ts
import { GLContext } from "./GLContext";
import { VERTEX_SHADER_SOURCE } from "./shaders/vertex";
import { BASIC_FRAGMENT_SHADER_SOURCE } from "./shaders/basic";
import { EFFECTS_FRAGMENT_SHADER_SOURCE } from "./shaders/effects";
import { COMPOSITE_FRAGMENT_SHADER_SOURCE } from "./shaders/composite";

type ProgramInfo = {
  program: WebGLProgram;
  uniforms: Record<string, WebGLUniformLocation | null>;
};

export class ShaderManager {
  private ctx: GLContext;
  private programs: Map<string, ProgramInfo> = new Map();
  public activeProgramId: string | null = null;

  constructor(ctx: GLContext) {
    this.ctx = ctx;
    this.initShaders();
  }

  private initShaders() {
    // 1. Basic (Color correction)
    this.createProgram(
      "basic",
      VERTEX_SHADER_SOURCE,
      BASIC_FRAGMENT_SHADER_SOURCE,
      ["u_video", "u_brightness", "u_contrast", "u_saturation"]
    );

    // 2. Effects (Interactive filters)
    this.createProgram(
      "effects",
      VERTEX_SHADER_SOURCE,
      EFFECTS_FRAGMENT_SHADER_SOURCE,
      [
        "u_video",
        "u_time",
        "u_filter_type",
        "u_intensity",
        "u_color",
        "u_color_mid", // NEW
        "u_color_high", // NEW
      ]
    );

    // 3. Composite (Background removal)
    this.createProgram(
      "composite",
      VERTEX_SHADER_SOURCE,
      COMPOSITE_FRAGMENT_SHADER_SOURCE,
      ["u_video", "u_mask", "u_bg_type", "u_bg_image", "u_bg_color"]
    );
  }

  // ... (Rest of the class remains identical) ...
  createProgram(
    id: string,
    vertSource: string,
    fragSource: string,
    uniformNames: string[]
  ) {
    try {
      const program = this.ctx.createProgram(vertSource, fragSource);
      const uniforms: Record<string, WebGLUniformLocation | null> = {};

      const { gl } = this.ctx;
      uniformNames.forEach((name) => {
        uniforms[name] = gl.getUniformLocation(program, name);
      });

      this.programs.set(id, { program, uniforms });
    } catch (e) {
      console.error(`[ShaderManager] Failed to compile ${id}:`, e);
    }
  }

  activate(id: string) {
    if (this.activeProgramId === id) return;
    const info = this.programs.get(id);
    if (!info) return;
    this.ctx.gl.useProgram(info.program);
    this.activeProgramId = id;
  }

  setUniform1f(name: string, value: number) {
    const info = this.getMethodInfo();
    if (info?.uniforms[name]) this.ctx.gl.uniform1f(info.uniforms[name], value);
  }

  setUniform1i(name: string, value: number) {
    const info = this.getMethodInfo();
    if (info?.uniforms[name]) this.ctx.gl.uniform1i(info.uniforms[name], value);
  }

  setUniform3fv(name: string, value: Float32Array | number[]) {
    const info = this.getMethodInfo();
    if (info?.uniforms[name])
      this.ctx.gl.uniform3fv(info.uniforms[name], value);
  }

  private getMethodInfo() {
    return this.activeProgramId
      ? this.programs.get(this.activeProgramId)
      : null;
  }
}
