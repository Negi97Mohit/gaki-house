# Interactive Filters Guide

This document explains the 5 new interactive video filters that have been added to GAKI.

## Available Filters

### 1. Neon Edge (Enhanced)
- **Type**: Edge Detection
- **Effect**: Detects edges in the video feed and highlights them with glowing neon colors
- **Controls**: 
  - Intensity slider (1-5)
  - Color picker (supports hex colors and presets like cyan, magenta, green, etc.)
- **Best for**: Creating futuristic, cyberpunk aesthetics

### 2. Hologram Glitch 🆕
- **Type**: Digital/Glitch Effect  
- **Effect**: Makes you appear as a holographic projection with:
  - RGB channel split (chromatic aberration)
  - Animated scan lines
  - Random digital glitches
  - Semi-transparent overlay
- **Best for**: Sci-fi presentations, retro-futuristic streams

### 3. Pixelated 🆕
- **Type**: Retro Effect
- **Effect**: Converts your video to pixel art style:
  - 8x8 pixel blocks
  - Color posterization (64-level quantization)
  - Retro gaming aesthetic
- **Best for**: Retro gaming streams, 8-bit style content

### 4. Comic Book 🆕
- **Type**: Artistic Effect
- **Effect**: Applies comic book/pop art styling:
  - Halftone dot patterns
  - Color posterization (3-level quantization)
  - Bold, simplified colors
- **Best for**: Artistic presentations, creative content

### 5. ASCII Art 🆕
- **Type**: Text-based Effect
- **Effect**: Converts video to ASCII characters in real-time:
  - Uses 12-character gradient: @ # $ % ? * + ; : , . (space)
  - Green terminal-style text on black background
  - 8px monospace font
- **Best for**: Developer streams, hacker aesthetic, terminal-style presentations

### 6. Thermal Vision 🆕
- **Type**: Heat Map Effect
- **Effect**: Creates thermal camera visualization:
  - Cold areas: Blue → Cyan
  - Cool areas: Cyan → Green
  - Warm areas: Green → Yellow
  - Hot areas: Yellow → White
  - Maps brightness to temperature colors
- **Best for**: Scientific presentations, dramatic effect, night vision look

## Technical Implementation

All filters use real-time canvas processing:
- Process every frame at 30fps
- Use ImageData manipulation for pixel-level effects
- Apply custom algorithms (edge detection, quantization, color mapping, etc.)
- Rendered with `requestAnimationFrame` for smooth performance

## Usage

1. Hover over any camera/PiP element
2. Click the effects icon in the floating toolbar
3. Select "Interactive Filters" from the dropdown
4. Choose your desired filter
5. Adjust settings (for filters that support customization)

## Performance Notes

- **Hologram**: Animated, uses time-based effects
- **ASCII**: Most CPU-intensive (text rendering)
- **Pixel/Comic**: Fastest (simple block processing)
- **Thermal/Neon**: Medium (per-pixel calculations)

All filters are optimized for real-time streaming and recording.
