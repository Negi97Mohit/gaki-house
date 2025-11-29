// src/lib/webgl/shaders/effects.ts

export const EFFECTS_FRAGMENT_SHADER_SOURCE = `#version 300 es
precision mediump float;

uniform sampler2D u_video;
uniform float u_time;
uniform int u_filter_type; // 0=none, 1=pixel, 2=hologram, 3=neon, 4=thermal, 5=mirror
uniform float u_intensity; // generic intensity slider
uniform vec3 u_color;      // generic color picker

in vec2 v_uv;
out vec4 outColor;

// --- UTILS ---
float rand(vec2 co) {
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

// --- FILTERS ---

vec4 applyPixelate(vec2 uv, float pixels) {
    float dx = 100.0 * (1.0 - u_intensity) + 10.0; // Dynamic pixel size
    vec2 coord = floor(uv * dx) / dx;
    return texture(u_video, coord);
}

vec4 applyHologram(vec2 uv, float time) {
    float shift = sin(time * 0.005) * 0.01 * u_intensity;
    vec4 r = texture(u_video, uv + vec2(shift, 0.0));
    vec4 g = texture(u_video, uv);
    vec4 b = texture(u_video, uv - vec2(shift, 0.0));
    
    // Scanlines
    float scan = sin(uv.y * 800.0 + time * 0.1) * 0.1 + 0.9;
    
    return vec4(r.r, g.g, b.b, 1.0) * scan;
}

vec4 applyNeonEdge(vec2 uv) {
    vec2 offset = 1.0 / vec2(1280.0, 720.0);
    vec4 n = texture(u_video, uv + vec2(0.0, -offset.y));
    vec4 s = texture(u_video, uv + vec2(0.0, offset.y));
    vec4 e = texture(u_video, uv + vec2(offset.x, 0.0));
    vec4 w = texture(u_video, uv + vec2(-offset.x, 0.0));
    
    float edge = distance(n, s) + distance(e, w);
    
    if (edge > 0.1) {
        return vec4(u_color * edge * u_intensity * 5.0, 1.0);
    }
    return texture(u_video, uv); // Passthrough if not edge
}

vec4 applyThermal(vec2 uv) {
    vec4 color = texture(u_video, uv);
    float lum = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    
    vec3 c;
    if (lum < 0.25) c = mix(vec3(0,0,1), vec3(0,1,1), lum*4.0);
    else if (lum < 0.5) c = mix(vec3(0,1,1), vec3(0,1,0), (lum-0.25)*4.0);
    else if (lum < 0.75) c = mix(vec3(0,1,0), vec3(1,1,0), (lum-0.5)*4.0);
    else c = mix(vec3(1,1,0), vec3(1,0,0), (lum-0.75)*4.0);
    
    return vec4(c, 1.0);
}

vec4 applyMirror(vec2 uv) {
    vec2 coord = uv;
    if (coord.x > 0.5) coord.x = 1.0 - coord.x;
    return texture(u_video, coord);
}

void main() {
    if (u_filter_type == 1) outColor = applyPixelate(v_uv, 50.0);
    else if (u_filter_type == 2) outColor = applyHologram(v_uv, u_time);
    else if (u_filter_type == 3) outColor = applyNeonEdge(v_uv);
    else if (u_filter_type == 4) outColor = applyThermal(v_uv);
    else if (u_filter_type == 5) outColor = applyMirror(v_uv);
    else outColor = texture(u_video, v_uv);
}
`;
