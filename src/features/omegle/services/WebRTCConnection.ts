import { WebRTCConfig } from '@/types/omegle';

export class WebRTCConnection {
    private peerConnection: RTCPeerConnection | null = null;
    private localStream: MediaStream | null = null;
    private remoteStream: MediaStream | null = null;
    private config: WebRTCConfig;
    private pendingCandidates: RTCIceCandidateInit[] = []; // Queue for candidates received before remote description

    // Event callbacks
    private onRemoteStreamCallback?: (stream: MediaStream) => void;
    private onICECandidateCallback?: (candidate: RTCIceCandidateInit) => void;
    private onConnectionStateChangeCallback?: (state: RTCPeerConnectionState) => void;
    private onErrorCallback?: (error: Error) => void;

    constructor(config?: WebRTCConfig) {
        this.config = config || {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
            ],
            iceCandidatePoolSize: 10,
        };
    }

    async initializeConnection(localStream: MediaStream | null): Promise<void> {
        try {
            console.log('[WebRTC] Initializing peer connection...', { hasLocalStream: !!localStream });

            this.localStream = localStream;
            this.peerConnection = new RTCPeerConnection(this.config);

            // Add local tracks to peer connection if stream exists
            if (localStream) {
                localStream.getTracks().forEach(track => {
                    if (this.peerConnection && this.localStream) {
                        console.log(`[WebRTC] Adding ${track.kind} track to peer connection`);
                        this.peerConnection.addTrack(track, this.localStream);
                    }
                });
            } else {
                console.log('[WebRTC] No local stream - will receive-only mode');
            }

            // Handle remote stream
            this.peerConnection.ontrack = (event) => {
                console.log('[WebRTC] Received remote track:', event.track.kind);

                if (!this.remoteStream) {
                    this.remoteStream = new MediaStream();
                }

                this.remoteStream.addTrack(event.track);
                this.onRemoteStreamCallback?.(this.remoteStream);
            };

            // Handle ICE candidates
            this.peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    console.log('[WebRTC] New ICE candidate generated');
                    this.onICECandidateCallback?.(event.candidate.toJSON());
                }
            };

            // Handle connection state changes
            this.peerConnection.onconnectionstatechange = () => {
                const state = this.peerConnection?.connectionState;
                console.log('[WebRTC] Connection state changed:', state);

                if (state) {
                    this.onConnectionStateChangeCallback?.(state);

                    if (state === 'failed' || state === 'closed') {
                        console.error('[WebRTC] Connection failed or closed');
                        this.onErrorCallback?.(new Error(`Connection ${state}`));
                    }
                }
            };

            // Handle ICE connection state changes
            this.peerConnection.oniceconnectionstatechange = () => {
                console.log('[WebRTC] ICE connection state:', this.peerConnection?.iceConnectionState);
            };

            console.log('[WebRTC] Peer connection initialized successfully');
        } catch (error) {
            console.error('[WebRTC] Failed to initialize peer connection:', error);
            this.onErrorCallback?.(error as Error);
            throw error;
        }
    }

    async createOffer(): Promise<RTCSessionDescriptionInit> {
        if (!this.peerConnection) {
            throw new Error('Peer connection not initialized');
        }

        try {
            console.log('[WebRTC] Creating offer...');
            // Always set offerToReceive to true so we can receive remote media
            // even if we don't have local media to send
            const offer = await this.peerConnection.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true,
            });

            await this.peerConnection.setLocalDescription(offer);
            console.log('[WebRTC] Local description set (offer)');

            return offer;
        } catch (error) {
            console.error('[WebRTC] Failed to create offer:', error);
            throw error;
        }
    }

    async createAnswer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
        if (!this.peerConnection) {
            throw new Error('Peer connection not initialized');
        }

        try {
            console.log('[WebRTC] Setting remote description (offer)...');
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            console.log('[WebRTC] Remote description set successfully');

            // Process any queued ICE candidates now that remote description is set
            if (this.pendingCandidates.length > 0) {
                console.log(`[WebRTC] Processing ${this.pendingCandidates.length} queued ICE candidates`);
                for (const candidate of this.pendingCandidates) {
                    try {
                        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                    } catch (error) {
                        console.error('[WebRTC] Failed to add queued ICE candidate:', error);
                    }
                }
                this.pendingCandidates = [];
            }

            console.log('[WebRTC] Creating answer...');
            const answer = await this.peerConnection.createAnswer();

            await this.peerConnection.setLocalDescription(answer);
            console.log('[WebRTC] Local description set (answer)');

            return answer;
        } catch (error) {
            console.error('[WebRTC] Failed to create answer:', error);
            throw error;
        }
    }

    async setRemoteAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
        if (!this.peerConnection) {
            throw new Error('Peer connection not initialized');
        }

        try {
            console.log('[WebRTC] Setting remote description (answer)...');
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
            console.log('[WebRTC] Remote description set successfully');

            // Process any queued ICE candidates now that remote description is set
            if (this.pendingCandidates.length > 0) {
                console.log(`[WebRTC] Processing ${this.pendingCandidates.length} queued ICE candidates`);
                for (const candidate of this.pendingCandidates) {
                    try {
                        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                    } catch (error) {
                        console.error('[WebRTC] Failed to add queued ICE candidate:', error);
                    }
                }
                this.pendingCandidates = [];
            }
        } catch (error) {
            console.error('[WebRTC] Failed to set remote answer:', error);
            throw error;
        }
    }

    async addICECandidate(candidate: RTCIceCandidateInit): Promise<void> {
        if (!this.peerConnection) {
            console.warn('[WebRTC] Peer connection not initialized, ignoring ICE candidate');
            return;
        }

        // If remote description isn't set yet, queue the candidate
        if (!this.peerConnection.remoteDescription) {
            console.log('[WebRTC] Remote description not set yet, queuing ICE candidate');
            this.pendingCandidates.push(candidate);
            return;
        }

        try {
            await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            console.log('[WebRTC] ICE candidate added successfully');
        } catch (error) {
            console.error('[WebRTC] Failed to add ICE candidate:', error);
            // Don't throw - ICE candidate failures are often non-fatal
        }
    }

    getLocalStream(): MediaStream | null {
        return this.localStream;
    }

    getRemoteStream(): MediaStream | null {
        return this.remoteStream;
    }

    getConnectionState(): RTCPeerConnectionState | null {
        return this.peerConnection?.connectionState || null;
    }

    getStats(): Promise<RTCStatsReport> | null {
        return this.peerConnection?.getStats() || null;
    }

    toggleAudio(enabled: boolean): void {
        if (this.localStream) {
            this.localStream.getAudioTracks().forEach(track => {
                track.enabled = enabled;
            });
            console.log(`[WebRTC] Audio ${enabled ? 'enabled' : 'muted'}`);
        }
    }

    toggleVideo(enabled: boolean): void {
        if (this.localStream) {
            this.localStream.getVideoTracks().forEach(track => {
                track.enabled = enabled;
            });
            console.log(`[WebRTC] Video ${enabled ? 'enabled' : 'disabled'}`);
        }
    }

    close(): void {
        console.log('[WebRTC] Closing peer connection...');

        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }

        if (this.localStream) {
            // Do not stop tracks here as the stream is managed by the parent component
            this.localStream = null;
        }

        this.remoteStream = null;
        this.pendingCandidates = []; // Clear queued candidates

        console.log('[WebRTC] Peer connection closed');
    }

    // Event listener setters
    onRemoteStream(callback: (stream: MediaStream) => void) {
        this.onRemoteStreamCallback = callback;
    }

    onICECandidate(callback: (candidate: RTCIceCandidateInit) => void) {
        this.onICECandidateCallback = callback;
    }

    onConnectionStateChange(callback: (state: RTCPeerConnectionState) => void) {
        this.onConnectionStateChangeCallback = callback;
    }

    onError(callback: (error: Error) => void) {
        this.onErrorCallback = callback;
    }
}
