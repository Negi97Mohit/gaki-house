/// <reference lib="webworker" />

let gl: WebGL2RenderingContext | WebGLRenderingContext | null = null;
let activeProgram: WebGLProgram | null = null;
let canvasWidth = 0;
let canvasHeight = 0;

// Simple vertex shader
const VERT = `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position * 0.5 + 0.5;
    // flip y because ImageBitmap ignores UNPACK_FLIP_Y_WEBGL
    vUv.y = 1.0 - vUv.y;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

// Simple fallback shader that just draws the video
const FRAG_BASE = `
  precision mediump float;
  varying vec2 vUv;
  uniform sampler2D u_video;
  void main() {
    gl_FragColor = texture2D(u_video, vUv);
  }
`;

const FRAG_DOLLY_ZOOM = `
  precision mediump float;
  varying vec2 vUv;
  uniform sampler2D u_video;
  uniform float u_time;
  void main() {
    vec2 center = vec2(0.5, 0.5);
    vec2 p = vUv - center;
    // zoom in and warp edges over time
    float warp = sin(u_time * 2.0) * 0.1;
    float r = length(p);
    float factor = 1.0 + warp * r * r;
    vec2 uv = center + p * factor;
    gl_FragColor = texture2D(u_video, uv);
  }
`;

const SHADERS: Record<string, string> = {
  'none': FRAG_BASE,
  'dolly-zoom': FRAG_DOLLY_ZOOM,
  // Other tier 2 shaders can be added here (fisheye, tilt-shift, etc)
};

let positionBuffer: WebGLBuffer | null = null;
let currentShaderId = 'none';

function compileShader(source: string, type: number): WebGLShader | null {
  if (!gl) return null;
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(vert: string, frag: string): WebGLProgram | null {
  if (!gl) return null;
  const vs = compileShader(vert, gl.VERTEX_SHADER);
  const fs = compileShader(frag, gl.FRAGMENT_SHADER);
  if (!vs || !fs) return null;
  const prog = gl.createProgram();
  if (!prog) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error("Program link error:", gl.getProgramInfoLog(prog));
    return null;
  }
  return prog;
}

function initGL(canvas: OffscreenCanvas) {
  gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  if (!gl) return;

  positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  // Full screen quad
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1,  1, -1, -1,  1,
    -1,  1,  1, -1,  1,  1,
  ]), gl.STATIC_DRAW);

  activeProgram = createProgram(VERT, FRAG_BASE);
}

function setShader(shaderId: string) {
  if (shaderId === currentShaderId) return;
  const frag = SHADERS[shaderId] || FRAG_BASE;
  const nextProg = createProgram(VERT, frag);
  if (nextProg && activeProgram && gl) {
    gl.deleteProgram(activeProgram);
    activeProgram = nextProg;
    currentShaderId = shaderId;
  }
}

let videoTexture: WebGLTexture | null = null;

function renderFrame(bitmap: ImageBitmap) {
  if (!gl || !activeProgram) return;

  // Update canvas size if bitmap changed
  if (bitmap.width !== canvasWidth || bitmap.height !== canvasHeight) {
    canvasWidth = bitmap.width;
    canvasHeight = bitmap.height;
    gl.canvas.width = canvasWidth;
    gl.canvas.height = canvasHeight;
    gl.viewport(0, 0, canvasWidth, canvasHeight);
  }

  gl.useProgram(activeProgram);

  if (!videoTexture) {
    videoTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, videoTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  } else {
    gl.bindTexture(gl.TEXTURE_2D, videoTexture);
  }

  // Upload frame to GPU
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bitmap);

  const posLoc = gl.getAttribLocation(activeProgram, "position");
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  const timeLoc = gl.getUniformLocation(activeProgram, "u_time");
  if (timeLoc) {
    gl.uniform1f(timeLoc, performance.now() / 1000);
  }

  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

self.onmessage = (e: MessageEvent) => {
  const { type, payload } = e.data;

  if (type === 'INIT') {
    initGL(payload.canvas);
  } else if (type === 'SET_SHADER') {
    setShader(payload.shader);
  } else if (type === 'RENDER_FRAME') {
    if (payload.bitmap) {
      renderFrame(payload.bitmap);
      payload.bitmap.close(); // Free memory immediately
    }
    // Signal main thread to continue
    self.postMessage({ type: 'FRAME_DONE' });
  }
};
