# Bottom Navigation

→ Back to [Index](../../INDEX.md) | [Components](./README.md)

---

## Overview

The `BottomNavigation` component is the **main control bar** at the bottom of the studio workspace. It provides quick access to all primary actions: microphone, camera, recording, streaming, screen sharing, layouts, and tools.

## Controls

| Button | Action | Store |
|---|---|---|
| 🎤 Microphone | Toggle audio on/off | `useMediaStore.setAudioOn` |
| 📷 Camera | Toggle video on/off | `useMediaStore.setVideoOn` |
| ⏺ Record | Start/stop recording | `useStreamStore.setRecording` |
| 🔴 Go Live | Open broadcast panel | `useStreamStore` |
| 🖥 Screen Share | Toggle screen sharing | `useMediaStore.setScreenShareMode` |
| 📐 Layout | Open layout dropdown | `LayoutControls` component |
| 🔧 Tools | Open tools popover | `ToolsPopover` component |
| 🌙 Theme | Toggle dark/light mode | `useThemeStore` |

## Sub-Components

### `LayoutControls`
Dropdown for selecting scene layout mode and camera shape:
- Solo, Split Horizontal, Split Vertical, PiP, Canvas Only
- Camera shapes: Rectangle, Circle, Square, Rounded

### `ToolsPopover`
Popover with secondary tools:
- **Add Text** — Create a new DraggableTextOverlay
- **Asset Search** → `FloatingAssetSearch` → `AssetLibrary`
- **Draw** — Toggle ExcalidrawOverlay
- **Instructions** → `InstructionsDialog`

## Visibility

The control bar auto-hides when the mouse is inactive (5-second timeout managed by `useUiStore.isMouseActive`). It reappears on mouse movement.

## Dependencies

- shadcn/ui: `Button`, `DropdownMenu`
- lucide-react: Icons
- `next-themes` (legacy, being replaced by `useThemeStore`)

→ See [Studio Page](../pages/studio-page.md) for context  
→ See [Settings Panel](./settings-panel.md) for the settings sidebar
