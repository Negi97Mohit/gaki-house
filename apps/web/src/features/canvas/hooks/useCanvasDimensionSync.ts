import { useEffect } from "react";

interface UseCanvasDimensionSyncProps {
    canvasRef: React.RefObject<HTMLCanvasElement>;
    sceneSize: { width: number; height: number };
    kernelRef?: React.RefObject<any>; // BroadcastBus
}

/**
 * Synchronizes canvas element dimensions with scene size and device pixel ratio.
 * This ensures the canvas internal resolution matches its display size,
 * fixing size discrepancies in screen captures and streams.
 */
export const useCanvasDimensionSync = ({
    canvasRef,
    sceneSize,
    kernelRef,
}: UseCanvasDimensionSyncProps) => {
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || sceneSize.width === 0 || sceneSize.height === 0) return;

        const dpr = window.devicePixelRatio || 1;
        const width = Math.floor(sceneSize.width * dpr);
        const height = Math.floor(sceneSize.height * dpr);

        if (canvas.width !== width || canvas.height !== height) {
            try {
                canvas.width = width;
                canvas.height = height;
                console.log(`[CanvasDimensionSync] Updated canvas dimensions to ${width}x${height} (dpr: ${dpr})`);
            } catch (err: any) {
                // If the canvas is transferred to an OffscreenCanvas, setting width/height throws an InvalidStateError.
                if (err.name === "InvalidStateError" && kernelRef?.current) {
                    kernelRef.current.resize(width, height);
                } else if (err.name !== "InvalidStateError") {
                    throw err; // rethrow unexpected errors
                }
            }
        }
    }, [canvasRef, sceneSize.width, sceneSize.height, kernelRef]);
};
