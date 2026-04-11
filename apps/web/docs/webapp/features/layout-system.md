# Layout System — Grid Layouts & Design Templates

→ Back to [Index](../../INDEX.md) | [Web App](../README.md) | [Features](./README.md)

---

## Overview

The layout system provides **15+ pre-built layout templates** for arranging content on the canvas. Layouts range from simple grids to complex interactive designs inspired by modern portfolio websites. The system is modular, allowing layouts to be composed from reusable grid section components.

## Architecture

```
src/features/layouts/
├── hooks/
│   └── useLayoutPresets.ts           — Layout preset loading
├── ui/
│   ├── CanvasGridLayout.tsx          (5.9KB) — Grid layout manager
│   ├── GridLayoutPreview.tsx         (4.1KB) — Preview thumbnails
│   ├── GridSectionRenderer.tsx       (7.7KB) — Renders individual grid sections
│   ├── GridSectionToolbar.tsx        (12KB) — Per-section editing toolbar
│   ├── InteractiveGridSection.tsx    (20KB) — Interactive section with content
│   │
│   ├── grid-section/                 — Section type components
│   │   ├── CameraGridSection.tsx     (6.9KB) — Camera feed in grid section
│   │   ├── EmptyGridSection.tsx      (18KB) — Empty section with add-content UI
│   │   ├── ScreenShareGridSection.tsx(2KB) — Screen share in grid section
│   │   └── CanvasDesignSelector.tsx  (8.4KB) — Pick design for a grid section
│   │
│   ├── layouts/                      — Layout templates
│   │   ├── StandardGridLayout.tsx    (4KB) — Basic grid layout
│   │   ├── SliderLayout.tsx          (3.7KB) — Horizontal slider layout
│   │   ├── VerticalSliderLayout.tsx  (5.4KB) — Vertical slider layout
│   │   ├── SplitLandingLayout.tsx    (2.9KB) — Split landing page style
│   │   ├── ExpandingCardsLayout.tsx  (3.4KB) — Cards that expand on hover
│   │   ├── CaseStudyLayout.tsx       (11KB) — Case study portfolio style
│   │   ├── SimonPortfolioLayout.tsx  (18KB) — Simon-style portfolio
│   │   ├── MagnetismGridLayout.tsx   (19KB) — Magnetic cursor-following grid
│   │   ├── PerformanceFlowLayout.tsx (12KB) — Performance-focused flow
│   │   ├── PortfolioScrollLayout.tsx (11KB) — Scrollable portfolio
│   │   ├── HybridGridScene.tsx       (2KB) — Hybrid grid/scene
│   │   ├── HybridGridContainer.tsx   (1.6KB) — Container for hybrid layouts
│   │   ├── GridSectionWrapper.tsx    (6KB) — Section wrapper with controls
│   │   ├── LayoutEditorToolbar.tsx   (8.5KB) — Layout editing controls
│   │   ├── LayoutSettingsCtrl.tsx    (1.6KB) — Layout settings controller
│   │   └── dynamic/                  — Dynamic layout generators
│   │
│   └── registry/                     — Layout type registry
```

---

## Layout Templates

### Standard Grid (`StandardGridLayout`)
Basic CSS Grid with configurable columns and rows:
- 1x1, 2x1, 1x2, 2x2, 3x1, etc. grid configurations
- Each cell can contain: camera, screen share, overlay, or design
- Drag to resize grid dividers
- Gap size control

### Slider Layout (`SliderLayout`)
Horizontal carousel of content sections:
- Smooth scroll snap between sections
- Navigation arrows
- Auto-play option
- Section indicators

### Vertical Slider (`VerticalSliderLayout`)
Vertical full-screen sections:
- Scroll-snap for section-by-section viewing
- Side dots navigation
- Smooth transitions

### Split Landing (`SplitLandingLayout`)
Two-column layout with media on one side and content on the other:
- Configurable split ratio
- Left/right media placement
- Text overlay area

### Expanding Cards (`ExpandingCardsLayout`)
Cards that expand to fill the canvas on hover/click:
- Multiple cards in a row
- Active card expands, others compress
- Smooth CSS transitions
- Content per card

### Case Study (`CaseStudyLayout`)
Portfolio-style presentation with large hero sections:
- Full-width hero images
- Side-by-side content areas
- Textual descriptions with typography
- Scrollable sections

### Simon Portfolio (`SimonPortfolioLayout`) — 18KB
Inspired by Simon Kimmelman's portfolio design:
- Full-bleed imagery
- Minimal typography
- Scroll-driven animations
- Section transitions

### Magnetism Grid (`MagnetismGridLayout`) — 19KB
Interactive grid where elements follow the cursor:
- Magnetic effect (elements tilt toward cursor)
- 3D transform perspective
- Smooth spring animations
- Visually striking for creative content

### Performance Flow (`PerformanceFlowLayout`) — 12KB
Optimized layout for smooth performance:
- GPU-accelerated transforms
- Minimal repaints
- Efficient grid rendering
- Suitable for low-spec hardware

### Portfolio Scroll (`PortfolioScrollLayout`) — 11KB
Scrollable portfolio with parallax effects:
- Scroll-driven animations
- Parallax layers
- Full-screen sections
- Image galleries

---

## Grid Sections

Each grid cell is an `InteractiveGridSection` (20KB) that can hold:

| Content Type | Component | Description |
|---|---|---|
| **Camera** | `CameraGridSection` | Live camera feed with effects |
| **Screen Share** | `ScreenShareGridSection` | Screen/window capture |
| **Design** | `CanvasDesignSelector` | Pre-built HTML design overlay |
| **Empty** | `EmptyGridSection` | "Add content" placeholder with source picker |

### GridSectionToolbar (12KB)
Per-section editing controls:
- Content type selector
- Size/position adjustments
- Background color/image
- Border styling
- Remove section
- Swap with neighbor

---

## Layout Editor Toolbar (8.5KB)
Global layout editing controls:
- Layout template picker (visual preview cards)
- Add/remove grid sections
- Grid gap control
- Background settings
- Save as custom layout
- Reset to default

→ See [Canvas System](./canvas-system.md) for viewport management  
→ See [Scene Management](./scene-management.md) for per-scene layouts
