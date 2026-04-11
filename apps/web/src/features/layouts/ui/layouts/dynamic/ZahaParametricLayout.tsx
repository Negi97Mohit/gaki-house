import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment } from "@react-three/drei";
import * as THREE from "three";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { CanvasLayoutTemplate } from "@caption-cam/core/types/layout";
import { CanvasLayoutState, CanvasSectionState } from "@caption-cam/core/types/caption";
import { cn } from "@caption-cam/core/lib/utils";
import { EditableText } from "./core/EditableText";
import { Panel } from "./core/Panel";
import { DynamicAddButton } from "./core/LayoutButtons";
import { DynamicLayoutWrapper } from "./core/DynamicLayoutWrapper";

interface ZahaParametricLayoutProps {
  sections: CanvasSectionState[];
  layout: CanvasLayoutState;
  template: CanvasLayoutTemplate;
  containerRef: React.RefObject<HTMLDivElement>;
  onLayoutUpdate?: (layout: CanvasLayoutState) => void;
  [key: string]: any;
}

const AbstractShape = ({
  position,
}: {
  position: [number, number, number];
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime / 4);
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime / 2);
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} position={position}>
        <torusKnotGeometry args={[1, 0.3, 128, 16]} />
        <meshStandardMaterial color="white" roughness={0.1} metalness={0.8} />
      </mesh>
    </Float>
  );
};

export const ZahaParametricLayout: React.FC<ZahaParametricLayoutProps> = ({
  sections,
  layout,
  onLayoutUpdate,
  ...wrapperProps
}) => {
  // Refs for physics-based scrolling
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Motion values
  const x = useMotionValue(0);
  // Optional: Add spring physics for extra smoothness if desired, or use raw x for direct control
  const smoothX = useSpring(x, { damping: 50, stiffness: 400 });

  const handleWheel = (e: React.WheelEvent) => {
    // Map vertical scroll (deltaY) to horizontal movement
    // We only care if there is vertical scroll intention
    if (Math.abs(e.deltaY) === 0) return;

    const currentX = x.get();
    // Invert deltaY so scrolling down moves content left (standard horizontal scroll behavior)
    const newX = currentX - e.deltaY;

    if (trackRef.current && containerRef.current) {
      const trackWidth = trackRef.current.scrollWidth;
      const containerWidth = containerRef.current.clientWidth;

      // If content fits, don't scroll
      if (trackWidth <= containerWidth) {
        x.set(0);
        return;
      }

      // Calculate constraints:
      // Max X is 0 (start)
      // Min X is containerWidth - trackWidth (end)
      const minX = containerWidth - trackWidth;
      const maxX = 0;

      // Clamp value
      if (newX > maxX) x.set(maxX);
      else if (newX < minX) x.set(minX);
      else x.set(newX);
    } else {
      x.set(newX);
    }
  };

  const handleAddSection = () => {
    if (!onLayoutUpdate) return;
    const newSection: CanvasSectionState = {
      id: `zaha-section-${Date.now()}`,
      content: { type: "empty" },
      style: { background: "#ffffff20", color: "#ffffff" },
      name: `Section ${sections.length + 1}`,
    };
    onLayoutUpdate({
      ...layout,
      sections: [...layout.sections, newSection],
    });
  };

  return (
    <DynamicLayoutWrapper
      layout={layout}
      onLayoutUpdate={onLayoutUpdate!}
      sections={sections}
      defaultBackgroundColor="#09090b"
      defaultTextColor="#ffffff"
    >
      <div
        className="relative w-full h-full bg-zinc-950 overflow-hidden font-sans select-none"
        ref={containerRef}
        onWheel={handleWheel}
      >
        {/* 1. Background 3D Scene */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
            <Environment preset="city" />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <AbstractShape position={[-4, 2, 0]} />
            <AbstractShape position={[4, -2, -2]} />
            {/* Decorative Flow */}
            <group position={[0, 0, -5]}>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <planeGeometry args={[100, 100, 20, 20]} />
                <meshStandardMaterial color="#222" wireframe />
              </mesh>
            </group>
          </Canvas>
        </div>

        {/* 2. Interactive Sliding Track */}
        <motion.div
          ref={trackRef}
          className="absolute inset-0 z-10 flex items-center p-8 gap-8 cursor-grab active:cursor-grabbing"
          style={{ x: smoothX }}
          drag="x"
          dragConstraints={containerRef}
        >
          {/* Intro Card */}
          <div className="min-w-[400px] flex flex-col justify-center pl-8 select-text">
            <div
              className="text-6xl font-bold text-white mb-4 tracking-tighter"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              <EditableText
                sectionId="intro"
                fieldId="title_line_1"
                defaultValue="FLUID"
                className="block leading-none"
              />
              <EditableText
                sectionId="intro"
                fieldId="title_line_2"
                defaultValue="ARCH"
                className="block leading-none"
              />
            </div>
            <div className="text-zinc-400 max-w-sm">
              <EditableText
                sectionId="intro"
                fieldId="description"
                defaultValue="Parametric design explores the relationship between form and function through complex geometric algorithms."
                multiline
                className="text-lg leading-relaxed"
              />
            </div>
          </div>

          {/* Dynamic Sections */}
          {sections.map((section, index) => (
            <Panel
              key={section.id}
              section={section}
              index={index}
              className={cn(
                "min-w-[60vw] md:min-w-[400px] h-[70vh] relative flex-shrink-0",
                "rounded-2xl overflow-hidden shadow-2xl border border-white/10 backdrop-blur-md",
                "transition-transform hover:scale-[1.02]"
              )}
              style={{
                background:
                  section.style?.background || "rgba(255,255,255,0.05)",
              }}
              wrapperProps={{
                ...wrapperProps,
                onLayoutUpdate,
                layout,
              }}
            />
          ))}

          {/* Add Button */}
          <div className="min-w-[200px] h-[70vh] flex items-center justify-center flex-shrink-0">
            <DynamicAddButton
              onAdd={handleAddSection}
              className="w-full h-full border-white/20 hover:border-white/50 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white"
              style={{ borderColor: "rgba(255,255,255,0.2)" }}
            />
          </div>

          {/* Spacer to ensure right-edge visibility */}
          <div className="min-w-[50px] flex-shrink-0" />
        </motion.div>

        {/* Texture Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] blend-overlay z-20"></div>
      </div>
    </DynamicLayoutWrapper>
  );
};
