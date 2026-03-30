# Asset Library

→ Back to [Index](../../INDEX.md) | [Features](./README.md)

---

## Overview

The asset library lets users search and add stock images, videos, and GIFs to their scenes. It integrates with Pexels, Pixabay, and GIPHY APIs.

## UI Components

- `AssetLibrary.tsx` — Tabbed search UI with image/GIF tabs
- `FloatingAssetSearch.tsx` — Popover wrapper containing AssetLibrary
- Available from `ToolsPopover` in the bottom navigation

## API Clients

→ Source: [assetApis.ts](file:///c:/Users/Dell/Desktop/caption-cam/src/lib/assetApis.ts)

### `searchImages(query, page)`
Searches both Pexels and Pixabay simultaneously, returns merged results.

### `searchGifs(query, page)`
Searches GIPHY, returns GIF results.

### Features
- **Debounced search** — Waits for user to stop typing
- **Infinite scroll** — Loads more results on scroll
- **Dual-source merging** — Pexels + Pixabay results combined
- **Error handling** — Toast notifications on API failures, returns empty results
- **Pagination** — Page-based with `hasMore` flag

## Usage Flow

```
User opens asset search (ToolsPopover → Asset button)
    │
    ▼
AssetLibrary renders with search input + tabs (Images | GIFs)
    │
    ▼
User types query → debounced → searchImages() / searchGifs()
    │
    ▼
Results grid displayed
    │
    ▼
User clicks asset → onSelect callback
    │
    ▼
Added as FileOverlayState to current scene
```

→ See [Integrations](../../architecture/integrations.md) for API details  
→ See [Draggable Elements](./draggable-elements.md) for FileOverlay rendering
