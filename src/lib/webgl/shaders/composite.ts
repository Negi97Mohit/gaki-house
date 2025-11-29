// src/lib/webgl/shaders/composite.ts

export const COMPOSITE_FRAGMENT_SHADER_SOURCE = `#version 300 es
precision mediump float;

uniform sampler2D u_video;
uniform sampler2D u_mask; // MediaPipe mask (alpha channel)
uniform int u_bg_type;    // 0=none, 1=blur, 2=image
uniform sampler2D u_bg_image; // Optional background image
uniform vec4 u_bg_color;      // Optional background color

in vec2 v_uv;
out vec4 outColor;

void main() {
    vec4 fg = texture(u_video, v_uv);
    float mask = texture(u_mask, v_uv).a; // Or .r depending on MediaPipe output
    
    // Hard threshold for mask to clean up edges slightly
    float alpha = smoothstep(0.3, 0.7, mask);

    if (u_bg_type == 0) {
        // No background effect (normal video)
        outColor = fg;
    } else if (u_bg_type == 1) {
        // Blur Background
        // (Simplified blur for single-pass performance, realistically needs multi-pass)
        // For now, we mix with a dark color to simulate "background dimmed" or use simple pixelation
        // Real blur in 1 pass is expensive.
        vec4 bg = texture(u_video, v_uv, 4.0); // LOD bias for fake blur if mipmaps exist
        outColor = mix(bg, fg, alpha);
    } else if (u_bg_type == 2) {
        // Image Background
        vec4 bg = texture(u_bg_image, v_uv);
        outColor = mix(bg, fg, alpha);
    } else {
        outColor = fg;
    }
}
`;
