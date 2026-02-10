// src/lib/webgl/shaders/effects.ts

export const EFFECTS_FRAGMENT_SHADER_SOURCE = `#version 300 es
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

in vec2 v_uv;
out vec4 outColor;

float grayscale(vec3 color) {
    return dot(color, vec3(0.299, 0.587, 0.114));
}

float rand(vec2 co) {
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

// --- 1. PIXELATE ---
vec4 applyPixelate(vec2 uv) {
    float pixels = 500.0 * (1.0 - u_intensity * 0.9) + 20.0; 
    vec2 dx = vec2(1.0 / pixels, 1.0 / pixels);
    vec2 coord = floor(uv / dx) * dx;
    return texture(u_video, coord);
}

// --- 2. HOLOGRAM (Tech/Sci-Fi) ---
vec4 applyHologram(vec2 uv) {
    float shiftAmt = 0.01 * u_intensity; 
    float shift = sin(u_time * 3.0) * shiftAmt;
    float r = texture(u_video, uv + vec2(shift, 0.0)).r;
    float g = texture(u_video, uv).g;
    float b = texture(u_video, uv - vec2(shift, 0.0)).b;
    
    // Tech Scanlines (thin, sharp)
    float scan = sin(uv.y * 800.0 + u_time * 5.0);
    vec3 color = vec3(r, g, b);
    color += vec3(scan * 0.1); // Add lightness
    color *= vec3(0.8, 0.9, 1.0); // Cool tint
    
    // Tint with u_color (if provided)
    float lum = grayscale(color);
    vec3 tinted = vec3(lum) * u_color * 1.5;
    
    // If u_color is essentially white, don't tint much
    float tintStrength = length(u_color - vec3(1.0)) > 0.1 ? 0.6 : 0.0;
    return vec4(mix(color, tinted, tintStrength), 1.0);
}

// --- 3. NEON EDGE ---
vec4 applyNeonEdge(vec2 uv) {
    vec2 off = 1.0 / vec2(1280.0, 720.0);
    float gx = 0.0; float gy = 0.0;
    
    gx += -1.0 * grayscale(texture(u_video, uv + vec2(-off.x, -off.y)).rgb);
    gx += -2.0 * grayscale(texture(u_video, uv + vec2(-off.x,  0.0)).rgb);
    gx += -1.0 * grayscale(texture(u_video, uv + vec2(-off.x,  off.y)).rgb);
    gx +=  1.0 * grayscale(texture(u_video, uv + vec2( off.x, -off.y)).rgb);
    gx +=  2.0 * grayscale(texture(u_video, uv + vec2( off.x,  0.0)).rgb);
    gx +=  1.0 * grayscale(texture(u_video, uv + vec2( off.x,  off.y)).rgb);

    gy += -1.0 * grayscale(texture(u_video, uv + vec2(-off.x, -off.y)).rgb);
    gy += -2.0 * grayscale(texture(u_video, uv + vec2( 0.0, -off.y)).rgb);
    gy += -1.0 * grayscale(texture(u_video, uv + vec2( off.x, -off.y)).rgb);
    gy +=  1.0 * grayscale(texture(u_video, uv + vec2(-off.x,  off.y)).rgb);
    gy +=  2.0 * grayscale(texture(u_video, uv + vec2( 0.0,  off.y)).rgb);
    gy +=  1.0 * grayscale(texture(u_video, uv + vec2( off.x,  off.y)).rgb);

    float edge = sqrt(gx*gx + gy*gy);
    edge = smoothstep(0.1, 0.4, edge);
    
    vec3 edgeColor = u_color * edge * (2.0 + u_intensity * 5.0);
    vec3 bg = texture(u_video, uv).rgb * 0.1; 
    return vec4(bg + edgeColor, 1.0);
}

// --- 4. THERMAL ---
vec4 applyThermal(vec2 uv) {
    vec3 orig = texture(u_video, uv).rgb;
    float lum = grayscale(orig);
    
    // Standard Heat Map
    vec3 c0 = vec3(0.0, 0.0, 1.0); // Blue
    vec3 c1 = vec3(0.0, 1.0, 1.0); // Cyan
    vec3 c2 = vec3(1.0, 1.0, 0.0); // Yellow
    vec3 c3 = vec3(1.0, 0.0, 0.0); // Red
    
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
    return texture(u_video, coord);
}

// --- 6. ANIME (Tri-Tone) ---
vec4 applyTriTone(vec2 uv) {
    float lum = grayscale(texture(u_video, uv).rgb);
    vec3 col;
    if (lum < 0.3) col = u_color; 
    else if (lum < 0.6) col = u_color_mid; 
    else col = u_color_high; 
    return vec4(col, 1.0);
}

// --- 7. SKETCH (Improved: High Contrast Pencil) ---
vec4 applySketch(vec2 uv) {
    vec2 off = 1.0 / vec2(1280.0, 720.0) * 1.5;
    float gx = 0.0; float gy = 0.0;
    
    // Sobel Edge
    gx += -1.0 * grayscale(texture(u_video, uv + vec2(-off.x, -off.y)).rgb);
    gx += -2.0 * grayscale(texture(u_video, uv + vec2(-off.x,  0.0)).rgb);
    gx += -1.0 * grayscale(texture(u_video, uv + vec2(-off.x,  off.y)).rgb);
    gx +=  1.0 * grayscale(texture(u_video, uv + vec2( off.x, -off.y)).rgb);
    gx +=  2.0 * grayscale(texture(u_video, uv + vec2( off.x,  0.0)).rgb);
    gx +=  1.0 * grayscale(texture(u_video, uv + vec2( off.x,  off.y)).rgb);

    gy += -1.0 * grayscale(texture(u_video, uv + vec2(-off.x, -off.y)).rgb);
    gy += -2.0 * grayscale(texture(u_video, uv + vec2( 0.0, -off.y)).rgb);
    gy += -1.0 * grayscale(texture(u_video, uv + vec2( off.x, -off.y)).rgb);
    gy +=  1.0 * grayscale(texture(u_video, uv + vec2(-off.x,  off.y)).rgb);
    gy +=  2.0 * grayscale(texture(u_video, uv + vec2( 0.0,  off.y)).rgb);
    gy +=  1.0 * grayscale(texture(u_video, uv + vec2( off.x,  off.y)).rgb);

    float edge = sqrt(gx*gx + gy*gy);
    
    // Thresholding for cleaner lines
    edge = smoothstep(0.1, 0.3, edge);
    
    // Invert: White paper (1.0), Black ink (1.0 - edge)
    // Mix with u_color for ink color (default black/blue)
    vec3 paper = vec3(0.98, 0.98, 0.95); // Slightly off-white paper
    
    // If edge is 1.0 (strong edge), we want ink color.
    // If edge is 0.0 (no edge), we want paper.
    return vec4(mix(paper, u_color, edge), 1.0);
}

// --- 8. COMIC (Halftone Dots) ---
vec4 applyComic(vec2 uv) {
    vec3 tex = texture(u_video, uv).rgb;
    float lum = grayscale(tex);
    
    // Quantize colors
    vec3 posterized = floor(tex * 4.0) / 4.0;
    
    // Halftone pattern
    float frequency = 120.0;
    vec2 nearest = 2.0 * fract(frequency * uv) - 1.0;
    float dist = length(nearest);
    float radius = 0.9 * (1.0 - lum); // Darker = larger dot
    float dot = step(radius, dist);
    
    // Mix u_color if it's not white (Pop Art tinting)
    vec3 finalColor = mix(posterized * dot, u_color, 0.1);
    
    return vec4(finalColor, 1.0);
}

// --- 9. OIL PAINT (Simplified) ---
vec4 applyOil(vec2 uv) {
    vec2 size = vec2(1280.0, 720.0);
    float radius = 4.0;
    vec3 m0 = vec3(0.0);
    
    for (float x = -radius; x <= radius; x+=1.0) {
        for (float y = -radius; y <= radius; y+=1.0) {
            m0 += texture(u_video, uv + vec2(x, y) / size).rgb;
        }
    }
    m0 /= ((2.0 * radius + 1.0) * (2.0 * radius + 1.0));
    
    // Heavy posterization makes it look more like paint strokes
    return vec4(floor(m0 * 8.0) / 8.0, 1.0);
}

// --- 10. ASCII ---
vec4 applyASCII(vec2 uv) {
    float pixels = 80.0; 
    vec2 dx = vec2(1.0 / pixels, 1.0 / pixels);
    vec2 coord = floor(uv / dx) * dx;
    float lum = grayscale(texture(u_video, coord).rgb);
    
    vec2 inner = fract(uv / dx);
    float d = distance(inner, vec2(0.5));
    
    // Simple circle char, size based on brightness
    float charMask = step(d, lum * 0.45); 
    
    return vec4(u_color * charMask, 1.0);
}

// --- 11. VHS (Tracking + Noise + Abberation) ---
vec4 applyVHS(vec2 uv) {
    // 1. Tracking Distortion (Wave at bottom/top)
    float wave = sin(uv.y * 10.0 + u_time * 10.0) * 0.005;
    
    // 2. Chromatic Aberration (RGB Split)
    float r = texture(u_video, uv + vec2(wave + 0.002, 0.0)).r;
    float g = texture(u_video, uv + vec2(wave, 0.0)).g;
    float b = texture(u_video, uv + vec2(wave - 0.002, 0.0)).b;
    
    // 3. Static Noise
    float noise = rand(uv * u_time) * 0.15;
    
    // 4. Scanlines
    float scan = sin(uv.y * 400.0) * 0.05;
    
    vec3 col = vec3(r, g, b) + noise - scan;
    return vec4(col, 1.0);
}

// --- 12. PRISM (Strong RGB Split) ---
vec4 applyPrism(vec2 uv) {
    float split = 0.015 * (1.0 + u_intensity);
    
    float r = texture(u_video, uv + vec2(split, 0.0)).r;
    float g = texture(u_video, uv).g;
    float b = texture(u_video, uv - vec2(split, 0.0)).b;
    
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
    return texture(u_video, coord);
}

// --- 14. X-RAY ---
vec4 applyXRay(vec2 uv) {
    vec3 col = texture(u_video, uv).rgb;
    float lum = grayscale(col);
    
    // Invert luminance
    float inv = 1.0 - lum;
    
    // Map to Blue/Cyan bone color
    vec3 bone = vec3(0.1, 0.2, 0.3) * inv + vec3(inv*0.8);
    
    return vec4(bone, 1.0);
}

void main() {
    // Black out-of-bounds areas when zoomed out
    if (v_uv.x < 0.0 || v_uv.x > 1.0 || v_uv.y < 0.0 || v_uv.y > 1.0) {
        outColor = vec4(0.0, 0.0, 0.0, 1.0);
        return;
    }
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
    else outColor = texture(u_video, v_uv);
}
`;
