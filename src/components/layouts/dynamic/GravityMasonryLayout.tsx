// src/components/layouts/dynamic/GravityMasonryLayout.tsx
import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Physics, useBox, usePlane } from "@react-three/cannon";
import { Html, useCursor } from "@react-three/drei";
import * as THREE from "three";
import { CanvasSectionState } from "@/types/caption";
import { GridSectionWrapper } from "../GridSectionWrapper";

// --- 1. Physical Boundaries (Floor & Walls) ---
const Boundaries = () => {
  // Floor
  usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], position: [0, -4, 0] }));
  // Walls (Invisible glass box)
  usePlane(() => ({ position: [0, 0, -5], rotation: [0, 0, 0] })); // Back
  usePlane(() => ({ position: [0, 0, 5], rotation: [0, -Math.PI, 0] })); // Front
  usePlane(() => ({ position: [-8, 0, 0], rotation: [0, Math.PI / 2, 0] })); // Left
  usePlane(() => ({ position: [8, 0, 0], rotation: [0, -Math.PI / 2, 0] })); // Right
  return null;
};

// --- 2. The Physical Grid Item ---
const PhysicsItem = ({
  section,
  index,
}: {
  section: CanvasSectionState;
  index: number;
}) => {
  const [hovered, setHover] = useState(false);
  useCursor(hovered);

  // Give each box a random starting position high up
  const [ref, api] = useBox(() => ({
    mass: 1,
    position: [
      (Math.random() - 0.5) * 5, // Random X
      10 + index * 2, // Staggered Height
      (Math.random() - 0.5) * 2, // Slight Z randomness
    ],
    rotation: [Math.random() * 0.5, Math.random() * 0.5, Math.random() * 0.5],
    args: [3.2, 2.2, 0.5], // Size of the collider box
  }));

  return (
    <mesh
      ref={ref as any}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
      onClick={() => {
        // "Kick" the box on click
        api.velocity.set(0, 5, 0);
        api.angularVelocity.set(
          (Math.random() - 0.5) * 5,
          (Math.random() - 0.5) * 5,
          0
        );
      }}
    >
      <boxGeometry args={[3.2, 2.2, 0.5]} />
      <meshStandardMaterial
        color="#1a1a1a"
        transparent
        opacity={0.8}
        roughness={0.4}
      />

      {/* Content Portal */}
      <Html
        transform
        occlude
        distanceFactor={3}
        position={[0, 0, 0.26]} // Slightly in front of the box face
        style={{
          width: "320px",
          height: "220px",
          pointerEvents: "none", // Let clicks pass through to the mesh
        }}
      >
        <div className="w-full h-full bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden shadow-xl select-none">
          <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <GridSectionWrapper
            section={section}
            templateSection={{ id: section.id, name: "Physics Item" }}
            isHovered={hovered}
            // Mocks
            fileOverlays={[]}
            textOverlays={[]}
            videoDevices={[]}
            onSectionContentChange={() => {}}
            onSectionDelete={() => {}}
            onGridAssetSelect={() => {}}
            onSectionCameraSettingsChange={() => {}}
          />
        </div>
      </Html>
    </mesh>
  );
};

// --- 3. Main Layout ---
export const GravityMasonryLayout: React.FC<{
  sections: CanvasSectionState[];
}> = ({ sections }) => {
  return (
    <div className="w-full h-screen bg-gradient-to-br from-zinc-900 to-black cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 0, 12], fov: 40 }} shadows>
        <ambientLight intensity={0.5} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.3}
          penumbra={1}
          intensity={1}
          castShadow
        />

        <Physics gravity={[0, -9.81, 0]}>
          <Boundaries />
          {sections.map((section, i) => (
            <PhysicsItem key={section.id} section={section} index={i} />
          ))}
        </Physics>
      </Canvas>

      <div className="absolute top-8 left-8 text-white/30 text-xs font-mono">
        /// GRAVITY_SIM_ENABLED <br />
        /// INTERACTION: CLICK_TO_IMPULSE
      </div>
    </div>
  );
};
