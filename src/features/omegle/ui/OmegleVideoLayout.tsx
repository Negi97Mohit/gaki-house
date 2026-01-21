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
        setIsRemoteCameraEnabled(videoTrack.enabled && videoTrack.readyState === 'live');

        const handleMute = () => setIsRemoteCameraEnabled(false);
        const handleUnmute = () => setIsRemoteCameraEnabled(true);
        const handleEnded = () => setIsRemoteCameraEnabled(false);

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

            setStrangerBounds({
                x: (strangerVideo.position.x / 100) * rect.width,
                y: (strangerVideo.position.y / 100) * rect.height,
                width: (strangerVideo.size.width / 100) * rect.width,
                height: (strangerVideo.size.height / 100) * rect.height,
            });

            setLocalBounds({
                x: (localVideo.position.x / 100) * rect.width,
                y: (localVideo.position.y / 100) * rect.height,
                width: (localVideo.size.width / 100) * rect.width,
                height: (localVideo.size.height / 100) * rect.height,
            });
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

    // Minimalist camera off placeholder
    const CameraOffPlaceholder = ({ isLocal }: { isLocal: boolean }) => (
        <div className="absolute inset-0 w-full h-full">
            <AmbientBackground />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                <div className={cn(
                    "flex flex-col items-center gap-3",
                    "animate-fade-in"
                )}>
                    <div className={cn(
                        "w-14 h-14 rounded-full flex items-center justify-center",
                        "bg-white/[0.05] backdrop-blur-sm border border-white/[0.08]"
                    )}>
                        <VideoOff className={cn(
                            "opacity-40",
                            isLocal ? "w-5 h-5" : "w-6 h-6"
                        )} />
                    </div>
                    <p className="text-white/40 text-xs font-medium tracking-wide">
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
                <div className={cn(
                    "relative w-full h-full overflow-hidden",
                    "transition-shadow duration-300",
                    "ring-1 ring-white/[0.05]"
                )}
                    style={{
                        borderRadius: strangerVideo.borderRadius ? `${strangerVideo.borderRadius}px` : '16px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
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
                    <div className={cn(
                        "absolute bottom-2 right-2 px-2 py-1 rounded-full",
                        "text-[10px] text-white/30 font-medium",
                        "bg-black/30 backdrop-blur-sm",
                        "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                        "pointer-events-none"
                    )}>
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
                <div className={cn(
                    "relative w-full h-full overflow-hidden",
                    "transition-all duration-300",
                    "ring-1 ring-white/[0.08]",
                    "hover:ring-white/[0.15]"
                )}
                    style={{
                        borderRadius: localVideo.shape === 'circle' ? '50%' : localVideo.borderRadius ? `${localVideo.borderRadius}px` : '12px',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
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
                    <div className={cn(
                        "absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-full",
                        "text-[9px] text-white/30 font-medium",
                        "bg-black/30 backdrop-blur-sm",
                        "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                        "pointer-events-none"
                    )}>
                        {videoTransforms.local.locked ? '🔒' : '↔'}
                    </div>
                </div>
            </Rnd>

            {/* Connection Status Overlay - Modern & Minimal */}
            {connection.matchStatus !== 'connected' && (
                <div className={cn(
                    "absolute inset-0 flex items-center justify-center z-10",
                    "bg-black/60 backdrop-blur-md"
                )}>
                    <div className={cn(
                        "text-center text-white p-8 rounded-3xl",
                        "bg-white/[0.03] backdrop-blur-xl border border-white/[0.05]",
                        "shadow-2xl shadow-black/50",
                        "animate-scale-in"
                    )}>
                        {connection.matchStatus === 'searching' && (
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative">
                                    <Loader2 className="w-10 h-10 animate-spin text-white/60" />
                                    <div className="absolute inset-0 animate-ping opacity-20">
                                        <Loader2 className="w-10 h-10 text-white" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-lg font-medium text-white/90">Finding someone</p>
                                    <p className="text-sm text-white/40">This won't take long...</p>
                                </div>
                            </div>
                        )}
                        {connection.matchStatus === 'idle' && (
                            <div className="flex flex-col items-center gap-4">
                                <div className={cn(
                                    "w-16 h-16 rounded-full flex items-center justify-center",
                                    "bg-white/[0.05] border border-white/[0.08]"
                                )}>
                                    <Users className="w-7 h-7 text-white/50" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-lg font-medium text-white/90">Ready to connect</p>
                                    <p className="text-sm text-white/40">Click Connect to start</p>
                                </div>
                            </div>
                        )}
                        {connection.matchStatus === 'disconnected' && (
                            <div className="flex flex-col items-center gap-4">
                                <div className={cn(
                                    "w-16 h-16 rounded-full flex items-center justify-center",
                                    "bg-amber-500/10 border border-amber-500/20"
                                )}>
                                    <Users className="w-7 h-7 text-amber-400/70" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-lg font-medium text-white/90">They left</p>
                                    <p className="text-sm text-white/40">Click Next to find someone new</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
