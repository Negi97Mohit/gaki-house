import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useOmegleStore } from '@/stores/omegle.store';
import { SignalingClient } from '../services/SignalingClient';
import { WebRTCConnection } from '../services/WebRTCConnection';
import { getOmegleDesign } from '@/data/omegleDesigns';
import { getOmegleTheme, getOmegleThemeStyles } from '@/data/omegleThemes';
import { OmegleVideoLayout } from './OmegleVideoLayout';
import { OmegleChatBox } from './OmegleChatBox';
import { OmegleControls } from './OmegleControls';
import { toast } from 'sonner';

export const OmegleMode: React.FC = () => {
    const {
        selectedDesign,
        selectedOmegleTheme,
        connection,
        setConnection,
        setMatchStatus,
        setRemoteStream,
        setLocalStream,
        addMessage,
        resetConnection,
        setError,
    } = useOmegleStore();

    const signalingRef = useRef<SignalingClient | null>(null);
    const webrtcRef = useRef<WebRTCConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null); // Store stream in ref
    const [isInitializing, setIsInitializing] = useState(true);

    const design = getOmegleDesign(selectedDesign);
    const theme = getOmegleTheme(selectedOmegleTheme);
    const themeStyles = getOmegleThemeStyles(theme);

    // Initialize signaling client and get local media on mount
    useEffect(() => {
        const initialize = async () => {
            try {
                console.log('[OmegleMode] Initializing...');

                // Initialize signaling client
                const signaling = new SignalingClient();
                signalingRef.current = signaling;

                await signaling.connect();
                console.log('[OmegleMode] Connected to signaling server');

                // Try to get local media stream (optional - user can use text-only)
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        video: true,
                        audio: true,
                    });

                    console.log('[OmegleMode] Got local media stream');
                    localStreamRef.current = stream;
                    setLocalStream(stream);
                } catch (mediaError) {
                    console.warn('[OmegleMode] Camera/mic access denied or unavailable - proceeding with text-only mode');
                    toast.info('Camera/mic unavailable. You can still chat via text!');
                    // Continue without media - text chat still works
                }

                // Setup signaling event listeners with the stream (may be null)
                setupSignalingListeners(signaling, localStreamRef.current);

                setIsInitializing(false);
                toast.success('Connected! Click "Find Stranger" to start.');
            } catch (error) {
                console.error('[OmegleMode] Failed to initialize:', error);
                const message = error instanceof Error ? error.message : 'Failed to initialize';
                setError(message);
                toast.error('Failed to connect to server: ' + message);
                setIsInitializing(false);
            }
        };

        initialize();

        // Cleanup on unmount
        return () => {
            cleanup();
        };
    }, []);

    const setupSignalingListeners = (signaling: SignalingClient, localStream: MediaStream | null) => {
        signaling.onMatchStatus((status) => {
            setMatchStatus(status as any);

            if (status === 'searching') {
                toast.loading('Searching for stranger...');
            }
        });

        signaling.onMatchFound(async ({ roomId, partnerId, isInitiator }) => {
            console.log('[OmegleMode] Match found!', { roomId, partnerId, isInitiator });
            toast.dismiss();
            toast.success('Stranger found! Connecting...');

            setConnection({ roomId, partnerId, isInitiator });
            setMatchStatus('connected');

            // Initialize WebRTC connection with local stream
            await setupWebRTC(isInitiator, roomId, signaling, localStream);
        });

        signaling.onWebRTCOffer(async ({ offer }) => {
            console.log('[OmegleMode] Received WebRTC offer');

            if (webrtcRef.current) {
                try {
                    console.log('[OmegleMode] Creating answer for received offer...');
                    const answer = await webrtcRef.current.createAnswer(offer);
                    console.log('[OmegleMode] Answer created, sending to peer');
                    // Use the roomId from the current connection state
                    const roomId = useOmegleStore.getState().connection.roomId;
                    if (roomId) {
                        signaling.sendWebRTCAnswer(answer, roomId);
                    } else {
                        console.error('[OmegleMode] No roomId available to send answer!');
                    }
                } catch (error) {
                    console.error('[OmegleMode] Failed to create/send answer:', error);
                }
            } else {
                console.error('[OmegleMode] No WebRTC connection available!');
            }
        });

        signaling.onWebRTCAnswer(async ({ answer }) => {
            console.log('[OmegleMode] Received WebRTC answer');

            if (webrtcRef.current) {
                await webrtcRef.current.setRemoteAnswer(answer);
            }
        });

        signaling.onICECandidate(async ({ candidate }) => {
            if (webrtcRef.current) {
                await webrtcRef.current.addICECandidate(candidate);
            }
        });

        signaling.onMessage(({ message, senderId, timestamp }) => {
            addMessage({
                id: Date.now().toString(),
                text: message,
                senderId,
                timestamp,
                isLocal: false,
            });
        });

        signaling.onPartnerDisconnected(({ reason }) => {
            console.log('[OmegleMode] Partner disconnected:', reason);

            // If partner clicked "Next", automatically search for new partner
            if (reason === 'next-clicked') {
                toast.info('Stranger disconnected, finding new partner...');
                handleDisconnect();
                setMatchStatus('searching');
                signaling.requestMatch();
            } else {
                toast.info('Stranger disconnected');
                handleDisconnect();
            }
        });

        signaling.onError((error) => {
            console.error('[OmegleMode] Signaling error:', error);
            setError(error);
            toast.error('Connection error: ' + error);
        });
    };

    const setupWebRTC = async (
        isInitiator: boolean,
        roomId: string,
        signaling: SignalingClient,
        localStream: MediaStream | null
    ) => {
        try {
            console.log('[OmegleMode] Setting up WebRTC', { hasLocalStream: !!localStream });
            const webrtc = new WebRTCConnection();
            webrtcRef.current = webrtc;

            // Initialize connection with or without local stream
            // If no local stream, we can still receive remote video
            await webrtc.initializeConnection(localStream);

            // Setup WebRTC event listeners
            webrtc.onRemoteStream((stream) => {
                console.log('[OmegleMode] 🎥 Received remote stream with', stream.getTracks().length, 'tracks');
                stream.getTracks().forEach(track => {
                    console.log(`[OmegleMode] Track: ${track.kind}, enabled: ${track.enabled}, state: ${track.readyState}`);
                });
                setRemoteStream(stream);
                toast.success('Connected to stranger!');
            });

            webrtc.onICECandidate((candidate) => {
                signaling.sendICECandidate(candidate, roomId);
            });

            webrtc.onConnectionStateChange((state) => {
                console.log('[OmegleMode] WebRTC state:', state);

                if (state === 'failed' || state === 'closed') {
                    toast.error('Connection lost');
                    handleDisconnect();
                }
            });

            webrtc.onError((error) => {
                console.error('[OmegleMode] WebRTC error:', error);
                toast.error('Connection error');
            });

            // If initiator, create and send offer
            if (isInitiator) {
                const offer = await webrtc.createOffer();
                signaling.sendWebRTCOffer(offer, roomId);
            }
        } catch (error) {
            console.error('[OmegleMode] Failed to setup WebRTC:', error);
            toast.error('Failed to connect');
        }
    };

    const handleDisconnect = useCallback(() => {
        if (webrtcRef.current) {
            webrtcRef.current.close();
            webrtcRef.current = null;
        }

        resetConnection();
        setMatchStatus('idle');
    }, [resetConnection, setMatchStatus]);

    const cleanup = () => {
        console.log('[OmegleMode] Cleaning up...');

        if (webrtcRef.current) {
            webrtcRef.current.close();
        }

        if (signalingRef.current) {
            signalingRef.current.disconnect();
        }

        // Stop all local media tracks using ref
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }
    };

    const handleFindStranger = () => {
        if (signalingRef.current) {
            signalingRef.current.requestMatch();
        }
    };

    const handleNextStranger = () => {
        handleDisconnect();
        setMatchStatus('searching');

        if (signalingRef.current) {
            signalingRef.current.nextStranger();
            signalingRef.current.requestMatch();
        }
    };

    const handleStop = () => {
        handleDisconnect();
        useOmegleStore.getState().exitOmegleMode();
    };

    const handleSendMessage = (message: string) => {
        if (signalingRef.current && connection.roomId) {
            signalingRef.current.sendMessage(message, connection.roomId);

            // Add to local chat
            addMessage({
                id: Date.now().toString(),
                text: message,
                senderId: 'me',
                timestamp: Date.now(),
                isLocal: true,
            });
        }
    };

    if (isInitializing) {
        return (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-white">Initializing Omegle mode...</p>
                </div>
            </div>
        );
    }

    if (!design) {
        return (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
                <p className="text-white">Design not found</p>
            </div>
        );
    }

    return (
        <div
            className="fixed inset-0 z-50 transition-colors duration-500"
            style={{
                ...themeStyles,
                backgroundColor: theme.colors.background,
            }}
        >
            <OmegleVideoLayout design={design} />
            <OmegleChatBox design={design} onSendMessage={handleSendMessage} />
            <OmegleControls
                design={design}
                onFindStranger={handleFindStranger}
                onNext={handleNextStranger}
                onStop={handleStop}
            />
        </div>
    );
};
