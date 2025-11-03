// src/components/SceneTabs.tsx
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, X, GripVertical, ChevronLeft, ChevronRight } from "lucide-react";
import { SceneState, SceneTransition } from "@/types/caption";
import { cn } from "@/lib/utils";

// SVG icon for the transition button
const TransitionIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4.25 3.625h.913c.487 0 .937.258 1.184.677l1.767 3c.253.43.253.965 0 1.396l-1.767 3c-.247.42-.697.677-1.184.677H4.25c-.76 0-1.375-.616-1.375-1.375V5c0-.76.616-1.375 1.375-1.375Z"
      stroke="currentColor"
      strokeWidth="1.25"
    ></path>
    <path
      d="m11.35 3.755 1.861 3.251a2 2 0 0 1 0 1.988l-1.861 3.25"
      stroke="currentColor"
      strokeOpacity=".3"
      strokeWidth="1.25"
      strokeLinecap="round"
    ></path>
    <path
      d="m8.75 3.755 1.861 3.251a2 2 0 0 1 0 1.988l-1.861 3.25"
      stroke="currentColor"
      strokeOpacity=".6"
      strokeWidth="1.25"
      strokeLinecap="round"
    ></path>
  </svg>
);

interface SceneTabsProps {
  scenes: SceneState[];
  activeSceneId: string;
  transitions: SceneTransition[];
  onSceneSelect: (id: string) => void;
  onSceneAdd: () => void;
  onTransitionClick: (transition: SceneTransition) => void;
  onSceneClose: (id: string) => void;
  onSceneReorder: (fromIndex: number, toIndex: number) => void;
  onSceneRename: (id: string, newName: string) => void;
}

export const SceneTabs: React.FC<SceneTabsProps> = ({
  scenes,
  activeSceneId,
  transitions,
  onSceneSelect,
  onSceneAdd,
  onTransitionClick,
  onSceneClose,
  onSceneReorder,
  onSceneRename,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [hoveredTransitionIndex, setHoveredTransitionIndex] = useState<
    number | null
  >(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const transitionButtonRefs = useRef<Map<string, HTMLButtonElement>>(
    new Map()
  );

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  // Check scroll position
  useEffect(() => {
    const checkScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } =
          scrollContainerRef.current;
        setShowLeftScroll(scrollLeft > 0);
        setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 1);
      }
    };

    checkScroll();
    const container = scrollContainerRef.current;
    container?.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);

    return () => {
      container?.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [scenes]);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    onSceneReorder(draggedIndex, index);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDoubleClick = (scene: SceneState) => {
    setEditingId(scene.id);
    setEditingName(scene.name);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingName(e.target.value);
  };

  const handleNameSubmit = () => {
    if (editingId && editingName.trim()) {
      onSceneRename(editingId, editingName.trim());
    }
    setEditingId(null);
    setEditingName("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNameSubmit();
    } else if (e.key === "Escape") {
      setEditingId(null);
      setEditingName("");
    }
  };

  return (
    <div
      className={cn(
        "fixed right-6 top-1/2 -translate-y-1/2 z-[2020]",
        "transition-all duration-200"
      )}
    >
      <div className="flex flex-col gap-3">
        {scenes.map((scene, index) => {
          const isActive = scene.id === activeSceneId;
          const transition = transitions.find((t) => t.fromSceneId === scene.id);

          return (
            <div key={scene.id} className="relative">
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={cn(
                  "group relative flex items-center gap-2 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 min-w-[180px]",
                  isActive
                    ? "bg-yellow-500/90 text-black font-semibold shadow-lg scale-105 border-2 border-yellow-400"
                    : "bg-background/95 backdrop-blur-md border-2 border-yellow-500/30 hover:border-yellow-500 hover:bg-yellow-500/10"
                )}
                onClick={() => !editingId && onSceneSelect(scene.id)}
                onDoubleClick={() => handleDoubleClick(scene)}
              >
                {/* Drag Handle */}
                <GripVertical
                  className={cn(
                    "w-4 h-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity",
                    isActive ? "text-black/50" : "text-muted-foreground/50"
                  )}
                />

                {editingId === scene.id ? (
                  <input
                    ref={inputRef}
                    type="text"
                    value={editingName}
                    onChange={handleNameChange}
                    onBlur={handleNameSubmit}
                    onKeyDown={handleKeyDown}
                    className="bg-background border border-border rounded px-2 py-1 text-sm w-full focus:outline-none focus:ring-2 focus:ring-yellow-500 text-foreground"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="text-sm select-none flex-1">{scene.name}</span>
                )}

                {scenes.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSceneClose(scene.id);
                    }}
                    className={cn(
                      "opacity-0 group-hover:opacity-100 h-5 w-5 rounded-sm flex items-center justify-center transition-opacity",
                      isActive ? "hover:bg-black/20" : "hover:bg-destructive/20"
                    )}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* Transition button - positioned to the right */}
              {index < scenes.length - 1 && (
                <button
                  ref={(el) => {
                    if (el && transition) {
                      transitionButtonRefs.current.set(transition.id, el);
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (transition) onTransitionClick(transition);
                  }}
                  onMouseEnter={() => setHoveredTransitionIndex(index)}
                  onMouseLeave={() => setHoveredTransitionIndex(null)}
                  className={cn(
                    "absolute -right-9 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full border-2 bg-background flex items-center justify-center transition-all duration-200 z-10",
                    transition
                      ? "border-yellow-500 text-yellow-500 hover:scale-110 hover:bg-yellow-500/10"
                      : "border-border hover:bg-muted hover:scale-110",
                    hoveredTransitionIndex === index && "scale-110"
                  )}
                  title={transition ? `Edit transition: ${transition.type}` : "Add transition"}
                >
                  <TransitionIcon />
                </button>
              )}
            </div>
          );
        })}

        {/* Add Scene button */}
        <button
          onClick={onSceneAdd}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-yellow-500/30 hover:border-yellow-500 hover:bg-yellow-500/10 transition-all duration-200 min-w-[180px]"
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm">Add Scene</span>
        </button>
      </div>
    </div>
  );
};
