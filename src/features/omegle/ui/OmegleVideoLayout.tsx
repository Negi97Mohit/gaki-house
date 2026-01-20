import React, { useRef, useEffect, useState } from 'react';
import { Rnd } from 'react-rnd';
import { OmegleDesign } from '@/types/omegle';
import { useOmegleStore } from '@/stores/omegle.store';
import { OmeglePipToolbar } from './OmeglePipToolbar';
import { cn } from '@/shared/lib/utils';

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
    } = useOmegleStore();
    const strangerVideoRef = useRef<HTMLVideoElement>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Track video positions and sizes (independent of design for now)
    const [strangerBounds, setStrangerBounds] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const [localBounds, setLocalBounds] = useState({ x: 0, y: 0, width: 0, height: 0 });

    // Attach remote stream to stranger video element
    useEffect(() => {
        if (strangerVideoRef.current && connection.remoteStream) {
            strangerVideoRef.current.srcObject = connection.remoteStream;
        }
    }, [connection.remoteStream]);

    // Attach local stream to local video element
    useEffect(() => {
        if (localVideoRef.current && connection.localStream) {
            localVideoRef.current.srcObject = connection.localStream;
        }
    }, [connection.localStream]);

    // Initialize positions from design on mount or design change
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

    // Calculate transform CSS based on state
    const getTransformStyle = (target: 'stranger' | 'local') => {
        const transforms: string[] = [];
        const t = videoTransforms[target];

        if (t.flipH) transforms.push('scaleX(-1)');
        if (t.flipV) transforms.push('scaleY(-1)');
        if (t.zoom !== 1) transforms.push(`scale(${t.zoom})`);

        return transforms.length > 0 ? transforms.join(' ') : undefined;
    };

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
                <video
                    ref={strangerVideoRef}
                    autoPlay
                    playsInline
                    className={cn(
                        "w-full h-full object-cover",
                        !connection.remoteStream && "hidden"
                    )}
                    style={{
                        borderRadius: strangerVideo.borderRadius ? `${strangerVideo.borderRadius}px` : undefined,
                        border: strangerVideo.border ? `${strangerVideo.border.width}px solid ${strangerVideo.border.color}` : undefined,
                        boxShadow: strangerVideo.shadow ? `0 0 ${strangerVideo.shadow.blur}px ${strangerVideo.shadow.color}` : undefined,
                        filter: design.effects.videoFilter,
                        objectFit: strangerVideo.objectFit || 'cover',
                        transform: getTransformStyle('stranger'),
                    }}
                />

                {/* Camera Off Placeholder for Stranger */}
                {!connection.remoteStream && (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/30 via-blue-900/30 to-pink-900/30 backdrop-blur-xl relative overflow-hidden">
                        {/* Animated ambient background */}
                        <div className="absolute inset-0">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-pink-500/10 animate-pulse"></div>
                            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-bounce" style={{ animationDuration: '8s' }}></div>
                            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-bounce" style={{ animationDelay: '2s', animationDuration: '10s' }}></div>
                        </div>

                        {/* Logo and Text */}
                        <div className="relative z-10 text-center">
                            <div className="w-24 h-24 mx-auto mb-6 relative">
                                <img
                                    src="/logo_256x256.png"
                                    alt="Logo"
                                    className="w-full h-full object-contain opacity-60"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10 rounded-full"></div>
                            </div>
                            <p className="text-lg font-medium text-white/90 mb-2">Stranger's Camera Off</p>
                            <p className="text-sm text-white/60">Text chat available - waiting for video...</p>
                        </div>
                    </div>
                )}

                {/* PIP Toolbar for Stranger */}
                <OmeglePipToolbar
                    target="stranger"
                    onFlipHorizontal={() => toggleFlipH('stranger')}
                    onFlipVertical={() => toggleFlipV('stranger')}
                    onZoomIn={() => setZoom('stranger', videoTransforms.stranger.zoom + 0.1)}
                    onZoomOut={() => setZoom('stranger', videoTransforms.stranger.zoom - 0.1)}
                    onToggleLock={() => toggleLock('stranger')}
                    isLocked={videoTransforms.stranger.locked}
                />

                {/* Resize indicator */}
                <div className="absolute bottom-1 right-1 text-xs text-white/50 bg-black/30 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {videoTransforms.stranger.locked ? 'Locked' : 'Drag/Resize'}
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
                <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={cn(
                        "w-full h-full object-cover",
                        !connection.localStream && "hidden"
                    )}
                    style={{
                        borderRadius: localVideo.shape === 'circle' ? '50%' : localVideo.borderRadius ? `${localVideo.borderRadius}px` : undefined,
                        border: localVideo.border ? `${localVideo.border.width}px solid ${localVideo.border.color}` : undefined,
                        boxShadow: localVideo.shadow ? `0 0 ${localVideo.shadow.blur}px ${localVideo.shadow.color}` : undefined,
                        filter: design.effects.videoFilter,
                        objectFit: localVideo.objectFit || 'cover',
                        transform: getTransformStyle('local'),
                    }}
                />

                {/* Camera Off Placeholder for Local */}
                {!connection.localStream && (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden rounded">
                        {/* Ambient glow */}
                        <div className="absolute inset-0">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
                        </div>

                        {/* Logo and Text */}
                        <div className="relative z-10 text-center">
                            <div className="w-16 h-16 mx-auto mb-3 relative">
                                <img
                                    src="/logo_256x256.png"
                                    alt="Logo"
                                    className="w-full h-full object-contain opacity-40"
                                />
                            </div>
                            <p className="text-xs font-medium text-white/70">Camera Off</p>
                            <p className="text-[10px] text-white/40 mt-1">Text chat available</p>
                        </div>
                    </div>
                )}

                {/* PIP Toolbar for Local */}
                <OmeglePipToolbar
                    target="local"
                    onFlipHorizontal={() => toggleFlipH('local')}
                    onFlipVertical={() => toggleFlipV('local')}
                    onZoomIn={() => setZoom('local', videoTransforms.local.zoom + 0.1)}
                    onZoomOut={() => setZoom('local', videoTransforms.local.zoom - 0.1)}
                    onToggleLock={() => toggleLock('local')}
                    isLocked={videoTransforms.local.locked}
                />

                {/* Resize indicator */}
                <div className="absolute bottom-1 right-1 text-xs text-white/50 bg-black/30 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {videoTransforms.local.locked ? 'Locked' : 'Drag/Resize'}
                </div>
            </Rnd>

            {/* Connection Status Overlay */}
            {connection.matchStatus !== 'connected' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10 pointer-events-none">
                    <div className="text-center text-white pointer-events-auto">
                        {connection.matchStatus === 'searching' && (
                            <>
                                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
                                <p className="text-xl font-medium">Looking for someone...</p>
                            </>
                        )}
                        {connection.matchStatus === 'idle' && (
                            <>
                                <p className="text-xl font-medium">Ready to connect!</p>
                                <p className="text-sm opacity-75 mt-2">Look for controls in the corner</p>
                            </>
                        )}
                        {connection.matchStatus === 'disconnected' && (
                            <>
                                <p className="text-xl font-medium mb-2">Stranger disconnected</p>
                                <p className="text-sm opacity-75">Click "Next" to find someone new</p>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
