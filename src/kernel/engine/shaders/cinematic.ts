
export const CINEMATIC_FRAGMENT_SHADER_SOURCE = `#version 300 es
precision mediump float;

uniform sampler2D u_video;
uniform float u_strength; // Distortion strength: 0.0 = none, > 0.0 = barrel, < 0.0 = pincushion
uniform float u_cylindrical_ratio; // 1.0 = spherical, < 1.0 = cylindrical (anamorphic)

in vec2 v_uv;
out vec4 outColor;

void main() {
  vec2 uv = v_uv * 2.0 - 1.0; // Map to [-1, 1]
  
  // Fisheye / Barrel Distortion
  // Formula: r' = r * (1 + k * r^2)
  
  float r = length(uv);
  
  // Optional: cylindrical ratio for anamorphic look (stretch X more than Y)
  // For standard fisheye, ratio is 1.0
  
  float distortion = 1.0 + u_strength * r * r;
  
  // Apply distortion
  vec2 warpedUV = uv * distortion;
  
  // Map back to [0, 1]
  warpedUV = (warpedUV + 1.0) * 0.5;
  
  // Check bounds to avoid streaking or wrapping artifacts
  if (warpedUV.x < 0.0 || warpedUV.x > 1.0 || warpedUV.y < 0.0 || warpedUV.y > 1.0) {
    outColor = vec4(0.0, 0.0, 0.0, 1.0); // Black border
  } else {
    outColor = texture(u_video, warpedUV);
  }
}
`;
