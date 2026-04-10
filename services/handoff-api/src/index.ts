import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { generateToken } from "./tokenGen";
import { requireAuth } from "./firebaseAuth";
import { EgressClient, StreamOutput, StreamProtocol } from "livekit-server-sdk";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Initialize the Egress Client
const egressClient = new EgressClient(
  process.env.LIVEKIT_API_URL!,
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!,
);

app.post("/join", requireAuth, async (req, res) => {
  try {
    const { participantName } = req.body;

    if (!participantName) {
      return res.status(400).json({ error: "participantName is required" });
    }

    // Enforce room name matching the Firebase UID for total security
    const userId = req.user!.uid;
    const enforcedRoomName = `stream_${userId}`;

    const token = await generateToken(enforcedRoomName, participantName);

    res.json({ token, roomName: enforcedRoomName });
  } catch (error) {
    console.error("Error generating token:", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

// NEW: Endpoint to start the unbreakable RTMP stream
app.post("/start-broadcast", requireAuth, async (req, res) => {
  try {
    const { rtmpUrl } = req.body; // e.g., rtmp://a.rtmp.youtube.com/live2/YOUR_STREAM_KEY

    if (!rtmpUrl) {
      return res.status(400).json({ error: "rtmpUrl is required" });
    }

    const userId = req.user!.uid;
    const roomName = `stream_${userId}`;

    // Define the output destination (YouTube, Twitch, etc.)
    const streamOutput = new StreamOutput({
      protocol: StreamProtocol.RTMP,
      urls: [rtmpUrl],
    });

    // Start a RoomCompositeEgress. LiveKit will join the room as a hidden participant,
    // composite the video (1920x1080 by default), and stream it out.
    const info = await egressClient.startRoomCompositeEgress(roomName, {
      stream: streamOutput,
      layout: "grid", // LiveKit will automatically center the active speaker/device
    });

    res.json({ success: true, egressId: info.egressId });
  } catch (error) {
    console.error("Failed to start Egress:", error);
    res.status(500).json({ error: "Failed to start broadcast" });
  }
});

// NEW: Endpoint to stop the broadcast when the user is completely done streaming
app.post("/stop-broadcast", requireAuth, async (req, res) => {
  try {
    const { egressId } = req.body;
    if (!egressId)
      return res.status(400).json({ error: "egressId is required" });

    await egressClient.stopEgress(egressId);
    res.json({ success: true });
  } catch (error) {
    console.error("Failed to stop Egress:", error);
    res.status(500).json({ error: "Failed to stop broadcast" });
  }
});

app.listen(PORT, () => {
  console.log(
    `📡 Secure Handoff API with Egress running on http://localhost:${PORT}`,
  );
});
