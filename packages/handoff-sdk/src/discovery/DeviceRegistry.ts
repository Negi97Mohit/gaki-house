import {
  Firestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { handoffStore } from "../syncStore";
import { HandoffDevice, DevicePlatform } from "../types/handoff";

/** Devices inactive for longer than this are considered stale and auto-removed. */
const STALE_THRESHOLD_MS = 2 * 60 * 1000; // 2 minutes
/** How often this device writes a heartbeat to Firestore. */
const HEARTBEAT_INTERVAL_MS = 30 * 1000; // 30 seconds

export class DeviceRegistry {
  private db: Firestore;
  private userId: string;
  private unsubscribe: (() => void) | null = null;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;

  public currentDevice: HandoffDevice;

  constructor(
    firestoreDb: Firestore,
    userId: string,
    deviceId: string,
    platform: DevicePlatform,
  ) {
    this.db = firestoreDb;
    this.userId = userId;

    this.currentDevice = {
      deviceId,
      platform,
      status: "idle",
      lastActive: Date.now(),
    };

    // Attempt to clean up ghost devices when the window closes
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", () => {
        this.disconnect();
      });
    }
  }

  /**
   * Registers the device in Firestore and starts listening for other devices.
   */
  public async initialize() {
    const deviceRef = doc(
      this.db,
      `users/${this.userId}/active_devices/${this.currentDevice.deviceId}`,
    );

    // 1. Write this device's presence to Firestore
    await setDoc(deviceRef, {
      ...this.currentDevice,
      lastActive: serverTimestamp(),
    });

    // 2. Start a heartbeat so other clients know we're still alive
    this.heartbeatInterval = setInterval(() => {
      setDoc(deviceRef, { lastActive: serverTimestamp() }, { merge: true })
        .catch((err) => console.warn("Heartbeat write failed:", err));
    }, HEARTBEAT_INTERVAL_MS);

    // 3. Listen to all devices active under this user's account
    const devicesCollection = collection(
      this.db,
      `users/${this.userId}/active_devices`,
    );

    this.unsubscribe = onSnapshot(
      devicesCollection,
      (snapshot) => {
        const devices: HandoffDevice[] = [];

        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as HandoffDevice;

          // Filter out stale devices (no heartbeat within threshold)
          const lastActive =
            (data.lastActive as any)?.toMillis?.() ?? data.lastActive ?? 0;
          if (typeof lastActive === "number" && Date.now() - lastActive > STALE_THRESHOLD_MS) {
            // Auto-delete the stale doc (fire-and-forget)
            deleteDoc(docSnap.ref).catch(() => {});
            return;
          }

          devices.push(data);
        });

        // Update the global Zustand store
        handoffStore.getState().setAvailableDevices(devices);
      },
      (error) => {
        console.error("Failed to sync handoff devices:", error);
      },
    );
  }

  /**
   * Updates what this device is currently doing (e.g., streaming)
   */
  public async updateStatus(status: HandoffDevice["status"]) {
    this.currentDevice.status = status;
    const deviceRef = doc(
      this.db,
      `users/${this.userId}/active_devices/${this.currentDevice.deviceId}`,
    );

    await setDoc(
      deviceRef,
      {
        status: this.currentDevice.status,
        lastActive: serverTimestamp(),
      },
      { merge: true },
    );
  }

  /**
   * Removes this device from the active pool.
   * Call this explicitly on logout or app quit.
   */
  public async disconnect() {
    // Stop heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }

    try {
      const deviceRef = doc(
        this.db,
        `users/${this.userId}/active_devices/${this.currentDevice.deviceId}`,
      );
      await deleteDoc(deviceRef);
    } catch (error) {
      console.error(
        "Failed to remove device from registry on disconnect",
        error,
      );
    }
  }
}

