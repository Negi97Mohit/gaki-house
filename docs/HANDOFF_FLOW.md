# Stream Handoff Flow

The "Handoff" feature allows a user to start a stream on one platform (e.g., Web) and seamlessly transfer the broadcast to another (e.g., Desktop) without dropping the connection to the destination platform (like YouTube or Twitch).

## The Lifecycle

1. **Discovery**: Both instances utilize the `handoff-sdk` to register themselves with `apps/api-handoff` using Firebase Auth tokens.
2. **Initiation**: User clicks "Transfer Stream" on Device A.
3. **State Sync**: Device A packages the current `SceneStore` (active scene, camera inputs, overlays) and sends it to Device B via WebRTC (facilitated by `apps/api-signaling`).
4. **Pre-warming**: Device B silently loads the exact scene composition in the background.
5. **The Handshake**:
   - Device B confirms it is rendering identical frames.
   - The signaling server cuts the outgoing RTMP/WebRTC feed from Device A and splices in the feed from Device B.
6. **Completion**: Device A gracefully downgrades to a "Viewer" or closes, while Device B assumes the "Broadcaster" role.
