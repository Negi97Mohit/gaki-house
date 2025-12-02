# GAKI 小子 - Complete Application Documentation

![Version](https://img.shields.io/badge/version-0.0.0-blue)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.4.19-646CFF?logo=vite)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Core Features](#core-features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [File Inventory with LOC](#file-inventory-with-loc)
- [Architecture & Data Flow](#architecture--data-flow)
- [API Integrations](#api-integrations)
- [Current Limitations](#current-limitations)
- [Development Guide](#development-guide)
- [References](#references)

---

## 🎯 Overview

**GAKI 小子** is a next-generation, AI-powered web application for creating professional video content with real-time effects, live captions, and multi-scene management. Built entirely in the browser using React and modern web APIs, it combines the flexibility of a video editor with the power of AI-driven content generation.

### Key Capabilities

- **Multi-Scene Studio**: Create and manage multiple scenes with independent configurations
- **AI Overlay Generation**: Generate custom HTML/CSS/JS overlays using natural language
- **Real-time Captions**: Live speech-to-text with animated, customizable styling
- **Advanced Canvas System**: Grid-based layouts with draggable, resizable elements
- **Session Recording**: Record complete sessions with timeline-based state tracking
- **Post-Production Editor**: Non-linear editing with full state reconstruction
- **Remote Camera**: Use phone camera as video input via WebRTC
- **Picture-in-Picture**: Custom PiP implementation with controls

---

## ✨ Core Features

### 🎬 Scene Management

- **Multi-Scene Production**: Create unlimited scenes with independent configurations
- **Scene Transitions**: Smooth animated transitions (Dissolve, Slide, Wipe, etc.)
- **Drag & Drop Reordering**: Intuitive scene organization
- **Per-Scene Settings**: Each scene maintains its own caption styles, effects, and layouts

### 🤖 AI-Powered Features

- **Natural Language Overlay Generation**: Create complex interactive elements using prompts
- **Voice Commands**: Speak commands to generate or update overlays
- **Text Commands**: Type prompts in the AI command interface
- **Update Existing Overlays**: Target and modify specific overlays with AI
- **Smart Style Suggestions**: Context-aware style recommendations

### 🗣️ Live Captions

- **Real-time Transcription**: Powered by Deepgram Nova-2
- **Word-by-Word Animation**: 15+ animation styles (typewriter, bounce, fade, etc.)
- **Per-Scene Caption Styling**: Independent caption configurations per scene
- **Custom Caption Designs**: 100+ pre-built caption presets
- **Rich Text Formatting**: Font, size, color, stroke, shadow, background
- **Multi-language Support**: Powered by Deepgram's language detection

### 🎨 Canvas & Layout System

- **Grid-Based Layouts**: Flexible grid system with resizable sections
- **Canvas Preset Library**: 165KB of pre-built designs (filters, compositions)
- **Dynamic Layouts**: Solo, Split-Screen, Picture-in-Picture
- **Aspect Ratio Control**: Custom aspect ratios for camera feeds
- **Camera Shapes**: Circle, Square, Rounded, Heart, Star, Hexagon
- **Pan & Zoom**: Spacebar + drag to pan, mouse wheel to zoom

### 🎭 Visual Effects

- **CSS Filters**: 50+ filter presets (Vintage, Cyberpunk, Noir, etc.)
- **Interactive Filters**: Dynamic camera-reactive effects
- **Ambient Effects**: Particle systems (snow, rain, fire, confetti)
- **Neon Edge Effect**: Real-time Sobel edge detection
- **Background Customization**: Solid colors, gradients, images
- **Auto-Framing**: AI-powered face tracking and centering

### 📦 Overlay Elements

- **Rich Text**: Draggable text with full formatting toolbar
- **Browser Windows**: Embed live web pages with navigation
- **File Viewers**: Display images, videos, PDFs, code files
- **Charts & Graphs**: Bar, line, and pie charts via Recharts
- **Drawing Canvas**: Excalidraw integration for sketches
- **AI-Generated**: Custom interactive HTML/CSS/JS overlays

### ⏺️ Recording & Export

- **Keyframe Recording**: Records complete state timeline, not just video
- **Session Management**: Save, load, and manage recording sessions
- **Video Export**: Download composite video with all effects
- **Timeline Playback**: Non-linear editor with precise playback
- **State Reconstruction**: Perfect recreation of all overlays at any timestamp

### 📱 Advanced Input

- **Remote Phone Camera**: Connect phone as camera via PeerJS/WebRTC
- **Screen Sharing**: Capture desktop or application windows
- **Picture-in-Picture**: Pop-out window with custom controls
- **Device Selection**: Choose specific camera and microphone
- **Audio Management**: Independent audio source control

### 🎯 UI/UX Features

- **Dark/Light Mode**: Full theme support
- **Keyboard Shortcuts**: Efficient workflow controls
- **Snap Guides**: Smart alignment for draggable elements
- **Touch Support**: Mobile-friendly interactions
- **Asset Library**: Search Pexels, Pixabay, GIPHY
- **Responsive Design**: Adaptive layouts for different screen sizes

---

## 💻 Technology Stack

### Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI framework |
| TypeScript | 5.8.3 | Type-safe development |
| Vite | 5.4.19 | Build tool & dev server |
| React Router DOM | 6.30.1 | Client-side routing |

### Styling & UI

| Technology | Version | Purpose |
|------------|---------|---------|
| Tailwind CSS | 3.4.17 | Utility-first styling |
| shadcn/ui | Latest | Component library |
| Radix UI | Various | Accessible primitives |
| Lucide React | 0.462.0 | Icon library |
| Framer Motion | 12.23.22 | Animations |
| next-themes | 0.3.0 | Theme management |

### AI & Speech

| Technology | Version | Purpose |
|------------|---------|---------|
| Deepgram SDK | 4.11.2 | Speech-to-text |
| Google Gemini | API | AI overlay generation |
| MediaPipe | 0.10.22 | Face detection, segmentation |

### Media & Canvas

| Technology | Version | Purpose |
|------------|---------|---------|
| react-rnd | 10.5.2 | Drag & resize |
| html-to-image | 1.11.13 | Preview generation |
| Excalidraw | 0.18.0 | Drawing canvas |
| Recharts | 2.15.4 | Charts & graphs |

### Networking

| Technology | Version | Purpose |
|------------|---------|---------|
| PeerJS | 1.5.5 | WebRTC connections |
| Supabase | 2.74.0 | Backend services |
| TanStack Query | 5.83.0 | Data fetching |
| Firebase | 12.6.0 | Additional services |

### Asset APIs

| Technology | Purpose |
|------------|---------|
| Pexels API | Stock photos & videos |
| Pixabay API | Free images |
| GIPHY API | GIF search |

---

## 📁 Project Structure

```
caption-cam/
├── public/                          # Static assets
│   ├── layouts.json                 # Grid layout presets (60KB)
│   ├── textDesigns.json             # Text design presets (33KB)
│   ├── models/                      # MediaPipe models
│   └── presets/                     # Additional preset files
├── src/
│   ├── components/                  # React components (145 files)
│   │   ├── grid-section/           # Grid layout components (3)
│   │   ├── panels/                 # Control panels (5)
│   │   ├── pip-controls/           # PiP toolbar components (4)
│   │   ├── styles/                 # Caption style components (24)
│   │   ├── text-toolbar/           # Text editing toolbar (4)
│   │   ├── ui/                     # shadcn/ui components (49)
│   │   └── video-canvas/           # Canvas-related components (12)
│   ├── context/                    # React contexts (2)
│   ├── data/                       # Static data (7 JSON files)
│   ├── hooks/                      # Custom React hooks (32)
│   ├── lib/                        # Utilities & logic
│   │   ├── ai/                     # AI-related utilities
│   │   ├── utils/                  # Helper functions
│   │   └── webgl/                  # WebGL renderers (10)
│   ├── pages/                      # Route pages (4)
│   │   └── Index/                  # Index page components (5)
│   ├── types/                      # TypeScript definitions (8)
│   ├── App.tsx                     # Root application
│   ├── main.tsx                    # Entry point
│   └── index.css                   # Global styles
├── package.json                    # Dependencies & scripts
├── vite.config.ts                  # Vite configuration
├── tailwind.config.ts              # Tailwind configuration
└── tsconfig.json                   # TypeScript configuration
```

---

## 📊 File Inventory with LOC

### Core Application Files

| File | LOC | Importance | Purpose |
|------|-----|------------|---------|
| `src/main.tsx` | 6 | ⭐⭐⭐⭐⭐ | Application entry point |
| `src/App.tsx` | 90 | ⭐⭐⭐⭐⭐ | Root component, routing, providers |
| `src/index.css` | 200 | ⭐⭐⭐⭐ | Global styles, CSS variables, animations |

### Pages (4 files, ~42K characters)

| File | LOC | Importance | Purpose |
|------|-----|------------|---------|
| `src/pages/Index.tsx` | 472 | ⭐⭐⭐⭐⭐ | Main studio interface, scene management |
| `src/pages/Edit.tsx` | 485 | ⭐⭐⭐⭐⭐ | Post-production editor page |
| `src/pages/RemoteCamera.tsx` | 180 | ⭐⭐⭐ | Remote phone camera page |
| `src/pages/NotFound.tsx` | 25 | ⭐ | 404 error page |

### Core Components (Major, 44 files)

| File | LOC | Importance | Purpose |
|------|-----|------------|---------|
| `VideoCanvas.tsx` | 900 | ⭐⭐⭐⭐⭐ | Main canvas renderer, handles all overlays |
| `SceneTabs.tsx` | 480 | ⭐⭐⭐⭐⭐ | Scene management panel |
| `AnimationEditor.tsx` | 580 | ⭐⭐⭐⭐ | Animation timeline editor |
| `InteractiveGridSection.tsx` | 520 | ⭐⭐⭐⭐⭐ | Interactive grid cell renderer |
| `CanvasHoverToolbar.tsx` | 520 | ⭐⭐⭐⭐ | Hover toolbar for canvas elements |
| `TransitionPopover.tsx` | 300 | ⭐⭐⭐⭐ | Scene transition configuration |
| `BottomNavigation.tsx` | 290 | ⭐⭐⭐⭐⭐ | Main control bar |
| `AssetLibrary.tsx` | 310 | ⭐⭐⭐ | Stock asset search interface |
| `SavedSessionsPanel.tsx` | 275 | ⭐⭐⭐⭐ | Recording session management |
| `GridSectionToolbar.tsx` | 275 | ⭐⭐⭐⭐ | Toolbar for grid sections |
| `FloatingControlsPanel.tsx` | 170 | ⭐⭐⭐⭐⭐ | Main settings panel |
| `AICommandPopover.tsx` | 230 | ⭐⭐⭐⭐⭐ | AI command input interface |
| `AmbientEffectsOverlay.tsx` | 245 | ⭐⭐⭐ | Particle effect renderer |
| `ExcalidrawOverlay.tsx` | 265 | ⭐⭐⭐ | Drawing canvas integration |
| `DraggableTextOverlay.tsx` | 220 | ⭐⭐⭐⭐ | Rich text overlay component |
| `DraggableBrowser.tsx` | 155 | ⭐⭐⭐ | Browser iframe overlay |
| `DraggableFileViewer.tsx` | 145 | ⭐⭐⭐ | File display overlay |
| `DraggableGraph.tsx` | 185 | ⭐⭐⭐ | Chart overlay component |
| `CameraRenderer.tsx` | 220 | ⭐⭐⭐⭐⭐ | Camera feed renderer with effects |
| `CaptionRenderer.tsx` | 75 | ⭐⭐⭐⭐⭐ | Live caption display |
| `MultiLayerTextRenderer.tsx` | 210 | ⭐⭐⭐⭐ | Advanced text rendering |
| `SmartTextAnimator.tsx` | 150 | ⭐⭐⭐ | Text animation engine |
| `CanvasGridLayout.tsx` | 315 | ⭐⭐⭐⭐⭐ | Grid layout manager |
| `GridSectionRenderer.tsx` | 140 | ⭐⭐⭐⭐ | Grid section renderer |
| `PipControlsToolbar.tsx` | 190 | ⭐⭐⭐ | Picture-in-picture controls |
| `StyleControls.tsx` | 200 | ⭐⭐⭐⭐ | Caption style editor |
| `TextEditingToolbar.tsx` | 120 | ⭐⭐⭐ | Text formatting toolbar |
| `CaptionEditor.tsx` | 135 | ⭐⭐⭐ | Caption settings editor |
| `InstructionsDialog.tsx` | 115 | ⭐⭐ | Help/tutorial modal |
| `RemoteConnectModal.tsx` | 90 | ⭐⭐⭐ | Remote camera connection UI |
| `AnimationLibraryPanel.tsx` | 175 | ⭐⭐⭐ | Animation preset library |
| `AnimationGridItem.tsx` | 110 | ⭐⭐⭐ | Animation thumbnail |

### Grid Section Components (3 files)

| File | LOC | Purpose |
|------|-----|---------|
| `grid-section/CameraGridSection.tsx` | 125 | Camera feed in grid cell |
| `grid-section/CanvasDesignSelector.tsx` | 85 | Canvas design picker |
| `grid-section/EmptyGridSection.tsx` | 45 | Empty grid placeholder |

### Panel Components (5 files)

| File | LOC | Purpose |
|------|-----|---------|
| `panels/CaptionPanel.tsx` | 420 | Caption configuration panel |
| `panels/EffectsPanel.tsx` | 380 | Visual effects panel |
| `panels/FiltersPanel.tsx` | 340 | Filter selection panel |
| `panels/LayoutPanel.tsx` | 290 | Layout configuration panel |
| `panels/TextDesignsPanel.tsx` | 310 | Text preset panel |

### PiP Control Components (4 files)

| File | LOC | Purpose |
|------|-----|---------|
| `pip-controls/CameraPipButton.tsx` | 95 | Camera toggle in PiP |
| `pip-controls/CaptionPipButton.tsx` | 90 | Caption toggle in PiP |
| `pip-controls/EditPipButton.tsx` | 85 | Edit mode toggle |
| `pip-controls/ClosePipButton.tsx` | 75 | Close PiP button |

### Style Components (24 files, ~3.5K LOC)

Caption animation and styling components including bounce, fade, glow, neon, typewriter effects, etc.

### Custom Hooks (32 files)

| File | LOC | Importance | Purpose |
|------|-----|------------|---------|
| `useRecordingSession.ts` | 215 | ⭐⭐⭐⭐⭐ | Session recording engine |
| `useVideoCanvasState.ts` | 175 | ⭐⭐⭐⭐⭐ | Canvas state management |
| `useGridResizing.ts` | 220 | ⭐⭐⭐⭐ | Grid resize logic |
| `useSnapGuides.ts` | 215 | ⭐⭐⭐⭐ | Element snapping system |
| `useCanvasRenderLoop.ts` | 180 | ⭐⭐⭐⭐⭐ | Canvas rendering loop |
| `useCameraEffects.ts` | 175 | ⭐⭐⭐⭐ | Camera effect processing |
| `useAutoFraming.ts` | 165 | ⭐⭐⭐ | AI face tracking |
| `useVideoStreams.ts` | 160 | ⭐⭐⭐⭐⭐ | Media stream management |
| `useDeepgramSpeech.ts` | 140 | ⭐⭐⭐⭐⭐ | Speech-to-text integration |
| `useSessionPlayback.ts` | 90 | ⭐⭐⭐⭐⭐ | Recording playback engine |
| `useTransformMatrix.ts` | 130 | ⭐⭐⭐⭐ | Transform calculations |
| `usePredictiveSmoothing.ts` | 130 | ⭐⭐⭐ | Motion smoothing |
| `usePointerInteraction.ts` | 135 | ⭐⭐⭐⭐ | Pointer event handling |
| `useContinuousAudio.ts` | 130 | ⭐⭐⭐⭐ | Audio stream capture |
| `useWebGLRenderLoop.ts` | 125 | ⭐⭐⭐ | WebGL rendering |
| `useCursorFeedback.ts` | 120 | ⭐⭐⭐ | Cursor state management |
| `useCanvasPresets.ts` | 110 | ⭐⭐⭐⭐ | Canvas preset loading |
| `useGridSequencer.ts` | 90 | ⭐⭐⭐ | Grid animation sequences |
| `useAnimationLibrary.ts` | 55 | ⭐⭐⭐ | Animation preset manager |
| `usePictureInPicture.ts` | 85 | ⭐⭐⭐ | PiP functionality |
| `useRemotePeer.ts` | 70 | ⭐⭐⭐ | WebRTC peer connection |
| `useSceneCompositor.ts` | 65 | ⭐⭐⭐⭐ | Scene composition |
| `useCanvasRenderer.ts` | 60 | ⭐⭐⭐ | Legacy canvas renderer |
| `useCompositeStream.ts` | 50 | ⭐⭐⭐ | Stream composition |
| `useRAFThrottle.ts` | 55 | ⭐⭐⭐ | RequestAnimationFrame throttle |
| `usePipGestures.ts` | 50 | ⭐⭐ | PiP gesture controls |
| `usePublicPresets.ts` | 45 | ⭐⭐ | Public preset loading |
| `useLayoutPresets.ts` | 30 | ⭐⭐⭐ | Layout preset manager |
| `useLocalStorage.ts` | 25 | ⭐⭐⭐⭐ | LocalStorage abstraction |
| `useOnClickOutside.ts` | 20 | ⭐⭐⭐ | Click-outside detector |
| `use-toast.ts` | 110 | ⭐⭐⭐ | Toast notification system |
| `use-mobile.tsx` | 15 | ⭐⭐ | Mobile detection |

### Library Files (29 files)

| File | LOC | Importance | Purpose |
|------|-----|------------|---------|
| `lib/dynamicCaptionStyles.tsx` | 580 | ⭐⭐⭐⭐⭐ | Caption animation components |
| `lib/effects.ts` | 495 | ⭐⭐⭐⭐ | Visual effect definitions |
| `lib/ai.ts` | 245 | ⭐⭐⭐⭐⭐ | AI agent logic (Gemini) |
| `lib/filterRenderer.ts` | 185 | ⭐⭐⭐⭐ | Filter processing engine |
| `lib/animationGenerator.ts` | 175 | ⭐⭐⭐⭐ | Animation generation |
| `lib/animationLibrary.ts` | 150 | ⭐⭐⭐ | Animation preset library |
| `lib/transformUtils.ts` | 160 | ⭐⭐⭐⭐ | Transform utilities |
| `lib/assetApis.ts` | 160 | ⭐⭐⭐ | Stock asset API integration |
| `lib/presetValidation.ts` | 140 | ⭐⭐⭐ | Preset validator |
| `lib/animeStyles.ts` | 105 | ⭐⭐ | Anime-style filters |
| `lib/presets.ts` | 95 | ⭐⭐⭐ | General presets |
| `lib/customStyles.ts` | 45 | ⭐⭐⭐ | Custom caption styles |
| `lib/canvasLayouts.ts` | 40 | ⭐⭐⭐⭐ | Canvas layout definitions |
| `lib/textDesigns.ts` | 38 | ⭐⭐⭐ | Text design presets |
| `lib/canvasPresets.ts` | 34 | ⭐⭐⭐⭐ | Canvas preset loader |
| `lib/backgrounds.ts` | 20 | ⭐⭐ | Background presets |
| `lib/captionPresets.ts` | 10 | ⭐⭐⭐ | Caption preset loader |
| `lib/filters.ts` | 8 | ⭐⭐⭐ | Filter preset loader |
| `lib/fonts.ts` | 5 | ⭐⭐⭐ | Font list loader |
| `lib/interactiveFilters.ts` | 10 | ⭐⭐ | Interactive filter loader |
| `lib/firebase.ts` | 25 | ⭐⭐ | Firebase configuration |
| `lib/responsiveUtils.ts` | 25 | ⭐⭐ | Responsive utilities |
| `lib/preview.ts` | 25 | ⭐⭐⭐ | Preview generation |
| `lib/id.ts` | 18 | ⭐⭐⭐ | ID generation |
| `lib/zIndex.ts` | 20 | ⭐⭐⭐⭐ | Z-index management |
| `lib/utils.ts` | 5 | ⭐⭐⭐⭐ | Tailwind merge utility |

### WebGL Renderers (10 files, ~1.5K LOC)

Advanced WebGL shaders and renderers for visual effects including displacement, kaleidoscope, pixel sort, glitch, chromatic aberration, etc.

### Type Definitions (8 files)

| File | LOC | Importance | Purpose |
|------|-----|------------|---------|
| `types/caption.ts` | 375 | ⭐⭐⭐⭐⭐ | Core types (SceneState, overlays) |
| `types/textDesign.ts` | 97 | ⭐⭐⭐ | Text design types |
| `types/editor.ts` | 70 | ⭐⭐⭐⭐⭐ | Recording session types |
| `types/canvasPreset.ts` | 70 | ⭐⭐⭐⭐ | Canvas preset types |
| `types/animation.ts` | 28 | ⭐⭐⭐ | Animation types |
| `types/layout.ts` | 30 | ⭐⭐⭐ | Layout types |
| `types/layoutPreset.ts` | 18 | ⭐⭐⭐ | Layout preset types |
| `types/ai.ts` | 12 | ⭐⭐⭐ | AI-related types |

### Context Providers (2 files)

| File | LOC | Purpose |
|------|-----|---------|
| `context/LogContext.tsx` | 35 | Application logging |
| `context/DebugContext.tsx` | 30 | AI debug information |

### Data Files (7 JSON files, ~247KB)

| File | Size | Records | Purpose |
|------|------|---------|---------|
| `data/canvasPresets.json` | 165KB | ~250 | Canvas design presets |
| `data/captionPresets.json` | 35KB | ~180 | Caption style presets |
| `data/animeStyles.json` | 20KB | ~85 | Anime-style filters |
| `data/interactiveFilters.json` | 12KB | ~45 | Interactive filters |
| `data/filters.json` | 8KB | ~50 | CSS filter presets |
| `data/fonts.json` | 3KB | ~100 | Font names |
| `data/backgrounds.json` | 4KB | ~20 | Background images |

### UI Components (49 shadcn/ui files)

Accordion, Alert, Avatar, Badge, Button, Card, Checkbox, Collapsible, Command, Context Menu, Dialog, Dropdown Menu, Form, Hover Card, Input, Label, Menubar, Navigation Menu, Popover, Progress, Radio Group, Scroll Area, Select, Separator, Sheet, Skeleton, Slider, Switch, Table, Tabs, Textarea, Toast, Toggle, Tooltip, etc.

### Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies (81 packages) |
| `vite.config.ts` | Vite build configuration |
| `tailwind.config.ts` | Tailwind CSS theming |
| `tsconfig.json` | TypeScript compiler options |
| `postcss.config.js` | PostCSS plugins |
| `netlify.toml` | Netlify deployment config |

---

## 🏗️ Architecture & Data Flow

### Application Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         App.tsx                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Providers: Theme, Log, Debug, Query, Router           │  │
│  └───────────────────────────────────────────────────────┘  │
└────────────────┬────────────────────────────────────────────┘
                 │
        ┌────────┴─────────┐
        │                  │
┌───────▼───────┐  ┌──────▼───────┐  ┌──────────────┐
│  Index Page   │  │  Edit Page   │  │  NotFound    │
│  (Studio)     │  │  (Editor)    │  │              │
└───────┬───────┘  └──────┬───────┘  └──────────────┘
        │                  │
        │                  │
┌───────▼──────────────────▼─────────────────────────┐
│             State Management                        │
│  • scenes: SceneState[]  (Index)                   │
│  • session: RecordingSession (Edit)                │
│  • localStorage: Sessions, Overlays                │
└─────────────────────────────────────────────────────┘
```

### Scene State Structure

```typescript
SceneState {
  id: string
  name: string
  captionStyle: CaptionStyle
  captionsEnabled: boolean
  filter: string
  effect: string
  ambientEffect: string
  layout: 'solo' | 'split' | 'pip' | 'grid'
  cameraShape: 'circle' | 'square' | 'rounded' | 'heart'
  htmlOverlays: HtmlOverlay[]
  textOverlays: TextOverlay[]
  browsers: BrowserOverlay[]
  files: FileOverlay[]
  graphs: GraphOverlay[]
  ambientEffects: AmbientEffectOverlay[]
  excalidraw: ExcalidrawOverlay | null
  transition: SceneTransition
  canvasLayout: GridLayoutConfig
  backgroundColor: string
  // ... 20+ more properties
}
```

### Data Flow Diagrams

#### AI Command Flow

```
User Voice/Text
      │
      ▼
AICommandPopover
      │
      ▼
useContinuousAudio ──► useDeepgramSpeech
      │                       │
      ▼                       ▼
  Audio Chunks          Transcript
      │                       │
      └───────────┬───────────┘
                  ▼
          processCommandWithAgent
                  │
                  ▼
          Google Gemini API
                  │
                  ▼
          Generated HTML/CSS/JS
                  │
                  ▼
          updateActiveScene
                  │
                  ▼
          VideoCanvas renders new overlay
```

#### Recording Flow

```
User Action (drag, edit, etc.)
      │
      ▼
Component Callback
      │
      ▼
Index.tsx updates scenes state
      │
      ▼
recording.record[Action]() ──► useRecordingSession
      │                                │
      ▼                                ▼
State Change                     Push Keyframe
      │                                │
      ▼                                ▼
Re-render                        Store in ref
      │                                │
      └─────────┬──────────────────────┘
                │
      Stop Recording Clicked
                │
                ▼
    recording.stopRecording()
                │
                ▼
    Create Blob from MediaRecorder
                │
                ▼
    Bundle all keyframe tracks
                │
                ▼
    Save to localStorage
                │
                ▼
    Navigate to /edit/:sessionId
```

#### Playback Flow

```
EditPage loads
      │
      ▼
useLocalStorage('gaki-recorded-sessions')
      │
      ▼
Find session by ID
      │
      ▼
<video> element plays session.videoUrl
      │
      ▼
onTimeUpdate ──► set currentTime state
      │
      ▼
useSessionPlayback(session, currentTime)
      │
      ▼
findStateAtTime() ──► Iterate keyframe tracks
      │
      ▼
Calculate interpolated state
      │
      ▼
Return playbackState
      │
      ▼
EditPage renders overlays with playbackState
```

### Component Hierarchy

```
App
├── Index (Main Studio)
│   ├── FloatingLogo
│   ├── SceneTabs
│   │   └── TransitionPopover
│   ├── VideoCanvas
│   │   ├── CameraRenderer
│   │   ├── CaptionRenderer
│   │   ├── CanvasGridLayout
│   │   │   └── InteractiveGridSection
│   │   │       ├── CameraGridSection
│   │   │       ├── GridSectionToolbar
│   │   │       └── GridSectionRenderer
│   │   ├── DraggableTextOverlay
│   │   │   └── TextEditingToolbar
│   │   ├── DraggableBrowser
│   │   ├── DraggableFileViewer
│   │   ├── DraggableGraph
│   │   ├── ExcalidrawOverlay
│   │   ├── AmbientEffectsOverlay
│   │   ├── PipControlsToolbar
│   │   ├── CanvasHoverToolbar
│   │   └── AICommandPopover
│   ├── FloatingControlsPanel
│   │   ├── CaptionPanel
│   │   ├── EffectsPanel
│   │   ├── FiltersPanel
│   │   ├── LayoutPanel
│   │   └── TextDesignsPanel
│   ├── BottomNavigation
│   │   ├── LayoutControls
│   │   └── ToolsPopover
│   │       ├── FloatingAssetSearch
│   │       │   └── AssetLibrary
│   │       └── InstructionsDialog
│   └── SavedSessionsPanel
│
├── EditPage (Post-Production)
│   ├── <video> playback
│   ├── Timeline controls
│   └── Overlay renderers (same as VideoCanvas)
│
└── RemoteCamera (Phone Input)
    └── PeerJS connection UI
```

---

## 🔌 API Integrations

### Deepgram Speech-to-Text

**Endpoint**: `wss://api.deepgram.com/v1/listen`

**Configuration**:
- Model: `nova-2`
- Smart Format: Enabled
- Interim Results: Enabled
- Utterance End: 1000ms
- VaD Events: Enabled

**Data Flow**:
1. Capture audio via `MediaRecorder`
2. Send chunks via WebSocket
3. Receive interim + final transcripts
4. Display as animated captions

**Files**: `useDeepgramSpeech.ts`, `useContinuousAudio.ts`, `CaptionRenderer.tsx`

### Google Gemini AI

**Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent`

**Configuration**:
- Model: `gemini-2.0-flash-exp`
- Temperature: 0.7
- Top P: 0.95
- Max Output Tokens: 8192

**Prompts**:
- Master Prompt: Generates new HTML/CSS/JS overlays
- Update Prompt: Modifies existing overlays

**Data Flow**:
1. User command (voice/text)
2. Construct prompt with context
3. API call with command
4. Parse HTML response
5. Insert into scene state

**Files**: `lib/ai.ts`, `AICommandPopover.tsx`, `VideoCanvas.tsx`

### MediaPipe Vision

**Models**:
- Face Detection: `@mediapipe/face_detection`
- Selfie Segmentation: `@mediapipe/selfie_segmentation`
- Tasks Vision: `@mediapipe/tasks-vision`

**Usage**:
- Auto-framing: Center camera on detected face
- Background removal: Selfie segmentation
- Gesture control: Hand tracking (planned)

**Files**: `useAutoFraming.ts`, `CameraRenderer.tsx`

### Pexels API

**Endpoint**: `https://api.pexels.com/v1/search`

**Rate Limit**: 200 requests/hour

**Usage**: Stock photo/video search in Asset Library

**Files**: `lib/assetApis.ts`, `AssetLibrary.tsx`

### Pixabay API

**Endpoint**: `https://pixabay.com/api/`

**Rate Limit**: 5000 requests/hour

**Usage**: Free image search in Asset Library

**Files**: `lib/assetApis.ts`, `AssetLibrary.tsx`

### GIPHY API

**Endpoint**: `https://api.giphy.com/v1/gifs/search`

**Rate Limit**: 1000 requests/day (free tier)

**Usage**: GIF search in Asset Library

**Files**: `lib/assetApis.ts`, `AssetLibrary.tsx`

### PeerJS/WebRTC

**Server**: PeerJS cloud server

**Usage**: Remote phone camera connection

**Data Flow**:
1. Desktop generates peer ID
2. Display QR code with connection URL
3. Phone scans, connects via PeerJS
4. Send MediaStream via WebRTC
5. Desktop receives and displays stream

**Files**: `useRemotePeer.ts`, `RemoteCamera.tsx`, `RemoteConnectModal.tsx`

### Supabase (Optional)

**Services**: Authentication, Database, Storage

**Status**: Configured but optional

**Files**: `lib/firebase.ts` (also includes Firebase config)

---

## ⚠️ Current Limitations

### Performance

1. **Large Scene State**: SceneState objects can become very large (>1MB) with many overlays, causing re-render performance issues
2. **Canvas Rendering**: Heavy canvas operations (filters + effects) can drop FPS on lower-end devices
3. **Memory Leaks**: Some MediaStream and WebSocket connections may not clean up properly
4. **Recording Size**: Long sessions create very large video files (no compression)
5. **LocalStorage Limits**: Sessions stored in localStorage (5-10MB limit per origin)

### Browser Compatibility

1. **MediaRecorder Codecs**: Limited codec support in Safari/Firefox
2. **WebRTC**: Remote camera feature requires HTTPS
3. **Picture-in-Picture**: Limited browser support for Document PiP API
4. **WebGL**: Some advanced effects require WebGL 2.0
5. **Clipboard API**: Copy/paste overlays may not work in all browsers

### AI Features

1. **Gemini Rate Limits**: 60 requests/minute on free tier
2. **Generation Quality**: AI may generate broken HTML/CSS occasionally
3. **Context Understanding**: Limited ability to understand complex multi-step commands
4. **Overlay Updates**: Updating existing overlays can be unpredictable
5. **No Streaming**: Gemini responses are not streamed, causing delays

### Speech-to-Text

1. **Deepgram Costs**: $0.0043/minute for Nova-2 model
2. **Language Detection**: No explicit language selection
3. **Accuracy**: Background noise affects transcription quality
4. **Internet Required**: No offline mode
5. **Latency**: ~200-500ms delay for live captions

### Recording & Editing

1. **No Video Editing**: Editor is read-only, no trimming/cutting
2. **No Export Options**: Only download as-is, no format/quality selection
3. **No Audio Mixing**: Cannot adjust audio levels per source
4. **Session Size**: Large sessions (>1GB) may crash during load
5. **No Cloud Backup**: All data stored locally only

### UI/UX

1. **Mobile Support**: Optimized for desktop, limited mobile functionality
2. **Undo/Redo**: No undo/redo system for scene changes
3. **Keyboard Shortcuts**: Limited shortcuts, no customization
4. **Accessibility**: Incomplete ARIA labels and keyboard navigation
5. **Error Handling**: Generic error messages, limited recovery options

### Data Management

1. **No Export/Import**: Cannot export scene configs or import from others
2. **No Templates**: Cannot save custom templates for reuse
3. **No Versioning**: No version control for scenes
4. **No Collaboration**: Single-user only, no real-time collaboration
5. **No Cloud Sync**: No cross-device synchronization

### Security

1. **API Keys in Frontend**: Deepgram/Gemini keys exposed in bundle
2. **No Authentication**: Anyone with URL can access
3. **No Rate Limiting**: Client-side only, vulnerable to abuse
4. **CORS Issues**: Some iframe/browser overlays blocked by CORS
5. **XSS Risk**: AI-generated HTML not fully sanitized

### Asset Library

1. **No Upload**: Cannot upload custom images/videos
2. **Limited Search**: Basic keyword search only
3. **No Favorites**: Cannot save favorite assets
4. **No Preview**: No preview before adding to scene
5. **API Dependency**: Broken if external APIs are down

### Grid Layout

1. **Fixed Grids**: Cannot create custom grid configurations
2. **No Nesting**: Cannot nest grids within grid cells
3. **Resize Lag**: Resizing grid sections can be janky
4. **No Snap**: No snap-to-grid for precision layouts
5. **Limited Presets**: Only ~50 grid layout presets

### Effects & Filters

1. **No Custom Filters**: Cannot create custom CSS filters
2. **Performance**: Multiple effects stack poorly
3. **No Keyframing**: Effects are static, no animation over time
4. **Limited WebGL**: Only 10 WebGL effects available
5. **No Audio Effects**: No audio filters or effects

---

## 🛠️ Development Guide

### Getting Started

```bash
# Clone repository
git clone <repository-url>
cd caption-cam

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your API keys:
# - VITE_DEEPGRAM_API_KEY
# - VITE_GEMINI_API_KEY
# - VITE_PEXELS_API_KEY
# - VITE_PIXABAY_API_KEY
# - VITE_GIPHY_API_KEY

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Project Scripts

```json
{
  "dev": "vite",
  "build": "vite build",
  "build:dev": "vite build --mode development",
  "lint": "eslint .",
  "preview": "vite preview"
}
```

### Environment Variables

```bash
# Required
VITE_DEEPGRAM_API_KEY=<your-key>
VITE_GEMINI_API_KEY=<your-key>

# Optional (Asset Library)
VITE_PEXELS_API_KEY=<your-key>
VITE_PIXABAY_API_KEY=<your-key>
VITE_GIPHY_API_KEY=<your-key>

# Optional (Backend)
VITE_SUPABASE_URL=<your-url>
VITE_SUPABASE_ANON_KEY=<your-key>
VITE_FIREBASE_API_KEY=<your-key>
```

### Key Development Files

- **Entry Point**: `src/main.tsx`
- **Routing**: `src/App.tsx`
- **Main Page**: `src/pages/Index.tsx`
- **Core Types**: `src/types/caption.ts`
- **AI Logic**: `src/lib/ai.ts`
- **Global Styles**: `src/index.css`

### Adding a New Feature

1. **Define Types**: Add to `src/types/caption.ts` or create new type file
2. **Create Component**: Add to `src/components/`
3. **Add Hook** (if needed): Add to `src/hooks/`
4. **Update Scene State**: Modify `SceneState` interface
5. **Update Recording**: Add keyframe tracking in `useRecordingSession.ts`
6. **Update Playback**: Add state reconstruction in `useSessionPlayback.ts`
7. **Add UI Controls**: Update `FloatingControlsPanel.tsx` or `BottomNavigation.tsx`

### Code Style

- **TypeScript**: Strict mode enabled
- **Components**: Functional components with hooks
- **Naming**: PascalCase for components, camelCase for functions/variables
- **Imports**: Absolute imports from `@/` alias
- **Styling**: Tailwind utility classes, avoid inline styles
- **Comments**: Use JSDoc for complex functions

### Testing Recommendations

1. Test in Chrome, Firefox, Safari
2. Test with different camera/mic devices
3. Test large scenes (20+ overlays)
4. Test long recordings (10+ minutes)
5. Test AI commands with various prompts
6. Test grid layouts with complex configurations
7. Test remote camera on actual phone
8. Test PiP in different browsers

---

## 📚 References

### Documentation

- [React Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)

### API Documentation

- [Deepgram API](https://developers.deepgram.com/docs)
- [Google Gemini](https://ai.google.dev/gemini-api/docs)
- [MediaPipe](https://developers.google.com/mediapipe)
- [Pexels API](https://www.pexels.com/api/documentation/)
- [Pixabay API](https://pixabay.com/api/docs/)
- [GIPHY API](https://developers.giphy.com/docs/api/)
- [PeerJS](https://peerjs.com/docs/)

### Libraries

- [react-rnd](https://github.com/bokuweb/react-rnd)
- [Excalidraw](https://docs.excalidraw.com/)
- [Recharts](https://recharts.org/en-US/)
- [Framer Motion](https://www.framer.com/motion/)
- [html-to-image](https://github.com/bubkoo/html-to-image)
- [Sonner](https://sonner.emilkowal.ski/)

### Web APIs

- [MediaStream API](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_API)
- [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)
- [WebRTC API](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [WebGL API](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API)
- [Picture-in-Picture API](https://developer.mozilla.org/en-US/docs/Web/API/Picture-in-Picture_API)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

### Related Projects

- [OBS Studio](https://obsproject.com/) - Desktop streaming software (inspiration)
- [Streamlabs](https://streamlabs.com/) - Browser-based streaming
- [Riverside.fm](https://riverside.fm/) - Remote recording platform
- [Descript](https://www.descript.com/) - Video editor with AI

---

## 📝 License

MIT License - See LICENSE file for details

---

## 🤝 Contributing

This project is currently in active development. Contributions, issues, and feature requests are welcome.

### Priority Areas

1. Performance optimization (canvas rendering, state management)
2. Mobile responsiveness
3. Accessibility improvements
4. Additional AI models (Claude, GPT-4)
5. Cloud storage integration
6. Real-time collaboration
7. Advanced video editing features
8. Plugin/extension system

---

## 📊 Project Statistics

- **Total Files**: ~250+ TypeScript/React files
- **Total LOC**: ~25,000+ lines of code
- **Dependencies**: 81 npm packages
- **Build Size**: ~5MB (uncompressed)
- **Data Files**: 247KB of JSON presets
- **Components**: 145 React components
- **Hooks**: 32 custom hooks
- **Type Definitions**: 8 type files
- **Development Started**: 2024
- **Current Status**: Beta

---

**Last Updated**: December 2, 2025  
**Documented By**: AI Assistant (Gemini)  
**App Version**: 0.0.0
