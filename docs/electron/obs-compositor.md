# OBS Compositor — Scene Import / Export

→ Back to [Index](../INDEX.md) | [Electron](./README.md) | [Compositor](./compositor.md)

---

## Overview

The OBS compositor module handles **scene collection import and export**, enabling users to bring in existing stream setups from OBS Studio and Streamlabs Desktop with just a few clicks.

> **Status:** Implemented (Phase 3). Import/export is fully functional.

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
src/services/importers/         — Import/export logic
├── index.ts                    — Barrel export
├── types.ts                    — OBS/Streamlabs format types & source mapping tables
├── obsImporter.ts              — OBS Studio JSON parser → SceneCollection
├── streamlabsImporter.ts       — Streamlabs .overlay/.json parser → SceneCollection
└── sceneExporter.ts            — SceneCollection → OBS-compatible JSON export

electron/main.ts                — IPC handlers (import:open-scene-collection, export:save-scene-collection, import:resolve-asset)
electron/preload.ts             — Renderer API (window.electron.import, window.electron.export)
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

## IPC Handlers

The Electron main process exposes these channels in [main.ts](file:///c:/Users/Dell/Desktop/caption-cam/electron/main.ts) (section 7):

| Channel | Direction | Purpose |
|---|---|---|
| `import:open-scene-collection` | Renderer → Main | Opens file dialog (.json/.overlay/.zip), reads file, returns content |
| `export:save-scene-collection` | Renderer → Main | Save dialog, writes JSON to disk |
| `import:resolve-asset` | Renderer → Main | Dialog to locate a missing asset file |

Renderer API (exposed via [preload.ts](file:///c:/Users/Dell/Desktop/caption-cam/electron/preload.ts)):

```typescript
window.electron.import.openSceneCollection()   // → { ok, format, content, fileName }
window.electron.import.resolveAsset(path, type) // → { ok, resolvedPath }
window.electron.export.saveSceneCollection(json, name) // → { ok, filePath }
```

## Integration Points

→ See [Compositor](./compositor.md) for the rendering pipeline
→ See [Scene Management](../webapp/features/scene-management.md) for scene CRUD
→ See [Vault](../webapp/features/vault.md) for imported asset management
→ See [Grid Sections](../webapp/components/grid-sections.md) for grid layout assignment
→ See [Gaps & TODOs](../overview/gaps-and-todos.md) for implementation status
