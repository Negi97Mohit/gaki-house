import React, { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, ScrollControls, useScroll } from "@react-three/drei";
import * as THREE from "three";
import { BrutalistGlitchMaterial } from "@/lib/webgl/shaders/BrutalistGlitchShader";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { Plus, Trash2, AlertTriangle, Type } from "lucide-react";

const GlitchCell = ({ section, index, wrapperProps, onRemove }: any) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);
  const scroll = useScroll();
  const material = useMemo(() => new BrutalistGlitchMaterial(), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const col = index % 3;
    const row = Math.floor(index / 3);
    const yOffset = scroll.offset * 12;

    // Position
    meshRef.current.position.set(
      (col - 1) * 3.6,
      -(row * 3.6) + 3 + yOffset,
      0
    );

    // Shader Updates
    material.uTime = state.clock.elapsedTime;
    material.uHover = THREE.MathUtils.lerp(
      material.uHover,
      hovered ? 1.0 : 0.0,
      0.1
    );
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        scale={[3.2, 2.8, 1]}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
      >
        <planeGeometry args={[1, 1, 16, 16]} />
        {/* Pass a light-friendly color if the shader supports it, or use default */}
        <primitive object={material} attach="material" />
      </mesh>

      {/* Interactive Content */}
      <Html
        position={[
          ((index % 3) - 1) * 3.6,
          -(Math.floor(index / 3) * 3.6) + 3,
          0.1,
        ]}
        transform
        occlude
        distanceFactor={3}
        style={{ width: "320px", height: "280px", pointerEvents: "auto" }}
      >
        <div
          className={`w-full h-full border-2 ${hovered ? "border-red-600" : "border-black/10"
            } bg-white transition-colors relative group`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(section.id);
            }}
            className="absolute top-0 right-0 w-8 h-8 bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-auto cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <div className="w-full h-full overflow-hidden">
            <GridSectionWrapper
              section={section}
              templateSection={{ id: section.id, name: "ERR" }}
              isHovered={hovered}
              {...wrapperProps}
            />
          </div>
        </div>
      </Html>

      {/* Label */}
      <Html
        position={[
          ((index % 3) - 1) * 3.6 - 1.5,
          -(Math.floor(index / 3) * 3.6) + 1.5,
          0.1,
        ]}
        style={{ pointerEvents: "none" }}
      >
        <div className="bg-black text-white font-mono text-[9px] px-1 font-bold">
          ERR_0{index}
        </div>
      </Html>
    </group>
  );
};

export const BrutalistGlitchLayout: React.FC<any> = ({
  sections,
  layout,
  onLayoutUpdate,
  ...wrapperProps
}) => {
  const [mainTitle, setMainTitle] = useState("SYSTEM FAILURE");

  const handleAdd = () =>
    onLayoutUpdate &&
    onLayoutUpdate({
      ...layout,
      sections: [
        ...layout.sections,
        {
          id: `glitch-${Date.now()}`,
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
    <div className="w-full h-screen bg-white text-black overflow-hidden relative">
      {/* Header */}
      <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-start z-10 border-b border-black/10 pointer-events-auto">
        <div className="relative group">
          <input
            value={mainTitle}
            onChange={(e) => setMainTitle(e.target.value)}
            className="text-6xl font-black uppercase tracking-tighter leading-none bg-transparent border-none focus:outline-none w-full max-w-[80vw] text-black"
            style={{ fontFamily: 'Inter, sans-serif' }}
          />
          <Type className="absolute top-1/2 -right-8 -translate-y-1/2 w-6 h-6 text-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="text-right font-mono text-xs text-red-600 flex flex-col items-end pt-2">
          <AlertTriangle className="w-6 h-6 mb-2" />
          <span>CRITICAL_ERROR</span>
        </div>
      </div>

      <Canvas camera={{ position: [0, 0, 9], fov: 50 }}>
        <color attach="background" args={["#ffffff"]} />
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 10, 5]} intensity={1} />

        <ScrollControls
          pages={Math.ceil(sections.length / 3) + 1}
          damping={0.1}
        >
          <group>
            {sections.map((section: any, i: number) => (
              <GlitchCell
                key={section.id}
                section={section}
                index={i}
                wrapperProps={wrapperProps}
                onRemove={handleRemove}
              />
            ))}
          </group>
          <Html
            position={[0, -Math.ceil(sections.length / 3) * 3.6 + 1, 0]}
            center
            style={{ pointerEvents: 'auto' }}
          >
            <button
              onClick={handleAdd}
              className="group flex flex-col items-center gap-2"
            >
              <div className="bg-red-600 text-white font-mono font-bold px-6 py-3 hover:bg-black transition-colors shadow-lg cursor-pointer">
                INIT_NEW_BLOCK
              </div>
              <Plus className="w-4 h-4 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </Html>
        </ScrollControls>
      </Canvas>
    </div>
  );
};
