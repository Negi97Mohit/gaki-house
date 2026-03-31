# Component Architecture

→ Back to [Index](../../INDEX.md) | [Web App](../README.md)

---

## Overview

Components are organized across multiple directories based on their scope:

| Location | Scope | Examples |
|---|---|---|
| `src/pages/Index/components/` | Studio page only | Workspace-specific UI |
| `src/pages/Edit/components/` | Editor page only | Editor-specific UI |
| `src/pages/platform/components/` | Platform pages only | StreamCard, CategoryCard |
| `src/pages/Mobile/` | Mobile pages only | Mobile-optimized variants |
| `src/features/*/ui/` | Feature-scoped | AICommandPopover, GoLivePanel |
| `src/shared/ui/` | App-wide shared | shadcn/ui component library |
| `src/components/` | Legacy (being migrated) | Stub directories for future work |

## Core Components

These are the highest-impact components that define the application's visual and functional structure:

| Component | Document | Responsibility |
|---|---|---|
| **VideoCanvas** | [video-canvas.md](./video-canvas.md) | Core stage — renders one scene with all layers |
| **BottomNavigation** | [bottom-navigation.md](./bottom-navigation.md) | Main control bar (mic, camera, record, tools) |
| **SceneTabs** | [scene-tabs.md](./scene-tabs.md) | Scene management panel (create, switch, reorder) |
| **FloatingControlsPanel** | [settings-panel.md](./settings-panel.md) | Settings sidebar (captions, effects, styles) |

## Deep-Dive Component Docs

| Document | What it covers | Components Documented |
|---|---|---|
| [Studio Panels](./studio-panels.md) | All 12 sidebar panels | AudioMixer, CanvasDesigns, DynamicStyles, Settings, SocialBanners, FileVault, GSAP, Text, Tools, etc. |
| [Canvas Internals](./canvas-internals.md) | All 30 canvas rendering files | CanvasView, CanvasContent, HoverToolbar, OverlayLayer, HybridDraggable, DraggableFileViewer, MultiLayerText, Excalidraw, 3D viewer, etc. |
| [PiP Controls](./pip-controls.md) | PiP camera system | PipControlsToolbar + 7 sub-menus (Layout, Style, Effects, Cinematic, Background, Camera, Zoom) |
| [Stream Config](./stream-config.md) | Broadcast setup UI | StreamConfigurationModal (47KB), StreamPlatformSelector (25KB), FatalErrorDialog, SavedSessions |
| [Media Controls](./media-controls.md) | Bottom bar controls | MediaControls, AIControls, SceneControls, VideoSettingsDialog (30KB camera/effects settings) |
| [Ambient & Cinematic](./ambient-cinematic.md) | Visual atmosphere | AmbientBackground (71KB, 15+ particle effects), CinematicOverlay (46KB, film/color/atmosphere effects) |
| [Animation Editor](./animation-editor.md) | Animation creation | AnimationLibraryPanel, GSAPAnimationEditor, SmartTextAnimator |
| [Grid Sections](./grid-sections.md) | Interactive grid panels | EmptyGridSection (add content), InteractiveGridSection (camera+text), GridSectionToolbar, CanvasDesignSelector |

## shadcn/ui Components

Located in `src/shared/ui/`, these are pre-built, accessible UI primitives from the shadcn/ui library built on Radix UI:

| Component | Radix Primitive | Usage |
|---|---|---|
| Button | — | Primary action trigger |
| Dialog | `@radix-ui/react-dialog` | Modal windows |
| Popover | `@radix-ui/react-popover` | Floating content panels |
| DropdownMenu | `@radix-ui/react-dropdown-menu` | Context and action menus |
| Select | `@radix-ui/react-select` | Custom select dropdowns |
| Slider | `@radix-ui/react-slider` | Range inputs (opacity, volume) |
| Switch | `@radix-ui/react-switch` | Toggle switches |
| Tabs | `@radix-ui/react-tabs` | Tabbed interfaces |
| Accordion | `@radix-ui/react-accordion` | Collapsible sections |
| Toast | `@radix-ui/react-toast` | Notifications (+ Sonner) |
| Tooltip | `@radix-ui/react-tooltip` | Hover tooltips |
| Label | `@radix-ui/react-label` | Form labels |
| ScrollArea | `@radix-ui/react-scroll-area` | Custom scrollbars |
| Separator | `@radix-ui/react-separator` | Visual dividers |
| Input | — | Text inputs |
| Card | — | Content containers |

## Component Rendering Tree

```
App.tsx
├── Providers (Query, Log, Debug, Auth, Theme, Tooltip)
├── Loader (splash screen)
│
├── "/" → Index.tsx (Studio)
│   ├── VideoCanvas (×2 during transitions)
│   │   ├── CameraRenderer (WebGL effects)
│   │   ├── DraggableOverlay (AI HTML, ×N)
│   │   ├── DraggableBrowser (iframe, ×N)
│   │   ├── DraggableFileViewer (media, ×N)
│   │   ├── DraggableTextOverlay (rich text, ×N)
│   │   ├── DraggableGraph (charts, ×N)
│   │   ├── DraggableAmbientEffect (particles, ×N)
│   │   ├── CaptionRenderer (animated captions)
│   │   └── AICommandPopover (AI input)
│   ├── SceneTabs (right panel)
│   ├── BottomNavigation (bottom bar)
│   │   ├── LayoutControls
│   │   └── ToolsPopover
│   │       ├── FloatingAssetSearch → AssetLibrary
│   │       └── InstructionsDialog
│   ├── FloatingControlsPanel (settings sidebar)
│   │   └── StyleControls (caption style form)
│   ├── ExcalidrawOverlay (drawing canvas)
│   ├── SavedSessionsPanel (sessions library)
│   └── TransitionPopover (transition editor)
│
├── "/platform/*" → PlatformLayout
│   └── (Platform page components)
│
└── "/m/*" → MobileLayout
    └── (Mobile page components)
```

## Legacy/Stub Directories

These directories exist but are currently empty or contain deprecated components:

| Directory | Status |
|---|---|
| `src/components/audio/` | Empty stub |
| `src/components/canvas/` | Empty stub |
| `src/components/chat/` | Empty stub |
| `src/components/obs/` | Empty stub |
| `src/components/filters/` | Empty stub |
