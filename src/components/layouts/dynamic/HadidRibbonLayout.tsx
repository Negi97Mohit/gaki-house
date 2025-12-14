import React, { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ScrollControls,
  useScroll,
  Html,
  Float,
  PerspectiveCamera,
} from "@react-three/drei";
import * as THREE from "three";
import { CanvasLayoutState, CanvasSectionState } from "@/types/caption";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { Plus, Trash2, Type, Orbit } from "lucide-react";

// --- 1. Generative Curve Logic ---
const createCurve = (count: number) => {
  const points = [];
  const segments = Math.max(count, 5) * 2;

  for (let i = 0; i <= segments; i++) {
    const t = i * 0.8;
    points.push(
      new THREE.Vector3(
        Math.sin(t * 0.8) * 12,
        -i * 4,
        Math.cos(t * 0.5) * 8 + Math.sin(t * 2) * 2
      )
    );
  }
  return new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.2);
};

// --- 2. The Ribbon Mesh (Chrome/Silver Style) ---
const RibbonTrack = ({ curve }: { curve: THREE.CatmullRomCurve3 }) => {
  return (
    <mesh>
      <tubeGeometry args={[curve, 200, 0.15, 8, false]} />
      <meshStandardMaterial
        color="#e0e0e0"
        roughness={0.2}
        metalness={0.8}
        emissive="#ffffff"
        emissiveIntensity={0.2}
      />
    </mesh>
  );
};

// --- 3. The Floating Card Node (White Glass) ---
const RibbonItem = ({ section, index, onRemove, ...props }: any) => {
  return (
    <div className="group relative w-[400px] h-[280px] select-none perspective-1000">
      {/* Glass Card Container - WHITE THEME */}
      <div className="relative z-10 w-full h-full bg-white/80 backdrop-blur-xl border border-white/60 rounded-xl overflow-hidden transition-all duration-500 hover:border-black/20 hover:scale-105 hover:bg-white shadow-[0_10px_40px_rgba(0,0,0,0.1)]">
        {/* Header Bar */}
        <div className="h-8 flex items-center justify-between px-3 border-b border-black/5 bg-black/5">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
            <span className="text-[10px] font-mono text-black/60 tracking-widest uppercase">
              NODE_{section.id.slice(0, 4)}
            </span>
          </div>

          {/* Remove Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="w-5 h-5 flex items-center justify-center text-black/20 hover:text-red-500 transition-colors pointer-events-auto cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>

        {/* Grid Content Area - Force Content Visibility */}
        <div className="relative w-full h-[calc(100%-32px)] p-1">
          <div className="w-full h-full bg-gray-50 rounded-lg overflow-hidden relative">
            <GridSectionWrapper
              section={section}
              templateSection={{ id: section.id, name: "Parametric Node" }}
              isHovered={false}
              {...props}
            />
          </div>
        </div>
      </div>

      {/* Connecting Line (Visual) */}
      <div className="absolute top-1/2 -left-8 w-8 h-[1px] bg-black/20" />
    </div>
  );
};

// --- 4. The Scene Controller ---
const RibbonScene = ({ sections, wrapperProps, onRemove, onAdd }: any) => {
  const scroll = useScroll();
  const curve = useMemo(
    () => createCurve(Math.max(sections.length, 3)),
    [sections.length]
  );
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  useFrame((state) => {
    const t = scroll.offset * 0.9;
    const point = curve.getPoint(t);
    const lookAtPoint = curve.getPoint(Math.min(t + 0.05, 1));
    const tangent = curve.getTangent(t);

    if (cameraRef.current) {
      // Offset camera to see track clearly
      cameraRef.current.position.lerp(
        new THREE.Vector3(point.x, point.y + 2, point.z + 14),
        0.1
      );
      cameraRef.current.lookAt(lookAtPoint);
      cameraRef.current.rotation.z = -tangent.x * 0.15;
    }
  });

  return (
    <group>
      <PerspectiveCamera
        makeDefault
        ref={cameraRef}
        fov={45}
        near={0.1}
        far={1000}
      />

      <RibbonTrack curve={curve} />

      {sections.map((section: any, i: number) => {
        const t = (i / (sections.length + 1)) * 0.9 + 0.05;
        const point = curve.getPoint(t);
        const sideOffset = i % 2 === 0 ? 3.5 : -3.5;

        return (
          <group
            key={section.id}
            position={[point.x + sideOffset, point.y, point.z]}
          >
            <Float speed={2} rotationIntensity={0.1} floatIntensity={0.5}>
              <Html
                transform
                occlude
                distanceFactor={10}
                style={{ pointerEvents: "none" }}
              >
                <div className="pointer-events-auto transform -translate-x-1/2 -translate-y-1/2">
                  <RibbonItem
                    section={section}
                    index={i}
                    onRemove={() => onRemove(section.id)}
                    {...wrapperProps}
                  />
                </div>
              </Html>
            </Float>

            {/* Connector Line */}
            <mesh
              position={[-sideOffset / 2, 0, 0]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <cylinderGeometry args={[0.01, 0.01, Math.abs(sideOffset), 4]} />
              <meshBasicMaterial color="#000" transparent opacity={0.2} />
            </mesh>
          </group>
        );
      })}

      {/* Add Button */}
      {(() => {
        const t = 0.95;
        const point = curve.getPoint(t);
        return (
          <Html position={[point.x, point.y, point.z]} transform>
            <button
              onClick={onAdd}
              className="flex flex-col items-center gap-4 group opacity-60 hover:opacity-100 transition-opacity cursor-pointer pointer-events-auto"
            >
              <div className="w-16 h-16 rounded-full border border-dashed border-black/20 flex items-center justify-center bg-white/80 backdrop-blur hover:bg-black hover:text-white transition-all shadow-lg">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono tracking-widest text-black/40 group-hover:text-black uppercase">
                Extend
              </span>
            </button>
          </Html>
        );
      })()}
    </group>
  );
};

// --- 5. Main Layout Export ---
interface HadidRibbonProps {
  sections: CanvasSectionState[];
  layout?: CanvasLayoutState;
  onLayoutUpdate?: (layout: CanvasLayoutState) => void;
  [key: string]: any;
}

export const HadidRibbonLayout: React.FC<HadidRibbonProps> = ({
  sections,
  layout,
  onLayoutUpdate,
  ...wrapperProps
}) => {
  const [mainTitle, setMainTitle] = useState("PARAMETRIC");

  const handleAddSection = () => {
    if (!layout || !onLayoutUpdate) return;
    const newSection: CanvasSectionState = {
      id: `node-${Date.now()}`,
      content: { type: "empty" },
      style: { background: "#ffffff" },
    };
    onLayoutUpdate({ ...layout, sections: [...layout.sections, newSection] });
  };

  const handleRemoveSection = (sectionId: string) => {
    if (!layout || !onLayoutUpdate) return;
    if (layout.sections.length <= 1) return;
    onLayoutUpdate({
      ...layout,
      sections: layout.sections.filter((s) => s.id !== sectionId),
    });
  };

  return (
    <div className="w-full h-screen bg-[#fafafa] relative overflow-hidden">
      {/* 1. HUD */}
      <div className="absolute top-8 left-8 z-20 flex flex-col pointer-events-auto">
        <div className="flex items-center gap-2 text-black/40 mb-1">
          <Orbit className="w-3 h-3 animate-spin-slow" />
          <span className="text-[9px] font-mono tracking-widest">
            ARCHITECTURAL_VIEW
          </span>
        </div>
        <div className="relative group">
          <input
            value={mainTitle}
            onChange={(e) => setMainTitle(e.target.value)}
            className="text-4xl font-bold tracking-tight text-black/90 bg-transparent border-none focus:outline-none w-64 uppercase font-sans"
          />
          <Type className="absolute top-1/2 -right-6 -translate-y-1/2 w-4 h-4 text-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* 2. 3D Scene */}
      <div className="absolute inset-0 z-10">
        <Canvas gl={{ antialias: true }} shadows>
          <color attach="background" args={["#fafafa"]} />
          <fog attach="fog" args={["#fafafa", 10, 50]} />

          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
          <pointLight
            position={[-10, -10, -10]}
            intensity={0.5}
            color="#a0a0a0"
          />

          <ScrollControls
            pages={Math.max(3, sections.length * 0.6)}
            damping={0.2}
          >
            <RibbonScene
              sections={sections}
              wrapperProps={wrapperProps}
              onRemove={handleRemoveSection}
              onAdd={handleAddSection}
            />
          </ScrollControls>
        </Canvas>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 right-8 text-right pointer-events-none z-20">
        <div className="text-black/30 text-[10px] font-mono">
          SPLINE_INTERPOLATION
        </div>
        <div className="w-32 h-[1px] bg-black/10 mt-2" />
      </div>
    </div>
  );
};
