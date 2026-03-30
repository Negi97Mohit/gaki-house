# Animation System

→ Back to [Index](../../INDEX.md) | [Features](./README.md)

---

## Overview

The animation system provides **procedural and template-based animations** for overlays using GSAP and Anime.js. It can generate animated HTML elements (banners, lower-thirds, social alerts) with configurable timing and effects.

## Feature Module

```
src/features/animation/
├── hooks/
│   └── useAnimationEngine.ts
├── lib/
│   ├── animationGenerator.ts     — Procedural animation generation
│   └── animationLibrary.ts       — Pre-built animation templates
└── ui/
    └── (AnimationPicker, AnimationPreview)
```

## Key Libraries

| Library | Version | Purpose |
|---|---|---|
| GSAP | 3.14.2 | Timeline-based professional animations |
| Anime.js | 4.2.2 | Lightweight declarative animations |
| Framer Motion | 12.23.22 | React-native animations |

## Animation Sources

### `src/lib/gsapHtmlGenerator.ts`
Generates complete HTML/CSS/JS strings with embedded GSAP animations:
- Lower thirds
- Social media alerts
- Countdown timers
- Animated text reveals
- Stinger transitions

### `src/lib/animationGenerator.ts`
Procedural animation generator that creates CSS keyframe animations:
- Entry animations (slide, fade, scale, rotate)
- Exit animations
- Loop animations (pulse, bounce, glow)
- Configurable duration, easing, delay

### `src/lib/animeStyles.ts`
Anime.js style presets for caption and overlay animations.

### `src/hooks/useAnimeStyles.ts`
React hook for applying Anime.js animations to DOM elements.

## Stream Scene Designs

→ Source: [streamSceneDesigns.ts](file:///c:/Users/Dell/Desktop/caption-cam/src/lib/streamSceneDesigns.ts) (38KB)

A large library of pre-designed stream scenes and overlay templates including:
- Starting soon screens
- Be right back screens
- Stream ended screens
- Social media panels
- Chat overlays
- Alert designs
- Lower third designs

→ See [Draggable Elements](./draggable-elements.md) for how animations apply to overlays
