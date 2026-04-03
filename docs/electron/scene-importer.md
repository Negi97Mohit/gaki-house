# Scene & Vault Importer

→ Back to [Index](../INDEX.md) | [Electron](./README.md)

> Last Updated: 2026-04-03

---

## Overview

A robust broadcast application requires importing scenes built inside OBS Studio, or natively importing professional `.overlay` zip packages from domains like Streamlabs or StreamSpell. The Scene & Vault Importer maps these external assets into GAKI's internal data model and stores them in the centralized asset vault.

→ Source: [streamlabsImporter.ts](file:///c:/Users/Dell/Desktop/caption-cam/src/services/importers/streamlabsImporter.ts)
→ Source: [obsImporter.ts](file:///c:/Users/Dell/Desktop/caption-cam/src/services/importers/obsImporter.ts)

---

## The FileVault Ecosystem

Assets inside GAKI aren't tied directly to their URL or path in elements. They belong to a centralized repository: `useFileVault`.

### How it Works
1. An asset is imported. It natively receives a `VaultAsset` payload including an `id`, `name`, `type`, and physical `path`.
2. When the `CompositorWorker` wishes to render `"source-123"`, it queries the Vault.
3. `local-asset://` retrieves the vault path natively via Electron's `protocol.handle`.

→ See [Vault](../webapp/features/vault.md) for the vault feature documentation

---

## Streamlabs / StreamSpell (.overlay) Parsing

The `.overlay` format is simply a structured zip file containing a config `blobs` or `json` file and a flat directory of graphical elements.

### Parsing Flow

→ Source: [streamlabsImporter.ts](file:///c:/Users/Dell/Desktop/caption-cam/src/services/importers/streamlabsImporter.ts) (~14KB)

1. **Unzipping**: The `.overlay` file executes standard `JSZip` extractions into a safe local directory.
2. **Path Normalization**: Every nested subdirectory is analyzed. Missing assets are tracked.
3. **Data Translation**: Streamlabs structures scenes as arbitrary CSS positional arrays. We translate these arrays to our typed `SerializedScene` interface.
   - Text elements load the native Tiptap payload structures.
   - Videos are tagged as `media` and ported specifically.
4. **Auto-Categorization**: Heuristics categorize imports into Vault groupings: e.g., if a file is named `webcam_frame_16x9.webm`, it is labeled an Overlay.

---

## OBS Studio (.json) Parsing

→ Source: [obsImporter.ts](file:///c:/Users/Dell/Desktop/caption-cam/src/services/importers/obsImporter.ts) (~16.8KB)

OBS stores scene collections as `.json` files with source definitions, scene ordering, and transform data.

### Parsing Flow
1. **JSON Parsing**: Extract scenes and sources from OBS's format
2. **Source Type Mapping**: Map OBS source IDs to GAKI `SourceType` (30+ OBS types → 14 GAKI types)
3. **Transform Conversion**: OBS absolute pixel transforms → `SourceTransform` (pixel-based, matching OBS model)
4. **Filter Reconstruction**: Rebuild filter chains from OBS filter definitions
5. **Color Conversion**: ABGR color format → standard hex/RGBA
6. **Group Hierarchy**: Reconstruct nested source groups

---

## Missing Assets

If an imported JSON config points back to a network drive `D:/Stream/Overlays...` that the current machine lacks, GAKI will render a specific `MISSING` source placeholder.

The user can natively right-click the source in the timeline and invoke the IPC command `window.electron.import.resolveAsset`. This triggers an OS native dialog securely prompting the user to remap the missing underlying asset in the Vault.

→ See [IPC Bridge](../architecture/ipc-bridge.md) for the `import:resolve-asset` channel

---

## Related Docs

→ See [OBS Compositor](./obs-compositor.md) for the full import/export architecture
→ See [Compositor](./compositor.md) for how imported scenes are rendered
→ See [Vault](../webapp/features/vault.md) for asset management
→ Source: [importer types](file:///c:/Users/Dell/Desktop/caption-cam/src/services/importers/types.ts) — shared OBS/Streamlabs format types
→ Source: [sceneExporter.ts](file:///c:/Users/Dell/Desktop/caption-cam/src/services/importers/sceneExporter.ts) — export to OBS-compatible JSON
