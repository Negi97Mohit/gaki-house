import React, { useRef, useEffect, useState } from 'react';
import { Rnd } from 'react-rnd';
import { OmegleDesign } from '@/types/omegle';
import { useOmegleStore } from '@/stores/omegle.store';
import { OmeglePipToolbar } from './OmeglePipToolbar';
import { cn } from '@/shared/lib/utils';
import { AmbientBackground } from '@/features/stream/ui/AmbientBackground';
import { VideoOff, Users, Loader2 } from 'lucide-react';

interface OmegleVideoLayoutProps {
    design: OmegleDesign;
}

export const OmegleVideoLayout: React.FC<OmegleVideoLayoutProps> = ({ design }) => {
    const {
        connection,
        videoTransforms,
        toggleFlipH,
        toggleFlipV,
        setZoom,
        toggleLock,
        setAspectRatio,
        isCameraEnabled: isLocalCameraEnabled,
    } = useOmegleStore();
    const strangerVideoRef = useRef<HTMLVideoElement>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [strangerBounds, setStrangerBounds] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const [localBounds, setLocalBounds] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const [isRemoteCameraEnabled, setIsRemoteCameraEnabled] = useState(true);

    useEffect(() => {
        if (!connection.remoteStream) {
            setIsRemoteCameraEnabled(false);
            return;
        }

        const videoTracks = connection.remoteStream.getVideoTracks();
        if (videoTracks.length === 0) {
            setIsRemoteCameraEnabled(false);
            return;
        }

        const videoTrack = videoTracks[0];

        // Initial state check - check if enabled AND not muted
        // Notes: 
        // - 'enabled' is the local switch (sender side)
        // - 'muted' can be true on receiver side if no data is flowing or sender disabled it
        const checkStatus = () => {
            const isEnabled = videoTrack.enabled;
            const isLive = videoTrack.readyState === 'live';
            const isMuted = videoTrack.muted;

            console.log('[OmegleVideoLayout] Track status:', { isEnabled, isLive, isMuted });
            setIsRemoteCameraEnabled(isEnabled && isLive && !isMuted);
        };

        checkStatus();

        const handleMute = () => {
            console.log('[OmegleVideoLayout] Remote track muted');
            setIsRemoteCameraEnabled(false);
        };

        const handleUnmute = () => {
            console.log('[OmegleVideoLayout] Remote track unmuted');
            // Re-verify status on unmute
            checkStatus();
        };

        const handleEnded = () => {
            console.log('[OmegleVideoLayout] Remote track ended');
            setIsRemoteCameraEnabled(false);
        };

        videoTrack.addEventListener('mute', handleMute);
        videoTrack.addEventListener('unmute', handleUnmute);
        videoTrack.addEventListener('ended', handleEnded);

        return () => {
            videoTrack.removeEventListener('mute', handleMute);
            videoTrack.removeEventListener('unmute', handleUnmute);
            videoTrack.removeEventListener('ended', handleEnded);
        };
    }, [connection.remoteStream]);

    useEffect(() => {
        if (strangerVideoRef.current && connection.remoteStream) {
            strangerVideoRef.current.srcObject = connection.remoteStream;
        }
    }, [connection.remoteStream]);

    useEffect(() => {
        if (localVideoRef.current && connection.localStream) {
            localVideoRef.current.srcObject = connection.localStream;
        }
    }, [connection.localStream]);

    useEffect(() => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const { strangerVideo, localVideo } = design.layout;
            const padding = 8;

            // Helper to clamp bounds within container
            const clampBounds = (
                posX: number,
                posY: number,
                w: number,
                h: number,
                minW: number,
                minH: number
            ) => {
                let width = (w / 100) * rect.width;
                let height = (h / 100) * rect.height;
                let x = (posX / 100) * rect.width;
                let y = (posY / 100) * rect.height;

                // Enforce minimums
                width = Math.max(minW, width);
                height = Math.max(minH, height);

                // Clamp to container bounds
                const maxWidth = rect.width - padding * 2;
                const maxHeight = rect.height - padding * 2;
                width = Math.min(width, maxWidth);
                height = Math.min(height, maxHeight);

                // Ensure position keeps element fully visible
                x = Math.max(padding, x);
                if (x + width > rect.width - padding) {
                    x = rect.width - width - padding;
                }
                x = Math.max(padding, x);

                y = Math.max(padding, y);
                if (y + height > rect.height - padding) {
                    y = rect.height - height - padding;
                }
                y = Math.max(padding, y);

                return { x, y, width, height };
            };

            setStrangerBounds(clampBounds(
                strangerVideo.position.x,
                strangerVideo.position.y,
                strangerVideo.size.width,
                strangerVideo.size.height,
                200,
                150
            ));

            setLocalBounds(clampBounds(
                localVideo.position.x,
                localVideo.position.y,
                localVideo.size.width,
                localVideo.size.height,
                100,
                75
            ));
        }
    }, [design]);

    const { strangerVideo, localVideo } = design.layout;

    const getTransformStyle = (target: 'stranger' | 'local') => {
        const transforms: string[] = [];
        const t = videoTransforms[target];

        if (t.flipH) transforms.push('scaleX(-1)');
        if (t.flipV) transforms.push('scaleY(-1)');
        if (t.zoom !== 1) transforms.push(`scale(${t.zoom})`);

        return transforms.length > 0 ? transforms.join(' ') : undefined;
    };

    const hasRemoteVideo = connection.remoteStream && isRemoteCameraEnabled;
    const hasLocalVideo = connection.localStream && isLocalCameraEnabled;

    // Themed camera off placeholder
    const CameraOffPlaceholder = ({ isLocal }: { isLocal: boolean }) => (
        <div className="absolute inset-0 w-full h-full">
            <AmbientBackground />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                <div className={cn(
                    "flex flex-col items-center gap-3",
                    "animate-fade-in"
                )}>
                    <div
                        className={cn(
                            "w-14 h-14 rounded-full flex items-center justify-center",
                            "backdrop-blur-sm"
                        )}
                        style={{
                            background: 'var(--omegle-video-overlay)',
                            border: '1px solid var(--omegle-video-border)',
                        }}
                    >
                        <VideoOff
                            className={cn(
                                "opacity-60",
                                isLocal ? "w-5 h-5" : "w-6 h-6"
                            )}
                            style={{ color: 'var(--omegle-text-muted)' }}
                        />
                    </div>
                    <p
                        className="text-xs font-medium tracking-wide"
                        style={{ color: 'var(--omegle-text-muted)' }}
                    >
                        {isLocal ? 'Camera off' : 'Waiting for video'}
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <div ref={containerRef} className="absolute inset-0">
            {/* Stranger's Video - Draggable */}
            <Rnd
                position={{ x: strangerBounds.x, y: strangerBounds.y }}
                size={{ width: strangerBounds.width, height: strangerBounds.height }}
                onDragStop={(e, d) => {
                    if (!videoTransforms.stranger.locked) {
                        setStrangerBounds(prev => ({ ...prev, x: d.x, y: d.y }));
                    }
                }}
                onResizeStop={(e, direction, ref, delta, position) => {
                    if (!videoTransforms.stranger.locked) {
                        setStrangerBounds({
                            x: position.x,
                            y: position.y,
                            width: parseInt(ref.style.width),
                            height: parseInt(ref.style.height),
                        });
                    }
                }}
                bounds="parent"
                minWidth={200}
                minHeight={150}
                className="group"
                disableDragging={videoTransforms.stranger.locked}
                enableResizing={!videoTransforms.stranger.locked}
            >
                <div
                    className={cn(
                        "relative w-full h-full overflow-hidden",
                        "transition-shadow duration-300"
                    )}
                    style={{
                        borderRadius: strangerVideo.borderRadius
                            ? `${strangerVideo.borderRadius}px`
                            : 'var(--omegle-border-radius)',
                        boxShadow: 'var(--omegle-shadow)',
                        border: 'var(--omegle-border-width) solid var(--omegle-video-border)',
                        background: 'var(--omegle-video-background)',
                    }}
                >
                    <video
                        ref={strangerVideoRef}
                        autoPlay
                        playsInline
                        className={cn(
                            "w-full h-full object-cover transition-all duration-500",
                            !hasRemoteVideo && "opacity-0"
                        )}
                        style={{
                            filter: design.effects.videoFilter,
                            objectFit: strangerVideo.objectFit || 'cover',
                            transform: getTransformStyle('stranger'),
                        }}
                    />

                    {!hasRemoteVideo && <CameraOffPlaceholder isLocal={false} />}

                    <OmeglePipToolbar
                        target="stranger"
                        onFlipHorizontal={() => toggleFlipH('stranger')}
                        onFlipVertical={() => toggleFlipV('stranger')}
                        onZoomIn={() => setZoom('stranger', videoTransforms.stranger.zoom + 0.1)}
                        onZoomOut={() => setZoom('stranger', videoTransforms.stranger.zoom - 0.1)}
                        onToggleLock={() => toggleLock('stranger')}
                        isLocked={videoTransforms.stranger.locked}
                    />

                    {/* Minimal resize hint */}
                    <div
                        className={cn(
                            "absolute bottom-2 right-2 px-2 py-1 rounded-full",
                            "text-[10px] font-medium",
                            "backdrop-blur-sm",
                            "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                            "pointer-events-none"
                        )}
                        style={{
                            background: 'var(--omegle-video-overlay)',
                            color: 'var(--omegle-text-muted)',
                        }}
                    >
                        {videoTransforms.stranger.locked ? '🔒' : '↔'}
                    </div>
                </div>
            </Rnd>

            {/* Local Video (User's Camera) - Draggable */}
            <Rnd
                position={{ x: localBounds.x, y: localBounds.y }}
                size={{ width: localBounds.width, height: localBounds.height }}
                onDragStop={(e, d) => {
                    if (!videoTransforms.local.locked) {
                        setLocalBounds(prev => ({ ...prev, x: d.x, y: d.y }));
                    }
                }}
                onResizeStop={(e, direction, ref, delta, position) => {
                    if (!videoTransforms.local.locked) {
                        setLocalBounds({
                            x: position.x,
                            y: position.y,
                            width: parseInt(ref.style.width),
                            height: parseInt(ref.style.height),
                        });
                    }
                }}
                bounds="parent"
                minWidth={100}
                minHeight={75}
                className="group"
                disableDragging={videoTransforms.local.locked}
                enableResizing={!videoTransforms.local.locked}
            >
                <div
                    className={cn(
                        "relative w-full h-full overflow-hidden",
                        "transition-all duration-300"
                    )}
                    style={{
                        borderRadius: localVideo.shape === 'circle'
                            ? '50%'
                            : localVideo.borderRadius
                                ? `${localVideo.borderRadius}px`
                                : 'var(--omegle-border-radius)',
                        boxShadow: 'var(--omegle-shadow)',
                        border: 'var(--omegle-border-width) solid var(--omegle-video-border)',
                        background: 'var(--omegle-video-background)',
                    }}
                >
                    <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className={cn(
                            "w-full h-full object-cover transition-all duration-500",
                            !hasLocalVideo && "opacity-0"
                        )}
                        style={{
                            filter: design.effects.videoFilter,
                            objectFit: localVideo.objectFit || 'cover',
                            transform: getTransformStyle('local'),
                        }}
                    />

                    {!hasLocalVideo && <CameraOffPlaceholder isLocal={true} />}

                    <OmeglePipToolbar
                        target="local"
                        onFlipHorizontal={() => toggleFlipH('local')}
                        onFlipVertical={() => toggleFlipV('local')}
                        onZoomIn={() => setZoom('local', videoTransforms.local.zoom + 0.1)}
                        onZoomOut={() => setZoom('local', videoTransforms.local.zoom - 0.1)}
                        onToggleLock={() => toggleLock('local')}
                        isLocked={videoTransforms.local.locked}
                    />

                    {/* Minimal resize hint */}
                    <div
                        className={cn(
                            "absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-full",
                            "text-[9px] font-medium",
                            "backdrop-blur-sm",
                            "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                            "pointer-events-none"
                        )}
                        style={{
                            background: 'var(--omegle-video-overlay)',
                            color: 'var(--omegle-text-muted)',
                        }}
                    >
                        {videoTransforms.local.locked ? '🔒' : '↔'}
                    </div>
                </div>
            </Rnd>

            {/* Connection Status Overlay - Themed */}
            {connection.matchStatus !== 'connected' && (
                <div
                    className={cn(
                        "absolute inset-0 flex items-center justify-center z-10",
                        "backdrop-blur-md"
                    )}
                    style={{ background: 'var(--omegle-video-overlay)' }}
                >
                    <div
                        className={cn(
                            "text-center p-8 rounded-3xl",
                            "backdrop-blur-xl",
                            "animate-scale-in"
                        )}
                        style={{
                            background: 'var(--omegle-controls-background)',
                            border: 'var(--omegle-border-width) solid var(--omegle-controls-border)',
                            boxShadow: 'var(--omegle-shadow)',
                            borderRadius: 'var(--omegle-border-radius)',
                        }}
                    >
                        {connection.matchStatus === 'searching' && (
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative">
                                    <Loader2
                                        className="w-10 h-10 animate-spin"
                                        style={{ color: 'var(--omegle-primary)' }}
                                    />
                                    <div className="absolute inset-0 animate-ping opacity-20">
                                        <Loader2
                                            className="w-10 h-10"
                                            style={{ color: 'var(--omegle-primary)' }}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p
                                        className="text-lg font-medium"
                                        style={{ color: 'var(--omegle-text)' }}
                                    >
                                        Finding someone
                                    </p>
                                    <p
                                        className="text-sm"
                                        style={{ color: 'var(--omegle-text-muted)' }}
                                    >
                                        This won't take long...
                                    </p>
                                </div>
                            </div>
                        )}
                        {connection.matchStatus === 'idle' && (
                            <div className="flex flex-col items-center gap-4">
                                <div
                                    className={cn(
                                        "w-16 h-16 rounded-full flex items-center justify-center"
                                    )}
                                    style={{
                                        background: 'var(--omegle-secondary)',
                                        border: 'var(--omegle-border-width) solid var(--omegle-controls-border)',
                                    }}
                                >
                                    <Users
                                        className="w-7 h-7"
                                        style={{ color: 'var(--omegle-text-muted)' }}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <p
                                        className="text-lg font-medium"
                                        style={{ color: 'var(--omegle-text)' }}
                                    >
                                        Ready to connect
                                    </p>
                                    <p
                                        className="text-sm"
                                        style={{ color: 'var(--omegle-text-muted)' }}
                                    >
                                        Click Connect to start
                                    </p>
                                </div>
                            </div>
                        )}
                        {connection.matchStatus === 'disconnected' && (
                            <div className="flex flex-col items-center gap-4">
                                <div
                                    className={cn(
                                        "w-16 h-16 rounded-full flex items-center justify-center"
                                    )}
                                    style={{
                                        background: 'var(--omegle-warning)',
                                        opacity: 0.15,
                                    }}
                                >
                                    <Users
                                        className="w-7 h-7"
                                        style={{ color: 'var(--omegle-warning)' }}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <p
                                        className="text-lg font-medium"
                                        style={{ color: 'var(--omegle-text)' }}
                                    >
                                        They left
                                    </p>
                                    <p
                                        className="text-sm"
                                        style={{ color: 'var(--omegle-text-muted)' }}
                                    >
                                        Click Next to find someone new
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
