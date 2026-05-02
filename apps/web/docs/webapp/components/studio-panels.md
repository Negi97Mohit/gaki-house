# Studio Panels

→ Back to [Index](../../INDEX.md) | [Web App](../README.md) | [Components](./README.md)

---

## Overview

The studio workspace uses a **dockable panel system** where specialized panels slide in from the left sidebar. Each panel focuses on a specific domain (audio, designs, captions, text, etc.). Panels are managed by the `FloatingControlsPanel` which renders them as tabs within a glass-morphism sidebar.

All panels live in `src/features/studio/ui/panels/`.

---

## Panel Index

| Panel | File | Size | What it does |
|---|---|---|---|
| [Settings Panel](#settings-panel) | `SettingsPanel.tsx` | 17KB | App settings (appearance, display, audio, shortcuts, about) |
| [Audio Mixer](#audio-mixer-panel) | `AudioMixerPanel.tsx` | 40KB | Full audio mixer with tracks, ducking, and sound tests |
| [Canvas Designs](#canvas-designs-panel) | `CanvasDesignsPanel.tsx` | 23KB | Stream scene design presets (Starting Soon, BRB, etc.) |
| [Dynamic Styles](#dynamic-styles-panel) | `DynamicStylesPanel.tsx` | 8KB | Caption animation style picker |
| [Static Presets](#static-presets-panel) | `StaticPresetsPanel.tsx` | 5.5KB | Pre-built caption style presets |
| [Social Banners](#social-banners-panel) | `SocialBannersPanel.tsx` | 16KB | Social media alert/banner overlays |
| [GSAP Animations](#gsap-animations-panel) | `GSAPAnimationsPanel.tsx` | 3KB | GSAP-powered text/overlay animations |
| [File Vault](#file-vault-panel) | `FileVaultPanel.tsx` | 10KB | Imported asset management |
| [Saved Overlays](#saved-overlays-panel) | `SavedOverlaysPanel.tsx` | 2.4KB | Library of saved AI overlays |
| [Text Presets](#text-presets-panel) | `TextPresetsPanel.tsx` | 2.7KB | Text design presets |
| [Text Style](#text-style-panel) | `TextStylePanel.tsx` | 0.5KB | Text editing controls |
| [Tools Panel](#tools-panel) | `ToolsPanel.tsx` | 2.5KB | Quick tools (add text, assets, draw) |

---

## Settings Panel

→ Source: [SettingsPanel.tsx](file:///c:/Users/Dell/Desktop/gaki/src/features/studio/ui/panels/SettingsPanel.tsx)

A multi-section settings dialog with tabbed navigation:

| Section | Icon | Controls |
|---|---|---|
| **Appearance** | 🎨 Palette | `ThemeSwitcher` component — theme presets, dark/light mode, custom font |
| **Display** | 🖥 Monitor | Zoom level slider (50-200%), grid toggle, snap-to-grid, fullscreen shortcut |
| **Audio** | 🔊 Volume | Master volume, mic input device, mic volume, output device, noise suppression, echo cancellation |
| **Shortcuts** | ⌨ Keyboard | Full keyboard shortcut reference organized by category |
| **About** | ℹ Info | App branding, version, feature list, creator credits (LinkedIn/GitHub links) |

**Keyboard shortcut categories:**
- System & View: `F` (fullscreen), `Shift+S` (settings)
- AI Assistant: `A` (AI assistant)
- Canvas & History: `Ctrl+Z` (undo), `Ctrl+Shift+Z` (redo), `R` (reset), `Delete`
- Layer Control: front/back/forward/backward
- Media & Stream: mic, camera, broadcast, smart switch, screen share
- Scenes & Layouts: add scene, toggle grid
- Element Creation: add text, asset library, toggle drawing

---

## Audio Mixer Panel

→ Source: [AudioMixerPanel.tsx](file:///c:/Users/Dell/Desktop/gaki/src/features/studio/ui/panels/AudioMixerPanel.tsx) (40KB — the largest panel)

A **professional-grade audio mixer** with features rivaling desktop DAWs:

### Collapsible Sections
Uses `MixerSection` components (icon, title, description, badge, collapsible):

#### 🎤 Microphone Fader
- Volume slider (0-100%)
- Mute toggle
- **Input Sound Test**: Records 5 seconds from mic → plays it back immediately
- Device selection via `useMediaStore`

#### 🔊 Output Fader
- Master output volume slider
- Mute toggle
- **Output Sound Test**: Plays a 4-note ascending sine tone sequence (`C5 → E5 → G5 → C6`)
- Uses Web Audio API (`OscillatorNode` + `GainNode`)

#### 🎵 Scene Audio Tracks
Full audio track management system:
- **Add tracks** from URL or uploaded file
- Per-track controls:
  - Play/Pause/Stop transport controls
  - Seek bar with time display (mm:ss)
  - Volume slider with mute
  - Loop toggle
  - **Smart Ducking**: Auto-lowers music when speech is detected
    - Uses `AnalyserNode` to detect mic RMS level
    - `SPEECH_THRESHOLD = 25` triggers ducking
    - Configurable ducking level (how much to reduce)
  - Scene assignment: assign track to specific scenes or all
  - Loading progress indicator
  - Remove track
- Audio elements managed via `HTMLAudioElement` refs
- State persisted via `useSceneAudioStore`

### Key Sub-Components
| Component | Purpose |
|---|---|
| `FaderStrip` | Reusable volume fader with mute, label, icon |
| `OutputSoundTest` | Plays test tones via Web Audio API |
| `InputSoundTest` | Records mic → plays back (5s max) |
| `TrackRow` | Full audio track player with transport, seek, ducking |
| `SceneAssignment` | Assign audio track to specific scenes |

---

## Canvas Designs Panel

→ Source: [CanvasDesignsPanel.tsx](file:///c:/Users/Dell/Desktop/gaki/src/features/studio/ui/panels/CanvasDesignsPanel.tsx) (23KB)

Provides **pre-designed stream scene templates**:
- Starting Soon screens
- Be Right Back (BRB) screens
- Stream Ended screens
- Social media panels
- Chat overlays
- Alert designs
- Lower-third designs

Templates are full HTML/CSS/JS strings that render as overlays. Users click a design to apply it to the current scene.

→ Uses designs from [streamSceneDesigns.ts](file:///c:/Users/Dell/Desktop/gaki/src/lib/streamSceneDesigns.ts) (38KB library)

---

## Dynamic Styles Panel

→ Source: [DynamicStylesPanel.tsx](file:///c:/Users/Dell/Desktop/gaki/src/features/studio/ui/panels/DynamicStylesPanel.tsx) (8KB)

Caption animation style picker with live previews:
- Each style shows an animated preview of how captions will look
- Click to apply to the current scene's `dynamicStyle`
- 15+ styles: Karaoke, Pop Up, Typewriter, Rainbow Wave, Bounce, Fade In, Slide Up, Glow, Shake, Zoom, Rotate, Flip, Elastic, Blur In, Split

→ See [Caption System](../features/caption-system.md)

---

## Static Presets Panel

→ Source: [StaticPresetsPanel.tsx](file:///c:/Users/Dell/Desktop/gaki/src/features/studio/ui/panels/StaticPresetsPanel.tsx) (5.5KB)

Pre-built caption style presets (font, colors, background, border):
- Each preset is a complete `CaptionStyle` object
- Visual preview card for each preset
- Click to apply to current scene
- Loaded from `src/lib/captionPresets.ts`

---

## Social Banners Panel

→ Source: [SocialBannersPanel.tsx](file:///c:/Users/Dell/Desktop/gaki/src/features/studio/ui/panels/SocialBannersPanel.tsx) (16KB)

Pre-built social media overlays:
- YouTube subscribe banners
- Twitter/X follow banners
- Instagram follow banners
- Discord join banners
- TikTok follow banners
- Custom social alert banners

Each banner is a styled HTML template that can be customized with the user's social handle.

---

## GSAP Animations Panel

→ Source: [GSAPAnimationsPanel.tsx](file:///c:/Users/Dell/Desktop/gaki/src/features/studio/ui/panels/GSAPAnimationsPanel.tsx) (3KB)

Entry point to the GSAP animation editor:
- Browse animation presets
- Open the `GSAPAnimationEditor` for custom animations
- Apply animations to selected overlays

→ See [Animation System](../features/animation-system.md)

---

## File Vault Panel

→ Source: [FileVaultPanel.tsx](file:///c:/Users/Dell/Desktop/gaki/src/features/studio/ui/panels/FileVaultPanel.tsx) (10KB)

Asset vault browser within the sidebar:
- Opens `FileVaultModal` for full vault management
- File import (drag-and-drop)
- Asset categorization and search

→ See [Vault](../features/vault.md)

---

## Saved Overlays Panel

→ Source: [SavedOverlaysPanel.tsx](file:///c:/Users/Dell/Desktop/gaki/src/features/studio/ui/panels/SavedOverlaysPanel.tsx) (2.4KB)

Library of previously generated AI overlays:
- Thumbnail previews
- Click to re-add to current scene
- Delete saved overlays

---

## Text Presets Panel

→ Source: [TextPresetsPanel.tsx](file:///c:/Users/Dell/Desktop/gaki/src/features/studio/ui/panels/TextPresetsPanel.tsx) (2.7KB)

Pre-designed text overlay templates:
- Styled text designs (gradient headers, outlined text, etc.)
- Click to add as a `TextOverlayState` to the current scene

---

## Tools Panel

→ Source: [ToolsPanel.tsx](file:///c:/Users/Dell/Desktop/gaki/src/features/studio/ui/panels/ToolsPanel.tsx) (2.5KB)

Quick access tool buttons:
- Add Text Overlay
- Open Asset Library
- Toggle Drawing (Excalidraw)
- Connect Remote Camera
- Additional utility actions
