import { Room, RoomEvent } from "livekit-client";
import { handoffStore } from "../syncStore";

export class StreamManager {
  public room: Room;
  private currentDeviceId: string;
  private apiUrl: string;
  private getAuthToken: () => Promise<string>;

  constructor(
    currentDeviceId: string,
    apiUrl: string,
    getAuthToken: () => Promise<string>,
  ) {
    this.currentDeviceId = currentDeviceId;
    this.apiUrl = apiUrl;
    this.getAuthToken = getAuthToken; // Function to get Firebase JWT
    this.room = new Room({
      adaptiveStream: true,
      dynacast: true,
    });

    this.room.on(RoomEvent.ConnectionStateChanged, (state) => {
      handoffStore.getState().setConnectionState(state);
    });
  }

  public async claimStream() {
    try {
      const firebaseToken = await this.getAuthToken();

      // Request secure LiveKit token from your Phase 2 API
      const response = await fetch(`${this.apiUrl}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${firebaseToken}`,
        },
        body: JSON.stringify({ participantName: this.currentDeviceId }),
      });

      const { token } = await response.json();
      if (!token) throw new Error("Failed to get LiveKit token");

      // Connect to LiveKit (URL should be your LiveKit server, e.g., wss://your-project.livekit.cloud)
      // For development, assuming standard localhost or process.env configuration
      const livekitUrl = process.env.VITE_LIVEKIT_URL || "ws://localhost:7880";
      await this.room.connect(livekitUrl, token);

      handoffStore.getState().setActiveDevice(this.currentDeviceId);
      handoffStore.getState().setRelinquishing(false);

      return true;
    } catch (error) {
      console.error("Failed to claim stream:", error);
      return false;
    }
  }

  // Add this method inside your StreamManager class

  public async startExternalBroadcast(rtmpUrl: string) {
    try {
      const firebaseToken = await this.getAuthToken();

      const response = await fetch(`${this.apiUrl}/start-broadcast`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${firebaseToken}`,
        },
        body: JSON.stringify({ rtmpUrl }),
      });

      const data = await response.json();
      if (!data.success) throw new Error("Server failed to start egress");

      // Store this egressId in your Zustand store so you can stop it later
      return data.egressId;
    } catch (error) {
      console.error("Failed to start external broadcast:", error);
      return null;
    }
  }

  public async relinquishStream() {
    handoffStore.getState().setRelinquishing(true);

    // Mute tracks to prevent clash before disconnecting
    const publications = this.room.localParticipant.trackPublications.values();
    for (const pub of publications) {
      if (pub.track) {
        await pub.track.mute();
      }
    }

    // Wait slightly to ensure the other device's stream is picked up by Egress
    setTimeout(() => {
      this.room.disconnect();
      handoffStore.getState().setRelinquishing(false);

      // If we are relinquishing, another device is taking over.
      const active = handoffStore.getState().activeDevice;
      if (active === this.currentDeviceId) {
        handoffStore.getState().setActiveDevice("");
      }
    }, 2500);
  }
}
