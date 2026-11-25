import { WebRTCConfig } from "@gaki/core/types/omegle";

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

            this.localStream = localStream;
            this.peerConnection = new RTCPeerConnection(this.config);

            // Add local tracks to peer connection if stream exists
            if (localStream) {
                localStream.getTracks().forEach(track => {
                    if (this.peerConnection && this.localStream) {
                        this.peerConnection.addTrack(track, this.localStream);
                    }
                });
            }

            // Handle remote stream
            this.peerConnection.ontrack = (event) => {

                // Always create a new MediaStream to ensure state updates trigger re-renders
                // If we already have tracks, we need to preserve them
                const newStream = new MediaStream();

                if (this.remoteStream) {
                    this.remoteStream.getTracks().forEach(track => {
                        newStream.addTrack(track);
                    });
                }

                // Add the new track
                newStream.addTrack(event.track);

                this.remoteStream = newStream;
                this.onRemoteStreamCallback?.(this.remoteStream);
            };

            // Handle ICE candidates
            this.peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    this.onICECandidateCallback?.(event.candidate.toJSON());
                }
            };

            // Handle connection state changes
            this.peerConnection.onconnectionstatechange = () => {
                const state = this.peerConnection?.connectionState;

                if (state) {
                    this.onConnectionStateChangeCallback?.(state);

                    if (state === 'failed' || state === 'closed') {
                        console.error('[WebRTC] Connection failed or closed');
                        this.onErrorCallback?.(new Error(`Connection ${state}`));
                    }
                }
            };

            // Handle ICE connection state changes
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
            // Always set offerToReceive to true so we can receive remote media
            // even if we don't have local media to send
            const offer = await this.peerConnection.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true,
            });

            await this.peerConnection.setLocalDescription(offer);

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
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

            // Process any queued ICE candidates now that remote description is set
            if (this.pendingCandidates.length > 0) {
                for (const candidate of this.pendingCandidates) {
                    try {
                        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                    } catch (error) {
                        console.error('[WebRTC] Failed to add queued ICE candidate:', error);
                    }
                }
                this.pendingCandidates = [];
            }

            const answer = await this.peerConnection.createAnswer();

            await this.peerConnection.setLocalDescription(answer);

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
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));

            // Process any queued ICE candidates now that remote description is set
            if (this.pendingCandidates.length > 0) {
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
            this.pendingCandidates.push(candidate);
            return;
        }

        try {
            await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
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
        }
    }

    toggleVideo(enabled: boolean): void {
        if (this.localStream) {
            this.localStream.getVideoTracks().forEach(track => {
                track.enabled = enabled;
            });
        }
    }

    close(): void {

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
