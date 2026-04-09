import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { generateToken } from "./tokenGen";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

app.post("/join", async (req, res) => {
  try {
    // In a real app, you would extract the user ID from a verified Supabase JWT here
    const { roomName, participantName } = req.body;

    if (!roomName || !participantName) {
      return res
        .status(400)
        .json({ error: "roomName and participantName are required" });
    }

    const token = await generateToken(roomName, participantName);
    res.json({ token });
  } catch (error) {
    console.error("Error generating token:", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

app.listen(PORT, () => {
  console.log(`📡 Handoff API running on http://localhost:${PORT}`);
});
