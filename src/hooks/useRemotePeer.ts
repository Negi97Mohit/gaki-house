import { useState, useEffect, useRef, useCallback } from "react";
import Peer, { MediaConnection } from "peerjs";
import { toast } from "sonner";

export const useRemotePeer = () => {
    const [peerId, setPeerId] = useState<string | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const peerRef = useRef<Peer | null>(null);
    const connectionRef = useRef<MediaConnection | null>(null);

    const initializePeer = useCallback(() => {
        if (peerRef.current) return;

        // Get or create persistent device ID
        let deviceId = localStorage.getItem("caption-cam-device-id");
        if (!deviceId) {
            // Import dynamically if needed or just use random string if uuid not available in scope
            // But we can add uuid import at top. Let's do that in a separate edit or use a simple randomizer here for now to avoid breaking imports in this chunk.
            // Wait, I can't easily add import at top with ReplaceFileContent if I am targeting this block. 
            // I will use crypto.randomUUID() which is available in modern browsers.
            deviceId = crypto.randomUUID(); 
            localStorage.setItem("caption-cam-device-id", deviceId);
        }

        const peer = new Peer(deviceId);

        peer.on("open", (id) => {
            console.log("My peer ID is: " + id);
            setPeerId(id);
        });

        peer.on("call", (call) => {
            console.log("Received call");
            call.answer(); // Answer the call without sending a stream back (one-way)

            call.on("stream", (stream) => {
                console.log("Received remote stream");
                setRemoteStream(stream);
                setIsConnected(true);
                toast.success("Remote camera connected!");
            });

            call.on("close", () => {
                console.log("Call closed");
                setRemoteStream(null);
                setIsConnected(false);
                toast.info("Remote camera disconnected");
            });

            call.on("error", (err) => {
                console.error("Call error:", err);
                toast.error("Remote connection error");
            });

            connectionRef.current = call;
        });

        peer.on("error", (err) => {
            console.error("Peer error:", err);
            // toast.error(`PeerJS error: ${err.type}`);
        });

        peerRef.current = peer;
    }, []);

    const disconnect = useCallback(() => {
        if (connectionRef.current) {
            connectionRef.current.close();
            connectionRef.current = null;
        }
        if (peerRef.current) {
            peerRef.current.destroy();
            peerRef.current = null;
        }
        setPeerId(null);
        setRemoteStream(null);
        setIsConnected(false);
    }, []);

    useEffect(() => {
        initializePeer();
        return () => {
            disconnect();
        };
    }, [initializePeer, disconnect]);

    return {
        peerId,
        remoteStream,
        isConnected,
        disconnect, // Expose if needed to force reset
    };
};
