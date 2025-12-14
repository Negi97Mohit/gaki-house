import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  MeshTransmissionMaterial,
  Environment,
  Float,
  ScrollControls,
  useScroll,
  Html,
} from "@react-three/drei";
import * as THREE from "three";
import { CanvasLayoutState } from "@/types/caption";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { Plus, Trash2 } from "lucide-react";

const GlassBlock = ({ section, index, total, wrapperProps, onRemove }: any) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const scroll = useScroll();

  useFrame((state) => {
    if (!meshRef.current) return;
    const ySpacing = 3.8;
    const totalHeight = total * ySpacing;
    const offset = scroll.offset * totalHeight;
    const startY = totalHeight / 2 - index * ySpacing;

    meshRef.current.position.y = startY + offset;
    meshRef.current.rotation.x =
      Math.sin(state.clock.elapsedTime * 0.3 + index) * 0.05;
    meshRef.current.rotation.y =
      Math.cos(state.clock.elapsedTime * 0.2 + index) * 0.08;
  });

  return (
    <group>
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
        <mesh ref={meshRef} position={[0, 0, 0]}>
          <boxGeometry args={[4.2, 3.0, 0.4]} />
          {/* High-End Glass Material */}
          <MeshTransmissionMaterial
            backside={false}
            samples={8}
            resolution={512}
            transmission={0.95}
            roughness={0.05}
            thickness={0.8}
            ior={1.45}
            chromaticAberration={0.04}
            anisotropy={0.1}
            distortion={0.1}
            distortionScale={0.3}
            temporalDistortion={0.1}
            background={new THREE.Color("#f0f0f0")}
          />

          <Html
            transform
            occlude="blending"
            distanceFactor={2.5}
            position={[0, 0, -0.22]}
            style={{ width: "420px", height: "300px", pointerEvents: "none" }}
          >
            <div className="w-full h-full bg-white p-1 flex flex-col items-center justify-center border border-gray-100 shadow-sm">
              <div className="relative w-full h-full bg-gray-50 pointer-events-auto overflow-hidden group">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(section.id);
                  }}
                  className="absolute top-3 right-3 z-50 p-2 bg-white/80 rounded-full shadow-sm hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <GridSectionWrapper
                  section={section}
                  templateSection={{ id: section.id, name: "Prism" }}
                  isHovered={false}
                  {...wrapperProps}
                />
              </div>
            </div>
          </Html>
        </mesh>
      </Float>
    </group>
  );
};

export const GlassPrismLayout: React.FC<any> = ({
  sections,
  layout,
  onLayoutUpdate,
  ...wrapperProps
}) => {
  const [title, setTitle] = useState("PRISM");

  const handleAdd = () => {
    if (!layout || !onLayoutUpdate) return;
    onLayoutUpdate({
      ...layout,
      sections: [
        ...layout.sections,
        {
          id: `glass-${Date.now()}`,
          content: { type: "empty" },
          style: { background: "#fff" },
        },
      ],
    });
  };

  const handleRemove = (id: string) => {
    if (!layout || !onLayoutUpdate) return;
    onLayoutUpdate({
      ...layout,
      sections: layout.sections.filter((s: any) => s.id !== id),
    });
  };

  return (
    <div className="w-full h-screen bg-[#f0f0f0] relative">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
        <h1 className="text-[25vw] font-serif font-black text-black tracking-tighter">
          {title}
        </h1>
      </div>

      {/* Title Input */}
      <div className="absolute top-10 w-full text-center z-20">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-sm font-mono tracking-[0.5em] text-black/40 bg-transparent border-none text-center focus:outline-none uppercase"
        />
      </div>

      <Canvas camera={{ position: [0, 0, 7], fov: 45 }} dpr={[1, 2]}>
        <color attach="background" args={["#f0f0f0"]} />
        <Environment preset="city" /> {/* Essential for reflections */}
        <ScrollControls
          pages={Math.max(2, sections.length * 0.7)}
          damping={0.2}
        >
          <group position={[0, 0, 0]}>
            {sections.map((section: any, i: number) => (
              <GlassBlock
                key={section.id}
                section={section}
                index={i}
                total={sections.length}
                wrapperProps={wrapperProps}
                onRemove={handleRemove}
              />
            ))}
            {/* Add Button */}
            <Html
              position={[
                0,
                -(sections.length * 3.8) + (sections.length * 3.8) / 2 - 2,
                0,
              ]}
              center
            >
              <button
                onClick={handleAdd}
                className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform text-black/50 hover:text-black"
              >
                <Plus className="w-5 h-5" />
              </button>
            </Html>
          </group>
        </ScrollControls>
      </Canvas>
    </div>
  );
};
