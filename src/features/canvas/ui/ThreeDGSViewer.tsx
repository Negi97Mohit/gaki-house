// src/features/canvas/ui/ThreeDGSViewer.tsx
import React, { useEffect, useRef, useState } from "react";
import * as GaussianSplats3D from "@mkkellogg/gaussian-splats-3d";
import { Loader2, Box } from "lucide-react";

interface ThreeDGSViewerProps {
  url: string;
  fileName: string; // Added fileName to determine format
  className?: string;
}

export const ThreeDGSViewer: React.FC<ThreeDGSViewerProps> = ({
  url,
  fileName,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // DEBUG: Start initialization
    console.log(`[3DGS] Initializing viewer for file: ${fileName}`);
    console.log(`[3DGS] Blob URL: ${url}`);

    let viewer: any = null;

    const initViewer = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Determine format from filename since Blob URLs don't have extensions
        const extension = fileName.split(".").pop()?.toLowerCase();
        let formatVal;

        if (extension === "ply") formatVal = GaussianSplats3D.SceneFormat.Ply;
        else if (extension === "splat")
          formatVal = GaussianSplats3D.SceneFormat.Splat;
        else if (extension === "ksplat")
          formatVal = GaussianSplats3D.SceneFormat.KSplat;

        console.log(
          `[3DGS] Detected extension: ${extension}, Format Enum: ${formatVal}`
        );

        if (formatVal === undefined) {
          console.warn(
            `[3DGS] Warning: Unknown extension '${extension}'. Library might fail to detect format.`
          );
        }

        viewer = new GaussianSplats3D.Viewer({
          cameraUp: [0, -1, -0.6],
          initialCameraPosition: [0, 0, 5],
          rootElement: containerRef.current,
          sharedMemoryForWorkers: false,
          selfDrivenMode: true,
          useGPUAcceleration: true,
          dropInMode: false,
        });

        viewerRef.current = viewer;

        console.log(`[3DGS] Viewer instance created. Loading scene...`);

        await viewer.addSplatScene(url, {
          splatAlphaRemovalThreshold: 5,
          showLoadingUI: false,
          position: [0, 0, 0],
          rotation: [0, 0, 0, 1],
          scale: [1, 1, 1],
          format: formatVal, // <--- CRITICAL FIX: Explicitly pass format
        });

        console.log(`[3DGS] Scene loaded successfully.`);
        viewer.start();
        setIsLoading(false);
      } catch (err: any) {
        console.error("[3DGS] Error loading scene:", err);
        setError(`Failed to load: ${err.message || "Unknown error"}`);
        setIsLoading(false);
      }
    };

    initViewer();

    return () => {
      console.log(`[3DGS] Disposing viewer for ${fileName}`);
      if (viewerRef.current) {
        viewerRef.current.dispose();
      }
    };
  }, [url, fileName]);

  return (
    <div className="w-full h-full relative group">
      {/* 3D Render Container */}
      <div
        ref={containerRef}
        className={`w-full h-full ${className} cursor-default`}
        onPointerDown={(e) => e.stopPropagation()}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white z-10 pointer-events-none">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading 3D Scene...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-red-400 z-10 p-4 text-center">
          <Box className="w-8 h-8 mb-2" />
          <p className="text-sm font-mono">{error}</p>
        </div>
      )}

      {/* Helper Text */}
      {!isLoading && !error && (
        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/40 backdrop-blur-sm rounded text-[10px] text-white/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none select-none">
          Left Click: Rotate • Right Click: Pan • Scroll: Zoom
        </div>
      )}
    </div>
  );
};
