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
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[1010] flex items-center justify-center pointer-events-none px-4">
      {/* Island Container */}
      <div className="relative bg-background/95 backdrop-blur-md border border-border rounded-full shadow-lg px-2 py-1 flex items-center gap-1 max-w-[60vw] pointer-events-auto">
        {/* Left Scroll Button */}
        {showLeftScroll && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full flex-shrink-0 hover:bg-muted z-10"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        )}

        {/* Scrollable Tabs Container */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-0 overflow-x-auto overflow-y-hidden scrollbar-hide max-w-[calc(60vw-120px)] scroll-smooth"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
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
                {/* Chrome-style Tab */}
                <div
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "relative flex items-center h-8 min-w-[140px] max-w-[200px] px-3 cursor-pointer group transition-all flex-shrink-0",
                    "bg-background/60 hover:bg-background/80 rounded-full",
                    isActive &&
                      "bg-background border border-primary shadow-sm scale-105",
                    isDragging && "opacity-50",
                    isDraggedOver && "ml-4"
                  )}
                  style={{
                    marginLeft: index === 0 ? "0" : "-12px",
                    zIndex: isActive ? 10 : 1,
                  }}
                  onClick={() => !editingId && onSceneSelect(scene.id)}
                  onDoubleClick={() => handleDoubleClick(scene)}
                >
                  {/* Drag Handle */}
                  <GripVertical
                    className={cn(
                      "w-3 h-3 mr-1 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0",
                      isActive && "opacity-100"
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
                      className="flex-1 bg-transparent border-b border-primary outline-none text-xs min-w-0"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span
                      className={cn(
                        "flex-1 text-xs truncate min-w-0",
                        isActive
                          ? "text-foreground font-medium"
                          : "text-muted-foreground"
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
                        "ml-1 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0",
                        "opacity-0 group-hover:opacity-100 hover:bg-muted transition-all",
                        isActive && "opacity-100"
                      )}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Transition Button Between Tabs with Visual Connector */}
                {transition && index < scenes.length - 1 && (
                  <div
                    className="relative flex items-center justify-center h-8 w-8 -mx-3 z-20 flex-shrink-0"
                    onMouseEnter={() => setHoveredTransitionIndex(index)}
                    onMouseLeave={() => setHoveredTransitionIndex(null)}
                  >
                    {/* Visual Connector Line */}
                    <div 
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ 
                        background: `linear-gradient(90deg, #2596be 0%, #2596be ${transition.type !== 'none' ? '100%' : '0%'})`,
                        height: '2px',
                        opacity: transition.type !== 'none' ? 0.6 : 0.2,
                        transition: 'all 0.3s ease'
                      }}
                    />
                    
                    {/* Transition Type Indicator */}
                    {transition.type !== 'none' && (
                      <div 
                        className="absolute -bottom-2 text-[9px] font-mono text-[#2596be] bg-background/90 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                        style={{ pointerEvents: 'none' }}
                      >
                        {transition.durationMs}ms
                      </div>
                    )}
                    
                    <Button
                      ref={(el) => {
                        if (el && transition) {
                          transitionButtonRefs.current.set(transition.id, el);
                        }
                      }}
                      variant="ghost"
                      size="icon"
                     className={cn(
                        "h-6 w-6 rounded-full transition-all relative",
                        hoveredTransitionIndex === index
                          ? "opacity-100 scale-110 bg-[#2596be]/20 hover:bg-[#2596be]/30"
                          : "opacity-60 hover:opacity-100 hover:bg-[#2596be]/20"
                      )}
                      style={{
                        color: "#2596be",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onTransitionClick(transition);
                      }}
                      title={`Transition: ${transition.type}`}
                    >
                      <TransitionIcon />
                    </Button>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Right Scroll Button */}
        {showRightScroll && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full flex-shrink-0 hover:bg-muted z-10"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}

        {/* Divider */}
        <div className="w-px h-6 bg-border flex-shrink-0 mx-1" />

        {/* Add New Tab Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-muted flex-shrink-0"
          onClick={onSceneAdd}
          title="Add new scene"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
