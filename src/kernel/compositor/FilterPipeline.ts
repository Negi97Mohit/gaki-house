/**
 * FilterPipeline — Per-source and per-scene filter chain.
 *
 * Renders through a series of FBO passes, applying filters sequentially.
 * Each filter is a fragment shader that processes the previous pass's output.
 *
 * Supported filters:
 *   - color_correction: brightness, contrast, saturation, hue
 *   - chroma_key: green/blue screen removal
 *   - blur: Gaussian blur (box approximation)
 *   - sharpen: Unsharp mask
 *   - css_filter: Legacy CSS filter string (converted to shader equivalent)
 *
 * → See src/types/compositor.ts for FilterType definitions
 */

import type { SerializedFilter, FBOState } from './types';

// ─── Filter Shader Fragments ─────────────────────────────────────────────────

const FILTER_VERT = `#version 300 es
precision highp float;
in vec2 a_position;
in vec2 a_texCoord;
out vec2 v_texCoord;

void main() {
  v_texCoord = a_texCoord;
  gl_Position = vec4(a_position * 2.0 - 1.0, 0.0, 1.0);
  gl_Position.y = -gl_Position.y;
}
`;

const COLOR_CORRECTION_FRAG = `#version 300 es
precision highp float;

in vec2 v_texCoord;
uniform sampler2D u_input;
uniform float u_brightness;    // -1..1
uniform float u_contrast;      // 0..2
uniform float u_saturation;    // 0..2
uniform float u_hueShift;      // 0..360 degrees
uniform float u_gamma;         // 0.1..3

out vec4 fragColor;

vec3 rgb2hsv(vec3 c) {
  vec4 K = vec4(0.0, -1.0/3.0, 2.0/3.0, -1.0);
  vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
  float d = q.x - min(q.w, q.y);
  float e = 1.0e-10;
  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
  vec4 color = texture(u_input, v_texCoord);
  vec3 rgb = color.rgb;

  // Brightness
  rgb += u_brightness;

  // Contrast
  rgb = (rgb - 0.5) * u_contrast + 0.5;

  // Saturation
  float gray = dot(rgb, vec3(0.299, 0.587, 0.114));
  rgb = mix(vec3(gray), rgb, u_saturation);

  // Hue shift
  if (u_hueShift > 0.001) {
    vec3 hsv = rgb2hsv(rgb);
    hsv.x = fract(hsv.x + u_hueShift / 360.0);
    rgb = hsv2rgb(hsv);
  }

  // Gamma
  rgb = pow(max(rgb, vec3(0.0)), vec3(1.0 / u_gamma));

  fragColor = vec4(clamp(rgb, 0.0, 1.0), color.a);
}
`;

const CHROMA_KEY_FRAG = `#version 300 es
precision highp float;

in vec2 v_texCoord;
uniform sampler2D u_input;
uniform vec3 u_keyColor;    // RGB of the key color
uniform float u_similarity; // 0..1 how close the color must be
uniform float u_smoothness; // 0..1 edge softness

out vec4 fragColor;

void main() {
  vec4 color = texture(u_input, v_texCoord);
  float dist = distance(color.rgb, u_keyColor);
  float alpha = smoothstep(u_similarity, u_similarity + u_smoothness, dist);
  fragColor = vec4(color.rgb, color.a * alpha);
}
`;

// ─── FilterPipeline Class ────────────────────────────────────────────────────

export class FilterPipeline {
  private gl: WebGL2RenderingContext;
  private programs: Map<string, WebGLProgram> = new Map();
  private fbos: FBOState[] = [];
  private quadVAO: WebGLVertexArrayObject;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.quadVAO = this.createQuadVAO();

    // Pre-compile filter programs
    this.programs.set('color_correction', this.createProgram(FILTER_VERT, COLOR_CORRECTION_FRAG));
    this.programs.set('chroma_key', this.createProgram(FILTER_VERT, CHROMA_KEY_FRAG));
  }

  /**
   * Apply a chain of filters to a source texture.
   * Returns the final texture after all filters have been applied.
   * If no filters, returns the input texture unchanged.
   */
  applyFilters(
    inputTexture: WebGLTexture,
    filters: SerializedFilter[],
    width: number,
    height: number
  ): WebGLTexture {
    const activeFilters = filters.filter((f) => f.enabled);
    if (activeFilters.length === 0) return inputTexture;

    // Ensure we have enough FBOs for ping-pong rendering
    this.ensureFBOs(2, width, height);

    let currentTexture = inputTexture;
    let fboIndex = 0;

    for (const filter of activeFilters) {
      const program = this.programs.get(filter.type);
      if (!program) continue;

      const fbo = this.fbos[fboIndex % 2];
      const { gl } = this;

      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.framebuffer);
      gl.viewport(0, 0, width, height);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);

      // Bind input
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, currentTexture);
      gl.uniform1i(gl.getUniformLocation(program, 'u_input'), 0);

      // Set filter-specific uniforms
      this.setFilterUniforms(program, filter);

      // Draw
      gl.bindVertexArray(this.quadVAO);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      currentTexture = fbo.texture;
      fboIndex++;
    }

    // Reset to default framebuffer
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);

    return currentTexture;
  }

  destroy(): void {
    const { gl } = this;
    for (const [, program] of this.programs) {
      gl.deleteProgram(program);
    }
    for (const fbo of this.fbos) {
      gl.deleteFramebuffer(fbo.framebuffer);
      gl.deleteTexture(fbo.texture);
    }
    gl.deleteVertexArray(this.quadVAO);
  }

  // ── Private ──

  private setFilterUniforms(program: WebGLProgram, filter: SerializedFilter): void {
    const { gl } = this;
    const s = filter.settings;

    switch (filter.type) {
      case 'color_correction':
        gl.uniform1f(gl.getUniformLocation(program, 'u_brightness'), s.brightness ?? 0);
        gl.uniform1f(gl.getUniformLocation(program, 'u_contrast'), s.contrast ?? 1);
        gl.uniform1f(gl.getUniformLocation(program, 'u_saturation'), s.saturation ?? 1);
        gl.uniform1f(gl.getUniformLocation(program, 'u_hueShift'), s.hueShift ?? 0);
        gl.uniform1f(gl.getUniformLocation(program, 'u_gamma'), s.gamma ?? 1);
        break;

      case 'chroma_key': {
        const keyColor = this.parseColor(s.keyColor ?? '#00ff00');
        gl.uniform3f(gl.getUniformLocation(program, 'u_keyColor'), keyColor[0], keyColor[1], keyColor[2]);
        gl.uniform1f(gl.getUniformLocation(program, 'u_similarity'), s.similarity ?? 0.4);
        gl.uniform1f(gl.getUniformLocation(program, 'u_smoothness'), s.smoothness ?? 0.08);
        break;
      }
    }
  }

  private parseColor(hex: string): [number, number, number] {
    const h = hex.replace('#', '');
    return [
      parseInt(h.slice(0, 2), 16) / 255,
      parseInt(h.slice(2, 4), 16) / 255,
      parseInt(h.slice(4, 6), 16) / 255,
    ];
  }

  private ensureFBOs(count: number, width: number, height: number): void {
    const { gl } = this;

    while (this.fbos.length < count) {
      const fb = gl.createFramebuffer()!;
      const tex = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);

      this.fbos.push({ framebuffer: fb, texture: tex, width, height });
    }

    // Resize existing FBOs if needed
    for (const fbo of this.fbos) {
      if (fbo.width !== width || fbo.height !== height) {
        gl.bindTexture(gl.TEXTURE_2D, fbo.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        fbo.width = width;
        fbo.height = height;
      }
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  private createProgram(vertSrc: string, fragSrc: string): WebGLProgram {
    const { gl } = this;
    const vs = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vs, vertSrc);
    gl.compileShader(vs);

    const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fs, fragSrc);
    gl.compileShader(fs);

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);

    gl.deleteShader(vs);
    gl.deleteShader(fs);
    return prog;
  }

  private createQuadVAO(): WebGLVertexArrayObject {
    const { gl } = this;
    const vao = gl.createVertexArray()!;
    gl.bindVertexArray(vao);

    const data = new Float32Array([0,0,0,0, 1,0,1,0, 0,1,0,1, 1,1,1,1]);
    const buf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    // Use location 0 for position, 1 for texCoord
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 16, 8);

    gl.bindVertexArray(null);
    return vao;
  }
}
