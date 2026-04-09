import {
  Room,
  RoomEvent,
  LocalTrackPublication,
  LocalParticipant,
} from "livekit-client";
import { handoffStore } from "./syncStore";

export class LiveKitHandoffClient {
  public room: Room;
  public readonly deviceId: string;

  constructor(deviceId: string) {
    this.deviceId = deviceId;
    this.room = new Room({
      adaptiveStream: true,
      dynacast: true,
    });

    this.setupListeners();
  }

  private setupListeners() {
    this.room.on(RoomEvent.ConnectionStateChanged, (state) => {
      handoffStore.getState().setConnectionState(state);
    });

    // Listen for messages from other devices in the same room
    this.room.on(RoomEvent.DataReceived, (payload, participant) => {
      try {
        const msg = JSON.parse(new TextDecoder().decode(payload));
        if (msg.type === "HANDOFF_INIT" && msg.newDeviceId !== this.deviceId) {
          console.log(
            `📡 Handoff signal received from ${msg.newDeviceId}. Stepping down...`,
          );
          this.relinquishStream();
        }
      } catch (e) {
        console.error("Failed to parse room data message", e);
      }
    });
  }

  public async claimStream(url: string, token: string) {
    try {
      // 1. Connect to the LiveKit Room
      await this.room.connect(url, token);

      // 2. Broadcast that this device is taking over
      const encoder = new TextEncoder();
      const payload = encoder.encode(
        JSON.stringify({
          type: "HANDOFF_INIT",
          newDeviceId: this.deviceId,
        }),
      );

      await this.room.localParticipant.publishData(payload, { reliable: true });

      // 3. Update local state
      handoffStore.getState().setActiveDevice(this.deviceId);
      handoffStore.getState().setRelinquishing(false);

      // Note: Publishing actual camera/mic tracks will happen in Phase 4
      // using LiveKit's React hooks linked to this room instance.
      return true;
    } catch (error) {
      console.error("Failed to claim stream:", error);
      return false;
    }
  }

  private async relinquishStream() {
    handoffStore.getState().setRelinquishing(true);

    // 1. Mute all local tracks immediately to prevent audio/video clash
    const publications = this.room.localParticipant.trackPublications.values();
    for (const pub of publications) {
      if (pub.track) {
        await pub.track.mute();
      }
    }

    // 2. Wait a brief moment to ensure the new device is fully publishing
    // This creates the "seamless" illusion before we destroy this connection.
    setTimeout(() => {
      this.room.disconnect();
      handoffStore.getState().setRelinquishing(false);
      handoffStore.getState().setActiveDevice(""); // Cleared
    }, 2500);
  }
}
