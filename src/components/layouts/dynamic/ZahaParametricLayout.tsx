import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment } from "@react-three/drei";
import * as THREE from "three";
import { CanvasLayoutTemplate } from "@/types/layout";
import { CanvasLayoutState, CanvasSectionState } from "@/types/caption";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ZahaParametricLayoutProps {
    sections: CanvasSectionState[];
    layout: CanvasLayoutState;
    template: CanvasLayoutTemplate;
    containerRef: React.RefObject<HTMLDivElement>;
    onLayoutUpdate?: (layout: CanvasLayoutState) => void;
    [key: string]: any;
}

const AbstractShape = ({ position }: { position: [number, number, number] }) => {
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
        <div className="relative w-full h-full bg-zinc-950 overflow-hidden font-sans">
            {/* 1. Background 3D Scene */}
            <div className="absolute inset-0 z-0 select-none pointer-events-none">
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

            {/* 2. Interactive Scrolling Container */}
            <div className="absolute inset-0 z-10 overflow-x-auto overflow-y-hidden flex items-center p-8 gap-8 snap-x snap-mandatory">
                {/* Intro Card */}
                <div className="min-w-[400px] flex flex-col justify-center snap-center">
                    <h1
                        className="text-6xl font-bold text-white mb-4 tracking-tighter"
                        style={{ fontFamily: "Inter, sans-serif" }}
                    >
                        FLUID
                        <br />
                        ARCH
                    </h1>
                    <p className="text-zinc-400 max-w-sm">
                        Parametric design explores the relationship between form and
                        function through complex geometric algorithms.
                    </p>
                </div>

                {/* Dynamic Sections */}
                {sections.map((section, index) => (
                    <div
                        key={section.id}
                        className="min-w-[60vw] md:min-w-[400px] h-[70vh] relative snap-center group transition-transform hover:scale-[1.02]"
                    >
                        <div
                            className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl border border-white/10 backdrop-blur-md"
                            style={{
                                background: section.style?.background || "rgba(255,255,255,0.05)",
                            }}
                        >
                            <GridSectionWrapper
                                section={section}
                                templateSection={{ id: section.id, name: section.name || `Section ${index + 1}` }}
                                {...wrapperProps}
                                onLayoutUpdate={onLayoutUpdate}
                                layout={layout}
                            />
                        </div>
                    </div>
                ))}

                {/* Add Button */}
                <button
                    onClick={handleAddSection}
                    className="min-w-[100px] h-[100px] rounded-full border border-dashed border-white/20 flex items-center justify-center text-white/50 hover:text-white hover:border-white hover:bg-white/10 transition-all snap-center flex-shrink-0"
                >
                    <Plus className="w-8 h-8" />
                </button>

                {/* Spacer */}
                <div className="min-w-[50px] flex-shrink-0" />
            </div>

            {/* Texture Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] blend-overlay z-20"></div>
        </div>
    );
};
