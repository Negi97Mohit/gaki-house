# Media Controls & Video Settings

→ Back to [Index](../../INDEX.md) | [Web App](../README.md) | [Components](./README.md)

---

## Overview

The media controls system provides the **microphone, camera, recording, and streaming buttons** in the bottom navigation, plus a comprehensive video settings dialog for fine-tuning camera and effects.

## Components

```
src/features/studio/ui/controls/
├── MediaControls.tsx          (15KB) — Mic, camera, record, stream controls
├── AIControls.tsx             (2.6KB) — AI assistant trigger button
├── SceneControls.tsx          (2.6KB) — Undo, redo, reset scene buttons
├── AudioSettingsDialog.tsx    (1KB)  — Quick audio settings
└── VideoSettingsDialog.tsx    (30KB) — Full camera/video settings
```

---

## MediaControls (15KB)

→ Source: [MediaControls.tsx](file:///c:/Users/Dell/Desktop/caption-cam/src/features/studio/ui/controls/MediaControls.tsx)

The central control cluster in the bottom navigation bar:

| Button | Icon | Shortcut | Action |
|---|---|---|---|
| 🎤 Microphone | Mic/MicOff | `M` | Toggle audio on/off via `useMediaStore` |
| 📷 Camera | Video/VideoOff | `V` | Toggle video on/off via `useMediaStore` |
| 🖥 Screen Share | Monitor | `S` | Toggle screen sharing |
| ⏺ Record | Circle (red pulse) | `R` | Start/stop recording |
| 🔴 Go Live | Radio | `B` | Open stream configuration modal |

### Recording Button States
| State | Visual |
|---|---|
| Idle | Outline circle icon |
| Recording | Red pulsing dot with duration timer |
| Stopping | Spinner icon |
| Saved | Checkmark, then resets |

### Go Live Button States
| State | Visual |
|---|---|
| Idle | Outline radio icon |
| Connecting | Amber pulsing animation |
| Broadcasting | Red "LIVE" badge with pulse |
| Error | Red icon with error tooltip |

### Popover Menus
Each media button has a secondary popover for detailed settings:
- **Mic**: Device selector dropdown (lists available microphones)
- **Camera**: Device selector + opens `VideoSettingsDialog`
- **Screen Share**: Source picker (screen vs. window list for Electron)

---

## VideoSettingsDialog (30KB)

→ Source: [VideoSettingsDialog.tsx](file:///c:/Users/Dell/Desktop/caption-cam/src/features/studio/ui/controls/VideoSettingsDialog.tsx)

A **comprehensive camera settings dialog** with tabbed sections:

### Camera Tab
- Camera device selector
- Live preview with selected camera
- Resolution selection
- Aspect ratio (16:9, 4:3, 1:1, 9:16)
- Frame rate selection (24/30/60 fps)
- Mirror (horizontal flip) toggle

### Effects Tab
- **Auto-framing** — Enable/disable, sensitivity slider, tracking speed
- **Neon Edge** — Enable/disable, intensity slider, color picker
- **Background** — None / Blur (intensity slider) / Virtual background (image picker)
- **Beautify** — Skin smoothing toggle
- **Low Light** — Brightness enhancement toggle

### Filters Tab
- 50+ CSS filter presets in a scrollable grid
- Live preview for each filter
- Active filter indicator
- Clear filter button
- Filter categories: Vintage, Modern, Dramatic, Color, B&W

### Style Tab
- PiP border width, color, radius
- PiP shadow blur and color
- Camera rotation slider
- Camera opacity slider
- Camera shape presets (rectangle, circle, square, rounded)

---

## AIControls (2.6KB)

→ Source: [AIControls.tsx](file:///c:/Users/Dell/Desktop/caption-cam/src/features/studio/ui/controls/AIControls.tsx)

AI assistant trigger in the bottom bar:
- Opens `AIChatbot` or `AICommandPopover`
- Shows processing indicator when AI is generating
- Keyboard shortcut `A`
- Toggles `useUiStore.isChatbotOpen`

---

## SceneControls (2.6KB)

→ Source: [SceneControls.tsx](file:///c:/Users/Dell/Desktop/caption-cam/src/features/studio/ui/controls/SceneControls.tsx)

History and scene management buttons:

| Button | Shortcut | Action |
|---|---|---|
| ↩ Undo | `Ctrl+Z` | Revert last change |
| ↪ Redo | `Ctrl+Shift+Z` | Re-apply last undone change |
| 🔄 Reset | `R` | Reset scene to defaults |

Buttons are disabled when `canUndo` / `canRedo` are false (from `useSceneStore`).

→ See [State Management](../../architecture/state-management.md) for store details  
→ See [Streaming Feature](../features/streaming-feature.md) for broadcast flow
