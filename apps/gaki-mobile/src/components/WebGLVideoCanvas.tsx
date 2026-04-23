import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useCamera } from "@/context/CameraContext";
import { useFx } from "@/context/FxContext";
import { getFilterParams, type FilterParams } from "@/data/interactiveFiltersMap";

/**
 * High-performance video filter pipeline.
 *
 * The live <video> element from CameraContext is *not* rendered to the DOM;
 * instead it is bound to a THREE.VideoTexture and painted onto a fullscreen
 * quad through a custom fragment shader. Every interactive filter — even the
 * simple color grades that used to be CSS `filter: ...` — is now uniforms on
 * this single shader. Special animated effects (thermal LUT, Sobel neon edge,
 * hologram scanlines, matrix rain, ASCII, pixelation, mirror) are gated by an
 * integer `uMode` enum.
 *
 * The HTMLVideoElement itself is hidden via `display:none`; only the WebGL
 * <canvas> is shown. HUD/ripple DOM siblings sit *above* this canvas with
 * pointer-events-none and no blend modes — see InteractiveFilterRenderer.
 */

// Vertex shader: just pass UVs through for a fullscreen quad.
const VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

// Single fragment shader covering all filters.
//
// Color math intentionally mirrors the W3C Filter Effects 1.0 specification:
//   - hue-rotate uses the canonical 3x3 matrix from §10.6
//   - saturate uses the §10.7 luminance-preserving matrix
//   - contrast uses the §10.4 pivot at 0.5
//   - brightness, invert, sepia, grayscale all match §10.x identities
// Procedural overlays (scanlines, vignettes, sweeps) are generated entirely
// in GLSL so we never depend on DOM blend modes.
const FRAG = /* glsl */ `
precision highp float;

uniform sampler2D uTex;
uniform vec2 uResolution;
uniform vec2 uTexAspect;
uniform float uTime;
uniform int uMode;

uniform float uHue;
uniform float uSaturate;
uniform float uContrast;
uniform float uBrightness;
uniform float uSepia;
uniform float uInvert;
uniform float uGrayscale;
uniform float uBlur;
uniform vec3  uTint;
uniform float uTintAmount;
uniform float uVignette;
uniform float uMirror;

varying vec2 vUv;

// --- W3C-spec color helpers ----------------------------------------------

const vec3 LUMA = vec3(0.2126, 0.7152, 0.0722);
float luma(vec3 c) { return dot(c, LUMA); }

// W3C hue-rotate matrix (Filter Effects §10.6).
vec3 hueRotate(vec3 c, float a) {
  float U = cos(a);
  float W = sin(a);
  mat3 m = mat3(
    0.213 + 0.787 * U - 0.213 * W,
    0.213 - 0.213 * U + 0.143 * W,
    0.213 - 0.213 * U - 0.787 * W,
    0.715 - 0.715 * U - 0.715 * W,
    0.715 + 0.285 * U + 0.140 * W,
    0.715 - 0.715 * U + 0.715 * W,
    0.072 - 0.072 * U + 0.928 * W,
    0.072 - 0.072 * U - 0.283 * W,
    0.072 + 0.928 * U + 0.072 * W
  );
  return m * c;
}

// W3C saturate (§10.7) — luminance-preserving.
vec3 saturate3(vec3 c, float s) {
  mat3 m = mat3(
    0.213 + 0.787 * s, 0.213 - 0.213 * s, 0.213 - 0.213 * s,
    0.715 - 0.715 * s, 0.715 + 0.285 * s, 0.715 - 0.715 * s,
    0.072 - 0.072 * s, 0.072 - 0.072 * s, 0.072 + 0.928 * s
  );
  return m * c;
}

// W3C contrast (§10.4): slope*c + (-0.5*slope + 0.5).
vec3 contrast3(vec3 c, float k) { return (c - 0.5) * k + 0.5; }

vec3 applySepia(vec3 c, float amt) {
  vec3 s = vec3(
    dot(c, vec3(0.393, 0.769, 0.189)),
    dot(c, vec3(0.349, 0.686, 0.168)),
    dot(c, vec3(0.272, 0.534, 0.131))
  );
  return mix(c, s, amt);
}

// --- CSS mix-blend-mode equivalents --------------------------------------

float blendOverlay1(float b, float s) {
  return b < 0.5 ? (2.0 * b * s) : (1.0 - 2.0 * (1.0 - b) * (1.0 - s));
}
vec3 blendOverlay(vec3 b, vec3 s) {
  return vec3(blendOverlay1(b.r, s.r), blendOverlay1(b.g, s.g), blendOverlay1(b.b, s.b));
}
vec3 blendScreen(vec3 b, vec3 s)   { return 1.0 - (1.0 - b) * (1.0 - s); }
vec3 blendMultiply(vec3 b, vec3 s) { return b * s; }

// mix-blend-mode: color — keep base luminance, take blend hue+chroma (HSL).
vec3 rgb2hsl(vec3 c) {
  float mx = max(max(c.r, c.g), c.b);
  float mn = min(min(c.r, c.g), c.b);
  float l = (mx + mn) * 0.5;
  float h = 0.0, s = 0.0;
  float d = mx - mn;
  if (d > 1e-5) {
    s = l > 0.5 ? d / (2.0 - mx - mn) : d / (mx + mn);
    if (mx == c.r)      h = (c.g - c.b) / d + (c.g < c.b ? 6.0 : 0.0);
    else if (mx == c.g) h = (c.b - c.r) / d + 2.0;
    else                h = (c.r - c.g) / d + 4.0;
    h /= 6.0;
  }
  return vec3(h, s, l);
}
float hue2rgb(float p, float q, float t) {
  if (t < 0.0) t += 1.0;
  if (t > 1.0) t -= 1.0;
  if (t < 1.0/6.0) return p + (q - p) * 6.0 * t;
  if (t < 1.0/2.0) return q;
  if (t < 2.0/3.0) return p + (q - p) * (2.0/3.0 - t) * 6.0;
  return p;
}
vec3 hsl2rgb(vec3 hsl) {
  float h = hsl.x, s = hsl.y, l = hsl.z;
  if (s < 1e-5) return vec3(l);
  float q = l < 0.5 ? l * (1.0 + s) : l + s - l * s;
  float p = 2.0 * l - q;
  return vec3(hue2rgb(p, q, h + 1.0/3.0), hue2rgb(p, q, h), hue2rgb(p, q, h - 1.0/3.0));
}
vec3 blendColor(vec3 base, vec3 blend) {
  vec3 b = rgb2hsl(blend);
  vec3 a = rgb2hsl(base);
  return hsl2rgb(vec3(b.x, b.y, a.z));
}

// --- procedural overlays --------------------------------------------------

float scanlines(vec2 uv, float density, float speed, float strength) {
  float s = sin(uv.y * density + uTime * speed);
  return 1.0 - strength * 0.5 * (1.0 - s);
}

float vignetteMask(vec2 uv, float inner, float outer, float strength) {
  float d = distance(uv, vec2(0.5));
  return 1.0 - smoothstep(inner, outer, d) * strength;
}

// --- sampling -------------------------------------------------------------

vec2 coverUv(vec2 uv) {
  float canvasAspect = uResolution.x / uResolution.y;
  float videoAspect = uTexAspect.x;
  vec2 scale = vec2(1.0);
  if (videoAspect > canvasAspect) {
    scale.x = canvasAspect / videoAspect;
  } else {
    scale.y = videoAspect / canvasAspect;
  }
  return (uv - 0.5) * scale + 0.5;
}

vec4 sampleVideo(vec2 uv) {
  vec2 cu = coverUv(uv);
  if (uMirror > 0.5) cu.x = 1.0 - cu.x;
  cu = clamp(cu, vec2(0.0), vec2(1.0));
  return texture2D(uTex, cu);
}

vec3 sampleBlurred(vec2 uv) {
  if (uBlur < 0.01) return sampleVideo(uv).rgb;
  vec2 px = uBlur / uResolution;
  vec3 sum = vec3(0.0);
  sum += sampleVideo(uv).rgb * 0.4;
  sum += sampleVideo(uv + vec2( px.x,  0.0)).rgb * 0.15;
  sum += sampleVideo(uv + vec2(-px.x,  0.0)).rgb * 0.15;
  sum += sampleVideo(uv + vec2( 0.0,  px.y)).rgb * 0.15;
  sum += sampleVideo(uv + vec2( 0.0, -px.y)).rgb * 0.15;
  return sum;
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// --- mode-specific effects ------------------------------------------------

// Thermal: luminance LUT + procedural radial gradient overlay-blended on top
// (was: CSS radial-gradient with mix-blend-mode: overlay) + vignette.
vec3 modeThermal(vec3 c, vec2 uv) {
  float l = luma(c);
  vec3 cold = vec3(0.0, 0.0, 0.4);
  vec3 cool = vec3(0.0, 0.4, 1.0);
  vec3 warm = vec3(1.0, 0.5, 0.0);
  vec3 hot  = vec3(1.0, 0.95, 0.4);
  vec3 col = mix(cold, cool, smoothstep(0.0, 0.35, l));
  col = mix(col, warm, smoothstep(0.35, 0.7, l));
  col = mix(col, hot, smoothstep(0.7, 1.0, l));
  float r = distance(uv, vec2(0.5));
  vec3 grad = mix(vec3(1.0, 0.85, 0.4), vec3(0.1, 0.0, 0.3), smoothstep(0.0, 0.85, r));
  col = blendOverlay(col, grad);
  col *= vignetteMask(uv, 0.4, 0.85, 0.55);
  return col;
}

vec3 modeNeonEdge(vec2 uv) {
  vec2 px = 1.0 / uResolution;
  float l00 = luma(sampleVideo(uv + vec2(-px.x, -px.y)).rgb);
  float l10 = luma(sampleVideo(uv + vec2( 0.0,   -px.y)).rgb);
  float l20 = luma(sampleVideo(uv + vec2( px.x, -px.y)).rgb);
  float l01 = luma(sampleVideo(uv + vec2(-px.x,  0.0)).rgb);
  float l21 = luma(sampleVideo(uv + vec2( px.x,  0.0)).rgb);
  float l02 = luma(sampleVideo(uv + vec2(-px.x,  px.y)).rgb);
  float l12 = luma(sampleVideo(uv + vec2( 0.0,    px.y)).rgb);
  float l22 = luma(sampleVideo(uv + vec2( px.x,  px.y)).rgb);
  float gx = -l00 - 2.0*l01 - l02 + l20 + 2.0*l21 + l22;
  float gy = -l00 - 2.0*l10 - l20 + l02 + 2.0*l12 + l22;
  float edge = clamp(sqrt(gx*gx + gy*gy) * 1.6, 0.0, 1.0);
  // Procedural neon hue gradient (was a CSS conic-gradient overlay).
  vec3 hueA = vec3(0.05, 0.95, 1.0);
  vec3 hueB = vec3(1.0, 0.1, 0.9);
  float t = 0.5 + 0.5 * sin(uTime * 1.5 + uv.x * 3.0);
  vec3 neon = mix(hueA, hueB, t);
  // Screen-blend the edge glow over a deep-purple base (was mix-blend-mode: screen).
  vec3 base = vec3(0.02, 0.0, 0.05);
  return blendScreen(base, neon * edge);
}

vec3 modeHologram(vec3 c, vec2 uv) {
  // RGB chroma split.
  float off = 0.003;
  float r = sampleVideo(uv + vec2( off, 0.0)).r;
  float g = sampleVideo(uv).g;
  float b = sampleVideo(uv + vec2(-off, 0.0)).b;
  vec3 split = vec3(r, g, b);
  // Procedural scanlines (was <Scanlines/> DOM overlay).
  float scan = scanlines(uv, uResolution.y * 1.2, 6.0, 0.55);
  // Sweeping band (was a moving linear-gradient).
  float sweep = smoothstep(0.04, 0.0, abs(fract(uv.y - uTime * 0.18) - 0.5));
  vec3 holo = split * scan;
  holo = blendScreen(holo, vec3(0.0, 0.4, 0.6) * sweep);
  // CSS mix-blend-mode: color with cyan tint — implemented via HSL color blend.
  vec3 cyan = vec3(0.35, 0.95, 1.0);
  holo = mix(holo, blendColor(holo, cyan), 0.55);
  // Soft vignette (was <Vignette/>).
  holo *= vignetteMask(uv, 0.45, 0.95, 0.45);
  return holo;
}

vec3 modeMatrix(vec3 c, vec2 uv) {
  float l = luma(c);
  vec3 base = vec3(0.0, l * 0.55, 0.05);
  vec2 grid = vec2(36.0, 60.0);
  vec2 cell = floor(uv * grid);
  float colSpeed = 0.6 + hash(vec2(cell.x, 0.0)) * 1.4;
  float yShift = fract(uv.y - uTime * colSpeed * 0.25 + hash(vec2(cell.x, 7.0)));
  float head = smoothstep(0.0, 0.02, yShift) * smoothstep(0.16, 0.0, yShift);
  float tail = pow(1.0 - yShift, 4.0) * 0.6;
  float glyph = step(0.55, hash(cell + floor(uTime * 8.0 + cell.x)));
  vec3 rain = vec3(0.2, 1.0, 0.4) * (head * 1.4 + tail) * glyph;
  return blendScreen(base, rain);
}

vec3 modeAscii(vec3 c, vec2 uv) {
  vec2 grid = vec2(80.0, 60.0);
  vec2 cell = floor(uv * grid) / grid + 0.5 / grid;
  vec3 cellCol = sampleVideo(cell).rgb;
  float l = luma(cellCol);
  float q = floor(l * 6.0) / 5.0;
  vec2 sub = fract(uv * grid) - 0.5;
  float d = length(sub);
  float dot_ = smoothstep(0.45 - q * 0.4, 0.0, d);
  return vec3(0.05, 1.0, 0.25) * q * (0.5 + dot_ * 0.7);
}

vec3 modePixel(vec2 uv) {
  vec2 grid = vec2(120.0, 90.0);
  vec2 cell = (floor(uv * grid) + 0.5) / grid;
  return sampleVideo(cell).rgb;
}

// --- main -----------------------------------------------------------------

void main() {
  vec2 uv = vUv;
  vec3 col;

  if (uMode == 1) {
    col = modeThermal(sampleBlurred(uv), uv);
  } else if (uMode == 2) {
    col = modeNeonEdge(uv);
  } else if (uMode == 3) {
    col = modeHologram(sampleBlurred(uv), uv);
  } else if (uMode == 4) {
    col = modeMatrix(sampleBlurred(uv), uv);
  } else if (uMode == 5) {
    col = modeAscii(sampleBlurred(uv), uv);
  } else if (uMode == 6) {
    col = modePixel(uv);
  } else {
    col = sampleBlurred(uv);
  }

  // --- W3C-spec color grade ---
  // CSS filter spec evaluates left-to-right; mirror that order:
  // brightness → contrast → saturate → hue-rotate → sepia → grayscale → invert
  col *= uBrightness;
  col = contrast3(col, uContrast);
  col = saturate3(col, uSaturate);
  if (abs(uHue) > 0.001) col = hueRotate(col, uHue);
  col = applySepia(col, uSepia);
  col = mix(col, vec3(luma(col)), uGrayscale);
  col = mix(col, 1.0 - col, uInvert);

  // Tint via multiply blend (CSS mix-blend-mode: multiply).
  if (uTintAmount > 0.001) {
    col = mix(col, blendMultiply(col, uTint), uTintAmount);
  }

  // Procedural vignette (replaces the <Vignette/> DOM element).
  if (uVignette > 0.001) {
    col *= vignetteMask(vUv, 0.35, 0.85, uVignette);
  }

  // X-ray-style filters historically layered DOM scanlines; recreate here
  // when the grade is fully inverted (xray / xrayVision).
  if (uInvert > 0.5) {
    float s = scanlines(vUv, uResolution.y * 0.8, 0.0, 0.25);
    col *= s;
  }

  col = clamp(col, 0.0, 1.0);
  gl_FragColor = vec4(col, 1.0);
}
`;

const WebGLVideoCanvas = () => {
  const { videoRef } = useCamera();
  const { activeInteractiveFilter } = useFx();
  const containerRef = useRef<HTMLDivElement>(null);
  const filterIdRef = useRef<string | null>(null);

  // Keep latest filter id available to the render loop without re-creating it.
  filterIdRef.current = activeInteractiveFilter?.id ?? "none";

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
      uTex: { value: texture },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uTexAspect: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uMode: { value: 0 },
      uHue: { value: 0 },
      uSaturate: { value: 1 },
      uContrast: { value: 1 },
      uBrightness: { value: 1 },
      uSepia: { value: 0 },
      uInvert: { value: 0 },
      uGrayscale: { value: 0 },
      uBlur: { value: 0 },
      uTint: { value: new THREE.Vector3(1, 1, 1) },
      uTintAmount: { value: 0 },
      uVignette: { value: 0 },
      uMirror: { value: 0 },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms,
      depthTest: false,
      depthWrite: false,
    });

    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(quad);

    const applyParams = (params: FilterParams) => {
      uniforms.uMode.value = params.mode;
      uniforms.uHue.value = params.hueRotate;
      uniforms.uSaturate.value = params.saturate;
      uniforms.uContrast.value = params.contrast;
      uniforms.uBrightness.value = params.brightness;
      uniforms.uSepia.value = params.sepia;
      uniforms.uInvert.value = params.invert;
      uniforms.uGrayscale.value = params.grayscale;
      uniforms.uBlur.value = params.blur;
      (uniforms.uTint.value as THREE.Vector3).set(
        params.tint[0],
        params.tint[1],
        params.tint[2],
      );
      uniforms.uTintAmount.value = params.tintAmount;
      uniforms.uVignette.value = params.vignette;
      uniforms.uMirror.value = params.mode === 7 ? 1 : 0;
    };

    const resize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h, false);
      (uniforms.uResolution.value as THREE.Vector2).set(
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
      (uniforms.uTexAspect.value as THREE.Vector2).set(vw / vh, 0);
    };
    video.addEventListener("loadedmetadata", updateAspect);
    video.addEventListener("resize", updateAspect);
    updateAspect();

    let raf = 0;
    const start = performance.now();
    let lastFilterId: string | null = null;
    const tick = () => {
      const id = filterIdRef.current;
      if (id !== lastFilterId) {
        applyParams(getFilterParams(id));
        lastFilterId = id;
      }
      uniforms.uTime.value = (performance.now() - start) / 1000;
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
