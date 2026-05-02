import { create } from "zustand";
import type { ObsOverlayState } from "@gaki/core/types/caption";
import { useHistoryStore } from "@/stores/history.store";
import { BroadcastBus } from "@gaki/engine/kernel/engine/BroadcastBus";

function replaceById(items: ObsOverlayState[], asset: ObsOverlayState): ObsOverlayState[] {
  const idx = items.findIndex((o) => o.id === asset.id);
  if (idx === -1) return [...items, asset];
  const next = items.slice();
  next[idx] = asset;
  return next;
}

function removeById(items: ObsOverlayState[], id: string): ObsOverlayState[] {
  const idx = items.findIndex((o) => o.id === id);
  if (idx === -1) return items;
  const next = items.slice();
  next.splice(idx, 1);
  return next;
}

export interface ObsOverlayStoreState {
  obsOverlays: ObsOverlayState[];

  setObsOverlays: (overlays: ObsOverlayState[], opts?: { pushHistory?: boolean }) => void;
  updateAsset: (asset: ObsOverlayState, opts?: { pushHistory?: boolean; throttleWorker?: boolean }) => void;
  removeAsset: (id: string, opts?: { pushHistory?: boolean }) => void;
  reorderAssets: (orderedIds: string[], opts?: { pushHistory?: boolean }) => void;

  undo: () => void;
  redo: () => void;
}

export const useObsOverlayStore = create<ObsOverlayStoreState>((set, get) => ({
  obsOverlays: [],

  setObsOverlays: (overlays, opts) => {
    const pushHistory = opts?.pushHistory ?? false;
    if (pushHistory) useHistoryStore.getState().pushHistory(get().obsOverlays);
    set({ obsOverlays: overlays });
    BroadcastBus.activeInstance?.dispatch({ type: "BATCH_UPDATE", overlays });
  },

  updateAsset: (asset, opts) => {
    const pushHistory = opts?.pushHistory ?? false;
    const throttleWorker = opts?.throttleWorker ?? true;

    if (pushHistory) useHistoryStore.getState().pushHistory(get().obsOverlays);
    set((state) => ({ obsOverlays: replaceById(state.obsOverlays, asset) }));

    const bus = BroadcastBus.activeInstance;
    if (!bus) return;
    if (throttleWorker) bus.dispatchAssetUpdateThrottled(asset);
    else bus.dispatch({ type: "UPDATE_ASSET", asset });
  },

  removeAsset: (id, opts) => {
    const pushHistory = opts?.pushHistory ?? true;
    if (pushHistory) useHistoryStore.getState().pushHistory(get().obsOverlays);
    set((state) => ({ obsOverlays: removeById(state.obsOverlays, id) }));
    BroadcastBus.activeInstance?.dispatch({ type: "REMOVE_ASSET", id });
  },

  reorderAssets: (orderedIds, opts) => {
    const pushHistory = opts?.pushHistory ?? true;
    if (pushHistory) useHistoryStore.getState().pushHistory(get().obsOverlays);

    const byId = new Map(get().obsOverlays.map((o) => [o.id, o]));
    const next = orderedIds.map((id) => byId.get(id)).filter(Boolean) as ObsOverlayState[];
    // Append any overlays not mentioned (defensive)
    for (const o of get().obsOverlays) {
      if (!orderedIds.includes(o.id)) next.push(o);
    }
    set({ obsOverlays: next });

    BroadcastBus.activeInstance?.dispatch({ type: "REORDER_ASSETS", orderedIds });
  },

  undo: () => {
    const current = get().obsOverlays;
    const restored = useHistoryStore.getState().undo(current);
    if (!restored) return;
    set({ obsOverlays: restored });
    BroadcastBus.activeInstance?.dispatch({ type: "BATCH_UPDATE", overlays: restored });
  },

  redo: () => {
    const current = get().obsOverlays;
    const restored = useHistoryStore.getState().redo(current);
    if (!restored) return;
    set({ obsOverlays: restored });
    BroadcastBus.activeInstance?.dispatch({ type: "BATCH_UPDATE", overlays: restored });
  },
}));

