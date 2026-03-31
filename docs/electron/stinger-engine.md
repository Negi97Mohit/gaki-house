# Stinger Transition Engine

→ Back to [Index](../INDEX.md) | [Electron](./README.md)

---

## Overview

GAKI Studio's GPU Compositor supports full-motion video stinger transitions (similar to OBS). This enables professional scene switches using `.webm` animations with alpha transparency.

## Architecture

The stinger engine involves three critical layers: Native File Streaming, the UI playback controller, and the GPU Fragment Shader mapping.

### 1. `local-asset://` Native File Streaming
To achieve high-performance video loading, massive stinger videos are NOT cached inside IndexedDB. Instead, the Electron Main Process maps absolute file paths natively using `protocol.handle('local-asset')`.
The stinger `<video>` element points its `src` to `local-asset://C:/path/to/stinger.webm`.

### 2. The `StingerController`
Located in `src/kernel/compositor/StingerController.ts`, this class creates a hidden `<video>` element. 
- During `CompositorBridge.transition()`, it preloads and plays the video.
- Utilizing `requestVideoFrameCallback`, the controller extracts precisely synchronized `ImageBitmap` frames.
- These frames are pumped instantly over `postMessage` into the Compositor Worker.

### 3. WebGL GPU Shader (TRANSITION_FRAG)
Inside `TransitionRenderer.ts`, the fragment shader natively parses Stinger transitions (`u_type == 10`).

```glsl
vec4 baseColor = p < u_stingerCutPoint ? fromColor : toColor;
vec4 stingerColor = texture(u_stingerFrame, v_texCoord);
fragColor = vec4(mix(baseColor.rgb, stingerColor.rgb, stingerColor.a), max(baseColor.a, stingerColor.a));
```

- When the transition kicks off, the canvas alpha-composites `u_stingerFrame` directly over the underlying scene.
- At precisely `u_stingerCutPoint` (a percentage defined by the user from 0% to 100%), the underlying scene instantly swaps from the Outgoing Scene to the Incoming Scene behind the stinger animation.

### Fallback Formats
While modern `VP8/VP9` `.webm` files are standard since they preserve alpha transparency, users can select an `.mp4` file. An `.mp4` file simply ignores `stingerColor.a` checks and paints solid video, obscuring the hard cut totally. The UI explicitly places an inline warning regarding `.mp4` usage natively.
