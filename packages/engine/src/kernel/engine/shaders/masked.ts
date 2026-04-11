
export const MASKED_FRAGMENT_SHADER_SOURCE = `#version 300 es
precision mediump float;

uniform sampler2D u_video;
uniform sampler2D u_mask;
uniform float u_scale;
uniform vec2 u_offset;

in vec2 v_uv;
out vec4 outColor;

void main() {
  vec2 uv = v_uv;

  // Since vertex shader already handles scale/offset for v_uv, we might just use it directly.
  // BUT the vertex shader logic was: v_uv = (a_uv - 0.5) / scale + 0.5 + u_offset;
  // If the mask is ALSO mapped to the same coordinate space, we use the same UV.
  
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    outColor = vec4(0.0, 0.0, 0.0, 0.0);
    return;
  }

  // Sample video color
  vec4 color = texture(u_video, uv);
  
  // Sample mask
  // MediaPipe SelfieSegmentation often returns red channel or alpha. 
  // Assuming the mask texture is also properly aligned to these UVs.
  vec4 maskColor = texture(u_mask, uv);
  
  // Use Red channel for mask value (standard for single channel masks)
  float alpha = maskColor.r; 
  
  // Apply mask to alpha with some sharpening
  // Using wider range to allow for anti-aliasing from the high quality confidence mask
  float alphaFinal = smoothstep(0.1, 0.9, alpha);
  // Optional: Add a multiplier if it's too faint, but usually 0-1 is correct
  
  outColor = vec4(color.rgb, alphaFinal);
}
`;
