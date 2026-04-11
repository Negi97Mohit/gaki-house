# Settings Panel (FloatingControlsPanel)

→ Back to [Index](../../INDEX.md) | [Components](./README.md)

---

## Overview

`FloatingControlsPanel` is the **main settings sidebar** that slides in from the left. It contains accordion sections for all major style and effect settings.

## Accordion Sections

| Section | Controls |
|---|---|
| **Caption Style** | Font, size, color, background, border, text shadow, alignment |
| **Dynamic Caption Style** | Select animation (Karaoke, Pop Up, Typewriter, etc.) |
| **Static Presets** | Pre-built caption style presets from `captionPresets.ts` |
| **Video Filters** | 50+ CSS filter presets from `filters.ts` |
| **Camera Effects** | Neon Edge, auto-framing, background blur/replace |
| **Saved Overlays** | Manage AI-generated overlay library |
| **Background** | Canvas background color, image, or blur |

## Sub-Components

### `StyleControls`
A reusable form component for editing `CaptionStyle` properties:
- Font family selector (100+ fonts from `fonts.ts`)
- Font size slider
- Color pickers (text, background, border)
- Opacity slider
- Border width and radius
- Text shadow controls
- Text alignment

## Interaction

- **Toggle:** Click settings button in BottomNavigation
- **Close:** Click outside (via `useOnClickOutside`)
- **Persistence:** Changes update `useSceneStore.setCaptionStyle()` immediately
- **Per-scene:** Each scene has its own settings; switching scenes updates the panel

## State

- `openSections: string[]` — Tracks which accordion sections are expanded
- `showSettings` in `useUiStore` — Controls panel visibility

→ See [Caption System](../features/caption-system.md) for how styles are applied  
→ See [Canvas System](../features/canvas-system.md) for effects pipeline
