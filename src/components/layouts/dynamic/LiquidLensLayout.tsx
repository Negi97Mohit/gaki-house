import React, { useRef, useMemo, useState, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { LiquidShaderMaterial } from "@/lib/webgl/shaders/liquidShader";
import { useTexture, Html, ScrollControls, useScroll } from "@react-three/drei";
import { CanvasLayoutState, CanvasSectionState } from "@/types/caption";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { Plus, Trash2, Type, MousePointer2 } from "lucide-react";

// --- 1. The Liquid Shader Plane (Now accepts Custom Background) ---
const LiquidPlane = ({ customBackground }: { customBackground?: string }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport, mouse } = useThree();

  // Use the User's image if provided, otherwise the default "Mercury" noise
  const textureUrl =
    customBackground ||
    "https://images.unsplash.com/photo-1595113316349-9fa4eb24f884?auto=format&fit=crop&w=1600&q=80";

  // useTexture will suspend while loading
  const texture = useTexture(textureUrl);

  const materialArgs = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: LiquidShaderMaterial.vertexShader,
      fragmentShader: LiquidShaderMaterial.fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uResolution: {
          value: new THREE.Vector2(viewport.width, viewport.height),
        },
        uTexture: { value: texture },
        uIntensity: { value: 0.2 },
      },
      transparent: true,
      opacity: 0.5,
    });
  }, [texture, viewport]);

  useFrame((state) => {
    if (meshRef.current) {
      const uniforms = (meshRef.current.material as THREE.ShaderMaterial)
        .uniforms;
      // Mouse interaction
      uniforms.uMouse.value.lerp(
        new THREE.Vector2(mouse.x * 0.5 + 0.5, mouse.y * 0.5 + 0.5),
        0.05
      );
      // Gentle flow animation
      uniforms.uTime.value = state.clock.getElapsedTime() * 0.15;
    }
  });

  return (
    <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1, 64, 64]} />
      <primitive object={materialArgs} attach="material" />
    </mesh>
  );
};

// --- 2. The Grid Item ---
const LiquidItem = ({ section, index, onRemove, ...props }: any) => {
  return (
    <div className="group relative w-[400px] h-[300px] select-none">
      {/* Card Container */}
      <div className="relative z-10 w-full h-full bg-white shadow-lg rounded-sm overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ring-1 ring-black/5">
        {/* Remove Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute -top-3 -right-3 z-50 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:scale-110 transition-all shadow-md cursor-pointer pointer-events-auto"
          title="Remove Item"
        >
          <Trash2 className="w-3 h-3" />
        </button>

        {/* Grid Content */}
        <div className="w-full h-full p-2 bg-white">
          <div className="w-full h-full overflow-hidden relative z-0 bg-gray-50">
            <GridSectionWrapper
              section={section}
              templateSection={{ id: section.id, name: "Fluid Node" }}
              isHovered={false}
              {...props}
            />
          </div>
        </div>
      </div>

      {/* Floating Label */}
      <div className="absolute -bottom-8 left-0 w-full flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
        <span className="text-[10px] font-mono text-black font-bold">
          0{index + 1}
        </span>
        <div className="h-px bg-black/20 flex-1" />
        <span className="text-[9px] font-mono text-black/50 tracking-widest uppercase">
          {section.id.split("-")[1] || "NODE"}
        </span>
      </div>
    </div>
  );
};

// --- 3. The Layout Logic ---
const FloatingGridContent = ({
  sections,
  wrapperProps,
  onRemove,
  onAdd,
}: {
  sections: CanvasSectionState[];
  wrapperProps: any;
  onRemove: (id: string) => void;
  onAdd: () => void;
}) => {
  return (
    // Scale down the whole group so it fits nicely
    <group scale={0.85}>
      {sections.map((section, i) => {
        const totalCols = Math.min(sections.length, 3);

        // DYNAMIC CENTERING LOGIC
        // If we have fewer than 3 items, shift them to center
        const col = i % 3;
        const row = Math.floor(i / 3);

        // Standard grid spacing
        let x = (col - 1) * 5.0;

        // Correction for 1 or 2 items
        if (sections.length === 1) x = 0;
        if (sections.length === 2) x = i === 0 ? -2.5 : 2.5;

        const y = -(row * 4.0) + 2.0;

        return (
          <Html
            key={section.id}
            transform
            position={[x, y, 0]}
            style={{ pointerEvents: "none" }}
          >
            <div className="pointer-events-auto">
              <LiquidItem
                section={section}
                index={i}
                onRemove={() => onRemove(section.id)}
                {...wrapperProps}
              />
            </div>
          </Html>
        );
      })}

      {/* Add Button - Centered below the last row */}
      <Html
        transform
        position={[0, -(Math.ceil(sections.length / 3) * 4.0) + 1.0, 0]}
        style={{ pointerEvents: "auto" }}
      >
        <button
          onClick={onAdd}
          className="flex flex-col items-center gap-3 group cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
        >
          <div className="w-14 h-14 border-2 border-dashed border-black/20 rounded-full flex items-center justify-center group-hover:border-black group-hover:bg-black group-hover:text-white transition-all bg-white/50">
            <Plus className="w-6 h-6" />
          </div>
          <span className="text-[9px] font-mono tracking-[0.2em] text-black/60 uppercase">
            Add Node
          </span>
        </button>
      </Html>
    </group>
  );
};

// --- 4. Main Component ---
interface LiquidLensProps {
  sections: CanvasSectionState[];
  layout?: CanvasLayoutState;
  onLayoutUpdate?: (layout: CanvasLayoutState) => void;
  // This prop comes from CanvasGridLayout -> commonProps
  backgroundImageUrl?: string;
  [key: string]: any;
}

export const LiquidLensLayout: React.FC<LiquidLensProps> = ({
  sections,
  layout,
  onLayoutUpdate,
  backgroundImageUrl, // <--- Receive the background image
  ...wrapperProps
}) => {
  const [mainTitle, setMainTitle] = useState("FLUID");

  const handleAddSection = () => {
    if (!layout || !onLayoutUpdate) return;
    const newSection: CanvasSectionState = {
      id: `liq-${Date.now()}`,
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
      {/* 1. DOM Title Layer */}
      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center z-0">
        <div className="relative group pointer-events-auto">
          <input
            value={mainTitle}
            onChange={(e) => setMainTitle(e.target.value)}
            className="text-[25vw] font-black tracking-tighter text-black/5 uppercase bg-transparent border-none text-center focus:outline-none w-full min-w-[50vw] transition-colors focus:text-black/10"
            style={{ fontFamily: "Inter, sans-serif" }}
          />
          <Type className="absolute top-1/2 -right-12 -translate-y-1/2 w-6 h-6 text-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* 2. R3F Canvas Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <Canvas
          camera={{ position: [0, 0, 16], fov: 35 }} // Zoomed out for better view
          eventSource={document.getElementById("root") || undefined}
          eventPrefix="client"
        >
          <color attach="background" args={["transparent"]} />
          <ambientLight intensity={0.8} />

          <Suspense fallback={null}>
            {/* Pass the background image URL to the plane */}
            <LiquidPlane customBackground={backgroundImageUrl} />
          </Suspense>

          <ScrollControls
            pages={Math.max(1.5, sections.length * 0.4)}
            damping={0.2}
          >
            <FloatingGridContent
              sections={sections}
              wrapperProps={wrapperProps}
              onRemove={handleRemoveSection}
              onAdd={handleAddSection}
            />
          </ScrollControls>
        </Canvas>
      </div>

      {/* UI Overlay / Instructions */}
      <div className="absolute bottom-8 left-8 flex flex-col gap-1 pointer-events-none z-20">
        <div className="text-black/30 text-[10px] font-mono">
          /// SYSTEM: FLUID_DYNAMICS
        </div>
        <div className="flex items-center gap-2 text-black/50 text-xs font-bold animate-pulse">
          <MousePointer2 className="w-3 h-3" />
          <span>SCROLL TO EXPLORE</span>
        </div>
      </div>
    </div>
  );
};
