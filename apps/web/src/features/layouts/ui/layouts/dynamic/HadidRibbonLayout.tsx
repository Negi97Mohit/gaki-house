import React, {
  useMemo,
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ScrollControls,
  useScroll,
  Html,
  PerspectiveCamera,
  Line,
  useCursor,
} from "@react-three/drei";
import * as THREE from "three";
import { CanvasLayoutState, CanvasSectionState } from "@gaki/core/types/caption";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { Plus, Trash2, LayoutTemplate, Type } from "lucide-react";
import { cn } from "@gaki/core/lib/utils";
import { Panel } from "./core/Panel";

// --- 1. Linear Path ---
const createLinearCurve = (length: number) => {
  const points = [];
  // Ensure we have at least a minimal path to avoid errors
  const safeLength = Math.max(length, 1);
  for (let i = 0; i <= 20; i++) {
    points.push(new THREE.Vector3((i * safeLength) / 20, 0, 0));
  }
  return new THREE.CatmullRomCurve3(points, false, "catmullrom", 0);
};

// --- 2. Floor Rail ---
const GuideRail = ({ curve }: { curve: THREE.CatmullRomCurve3 }) => {
  const points = useMemo(() => curve.getPoints(100), [curve]);

  return (
    <group position={[0, -3.2, 0]}>
      {/* Thick Black Line */}
      <Line
        points={points}
        color="#000000"
        lineWidth={6}
        transparent={false}
        opacity={1}
      />
      {/* Decorative Ticks */}
      {points
        .filter((_, i) => i % 10 === 0)
        .map((p, i) => (
          <mesh
            key={i}
            position={[p.x, 0, p.z]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[0.1, 0.5]} />
            <meshBasicMaterial color="black" />
          </mesh>
        ))}
    </group>
  );
};

// --- 3. Panel Component ---
const RibbonItem = React.memo(
  ({ section, index, onRemove, onRename, editor, ...props }: any) => {
    const [hovered, setHover] = useState(false);
    useCursor(hovered);

    return (
      <div
        className="w-[50vw] max-w-[420px] aspect-[16/9] relative flex flex-col select-none will-change-transform"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          backfaceVisibility: "hidden",
          transformStyle: "preserve-3d",
        }}
      >
        <div
          className={cn(
            "relative flex-1 rounded-lg overflow-hidden transition-all duration-300",
            "bg-white border border-gray-200 shadow-xl",
            hovered ? "shadow-2xl border-black/40 scale-[1.02]" : ""
          )}
          style={{
            backfaceVisibility: "hidden",
            WebkitFontSmoothing: "antialiased",
            contain: "layout style paint",
          }}
        >
          {/* Header */}
          <div className="h-9 bg-gray-50 border-b border-gray-200 flex items-center justify-between px-3 relative z-50">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-1.5 h-1.5 rounded-full bg-black" />
              {/* Editable Title */}
              <div className="flex-1 group/edit">
                <input
                  type="text"
                  defaultValue={
                    section.name ||
                    `PANEL ${String(index + 1).padStart(2, "0")}`
                  }
                  className="bg-transparent border-none outline-none text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest w-full hover:text-black focus:text-black focus:bg-white rounded px-1 transition-colors"
                  placeholder="NAME..."
                  onBlur={(e) =>
                    onRename && onRename(section.id, e.target.value)
                  }
                  onKeyDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
            {/* Delete button removed - handled by Panel */}
          </div>

          {/* Content Area using Panel */}
          <div className="relative flex-1 w-full h-full bg-white transform-gpu">
            <Panel
              section={section}
              index={index}
              className="w-full h-full"
              wrapperProps={props}
            />
          </div>
        </div>

        {/* Anchor Dot */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="w-[1px] h-8 bg-black/20" />
          <div className="w-1.5 h-1.5 rounded-full bg-black" />
        </div>
      </div>
    );
  }
);

// --- 4. Scene ---
const RibbonScene = ({
  sections,
  wrapperProps,
  onRemove,
  onUpdate,
  onAdd,
  progressBarRef,
}: any) => {
  const scroll = useScroll();
  const { viewport } = useThree();

  // Spacing logic
  const itemSpacing = Math.max(16, viewport.width * 0.8);

  // FIX: Total width should exactly encompass the items + the add button.
  // Previous logic `(sections.length + 1) * itemSpacing` was causing the camera
  // to scroll PAST the add button, pushing it off-screen.
  const totalWidth = sections.length * itemSpacing;

  const curve = useMemo(() => createLinearCurve(totalWidth), [totalWidth]);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  const camZ = 12;

  useFrame(() => {
    // scroll.offset is 0..1
    const currentX = scroll.offset * totalWidth;

    // Imperative Progress Update (No Re-renders)
    if (progressBarRef.current) {
      // Index runs from 0 to sections.length (inclusive of Add button)
      const currentIndex = Math.round(scroll.offset * sections.length);
      const progressPercentage = Math.min(
        100,
        (currentIndex / sections.length) * 100
      );
      progressBarRef.current.style.width = `${progressPercentage}%`;
    }

    if (cameraRef.current) {
      const targetPos = new THREE.Vector3(currentX, 0, camZ);
      cameraRef.current.position.lerp(targetPos, 0.15);
      cameraRef.current.lookAt(currentX, 0, 0);
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
      <GuideRail curve={curve} />

      {sections.map((section: any, i: number) => {
        const xPos = i * itemSpacing;
        return (
          <group key={section.id} position={[xPos, 0, 0]}>
            <Html
              transform
              zIndexRange={[100, 0]}
              as="div"
              center
              occlude={false}
              style={{
                pointerEvents: "none",
                willChange: "transform",
                WebkitFontSmoothing: "antialiased",
                textRendering: "geometricPrecision",
              }}
            >
              <div
                className="pointer-events-auto"
                style={{ backfaceVisibility: "hidden" }}
              >
                <RibbonItem
                  section={section}
                  index={i}
                  onRemove={() => onRemove(section.id)}
                  onRename={(id: string, name: string) => {
                    const updated = sections.map((s: any) =>
                      s.id === id ? { ...s, name } : s
                    );
                    onUpdate({ ...wrapperProps.layout, sections: updated });
                  }}
                  {...wrapperProps}
                />
              </div>
            </Html>
          </group>
        );
      })}

      {/* Add Button - Positioned exactly at the end of the line */}
      <group position={[sections.length * itemSpacing, 0, 0]}>
        <Html transform zIndexRange={[100, 0]} center>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdd();
            }}
            className="flex flex-col items-center justify-center gap-3 group cursor-pointer pointer-events-auto transition-transform hover:scale-105 z-50"
          >
            <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 bg-white/80 flex items-center justify-center text-gray-400 group-hover:border-black group-hover:text-black transition-colors">
              <Plus className="w-8 h-8" />
            </div>
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest bg-white px-2 py-1 rounded border border-gray-100 shadow-sm group-hover:text-black">
              Add Section
            </span>
          </button>
        </Html>
      </group>
    </group>
  );
};

// --- Wheel Handler ---
const WheelHandler = ({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLDivElement>;
}) => {
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const scrollContainer = containerRef.current?.querySelector(
        'div[style*="overflow"]'
      ) as HTMLElement;

      // ... existing code ...
      if (scrollContainer) {
        if (e.deltaY !== 0) {
          scrollContainer.scrollLeft += e.deltaY;
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel);
      }
    };
  }, [containerRef]);

  return null;
};

// --- Main Component ---
interface HadidRibbonProps {
  sections: CanvasSectionState[];
  layout: CanvasLayoutState;
  onLayoutUpdate?: (layout: CanvasLayoutState) => void;
  [key: string]: any;
}

export const HadidRibbonLayout: React.FC<HadidRibbonProps> = ({
  sections,
  layout,
  onLayoutUpdate,
  ...wrapperProps
}) => {
  const progressBarRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState("Gallery View");

  const handleAddSection = useCallback(() => {
    if (!layout || !onLayoutUpdate) return;
    const newSection: CanvasSectionState = {
      id: `node-${Date.now()}`,
      content: { type: "empty" },
      style: { background: "#f1f5f9" },
      name: `SECTION ${String(sections.length + 1).padStart(2, "0")}`,
    };
    onLayoutUpdate({ ...layout, sections: [...layout.sections, newSection] });
  }, [layout, onLayoutUpdate, sections.length]);

  const handleRemoveSection = useCallback(
    (sectionId: string) => {
      if (!layout || !onLayoutUpdate) return;
      if (layout.sections.length <= 1) return;
      onLayoutUpdate({
        ...layout,
        sections: layout.sections.filter((s) => s.id !== sectionId),
      });
    },
    [layout, onLayoutUpdate]
  );

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-[#f8fafc] relative overflow-hidden font-sans group/container"
    >
      {/* 1. HUD */}
      <div className="absolute top-6 left-6 z-20 pointer-events-auto select-none group/title">
        <div className="flex items-center gap-2 mb-1 text-black/30">
          <LayoutTemplate className="w-4 h-4" />
          <span className="text-[10px] font-mono tracking-widest uppercase">
            Linear Gallery
          </span>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-3xl font-bold tracking-tight text-slate-800 bg-transparent border-none outline-none hover:bg-black/5 rounded px-1 -ml-1 transition-colors min-w-[200px]"
          />
          <Type className="w-4 h-4 text-black/20 opacity-0 group-hover/title:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* 3. Progress (Imperative) */}
      <div className="absolute bottom-0 left-0 h-1.5 bg-gray-100 w-full z-20">
        <div
          ref={progressBarRef}
          className="h-full bg-black transition-all duration-200 ease-out"
          style={{ width: "0%" }}
        />
      </div>

      {/* 4. Canvas */}
      <div className="absolute inset-0 z-10">
        <WheelHandler containerRef={containerRef} />

        <Canvas
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: "high-performance",
          }}
          shadows
          dpr={[1, 2]}
          style={{ WebkitFontSmoothing: "antialiased" }}
        >
          <color attach="background" args={["#f8fafc"]} />
          <fog attach="fog" args={["#f8fafc", 10, 50]} />

          <ambientLight intensity={0.9} />
          <directionalLight position={[5, 10, 5]} intensity={0.6} castShadow />

          <ScrollControls
            // Pages should be sufficient to reach N + 1 items (panels + add button)
            pages={Math.max(1.5, sections.length * 0.8 + 1)}
            damping={0.3}
            horizontal={true}
          >
            <RibbonScene
              sections={sections}
              wrapperProps={{ ...wrapperProps, layout }}
              onRemove={handleRemoveSection}
              onUpdate={onLayoutUpdate}
              onAdd={handleAddSection}
              progressBarRef={progressBarRef}
            />
          </ScrollControls>
        </Canvas>
      </div>
    </div>
  );
};
