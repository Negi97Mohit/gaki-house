import { useState, useRef, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

const SERVER_URL = 'http://localhost:3000';

export const useRtmpStream = () => {
    const [rtmpUrl, setRtmpUrl] = useState('');
    const [streamKey, setStreamKey] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [status, setStatus] = useState<string>('Idle');
    const [countdown, setCountdown] = useState<number | null>(null);

    const socketRef = useRef<Socket | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const originalDisplayStreamRef = useRef<MediaStream | null>(null);
    const originalUserStreamRef = useRef<MediaStream | null>(null);

    // Persistence
    useEffect(() => {
        const savedUrl = localStorage.getItem('stream_rtmpUrl');
        const savedKey = localStorage.getItem('stream_key');
        if (savedUrl) setRtmpUrl(savedUrl);
        if (savedKey) setStreamKey(savedKey);
    }, []);

    useEffect(() => {
        if (rtmpUrl) localStorage.setItem('stream_rtmpUrl', rtmpUrl);
        if (streamKey) localStorage.setItem('stream_key', streamKey);
    }, [rtmpUrl, streamKey]);

    useEffect(() => {
        return () => {
            if (isStreaming) stopStreaming();
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    const startStreaming = async (url?: string, key?: string) => {
        const targetUrl = url || rtmpUrl;
        const targetKey = key || streamKey;

        if (!targetUrl || !targetKey) {
            toast.error('Please enter both RTMP URL and Stream Key');
            return;
        }

        // Update state if passed explicitly
        setRtmpUrl(targetUrl);
        setStreamKey(targetKey);

        try {
            setIsConnecting(true);
            setStatus('Initializing...');

            // 1. Capture Screen & Mic FIRST
            // @ts-ignore
            const displayStream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    width: 1280,
                    height: 720,
                    frameRate: 24,
                    displaySurface: "browser",
                },
                audio: true,
                preferCurrentTab: true,
                selfBrowserSurface: "include"
            });
            originalDisplayStreamRef.current = displayStream;

            const userStream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false
            });
            originalUserStreamRef.current = userStream;

            // Combine tracks
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

            displayStream.getVideoTracks()[0].onended = () => {
                stopStreaming();
            };

            // 2. Connect to Socket Server & Wait for Connection
            setStatus('Connecting to server...');
            socketRef.current = io(SERVER_URL);

            await new Promise<void>((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error("Connection timed out (60s). Check if server is running."));
                }, 60000);

                if (!socketRef.current) return reject(new Error("Socket not initialized"));

                socketRef.current.on('connect', () => {
                    clearTimeout(timeout);
                    console.log('Connected to local streaming server');
                    setStatus('Connected');
                    resolve();
                });

                socketRef.current.on('connect_error', (err) => {
                    clearTimeout(timeout);
                    reject(err);
                });
            });

            // Setup other listeners
            socketRef.current.on('stream-status', (msg: string) => {
                console.log('Stream Status:', msg);
                // Don't override status if we are in countdown, unless it's a vital error
                if (!status.startsWith('Starting')) {
                    setStatus(`${msg}`);
                }

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


            // 3. Start Countdown (Now that we are connected)
            setCountdown(5);

            // Loop for countdown
            for (let i = 5; i > 0; i--) {
                setCountdown(i);
                setStatus(`Starting in ${i}s...`);
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Check cancellation
                if (!streamRef.current) {
                    console.log("Stream cancelled during countdown");
                    setCountdown(null);
                    setIsConnecting(false);
                    return;
                }
            }

            setCountdown(null); // Clear countdown

            // Double check cancellation
            if (!streamRef.current) return;


            // 4. Setup MediaRecorder & Start
            const mimeType = 'video/webm; codecs=vp9';
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

            mediaRecorder.start(1000);

            // 5. Signal Server
            socketRef.current.emit('start-stream', { rtmpUrl: targetUrl, key: targetKey });

        } catch (err: any) {
            console.error('Error starting stream:', err);
            // If user cancels screen share selection, this error triggers
            toast.error(`Failed to start: ${err.message}`);
            // Cleanup if we failed partway through
            stopStreaming();
            setIsConnecting(false);
            setCountdown(null);
            setStatus('Error');
        }
    };

    const stopStreaming = () => {
        setCountdown(null); // Cancel countdown if active

        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }

        // Stop combined stream
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        // Stop original source streams completely
        if (originalDisplayStreamRef.current) {
            originalDisplayStreamRef.current.getTracks().forEach(track => track.stop());
            originalDisplayStreamRef.current = null;
        }
        if (originalUserStreamRef.current) {
            originalUserStreamRef.current.getTracks().forEach(track => track.stop());
            originalUserStreamRef.current = null;
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

    return {
        rtmpUrl,
        setRtmpUrl,
        streamKey,
        setStreamKey,
        isStreaming,
        isConnecting,
        status,
        countdown,
        startStreaming,
        stopStreaming
    };
};
