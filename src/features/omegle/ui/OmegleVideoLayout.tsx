import React, { useRef, useEffect } from 'react';
import { OmegleDesign } from '@/types/omegle';
import { useOmegleStore } from '@/stores/omegle.store';

interface OmegleVideoLayoutProps {
    design: OmegleDesign;
}

export const OmegleVideoLayout: React.FC<OmegleVideoLayoutProps> = ({ design }) => {
    const { connection } = useOmegleStore();
    const strangerVideoRef = useRef<HTMLVideoElement>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);

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

    const { strangerVideo, localVideo } = design.layout;

    return (
        <>
            {/* Stranger's Video */}
            <video
                ref={strangerVideoRef}
                autoPlay
                playsInline
                className="absolute object-cover"
                style={{
                    left: `${strangerVideo.position.x}%`,
                    top: `${strangerVideo.position.y}%`,
                    width: `${strangerVideo.size.width}%`,
                    height: `${strangerVideo.size.height}%`,
                    zIndex: strangerVideo.zIndex,
                    borderRadius: strangerVideo.borderRadius ? `${strangerVideo.borderRadius}px` : undefined,
                    border: strangerVideo.border ? `${strangerVideo.border.width}px solid ${strangerVideo.border.color}` : undefined,
                    boxShadow: strangerVideo.shadow ? `0 0 ${strangerVideo.shadow.blur}px ${strangerVideo.shadow.color}` : undefined,
                    filter: design.effects.videoFilter,
                    objectFit: strangerVideo.objectFit || 'cover',
                }}
            />

            {/* Local Video (User's Camera) */}
            <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="absolute object-cover"
                style={{
                    left: `${localVideo.position.x}%`,
                    top: `${localVideo.position.y}%`,
                    width: `${localVideo.size.width}%`,
                    height: `${localVideo.size.height}%`,
                    zIndex: localVideo.zIndex,
                    transform: localVideo.mirror ? 'scaleX(-1)' : undefined,
                    borderRadius: localVideo.shape === 'circle' ? '50%' : localVideo.borderRadius ? `${localVideo.borderRadius}px` : undefined,
                    border: localVideo.border ? `${localVideo.border.width}px solid ${localVideo.border.color}` : undefined,
                    boxShadow: localVideo.shadow ? `0 0 ${localVideo.shadow.blur}px ${localVideo.shadow.color}` : undefined,
                    filter: design.effects.videoFilter,
                    objectFit: localVideo.objectFit || 'cover',
                }}
            />

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
        </>
    );
};
