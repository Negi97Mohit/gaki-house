# OBS Compositor — Scene Import / Export

→ Back to [Index](../INDEX.md) | [Electron](./README.md) | [Compositor](./compositor.md)

---

## Overview

The OBS compositor module handles **scene collection import and export**, enabling users to bring in existing stream setups from OBS Studio and Streamlabs Desktop with just a few clicks.

> **Status:** Phase 1 (compositor engine) is implemented. Import/export is planned for Phase 3.

## Architecture

The module bridges between external scene collection formats and GAKI's internal `CompositorScene` model:

```
External Format                    GAKI Internal
┌─────────────────┐               ┌─────────────────────┐
│ OBS JSON        │──▶ Parser ──▶│ SceneCollection       │
│ (.json)         │               │ (compositor.ts types) │
├─────────────────┤               │                       │
│ Streamlabs      │──▶ Parser ──▶│ Stored in             │
│ (.overlay/.zip) │               │ sceneCollection.store │
└─────────────────┘               └─────────────────────┘
```

## Directory Structure

```
src/services/importers/         — Import/export logic (planned)
├── obsImporter.ts              — OBS Studio JSON parser
├── streamlabsImporter.ts       — Streamlabs .overlay/.json parser
├── sceneExporter.ts            — Export to OBS-compatible JSON
└── types.ts                    — Shared importer types

electron/obs/                   — Electron-side support
├── compositor/                 — Coordinate normalization utilities
└── sources/                    — Source type mapping definitions
```

## Scene Collection Import Flow

### OBS Studio (JSON)

OBS stores scene collections as `.json` files with the structure:
```json
{
  "current_scene": "Main Scene",
  "scene_order": [{ "name": "Main Scene" }, { "name": "BRB" }],
  "sources": [
    {
      "id": "image_source",
      "name": "Logo",
      "settings": { "file": "C:\\overlay\\logo.png" },
      "sync": 0
    }
  ]
}
```

The importer:
1. Parses the JSON and extracts scenes + sources
2. Maps OBS source IDs → GAKI `SourceType` (e.g., `image_source` → `image`)
3. Converts OBS absolute pixel transforms → `SourceTransform` (pixel-based, matching OBS model)
4. Resolves file paths (prompts dialog for missing assets)
5. Stores extracted assets in the [Vault](../webapp/features/vault.md)
6. Creates a `SceneCollection` in the [sceneCollection.store](file:///c:/Users/Dell/Desktop/caption-cam/src/stores/sceneCollection.store.ts)

### Streamlabs Desktop (.overlay / .zip)

Streamlabs uses a ZIP-based `.overlay` package containing:
- `manifest.json` — Package metadata and scene definitions
- `assets/` — Screens, overlays, alerts, and transition media files

The importer:
1. Extracts the ZIP via JSZip
2. Categorizes assets (Screens, Overlays, Alerts, Transitions)
3. Stores assets in the Vault
4. Parses scene definitions and creates `CompositorScene` objects

## Coordinate System

The new compositor uses **absolute pixel coordinates** (matching OBS), with the base canvas at 1920×1080:

```
OBS / GAKI Compositor:
  Source at (480, 270) with size (960, 540) on 1920×1080 canvas

  ┌──────────────────────────────────────────┐ 1920
  │                                          │
  │    ┌────────────────────────┐            │
  │    │      Source             │            │
  │    │   (480, 270)           │            │ 1080
  │    │   960 × 540            │            │
  │    └────────────────────────┘            │
  │                                          │
  └──────────────────────────────────────────┘
```

## Source Type Mapping

| OBS Source ID | GAKI SourceType | Notes |
|---|---|---|
| `dshow_input` / `v4l2_input` | `camera` | Video capture device |
| `monitor_capture` | `screen_capture` | Display capture |
| `window_capture` | `window_capture` | Window capture |
| `image_source` | `image` | Static image |
| `ffmpeg_source` | `media` | Video/audio file |
| `browser_source` | `browser` | Browser URL |
| `text_gdiplus` / `text_ft2_source` | `text` | Text overlay |
| `color_source` / `color_source_v3` | `color` | Solid color |
| `scene` | `scene` | Nested scene reference |
| `group` | `group` | Source group |

## IPC Handlers (Planned)

The Electron main process will expose:

| Channel | Direction | Purpose |
|---|---|---|
| `import:obs-collection` | Renderer → Main | Open file dialog for .json |
| `import:streamlabs-overlay` | Renderer → Main | Open file dialog for .overlay/.zip |
| `export:scene-collection` | Renderer → Main | Save .json to disk |
| `import:resolve-assets` | Renderer → Main | Dialog for missing asset files |

→ See [Preload API](./preload.md) for exposed IPC surface
→ See [Main Process](./main-process.md) for IPC handler registration

## Integration Points

→ See [Compositor](./compositor.md) for the rendering pipeline
→ See [Scene Management](../webapp/features/scene-management.md) for scene CRUD
→ See [Vault](../webapp/features/vault.md) for imported asset management
→ See [Grid Sections](../webapp/components/grid-sections.md) for grid layout assignment
→ See [Gaps & TODOs](../overview/gaps-and-todos.md) for implementation status
