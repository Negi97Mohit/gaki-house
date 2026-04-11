# Zustand Stores

→ Back to [Index](../../INDEX.md) | [Web App](../README.md)

---

→ See [Stores Reference](./stores-reference.md) for the complete API reference.

## Overview

Global reactive state is managed by **Zustand** stores in `src/stores/`. Each store is a standalone module created with `create<T>()`.

| Store | File | Purpose |
|---|---|---|
| `useSceneStore` | `scene.store.ts` | Active scene state (overlays, filters, selections) |
| `useStreamStore` | `stream.store.ts` | Broadcast/recording state + destinations |
| `useMediaStore` | `media.store.ts` | Audio/video device management |
| `useCanvasStore` | `canvas.store.ts` | Canvas viewport (zoom, pan) |
| `useUiStore` | `ui.store.ts` | UI panel visibility |
| `useGoLiveStore` | `goLive.store.ts` | Go-live modal state |
| `useOmegleStore` | `omegle.store.ts` | Random chat matching state |
| `useSceneAudioStore` | `sceneAudio.store.ts` | Per-scene audio settings |
| `useStreamManagerStore` | `stream-manager.store.ts` | Stream manager state |

## Persistence

Only `useStreamStore` uses `zustand/middleware/persist`:
```typescript
persist(
  (set) => ({ ... }),
  {
    name: 'stream-destinations-storage',
    partialize: (state) => ({
      destinations: state.destinations.map(d => ({
        ...d,
        status: 'idle',  // Reset status on reload
        error: undefined,
      })),
    }),
  }
)
```

Other stores use `useThemeStore` (in features/theme) which also persists.

→ See [State Management](../../architecture/state-management.md) for the full state architecture
