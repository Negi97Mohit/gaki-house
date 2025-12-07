// src/lib/webgl/shaders/composite.ts

export const COMPOSITE_FRAGMENT_SHADER_SOURCE = `#version 300 es
precision mediump float;

uniform sampler2D u_video;
uniform sampler2D u_mask; // MediaPipe mask (Grayscale)
uniform int u_bg_type;    // 0=none, 1=blur, 2=image
uniform sampler2D u_bg_image; // Optional background image
uniform vec4 u_bg_color;      // Optional background color

in vec2 v_uv;
out vec4 outColor;

void main() {
    vec4 fg = texture(u_video, v_uv);
    
    // CRITICAL FIX: Read the Red channel (Luminance) instead of Alpha.
    // MediaPipe masks are often opaque (Alpha=1) but grayscale.
    float maskVal = texture(u_mask, v_uv).r; 
    
    // Use smoothstep for cleaner edges
    float alpha = smoothstep(0.1, 0.6, maskVal);

    if (u_bg_type == 0) {
        // No background effect
        outColor = fg;
    } else if (u_bg_type == 1) {
        // Blur Background
        // Using LOD bias (mipmap level 4.0) to simulate blur
        vec4 bg = texture(u_video, v_uv, 4.0); 
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
