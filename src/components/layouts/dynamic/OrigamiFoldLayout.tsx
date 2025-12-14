import React, { useRef, useMemo, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, useScroll, ScrollControls } from "@react-three/drei";
import * as THREE from "three";
import { CanvasLayoutState, CanvasSectionState } from "@/types/caption";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { Plus, Trash2, Layers } from "lucide-react";

const FoldingRow = ({ y, sections, index, wrapperProps, onRemove }: any) => {
  const groupRef = useRef<THREE.Group>(null);
  const scroll = useScroll();

  useFrame(() => {
    if (!groupRef.current) return;
    // Calculate "unfold" progress: 0 (folded) -> 1 (flat)
    const offset = 1 - scroll.range(index * 0.18, 0.2);
    const targetRotation = offset * (Math.PI / 2.1); // Fold slightly past 90deg

    // Interpolate rotation
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetRotation,
      0.1
    );

    // Push back/fade
    groupRef.current.position.z = THREE.MathUtils.lerp(
      groupRef.current.position.z,
      offset * -8,
      0.1
    );

    // Opacity fade for distance
    const scale = THREE.MathUtils.lerp(1, 0.9, offset);
    groupRef.current.scale.setScalar(scale);
  });

  return (
    <group ref={groupRef} position={[0, y, 0]}>
      {sections.map((section: any, i: number) => (
        <group key={section.id} position={[(i - 1) * 4.5, 0, 0]}>
          <Html
            transform
            occlude
            distanceFactor={3}
            style={{ width: "400px", height: "280px", pointerEvents: "auto" }}
          >
            <div className="relative w-full h-full bg-[#1a1a1a] border-t border-white/20 shadow-2xl rounded-sm overflow-hidden group hover:border-t-white/50 transition-colors">
              {/* Hinge Visual */}
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent z-50" />

              {/* Remove Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(section.id);
                }}
                className="absolute top-2 right-2 z-50 p-1 bg-black/50 text-white/30 rounded hover:text-red-400 hover:bg-black transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Content */}
              <div className="w-full h-full p-3">
                <div className="w-full h-full bg-black relative rounded overflow-hidden">
                  <GridSectionWrapper
                    section={section}
                    templateSection={{ id: section.id, name: "Fold" }}
                    isHovered={false}
                    {...wrapperProps}
                  />
                </div>
              </div>

              {/* Label */}
              <div className="absolute bottom-2 left-3 text-[9px] font-mono text-white/20 tracking-widest uppercase group-hover:text-white/50 transition-colors">
                FOLD_{index}.{i} // {section.id.slice(0, 4)}
              </div>
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
};

interface OrigamiFoldProps {
  sections: CanvasSectionState[];
  layout?: CanvasLayoutState;
  onLayoutUpdate?: (layout: CanvasLayoutState) => void;
  [key: string]: any;
}

export const OrigamiFoldLayout: React.FC<OrigamiFoldProps> = ({
  sections,
  layout,
  onLayoutUpdate,
  ...wrapperProps
}) => {
  const [mainTitle, setMainTitle] = useState("ARCHIVE");

  const handleAddSection = () => {
    if (!layout || !onLayoutUpdate) return;
    onLayoutUpdate({
      ...layout,
      sections: [
        ...layout.sections,
        {
          id: `fold-${Date.now()}`,
          content: { type: "empty" },
          style: { background: "#1a1a1a" },
        },
      ],
    });
  };

  const handleRemoveSection = (id: string) => {
    if (!layout || !onLayoutUpdate) return;
    onLayoutUpdate({
      ...layout,
      sections: layout.sections.filter((s) => s.id !== id),
    });
  };

  const rows = useMemo(() => {
    const result = [];
    for (let i = 0; i < sections.length; i += 3)
      result.push(sections.slice(i, i + 3));
    return result;
  }, [sections]);

  return (
    <div className="w-full h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Title */}
      <div className="absolute top-8 left-8 z-10">
        <div className="flex items-center gap-2 text-white/20 mb-2">
          <Layers className="w-4 h-4" />
          <span className="text-[10px] tracking-[0.3em]">KINETIC_VIEW</span>
        </div>
        <input
          value={mainTitle}
          onChange={(e) => setMainTitle(e.target.value)}
          className="text-5xl font-black text-white/10 bg-transparent border-none focus:outline-none focus:text-white/20 uppercase tracking-tighter w-full"
        />
      </div>

      <Canvas camera={{ position: [0, 0, 12], fov: 40 }}>
        <color attach="background" args={["#0a0a0a"]} />
        <ambientLight intensity={0.2} />
        <spotLight
          position={[10, 20, 10]}
          angle={0.3}
          penumbra={1}
          intensity={1}
          color="#444"
        />

        <ScrollControls pages={Math.max(2, rows.length * 0.6)} damping={0.2}>
          <group position={[0, 3, 0]}>
            {rows.map((rowSections, i) => (
              <FoldingRow
                key={i}
                index={i}
                sections={rowSections}
                y={-i * 3.5}
                wrapperProps={wrapperProps}
                onRemove={handleRemoveSection}
              />
            ))}
            {/* Add Button */}
            <Html position={[0, -(rows.length * 3.5), 0]} transform>
              <button
                onClick={handleAddSection}
                className="flex items-center gap-2 px-6 py-3 border border-white/10 rounded-full hover:bg-white/5 hover:border-white/30 text-white/30 hover:text-white transition-all group"
              >
                <Plus className="w-4 h-4" />
                <span className="text-xs tracking-widest uppercase">
                  Unfold New
                </span>
              </button>
            </Html>
          </group>
        </ScrollControls>
      </Canvas>
    </div>
  );
};
