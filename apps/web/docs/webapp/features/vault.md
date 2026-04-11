# Vault (Asset Management)

→ Back to [Index](../../INDEX.md) | [Features](./README.md)

---

## Overview

The Vault is an **asset management system** for organizing and importing overlay packages, scene collections, and media assets. It supports importing from OBS Studio and Streamlabs Desktop formats.

## Feature Module

```
src/features/vault/
├── hooks/
│   └── useVault.ts            — Vault CRUD operations
├── ui/
│   └── (VaultBrowser, AssetCard, ImportDialog)
└── index.ts                   — Barrel exports
```

## Capabilities

### Asset Organization
- **Categories:** Screens, Overlays, Alerts, Transitions
- **Auto-categorization:** Imported assets are sorted by type
- **Thumbnail generation:** Preview images for quick browsing

### Import Formats
- **OBS Scene Collections** — JSON-based scene files
- **Streamlabs Overlay Packages** — ZIP archives with nested assets
- **Folder Import** — Drag-and-drop folders with auto-detection

### Import Pipeline

```
User imports file/folder
    │
    ▼
src/services/importers/
    ├── OBS Importer → parse JSON scene collection
    └── Streamlabs Importer → extract ZIP, categorize assets
           │
           ▼
    Coordinate normalization (OBS pixels → GAKI percentages)
           │
           ▼
    Assets stored in vault (electron-store or localStorage)
           │
           ▼
    Available for use in any scene
```

## Integration Points

- **OBS Compositor** → See [OBS Compositor](../../electron/obs-compositor.md)
- **Scene Management** → See [Scene Management](./scene-management.md)
- **Electron Storage** → See [IPC Bridge](../../architecture/ipc-bridge.md)

## Types

```typescript
// src/types/vault.ts
interface VaultAsset {
  id: string;
  name: string;
  category: 'screen' | 'overlay' | 'alert' | 'transition';
  type: string;          // file MIME type
  path: string;          // asset path
  thumbnail?: string;    // preview image
}
```
