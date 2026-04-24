import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useCamera } from "@/context/CameraContext";
import { useFx } from "@/context/FxContext";
import { FILTER_TYPE_MAP, getFilterColor } from "@/data/interactiveFiltersMap";

/**
 * High-performance video filter pipeline.
 *
 * The live <video> element from CameraContext is bound to a THREE.VideoTexture
 * and painted onto a fullscreen quad through a custom fragment shader.
 *
 * The GLSL shader is ported DIRECTLY from the shared engine package:
 *   packages/engine/src/kernel/engine/shaders/effects.ts
 * This ensures visual parity with the web and desktop apps.
 *
 * The HTMLVideoElement itself is hidden via `display:none`; only the WebGL
 * <canvas> is shown. HUD/ripple DOM siblings sit above with pointer-events-none.
 */

// Vertex shader — GLSL ES 3.0
// NOTE: Three.js auto-injects `in vec3 position` and `in vec2 uv` when
// using glslVersion: THREE.GLSL3, so we must NOT redeclare them.
const VERT = /* glsl */ `
out vec2 v_uv;

void main() {
  v_uv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

// Fragment shader — ported from packages/engine/src/kernel/engine/shaders/effects.ts
// This is the SAME shader the web/desktop GLRenderer uses.
const FRAG = /* glsl */ `
precision mediump float;

uniform sampler2D u_video;
uniform float u_time;
uniform int u_filter_type;
// 1=Pixel, 2=Hologram, 3=Neon, 4=Thermal, 5=Mirror, 6=Anime
// 7=Sketch, 8=Comic, 9=Oil, 10=ASCII, 11=VHS, 12=Prism, 13=Kaleidoscope, 14=XRay

uniform float u_intensity;
uniform vec3 u_color;
uniform vec3 u_color_mid;
uniform vec3 u_color_high;

// Aspect-ratio cover (mobile-specific — engine handles via viewport)
uniform vec2 u_resolution;
uniform vec2 u_tex_aspect;

in vec2 v_uv;
out vec4 outColor;

float grayscale(vec3 color) {
    return dot(color, vec3(0.299, 0.587, 0.114));
}

float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

// Aspect-ratio-correct cover sampling
vec2 coverUv(vec2 uv) {
  float canvasAspect = u_resolution.x / u_resolution.y;
  float videoAspect = u_tex_aspect.x;
  vec2 scale = vec2(1.0);
  if (videoAspect > canvasAspect) {
    scale.x = canvasAspect / videoAspect;
  } else {
    scale.y = videoAspect / canvasAspect;
  }
  return clamp((uv - 0.5) * scale + 0.5, vec2(0.0), vec2(1.0));
}

vec4 sampleVideo(vec2 uv) {
  return texture(u_video, coverUv(uv));
}

// --- 1. PIXELATE ---
vec4 applyPixelate(vec2 uv) {
    float pixels = 500.0 * (1.0 - u_intensity * 0.9) + 20.0;
    vec2 dx = vec2(1.0 / pixels, 1.0 / pixels);
    vec2 coord = floor(uv / dx) * dx;
    return sampleVideo(coord);
}

// --- 2. HOLOGRAM (Tech/Sci-Fi) ---
vec4 applyHologram(vec2 uv) {
    float shiftAmt = 0.01 * u_intensity;
    float shift = sin(u_time * 3.0) * shiftAmt;
    float r = sampleVideo(uv + vec2(shift, 0.0)).r;
    float g = sampleVideo(uv).g;
    float b = sampleVideo(uv - vec2(shift, 0.0)).b;

    // Tech Scanlines (thin, sharp)
    float scan = sin(uv.y * 800.0 + u_time * 5.0);
    vec3 color = vec3(r, g, b);
    color += vec3(scan * 0.1);
    color *= vec3(0.8, 0.9, 1.0);

    // Tint with u_color (if provided)
    float lum = grayscale(color);
    vec3 tinted = vec3(lum) * u_color * 1.5;

    float tintStrength = length(u_color - vec3(1.0)) > 0.1 ? 0.6 : 0.0;
    return vec4(mix(color, tinted, tintStrength), 1.0);
}

// --- 3. NEON EDGE ---
vec4 applyNeonEdge(vec2 uv) {
    vec2 off = 1.0 / u_resolution;
    float gx = 0.0; float gy = 0.0;

    gx += -1.0 * grayscale(sampleVideo(uv + vec2(-off.x, -off.y)).rgb);
    gx += -2.0 * grayscale(sampleVideo(uv + vec2(-off.x,  0.0)).rgb);
    gx += -1.0 * grayscale(sampleVideo(uv + vec2(-off.x,  off.y)).rgb);
    gx +=  1.0 * grayscale(sampleVideo(uv + vec2( off.x, -off.y)).rgb);
    gx +=  2.0 * grayscale(sampleVideo(uv + vec2( off.x,  0.0)).rgb);
    gx +=  1.0 * grayscale(sampleVideo(uv + vec2( off.x,  off.y)).rgb);

    gy += -1.0 * grayscale(sampleVideo(uv + vec2(-off.x, -off.y)).rgb);
    gy += -2.0 * grayscale(sampleVideo(uv + vec2( 0.0, -off.y)).rgb);
    gy += -1.0 * grayscale(sampleVideo(uv + vec2( off.x, -off.y)).rgb);
    gy +=  1.0 * grayscale(sampleVideo(uv + vec2(-off.x,  off.y)).rgb);
    gy +=  2.0 * grayscale(sampleVideo(uv + vec2( 0.0,  off.y)).rgb);
    gy +=  1.0 * grayscale(sampleVideo(uv + vec2( off.x,  off.y)).rgb);

    float edge = sqrt(gx*gx + gy*gy);
    edge = smoothstep(0.1, 0.4, edge);

    vec3 edgeColor = u_color * edge * (2.0 + u_intensity * 5.0);
    vec3 bg = sampleVideo(uv).rgb * 0.1;
    return vec4(bg + edgeColor, 1.0);
}

// --- 4. THERMAL ---
vec4 applyThermal(vec2 uv) {
    vec3 orig = sampleVideo(uv).rgb;
    float lum = grayscale(orig);

    vec3 c0 = vec3(0.0, 0.0, 1.0);
    vec3 c1 = vec3(0.0, 1.0, 1.0);
    vec3 c2 = vec3(1.0, 1.0, 0.0);
    vec3 c3 = vec3(1.0, 0.0, 0.0);

    vec3 term;
    if (lum < 0.33) term = mix(c0, c1, lum * 3.0);
    else if (lum < 0.66) term = mix(c1, c2, (lum - 0.33) * 3.0);
    else term = mix(c2, c3, (lum - 0.66) * 3.0);

    return vec4(term, 1.0);
}

// --- 5. MIRROR (Simple Horizontal) ---
vec4 applyMirror(vec2 uv) {
    vec2 coord = uv;
    if (coord.x > 0.5) coord.x = 1.0 - coord.x;
    return sampleVideo(coord);
}

// --- 6. ANIME (Tri-Tone) ---
vec4 applyTriTone(vec2 uv) {
    float lum = grayscale(sampleVideo(uv).rgb);
    vec3 col;
    if (lum < 0.3) col = u_color;
    else if (lum < 0.6) col = u_color_mid;
    else col = u_color_high;
    return vec4(col, 1.0);
}

// --- 7. SKETCH (Pencil on Paper) ---
vec4 applySketch(vec2 uv) {
    vec2 off = 1.0 / u_resolution * 1.5;
    float gx = 0.0; float gy = 0.0;

    gx += -1.0 * grayscale(sampleVideo(uv + vec2(-off.x, -off.y)).rgb);
    gx += -2.0 * grayscale(sampleVideo(uv + vec2(-off.x,  0.0)).rgb);
    gx += -1.0 * grayscale(sampleVideo(uv + vec2(-off.x,  off.y)).rgb);
    gx +=  1.0 * grayscale(sampleVideo(uv + vec2( off.x, -off.y)).rgb);
    gx +=  2.0 * grayscale(sampleVideo(uv + vec2( off.x,  0.0)).rgb);
    gx +=  1.0 * grayscale(sampleVideo(uv + vec2( off.x,  off.y)).rgb);

    gy += -1.0 * grayscale(sampleVideo(uv + vec2(-off.x, -off.y)).rgb);
    gy += -2.0 * grayscale(sampleVideo(uv + vec2( 0.0, -off.y)).rgb);
    gy += -1.0 * grayscale(sampleVideo(uv + vec2( off.x, -off.y)).rgb);
    gy +=  1.0 * grayscale(sampleVideo(uv + vec2(-off.x,  off.y)).rgb);
    gy +=  2.0 * grayscale(sampleVideo(uv + vec2( 0.0,  off.y)).rgb);
    gy +=  1.0 * grayscale(sampleVideo(uv + vec2( off.x,  off.y)).rgb);

    float edge = sqrt(gx*gx + gy*gy);
    edge = smoothstep(0.1, 0.3, edge);

    vec3 paper = vec3(0.98, 0.98, 0.95);
    return vec4(mix(paper, u_color, edge), 1.0);
}

// --- 8. COMIC (Halftone Dots) ---
vec4 applyComic(vec2 uv) {
    vec3 tex = sampleVideo(uv).rgb;
    float lum = grayscale(tex);

    vec3 posterized = floor(tex * 4.0) / 4.0;

    float frequency = 120.0;
    vec2 nearest = 2.0 * fract(frequency * uv) - 1.0;
    float dist = length(nearest);
    float radius = 0.9 * (1.0 - lum);
    float dot_ = step(radius, dist);

    vec3 finalColor = mix(posterized * dot_, u_color, 0.1);
    return vec4(finalColor, 1.0);
}

// --- 9. OIL PAINT (Simplified) ---
vec4 applyOil(vec2 uv) {
    float radius = 4.0;
    vec3 m0 = vec3(0.0);

    for (float x = -radius; x <= radius; x += 1.0) {
        for (float y = -radius; y <= radius; y += 1.0) {
            m0 += sampleVideo(uv + vec2(x, y) / u_resolution).rgb;
        }
    }
    m0 /= ((2.0 * radius + 1.0) * (2.0 * radius + 1.0));

    return vec4(floor(m0 * 8.0) / 8.0, 1.0);
}

// --- 10. ASCII ---
vec4 applyASCII(vec2 uv) {
    float pixels = 80.0;
    vec2 dx = vec2(1.0 / pixels, 1.0 / pixels);
    vec2 coord = floor(uv / dx) * dx;
    float lum = grayscale(sampleVideo(coord).rgb);

    vec2 inner = fract(uv / dx);
    float d = distance(inner, vec2(0.5));

    float charMask = step(d, lum * 0.45);
    return vec4(u_color * charMask, 1.0);
}

// --- 11. VHS (Tracking + Noise + Aberration) ---
vec4 applyVHS(vec2 uv) {
    float wave = sin(uv.y * 10.0 + u_time * 10.0) * 0.005;

    float r = sampleVideo(uv + vec2(wave + 0.002, 0.0)).r;
    float g = sampleVideo(uv + vec2(wave, 0.0)).g;
    float b = sampleVideo(uv + vec2(wave - 0.002, 0.0)).b;

    float noise = rand(uv * u_time) * 0.15;
    float scan = sin(uv.y * 400.0) * 0.05;

    vec3 col = vec3(r, g, b) + noise - scan;
    return vec4(col, 1.0);
}

// --- 12. PRISM (Strong RGB Split) ---
vec4 applyPrism(vec2 uv) {
    float split = 0.015 * (1.0 + u_intensity);

    float r = sampleVideo(uv + vec2(split, 0.0)).r;
    float g = sampleVideo(uv).g;
    float b = sampleVideo(uv - vec2(split, 0.0)).b;

    return vec4(r, g, b, 1.0);
}

// --- 13. KALEIDOSCOPE (Radial) ---
vec4 applyKaleidoscope(vec2 uv) {
    vec2 center = vec2(0.5, 0.5);
    vec2 rel = uv - center;
    float radius = length(rel);
    float angle = atan(rel.y, rel.x);

    float sides = 8.0;
    angle = mod(angle, 3.14159 * 2.0 / sides);
    angle = abs(angle - 3.14159 / sides);

    vec2 coord = center + vec2(cos(angle), sin(angle)) * radius;
    return sampleVideo(coord);
}

// --- 14. X-RAY ---
vec4 applyXRay(vec2 uv) {
    vec3 col = sampleVideo(uv).rgb;
    float lum = grayscale(col);

    float inv = 1.0 - lum;
    vec3 bone = vec3(0.1, 0.2, 0.3) * inv + vec3(inv * 0.8);

    return vec4(bone, 1.0);
}

void main() {
    if (u_filter_type == 1) outColor = applyPixelate(v_uv);
    else if (u_filter_type == 2) outColor = applyHologram(v_uv);
    else if (u_filter_type == 3) outColor = applyNeonEdge(v_uv);
    else if (u_filter_type == 4) outColor = applyThermal(v_uv);
    else if (u_filter_type == 5) outColor = applyMirror(v_uv);
    else if (u_filter_type == 6) outColor = applyTriTone(v_uv);
    else if (u_filter_type == 7) outColor = applySketch(v_uv);
    else if (u_filter_type == 8) outColor = applyComic(v_uv);
    else if (u_filter_type == 9) outColor = applyOil(v_uv);
    else if (u_filter_type == 10) outColor = applyASCII(v_uv);
    else if (u_filter_type == 11) outColor = applyVHS(v_uv);
    else if (u_filter_type == 12) outColor = applyPrism(v_uv);
    else if (u_filter_type == 13) outColor = applyKaleidoscope(v_uv);
    else if (u_filter_type == 14) outColor = applyXRay(v_uv);
    else outColor = sampleVideo(v_uv);
}
`;

interface AnimeStyleColors {
  shadowColor: string;
  midColor: string;
  highlightColor: string;
}

function hexToVec3(hex: string): [number, number, number] {
  if (!hex || !hex.startsWith("#")) return [1, 1, 1];
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
}

interface WebGLVideoCanvasProps {
  animeStyles?: Record<string, AnimeStyleColors>;
}

const WebGLVideoCanvas = ({ animeStyles }: WebGLVideoCanvasProps = {}) => {
  const { videoRef } = useCamera();
  const { activeInteractiveFilter } = useFx();
  const containerRef = useRef<HTMLDivElement>(null);
  const filterIdRef = useRef<string | null>(null);
  const animeStylesRef = useRef<Record<string, AnimeStyleColors> | undefined>(undefined);

  // Keep latest values available to the render loop without re-creating it.
  filterIdRef.current = activeInteractiveFilter?.id ?? "none";
  animeStylesRef.current = animeStyles;

  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 1);
    container.appendChild(renderer.domElement);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    texture.colorSpace = THREE.SRGBColorSpace;

    const uniforms: Record<string, THREE.IUniform> = {
      u_video: { value: texture },
      u_time: { value: 0 },
      u_filter_type: { value: 0 },
      u_intensity: { value: 1.0 },
      u_color: { value: new THREE.Vector3(1, 1, 1) },
      u_color_mid: { value: new THREE.Vector3(0.5, 0.5, 0.5) },
      u_color_high: { value: new THREE.Vector3(1, 1, 1) },
      u_resolution: { value: new THREE.Vector2(1, 1) },
      u_tex_aspect: { value: new THREE.Vector2(1, 1) },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms,
      depthTest: false,
      depthWrite: false,
      glslVersion: THREE.GLSL3,
    });

    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(quad);

    const resize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h, false);
      (uniforms.u_resolution.value as THREE.Vector2).set(
        w * renderer.getPixelRatio(),
        h * renderer.getPixelRatio(),
      );
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const updateAspect = () => {
      const vw = video.videoWidth || 9;
      const vh = video.videoHeight || 16;
      (uniforms.u_tex_aspect.value as THREE.Vector2).set(vw / vh, 0);
    };
    video.addEventListener("loadedmetadata", updateAspect);
    video.addEventListener("resize", updateAspect);
    updateAspect();

    let raf = 0;
    const start = performance.now();
    let lastFilterId: string | null = null;

    const tick = () => {
      const id = filterIdRef.current ?? "none";
      if (id !== lastFilterId) {
        const styles = animeStylesRef.current;

        let typeId = 0;
        let color: [number, number, number] = [1, 1, 1];
        let colorMid: [number, number, number] = [0.5, 0.5, 0.5];
        let colorHigh: [number, number, number] = [1, 1, 1];

        if (id !== "none") {
          // Check AnimeStyles first (mirrors GLRenderer.ts logic)
          if (styles && id in styles) {
            typeId = 6; // Tri-tone
            color = hexToVec3(styles[id].shadowColor);
            colorMid = hexToVec3(styles[id].midColor);
            colorHigh = hexToVec3(styles[id].highlightColor);
          } else {
            typeId = FILTER_TYPE_MAP[id] || 0;
            color = getFilterColor(id);
          }
        }

        uniforms.u_filter_type.value = typeId;
        (uniforms.u_color.value as THREE.Vector3).set(...color);
        (uniforms.u_color_mid.value as THREE.Vector3).set(...colorMid);
        (uniforms.u_color_high.value as THREE.Vector3).set(...colorHigh);
        lastFilterId = id;
      }

      uniforms.u_time.value = (performance.now() - start) / 1000;

      // Force VideoTexture to re-upload when a frame is ready.
      if (video.readyState >= video.HAVE_CURRENT_DATA) {
        texture.needsUpdate = true;
      }
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      video.removeEventListener("loadedmetadata", updateAspect);
      video.removeEventListener("resize", updateAspect);
      texture.dispose();
      material.dispose();
      quad.geometry.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [videoRef]);

  return <div ref={containerRef} className="absolute inset-0" />;
};

export default WebGLVideoCanvas;
