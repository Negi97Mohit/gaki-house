// src/lib/webgl/shaders/basic.ts

export const BASIC_FRAGMENT_SHADER_SOURCE = `#version 300 es
precision mediump float;

uniform sampler2D u_video;
uniform float u_brightness;
uniform float u_contrast;
uniform float u_saturation;

in vec2 v_uv;
out vec4 outColor;

vec3 adjustSaturation(vec3 color, float adjustment) {
    const vec3 luminanceWeight = vec3(0.2126, 0.7152, 0.0722);
    vec3 grayscale = vec3(dot(color, luminanceWeight));
    return mix(grayscale, color, adjustment);
}

vec3 adjustContrast(vec3 color, float adjustment) {
    return (color - 0.5) * adjustment + 0.5;
}

void main() {
    vec4 texColor = texture(u_video, v_uv);
    vec3 color = texColor.rgb;

    color *= u_brightness;
    color = adjustContrast(color, u_contrast);
    color = adjustSaturation(color, u_saturation);

    outColor = vec4(color, texColor.a);
}
`;
