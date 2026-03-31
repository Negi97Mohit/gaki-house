/**
 * Scene Collection Store — Central state for the compositor.
 *
 * This is the canonical source of truth for all scenes, sources, and their
 * configuration. The compositor worker reads from this store (via the bridge)
 * to know what to render.
 *
 * → See docs/electron/compositor.md for architecture overview
 * → See src/types/compositor.ts for type definitions
 */

import { create } from 'zustand';
import {
  SceneCollection,
  CompositorScene,
  CompositorSource,
  SourceType,
  SourceTransform,
  SourceFilter,
  SourceAudioConfig,
  SceneTransition,
  GridLayout,
  GridCell,
  AudioMixerState,
  OutputConfig,
  DEFAULT_TRANSFORM,
  DEFAULT_AUDIO,
  DEFAULT_TRANSITION,
  DEFAULT_OUTPUT_CONFIG,
  Alignment,
} from '@/types/compositor';
import { nanoid } from 'nanoid' ;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function createId(): string {
  // nanoid may not be installed; fallback to crypto
  if (typeof nanoid === 'function') return nanoid(12);
  return crypto.randomUUID().slice(0, 12);
}

function createDefaultSource(
  type: SourceType,
  name: string,
  settings: Record<string, any> = {},
  overrides: Partial<CompositorSource> = {}
): CompositorSource {
  return {
    id: createId(),
    name,
    type,
    settings,
    transform: { ...DEFAULT_TRANSFORM },
    filters: [],
    visible: true,
    locked: false,
    audio: { ...DEFAULT_AUDIO },
    children: [],
    opacity: 1,
    blendMode: 'source-over' as GlobalCompositeOperation,
    isBehindUser: false,
    ...overrides,
  };
}

function createDefaultScene(name: string): CompositorScene {
  return {
    id: createId(),
    name,
    sources: [],
    transition: { ...DEFAULT_TRANSITION },
    gridLayout: null,
  };
}

function createDefaultCollection(): SceneCollection {
  const scene = createDefaultScene('Scene 1');
  return {
    id: createId(),
    name: 'Default Collection',
    scenes: [scene],
    activeSceneId: scene.id,
    canvasResolution: { width: 1920, height: 1080 },
    audioMixer: {
      masterVolume: 1.0,
      masterMuted: false,
      levels: {},
    },
    defaultTransition: { ...DEFAULT_TRANSITION },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    importedFrom: null,
  };
}

// ─── Store Interface ─────────────────────────────────────────────────────────

interface SceneCollectionState {
  /** The active scene collection */
  collection: SceneCollection;

  /** Output configuration */
  outputConfig: OutputConfig;

  /** Whether a transition is currently playing */
  isTransitioning: boolean;

  // ── Collection Actions ──

  setCollection: (collection: SceneCollection) => void;
  resetCollection: () => void;
  setCanvasResolution: (width: number, height: number) => void;
  setDefaultTransition: (transition: SceneTransition) => void;

  // ── Scene Actions ──

  getActiveScene: () => CompositorScene | undefined;
  addScene: (name?: string) => CompositorScene;
  removeScene: (sceneId: string) => void;
  renameScene: (sceneId: string, name: string) => void;
  setActiveScene: (sceneId: string) => void;
  reorderScenes: (fromIndex: number, toIndex: number) => void;
  duplicateScene: (sceneId: string) => CompositorScene | null;
  setSceneTransition: (sceneId: string, transition: SceneTransition) => void;
  setSceneGridLayout: (sceneId: string, layout: GridLayout | null) => void;

  // ── Source Actions ──

  addSource: (sceneId: string, type: SourceType, name: string, settings?: Record<string, any>, transformOverrides?: Partial<SourceTransform>) => CompositorSource | null;
  removeSource: (sceneId: string, sourceId: string) => void;
  updateSourceSettings: (sceneId: string, sourceId: string, settings: Record<string, any>) => void;
  updateSourceTransform: (sceneId: string, sourceId: string, transform: Partial<SourceTransform>) => void;
  setSourceVisibility: (sceneId: string, sourceId: string, visible: boolean) => void;
  setSourceLocked: (sceneId: string, sourceId: string, locked: boolean) => void;
  setSourceOpacity: (sceneId: string, sourceId: string, opacity: number) => void;
  renameSource: (sceneId: string, sourceId: string, name: string) => void;
  reorderSources: (sceneId: string, fromIndex: number, toIndex: number) => void;
  duplicateSource: (sceneId: string, sourceId: string) => CompositorSource | null;
  moveSourceToScene: (fromSceneId: string, toSceneId: string, sourceId: string) => void;

  // ── Source Filter Actions ──

  addFilter: (sceneId: string, sourceId: string, filter: SourceFilter) => void;
  removeFilter: (sceneId: string, sourceId: string, filterId: string) => void;
  updateFilter: (sceneId: string, sourceId: string, filterId: string, updates: Partial<SourceFilter>) => void;
  reorderFilters: (sceneId: string, sourceId: string, fromIndex: number, toIndex: number) => void;

  // ── Source Audio Actions ──

  setSourceAudio: (sceneId: string, sourceId: string, audio: Partial<SourceAudioConfig>) => void;
  setMasterVolume: (volume: number) => void;
  setMasterMuted: (muted: boolean) => void;

  // ── Grid Layout Actions ──

  assignSourceToCell: (sceneId: string, cellId: string, sourceId: string | null) => void;

  // ── Output Actions ──

  setOutputConfig: (config: Partial<OutputConfig>) => void;
  setIsTransitioning: (v: boolean) => void;

  // ── Persistence ──

  toJSON: () => string;
  fromJSON: (json: string) => void;
}

// ─── Store Implementation ────────────────────────────────────────────────────

export const useSceneCollectionStore = create<SceneCollectionState>((set, get) => {
  // Helper: update a scene within the collection
  const updateScene = (sceneId: string, updater: (scene: CompositorScene) => CompositorScene) => {
    set((state) => ({
      collection: {
        ...state.collection,
        updatedAt: new Date().toISOString(),
        scenes: state.collection.scenes.map((s) =>
          s.id === sceneId ? updater(s) : s
        ),
      },
    }));
  };

  // Helper: update a source within a scene
  const updateSource = (
    sceneId: string,
    sourceId: string,
    updater: (source: CompositorSource) => CompositorSource
  ) => {
    const deepUpdate = (sources: CompositorSource[]): CompositorSource[] =>
      sources.map((s) => {
        if (s.id === sourceId) return updater(s);
        if (s.children.length > 0) return { ...s, children: deepUpdate(s.children) };
        return s;
      });

    updateScene(sceneId, (scene) => ({
      ...scene,
      sources: deepUpdate(scene.sources),
    }));
  };

  return {
    collection: createDefaultCollection(),
    outputConfig: { ...DEFAULT_OUTPUT_CONFIG },
    isTransitioning: false,

    // ── Collection Actions ──

    setCollection: (collection) => set({ collection }),

    resetCollection: () => set({ collection: createDefaultCollection() }),

    setCanvasResolution: (width, height) =>
      set((state) => ({
        collection: {
          ...state.collection,
          canvasResolution: { width, height },
          updatedAt: new Date().toISOString(),
        },
      })),

    setDefaultTransition: (transition) =>
      set((state) => ({
        collection: {
          ...state.collection,
          defaultTransition: transition,
          updatedAt: new Date().toISOString(),
        },
      })),

    // ── Scene Actions ──

    getActiveScene: () => {
      const { collection } = get();
      return collection.scenes.find((s) => s.id === collection.activeSceneId);
    },

    addScene: (name) => {
      const scene = createDefaultScene(name || `Scene ${get().collection.scenes.length + 1}`);
      set((state) => ({
        collection: {
          ...state.collection,
          scenes: [...state.collection.scenes, scene],
          activeSceneId: scene.id,
          updatedAt: new Date().toISOString(),
        },
      }));
      return scene;
    },

    removeScene: (sceneId) => {
      const { collection } = get();
      if (collection.scenes.length <= 1) return; // Keep at least 1
      const remaining = collection.scenes.filter((s) => s.id !== sceneId);
      const newActiveId =
        collection.activeSceneId === sceneId
          ? remaining[0]?.id ?? ''
          : collection.activeSceneId;
      set({
        collection: {
          ...collection,
          scenes: remaining,
          activeSceneId: newActiveId,
          updatedAt: new Date().toISOString(),
        },
      });
    },

    renameScene: (sceneId, name) =>
      updateScene(sceneId, (s) => ({ ...s, name })),

    setActiveScene: (sceneId) =>
      set((state) => ({
        collection: {
          ...state.collection,
          activeSceneId: sceneId,
        },
      })),

    reorderScenes: (fromIndex, toIndex) =>
      set((state) => {
        const scenes = [...state.collection.scenes];
        const [moved] = scenes.splice(fromIndex, 1);
        scenes.splice(toIndex, 0, moved);
        return {
          collection: { ...state.collection, scenes, updatedAt: new Date().toISOString() },
        };
      }),

    duplicateScene: (sceneId) => {
      const original = get().collection.scenes.find((s) => s.id === sceneId);
      if (!original) return null;
      const dup: CompositorScene = {
        ...structuredClone(original),
        id: createId(),
        name: `${original.name} (Copy)`,
      };
      // Regenerate IDs for all sources
      const reId = (sources: CompositorSource[]): CompositorSource[] =>
        sources.map((s) => ({
          ...s,
          id: createId(),
          children: reId(s.children),
          filters: s.filters.map((f) => ({ ...f, id: createId() })),
        }));
      dup.sources = reId(dup.sources);
      set((state) => ({
        collection: {
          ...state.collection,
          scenes: [...state.collection.scenes, dup],
          activeSceneId: dup.id,
          updatedAt: new Date().toISOString(),
        },
      }));
      return dup;
    },

    setSceneTransition: (sceneId, transition) =>
      updateScene(sceneId, (s) => ({ ...s, transition })),

    setSceneGridLayout: (sceneId, layout) =>
      updateScene(sceneId, (s) => ({ ...s, gridLayout: layout })),

    // ── Source Actions ──

    addSource: (sceneId, type, name, settings = {}, transformOverrides = {}) => {
      const source = createDefaultSource(type, name, settings, {
        transform: { ...DEFAULT_TRANSFORM, ...transformOverrides },
      });
      updateScene(sceneId, (scene) => ({
        ...scene,
        sources: [...scene.sources, source],
      }));
      return source;
    },

    removeSource: (sceneId, sourceId) => {
      const removeRecursive = (sources: CompositorSource[]): CompositorSource[] =>
        sources
          .filter((s) => s.id !== sourceId)
          .map((s) => ({ ...s, children: removeRecursive(s.children) }));
      updateScene(sceneId, (scene) => ({
        ...scene,
        sources: removeRecursive(scene.sources),
      }));
    },

    updateSourceSettings: (sceneId, sourceId, settings) =>
      updateSource(sceneId, sourceId, (s) => ({
        ...s,
        settings: { ...s.settings, ...settings },
      })),

    updateSourceTransform: (sceneId, sourceId, transform) =>
      updateSource(sceneId, sourceId, (s) => ({
        ...s,
        transform: { ...s.transform, ...transform },
      })),

    setSourceVisibility: (sceneId, sourceId, visible) =>
      updateSource(sceneId, sourceId, (s) => ({ ...s, visible })),

    setSourceLocked: (sceneId, sourceId, locked) =>
      updateSource(sceneId, sourceId, (s) => ({ ...s, locked })),

    setSourceOpacity: (sceneId, sourceId, opacity) =>
      updateSource(sceneId, sourceId, (s) => ({ ...s, opacity })),

    renameSource: (sceneId, sourceId, name) =>
      updateSource(sceneId, sourceId, (s) => ({ ...s, name })),

    reorderSources: (sceneId, fromIndex, toIndex) =>
      updateScene(sceneId, (scene) => {
        const sources = [...scene.sources];
        const [moved] = sources.splice(fromIndex, 1);
        sources.splice(toIndex, 0, moved);
        return { ...scene, sources };
      }),

    duplicateSource: (sceneId, sourceId) => {
      const scene = get().collection.scenes.find((s) => s.id === sceneId);
      if (!scene) return null;
      const findSource = (sources: CompositorSource[]): CompositorSource | null => {
        for (const s of sources) {
          if (s.id === sourceId) return s;
          const found = findSource(s.children);
          if (found) return found;
        }
        return null;
      };
      const original = findSource(scene.sources);
      if (!original) return null;
      const dup: CompositorSource = {
        ...structuredClone(original),
        id: createId(),
        name: `${original.name} (Copy)`,
        transform: {
          ...original.transform,
          position: {
            x: original.transform.position.x + 20,
            y: original.transform.position.y + 20,
          },
        },
      };
      updateScene(sceneId, (s) => ({
        ...s,
        sources: [...s.sources, dup],
      }));
      return dup;
    },

    moveSourceToScene: (fromSceneId, toSceneId, sourceId) => {
      const { collection } = get();
      const fromScene = collection.scenes.find((s) => s.id === fromSceneId);
      if (!fromScene) return;
      const source = fromScene.sources.find((s) => s.id === sourceId);
      if (!source) return;
      set((state) => ({
        collection: {
          ...state.collection,
          scenes: state.collection.scenes.map((scene) => {
            if (scene.id === fromSceneId) {
              return { ...scene, sources: scene.sources.filter((s) => s.id !== sourceId) };
            }
            if (scene.id === toSceneId) {
              return { ...scene, sources: [...scene.sources, source] };
            }
            return scene;
          }),
          updatedAt: new Date().toISOString(),
        },
      }));
    },

    // ── Source Filter Actions ──

    addFilter: (sceneId, sourceId, filter) =>
      updateSource(sceneId, sourceId, (s) => ({
        ...s,
        filters: [...s.filters, filter],
      })),

    removeFilter: (sceneId, sourceId, filterId) =>
      updateSource(sceneId, sourceId, (s) => ({
        ...s,
        filters: s.filters.filter((f) => f.id !== filterId),
      })),

    updateFilter: (sceneId, sourceId, filterId, updates) =>
      updateSource(sceneId, sourceId, (s) => ({
        ...s,
        filters: s.filters.map((f) =>
          f.id === filterId ? { ...f, ...updates } : f
        ),
      })),

    reorderFilters: (sceneId, sourceId, fromIndex, toIndex) =>
      updateSource(sceneId, sourceId, (s) => {
        const filters = [...s.filters];
        const [moved] = filters.splice(fromIndex, 1);
        filters.splice(toIndex, 0, moved);
        return { ...s, filters };
      }),

    // ── Source Audio Actions ──

    setSourceAudio: (sceneId, sourceId, audio) =>
      updateSource(sceneId, sourceId, (s) => ({
        ...s,
        audio: { ...s.audio, ...audio },
      })),

    setMasterVolume: (volume) =>
      set((state) => ({
        collection: {
          ...state.collection,
          audioMixer: { ...state.collection.audioMixer, masterVolume: volume },
        },
      })),

    setMasterMuted: (muted) =>
      set((state) => ({
        collection: {
          ...state.collection,
          audioMixer: { ...state.collection.audioMixer, masterMuted: muted },
        },
      })),

    // ── Grid Layout Actions ──

    assignSourceToCell: (sceneId, cellId, sourceId) =>
      updateScene(sceneId, (scene) => {
        if (!scene.gridLayout) return scene;
        return {
          ...scene,
          gridLayout: {
            ...scene.gridLayout,
            cells: scene.gridLayout.cells.map((cell) =>
              cell.id === cellId ? { ...cell, sourceId } : cell
            ),
          },
        };
      }),

    // ── Output Actions ──

    setOutputConfig: (config) =>
      set((state) => ({
        outputConfig: { ...state.outputConfig, ...config },
      })),

    setIsTransitioning: (v) => set({ isTransitioning: v }),

    // ── Persistence ──

    toJSON: () => {
      const { collection, outputConfig } = get();
      return JSON.stringify({ collection, outputConfig }, null, 2);
    },

    fromJSON: (json) => {
      try {
        const data = JSON.parse(json);
        if (data.collection) set({ collection: data.collection });
        if (data.outputConfig) set({ outputConfig: data.outputConfig });
      } catch (e) {
        console.error('[SceneCollection] Failed to parse JSON:', e);
      }
    },
  };
});
