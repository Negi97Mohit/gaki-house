// src/lib/webgl/shaders/vertex.ts

export const VERTEX_SHADER_SOURCE = `#version 300 es
layout(location = 0) in vec2 a_position;
layout(location = 1) in vec2 a_uv;

uniform float u_scale;
uniform vec2 u_offset;

out vec2 v_uv;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  float scale = u_scale > 0.0 ? u_scale : 1.0;
  vec2 uv = (a_uv - 0.5) / scale + 0.5 + u_offset;
  // Clamp UVs so edge pixels stretch cleanly when zoomed out
  v_uv = clamp(uv, vec2(0.0), vec2(1.0));
}
`;
