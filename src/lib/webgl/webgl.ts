// src/lib/webgl/GLContext.ts

export class GLContext {
  gl: WebGL2RenderingContext;
  canvas: HTMLCanvasElement;
  private quadVao: WebGLVertexArrayObject | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const gl = canvas.getContext("webgl2", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: false, // Turn off for performance in video
      preserveDrawingBuffer: false,
    });

    if (!gl) {
      throw new Error("WebGL2 not supported");
    }

    this.gl = gl;
    this.initQuad();
  }

  // Set the viewport to match canvas size
  resize() {
    const { width, height } = this.canvas;
    this.gl.viewport(0, 0, width, height);
  }

  // Create a standard full-screen quad (2 triangles)
  private initQuad() {
    const { gl } = this;

    // x, y positions (clip space -1 to 1) + u, v texture coords (0 to 1)
    // We flip Y on texture coords to match WebGL convention if needed,
    // or we handle it in shader. Standard: bottom-left is 0,0
    const vertices = new Float32Array([
      // X, Y,   U, V
      -1, -1, 0, 1, 1, -1, 1, 1, -1, 1, 0, 0, -1, 1, 0, 0, 1, -1, 1, 1, 1, 1, 1,
      0,
    ]);

    this.quadVao = gl.createVertexArray();
    gl.bindVertexArray(this.quadVao);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // Attribute 0: Position (2 floats)
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 16, 0);

    // Attribute 1: UV (2 floats)
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 16, 8);

    gl.bindVertexArray(null);
  }

  drawQuad() {
    const { gl } = this;
    gl.bindVertexArray(this.quadVao);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.bindVertexArray(null);
  }

  createShader(type: number, source: string): WebGLShader {
    const { gl } = this;
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(`Shader compile error: ${info}`);
    }
    return shader;
  }

  createProgram(vertSource: string, fragSource: string): WebGLProgram {
    const { gl } = this;
    const vert = this.createShader(gl.VERTEX_SHADER, vertSource);
    const frag = this.createShader(gl.FRAGMENT_SHADER, fragSource);
    const program = gl.createProgram()!;

    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error(`Program link error: ${info}`);
    }

    return program;
  }

  clear() {
    const { gl } = this;
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }
}
