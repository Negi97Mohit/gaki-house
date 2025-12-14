// src/lib/webgl/shaders/gridShaders.ts

export const COMMON_UNIFORMS = {
  uTime: { value: 0 },
  uMouse: { value: [0, 0] },
  uResolution: { value: [1, 1] },
  uScrollVelocity: { value: 0 },
  uScrollProgress: { value: 0 },
  uTexture: { value: null }, // Placeholder for grid content
};

export const GRID_VERTEX_BASE = `
  varying vec2 vUv;
  varying vec3 vPosition;
  uniform float uTime;
  uniform float uScrollVelocity;
  uniform vec2 uMouse;

  void main() {
    vUv = uv;
    vPosition = position;
    
    vec3 pos = position;
    
    // -- INJECTION POINT FOR DISTORTION -- 
    // Example: Slight curve based on scroll velocity
    float dist = distance(uv, vec2(0.5));
    pos.z += sin(dist * 10.0 - uTime) * (uScrollVelocity * 0.1);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const LIQUID_FRAGMENT = `
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uScrollVelocity;
  uniform sampler2D uTexture;

  // Simplex noise function (simplified)
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

  void main() {
    vec2 p = vUv;
    
    // Liquid distortion based on mouse
    float d = distance(p, uMouse * 0.5 + 0.5);
    float force = smoothstep(0.4, 0.0, d) * 0.2;
    p += (p - (uMouse * 0.5 + 0.5)) * force;

    // Chromatic aberration based on velocity
    float rgbSplit = uScrollVelocity * 0.05;
    
    float r = texture2D(uTexture, p + vec2(rgbSplit, 0.0)).r;
    float g = texture2D(uTexture, p).g;
    float b = texture2D(uTexture, p - vec2(rgbSplit, 0.0)).b;

    gl_FragColor = vec4(r, g, b, 1.0);
  }
`;

export const VOGUE_FRAGMENT = `
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3 uColor;

  void main() {
    // High contrast, editorial look
    float grain = fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453);
    vec3 color = uColor + grain * 0.05;
    gl_FragColor = vec4(color, 1.0);
  }
`;
