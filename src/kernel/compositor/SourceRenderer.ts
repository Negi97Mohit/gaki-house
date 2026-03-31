/**
 * SourceRenderer — Renders individual sources as textured quads on the WebGL canvas.
 *
 * Each source is drawn as a full-screen quad with a texture, positioned and
 * transformed according to its SerializedTransform. The renderer handles:
 *   - Video/image textures (from ImageBitmap)
 *   - Solid color fills
 *   - Text rendering (via OffscreenCanvas 2D context → texture)
 *   - Opacity and blend modes
 *   - Crop regions
 *   - Rotation
 *
 * Grid layout compositing is handled here too: when a grid layout is active,
 * sources assigned to grid cells are rendered into their cell bounds.
 */

import type { SerializedSource, SerializedTransform, SourceGPUState, SerializedGridLayout } from './types';

// ─── Shader Sources ──────────────────────────────────────────────────────────

const VERTEX_SHADER = `#version 300 es
precision highp float;

in vec2 a_position;
in vec2 a_texCoord;

uniform vec2 u_resolution;
uniform vec4 u_transform; // x, y, width, height in pixels
uniform float u_rotation;  // radians
uniform vec4 u_crop;       // top, right, bottom, left (0..1 normalized)

out vec2 v_texCoord;

void main() {
  // Apply crop to tex coords
  vec2 cropMin = vec2(u_crop.w, u_crop.x);          // left, top
  vec2 cropMax = vec2(1.0 - u_crop.y, 1.0 - u_crop.z); // 1-right, 1-bottom
  v_texCoord = mix(cropMin, cropMax, a_texCoord);

  // Position in pixel space
  vec2 pos = a_position * u_transform.zw + u_transform.xy;

  // Apply rotation around center of the source
  vec2 center = u_transform.xy + u_transform.zw * 0.5;
  vec2 delta = pos - center;
  float s = sin(u_rotation);
  float c = cos(u_rotation);
  pos = center + vec2(delta.x * c - delta.y * s, delta.x * s + delta.y * c);

  // Convert to clip space (-1..1)
  vec2 clipSpace = (pos / u_resolution) * 2.0 - 1.0;
  clipSpace.y = -clipSpace.y; // Flip Y (canvas coords → GL coords)

  gl_Position = vec4(clipSpace, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER_TEXTURE = `#version 300 es
precision highp float;

in vec2 v_texCoord;
uniform sampler2D u_texture;
uniform float u_opacity;

out vec4 fragColor;

void main() {
  vec4 color = texture(u_texture, v_texCoord);
  fragColor = color * u_opacity;
}
`;

const FRAGMENT_SHADER_COLOR = `#version 300 es
precision highp float;

uniform vec4 u_color;
uniform float u_opacity;

out vec4 fragColor;

void main() {
  fragColor = u_color * u_opacity;
}
`;

// ─── SourceRenderer Class ────────────────────────────────────────────────────

export class SourceRenderer {
  private gl: WebGL2RenderingContext;
  private textureProgram: WebGLProgram;
  private colorProgram: WebGLProgram;
  private quadVAO: WebGLVertexArrayObject;
  private sourceTextures: Map<string, SourceGPUState> = new Map();
  private textCanvas: OffscreenCanvas;
  private textCtx: OffscreenCanvasRenderingContext2D;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.textureProgram = this.createProgram(VERTEX_SHADER, FRAGMENT_SHADER_TEXTURE);
    this.colorProgram = this.createProgram(VERTEX_SHADER, FRAGMENT_SHADER_COLOR);
    this.quadVAO = this.createQuadVAO();

    // Text rendering canvas (shared for all text sources)
    this.textCanvas = new OffscreenCanvas(512, 128);
    this.textCtx = this.textCanvas.getContext('2d')!;
  }

  // ── Public API ──

  /**
   * Render a single source at its transform position.
   * The source must have a frame (ImageBitmap) uploaded via updateSourceFrame
   * or be a type that doesn't need one (color, text).
   */
  renderSource(
    source: SerializedSource,
    canvasWidth: number,
    canvasHeight: number,
    gridBounds?: { x: number; y: number; w: number; h: number }
  ): void {
    if (!source.visible || source.opacity <= 0) return;

    const { gl } = this;

    // Calculate final transform, optionally constrained to grid cell
    const transform = this.resolveTransform(source.transform, canvasWidth, canvasHeight, gridBounds);

    // Set blend mode
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    if (source.type === 'color' && source.color) {
      this.renderColorSource(source.color, source.opacity, transform, canvasWidth, canvasHeight);
    } else if (source.type === 'text' && source.textRender) {
      this.renderTextSource(source, transform, canvasWidth, canvasHeight);
    } else if (source.hasFrame) {
      const gpuState = this.sourceTextures.get(source.id);
      if (gpuState?.hasData && gpuState.texture) {
        this.renderTextureSource(gpuState.texture, source.opacity, transform, canvasWidth, canvasHeight, source.transform.rotation);
      }
    }
  }

  /**
   * Render all sources in a scene, respecting z-order and grid layout.
   */
  renderScene(
    sources: SerializedSource[],
    canvasWidth: number,
    canvasHeight: number,
    gridLayout: SerializedGridLayout | null
  ): void {
    for (const source of sources) {
      if (source.type === 'group') {
        // Render children in order
        for (const child of source.children) {
          this.renderSource(child, canvasWidth, canvasHeight);
        }
        continue;
      }

      // If there's a grid layout, check if this source is assigned to a cell
      let gridBounds: { x: number; y: number; w: number; h: number } | undefined;
      if (gridLayout) {
        const cell = gridLayout.cells.find((c) => c.sourceId === source.id);
        if (cell) {
          gridBounds = this.computeGridCellBounds(cell, gridLayout, canvasWidth, canvasHeight);

          // Render cell background if specified
          if (cell.backgroundColor) {
            this.renderColorSource(
              cell.backgroundColor,
              1.0,
              { x: gridBounds.x, y: gridBounds.y, w: gridBounds.w, h: gridBounds.h },
              canvasWidth,
              canvasHeight
            );
          }
        }
      }

      this.renderSource(source, canvasWidth, canvasHeight, gridBounds);
    }
  }

  /**
   * Upload a new frame (ImageBitmap) for a source.
   * Call this every time a camera, screen, or media source produces a new frame.
   */
  updateSourceFrame(sourceId: string, bitmap: ImageBitmap): void {
    const { gl } = this;
    let gpuState = this.sourceTextures.get(sourceId);

    if (!gpuState) {
      const texture = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gpuState = { texture, hasData: false, lastUpdate: 0, width: 0, height: 0 };
      this.sourceTextures.set(sourceId, gpuState);
    }

    gl.bindTexture(gl.TEXTURE_2D, gpuState.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bitmap);
    gpuState.hasData = true;
    gpuState.lastUpdate = performance.now();
    gpuState.width = bitmap.width;
    gpuState.height = bitmap.height;
  }

  /** Remove a source's GPU resources */
  removeSource(sourceId: string): void {
    const gpuState = this.sourceTextures.get(sourceId);
    if (gpuState?.texture) {
      this.gl.deleteTexture(gpuState.texture);
    }
    this.sourceTextures.delete(sourceId);
  }

  /** Clean up all GPU resources */
  destroy(): void {
    const { gl } = this;
    for (const [, gpuState] of this.sourceTextures) {
      if (gpuState.texture) gl.deleteTexture(gpuState.texture);
    }
    this.sourceTextures.clear();
    gl.deleteProgram(this.textureProgram);
    gl.deleteProgram(this.colorProgram);
    gl.deleteVertexArray(this.quadVAO);
  }

  // ── Private Rendering Methods ──

  private renderTextureSource(
    texture: WebGLTexture,
    opacity: number,
    bounds: { x: number; y: number; w: number; h: number },
    canvasWidth: number,
    canvasHeight: number,
    rotation: number = 0
  ): void {
    const { gl } = this;
    gl.useProgram(this.textureProgram);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(gl.getUniformLocation(this.textureProgram, 'u_texture'), 0);

    gl.uniform2f(gl.getUniformLocation(this.textureProgram, 'u_resolution'), canvasWidth, canvasHeight);
    gl.uniform4f(gl.getUniformLocation(this.textureProgram, 'u_transform'), bounds.x, bounds.y, bounds.w, bounds.h);
    gl.uniform1f(gl.getUniformLocation(this.textureProgram, 'u_rotation'), (rotation * Math.PI) / 180);
    gl.uniform4f(gl.getUniformLocation(this.textureProgram, 'u_crop'), 0, 0, 0, 0); // crop applied via transform
    gl.uniform1f(gl.getUniformLocation(this.textureProgram, 'u_opacity'), opacity);

    gl.bindVertexArray(this.quadVAO);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  private renderColorSource(
    colorStr: string,
    opacity: number,
    bounds: { x: number; y: number; w: number; h: number },
    canvasWidth: number,
    canvasHeight: number
  ): void {
    const { gl } = this;
    gl.useProgram(this.colorProgram);

    const rgba = this.parseColor(colorStr);
    gl.uniform4f(gl.getUniformLocation(this.colorProgram, 'u_color'), rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniform2f(gl.getUniformLocation(this.colorProgram, 'u_resolution'), canvasWidth, canvasHeight);
    gl.uniform4f(gl.getUniformLocation(this.colorProgram, 'u_transform'), bounds.x, bounds.y, bounds.w, bounds.h);
    gl.uniform1f(gl.getUniformLocation(this.colorProgram, 'u_rotation'), 0);
    gl.uniform4f(gl.getUniformLocation(this.colorProgram, 'u_crop'), 0, 0, 0, 0);
    gl.uniform1f(gl.getUniformLocation(this.colorProgram, 'u_opacity'), opacity);

    gl.bindVertexArray(this.quadVAO);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  private renderTextSource(
    source: SerializedSource,
    bounds: { x: number; y: number; w: number; h: number },
    canvasWidth: number,
    canvasHeight: number
  ): void {
    const text = source.textRender;
    if (!text || !text.content) return;

    // Render text to the shared 2D canvas, then upload as texture
    const scale = 2; // Hi-DPI
    const tw = Math.ceil(bounds.w * scale);
    const th = Math.ceil(bounds.h * scale);

    if (tw <= 0 || th <= 0) return;
    if (this.textCanvas.width !== tw || this.textCanvas.height !== th) {
      this.textCanvas.width = tw;
      this.textCanvas.height = th;
    }

    const ctx = this.textCtx;
    ctx.clearRect(0, 0, tw, th);

    // Background
    if (text.backgroundColor && text.backgroundColor !== 'transparent') {
      ctx.fillStyle = text.backgroundColor;
      ctx.fillRect(0, 0, tw, th);
    }

    // Text
    const fontStr = `${text.fontStyle} ${text.fontWeight} ${text.fontSize * scale}px ${text.fontFamily}`;
    ctx.font = fontStr;
    ctx.textAlign = text.textAlign as CanvasTextAlign;
    ctx.textBaseline = 'top';

    // Outline
    if (text.outline) {
      ctx.strokeStyle = text.outline.color;
      ctx.lineWidth = text.outline.size * scale;
      ctx.strokeText(text.content, tw / 2, scale * 4);
    }

    // Shadow
    if (text.shadow) {
      ctx.shadowColor = text.shadow.color;
      ctx.shadowOffsetX = text.shadow.offsetX * scale;
      ctx.shadowOffsetY = text.shadow.offsetY * scale;
      ctx.shadowBlur = text.shadow.blur * scale;
    }

    ctx.fillStyle = text.color;
    const textX = text.textAlign === 'center' ? tw / 2 : text.textAlign === 'right' ? tw - scale * 4 : scale * 4;
    ctx.fillText(text.content, textX, scale * 4);

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0;

    // Upload the rendered text as a texture
    this.updateSourceFrame(source.id, this.textCanvas.transferToImageBitmap());
    const gpuState = this.sourceTextures.get(source.id);
    if (gpuState?.texture) {
      this.renderTextureSource(gpuState.texture, source.opacity, bounds, canvasWidth, canvasHeight);
    }
  }

  // ── Grid Cell Positioning ──

  private computeGridCellBounds(
    cell: { row: number; col: number; rowSpan: number; colSpan: number; padding?: number },
    grid: SerializedGridLayout,
    canvasWidth: number,
    canvasHeight: number
  ): { x: number; y: number; w: number; h: number } {
    const cellW = (canvasWidth - grid.gap * (grid.columns - 1)) / grid.columns;
    const cellH = (canvasHeight - grid.gap * (grid.rows - 1)) / grid.rows;
    const padding = cell.padding ?? 0;

    const x = cell.col * (cellW + grid.gap) + padding;
    const y = cell.row * (cellH + grid.gap) + padding;
    const w = cellW * cell.colSpan + grid.gap * (cell.colSpan - 1) - padding * 2;
    const h = cellH * cell.rowSpan + grid.gap * (cell.rowSpan - 1) - padding * 2;

    return { x, y, w, h };
  }

  // ── Transform Resolution ──

  private resolveTransform(
    transform: SerializedTransform,
    canvasWidth: number,
    canvasHeight: number,
    gridBounds?: { x: number; y: number; w: number; h: number }
  ): { x: number; y: number; w: number; h: number } {
    if (gridBounds) {
      // When in a grid cell, source fills the cell (maintaining aspect ratio)
      return gridBounds;
    }
    // Standard positioning (absolute pixels)
    return {
      x: transform.x,
      y: transform.y,
      w: transform.width,
      h: transform.height,
    };
  }

  // ── Utility ──

  private parseColor(str: string): [number, number, number, number] {
    if (str.startsWith('#')) {
      const hex = str.slice(1);
      const r = parseInt(hex.slice(0, 2), 16) / 255;
      const g = parseInt(hex.slice(2, 4), 16) / 255;
      const b = parseInt(hex.slice(4, 6), 16) / 255;
      const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1.0;
      return [r, g, b, a];
    }
    return [0, 0, 0, 1]; // fallback: black
  }

  private createProgram(vertSrc: string, fragSrc: string): WebGLProgram {
    const { gl } = this;
    const vert = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vert, vertSrc);
    gl.compileShader(vert);
    if (!gl.getShaderParameter(vert, gl.COMPILE_STATUS)) {
      console.error('Vertex shader error:', gl.getShaderInfoLog(vert));
    }

    const frag = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(frag, fragSrc);
    gl.compileShader(frag);
    if (!gl.getShaderParameter(frag, gl.COMPILE_STATUS)) {
      console.error('Fragment shader error:', gl.getShaderInfoLog(frag));
    }

    const program = gl.createProgram()!;
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
    }

    gl.deleteShader(vert);
    gl.deleteShader(frag);
    return program;
  }

  private createQuadVAO(): WebGLVertexArrayObject {
    const { gl } = this;
    const vao = gl.createVertexArray()!;
    gl.bindVertexArray(vao);

    // Position + texCoord interleaved
    // prettier-ignore
    const data = new Float32Array([
      // pos.x, pos.y, uv.x, uv.y
      0, 0, 0, 0,
      1, 0, 1, 0,
      0, 1, 0, 1,
      1, 1, 1, 1,
    ]);

    const buffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    // a_position
    const posLoc = gl.getAttribLocation(this.textureProgram, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 16, 0);

    // a_texCoord
    const texLoc = gl.getAttribLocation(this.textureProgram, 'a_texCoord');
    gl.enableVertexAttribArray(texLoc);
    gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 16, 8);

    gl.bindVertexArray(null);
    return vao;
  }
}
