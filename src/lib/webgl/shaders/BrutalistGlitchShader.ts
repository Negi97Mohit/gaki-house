// src/lib/webgl/shaders/BrutalistGlitchShader.ts
import * as THREE from "three";
import { extend } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";

export const BrutalistGlitchMaterial = shaderMaterial(
  {
    uTime: 0,
    uTexture: new THREE.Texture(),
    uHover: 0, // 0 to 1
    uMouse: new THREE.Vector2(0, 0),
    uResolution: new THREE.Vector2(1, 1),
    uColor: new THREE.Color(1, 1, 1),
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    varying float vNoise;
    uniform float uTime;
    uniform float uHover;

    // Simple pseudo-random noise
    float rand(vec2 n) { 
      return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
    }

    void main() {
      vUv = uv;
      
      vec3 pos = position;
      
      // Jitter vertex position on intense hover (earthquake effect)
      if (uHover > 0.5) {
        float shake = rand(vec2(uTime, uTime)) - 0.5;
        pos.x += shake * 0.05 * uHover;
        pos.y += shake * 0.05 * uHover;
      }

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform sampler2D uTexture;
    uniform float uTime;
    uniform float uHover;
    uniform vec3 uColor;
    varying vec2 vUv;

    void main() {
      vec2 p = vUv;
      
      // RGB Split calculation
      // The offset increases with hover intensity
      float offset = 0.02 * uHover;
      float glitch = sin(uTime * 50.0) * 0.01 * uHover; // Fast flicker
      
      // Sample texture at 3 different positions
      float r = texture2D(uTexture, p + vec2(offset + glitch, 0.0)).r;
      float g = texture2D(uTexture, p).g;
      float b = texture2D(uTexture, p - vec2(offset + glitch, 0.0)).b;

      // Apply "scanline" darkness
      float scanline = sin(p.y * 200.0) * 0.1;
      
      // High contrast mix
      vec3 color = vec3(r, g, b) * uColor;
      color -= scanline;

      // Thresholding for "Brutalist" look (crushed blacks)
      color = smoothstep(0.1, 0.9, color);

      gl_FragColor = vec4(color, 1.0);
    }
  `
);

extend({ BrutalistGlitchMaterial });
