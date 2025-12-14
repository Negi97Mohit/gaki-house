import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ScrollControls, useScroll, Html, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { Plus, Trash2, Zap, Type } from "lucide-react";

const TunnelContent = ({ sections, wrapperProps, onRemove, onAdd }: any) => {
  const scroll = useScroll();
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const totalLength = (sections.length + 1) * 6; // Spacing
    const currentZ = scroll.offset * (totalLength - 10);
    state.camera.position.z = currentZ;
    state.camera.rotation.z = currentZ * 0.02; // Rotate camera as we fly
  });

  return (
    <group ref={groupRef}>
      {sections.map((section: any, i: number) => {
        const angle = i * (Math.PI / 2.5);
        const radius = 6;
        return (
          <group
            key={section.id}
            position={[
              Math.cos(angle) * radius,
              Math.sin(angle) * radius,
              i * 6,
            ]}
            rotation={[0, 0, angle + Math.PI / 2]}
          >
            <Html
              transform
              occlude
              distanceFactor={5}
              style={{ width: "400px", height: "280px", pointerEvents: "auto" }}
            >
              <div className="w-full h-full bg-white/90 border-2 border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.1)] rounded-lg overflow-hidden group relative hover:border-cyan-400 transition-all">
                <div className="absolute top-2 right-2 z-50">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(section.id);
                    }}
                    className="p-1 bg-white text-cyan-500 hover:bg-cyan-500 hover:text-white rounded transition-colors shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="h-full opacity-100 group-hover:opacity-100 transition-opacity">
                  <GridSectionWrapper
                    section={section}
                    templateSection={{ id: section.id, name: "Vortex" }}
                    isHovered={false}
                    {...wrapperProps}
                  />
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
              </div>
            </Html>
          </group>
        );
      })}

      {/* Portal at end */}
      <group position={[0, 0, sections.length * 6 + 10]}>
        <Html transform>
          <button
            onClick={onAdd}
            className="w-32 h-32 rounded-full border-4 border-dashed border-cyan-500/30 flex flex-col items-center justify-center text-cyan-600 hover:bg-cyan-500/10 transition-all bg-white/50 backdrop-blur-sm cursor-pointer pointer-events-auto"
          >
            <Plus className="w-10 h-10 mb-2" />
            <span className="text-xs font-mono">EXTEND</span>
          </button>
        </Html>
      </group>
    </group>
  );
};

export const VortexTunnelLayout: React.FC<any> = ({
  sections,
  layout,
  onLayoutUpdate,
  ...wrapperProps
}) => {
  const [mainTitle, setMainTitle] = useState("HYPERLOOP");

  const handleAdd = () =>
    onLayoutUpdate &&
    onLayoutUpdate({
      ...layout,
      sections: [
        ...layout.sections,
        {
          id: `vortex-${Date.now()}`,
          content: { type: "empty" },
          style: { background: "#ffffff" },
        },
      ],
    });
  const handleRemove = (id: string) =>
    onLayoutUpdate &&
    onLayoutUpdate({
      ...layout,
      sections: layout.sections.filter((s: any) => s.id !== id),
    });

  return (
    <div className="w-full h-screen bg-white relative">
      <div className="absolute top-5 right-5 text-right z-20 pointer-events-auto flex flex-col items-end">
        <div className="text-cyan-600 font-mono text-xl tracking-widest flex items-center justify-end gap-2 group relative">
          <input
            value={mainTitle}
            onChange={(e) => setMainTitle(e.target.value)}
            className="bg-transparent border-none text-right focus:outline-none w-48 text-cyan-600"
          />
          <Type className="h-4 w-4 opacity-0 group-hover:opacity-100 absolute -right-6 top-1/2 -translate-y-1/2 text-cyan-300" />
          <Zap className="w-4 h-4" />
        </div>
        <div className="text-cyan-900/50 text-xs">VELOCITY: INFINITE</div>
      </div>
      <Canvas
        camera={{ position: [0, 0, 0], fov: 70 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={["#ffffff"]} />
        <fog attach="fog" args={["#ffffff", 5, 40]} />
        {/* Dark dust particles instead of white starts */}
        <Sparkles count={2000} scale={100} size={4} speed={2} opacity={0.5} color="#000000" />

        <ScrollControls
          pages={Math.max(3, sections.length * 0.5)}
          damping={0.2}
        >
          <TunnelContent
            sections={sections}
            wrapperProps={wrapperProps}
            onRemove={handleRemove}
            onAdd={handleAdd}
          />
        </ScrollControls>
      </Canvas>
    </div>
  );
};
