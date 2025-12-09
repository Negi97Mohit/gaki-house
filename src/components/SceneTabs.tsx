import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  X,
  GripVertical,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Layers,
} from "lucide-react";
import { SceneState, SceneTransition } from "@/types/caption";
import { cn } from "@/lib/utils";

const TransitionIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4.25 3.625h.913c.487 0 .937.258 1.184.677l1.767 3c.253.43.253.965 0 1.396l-1.767 3c-.247.42-.697.677-1.184.677H4.25c-.76 0-1.375-.616-1.375-1.375V5c0-.76.616-1.375 1.375-1.375Z"
      stroke="currentColor"
      strokeWidth="1.25"
    />
    <path
      d="m11.35 3.755 1.861 3.251a2 2 0 0 1 0 1.988l-1.861 3.25"
      stroke="currentColor"
      strokeOpacity=".4"
      strokeWidth="1.25"
      strokeLinecap="round"
    />
    <path
      d="m8.75 3.755 1.861 3.251a2 2 0 0 1 0 1.988l-1.861 3.25"
      stroke="currentColor"
      strokeOpacity=".7"
      strokeWidth="1.25"
      strokeLinecap="round"
    />
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
  isHidden: boolean;
  onHide: () => void;
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
  isHidden,
  onHide,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [hoveredTransitionIndex, setHoveredTransitionIndex] = useState<number | null>(null);
  const [showTopScroll, setShowTopScroll] = useState(false);
  const [showBottomScroll, setShowBottomScroll] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const transitionButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  useEffect(() => {
    const checkScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
        setShowTopScroll(scrollTop > 0);
        setShowBottomScroll(scrollTop < scrollHeight - clientHeight - 1);
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

  const scroll = (direction: "up" | "down") => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        top: direction === "up" ? -100 : 100,
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
        "fixed top-1/2 right-4 -translate-y-1/2",
        "transition-all duration-300 ease-in-out",
        isHidden
          ? "translate-x-full opacity-0 pointer-events-none"
          : "opacity-100"
      )}
      style={{ zIndex: "var(--z-scene-tabs)" }}
    >
      {/* Main Container */}
      <div className="bg-background border border-accent w-48 max-h-[70vh] flex flex-col pointer-events-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-accent">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-accent" />
            <span className="text-xs font-bold text-accent uppercase tracking-wider">
              Scenes
            </span>
          </div>
          <button
            className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-accent transition-colors"
            onClick={onHide}
            title="Hide Scenes"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Scroll Up */}
        {showTopScroll && (
          <button
            className="w-full py-1 flex items-center justify-center text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors border-b border-accent/30"
            onClick={() => scroll("up")}
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        )}

        {/* Scenes List */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto overflow-x-hidden"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {scenes.map((scene, index) => {
            const isActive = scene.id === activeSceneId;
            const isDragging = draggedIndex === index;
            const isDraggedOver = dragOverIndex === index;
            const transition =
              index < scenes.length - 1
                ? transitions.find((t) => t.fromSceneId === scene.id)
                : null;

            return (
              <React.Fragment key={scene.id}>
                {/* Scene Tab */}
                <div
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "group flex items-center h-10 px-3 cursor-pointer transition-all duration-150 border-l-2",
                    isActive
                      ? "bg-accent text-background border-l-accent"
                      : "bg-transparent text-foreground hover:bg-accent/10 border-l-transparent hover:border-l-accent/50",
                    isDragging && "opacity-40",
                    isDraggedOver && "border-t-2 border-t-accent"
                  )}
                  onClick={() => !editingId && onSceneSelect(scene.id)}
                  onDoubleClick={() => handleDoubleClick(scene)}
                >
                  {/* Drag Handle */}
                  <GripVertical
                    className={cn(
                      "w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0",
                      isActive ? "text-background/60" : "text-muted-foreground"
                    )}
                  />

                  {/* Tab Name or Input */}
                  {editingId === scene.id ? (
                    <input
                      ref={inputRef}
                      type="text"
                      value={editingName}
                      onChange={handleNameChange}
                      onBlur={handleNameSubmit}
                      onKeyDown={handleKeyDown}
                      className="flex-1 bg-transparent border-b border-accent outline-none text-xs min-w-0 font-mono"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span
                      className={cn(
                        "flex-1 text-xs font-mono truncate min-w-0 uppercase tracking-wide",
                        isActive ? "font-bold" : "font-normal"
                      )}
                    >
                      {scene.name}
                    </span>
                  )}

                  {/* Close Button */}
                  {scenes.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSceneClose(scene.id);
                      }}
                      className={cn(
                        "ml-1 w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all",
                        isActive
                          ? "text-background/60 hover:text-red-400"
                          : "text-muted-foreground hover:text-red-500"
                      )}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Transition Button */}
                {transition && index < scenes.length - 1 && (
                  <div
                    className="flex items-center justify-center py-1 border-y border-accent/20"
                    onMouseEnter={() => setHoveredTransitionIndex(index)}
                    onMouseLeave={() => setHoveredTransitionIndex(null)}
                  >
                    <Button
                      ref={(el) => {
                        if (el && transition) {
                          transitionButtonRefs.current.set(transition.id, el);
                        }
                      }}
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-accent hover:bg-accent/10 border border-transparent hover:border-accent/30"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTransitionClick(transition);
                      }}
                      title={`Transition: ${transition.type}`}
                    >
                      <TransitionIcon />
                    </Button>

                    {/* Duration Indicator */}
                    {transition.type !== "none" && hoveredTransitionIndex === index && (
                      <div className="absolute right-full mr-2 text-[10px] font-mono text-accent bg-background border border-accent px-2 py-0.5 whitespace-nowrap">
                        {transition.durationMs}ms
                      </div>
                    )}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Scroll Down */}
        {showBottomScroll && (
          <button
            className="w-full py-1 flex items-center justify-center text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors border-t border-accent/30"
            onClick={() => scroll("down")}
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        )}

        {/* Add Button */}
        <button
          className="w-full h-9 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider border-t border-accent bg-transparent text-accent hover:bg-accent hover:text-background transition-colors"
          onClick={onSceneAdd}
          title="Add new scene"
        >
          <Plus className="w-4 h-4" />
          <span>Add Scene</span>
        </button>
      </div>
    </div>
  );
};
