# Animation Editor

→ Back to [Index](../../INDEX.md) | [Web App](../README.md) | [Components](./README.md)

---

## Overview

The animation editor provides a **visual interface for creating and editing GSAP/Anime.js animations**. It includes a library of pre-built animations, a timeline editor, and real-time preview.

## Components

```
src/features/animation/ui/
├── AnimationLibraryPanel.tsx    (16KB) — Browse and select animations
├── AnimationEditor.tsx          (7.5KB) — Timeline-based animation editor
├── AnimationGridItem.tsx        (4.2KB) — Individual animation card with preview
├── GSAPAnimationEditor.tsx      (17KB) — GSAP-specific animation builder
├── SmartTextAnimator.tsx        (5.8KB) — Text animation with AI suggestions
└── editor/                      — Advanced editor sub-components
```

---

## AnimationLibraryPanel (16KB)

→ Source: [AnimationLibraryPanel.tsx](file:///c:/Users/Dell/Desktop/caption-cam/src/features/animation/ui/AnimationLibraryPanel.tsx)

A browsable library of animation presets:

### Categories
| Category | Examples |
|---|---|
| **Entrances** | Fade In, Slide In, Scale Up, Bounce In, Rotate In |
| **Exits** | Fade Out, Slide Out, Scale Down, Fly Out |
| **Emphasis** | Pulse, Shake, Bounce, Wobble, Flash, Rubberband |
| **Loops** | Spin, Float, Breathe, Glow, Orbit |
| **Text** | Typewriter, Character Reveal, Word Bounce, Letter Cascade |
| **Complex** | Morph, Stagger, Parallax, Elastic |

### Features
- Visual preview for each animation (hover to play)
- Category tabs for filtering
- Search by name
- Click to apply to selected overlay
- Configurable: duration, delay, easing, repeat count
- Managed by `useUiStore.showAnimationLibrary`

---

## AnimationEditor (7.5KB)

Timeline-based editor for fine-tuning animation properties:

| Property | Control |
|---|---|
| Duration | Slider (0.1s - 10s) |
| Delay | Slider (0 - 5s) |
| Easing | Dropdown (ease, ease-in, ease-out, cubic-bezier presets) |
| Repeat | Counter (0 = once, -1 = infinite) |
| Direction | Normal, reverse, alternate |
| Fill Mode | None, forwards, backwards, both |

---

## GSAPAnimationEditor (17KB)

→ Source: [GSAPAnimationEditor.tsx](file:///c:/Users/Dell/Desktop/caption-cam/src/features/animation/ui/GSAPAnimationEditor.tsx)

A specialized editor for GSAP timeline animations:

### Timeline View
- Visual timeline with keyframe markers
- Drag keyframes to adjust timing
- Multi-property animation tracks (position, scale, rotation, opacity)
- Preview play/pause controls
- Loop toggle

### Property Controls
| Property Group | Controls |
|---|---|
| **Transform** | Position X/Y, Scale X/Y, Rotation, Skew |
| **Appearance** | Opacity, Color, Border radius |
| **Text** | Font size, Letter spacing, Word spacing |
| **3D** | RotateX/Y/Z, Perspective |

### GSAP Features Used
- `gsap.timeline()` — chained animation sequences
- `gsap.to() / gsap.from()` — tween targets
- `stagger` — staggered animations for multiple elements
- `ScrollTrigger` — scroll-based animations (for scenes)
- Custom easing functions

---

## AnimationGridItem (4.2KB)

Individual animation preview card:
- Name and category label
- Hover-to-preview animation
- Duration indicator
- Click handler for selection
- Visual icon per category

---

## SmartTextAnimator (5.8KB)

AI-enhanced text animation system:
- Takes text content and suggests appropriate animations
- Word-by-word animation generation
- Character-level animation for special effects
- Integrates with the caption rendering system

→ See [Animation System](../features/animation-system.md) for the core animation architecture  
→ See [GSAP Animations Panel](./studio-panels.md#gsap-animations-panel) for the sidebar panel
