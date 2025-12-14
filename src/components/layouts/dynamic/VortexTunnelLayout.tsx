import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ScrollControls, useScroll, Html, Stars } from "@react-three/drei";
import * as THREE from "three";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { Plus, Trash2, Zap } from "lucide-react";

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
              <div className="w-full h-full bg-black/80 border-2 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.3)] rounded-lg overflow-hidden group relative hover:border-cyan-400">
                <div className="absolute top-2 right-2 z-50">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(section.id);
                    }}
                    className="p-1 bg-cyan-900/50 text-cyan-200 hover:bg-cyan-500 hover:text-black rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="h-full opacity-80 group-hover:opacity-100 transition-opacity">
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
            className="w-32 h-32 rounded-full border-4 border-dashed border-cyan-500 flex flex-col items-center justify-center text-cyan-500 hover:bg-cyan-500/20 transition-all"
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
  const handleAdd = () =>
    onLayoutUpdate &&
    onLayoutUpdate({
      ...layout,
      sections: [
        ...layout.sections,
        {
          id: `vortex-${Date.now()}`,
          content: { type: "empty" },
          style: { background: "#000" },
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
    <div className="w-full h-screen bg-black relative">
      <div className="absolute top-5 right-5 text-right z-20 pointer-events-none">
        <div className="text-cyan-400 font-mono text-xl tracking-widest flex items-center justify-end gap-2">
          HYPERLOOP <Zap className="w-4 h-4" />
        </div>
        <div className="text-cyan-900 text-xs">VELOCITY: INFINITE</div>
      </div>
      <Canvas
        camera={{ position: [0, 0, 0], fov: 70 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={["#000508"]} />
        <fog attach="fog" args={["#000508", 5, 40]} />
        <Stars radius={100} count={2000} factor={4} fade speed={2} />
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
