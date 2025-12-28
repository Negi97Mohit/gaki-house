// src/features/canvas/ui/ThreeDGSViewer.tsx
import React, { useEffect, useRef, useState } from "react";
import * as GaussianSplats3D from "@mkkellogg/gaussian-splats-3d";
import * as THREE from "three"; // Import Three.js for math
import { Loader2, Box } from "lucide-react";

interface ThreeDGSViewerProps {
  url: string;
  fileName: string;
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

    console.log(`[3DGS] Initializing viewer for file: ${fileName}`);

    let viewer: any = null;

    const initViewer = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Determine format
        const extension = fileName.split(".").pop()?.toLowerCase();
        let formatVal;
        if (extension === "ply") formatVal = GaussianSplats3D.SceneFormat.Ply;
        else if (extension === "splat")
          formatVal = GaussianSplats3D.SceneFormat.Splat;
        else if (extension === "ksplat")
          formatVal = GaussianSplats3D.SceneFormat.KSplat;

        viewer = new GaussianSplats3D.Viewer({
          cameraUp: [0, -1, -0.6],
          initialCameraPosition: [0, 0, 5], // Default, will be overwritten
          rootElement: containerRef.current,
          sharedMemoryForWorkers: false,
          selfDrivenMode: true,
          useGPUAcceleration: true,
          dropInMode: false,
        });

        viewerRef.current = viewer;

        await viewer.addSplatScene(url, {
          splatAlphaRemovalThreshold: 5,
          showLoadingUI: false,
          position: [0, 0, 0],
          rotation: [0, 0, 0, 1],
          scale: [1, 1, 1],
          format: formatVal,
        });

        console.log(`[3DGS] Scene loaded. Attempting to fit camera...`);

        // --- Auto-Fit Logic ---
        try {
          // The library stores the mesh in viewer.splatMesh
          const splatMesh = viewer.splatMesh;

          if (splatMesh) {
            // computeBoundingBox(applyTransforms, sceneIndex)
            // We ask for the bounding box of scene 0
            const bbox = splatMesh.computeBoundingBox(true, 0);

            if (bbox && !bbox.isEmpty()) {
              const center = new THREE.Vector3();
              const size = new THREE.Vector3();

              bbox.getCenter(center);
              bbox.getSize(size);

              const maxDim = Math.max(size.x, size.y, size.z);

              // Calculate distance needed to fit the object
              // Start slightly further back (1.5x) to ensure it's fully visible
              const fov = 45 * (Math.PI / 180); // Default FOV is usually 45-60
              const cameraDistance = Math.abs(maxDim / (2 * Math.tan(fov / 2)));

              // Move camera along the Z axis relative to the object center
              const newPos = new THREE.Vector3()
                .copy(center)
                .add(new THREE.Vector3(0, 0, cameraDistance * 1.5));

              // Access internal camera and controls
              // Note: viewer.camera is the Three.js camera
              // viewer.controls is often the orbit controls wrapper

              if (viewer.camera) {
                viewer.camera.position.copy(newPos);
                viewer.camera.lookAt(center);
                viewer.camera.updateProjectionMatrix();
              }

              // Update OrbitControls target to orbit around the model center
              // The library exposes controls, often as 'controls' or 'cameraControls'
              const controls = viewer.controls || viewer.cameraControls;
              if (controls) {
                if (controls.target) {
                  controls.target.copy(center);
                }
                controls.update?.();
              }

              console.log(
                `[3DGS] Auto-fitted camera to center:`,
                center,
                `distance:`,
                cameraDistance
              );
            }
          }
        } catch (fitErr) {
          console.warn("[3DGS] Failed to auto-fit camera:", fitErr);
        }
        // ----------------------

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
      if (viewerRef.current) {
        const v = viewerRef.current;
        viewerRef.current = null;
        v.dispose().catch((err: any) => {
          if (
            err?.name !== "NotFoundError" &&
            !err?.message?.includes("removeChild")
          ) {
            console.warn("[3DGS] Dispose error:", err);
          }
        });
      }
    };
  }, [url, fileName]);

  return (
    <div className="w-full h-full relative group">
      <div
        ref={containerRef}
        className={`w-full h-full ${className} cursor-default`}
        onPointerDown={(e) => e.stopPropagation()}
      />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white z-10 pointer-events-none">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading 3D Scene...</span>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-red-400 z-10 p-4 text-center">
          <Box className="w-8 h-8 mb-2" />
          <p className="text-sm font-mono">{error}</p>
        </div>
      )}

      {!isLoading && !error && (
        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/40 backdrop-blur-sm rounded text-[10px] text-white/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none select-none">
          Left Click: Rotate • Right Click: Pan • Scroll: Zoom
        </div>
      )}
    </div>
  );
};
