import React, { useState, useRef, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const SERVER_URL = 'http://localhost:3000'; // Local backend URL

export const StreamControls = () => {
    const [rtmpUrl, setRtmpUrl] = useState('');
    const [streamKey, setStreamKey] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [status, setStatus] = useState<string>('Idle');

    const socketRef = useRef<Socket | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        return () => {
            // Cleanup on unmount
            stopStreaming();
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    const startStreaming = async () => {
        if (!rtmpUrl || !streamKey) {
            toast.error('Please enter both RTMP URL and Stream Key');
            return;
        }

        try {
            setIsConnecting(true);
            setStatus('Initializing...');

            // 1. Connect to Socket Server
            socketRef.current = io(SERVER_URL);

            socketRef.current.on('connect', () => {
                console.log('Connected to local streaming server');
                setStatus('Connected to Server');
            });

            socketRef.current.on('stream-status', (msg: string) => {
                console.log('Stream Status:', msg);
                setStatus(`Stream: ${msg}`);
                if (msg === 'started') {
                    setIsStreaming(true);
                    setIsConnecting(false);
                    toast.success('Streaming started!');
                } else if (msg.startsWith('error')) {
                    setIsStreaming(false);
                    setIsConnecting(false);
                    toast.error(`Streaming Error: ${msg}`);
                    stopStreaming();
                } else if (msg === 'stopped') {
                    setIsStreaming(false);
                    setIsConnecting(false);
                    setStatus('Stopped');
                }
            });

            // 2. Capture Screen & Mic
            // @ts-ignore
            const displayStream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    width: 1920,
                    height: 1080,
                    frameRate: 30,
                    displaySurface: "browser", // Hint to prefer browser tab
                },
                audio: true, // System audio
                preferCurrentTab: true, // Hint to default to "This Tab"
                selfBrowserSurface: "include"
            });

            const userStream = await navigator.mediaDevices.getUserMedia({
                audio: true, // Microphone
                video: false
            });

            // 3. Combine Audio Tracks (System + Mic)
            const audioContext = new AudioContext();
            const dest = audioContext.createMediaStreamDestination();

            if (displayStream.getAudioTracks().length > 0) {
                const sysSource = audioContext.createMediaStreamSource(displayStream);
                sysSource.connect(dest);
            }

            if (userStream.getAudioTracks().length > 0) {
                const micSource = audioContext.createMediaStreamSource(userStream);
                micSource.connect(dest);
            }

            const combinedStream = new MediaStream([
                ...displayStream.getVideoTracks(),
                ...dest.stream.getAudioTracks()
            ]);

            streamRef.current = combinedStream;

            // Handle stream stop from browser UI (e.g. "Stop Sharing" button)
            displayStream.getVideoTracks()[0].onended = () => {
                stopStreaming();
            };

            // 4. Setup MediaRecorder
            // Use WebM format which FFMPEG can ingest from pipe
            const mimeType = 'video/webm; codecs="h264, opus"';
            // Fallback checking
            const options = MediaRecorder.isTypeSupported(mimeType)
                ? { mimeType }
                : { mimeType: 'video/webm' };

            const mediaRecorder = new MediaRecorder(combinedStream, options);
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0 && socketRef.current && socketRef.current.connected) {
                    socketRef.current.emit('binary-stream', event.data);
                }
            };

            mediaRecorder.start(250); // Send chunks every 250ms for low latency

            // 5. Signal Server to Start FFMPEG
            socketRef.current.emit('start-stream', { rtmpUrl, key: streamKey });

        } catch (err: any) {
            console.error('Error starting stream:', err);
            toast.error(`Failed to start: ${err.message}`);
            setIsConnecting(false);
            setStatus('Error');
        }
    };

    const stopStreaming = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (socketRef.current) {
            socketRef.current.emit('stop-stream');
            socketRef.current.disconnect();
            socketRef.current = null;
        }
        setIsStreaming(false);
        setIsConnecting(false);
        setStatus('Stopped');
    };

    return (
        <Card className="fixed bottom-4 right-4 w-80 z-50 shadow-xl border-border/40 backdrop-blur-sm bg-background/95">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                    Live Stream
                    <span className={`h-2 w-2 rounded-full ${isStreaming ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {!isStreaming && (
                    <>
                        <div className="space-y-2">
                            <label className="text-xs text-muted-foreground">RTMP URL</label>
                            <Input
                                placeholder="rtmp://..."
                                value={rtmpUrl}
                                onChange={(e) => setRtmpUrl(e.target.value)}
                                className="h-8 text-xs"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-muted-foreground">Stream Key</label>
                            <Input
                                type="password"
                                placeholder="Key..."
                                value={streamKey}
                                onChange={(e) => setStreamKey(e.target.value)}
                                className="h-8 text-xs"
                            />
                        </div>
                    </>
                )}

                <div className="flex items-center justify-between pt-2">
                    <span className="text-xs font-mono text-muted-foreground truncate max-w-[120px]">
                        {status}
                    </span>
                    {isStreaming ? (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={stopStreaming}
                            className="h-8 px-4"
                        >
                            Stop Stream
                        </Button>
                    ) : (
                        <Button
                            variant="default"
                            size="sm"
                            onClick={startStreaming}
                            disabled={isConnecting}
                            className="h-8 px-4"
                        >
                            {isConnecting && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                            Go Live
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
