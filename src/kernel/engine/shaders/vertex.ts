// src/lib/webgl/shaders/vertex.ts

export const VERTEX_SHADER_SOURCE = `#version 300 es
layout(location = 0) in vec2 a_position;
layout(location = 1) in vec2 a_uv;

uniform float u_scale;
uniform vec2 u_offset;

out vec2 v_uv;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  // Apply zoom (scale) and pan (offset)
  // Default scale is 1.0, default offset is (0.0, 0.0)
  // We subtract offset because if we want to move the camera RIGHT, we shift the texture LEFT
  float scale = u_scale > 0.0 ? u_scale : 1.0;
  v_uv = (a_uv - 0.5) / scale + 0.5 + u_offset;
  
  // Flip Y if needed (often WebGL textures are flipped)
  // v_uv.y = 1.0 - v_uv.y; 
}
`;
