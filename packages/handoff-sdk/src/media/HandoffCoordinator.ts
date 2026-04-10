import {
  Firestore,
  doc,
  setDoc,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";
import { handoffStore } from "../syncStore";
import { HandoffSignal, SignalStatus } from "../types/handoff";
import { StreamManager } from "./StreamManager";

export class HandoffCoordinator {
  private db: Firestore;
  private userId: string;
  private currentDeviceId: string;
  private streamManager: StreamManager;
  private unsubscribe: (() => void) | null = null;

  constructor(
    db: Firestore,
    userId: string,
    currentDeviceId: string,
    streamManager: StreamManager,
  ) {
    this.db = db;
    this.userId = userId;
    this.currentDeviceId = currentDeviceId;
    this.streamManager = streamManager;
  }

  public listenForSignals() {
    const signalRef = doc(
      this.db,
      `users/${this.userId}/handoff_signals/${this.currentDeviceId}`,
    );

    this.unsubscribe = onSnapshot(signalRef, async (snapshot) => {
      if (!snapshot.exists()) return;

      const signal = snapshot.data() as HandoffSignal;

      if (signal.status === "PENDING") {
        if (signal.action === "OFFER") {
          // Device A is pushing the stream to us (Device B)
          console.log(`📡 Incoming stream push from ${signal.sourceDeviceId}`);
          await this.streamManager.claimStream();
          await this.updateSignalStatus(signal.sourceDeviceId, "ACCEPTED");
        } else if (signal.action === "TAKEOVER") {
          // Device B is pulling the stream from us (Device A)
          console.log(
            `📡 Stream takeover initiated by ${signal.sourceDeviceId}`,
          );
          await this.streamManager.relinquishStream();
          await deleteDoc(signalRef); // Clean up
        }
      } else if (signal.status === "ACCEPTED") {
        // We sent an OFFER, and the target device accepted it. Time to step down.
        console.log(`✅ Target device accepted the handoff. Relinquishing...`);
        await this.streamManager.relinquishStream();
        await deleteDoc(signalRef); // Clean up
      }
    });
  }

  private async updateSignalStatus(
    targetDeviceId: string,
    status: SignalStatus,
  ) {
    const signalRef = doc(
      this.db,
      `users/${this.userId}/handoff_signals/${targetDeviceId}`,
    );
    await setDoc(signalRef, { status }, { merge: true });
  }

  public async pushStreamTo(targetDeviceId: string) {
    const signalRef = doc(
      this.db,
      `users/${this.userId}/handoff_signals/${targetDeviceId}`,
    );
    await setDoc(signalRef, {
      sourceDeviceId: this.currentDeviceId,
      targetDeviceId,
      action: "OFFER",
      status: "PENDING",
      timestamp: serverTimestamp(),
    });
  }

  public async pullStreamFrom(sourceDeviceId: string) {
    // Tell the active device to step down
    const signalRef = doc(
      this.db,
      `users/${this.userId}/handoff_signals/${sourceDeviceId}`,
    );
    await setDoc(signalRef, {
      sourceDeviceId: this.currentDeviceId,
      targetDeviceId: sourceDeviceId,
      action: "TAKEOVER",
      status: "PENDING",
      timestamp: serverTimestamp(),
    });

    // Take over immediately
    await this.streamManager.claimStream();
  }

  public disconnect() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }
}
