import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Sphere, MeshDistortMaterial, Html, OrbitControls } from "@react-three/drei";
import { CanvasLayoutTemplate } from "@/types/layout";
import { CanvasLayoutState, CanvasSectionState } from "@/types/caption";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { Plus } from "lucide-react";
import { Panel } from "./core/Panel";

interface LiquidChromeLayoutProps {
    sections: CanvasSectionState[];
    layout: CanvasLayoutState;
    template: CanvasLayoutTemplate;
    containerRef: React.RefObject<HTMLDivElement>;
    onLayoutUpdate?: (layout: CanvasLayoutState) => void;
    [key: string]: any;
}

const FloatingPanel = ({
    position,
    rotation,
    section,
    wrapperProps,
    onRemove
}: {
    position: [number, number, number];
    rotation: [number, number, number];
    section: CanvasSectionState;
    wrapperProps: any;
    onRemove: () => void;
}) => {
    return (
        <group position={position} rotation={rotation}>
            <Html transform position={[0, 0, 0]} style={{ width: "320px", height: "400px" }}>
                <Panel
                    section={section}
                    index={0} // Index not strictly needed here but required by prop
                    className="w-full h-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-2xl transition-all hover:bg-white/20 hover:scale-[1.02]"
                    wrapperProps={{
                        ...wrapperProps,
                        className: "bg-transparent"
                    }}
                >
                    {/* Reflection/Distortion Effect Indicator */}
                    <div className="absolute inset-0 border-2 border-white/10 rounded-2xl pointer-events-none" />
                </Panel>
            </Html>
        </group>
    )
}

const Blob = () => {
    const matRef = useRef<any>(null);
    return (
        <Sphere args={[1, 128, 128]} scale={3}>
            <MeshDistortMaterial
                ref={matRef}
                color="#e0e0e0"
                envMapIntensity={1}
                clearcoat={1}
                clearcoatRoughness={0}
                metalness={1}
                roughness={0}
                distort={0.4}
                speed={2}
            />
        </Sphere>
    )
}

export const LiquidChromeLayout: React.FC<LiquidChromeLayoutProps> = ({
    sections,
    layout,
    onLayoutUpdate,
    ...wrapperProps
}) => {
    const handleAddSection = () => {
        if (!onLayoutUpdate) return;
        const newSection: CanvasSectionState = {
            id: `liquid-section-${Date.now()}`,
            content: { type: "empty" },
            style: { background: "rgba(255,255,255,0.1)", color: "#ffffff" },
            name: `Reflection ${sections.length + 1}`,
        };
        onLayoutUpdate({
            ...layout,
            sections: [...layout.sections, newSection],
        });
    };

    const handleRemoveSection = (id: string) => {
        if (!onLayoutUpdate) return;
        onLayoutUpdate({
            ...layout,
            sections: sections.filter(s => s.id !== id)
        });
    }

    // Calculate layout in a circle around the blob
    const radius = 7;
    // If we have many sections, spiral them
    const getPos = (i: number): [number, number, number] => {
        const angle = (i / Math.max(sections.length, 1)) * Math.PI * 2;
        return [
            Math.cos(angle) * radius,
            Math.sin(angle) * 2,
            Math.sin(angle) * radius
        ];
    }

    const getRot = (i: number): [number, number, number] => {
        const angle = (i / Math.max(sections.length, 1)) * Math.PI * 2;
        return [0, -angle + Math.PI / 2, 0];
    }

    return (
        <div className="relative w-full h-full bg-[#111] overflow-hidden">
            <Canvas camera={{ position: [0, 0, 14], fov: 45 }}>
                <color attach="background" args={["#111"]} />
                <Environment preset="studio" />

                {/* Central Distorted Sphere */}
                <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                    <Blob />
                </Float>

                {/* Orbiting Panels */}
                <group>
                    {sections.map((section, i) => (
                        <FloatingPanel
                            key={section.id}
                            position={getPos(i)}
                            rotation={getRot(i)}
                            section={section}
                            wrapperProps={{ ...wrapperProps, layout, onLayoutUpdate }}
                            onRemove={() => handleRemoveSection(section.id)}
                        />
                    ))}
                </group>

                {/* Add Button (Floating at bottom center) */}
                <Html position={[0, -5, 4]} center>
                    <button
                        onClick={handleAddSection}
                        className="flex flex-col items-center justify-center gap-2 group transition-transform hover:scale-105"
                    >
                        <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/50 group-hover:text-white group-hover:bg-white/20 group-hover:border-white shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                            <Plus className="w-6 h-6" />
                        </div>
                        <span className="text-white/50 font-bold uppercase tracking-widest text-xs group-hover:text-white">Add Reflection</span>
                    </button>
                </Html>

                <OrbitControls enableZoom={true} enablePan={false} maxPolarAngle={Math.PI / 1.5} minPolarAngle={Math.PI / 3} autoRotate autoRotateSpeed={0.5} />
            </Canvas>

            <div className="absolute inset-x-0 bottom-12 text-center pointer-events-none z-10">
                <h1 className="text-[10vw] font-black text-white/10 uppercase tracking-tighter mix-blend-overlay leading-none select-none">
                    LIQUID<br />CHROME
                </h1>
            </div>
        </div>
    );
};
