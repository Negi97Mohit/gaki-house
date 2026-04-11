import { io, Socket } from 'socket.io-client';

export class SignalingClient {
    private socket: Socket | null = null;
    private serverUrl: string;
    private isConnected = false;

    // Event callbacks
    private onMatchFoundCallback?: (data: { roomId: string; partnerId: string; isInitiator: boolean }) => void;
    private onMatchStatusCallback?: (status: string) => void;
    private onWebRTCOfferCallback?: (data: { offer: RTCSessionDescriptionInit; senderId: string }) => void;
    private onWebRTCAnswerCallback?: (data: { answer: RTCSessionDescriptionInit; senderId: string }) => void;
    private onICECandidateCallback?: (data: { candidate: RTCIceCandidateInit; senderId: string }) => void;
    private onMessageCallback?: (data: { message: string; senderId: string; timestamp: number }) => void;
    private onMediaStateChangedCallback?: (state: { video: boolean; audio: boolean }) => void;
    private onPartnerDisconnectedCallback?: (data: { reason: string }) => void;
    private onErrorCallback?: (error: string) => void;

    constructor(serverUrl?: string) {
        // Use provided URL, or environment variable, or default to localhost
        this.serverUrl = serverUrl ||
            import.meta.env.VITE_SIGNALING_URL ||
            'http://localhost:3001';
        console.log('[SignalingClient] Connecting to:', this.serverUrl);
    }

    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.isConnected) {
                resolve();
                return;
            }

            this.socket = io(this.serverUrl, {
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: 10, // More attempts for free tier wake-up
                reconnectionDelay: 2000, // Wait longer between attempts
                timeout: 60000, // 60 second timeout for free tier server wake-up
            });

            this.socket.on('connect', () => {
                console.log('[SignalingClient] Connected to signaling server');
                this.isConnected = true;
                this.setupEventListeners();
                resolve();
            });

            this.socket.on('connect_error', (error) => {
                console.error('[SignalingClient] Connection error:', error);
                reject(error);
            });

            this.socket.on('disconnect', () => {
                console.log('[SignalingClient] Disconnected from signaling server');
                this.isConnected = false;
            });
        });
    }

    private setupEventListeners() {
        if (!this.socket) return;

        this.socket.on('match-found', (data) => {
            console.log('[SignalingClient] Match found:', data);
            this.onMatchFoundCallback?.(data);
        });

        this.socket.on('match-status', (data) => {
            console.log('[SignalingClient] Match status:', data.status);
            this.onMatchStatusCallback?.(data.status);
        });

        this.socket.on('webrtc-offer', (data) => {
            console.log('[SignalingClient] Received WebRTC offer');
            this.onWebRTCOfferCallback?.(data);
        });

        this.socket.on('webrtc-answer', (data) => {
            console.log('[SignalingClient] Received WebRTC answer');
            this.onWebRTCAnswerCallback?.(data);
        });

        this.socket.on('ice-candidate', (data) => {
            this.onICECandidateCallback?.(data);
        });

        this.socket.on('receive-message', (data) => {
            console.log('[SignalingClient] Received message');
            this.onMessageCallback?.(data);
        });

        this.socket.on('media-state-changed', (data) => {
            console.log('[SignalingClient] Partner media state changed:', data.state);
            this.onMediaStateChangedCallback?.(data.state);
        });

        this.socket.on('partner-disconnected', (data) => {
            console.log('[SignalingClient] Partner disconnected:', data.reason);
            this.onPartnerDisconnectedCallback?.(data);
        });

        this.socket.on('error', (data) => {
            console.error('[SignalingClient] Error:', data.message);
            this.onErrorCallback?.(data.message);
        });
    }

    requestMatch() {
        console.log('[SignalingClient] Requesting match...');
        this.socket?.emit('request-match');
    }

    cancelMatch() {
        console.log('[SignalingClient] Cancelling match request');
        this.socket?.emit('cancel-match');
    }

    sendWebRTCOffer(offer: RTCSessionDescriptionInit, roomId: string) {
        console.log('[SignalingClient] Sending WebRTC offer');
        this.socket?.emit('webrtc-offer', { offer, roomId });
    }

    sendWebRTCAnswer(answer: RTCSessionDescriptionInit, roomId: string) {
        console.log('[SignalingClient] Sending WebRTC answer');
        this.socket?.emit('webrtc-answer', { answer, roomId });
    }

    sendICECandidate(candidate: RTCIceCandidateInit, roomId: string) {
        this.socket?.emit('ice-candidate', { candidate, roomId });
    }

    sendMessage(message: string, roomId: string) {
        this.socket?.emit('send-message', { message, roomId });
    }

    nextStranger() {
        console.log('[SignalingClient] Requesting next stranger');
        this.socket?.emit('next-stranger');
    }

    leaveRoom() {
        console.log('[SignalingClient] Leaving room');
        this.socket?.emit('leave-room');
    }

    disconnect() {
        if (this.socket) {
            console.log('[SignalingClient] Disconnecting...');
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
        }
    }

    // Event listener setters
    onMatchFound(callback: (data: { roomId: string; partnerId: string; isInitiator: boolean }) => void) {
        this.onMatchFoundCallback = callback;
    }

    onMatchStatus(callback: (status: string) => void) {
        this.onMatchStatusCallback = callback;
    }

    onWebRTCOffer(callback: (data: { offer: RTCSessionDescriptionInit; senderId: string }) => void) {
        this.onWebRTCOfferCallback = callback;
    }

    onWebRTCAnswer(callback: (data: { answer: RTCSessionDescriptionInit; senderId: string }) => void) {
        this.onWebRTCAnswerCallback = callback;
    }

    onICECandidate(callback: (data: { candidate: RTCIceCandidateInit; senderId: string }) => void) {
        this.onICECandidateCallback = callback;
    }

    onMessage(callback: (data: { message: string; senderId: string; timestamp: number }) => void) {
        this.onMessageCallback = callback;
    }

    onPartnerDisconnected(callback: (data: { reason: string }) => void) {
        this.onPartnerDisconnectedCallback = callback;
    }

    onMediaStateChanged(callback: (state: { video: boolean; audio: boolean }) => void) {
        this.onMediaStateChangedCallback = callback;
    }

    sendMediaState(state: { video: boolean; audio: boolean }, roomId: string) {
        this.socket?.emit('media-state-changed', { state, roomId });
    }

    onError(callback: (error: string) => void) {
        this.onErrorCallback = callback;
    }

    getConnectionStatus(): boolean {
        return this.isConnected;
    }
}
