/**
 * TransitionRenderer — GPU-accelerated scene transitions.
 *
 * Renders the outgoing scene, the incoming scene, and blends them
 * according to the active transition type and progress (0..1).
 *
 * Architecture:
 *   1. Both scenes are rendered to separate FBOs (framebuffer objects)
 *   2. A transition shader samples both FBO textures
 *   3. The shader blends them based on u_progress and u_type
 *   4. The result is drawn to the output canvas
 */

import type { FBOState } from './types';

// ─── Transition Shader ───────────────────────────────────────────────────────

const TRANSITION_VERT = `#version 300 es
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

const TRANSITION_FRAG = `#version 300 es
precision highp float;

in vec2 v_texCoord;
uniform sampler2D u_fromScene;
uniform sampler2D u_toScene;
uniform sampler2D u_stingerFrame; // Added for stinger
uniform float u_progress; // 0.0 = from, 1.0 = to
uniform float u_stingerCutPoint; // 0.0 = start, 1.0 = end
uniform int u_type;       // Transition type enum

out vec4 fragColor;

void main() {
  vec4 fromColor = texture(u_fromScene, v_texCoord);
  vec4 toColor = texture(u_toScene, v_texCoord);
  float p = clamp(u_progress, 0.0, 1.0);

  if (u_type == 0) {
    // CUT — instant switch at 50%
    fragColor = p < 0.5 ? fromColor : toColor;

  } else if (u_type == 1) {
    // FADE — linear crossfade
    fragColor = mix(fromColor, toColor, p);

  } else if (u_type == 2) {
    // SLIDE LEFT — incoming slides from right
    float threshold = p;
    fragColor = v_texCoord.x < (1.0 - threshold)
      ? texture(u_fromScene, v_texCoord + vec2(threshold, 0.0))
      : texture(u_toScene, v_texCoord - vec2(1.0 - threshold, 0.0));

  } else if (u_type == 3) {
    // SLIDE RIGHT — incoming slides from left
    float threshold = p;
    fragColor = v_texCoord.x > threshold
      ? texture(u_fromScene, v_texCoord - vec2(threshold, 0.0))
      : texture(u_toScene, v_texCoord + vec2(1.0 - threshold, 0.0));

  } else if (u_type == 4) {
    // SLIDE UP — incoming slides from bottom
    float threshold = p;
    fragColor = v_texCoord.y < (1.0 - threshold)
      ? texture(u_fromScene, v_texCoord + vec2(0.0, threshold))
      : texture(u_toScene, v_texCoord - vec2(0.0, 1.0 - threshold));

  } else if (u_type == 5) {
    // SLIDE DOWN — incoming slides from top
    float threshold = p;
    fragColor = v_texCoord.y > threshold
      ? texture(u_fromScene, v_texCoord - vec2(0.0, threshold))
      : texture(u_toScene, v_texCoord + vec2(0.0, 1.0 - threshold));

  } else if (u_type == 6) {
    // WIPE LEFT — hard edge wipe
    fragColor = v_texCoord.x > p ? fromColor : toColor;

  } else if (u_type == 7) {
    // WIPE RIGHT
    fragColor = v_texCoord.x < (1.0 - p) ? fromColor : toColor;

  } else if (u_type == 8) {
    // ZOOM — outgoing zooms out, incoming fades in
    float zoomOut = 1.0 + p * 0.5;
    vec2 zoomedUV = (v_texCoord - 0.5) * zoomOut + 0.5;
    vec4 zoomedFrom = (zoomedUV.x >= 0.0 && zoomedUV.x <= 1.0 && zoomedUV.y >= 0.0 && zoomedUV.y <= 1.0)
      ? texture(u_fromScene, zoomedUV)
      : vec4(0.0);
    fragColor = mix(zoomedFrom * (1.0 - p), toColor, p);

  } else if (u_type == 9) {
    // BLUR — blur the from scene while fading (approximated with box sample)
    float blurAmount = p * 0.02;
    vec4 blurred = vec4(0.0);
    float samples = 0.0;
    for (float dx = -2.0; dx <= 2.0; dx += 1.0) {
      for (float dy = -2.0; dy <= 2.0; dy += 1.0) {
        blurred += texture(u_fromScene, v_texCoord + vec2(dx, dy) * blurAmount);
        samples += 1.0;
      }
    }
    blurred /= samples;
    fragColor = mix(blurred, toColor, p);

  } else if (u_type == 10) {
    // STINGER — play video over base scene, switch base at u_stingerCutPoint
    vec4 baseColor = p < u_stingerCutPoint ? fromColor : toColor;
    vec4 stingerColor = texture(u_stingerFrame, v_texCoord);
    // Alpha composite stinger over base
    fragColor = vec4(mix(baseColor.rgb, stingerColor.rgb, stingerColor.a), max(baseColor.a, stingerColor.a));

  } else {
    // DEFAULT: crossfade
    fragColor = mix(fromColor, toColor, p);
  }
}
`;

// ─── Type → Shader Enum Mapping ──────────────────────────────────────────────

const TRANSITION_TYPE_MAP: Record<string, number> = {
  'cut': 0,
  'fade': 1,
  'slide_left': 2,
  'slide_right': 3,
  'slide_up': 4,
  'slide_down': 5,
  'wipe_left': 6,
  'wipe_right': 7,
  'zoom': 8,
  'blur': 9,
  'stinger': 10,
};

// ─── Easing Functions ────────────────────────────────────────────────────────

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function linear(t: number): number {
  return t;
}

function getEasing(name: string): (t: number) => number {
  if (name.includes('cubic')) return easeInOutCubic;
  if (name.includes('quad')) return easeInOutQuad;
  if (name === 'linear') return linear;
  return easeInOutCubic; // default
}

// ─── TransitionRenderer Class ────────────────────────────────────────────────

export class TransitionRenderer {
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram;
  private quadVAO: WebGLVertexArrayObject;
  private fromFBO: FBOState | null = null;
  private toFBO: FBOState | null = null;

  // Transition state
  private isActive = false;
  private startTime = 0;
  private duration = 300;
  private typeEnum = 1; // fade
  private easingFn: (t: number) => number = easeInOutCubic;
  private stingerCutPoint = 0.5;
  private stingerTexture: WebGLTexture | null = null;
  private onComplete: (() => void) | null = null;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.program = this.createProgram(TRANSITION_VERT, TRANSITION_FRAG);
    this.quadVAO = this.createQuadVAO();
  }

  // ── Public API ──

  get active(): boolean {
    return this.isActive;
  }

  /**
   * Start a transition between two FBO textures.
   */
  start(
    type: string,
    duration: number,
    easing: string,
    stingerCutPoint: number = 0.5,
    onComplete: () => void
  ): void {
    this.typeEnum = TRANSITION_TYPE_MAP[type] ?? 1;
    this.duration = duration;
    this.easingFn = getEasing(easing);
    this.stingerCutPoint = stingerCutPoint;
    this.startTime = performance.now();
    this.onComplete = onComplete;
    this.isActive = true;
  }

  /** Update the stinger mask texture, if any */
  setStingerFrame(bitmap: ImageBitmap): void {
    if (!this.stingerTexture) {
      this.stingerTexture = this.gl.createTexture();
    }
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.stingerTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bitmap);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    bitmap.close();
  }

  /** Get the FBO to render the outgoing scene into */
  getFromFBO(width: number, height: number): FBOState {
    this.fromFBO = this.ensureFBO(this.fromFBO, width, height);
    return this.fromFBO;
  }

  /** Get the FBO to render the incoming scene into */
  getToFBO(width: number, height: number): FBOState {
    this.toFBO = this.ensureFBO(this.toFBO, width, height);
    return this.toFBO;
  }

  /**
   * Render the transition to the default framebuffer.
   * Returns true if the transition is still in progress.
   */
  render(): boolean {
    if (!this.isActive || !this.fromFBO || !this.toFBO) return false;

    const elapsed = performance.now() - this.startTime;
    const rawProgress = Math.min(elapsed / this.duration, 1.0);
    const progress = this.easingFn(rawProgress);

    const { gl } = this;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.useProgram(this.program);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.fromFBO.texture);
    gl.uniform1i(gl.getUniformLocation(this.program, 'u_fromScene'), 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.toFBO.texture);
    gl.uniform1i(gl.getUniformLocation(this.program, 'u_toScene'), 1);

    if (this.stingerTexture && this.typeEnum === 10) {
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, this.stingerTexture);
      gl.uniform1i(gl.getUniformLocation(this.program, 'u_stingerFrame'), 2);
    }

    gl.uniform1f(gl.getUniformLocation(this.program, 'u_progress'), progress);
    gl.uniform1f(gl.getUniformLocation(this.program, 'u_stingerCutPoint'), this.stingerCutPoint);
    gl.uniform1i(gl.getUniformLocation(this.program, 'u_type'), this.typeEnum);

    gl.bindVertexArray(this.quadVAO);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    if (rawProgress >= 1.0) {
      this.isActive = false;
      this.onComplete?.();
      this.onComplete = null;
      return false;
    }
    return true;
  }

  destroy(): void {
    const { gl } = this;
    if (this.stingerTexture) {
      gl.deleteTexture(this.stingerTexture);
      this.stingerTexture = null;
    }
    this.destroyFBO(this.fromFBO);
    this.destroyFBO(this.toFBO);
    gl.deleteProgram(this.program);
    gl.deleteVertexArray(this.quadVAO);
  }

  // ── FBO Management ──

  private ensureFBO(fbo: FBOState | null, width: number, height: number): FBOState {
    const { gl } = this;
    if (fbo && fbo.width === width && fbo.height === height) return fbo;

    // Destroy old
    if (fbo) this.destroyFBO(fbo);

    const framebuffer = gl.createFramebuffer()!;
    const texture = gl.createTexture()!;

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return { framebuffer, texture, width, height };
  }

  private destroyFBO(fbo: FBOState | null): void {
    if (!fbo) return;
    this.gl.deleteFramebuffer(fbo.framebuffer);
    this.gl.deleteTexture(fbo.texture);
  }

  // ── Shader & Quad Creation ──

  private createProgram(vertSrc: string, fragSrc: string): WebGLProgram {
    const { gl } = this;
    const vert = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vert, vertSrc);
    gl.compileShader(vert);

    const frag = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(frag, fragSrc);
    gl.compileShader(frag);

    const program = gl.createProgram()!;
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);

    gl.deleteShader(vert);
    gl.deleteShader(frag);
    return program;
  }

  private createQuadVAO(): WebGLVertexArrayObject {
    const { gl } = this;
    const vao = gl.createVertexArray()!;
    gl.bindVertexArray(vao);

    // prettier-ignore
    const data = new Float32Array([
      0, 0, 0, 0,
      1, 0, 1, 0,
      0, 1, 0, 1,
      1, 1, 1, 1,
    ]);

    const buf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(this.program, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 16, 0);

    const texLoc = gl.getAttribLocation(this.program, 'a_texCoord');
    gl.enableVertexAttribArray(texLoc);
    gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 16, 8);

    gl.bindVertexArray(null);
    return vao;
  }
}
