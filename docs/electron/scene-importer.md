# Scene & Vault Importer

→ Back to [Index](../INDEX.md) | [Electron](./README.md)

---

## Overview

A robust broadcast application requires importing scenes built securely inside OBS Studio, or natively importing professional `.overlay` zip packages from domains like Streamlabs or StreamSpell.

The Importer maps these assets and stores them sequentially.

## The FileVault Ecosystem

Assets inside GAKI aren't tied directly to their URL or path in elements.
They belong to a centralized repository: `useFileVault`.

### How it Works
1. An asset is imported. It natively receives a `VaultAsset` payload including an `id`, `name`, `type`, and physical `path`.
2. When the `CompositorWorker` wishes to render `"source-123"`, it queries the Vault.
3. `local-asset://` retrieves the vault path natively.

## Streamlabs / StreamSpell (.overlay) parsing

The `.overlay` format is simply a structured zip file containing a config `blobs` or `json` file and a flat directory of graphical elements.

### Parsing Flow (`src/services/importers/streamlabsImporter.ts`)
1. **Unzipping**: The `.overlay` file executes standard `JSZip` extractions into a safe local directory.
2. **Path Normalization**: Every nested subdirectory is analyzed. Missing assets are tracked.
3. **Data Translation**: Streamlabs structures scenes as arbitrary CSS positional arrays. We translate these arrays to our typed `SerializedScene` interface.
   - Text elements load the native Tiptap payload structures.
   - Videos are tagged as `media` and ported specifically.
4. **Auto-Categorization**: Heuristics categorize imports into Vault groupings: e.g., if a file is named `webcam_frame_16x9.webm`, it is labeled an Overlay.

## Missing Assets

If an imported JSON config points back to a network drive `D:/Stream/Overlays...` that the current machine lacks, GAKI will render a specific `MISSING` source placeholder.

The user can natively right-click the source in the timeline and invoke the IPC command `window.electron.import.resolveAsset`. This triggers an OS native dialog securely prompting the user to remap the missing underlying asset in the Vault.
