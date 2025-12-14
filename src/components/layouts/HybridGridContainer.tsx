// src/components/layouts/HybridGridContainer.tsx
import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { HybridGridScene } from "./HybridGridScene";
import { useGridMotion } from "@/hooks/useGridMotion";

interface HybridGridContainerProps {
  children: React.ReactNode;
  className?: string;
  effectType?: "vogue" | "liquid" | "origami" | "void";
  backgroundColor?: string;
}

export const HybridGridContainer: React.FC<HybridGridContainerProps> = ({
  children,
  className,
  effectType = "liquid",
  backgroundColor = "transparent",
}) => {
  // Initialize motion tracker
  useGridMotion();

  return (
    <div className={`relative w-full h-full min-h-screen ${className}`}>
      {/* 1. WebGL Background Layer (Z-Index 0) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]} // Handle retina screens
        >
          <color
            attach="background"
            args={[
              backgroundColor === "transparent" ? "#000000" : backgroundColor,
            ]}
          />
          <Suspense fallback={null}>
            <HybridGridScene effectType={effectType} />
          </Suspense>
        </Canvas>
      </div>

      {/* 2. Content Layer (Z-Index 10) */}
      {/* We make this relative so it scrolls naturally over the fixed canvas */}
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
};
