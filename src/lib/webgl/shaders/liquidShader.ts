// src/lib/webgl/shaders/liquidShader.ts
import * as THREE from "three";

export const LiquidShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uTexture: { value: null }, // The grid snapshot or video texture
    uIntensity: { value: 0.4 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec2 uMouse;
    uniform vec2 uResolution;
    uniform float uIntensity;
    uniform sampler2D uTexture;
    varying vec2 vUv;

    // Simplex 2D noise 
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

    void main() {
      vec2 uv = vUv;
      
      // Calculate distance from mouse pointer (normalized)
      float dist = distance(uv, uMouse);
      
      // Create a "bulge" effect radius
      float decay = clamp(1.0 - dist * 3.0, 0.0, 1.0);
      
      // Distortion vector based on mouse direction
      vec2 dir = normalize(uv - uMouse);
      
      // Apply liquid displacement
      vec2 distortedUv = uv - dir * decay * uIntensity * 0.1;

      // Add chromatic aberration at the edges of the distortion
      float r = texture2D(uTexture, distortedUv + vec2(0.01 * decay, 0.0)).r;
      float g = texture2D(uTexture, distortedUv).g;
      float b = texture2D(uTexture, distortedUv - vec2(0.01 * decay, 0.0)).b;

      // Scanline effect for "monitor" feel
      float scanline = sin(uv.y * 800.0 + uTime * 10.0) * 0.02;

      gl_FragColor = vec4(r, g, b, 1.0) + scanline;
    }
  `,
};
