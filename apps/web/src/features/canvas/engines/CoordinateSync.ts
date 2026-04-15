type SyncPayload = { key: "position" | "size" | "rotation", value: any };

export class CoordinateSync {
  private framePending = false;
  /** map from id -> (map from key -> value) */
  private pendingUpdates: Map<string, Map<string, any>> = new Map();

  constructor(
    private emitFunc: (id: string, key: "position" | "size" | "rotation", value: any) => void
  ) {}

  public enqueueUpdate(id: string, key: "position" | "size" | "rotation", value: any) {
    if (!this.pendingUpdates.has(id)) {
      this.pendingUpdates.set(id, new Map());
    }
    this.pendingUpdates.get(id)!.set(key, value);

    if (this.framePending) return;

    this.framePending = true;
    requestAnimationFrame(() => {
      this.pendingUpdates.forEach((keysMap, targetId) => {
        keysMap.forEach((val, k) => {
          this.emitFunc(targetId, k as any, val);
        });
      });
      this.pendingUpdates.clear();
      this.framePending = false;
    });
  }
}
