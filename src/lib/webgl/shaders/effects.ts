// src/lib/webgl/shaders/effects.ts

export const EFFECTS_FRAGMENT_SHADER_SOURCE = `#version 300 es
precision mediump float;

uniform sampler2D u_video;
uniform float u_time;
uniform int u_filter_type; 
// 1=pixel, 2=hologram, 3=neon, 4=thermal, 5=mirror, 6=tri-tone (anime)

uniform float u_intensity;
uniform vec3 u_color;       // Primary color / Shadow color (Anime)
uniform vec3 u_color_mid;   // Midtone color (Anime)
uniform vec3 u_color_high;  // Highlight color (Anime)

in vec2 v_uv;
out vec4 outColor;

// --- UTILS ---
float grayscale(vec3 color) {
    return dot(color, vec3(0.299, 0.587, 0.114));
}

// --- 1. PIXELATE ---
vec4 applyPixelate(vec2 uv) {
    float pixels = 500.0 * (1.0 - u_intensity * 0.9) + 20.0; 
    vec2 dx = vec2(1.0 / pixels, 1.0 / pixels);
    vec2 coord = floor(uv / dx) * dx;
    return texture(u_video, coord);
}

// --- 2. HOLOGRAM / GLITCH ---
vec4 applyHologram(vec2 uv) {
    float shiftAmt = 0.01 * u_intensity; 
    float shift = sin(u_time * 3.0) * shiftAmt;
    float r = texture(u_video, uv + vec2(shift, 0.0)).r;
    float g = texture(u_video, uv).g;
    float b = texture(u_video, uv - vec2(shift, 0.0)).b;
    vec4 color = vec4(r, g, b, 1.0);
    
    float scanline = sin(uv.y * 800.0 + u_time * 5.0);
    color.rgb -= scanline * 0.1;
    
    float lum = grayscale(color.rgb);
    vec3 tinted = color.rgb * u_color * 1.5; 
    return vec4(mix(color.rgb, tinted, 0.4), 1.0);
}

// --- 3. NEON EDGE ---
vec4 applyNeonEdge(vec2 uv) {
    vec2 texSize = vec2(1280.0, 720.0);
    vec2 off = 1.0 / texSize * 1.5;

    float gx = 0.0;
    gx += -1.0 * grayscale(texture(u_video, uv + vec2(-off.x, -off.y)).rgb);
    gx += -2.0 * grayscale(texture(u_video, uv + vec2(-off.x,  0.0)).rgb);
    gx += -1.0 * grayscale(texture(u_video, uv + vec2(-off.x,  off.y)).rgb);
    gx +=  1.0 * grayscale(texture(u_video, uv + vec2( off.x, -off.y)).rgb);
    gx +=  2.0 * grayscale(texture(u_video, uv + vec2( off.x,  0.0)).rgb);
    gx +=  1.0 * grayscale(texture(u_video, uv + vec2( off.x,  off.y)).rgb);

    float gy = 0.0;
    gy += -1.0 * grayscale(texture(u_video, uv + vec2(-off.x, -off.y)).rgb);
    gy += -2.0 * grayscale(texture(u_video, uv + vec2( 0.0, -off.y)).rgb);
    gy += -1.0 * grayscale(texture(u_video, uv + vec2( off.x, -off.y)).rgb);
    gy +=  1.0 * grayscale(texture(u_video, uv + vec2(-off.x,  off.y)).rgb);
    gy +=  2.0 * grayscale(texture(u_video, uv + vec2( 0.0,  off.y)).rgb);
    gy +=  1.0 * grayscale(texture(u_video, uv + vec2( off.x,  off.y)).rgb);

    float edge = sqrt(gx*gx + gy*gy);
    edge = smoothstep(0.1, 0.4, edge);
    
    vec3 edgeColor = u_color * edge * 2.0;
    vec3 bg = texture(u_video, uv).rgb * 0.1;
    return vec4(bg + edgeColor, 1.0);
}

// --- 4. THERMAL ---
vec4 applyThermal(vec2 uv) {
    vec4 original = texture(u_video, uv);
    float lum = grayscale(original.rgb);
    
    vec3 c0 = vec3(0.0, 0.0, 1.0);
    vec3 c1 = vec3(0.0, 1.0, 1.0);
    vec3 c2 = vec3(0.0, 1.0, 0.0);
    vec3 c3 = vec3(1.0, 1.0, 0.0);
    vec3 c4 = vec3(1.0, 0.0, 0.0);
    
    vec3 term;
    if (lum < 0.25) term = mix(c0, c1, lum * 4.0);
    else if (lum < 0.5) term = mix(c1, c2, (lum - 0.25) * 4.0);
    else if (lum < 0.75) term = mix(c2, c3, (lum - 0.5) * 4.0);
    else term = mix(c3, c4, (lum - 0.75) * 4.0);
    
    vec3 colorized = term * u_color * 2.0; 
    return vec4(mix(term, colorized, 0.3), 1.0);
}

// --- 5. MIRROR ---
vec4 applyMirror(vec2 uv) {
    vec2 coord = uv;
    if (u_intensity < 0.3) {
        if (coord.x > 0.5) coord.x = 1.0 - coord.x;
    } else if (u_intensity < 0.6) {
        if (coord.x > 0.5) coord.x = 1.0 - coord.x;
        if (coord.y > 0.5) coord.y = 1.0 - coord.y;
    } else {
        vec2 centered = uv - 0.5;
        float r = length(centered);
        float a = atan(centered.y, centered.x);
        float sides = 6.0;
        a = mod(a, 3.14159 * 2.0 / sides);
        a = abs(a - 3.14159 / sides);
        coord = r * vec2(cos(a), sin(a)) + 0.5;
    }
    return texture(u_video, coord);
}

// --- 6. TRI-TONE / ANIME STYLE ---
// Maps luminance to 3 specific colors (Shadow, Mid, Highlight)
vec4 applyTriTone(vec2 uv) {
    vec4 tex = texture(u_video, uv);
    float lum = grayscale(tex.rgb);
    
    // Add simple edge detection for "ink" lines
    vec2 texSize = vec2(1280.0, 720.0);
    vec2 off = 1.0 / texSize;
    float gx = -1.0 * grayscale(texture(u_video, uv + vec2(-off.x, 0.0)).rgb) + 1.0 * grayscale(texture(u_video, uv + vec2(off.x, 0.0)).rgb);
    float gy = -1.0 * grayscale(texture(u_video, uv + vec2(0.0, -off.y)).rgb) + 1.0 * grayscale(texture(u_video, uv + vec2(0.0, off.y)).rgb);
    float edge = sqrt(gx*gx + gy*gy);
    
    vec3 finalColor;
    
    // Thresholds for the 3 tones
    float lowThreshold = 0.3;
    float highThreshold = 0.6;
    
    if (edge > 0.15) {
        // Outline color (Shadow)
        finalColor = u_color; 
    } else if (lum < lowThreshold) {
        finalColor = u_color;
    } else if (lum < highThreshold) {
        finalColor = u_color_mid;
    } else {
        finalColor = u_color_high;
    }
    
    return vec4(finalColor, 1.0);
}

void main() {
    if (u_filter_type == 1) outColor = applyPixelate(v_uv);
    else if (u_filter_type == 2) outColor = applyHologram(v_uv);
    else if (u_filter_type == 3) outColor = applyNeonEdge(v_uv);
    else if (u_filter_type == 4) outColor = applyThermal(v_uv);
    else if (u_filter_type == 5) outColor = applyMirror(v_uv);
    else if (u_filter_type == 6) outColor = applyTriTone(v_uv);
    else outColor = texture(u_video, v_uv);
}
`;
