import { AppLogger } from "./BroadcastLogger";

export interface SyncStateDump {
  activeSceneId: string;
  scenes: { id: string; name: string }[];
  streamDestinations: any[];
}

export class StateSynchronizer {
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  save(dump: SyncStateDump) {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);

    // Debounce saves by at least 2000ms
    this.debounceTimer = setTimeout(() => {
      const electron = (window as any).electron;
      if (electron?.storage) {
        electron.storage.set("broadcast-session", dump)
          .then(() => {
            AppLogger.log("StateSynchronizer", "debug", "State snapshot safely persisted to disk");
          })
          .catch((err: any) => {
            AppLogger.log("StateSynchronizer", "error", `Snapshot failed: ${err.message}`);
          });
      }
    }, 2000);
  }

  async restore(): Promise<SyncStateDump | null> {
    const electron = (window as any).electron;
    if (electron?.storage) {
      try {
        const data = await electron.storage.get("broadcast-session");
        if (data) {
          return data as SyncStateDump;
        }
      } catch (err: any) {
        AppLogger.log("StateSynchronizer", "error", `Restore failed: ${err.message}`);
      }
    }
    return null;
  }
}

export const AppStateSync = new StateSynchronizer();
