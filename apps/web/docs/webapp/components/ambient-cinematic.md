# Ambient Effects & Cinematic Overlays

→ Back to [Index](../../INDEX.md) | [Web App](../README.md) | [Components](./README.md)

---

## Overview

Two large components provide **visual atmosphere** to the canvas — ambient background effects and cinematic camera overlays. Together they total over 110KB of visual effects code.

---

## AmbientBackground (71KB)

→ Source: [AmbientBackground.tsx](file:///c:/Users/Dell/Desktop/caption-cam/src/features/stream/ui/AmbientBackground.tsx)

The **largest single component** in the codebase. Provides animated background effects rendered on a full-screen `<canvas>` element behind the main content.

### Effect Types

| Effect | Description | Rendering Technique |
|---|---|---|
| **Particles** | Floating particles (customizable shape, color, size) | `requestAnimationFrame` + Canvas 2D |
| **Snow** | Falling snowflakes with wind drift | Particle physics simulation |
| **Rain** | Rain drops with splash effects | Particle system + impact detection |
| **Fire** | Rising flame particles with glow | Warm color gradient particles |
| **Sparkles** | Twinkling star-like effects | Random flicker + fade |
| **Bubbles** | Floating transparent bubbles | Circle rendering with opacity |
| **Confetti** | Multi-colored falling rectangles | Rotating rectangle particles |
| **Smoke** | Rising smoke wisps | Soft blur particles with drift |
| **Aurora** | Northern lights wave effect | Sine wave color gradients |
| **Stars** | Night sky with twinkling stars | Fixed + random blink |
| **Matrix** | Matrix-style falling code | Character columns with fade |
| **Waves** | Ocean/sound wave animation | Sine wave rendering |
| **Fireflies** | Glowing dots with organic movement | Perlin-noise-like wandering |
| **Geometric** | Geometric shape patterns | Polygon rendering |
| **Gradient Flow** | Flowing gradient backgrounds | HSL color cycling |

### Architecture
```
AmbientBackground
├── useEffect → setup canvas + start animation loop
├── requestAnimationFrame loop
│   ├── Update particle positions (physics)
│   ├── Apply forces (gravity, wind, drift)
│   ├── Handle collisions / boundaries
│   ├── Spawn new particles (rate-controlled)
│   ├── Remove dead particles (lifecycle)
│   └── Draw all particles to canvas
└── cleanup → cancel animation frame
```

### Configuration
Each effect type has configurable parameters:
- **Particle count** — density of the effect
- **Speed** — movement velocity
- **Color palette** — array of colors
- **Size range** — min/max particle size
- **Opacity** — overall effect transparency
- **Direction** — gravity/wind direction

---

## CinematicOverlay (46KB)

→ Source: [CinematicOverlay.tsx](file:///c:/Users/Dell/Desktop/caption-cam/src/features/stream/ui/CinematicOverlay.tsx)

Renders **cinematic visual effects** as HTML/CSS overlays on top of the canvas:

### Effect Categories

#### Film Effects
| Effect | Description |
|---|---|
| Film Grain | Animated noise texture overlay |
| Film Bars | Letterbox bars (21:9, 2.35:1, etc.) |
| Vignette | Dark corners fade |
| Light Leak | Warm light bleed from edges |
| Lens Flare | Animated flare spots |
| Anamorphic | Horizontal lens streak |

#### Color Grading
| Effect | Description |
|---|---|
| Teal & Orange | Hollywood color grade |
| Bleach Bypass | Desaturated high-contrast |
| Cross Process | Cross-processing look |
| Day for Night | Simulate night from daytime footage |
| Sepia Tone | Warm vintage tone |

#### Scene Atmosphere
| Effect | Description |
|---|---|
| Fog | Rolling fog overlay |
| Dust Motes | Floating dust particles with depth of field |
| Lens Rain | Water droplets on lens effect |
| Scratches | Film scratch overlay |
| Scan Lines | CRT monitor scan line effect |

#### Motion Effects
| Effect | Description |
|---|---|
| Slow Motion | Frame interpolation simulation |
| Time-Lapse | Speed-up effect with motion blur |
| Shutter Drag | Rotary shutter effect |

### Implementation
Effects primarily use:
- CSS `mix-blend-mode` for compositing
- CSS `animation` and `@keyframes` for movement
- Semi-transparent `<div>` overlays with gradient backgrounds
- Canvas-based particle effects for complex effects (dust, grain)
- `requestAnimationFrame` for per-frame updates

---

## Stream Scenes

```
src/features/stream/ui/scenes/
├── AnimatedStreamScene.tsx    (22KB) — Animated full-screen scene renderer
├── StreamSceneRenderer.tsx    (16KB) — Scene rendering engine
├── StreamStyleSelector.tsx    (5KB) — Scene style picker UI
└── index.ts                   — Barrel exports
```

### AnimatedStreamScene (22KB)
Renders animated full-screen scenes like "Starting Soon", "Be Right Back", "Stream Ended":
- HTML/CSS/JS-based animated scenes
- Custom backgrounds, gradients, and particle effects
- Countdown timers
- Social media links
- Animated text reveals

### StreamSceneRenderer (16KB)
The engine that takes a stream scene design and renders it:
- Parses design templates from `streamSceneDesigns.ts`
- Injects user data (username, social links, colors)
- Handles animation timing and lifecycle
- Supports preview mode and full-screen mode

### StreamStyleSelector (5KB)
UI picker for choosing which stream scene design to use:
- Visual preview cards for each design
- Category filtering
- Click to apply

→ See [Animation System](../features/animation-system.md) for animation details  
→ See [Canvas System](../features/canvas-system.md) for the rendering pipeline
