# OBS Compositor

→ Back to [Index](../INDEX.md) | [Electron](./README.md)

---

## Overview

The OBS compositor module (`electron/obs/`) provides scene collection import and composition capabilities inspired by OBS Studio and Streamlabs Desktop. This feature is **partially implemented**.

## Directory Structure

```
electron/obs/
├── compositor/     — Scene composition logic
│   └── (files for normalizing source coordinates and rendering)
└── sources/        — Source type definitions
    └── (files defining camera, image, browser, and text sources)
```

## Capabilities (Planned/In Progress)

### Scene Collection Import
Import scene collections from:
- **OBS Studio** — JSON-based scene collection files
- **Streamlabs Desktop** — Overlay package format

The importer normalizes coordinate systems between different applications (OBS uses absolute pixel coordinates, GAKI uses percentage-based positioning).

### Source Types
Based on OBS source model:
- **Video Capture** — Camera feeds
- **Image** — Static image overlays
- **Browser Source** — Embedded web pages
- **Text (FreeType)** — Text overlays with font styling
- **Display Capture** — Screen sources
- **Window Capture** — Individual window sources

### Coordinate Normalization
OBS uses absolute pixel coordinates relative to a base canvas resolution (e.g., 1920×1080). GAKI uses percentage-based positioning. The compositor handles the conversion:

```
OBS:  { x: 480, y: 270, width: 960, height: 540 } on 1920×1080
GAKI: { x: 25%, y: 25%, width: 50%, height: 50% }
```

## Integration Points

### Renderer Side
- `src/services/importers/` — Scene collection file parsers
- `src/lib/obs/` — OBS utility functions

### Vault Integration
Imported assets are managed through the **Vault** system:
- `src/features/vault/` — Asset management UI and hooks
- Assets from overlay packages are auto-categorized (Screens, Overlays, Alerts, Transitions)

→ See [Vault](../webapp/features/vault.md) for asset management  
→ See [Scene Management](../webapp/features/scene-management.md) for scene handling

## Current Status

> **⚠️ This feature is partially implemented.** The directory structure and basic importers exist, but full OBS WebSocket protocol support and complete scene reconstruction are not yet available.

→ See [Gaps & TODOs](../overview/gaps-and-todos.md) for known issues
