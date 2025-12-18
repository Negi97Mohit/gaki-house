import React, { useRef } from "react";
import { useWebGLRenderLoop } from "@/hooks/useWebGLRenderLoop";

interface ForegroundUserLayerProps {
    videoRef: React.RefObject<HTMLVideoElement>;
    processedCanvas: HTMLCanvasElement | null;
    facePositionRef: React.MutableRefObject<{
        x: number;
        y: number;
        width: number;
        height: number;
    } | null>;
    videoFilter: string;
    isAutoFramingEnabled: boolean;
    zoomSensitivity: number;
    trackingSpeed: number;
    containerSize: { width: number; height: number };
}

export const ForegroundUserLayer: React.FC<ForegroundUserLayerProps> = ({
    videoRef,
    processedCanvas,
    facePositionRef,
    videoFilter,
    isAutoFramingEnabled,
    zoomSensitivity,
    trackingSpeed,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useWebGLRenderLoop({
        canvasRef,
        videoRef,
        activeStream: undefined, // Don't manage stream
        videoFilter,
        processedCanvas,
        facePositionRef,
        isAutoFramingEnabled,
        zoomSensitivity,
        trackingSpeed,
        isMasked: true, // Enable masked rendering
    });

    return (
        <div className="absolute inset-0 w-full h-full pointer-events-none z-[1000]">
            <canvas ref={canvasRef} className="w-full h-full object-cover" />
        </div>
    );
};
