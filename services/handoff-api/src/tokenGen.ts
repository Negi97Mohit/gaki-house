import { AccessToken } from "livekit-server-sdk";

export async function generateToken(roomName: string, participantName: string) {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error("LiveKit credentials are not set in .env");
  }

  const at = new AccessToken(apiKey, apiSecret, {
    identity: participantName,
  });

  // Grant permissions to join the specific room and publish/subscribe to tracks
  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
  });

  return await at.toJwt();
}
