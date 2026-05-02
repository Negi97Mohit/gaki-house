# Grid Section Panels — Content Types, Options & Interactions

→ Back to [Index](../../INDEX.md) | [Web App](../README.md) | [Layout System](../features/layout-system.md)

---

## Overview

When the user selects a **grid layout** (any multi-section layout), the canvas divides into **sections** (cells) that can each hold different content. Each section is a self-contained panel where the user can:

1. **Choose a content type** (Camera, Screen Share, Design, File/Media, Color, or Empty)
2. **Configure that content** with its own dedicated options
3. **Add text overlays** on top of any section
4. **Change the section background** (solid color, gradient, or image)
5. **Remove** the section's content and pick something else

This is the *"panels within designs"* system the user interacts with.

---

## Source Files

```
src/features/layouts/ui/
├── InteractiveGridSection.tsx   (20KB) — Full section with camera + text + controls
├── GridSectionToolbar.tsx       (12KB) — Per-section content type toolbar
│
└── grid-section/
    ├── EmptyGridSection.tsx     (18KB) — Empty section with "Add Content" UI
    ├── CameraGridSection.tsx    (6.9KB) — Camera feed renderer in a section
    ├── ScreenShareGridSection.tsx (2KB) — Screen share in a section
    └── CanvasDesignSelector.tsx (8.4KB) — Browse & apply design presets
```

---

## Content Types

Each grid section can hold one of these content types:

```typescript
type CanvasSectionContent =
  | { type: "empty" }                           // Blank — shows "Add" menu
  | { type: "color"; color?: string }           // Solid color fill
  | { type: "image"; src?: string }             // Background image
  | { type: "file"; url?; fileType?; name? }    // Any media file
  | { type: "screen"; sourceId?; displayMode? } // Screen/window share
  | { type: "camera"; settings: CameraState }   // Live camera with full controls
```

### Content Type Details

| Type | What the User Sees | Options Available |
|---|---|---|
| **Empty** | "+" Add button + Search button | Click "Add" for full content picker menu |
| **Color** | Solid background fill | Color picker with 8 presets + custom hex + gradient support |
| **Image** | Background image | Image URL input |
| **File/Media** | Image, video, audio, PDF, text, 3D model | Upload file, paste URL, or search stock assets (Pexels/Pixabay/GIPHY) |
| **Screen** | Live screen/window capture | Source picker (native on web, list on Electron), display mode (fit/fill/stretch/center/span) |
| **Camera** | Live camera feed with full effects | **25+ individual settings** — see Camera Section below |

---

## Empty Section — Add Content Menu

When a section is empty, the user sees two hover buttons:

### 🔍 Search Button
Opens an inline `AssetLibrary` popover for searching stock images and GIFs:
- Pexels + Pixabay image search
- GIPHY GIF search
- Click result → fills the section as a **file** content type

### ➕ Add Button
Opens a dropdown menu with all content type options:

| Menu Item | Icon | Action |
|---|---|---|
| **Solid Color** | 🎨 Palette | Sets `type: "color"` with a default color |
| **File / Media** | 🎬 FileVideo | Opens file upload dialog (Upload tab + URL tab) |
| **Camera** | 📷 Camera | Sets `type: "camera"` with `DEFAULT_CAMERA_STATE` |
| **Share Screen** | 🖥 Monitor | Sets `type: "screen"` (native picker on web, source selector on Electron) |
| **Canvas Designs** ▸ | 🖌 Paintbrush | Opens sub-menu with `CanvasDesignSelector` for preset templates |

### File Upload Dialog
Two-tab dialog for adding media files:

**Upload Tab:**
- Drag-and-drop zone
- Click to open file picker
- Supports: images, videos, audio, PDFs, text files, 3D models (.ply, .splat)
- Auto-detects file type from MIME type or extension

**URL Tab:**
- Paste any URL
- Auto-detects file type from extension
- Defaults to video for unknown URLs by convention

**Also supports drag-and-drop** directly onto the section (no dialog needed).

---

## Camera Section — Full Camera Options

When a section's content type is `"camera"`, it renders a **complete camera workspace** with an `InteractiveGridSection`:

### Camera Features Within Grid Sections

The camera inside each section has its own **independent** copy of ALL camera settings:

| Setting | Type | Description |
|---|---|---|
| `videoFilter` | string | CSS filter preset (50+ options) |
| `isNeonEdgeEnabled` | boolean | Neon edge detection effect |
| `neonIntensity` | number | Neon effect strength |
| `neonColor` | string | Neon glow color |
| `cameraBackground` | enum | none / blur / image |
| `customBackgroundUrl` | string | Virtual background image |
| `isFaceTrackingEnabled` | boolean | MediaPipe face tracking |
| `isAutoFramingEnabled` | boolean | Auto-center on face |
| `isBeautifyEnabled` | boolean | Skin smoothing |
| `isLowLightEnabled` | boolean | Low light brightness boost |
| `cameraShape` | enum | rectangle / circle / rounded |
| `cameraAspectRatio` | string | 16:9 / 4:3 / 1:1 / 9:16 |
| `customAspectRatio` | string | Custom ratio |
| `pipPosition` | {x, y} | Camera position within section (%) |
| `pipSize` | {width, height} | Camera size within section (%) |
| `pipBorder` | {color, width} | Camera border styling |
| `pipShadow` | {blur, color} | Camera shadow |
| `zoomSensitivity` | number | Zoom tracking sensitivity |
| `trackingSpeed` | number | Face tracking smoothing |
| `selectedDeviceId` | string | Which camera device |
| `activeInteractiveFilter` | enum | 70+ interactive filter options |
| `filterIntensity` | number | Filter strength |
| `filterColor` | string | Filter tint color |
| `filterTarget` | enum | both / background / person |
| `canvasDesignId` | string | Applied design preset |
| `textOverlays` | TextOverlayState[] | Text elements on top of camera |

### Camera Interaction

The camera is rendered in a **`react-rnd` wrapper** inside the section:
- **Drag** the camera feed to reposition it (percentage-based)
- **Resize** the camera feed corner handles
- **Click** to select → shows the full `PipControlsToolbar` with 7 sub-menus

### Camera Toolbar (PipControlsToolbar)
When the camera is clicked/selected, a floating toolbar appears with:
- Layout menu (shape, aspect ratio, position, size)
- Style menu (border, shadow, rotation)
- Effects menu (auto-framing, beautify, neon edge, background)
- Cinematic menu (dolly zoom, rack focus, etc.)
- Background menu (none, blur, virtual background)
- Camera menu (device selector)
- Zoom slider

→ See [PiP Controls](../components/pip-controls.md) for full toolbar docs

### Adding Text Inside Camera Sections
Each camera section can have **text overlays** rendered on top of the camera:
- Click the "T" (Type) button in the section controls
- Adds a `DraggableTextOverlay` with default styling
- Each text overlay has its own position, size, font, color, and animation
- Text is independently draggable and resizable within the section

---

## Canvas Design Selector

→ Source: [CanvasDesignSelector.tsx](file:///c:/Users/Dell/Desktop/gaki/src/features/layouts/ui/grid-section/CanvasDesignSelector.tsx)

When the user picks "Canvas Designs" from the Add menu, a visual template picker opens:

### Categories
| Category | Icon | Examples |
|---|---|---|
| All | LayoutGrid | Everything |
| Premium | Crown | High-quality designs |
| Dynamic | Zap | Animated designs |
| Minimal | Minus | Clean, simple |
| Tech | Cpu | Tech-themed |
| Creative | Film | Artistic designs |
| Business | Shirt | Professional |
| Retro | Clock | Vintage-styled |
| Community | Users | User-shared designs |

### How Designs Apply
When a design preset is selected, it configures the section with:
```typescript
onSectionContentChange(sectionId, {
  type: "camera",
  settings: {
    ...DEFAULT_CAMERA_STATE,
    canvasDesignId: preset.id,
    layoutMode: "pip",
    sectionBackgroundColor: preset.background.blankCanvasColor,
    cameraShape: preset.pip.cameraShape,
    pipPosition: preset.pip.pipPosition,
    pipSize: preset.pip.pipSize,
    textOverlays: preset.textOverlays,        // Pre-placed text
    pipBorder: preset.pip.pipBorder,
    pipShadow: preset.pip.pipShadow,
    videoFilter: preset.effects.videoFilter,
    isBeautifyEnabled: preset.effects.isBeautifyEnabled,
    isNeonEdgeEnabled: preset.effects.isNeonEdgeEnabled,
    neonColor: preset.effects.neonColor,
    neonIntensity: preset.effects.neonIntensity,
  },
})
```

Each preset card shows a **visual preview** with the PiP camera position & shape, background color, and text overlay positions.

---

## Grid Section Toolbar

→ Source: [GridSectionToolbar.tsx](file:///c:/Users/Dell/Desktop/gaki/src/features/layouts/ui/GridSectionToolbar.tsx)

A **floating toolbar** that appears on hover over any filled section. Controls vary by content type:

### Always Available
| Button | Icon | Action |
|---|---|---|
| 🔍 Search | Search | Open asset search to replace content |
| ⊘ Clear | MinusCircle | Remove content → section becomes empty again |

### Color Sections
| Button | Icon | Action |
|---|---|---|
| 🎨 Color Picker | Palette | Change the fill color (with gradient support) |

### Image Sections
| Button | Icon | Action |
|---|---|---|
| 🖼 Change Image | Image | Prompt for new image URL |

### Screen Share Sections
| Button | Icon | Action |
|---|---|---|
| 🖥 Change Source | Monitor | Re-pick screen source |
| 📐 Display Mode | LayoutTemplate | fit / fill / stretch / center / span |

### File Sections
| Button | Icon | Action |
|---|---|---|
| 📄 Files | FileText | Pick from available file overlays |

### Text Sections
| Button | Icon | Action |
|---|---|---|
| T Text | Type | Pick from available text overlays |

### Sequence Controls (for animation sequences)
| Button | Icon | Action |
|---|---|---|
| 🔗 Order | Link/Number | Add section to animation sequence (shows order number) |
| 💾 Save Default | Save | Save current view as the idle/default state |

---

## Section Background Controls

Every `InteractiveGridSection` (camera sections) shows hover controls:

### 🎨 Background Paintbrush
Opens a dropdown with:
- 8 preset colors (black, white, red, green, blue, yellow, magenta, cyan)
- Full `ColorPicker` with custom hex input + **gradient support**

### T Add Text Button
Adds a new text overlay with default styling to the section.

---

## Data Model

```typescript
// Each section in the grid layout
interface CanvasSectionState {
  id: string;                              // e.g., 'main', 'sidebar', 'corner'
  name?: string;                           // Display name
  content: CanvasSectionContent;           // What's in this section
  savedCameraSettings?: CameraState;       // Preserved camera settings
  defaultContent?: CanvasSectionContent;   // Fallback content
  style?: React.CSSProperties;            // Custom CSS overrides
}

// The overall grid layout for a scene
interface CanvasLayoutState {
  templateId: string;                      // Which layout template
  sections: CanvasSectionState[];          // All sections
  sectionOrder?: string[];                 // Animation ordering
  customSectionStyles?: Record<string, CSSProperties>;  // Custom sizes
  customSectionData?: Record<string, SectionData>;      // Editable text data
}
```

---

## Interaction Flow

```
User selects Grid Layout
    │
    ▼
Canvas splits into sections (based on template)
    │
    ▼
Each section renders based on content.type:
    │
    ├── "empty"   → EmptyGridSection (Add/Search buttons)
    ├── "color"   → Colored div + GridSectionToolbar
    ├── "image"   → Background image + GridSectionToolbar
    ├── "file"    → FileRenderer + GridSectionToolbar
    ├── "screen"  → ScreenShareView + GridSectionToolbar
    └── "camera"  → InteractiveGridSection
                       ├── CameraRenderer (WebGL pipeline)
                       ├── PipControlsToolbar (7 sub-menus)
                       ├── DraggableTextOverlay (×N)
                       └── Background controls (color/gradient picker)
```

→ See [Layout System](../features/layout-system.md) for layout templates  
→ See [PiP Controls](../components/pip-controls.md) for camera control menus  
→ See [Canvas System](../features/canvas-system.md) for the rendering engine  
→ See [Types Reference](../types/types-reference.md) for full type definitions
