import { useEffect, useRef, useState } from "react";
import Peer from "peerjs";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Mic, MicOff, Video, VideoOff, RefreshCw } from "lucide-react";

const RemoteCamera = () => {
    const [searchParams] = useSearchParams();
    const targetId = searchParams.get("target");
    const [status, setStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");
    const [stream, setStream] = useState<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const peerRef = useRef<Peer | null>(null);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");

    // 1. Manage Media Stream
    useEffect(() => {
        let activeStream: MediaStream | null = null;
        let isActive = true;

        const initMedia = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: facingMode },
                    audio: true,
                });

                if (!isActive) {
                    mediaStream.getTracks().forEach(t => t.stop());
                    return;
                }

                activeStream = mediaStream;
                setStream(mediaStream);

                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            } catch (err) {
                console.error("Media init error:", err);
                if (isActive) {
                    setStatus("error");
                    setErrorMsg("Could not access camera/microphone.");
                }
            }
        };

        initMedia();

        return () => {
            isActive = false;
            if (activeStream) {
                activeStream.getTracks().forEach(t => t.stop());
            }
            setStream(null); // Clear stream so connection effect disconnects/pauses
        };
    }, [facingMode]);

    // 2. Manage Peer Connection
    useEffect(() => {
        // Persist targetId logic
        let currentTargetId = targetId;
        if (currentTargetId) {
            localStorage.setItem("caption-cam-target-id", currentTargetId);
        } else {
            currentTargetId = localStorage.getItem("caption-cam-target-id");
        }

        if (!currentTargetId) {
            setStatus("error");
            setErrorMsg("No target device specified. Scan the QR code again.");
            return;
        }

        if (!stream) {
            // Waiting for stream...
            return;
        }

        let retryTimeout: NodeJS.Timeout;
        let isActive = true;
        let peerInstance: Peer | null = null;
        let callInstance: any = null;

        const connectToPeer = () => {
            if (!isActive || !stream) return;

            setStatus("connecting");

            const peer = new Peer();
            peerInstance = peer;
            peerRef.current = peer;

            peer.on("open", (id) => {
                if (!isActive) return;
                console.log(`My Peer ID: ${id}. Connecting to: ${currentTargetId}`);

                const call = peer.call(currentTargetId!, stream);
                callInstance = call;

                call.on("close", () => {
                    console.log("Call closed");
                    if (isActive) {
                        setStatus("connecting");
                        setErrorMsg("Connection lost. Reconnecting...");
                        retryTimeout = setTimeout(connectToPeer, 2000);
                    }
                });

                call.on("error", (err) => {
                    console.error("Call error:", err);
                    if (isActive) {
                        retryTimeout = setTimeout(connectToPeer, 3000);
                    }
                });

                setStatus("connected");
                setErrorMsg("");
            });

            peer.on("error", (err) => {
                console.error("Peer error:", err);
                if (isActive) {
                    retryTimeout = setTimeout(connectToPeer, 3000);
                }
            });
        };

        connectToPeer();

        return () => {
            isActive = false;
            clearTimeout(retryTimeout);
            if (callInstance) callInstance.close();
            if (peerInstance) peerInstance.destroy();
        };
    }, [stream, targetId]);

    const toggleAudio = () => {
        if (stream) {
            const audioTrack = stream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsAudioEnabled(audioTrack.enabled);
            }
        }
    };

    const toggleVideo = () => {
        if (stream) {
            const videoTrack = stream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoEnabled(videoTrack.enabled);
            }
        }
    };

    const switchCamera = () => {
        setFacingMode(prev => prev === "user" ? "environment" : "user");
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
            <Card className="w-full max-w-md bg-neutral-900 border-neutral-800 text-white">
                <CardHeader>
                    <CardTitle className="text-center flex items-center justify-center gap-2">
                        <Camera className="w-6 h-6" />
                        Remote Camera
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                    <div className="relative w-full aspect-video bg-neutral-800 rounded-lg overflow-hidden">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                        />
                        {status === "connected" && (
                            <div className="absolute top-2 right-2 px-2 py-1 bg-green-500/80 rounded text-xs font-bold">
                                LIVE
                            </div>
                        )}
                    </div>

                    <div className="text-center">
                        <p className={`font-medium ${status === "connected" ? "text-green-400" : status === "error" ? "text-red-400" : "text-yellow-400"}`}>
                            Status: {status.toUpperCase()}
                        </p>
                        {errorMsg && <p className="text-sm text-red-400 mt-1">{errorMsg}</p>}
                    </div>

                    <div className="flex gap-4 mt-2">
                        <Button
                            variant={isAudioEnabled ? "default" : "destructive"}
                            size="icon"
                            onClick={toggleAudio}
                        >
                            {isAudioEnabled ? <Mic /> : <MicOff />}
                        </Button>
                        <Button
                            variant={isVideoEnabled ? "default" : "destructive"}
                            size="icon"
                            onClick={toggleVideo}
                        >
                            {isVideoEnabled ? <Video /> : <VideoOff />}
                        </Button>
                        <Button
                            variant="secondary"
                            size="icon"
                            onClick={switchCamera}
                        >
                            <RefreshCw />
                        </Button>
                    </div>

                    <p className="text-xs text-neutral-500 mt-4 text-center">
                        Keep this tab open to stream to your desktop.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

export default RemoteCamera;
