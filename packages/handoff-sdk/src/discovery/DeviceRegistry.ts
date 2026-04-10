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

export class DeviceRegistry {
  private db: Firestore;
  private userId: string;
  private unsubscribe: (() => void) | null = null;

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

    // 2. Listen to all devices active under this user's account
    const devicesCollection = collection(
      this.db,
      `users/${this.userId}/active_devices`,
    );

    this.unsubscribe = onSnapshot(
      devicesCollection,
      (snapshot) => {
        const devices: HandoffDevice[] = [];

        snapshot.forEach((doc) => {
          const data = doc.data() as HandoffDevice;

          // Optional: Filter out stale devices (e.g., if the app crashed and didn't delete its doc)
          // For now, we trust the disconnect() method.
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
